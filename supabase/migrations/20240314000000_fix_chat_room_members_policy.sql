-- Drop the existing policy that causes infinite recursion
DROP POLICY IF EXISTS "Users can view room members of rooms they can access" ON public.chat_room_members;

-- Create the fixed policy
CREATE POLICY "Users can view room members of rooms they can access"
  ON public.chat_room_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE id = chat_room_members.room_id AND (
        is_private = false OR
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.chat_room_members m
          WHERE m.room_id = chat_room_members.room_id AND m.user_id = auth.uid()
            AND m.id != chat_room_members.id  -- Prevent infinite recursion
        )
      )
    )
  ); 