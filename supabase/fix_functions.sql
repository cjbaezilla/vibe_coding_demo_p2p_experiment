-- Create a very simple stored function that will work for sure
CREATE OR REPLACE FUNCTION public.get_simple_chat_rooms(user_id UUID)
RETURNS SETOF public.chat_rooms
LANGUAGE SQL
SECURITY DEFINER
AS $$
  -- Get ALL rooms user should have access to
  -- Public rooms
  SELECT * FROM public.chat_rooms WHERE is_private = false
  
  UNION
  
  -- Private rooms user created
  SELECT * FROM public.chat_rooms 
  WHERE is_private = true AND created_by = user_id
  
  UNION
  
  -- Private rooms user is a member of
  SELECT r.* FROM public.chat_rooms r
  JOIN public.chat_room_members m ON r.id = m.room_id
  WHERE r.is_private = true AND m.user_id = user_id
  
  ORDER BY updated_at DESC;
$$;

-- Improved user_can_access_room function that checks all conditions
CREATE OR REPLACE FUNCTION public.user_can_access_room(user_uuid UUID, room_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  -- Check all access conditions
  SELECT EXISTS (
    SELECT 1 FROM public.chat_rooms r
    WHERE r.id = room_uuid AND (
      -- Room is public
      r.is_private = false OR
      -- User is creator
      r.created_by = user_uuid OR
      -- User is member 
      EXISTS (
        SELECT 1 FROM public.chat_room_members m
        WHERE m.room_id = room_uuid AND m.user_id = user_uuid
      )
    )
  );
$$;

-- Add a safe room details function that avoids recursion
CREATE OR REPLACE FUNCTION public.get_room_details_by_id(room_uuid UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  created_by UUID,
  is_private BOOLEAN,
  created_at TIMESTAMPTZ, 
  updated_at TIMESTAMPTZ
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  -- Direct query without any joins that could cause recursion
  SELECT id, name, description, created_by, is_private, created_at, updated_at
  FROM public.chat_rooms
  WHERE id = room_uuid;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_simple_chat_rooms(UUID) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.user_can_access_room(UUID, UUID) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.get_room_details_by_id(UUID) TO authenticated, anon, service_role;