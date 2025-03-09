/**
 * Service for chat-related operations using Supabase
 * Provides functions for managing chat rooms, messages, and members
 */
import { supabase, supabaseAdmin } from '../../../supabaseClient';

// Don't use Supabase auth functions directly, the app uses Clerk for auth
// Each function will now take the user ID as a parameter

/**
 * Fetch available chat rooms for the current user
 * @param {string} userId - The ID of the current user
 * @returns {Promise<Array>} List of chat rooms
 */
export const fetchChatRooms = async (userId) => {
  if (!userId) {
    throw new Error('User not authenticated');
  }

  if (!supabaseAdmin) {
    throw new Error('Admin client not available for fetching rooms');
  }

  try {
    // Use PostgreSQL stored function to safely collect all accessible rooms
    // This completely avoids the policy recursion issue by using a single, direct stored procedure
    const { data, error } = await supabaseAdmin.rpc('get_accessible_rooms_for_user', {
      user_id: userId
    });

    if (error) {
      throw new Error(`Error fetching chat rooms: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchChatRooms:', error);
    throw error;
  }
};

/**
 * Create a new chat room
 * @param {string} userId - The ID of the current user
 * @param {string} name - Room name
 * @param {string} description - Room description
 * @param {boolean} isPrivate - Whether the room is private
 * @returns {Promise<object>} Created room data
 */
export const createChatRoom = async (userId, name, description, isPrivate = false) => {
  if (!userId) {
    throw new Error('User not authenticated');
  }

  if (!supabaseAdmin) {
    throw new Error('Admin client not available for creating room');
  }

  try {
    // Step 1: Create the room using admin client to bypass RLS
    const { data: room, error: roomError } = await supabaseAdmin
      .from('chat_rooms')
      .insert({
        name,
        description,
        is_private: isPrivate,
        created_by: userId
      })
      .select()
      .single();

    if (roomError) {
      throw new Error(`Error creating chat room: ${roomError.message}`);
    }

    // Step 2: Add the creator as a member automatically using admin client
    const { error: memberError } = await supabaseAdmin
      .from('chat_room_members')
      .insert({
        room_id: room.id,
        user_id: userId
      });

    if (memberError) {
      console.error('Error adding creator as room member:', memberError);
      // Don't throw here - the room was still created successfully
    }

    return room;
  } catch (error) {
    console.error('Error in createChatRoom:', error);
    throw error;
  }
};

/**
 * Fetch messages for a specific chat room
 * @param {string} roomId - ID of the room to fetch messages for
 * @param {number} limit - Maximum number of messages to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} List of messages with user details
 */
export const fetchChatMessages = async (roomId, limit = 50, offset = 0) => {
  try {
    // Use admin client to bypass RLS policies if available
    const client = supabaseAdmin || supabase;

    const { data, error } = await client
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

    return data || [];
  } catch (error) {
    console.error('Error in fetchChatMessages:', error);
    throw error;
  }
};

/**
 * Send a new message to a chat room
 * @param {string} userId - The ID of the current user
 * @param {string} roomId - ID of the room to send message to
 * @param {string} message - Message content
 * @returns {Promise<object>} Created message data
 */
export const sendChatMessage = async (userId, roomId, message) => {
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
 * @param {string} userId - The ID of the current user
 * @param {string} roomId - ID of the room to join
 * @returns {Promise<object>} Membership data
 */
export const joinChatRoom = async (userId, roomId) => {
  if (!userId) {
    throw new Error('User not authenticated');
  }

  if (!supabaseAdmin) {
    throw new Error('Admin client not available for joining room');
  }

  try {
    // First, check if the room exists and user has permission to join
    const { data: room, error: roomError } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (roomError) {
      throw new Error(`Error fetching room to join: ${roomError.message}`);
    }

    // If it's a private room, check if the user is the creator
    if (room.is_private && room.created_by !== userId) {
      throw new Error('Cannot join private room: permission denied');
    }

    // Use admin client to bypass RLS for the insert
    const { data, error } = await supabaseAdmin
      .from('chat_room_members')
      .insert({
        room_id: roomId,
        user_id: userId
      })
      .select()
      .single();

    if (error) {
      // If error is duplicate key, user is already a member - that's ok
      if (error.code === '23505') {
        // Return the existing membership
        const { data: existingMembership, error: existingError } = await supabaseAdmin
          .from('chat_room_members')
          .select('*')
          .eq('room_id', roomId)
          .eq('user_id', userId)
          .single();

        if (existingError) {
          throw new Error(`Error fetching existing membership: ${existingError.message}`);
        }

        return existingMembership;
      }

      throw new Error(`Error joining chat room: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in joinChatRoom:', error);
    throw error;
  }
};

/**
 * Get members of a chat room
 * @param {string} roomId - ID of the room to get members for
 * @returns {Promise<Array>} List of room members with user details
 */
export const getChatRoomMembers = async (roomId) => {
  if (!supabaseAdmin) {
    throw new Error('Admin client not available for fetching room members');
  }

  try {
    // Use admin client to bypass RLS policies
    const { data, error } = await supabaseAdmin
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

    return data || [];
  } catch (error) {
    console.error('Error in getChatRoomMembers:', error);
    throw error;
  }
};

/**
 * Update the user's last seen timestamp (used for online presence)
 * @param {string} userId - The ID of the current user
 * @returns {Promise<void>}
 */
export const updateUserPresence = async (userId) => {
  if (!userId) {
    return; // Skip if not authenticated
  }

  const { error } = await supabase
    .from('users')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user presence:', error);
  }
};

/**
 * Check if a user can access a specific chat room
 * @param {string} userId - The ID of the user
 * @param {string} roomId - The ID of the room
 * @returns {Promise<boolean>} Whether the user can access the room
 */
export const canAccessRoom = async (userId, roomId) => {
  if (!userId || !roomId) {
    return false;
  }

  if (!supabaseAdmin) {
    throw new Error('Admin client not available for checking room access');
  }

  try {
    // Use the stored procedure to check access
    const { data, error } = await supabaseAdmin.rpc('user_can_access_room', {
      user_uuid: userId,
      room_uuid: roomId
    });

    if (error) {
      console.error('Error checking room access:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Error in canAccessRoom:', error);
    return false;
  }
};