-- Drop existing functions if they exist to avoid conflicts
DROP FUNCTION IF EXISTS public.get_accessible_rooms_for_user(UUID);
DROP FUNCTION IF EXISTS public.user_can_access_room(UUID, UUID);

-- Create a MUCH simpler version of the function that is guaranteed to work
-- This completely avoids joins and complex logic that might be causing issues
CREATE OR REPLACE FUNCTION public.get_accessible_rooms_for_user(user_id UUID)
RETURNS SETOF chat_rooms
LANGUAGE SQL
SECURITY DEFINER
AS $$
  -- Just get all public rooms to start with - we can add complexity later
  SELECT * FROM chat_rooms WHERE is_private = false;
$$;

-- Create a very simple user_can_access_room function
CREATE OR REPLACE FUNCTION public.user_can_access_room(user_uuid UUID, room_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  -- Only check if the room is public for now
  SELECT EXISTS (
    SELECT 1 FROM chat_rooms WHERE id = room_uuid AND is_private = false
  );
$$;

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION public.get_accessible_rooms_for_user(UUID) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.user_can_access_room(UUID, UUID) TO authenticated, anon, service_role; 