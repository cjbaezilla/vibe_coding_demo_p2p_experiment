-- Create a stored function that will be used to get all accessible rooms for a user
-- This bypasses RLS completely by using SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_accessible_rooms_for_user(user_id UUID)
RETURNS SETOF public.chat_rooms AS $$
BEGIN
  -- Return public rooms
  RETURN QUERY 
  SELECT * FROM public.chat_rooms 
  WHERE is_private = false
  
  UNION
  
  -- Return private rooms created by the user
  SELECT * FROM public.chat_rooms 
  WHERE is_private = true AND created_by = user_id
  
  UNION
  
  -- Return private rooms where user is a member
  SELECT r.* FROM public.chat_rooms r
  JOIN public.chat_room_members m ON r.id = m.room_id
  WHERE r.is_private = true AND m.user_id = user_id
  
  ORDER BY updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make the helper function return a boolean instead of DECLARE variables
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
GRANT EXECUTE ON FUNCTION public.get_accessible_rooms_for_user TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.user_can_access_room TO anon, authenticated, service_role; 