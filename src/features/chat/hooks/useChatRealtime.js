/**
 * Custom hook to handle real-time subscriptions for chat functionality
 * Subscribes to messages, room updates, and presence changes
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../supabaseClient';
import { useSupabaseUserContext } from '../../auth/contexts/SupabaseUserProvider';
import { updateUserPresence } from '../services/chatService';

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
    rooms: null,
    members: null,
    presence: null,
    presenceInterval: null
  });

  // Cleanup function for all subscriptions
  const cleanupSubscriptions = useCallback(() => {
    // Clear all active subscriptions
    if (subscriptions.current.messages) {
      subscriptions.current.messages.unsubscribe();
    }
    if (subscriptions.current.rooms) {
      subscriptions.current.rooms.unsubscribe();
    }
    if (subscriptions.current.members) {
      subscriptions.current.members.unsubscribe();
    }
    if (subscriptions.current.presence) {
      subscriptions.current.presence.unsubscribe();
    }
    if (subscriptions.current.presenceInterval) {
      clearInterval(subscriptions.current.presenceInterval);
    }

    // Reset subscription states
    subscriptions.current = {
      messages: null,
      rooms: null,
      members: null,
      presence: null,
      presenceInterval: null
    };

    setIsSubscribed(false);
  }, []);

  // Handle new message received from subscription
  const handleNewMessage = useCallback((payload) => {
    const newMessage = payload.new;

    // Only add message if it's for the current room
    if (roomId && newMessage.room_id === roomId) {
      setMessages((prevMessages) => {
        // Check if message already exists to prevent duplicates
        const exists = prevMessages.some((msg) => msg.id === newMessage.id);
        if (exists) {
          return prevMessages;
        }
        return [newMessage, ...prevMessages];
      });
    }
  }, [roomId]);

  // Handle user presence changes
  const handlePresenceChange = useCallback(() => {
    const fetchOnlineUsers = async () => {
      try {
        // Query users who have been seen recently - use a longer time window for safety
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
        console.log(`Fetching online users since: ${tenMinutesAgo}`);

        const { data, error: fetchError } = await supabase
          .from('users')
          .select('id, full_name, image_url, last_seen_at')
          .gte('last_seen_at', tenMinutesAgo);

        if (fetchError) {
          console.error('Error fetching online users:', fetchError);
          return;
        }

        // Log online user detection
        if (Array.isArray(data)) {
          console.log(`Detected ${data.length} online users:`, data.map((u) => ({
            id: u.id,
            name: u.full_name,
            lastSeen: u.last_seen_at
          })));
        }

        // Always include the current user as online if they're authenticated
        if (supabaseUser && Array.isArray(data)) {
          // Check if the current user is already in the list
          const currentUserInList = data.some((user) => user.id === supabaseUser.id);

          // If not, add them
          if (!currentUserInList) {
            const userWithCurrentTimestamp = {
              ...supabaseUser,
              last_seen_at: new Date().toISOString()
            };

            console.log(`Adding current user to online list:`, {
              id: supabaseUser.id,
              name: supabaseUser.full_name
            });

            data.push(userWithCurrentTimestamp);

            // Also update the user's presence in the database
            updateUserPresence(supabaseUser.id).catch(console.error);
          }
        }

        setOnlineUsers(data || []);

        // Call the callback if provided to notify about online users change
        if (onOnlineUsersChange && Array.isArray(data)) {
          onOnlineUsersChange(data);
        }
      } catch (err) {
        console.error('Failed to process presence change:', err);
      }
    };

    fetchOnlineUsers();
  }, [onOnlineUsersChange, supabaseUser]);

  // Handle room membership changes
  const handleMembershipChange = useCallback((payload) => {
    console.log('Room membership change detected:', payload);

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
      // If roomId is provided, filter for that specific room
      // Otherwise, subscribe to all membership changes
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
      subscriptions.current.presenceInterval = setInterval(() => {
        console.log('Updating user presence on interval');
        updateUserPresence(supabaseUser.id).catch(console.error);
      }, 30000); // Update every 30 seconds instead of every minute

      // Immediately update presence on subscription start
      console.log('Immediately updating user presence on subscription start');
      updateUserPresence(supabaseUser.id).catch(console.error);

      // Also immediately fetch online users
      handlePresenceChange();

      setIsSubscribed(true);
      setError(null);
    } catch (err) {
      console.error('Error setting up real-time subscriptions:', err);
      setError(err.message);
      cleanupSubscriptions();
    }

    // Cleanup on unmount or when roomId changes
    return () => {
      cleanupSubscriptions();
    };
  }, [supabaseUser, roomId, handleNewMessage, handlePresenceChange, handleMembershipChange, cleanupSubscriptions]);

  // Add message to local state optimistically (before server confirms)
  const addLocalMessage = useCallback((message) => {
    setMessages((prevMessages) => [message, ...prevMessages]);
  }, []);

  return {
    messages,
    onlineUsers,
    isSubscribed,
    error,
    addLocalMessage
  };
};