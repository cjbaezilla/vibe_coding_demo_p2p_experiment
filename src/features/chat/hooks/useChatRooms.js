/**
 * Custom hook to handle chat rooms listing and operations
 * Manages available rooms, creation, and selection
 */
import { useState, useEffect, useCallback } from 'react';
import { useSupabaseUserContext } from '../../auth/contexts/SupabaseUserProvider';
import { fetchChatRooms, createChatRoom } from '../services/chatService';

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

  // Load all available rooms
  const loadRooms = useCallback(async () => {
    if (!supabaseUser) {
      setRooms([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const roomsData = await fetchChatRooms();
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
      const newRoom = await createChatRoom(name, description, isPrivate);

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

  // Load rooms when component mounts or user changes
  useEffect(() => {
    loadRooms();
  }, [supabaseUser, loadRooms]);

  return {
    rooms,
    selectedRoomId,
    loading,
    error,
    loadRooms,
    createRoom: handleCreateRoom,
    selectRoom
  };
};