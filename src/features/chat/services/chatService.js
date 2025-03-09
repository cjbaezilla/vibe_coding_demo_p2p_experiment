/**
 * Service for chat-related operations using Supabase
 * Provides functions for managing chat rooms, messages, and members
 */
import { supabase, supabaseAdmin } from '../../../supabaseClient';

// =============================================================================
// CHAT ROOM OPERATIONS
// =============================================================================

/**
 * Safely fetch details about a specific chat room
 * @param {string} roomId - ID of the room to fetch
 * @returns {Promise<object|null>} Room data or null if not found/error
 */
export const getChatRoomDetails = async (roomId) => {
  if (!roomId) {
    console.error('No room ID provided');
    return null;
  }

  try {
    // Try using the SQL function first if admin client is available
    if (supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.rpc('get_room_details_by_id', {
          room_uuid: roomId
        });

        if (!error && data && data.length > 0) {
          return data[0];
        }
      } catch (error) {
        console.error('Error using RPC for room details:', error);
      }
    }

    // Fallback to direct query
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('chat_rooms')
      .select('id, name, description, created_by, is_private, created_at, updated_at')
      .eq('id', roomId)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching room ${roomId}:`, error);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Error in getChatRoomDetails:`, error);
    return null;
  }
};

/**
 * Check if a chat room is empty (has no online users)
 * @param {string} roomId - ID of the room to check
 * @param {Array} onlineUsers - List of currently online users
 * @returns {Promise<boolean>} Whether the room is empty
 */
export const isRoomEmpty = async (roomId, onlineUsers) => {
  if (!roomId) {
    console.log('isRoomEmpty: No room ID provided');
    return false;
  }

  if (!onlineUsers || !Array.isArray(onlineUsers)) {
    console.log(`isRoomEmpty: Invalid online users data for room ${roomId}`);
    return false;
  }

  // Always consider a room with active online users as non-empty
  if (onlineUsers.length === 0) {
    console.log(`isRoomEmpty: No online users detected in the system`);
    // If there are no online users at all in the system, don't consider rooms empty
    // This prevents mass deletion of rooms when there's an issue with online detection
    return false;
  }

  try {
    // Get all members of the room
    const members = await getChatRoomMembers(roomId);
    console.log(`isRoomEmpty: Room ${roomId} has ${members?.length || 0} members`);

    if (!members || members.length === 0) {
      // No members at all, room is definitely empty
      console.log(`isRoomEmpty: Room ${roomId} has no members, marking as empty`);
      return true;
    }

    // Extract user IDs for easier comparison
    const memberUserIds = members
      .map((member) => member.users?.id)
      .filter((id) => id); // Filter out undefined/null

    const onlineUserIds = onlineUsers.map((user) => user.id);

    console.log(`isRoomEmpty: Member user IDs in room ${roomId}:`, memberUserIds);
    console.log(`isRoomEmpty: Online user IDs:`, onlineUserIds);

    // Check if there's an intersection between member IDs and online user IDs
    const hasOnlineMembers = memberUserIds.some((memberId) =>
      onlineUserIds.includes(memberId)
    );

    // Room is empty if no members are online
    const isEmpty = !hasOnlineMembers;
    console.log(`isRoomEmpty: Room ${roomId} isEmpty=${isEmpty}`);

    return isEmpty;
  } catch (error) {
    console.error(`Error checking if room ${roomId} is empty:`, error);
    // Default to not empty in case of error to prevent accidental deletion
    return false;
  }
};

/**
 * Delete a chat room and all its messages
 * @param {string} roomId - ID of the room to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteChatRoom = async (roomId) => {
  if (!roomId) {
    console.error('No room ID provided for deletion');
    return false;
  }

  try {
    const client = supabaseAdmin || supabase;

    // Delete all messages in the room first
    const { error: messagesError } = await client
      .from('chat_messages')
      .delete()
      .eq('room_id', roomId);

    if (messagesError) {
      console.error(`Error deleting messages for room ${roomId}:`, messagesError);
      return false;
    }

    // Delete all room memberships
    const { error: membersError } = await client
      .from('chat_room_members')
      .delete()
      .eq('room_id', roomId);

    if (membersError) {
      console.error(`Error deleting members for room ${roomId}:`, membersError);
      return false;
    }

    // Finally delete the room itself
    const { error: roomError } = await client
      .from('chat_rooms')
      .delete()
      .eq('id', roomId);

    if (roomError) {
      console.error(`Error deleting room ${roomId}:`, roomError);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error in deleteChatRoom:`, error);
    return false;
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

  try {
    // Get room details
    const roomData = await getChatRoomDetails(roomId);

    if (!roomData) {
      return false;
    }

    // If room is public, allow access
    if (!roomData.is_private) {
      return true;
    }

    // If user is the creator, allow access
    if (roomData.created_by === userId) {
      return true;
    }

    // Check if user is a member
    const { data: memberData, error: memberError } = await supabase
      .from('chat_room_members')
      .select('id')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .maybeSingle();

    if (memberError) {
      console.error('Error checking room membership:', memberError);
      return false;
    }

    // User can access if they are a member
    return memberData !== null;
  } catch (error) {
    console.error('Error in canAccessRoom:', error);
    return false;
  }
};

/**
 * Fetch available chat rooms for the current user
 * @param {string} userId - The ID of the current user
 * @returns {Promise<Array>} List of chat rooms
 */
