-- Drop existing functions if they exist to avoid conflicts
DROP FUNCTION IF EXISTS public.get_accessible_rooms_for_user(UUID);
DROP FUNCTION IF EXISTS public.user_can_access_room(UUID, UUID);

-- Create a stored function that will be used to get all accessible rooms for a user
-- This bypasses RLS completely by using SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_accessible_rooms_for_user(user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  created_by UUID,
  is_private BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Return public rooms
  RETURN QUERY 
  SELECT 
    r.id,
    r.name,
    r.description,
    r.created_by,
    r.is_private,
    r.created_at,
    r.updated_at
  FROM public.chat_rooms r
  WHERE r.is_private = false
  
  UNION
  
  -- Return private rooms created by the user
  SELECT 
    r.id,
    r.name,
    r.description,
    r.created_by,
    r.is_private,
    r.created_at,
    r.updated_at
  FROM public.chat_rooms r
  WHERE r.is_private = true AND r.created_by = user_id
  
  UNION
  
  -- Return private rooms where user is a member
  SELECT 
    r.id,
    r.name,
    r.description,
    r.created_by,
    r.is_private,
    r.created_at,
    r.updated_at
  FROM public.chat_rooms r
  INNER JOIN public.chat_room_members m ON r.id = m.room_id
  WHERE r.is_private = true AND m.user_id = user_id
  
  ORDER BY updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the user_can_access_room function 
CREATE OR REPLACE FUNCTION public.user_can_access_room(user_uuid UUID, room_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Return true if user can access the room:
  -- 1. Room is public, or
  -- 2. User created the room, or
  -- 3. User is a member of the room
  RETURN EXISTS (
    SELECT 1 FROM public.chat_rooms 
    WHERE id = room_uuid AND (
      is_private = false OR 
      created_by = user_uuid OR
      EXISTS (
        SELECT 1 FROM public.chat_room_members
        WHERE room_id = room_uuid AND user_id = user_uuid
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION public.get_accessible_rooms_for_user(UUID) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.user_can_access_room(UUID, UUID) TO authenticated, anon, service_role; 