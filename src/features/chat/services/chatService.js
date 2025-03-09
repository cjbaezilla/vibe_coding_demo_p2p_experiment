/**
 * Service for chat-related operations using Supabase
 * Provides functions for managing chat rooms, messages, and members
 */
import { supabase } from '../../../supabaseClient';

/**
 * Fetch available chat rooms for the current user
 * @returns {Promise<Array>} List of chat rooms
 */
export const fetchChatRooms = async () => {
  const { data, error } = await supabase
    .from('chat_rooms')
    .select(`
      id,
      name,
      description,
      created_by,
      is_private,
      created_at,
      updated_at
    `)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching chat rooms: ${error.message}`);
  }

  return data;
};

/**
 * Create a new chat room
 * @param {string} name - Room name
 * @param {string} description - Room description
 * @param {boolean} isPrivate - Whether the room is private
 * @returns {Promise<object>} Created room data
 */
export const createChatRoom = async (name, description, isPrivate = false) => {
  const { data, error } = await supabase
    .from('chat_rooms')
    .insert({
      name,
      description,
      is_private: isPrivate,
      created_by: supabase.auth.user()?.id
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating chat room: ${error.message}`);
  }

  return data;
};

/**
 * Fetch messages for a specific chat room
 * @param {string} roomId - ID of the room to fetch messages for
 * @param {number} limit - Maximum number of messages to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} List of messages with user details
 */
export const fetchChatMessages = async (roomId, limit = 50, offset = 0) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select(`
      id,
      message,
      created_at,
      users:user_id (id, full_name, image_url)
    `)
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Error fetching chat messages: ${error.message}`);
  }

  return data;
};

/**
 * Send a new message to a chat room
 * @param {string} roomId - ID of the room to send message to
 * @param {string} message - Message content
 * @returns {Promise<object>} Created message data
 */
export const sendChatMessage = async (roomId, message) => {
  const userId = supabase.auth.user()?.id;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      room_id: roomId,
      user_id: userId,
      message
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error sending message: ${error.message}`);
  }

  return data;
};

/**
 * Join a chat room as a member
 * @param {string} roomId - ID of the room to join
 * @returns {Promise<object>} Membership data
 */
export const joinChatRoom = async (roomId) => {
  const userId = supabase.auth.user()?.id;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('chat_room_members')
    .insert({
      room_id: roomId,
      user_id: userId
    })
    .select()
    .single();

  if (error && error.code !== '23505') { // Ignore unique violation errors (already a member)
    throw new Error(`Error joining chat room: ${error.message}`);
  }

  return data;
};

/**
 * Get members of a chat room
 * @param {string} roomId - ID of the room to get members for
 * @returns {Promise<Array>} List of room members with user details
 */
export const getChatRoomMembers = async (roomId) => {
  const { data, error } = await supabase
    .from('chat_room_members')
    .select(`
      id,
      joined_at,
      users:user_id (id, full_name, image_url, last_seen_at)
    `)
    .eq('room_id', roomId);

  if (error) {
    throw new Error(`Error fetching room members: ${error.message}`);
  }

  return data;
};

/**
 * Update the user's last seen timestamp (used for online presence)
 * @returns {Promise<void>}
 */
export const updateUserPresence = async () => {
  const { error } = await supabase
    .from('users')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', supabase.auth.user()?.id);

  if (error) {
    console.error('Error updating user presence:', error);
  }
};