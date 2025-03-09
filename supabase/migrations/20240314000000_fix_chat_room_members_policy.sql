-- First, drop all existing policies for chat_room_members
DROP POLICY IF EXISTS "Users can view room members of rooms they can access" ON public.chat_room_members;
DROP POLICY IF EXISTS "Users can join public rooms" ON public.chat_room_members;
DROP POLICY IF EXISTS "Room creators can add members to private rooms" ON public.chat_room_members;
DROP POLICY IF EXISTS "Users can see members of public rooms" ON public.chat_room_members;
DROP POLICY IF EXISTS "Room creators can see members of their rooms" ON public.chat_room_members;
DROP POLICY IF EXISTS "Users can see members of rooms they belong to" ON public.chat_room_members;

-- Now, create a new approach with minimal policies, focusing on security but avoiding complexity

-- 1. Let users view their own memberships - the most fundamental policy
CREATE POLICY "Users can view their own memberships"
  ON public.chat_room_members
  FOR SELECT
  USING (user_id = auth.uid());

-- 2. Let users view all memberships for public rooms
CREATE POLICY "Users can view memberships for public rooms"
  ON public.chat_room_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE id = chat_room_members.room_id AND is_private = false
    )
  );

-- 3. Let room creators view all memberships for rooms they created
CREATE POLICY "Room creators can view all memberships for their rooms"
  ON public.chat_room_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE id = chat_room_members.room_id AND created_by = auth.uid()
    )
  );

-- 4. Users can join public rooms
CREATE POLICY "Users can join public rooms"
  ON public.chat_room_members
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE id = chat_room_members.room_id AND is_private = false
    )
  );

-- 5. Room creators can add any member to their own rooms
CREATE POLICY "Room creators can add members to their rooms"
  ON public.chat_room_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE id = chat_room_members.room_id AND created_by = auth.uid()
    )
  );

-- Add a function to get a user's membership status in a room
CREATE OR REPLACE FUNCTION public.user_can_access_room(user_uuid UUID, room_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_member BOOLEAN;
  is_public BOOLEAN;
  is_creator BOOLEAN;
BEGIN
  -- Check if the room is public
  SELECT is_private = false INTO is_public 
  FROM public.chat_rooms WHERE id = room_uuid;
  
  -- Check if the user is the creator
  SELECT created_by = user_uuid INTO is_creator 
  FROM public.chat_rooms WHERE id = room_uuid;
  
  -- Check if the user is a member
  SELECT EXISTS (
    SELECT 1 FROM public.chat_room_members 
    WHERE room_id = room_uuid AND user_id = user_uuid
  ) INTO is_member;
  
  -- Return true if any condition is met
  RETURN (is_public OR is_creator OR is_member);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 