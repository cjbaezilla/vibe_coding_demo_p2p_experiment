/**
 * Custom hook to handle chat room operations
 * Manages room data, messages, and actions like sending messages
 */
import { useState, useEffect, useCallback } from 'react';
import { useSupabaseUserContext } from '../../auth/contexts/SupabaseUserProvider';
import {
  fetchChatMessages,
  sendChatMessage,
  joinChatRoom,
  leaveChatRoom,
  getChatRoomMembers,
  getChatRoomDetails
} from '../services/chatService';
import { useChatRealtime } from './useChatRealtime';

/**
 * Hook for managing a specific chat room
 * @param {string} roomId - ID of the chat room
 * @returns {object} Room state and operations
 */
export const useChatRoom = (roomId) => {
  const { supabaseUser } = useSupabaseUserContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [members, setMembers] = useState([]);
  const [hasJoined, setHasJoined] = useState(false);
  const [pendingMessages, setPendingMessages] = useState([]);
  const [roomExists, setRoomExists] = useState(true);

  // Check if room still exists
  const checkRoomExists = useCallback(async () => {
    if (!roomId) {
      return false;
    }

    try {
      const roomDetails = await getChatRoomDetails(roomId);
      const exists = !!roomDetails;
      setRoomExists(exists);
      return exists;
    } catch (err) {
      console.error('Error checking if room exists:', err);
      return false;
    }
  }, [roomId]);

  // Load room members
  const loadMembers = useCallback(async () => {
    if (!roomId || !supabaseUser) {
      return;
    }

    try {
      // First check if the room still exists
      const exists = await checkRoomExists();
      if (!exists) {
        return;
      }

      const membersData = await getChatRoomMembers(roomId);
      setMembers(membersData || []);

      // Check if current user is a member
      const isUserMember = membersData?.some(
        (member) => member.users?.id === supabaseUser.id
      );
      setHasJoined(isUserMember);
    } catch (err) {
      console.error('Error loading room members:', err);
    }
  }, [roomId, supabaseUser, checkRoomExists]);

  // Handle membership changes - refresh the members list and check if user is still a member
  const handleMembershipChange = useCallback((payload) => {
    // Refresh the members list to get the updated membership status
    loadMembers();

    // If the current user was removed (DELETE event), update the UI accordingly
    if (payload.eventType === 'DELETE' &&
        payload.old &&
        payload.old.user_id === supabaseUser?.id &&
        payload.old.room_id === roomId) {
      setHasJoined(false);
    }
  }, [supabaseUser, roomId, loadMembers]);

  // Use the realtime hook to get messages and online status
  const {
    messages: realtimeMessages,
    onlineUsers,
    isSubscribed,
    addLocalMessage
  } = useChatRealtime(roomId, null, handleMembershipChange);

  // Load initial messages
  const loadMessages = useCallback(async () => {
    if (!roomId || !supabaseUser) {
      return;
    }

    try {
      // First check if the room still exists
      const exists = await checkRoomExists();
      if (!exists) {
        return;
      }

      setLoading(true);

      // Fetch messages from the database
      const fetchedMessages = await fetchChatMessages(roomId);

      // We'll use the messages directly but also let the realtime hook know about them
      // This ensures we have immediate data display but also maintain real-time updates
      if (fetchedMessages && fetchedMessages.length > 0) {
        // Apply each message individually to maintain proper order and handle deduplication
        fetchedMessages.forEach((message) => {
          addLocalMessage(message);
        });
      }

      setError(null);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [roomId, supabaseUser, checkRoomExists, addLocalMessage]);

  // Join the current room
  const joinRoom = useCallback(async () => {
    if (!roomId || !supabaseUser) {
      return;
    }

    try {
      // First check if the room still exists
      const exists = await checkRoomExists();
      if (!exists) {
        return;
      }

      setLoading(true);
      await joinChatRoom(supabaseUser.id, roomId);
      setHasJoined(true);
      await loadMembers();
    } catch (err) {
      console.error('Error joining room:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [roomId, supabaseUser, loadMembers, checkRoomExists]);

  // Leave the current room
  const leaveRoom = useCallback(async () => {
    if (!roomId || !supabaseUser) {
      return;
    }

    try {
      // First check if the room still exists
      const exists = await checkRoomExists();
      if (!exists) {
        return;
      }

      setLoading(true);

      // Call the service to remove the member from the database
      await leaveChatRoom(supabaseUser.id, roomId);

      // Update local state immediately for a responsive UI
      setHasJoined(false);

      // We'll still refresh members to ensure consistency, though the real-time
      // subscription should catch this change as well
      await loadMembers();
    } catch (err) {
      console.error('Error leaving room:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [roomId, supabaseUser, loadMembers, checkRoomExists]);

  // Send a message in the current room
  const sendMessage = useCallback(async (messageText) => {
    // Validate input
    const trimmedMessage = messageText?.trim();
    if (!roomId || !supabaseUser || !trimmedMessage) {
      return;
    }

    // First check if the room still exists
    const exists = await checkRoomExists();
    if (!exists) {
      return;
    }

    // Create the user data object once to avoid duplication
    const userData = {
      id: supabaseUser.id,
      full_name: supabaseUser.full_name,
      image_url: supabaseUser.image_url
    };

    // Create a temporary message for optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempId,
      room_id: roomId,
      user_id: supabaseUser.id,
      message: trimmedMessage,
      created_at: new Date().toISOString(),
      users: userData
    };

    // Add to pending messages to track status
    setPendingMessages((prev) => [...prev, { id: tempId, text: trimmedMessage }]);

    // Add message to local state immediately (optimistic update)
    addLocalMessage(tempMessage);

    try {
      // Send to server
      const realMessage = await sendChatMessage(supabaseUser.id, roomId, trimmedMessage);

      // If we got a real message back from the server, update our local state with it
      if (realMessage) {
        // The real message may not include the user data, so we add it
        addLocalMessage({
          ...realMessage,
          users: userData
        });
      }

      // Remove from pending messages
      setPendingMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    } catch (err) {
      // Handle the error but keep the UI responsive
      const errorMessage = err.message || 'Failed to send message';
      console.error(`Error sending message: ${errorMessage}`);
      setError(errorMessage);

      // We could add a visual indicator that the message failed to send
      // but we leave the temp message in the UI to allow for retry
    }
  }, [roomId, supabaseUser, addLocalMessage, checkRoomExists]);

  // Reset state when roomId changes
  useEffect(() => {
    // Only reset if we have a roomId
    if (roomId) {
      // Reset all state variables when roomId changes
      setLoading(true);
      setError(null);
      setMembers([]);
      setHasJoined(false);
      setPendingMessages([]);
      setRoomExists(true);
    }
    // Initial state will be set by subsequent effects
  }, [roomId]);

  // Load initial data when component mounts
  useEffect(() => {
    if (roomId && supabaseUser) {
      // Check if room exists before loading data
      checkRoomExists().then((exists) => {
        if (exists) {
          loadMessages();
          loadMembers();
        }
      });
    }

    // Clean up by sending any pending messages if possible
    return () => {
      pendingMessages.forEach(async (msg) => {
        try {
          if (roomId && supabaseUser && roomExists) {
            await sendChatMessage(supabaseUser.id, roomId, msg.text);
          }
        } catch (err) {
          console.error('Failed to send pending message during cleanup:', err);
        }
      });
    };
  }, [roomId, supabaseUser, loadMessages, loadMembers, pendingMessages, roomExists, checkRoomExists]);

  // Enhanced members list with online status
  const membersWithStatus = members.map((member) => ({
    ...member,
    isOnline: onlineUsers.some((user) => user.id === member.users?.id)
  }));

  return {
    messages: realtimeMessages,
    members: membersWithStatus,
    onlineUsers,
    hasJoined,
    loading,
    error,
    isSubscribed,
    sendMessage,
    joinRoom,
    leaveRoom,
    refreshMembers: loadMembers,
    refreshMessages: loadMessages,
    hasPendingMessages: pendingMessages.length > 0,
    roomExists
  };
};