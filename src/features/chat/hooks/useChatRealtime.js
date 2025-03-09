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
 * @returns {object} Real-time state and handlers
 */
export const useChatRealtime = (roomId = null, onOnlineUsersChange = null) => {
  const { supabaseUser } = useSupabaseUserContext();
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState(null);

  // Store subscriptions to clean up
  const subscriptions = useRef({
    messages: null,
    rooms: null,
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
        // Query users who have been seen recently
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const { data, error: fetchError } = await supabase
          .from('users')
          .select('id, full_name, image_url, last_seen_at')
          .gte('last_seen_at', fiveMinutesAgo);

        if (fetchError) {
          console.error('Error fetching online users:', fetchError);
          return;
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
  }, [onOnlineUsersChange]);

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

      // 3. Set up interval to update user's own presence
      subscriptions.current.presenceInterval = setInterval(() => {
        updateUserPresence(supabaseUser.id).catch(console.error);
      }, 60000); // Update every minute

      // Immediately update presence on subscription start
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
  }, [supabaseUser, roomId, handleNewMessage, handlePresenceChange, cleanupSubscriptions]);

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