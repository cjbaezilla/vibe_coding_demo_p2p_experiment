/**
 * Custom hook to handle chat rooms listing and operations
 * Manages available rooms, creation, and selection
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSupabaseUserContext } from '../../auth/contexts/SupabaseUserProvider';
import {
  fetchChatRooms,
  createChatRoom,
  isRoomEmpty,
  deleteChatRoom
} from '../services/chatService';

/**
 * Hook for managing chat rooms
 * @returns {object} Chat rooms state and operations
 */
export const useChatRooms = () => {
  const { supabaseUser } = useSupabaseUserContext();
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const emptyRoomCheckInterval = useRef(null);

  // Load all available rooms
  const loadRooms = useCallback(async () => {
    if (!supabaseUser) {
      setRooms([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const roomsData = await fetchChatRooms(supabaseUser.id);
      setRooms(roomsData || []);
      setError(null);
    } catch (err) {
      console.error('Error loading chat rooms:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [supabaseUser]);

  // Create a new chat room
  const handleCreateRoom = useCallback(async (name, description, isPrivate = false) => {
    if (!supabaseUser) {
      return null;
    }

    try {
      setLoading(true);
      const newRoom = await createChatRoom(supabaseUser.id, name, description, isPrivate);

      // Update local state
      setRooms((prevRooms) => [newRoom, ...prevRooms]);

      // Select the newly created room
      setSelectedRoomId(newRoom.id);

      return newRoom;
    } catch (err) {
      console.error('Error creating chat room:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [supabaseUser]);

  // Select a room
  const selectRoom = useCallback((roomId) => {
    // Only update if the room ID actually changed
    if (roomId !== selectedRoomId) {
      setSelectedRoomId(roomId);
    }
  }, [selectedRoomId]);

  // Delete a chat room and its messages
  const handleDeleteRoom = useCallback(async (roomId) => {
    if (!supabaseUser || !roomId) {
      return false;
    }

    try {
      // Delete the room and its messages
      const success = await deleteChatRoom(roomId);

      if (success) {
        // Update local state to remove the room
        setRooms((prevRooms) => prevRooms.filter((room) => room.id !== roomId));

        // If the deleted room was selected, clear the selection
        if (selectedRoomId === roomId) {
          setSelectedRoomId(null);
        }
      }

      return success;
    } catch (err) {
      console.error('Error deleting chat room:', err);
      setError(err.message);
      return false;
    }
  }, [supabaseUser, selectedRoomId]);

  // Check for empty rooms that can be cleaned up
  const checkAndDeleteEmptyRooms = useCallback(async (onlineUsers) => {
    if (!supabaseUser || !Array.isArray(rooms) || rooms.length === 0) {
      return;
    }

    // Skip empty room checks if there are no online users detected
    // This is a safety measure to prevent mass deletion of rooms
    if (!onlineUsers || !Array.isArray(onlineUsers) || onlineUsers.length === 0) {
      return;
    }

    // Make sure the current user is considered online
    const currentUserIsOnline = onlineUsers.some((user) => user.id === supabaseUser.id);
    if (!currentUserIsOnline) {
      return;
    }

    try {
      // Check each room
      for (const room of rooms) {
        // Skip the room the user is currently viewing
        if (room.id === selectedRoomId) {
          continue;
        }

        const isEmpty = await isRoomEmpty(room.id, onlineUsers);

        if (isEmpty) {
          // Room is empty, delete it and its messages
          await handleDeleteRoom(room.id);
        }
      }
    } catch (err) {
      console.error('Error checking empty rooms:', err);
    }
  }, [supabaseUser, rooms, handleDeleteRoom, selectedRoomId]);

  // Load rooms when component mounts or user changes
  useEffect(() => {
    loadRooms();

    // Store the current interval reference in a variable to use in cleanup
    const currentIntervalRef = emptyRoomCheckInterval;

    // Clean up interval on unmount
    return () => {
      const intervalToClean = currentIntervalRef.current;
      if (intervalToClean) {
        clearInterval(intervalToClean);
      }
    };
  }, [loadRooms]);

  return {
    rooms,
    selectedRoomId,
    loading,
    error,
    loadRooms,
    createRoom: handleCreateRoom,
    selectRoom,
    deleteRoom: handleDeleteRoom,
    checkEmptyRooms: checkAndDeleteEmptyRooms
  };
};