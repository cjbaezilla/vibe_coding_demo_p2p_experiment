/**
 * Custom hook to handle real-time subscriptions for chat functionality
 * Subscribes to messages, room updates, and presence changes
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../supabaseClient';
import { useSupabaseUserContext } from '../../auth/contexts/SupabaseUserProvider';
import { updateUserPresence } from '../services/chatService';

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
    setMessages((prevMessages) => {
      // Check if this exact message already exists
      if (prevMessages.some((msg) => msg.id === newMessage.id)) {
        return prevMessages;
      }

      // Find a temporary message to replace
      const tempMessageIndex = prevMessages.findIndex((msg) =>
        msg.id.toString().startsWith(tempIdPrefix) && isSameMessageContent(msg, newMessage)
      );

      // If there's a temp message to replace
      if (tempMessageIndex !== -1) {
        const updatedMessages = [...prevMessages];
        updatedMessages[tempMessageIndex] = newMessage;
        return updatedMessages;
      }

      // Otherwise, add as a new message
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

  // Setup subscriptions when component mounts or roomId changes
  useEffect(() => {
    // Only proceed if we have a valid user
    if (!supabaseUser) {
      return;
    }

    // Clean up any existing subscriptions
    cleanupSubscriptions();

    try {
      // 1. Subscribe to new messages
      subscriptions.current.messages = supabase
        .channel('public:chat_messages')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chat_messages' },
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
      if (roomId) {
        // Dynamic import to avoid circular dependencies
        import('../services/chatService')
          .then((module) => {
            const fetchChatMessages = module.fetchChatMessages;

            // Load existing messages
            return fetchChatMessages(roomId);
          })
          .then((initialMessages) => {
            // Only set messages if we have data and we're still subscribed to the same room
            if (initialMessages && initialMessages.length > 0 && roomId) {
              // Set all messages at once to avoid multiple renders
              setMessages(initialMessages);
            }
          })
          .catch((err) => {
            console.error('Error loading initial messages:', err);
            setError(err.message);
          });
      }

      setIsSubscribed(true);
      setError(null);
    } catch (err) {
      console.error('Error setting up real-time subscriptions:', err);
      setError(err.message);
      cleanupSubscriptions();
    }

    // Cleanup on unmount or when roomId changes
    return cleanupSubscriptions;
  }, [
    supabaseUser,
    roomId,
    handleNewMessage,
    handlePresenceChange,
    handleMembershipChange,
    cleanupSubscriptions,
    updatePresence
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