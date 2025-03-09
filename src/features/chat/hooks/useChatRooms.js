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
    setSelectedRoomId(roomId);
  }, []);

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

  // Check for empty rooms and delete them
  const checkAndDeleteEmptyRooms = useCallback(async (onlineUsers) => {
    if (!supabaseUser || !rooms.length) {
      return;
    }

    try {
      // Check each room
      for (const room of rooms) {
        const isEmpty = await isRoomEmpty(room.id, onlineUsers);

        if (isEmpty) {
          // Room is empty, delete it and its messages
          await handleDeleteRoom(room.id);
        }
      }
    } catch (err) {
      console.error('Error checking empty rooms:', err);
    }
  }, [supabaseUser, rooms, handleDeleteRoom]);

  // Load rooms when component mounts or user changes
  useEffect(() => {
    loadRooms();

    // Clean up interval on unmount
    return () => {
      const intervalToClean = emptyRoomCheckInterval.current;
      if (intervalToClean) {
        clearInterval(intervalToClean);
      }
    };
  }, [supabaseUser, loadRooms]);

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