export const fetchChatRooms = async (userId) => {
  if (!userId) {
    throw new Error('User not authenticated');
  }

  try {
    // Try the RPC function if admin client is available
    if (supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.rpc('get_simple_chat_rooms', {
          user_id: userId
        });

        if (!error) {
          return data || [];
        }
      } catch (error) {
        console.error('Error using RPC for chat rooms:', error);
      }
    }

    // Fallback to direct queries
    // 1. Get public rooms
    const { data: publicRooms, error: publicError } = await supabase
      .from('chat_rooms')
      .select(`
        id, name, description, created_by, is_private, created_at, updated_at
      `)
      .eq('is_private', false)
      .order('updated_at', { ascending: false });

    if (publicError) {
      throw new Error(`Error fetching public chat rooms: ${publicError.message}`);
    }

    // 2. Get private rooms created by the user
    const { data: createdRooms, error: createdError } = await supabase
      .from('chat_rooms')
      .select(`
        id, name, description, created_by, is_private, created_at, updated_at
      `)
      .eq('is_private', true)
      .eq('created_by', userId)
      .order('updated_at', { ascending: false });

    if (createdError) {
      throw new Error(`Error fetching created rooms: ${createdError.message}`);
    }

    // 3. Get memberships
    const { data: memberships, error: membershipError } = await supabase
      .from('chat_room_members')
      .select('room_id')
      .eq('user_id', userId);

    if (membershipError) {
      throw new Error(`Error fetching room memberships: ${membershipError.message}`);
    }

    // Extract room IDs
    const memberRoomIds = memberships?.map((m) => m.room_id) || [];

    // 4. Get private rooms user is a member of
    let memberRooms = [];
    if (memberRoomIds.length > 0) {
      const { data: fetchedMemberRooms, error: memberRoomsError } = await supabase
        .from('chat_rooms')
        .select(`
          id, name, description, created_by, is_private, created_at, updated_at
        `)
        .eq('is_private', true)
        .in('id', memberRoomIds)
        .order('updated_at', { ascending: false });

      if (memberRoomsError) {
        throw new Error(`Error fetching member rooms: ${memberRoomsError.message}`);
      }

      memberRooms = fetchedMemberRooms || [];
    }

    // Combine results and remove duplicates
    const uniqueRoomMap = new Map();

    [...(publicRooms || []), ...(createdRooms || []), ...memberRooms].forEach((room) => {
      if (room && room.id) {
        uniqueRoomMap.set(room.id, room);
      }
    });

    return Array.from(uniqueRoomMap.values());
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

  try {
    const client = supabaseAdmin || supabase;

    // Create the room
    const { data: room, error: roomError } = await client
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

    // Add the creator as a member automatically
    const { error: memberError } = await client
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
 * Join a chat room as a member
 * @param {string} userId - The ID of the current user
 * @param {string} roomId - ID of the room to join
 * @returns {Promise<object>} Membership data
 */
export const joinChatRoom = async (userId, roomId) => {
  if (!userId) {
    throw new Error('User not authenticated');
  }

  try {
    // Get room details
    const room = await getChatRoomDetails(roomId);

    if (!room) {
      throw new Error(`Room ${roomId} not found or cannot be accessed`);
    }

    // If it's a private room, check if the user is the creator
    if (room.is_private && room.created_by !== userId) {
      throw new Error('Cannot join private room: permission denied');
    }

    const client = supabaseAdmin || supabase;

    // Check if user is already a member
    const { data: existingMember } = await client
      .from('chat_room_members')
      .select('id')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingMember) {
      return existingMember;
    }

    // Try to insert the membership
    const { data, error } = await client
      .from('chat_room_members')
      .insert({
        room_id: roomId,
        user_id: userId
      })
      .select()
      .single();

    if (error) {
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
  try {
    const client = supabaseAdmin || supabase;

    const { data, error } = await client
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

// =============================================================================
// CHAT MESSAGE OPERATIONS
// =============================================================================

/**
 * Fetch messages for a specific chat room
 * @param {string} roomId - ID of the room to fetch messages for
 * @param {number} limit - Maximum number of messages to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} List of messages with user details
 */
export const fetchChatMessages = async (roomId, limit = 50, offset = 0) => {
  try {
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

  try {
    // Verify user's access to the room
    const hasAccess = await canAccessRoom(userId, roomId);

    if (!hasAccess) {
      throw new Error('You do not have access to this room');
    }

    const client = supabaseAdmin || supabase;

    // Insert the message
    const { data, error } = await client
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
  } catch (error) {
    console.error('Error in sendChatMessage:', error);
    throw error;
  }
};

// =============================================================================
// USER PRESENCE OPERATIONS
// =============================================================================

/**
 * Update the user's last seen timestamp (used for online presence)
 * @param {string} userId - The ID of the current user
 * @returns {Promise<void>}
 */
export const updateUserPresence = async (userId) => {
  if (!userId) {
    return; // Skip if not authenticated
  }

  try {
    // First check if the user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking user existence:', checkError);
      return;
    }

    // If user doesn't exist, we can't update presence
    if (!existingUser) {
      console.error(`User ${userId} doesn't exist in the database`);
      return;
    }

    // Update the user's last seen timestamp
    const timestamp = new Date().toISOString();
    const { error } = await supabase
      .from('users')
      .update({ last_seen_at: timestamp })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user presence:', error);
    } else {
      console.log(`Updated presence for user ${userId}: ${timestamp}`);
    }
  } catch (error) {
    console.error('Error in updateUserPresence:', error);
  }
};