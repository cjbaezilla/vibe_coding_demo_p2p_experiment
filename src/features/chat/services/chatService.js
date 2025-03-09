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

  try {
    console.log('Fetching chat rooms for user:', userId);

    // We'll skip the RPC call for now and use direct queries
    // which are more reliable until we can debug the RPC issue

    // Get public rooms
    const { data: publicRooms, error: publicError } = await supabase
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
      .eq('is_private', false)
      .order('updated_at', { ascending: false });

    if (publicError) {
      console.error('Error fetching public rooms:', publicError);
      throw new Error(`Error fetching public chat rooms: ${publicError.message}`);
    }

    // Get private rooms created by the user
    const { data: createdRooms, error: createdError } = await supabase
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
      .eq('is_private', true)
      .eq('created_by', userId)
      .order('updated_at', { ascending: false });

    if (createdError) {
      console.error('Error fetching created rooms:', createdError);
      throw new Error(`Error fetching created rooms: ${createdError.message}`);
    }

    // Get memberships
    const { data: memberships, error: membershipError } = await supabase
      .from('chat_room_members')
      .select('room_id')
      .eq('user_id', userId);

    if (membershipError) {
      console.error('Error fetching memberships:', membershipError);
      throw new Error(`Error fetching room memberships: ${membershipError.message}`);
    }

    // Extract room IDs
    const memberRoomIds = memberships?.map((m) => m.room_id) || [];

    // Get private rooms user is a member of
    let memberRooms = [];
    if (memberRoomIds.length > 0) {
      const { data: fetchedMemberRooms, error: memberRoomsError } = await supabase
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
        .eq('is_private', true)
        .in('id', memberRoomIds)
        .order('updated_at', { ascending: false });

      if (memberRoomsError) {
        console.error('Error fetching member rooms:', memberRoomsError);
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

    const result = Array.from(uniqueRoomMap.values());
    console.log('Successfully fetched', result.length, 'rooms');
    return result;
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
    console.log(`Creating room "${name}" for user ${userId} (private: ${isPrivate})`);

    const client = supabaseAdmin || supabase;

    // Step 1: Create the room
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
      console.error('Error creating room:', roomError);
      throw new Error(`Error creating chat room: ${roomError.message}`);
    }

    console.log(`Room created successfully with ID: ${room.id}`);

    // Step 2: Add the creator as a member automatically
    const { data: membership, error: memberError } = await client
      .from('chat_room_members')
      .insert({
        room_id: room.id,
        user_id: userId
      })
      .select()
      .single();

    if (memberError) {
      console.error('Error adding creator as room member:', memberError);
      // Don't throw here - the room was still created successfully
    } else {
      console.log('Creator added as member successfully');
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

  try {
    console.log('Sending message as user', userId, 'to room', roomId);

    // First verify user's access to the room using the helper function
    const hasAccess = await canAccessRoom(userId, roomId);

    if (!hasAccess) {
      console.error('Access denied to room', roomId, 'for user', userId);

      // Debug information to help understand why access is denied
      const roomInfo = await getChatRoomDetails(roomId);
      console.log('Room info:', roomInfo || 'Could not fetch room info');

      const { data: membership } = await supabase
        .from('chat_room_members')
        .select('id')
        .eq('room_id', roomId)
        .eq('user_id', userId)
        .maybeSingle();

      console.log('User membership:', membership ? 'Yes' : 'No');

      throw new Error('You do not have access to this room');
    }

    // Use admin client if available, otherwise fall back to regular client
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
    console.log(`User ${userId} attempting to join room ${roomId}`);

    // Use our safe function to get room details
    const room = await getChatRoomDetails(roomId);

    if (!room) {
      throw new Error(`Room ${roomId} not found or cannot be accessed`);
    }

    console.log(`Room details: Name: ${room.name}, Private: ${room.is_private}, Creator: ${room.created_by}`);

    // If it's a private room, check if the user is the creator
    if (room.is_private && room.created_by !== userId) {
      console.error(`User ${userId} denied access to private room ${roomId}`);
      throw new Error('Cannot join private room: permission denied');
    }

    // Use the client that's available (admin preferred)
    const client = supabaseAdmin || supabase;

    // Check if user is already a member
    const { data: existingMember, error: checkError } = await client
      .from('chat_room_members')
      .select('id')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingMember) {
      console.log(`User ${userId} is already a member of room ${roomId}`);
      return existingMember;
    }

    // Try to insert the membership
    console.log(`Adding user ${userId} as new member to room ${roomId}`);
    const { data, error } = await client
      .from('chat_room_members')
      .insert({
        room_id: roomId,
        user_id: userId
      })
      .select()
      .single();

    if (error) {
      console.error(`Error joining room ${roomId}:`, error);
      throw new Error(`Error joining chat room: ${error.message}`);
    }

    console.log(`User ${userId} successfully joined room ${roomId}`);
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
    // Use the client that's available (admin preferred)
    const client = supabaseAdmin || supabase;

    // Get room members with user info
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

  try {
    console.log('Checking access for user', userId, 'to room', roomId);

    // Use our new safe function to get room details
    const roomData = await getChatRoomDetails(roomId);

    // If we couldn't get the room data, assume no access
    if (!roomData) {
      console.error('Could not fetch room data for access check');
      return false;
    }

    // If room is public, allow access
    if (!roomData.is_private) {
      console.log('Room is public, access granted');
      return true;
    }

    // If user is the creator, allow access
    if (roomData.created_by === userId) {
      console.log('User is room creator, access granted');
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
    const canAccess = memberData !== null;
    console.log('User membership check result:', canAccess);
    return canAccess;
  } catch (error) {
    console.error('Error in canAccessRoom:', error);
    return false;
  }
};

/**
 * Alternative function to fetch chat rooms using a simpler stored procedure
 * @param {string} userId - The ID of the current user
 * @returns {Promise<Array>} List of chat rooms
 */
export const fetchSimpleChatRooms = async (userId) => {
  if (!userId) {
    throw new Error('User not authenticated');
  }

  try {
    console.log('Trying simple RPC function for user:', userId);

    // Try the simple function first
    if (supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.rpc('get_simple_chat_rooms', {
          user_id: userId
        });

        if (error) {
          console.error('Error with simple RPC function:', error);
        } else {
          console.log('Simple RPC function succeeded!', data?.length || 0, 'rooms found');
          return data || [];
        }
      } catch (rpcError) {
        console.error('Exception with simple RPC function:', rpcError);
        // Fall through to regular function
      }
    }

    // If we got here, use the regular function as fallback
    return fetchChatRooms(userId);
  } catch (error) {
    console.error('Error in fetchSimpleChatRooms:', error);
    throw error;
  }
};

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
    console.log(`Fetching details for room: ${roomId}`);

    // Try using the SQL function first if admin client is available
    if (supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin.rpc('get_room_details_by_id', {
          room_uuid: roomId
        });

        if (!error && data && data.length > 0) {
          console.log('Got room details using RPC function');
          return data[0];
        }

        if (error) {
          console.error('Error using RPC for room details:', error);
        }
      } catch (rpcError) {
        console.error('Exception using RPC for room details:', rpcError);
      }
    }

    // Fallback: Try direct query with admin client
    try {
      const client = supabaseAdmin || supabase;

      // Use a minimal select to avoid potential policy issues
      const { data, error } = await client
        .from('chat_rooms')
        .select('id, name, description, created_by, is_private, created_at, updated_at')
        .eq('id', roomId)
        .maybeSingle();

      if (error) {
        console.error(`Error querying room ${roomId}:`, error);
        return null;
      }

      if (data) {
        console.log('Got room details using direct query');
        return data;
      }

      console.log(`Room ${roomId} not found`);
      return null;
    } catch (queryError) {
      console.error('Error during direct query:', queryError);
      return null;
    }
  } catch (error) {
    console.error(`Unexpected error fetching room ${roomId}:`, error);
    return null;
  }
};