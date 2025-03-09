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
  getChatRoomMembers
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

  // Use the realtime hook to get messages and online status
  const {
    messages: realtimeMessages,
    onlineUsers,
    isSubscribed,
    addLocalMessage
  } = useChatRealtime(roomId);

  // Load initial messages
  const loadMessages = useCallback(async () => {
    if (!roomId || !supabaseUser) {
      return;
    }

    try {
      setLoading(true);
      // We fetch messages but don't use the result directly
      // as the realtime hook will handle the messages
      await fetchChatMessages(roomId);
      setError(null);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [roomId, supabaseUser]);

  // Load room members
  const loadMembers = useCallback(async () => {
    if (!roomId || !supabaseUser) {
      return;
    }

    try {
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
  }, [roomId, supabaseUser]);

  // Join the current room
  const joinRoom = useCallback(async () => {
    if (!roomId || !supabaseUser) {
      return;
    }

    try {
      setLoading(true);
      await joinChatRoom(roomId);
      setHasJoined(true);
      await loadMembers();
    } catch (err) {
      console.error('Error joining room:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [roomId, supabaseUser, loadMembers]);

  // Send a message in the current room
  const sendMessage = useCallback(async (messageText) => {
    if (!roomId || !supabaseUser || !messageText.trim()) {
      return;
    }

    // Create a temporary message for optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempId,
      room_id: roomId,
      user_id: supabaseUser.id,
      message: messageText,
      created_at: new Date().toISOString(),
      users: {
        id: supabaseUser.id,
        full_name: supabaseUser.full_name,
        image_url: supabaseUser.image_url
      }
    };

    // Add to pending messages to track status
    setPendingMessages((prev) => [...prev, { id: tempId, text: messageText }]);

    // Add message to local state immediately (optimistic update)
    addLocalMessage(tempMessage);

    try {
      // Send to server
      await sendChatMessage(roomId, messageText);
      // Remove from pending messages
      setPendingMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      // The real-time subscription will update with the actual message
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message);
      // We could handle removing the optimistic message here if needed
    }
  }, [roomId, supabaseUser, addLocalMessage]);

  // Load initial data when component mounts
  useEffect(() => {
    if (roomId && supabaseUser) {
      loadMessages();
      loadMembers();
    }

    // Clean up by sending any pending messages if possible
    return () => {
      pendingMessages.forEach(async (msg) => {
        try {
          if (roomId && supabaseUser) {
            await sendChatMessage(roomId, msg.text);
          }
        } catch (err) {
          console.error('Failed to send pending message during cleanup:', err);
        }
      });
    };
  }, [roomId, supabaseUser, loadMessages, loadMembers, pendingMessages]);

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
    refreshMembers: loadMembers,
    refreshMessages: loadMessages,
    hasPendingMessages: pendingMessages.length > 0
  };
};