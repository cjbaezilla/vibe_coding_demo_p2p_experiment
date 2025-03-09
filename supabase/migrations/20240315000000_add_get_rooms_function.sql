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