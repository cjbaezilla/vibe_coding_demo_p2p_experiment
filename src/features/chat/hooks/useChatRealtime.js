/**
 * Custom hook to handle real-time subscriptions for chat functionality
 * Subscribes to messages, room updates, and presence changes
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../supabaseClient';
import { useSupabaseUserContext } from '../../auth/contexts/SupabaseUserProvider';
import { updateUserPresence, fetchChatMessages } from '../services/chatService';

/**
 * Helper function to check if two messages have the same content
 * @param {object} msg1 - First message to compare
 * @param {object} msg2 - Second message to compare
 * @returns {boolean} True if the messages have the same content
 */
const isSameMessageContent = (msg1, msg2) =>
  msg1.user_id === msg2.user_id && msg1.message === msg2.message;

/**
 * Hook for managing real-time chat subscriptions
 * @param {string} roomId - Current room ID to subscribe to (optional)
 * @param {Function} onOnlineUsersChange - Callback when online users change
 * @param {Function} onMembershipChange - Callback when room membership changes
 * @returns {object} Real-time state and handlers
 */
export const useChatRealtime = (
  roomId = null,
  onOnlineUsersChange = null,
  onMembershipChange = null
) => {
  const { supabaseUser } = useSupabaseUserContext();
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState(null);

  // Store subscriptions to clean up
  const subscriptions = useRef({
    messages: null,
    members: null,
    presence: null,
    presenceInterval: null
  });

  // Cleanup function for all subscriptions
  const cleanupSubscriptions = useCallback(() => {
    // Clear all active subscriptions
    Object.values(subscriptions.current).forEach((subscription) => {
      if (subscription) {
        if (typeof subscription === 'function') {
          clearInterval(subscription);
        } else if (typeof subscription.unsubscribe === 'function') {
          subscription.unsubscribe();
        }
      }
    });

    // Reset subscription states
    subscriptions.current = {
      messages: null,
      members: null,
      presence: null,
      presenceInterval: null
    };

    setIsSubscribed(false);
  }, []);

  // Replace a temporary message with a real one or add a new message
  const updateMessageList = useCallback((newMessage, tempIdPrefix = 'temp-') => {
    if (!newMessage || !newMessage.id) {
      return; // Skip invalid messages
    }

    setMessages((prevMessages) => {
      // 1. Check if this exact message ID already exists
      if (prevMessages.some((msg) => msg.id === newMessage.id)) {
        return prevMessages; // Message with this ID already exists
      }

      // 2. Check for duplicate by content with strict criteria
      const isDuplicate = prevMessages.some((msg) =>
        // Different ID but same essential content
        msg.id !== newMessage.id &&
        // Same user
        msg.user_id === newMessage.user_id &&
        // Same message content
        msg.message === newMessage.message &&
        // Same room
        msg.room_id === newMessage.room_id &&
        // If both have created_at timestamps, check if they're close in time (within 5 seconds)
        (msg.created_at && newMessage.created_at &&
          Math.abs(new Date(msg.created_at) - new Date(newMessage.created_at)) < 5000)
      );

      if (isDuplicate) {
        return prevMessages; // Skip adding duplicate messages
      }

      // 3. Look for a temporary message to replace (from optimistic updates)
      const tempMessageIndex = prevMessages.findIndex((msg) =>
        msg.id.toString().startsWith(tempIdPrefix) && isSameMessageContent(msg, newMessage)
      );

      // If there's a temp message to replace
      if (tempMessageIndex !== -1) {
        const updatedMessages = [...prevMessages];
        updatedMessages[tempMessageIndex] = newMessage;
        return updatedMessages;
      }

      // 4. Otherwise, add as a new message
      return [newMessage, ...prevMessages];
    });
  }, []);

  // Handle new message received from subscription
  const handleNewMessage = useCallback((payload) => {
    const newMessage = payload.new;

    // Only process messages for the current room
    if (roomId && newMessage.room_id === roomId) {
      updateMessageList(newMessage);
    }
  }, [roomId, updateMessageList]);

  // Fetch online users from the database
  const fetchOnlineUsers = useCallback(async () => {
    try {
      // Query users who have been seen recently - use a 10 minute window
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('id, full_name, image_url, last_seen_at')
        .gte('last_seen_at', tenMinutesAgo);

      if (fetchError) {
        console.error('Error fetching online users:', fetchError);
        return;
      }

      // Ensure we have a valid array
      const onlineUsersList = Array.isArray(data) ? data : [];

      // Always include the current user as online if they're authenticated
      if (supabaseUser && !onlineUsersList.some((user) => user.id === supabaseUser.id)) {
        onlineUsersList.push({
          ...supabaseUser,
          last_seen_at: new Date().toISOString()
        });
      }

      setOnlineUsers(onlineUsersList);

      // Call the callback if provided
      if (onOnlineUsersChange) {
        onOnlineUsersChange(onlineUsersList);
      }
    } catch (err) {
      console.error('Failed to fetch online users:', err);
    }
  }, [onOnlineUsersChange, supabaseUser]);

  // Update user's presence in the database and local state
  const updatePresence = useCallback(async () => {
    if (!supabaseUser) {
      return;
    }

    try {
      // Update presence in the database
      await updateUserPresence(supabaseUser.id);

      // Update online users list
      await fetchOnlineUsers();
    } catch (err) {
      console.error('Error updating presence:', err);
    }
  }, [supabaseUser, fetchOnlineUsers]);

  // Handle presence changes
  const handlePresenceChange = useCallback(() => {
    fetchOnlineUsers();
  }, [fetchOnlineUsers]);

  // Handle room membership changes
  const handleMembershipChange = useCallback((payload) => {
    // If a callback was provided, call it with the payload
    if (onMembershipChange) {
      onMembershipChange(payload);
    }
  }, [onMembershipChange]);

  // Set up subscriptions when component mounts or roomId changes
  useEffect(() => {
    // Only proceed if we have a valid user
    if (!supabaseUser) {
      return;
    }

    // Get current message count for use in effect
    const hasExistingMessages = messages.length > 0;

    // Clear messages when roomId changes - but only once
    if (hasExistingMessages) {
      setMessages([]);
    }

    // Clean up any existing subscriptions
    cleanupSubscriptions();

    try {
      // 1. Subscribe to new messages with specific room filter if we have a roomId
      // This ensures we only get events for this specific room
      subscriptions.current.messages = supabase
        .channel('public:chat_messages')
        .on('postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            ...(roomId ? { filter: `room_id=eq.${roomId}` } : {})
          },
          handleNewMessage
        )
        .subscribe();

      // 2. Subscribe to presence changes
      subscriptions.current.presence = supabase
        .channel('public:users')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'users', column: 'last_seen_at' },
          handlePresenceChange
        )
        .subscribe();

      // 3. Subscribe to room membership changes
      subscriptions.current.members = supabase
        .channel('public:chat_room_members')
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chat_room_members',
            ...(roomId ? { filter: `room_id=eq.${roomId}` } : {})
          },
          handleMembershipChange
        )
        .subscribe();

      // 4. Set up interval to update user's own presence
      subscriptions.current.presenceInterval = setInterval(updatePresence, 30000);

      // Immediately update presence on subscription start
      updatePresence();

      // 5. If we have a roomId, load existing messages from the database
      let isMounted = true;
      if (roomId) {
        // Load existing messages but with a guard for component unmounting
        fetchChatMessages(roomId)
          .then((initialMessages) => {
            // Only update if component is still mounted and we have the same roomId
            if (isMounted && initialMessages && initialMessages.length > 0) {
              // Set all messages at once to avoid multiple renders
              setMessages(initialMessages);
            }
          })
          .catch((err) => {
            if (isMounted) {
              console.error('Error loading initial messages:', err);
              setError(err.message);
            }
          });
      }

      setIsSubscribed(true);
      setError(null);

      // Cleanup on unmount or when roomId changes
      return () => {
        isMounted = false;
        cleanupSubscriptions();
      };
    } catch (err) {
      console.error('Error setting up real-time subscriptions:', err);
      setError(err.message);
      cleanupSubscriptions();
      return cleanupSubscriptions;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    supabaseUser,
    roomId,
    handleNewMessage,
    handlePresenceChange,
    handleMembershipChange,
    cleanupSubscriptions,
    updatePresence
    // We intentionally exclude messages to prevent infinite loops
  ]);

  // Add message to local state optimistically (before server confirms)
  const addLocalMessage = useCallback((message) => {
    updateMessageList(message);
  }, [updateMessageList]);

  return {
    messages,
    onlineUsers,
    isSubscribed,
    error,
    addLocalMessage
  };
};