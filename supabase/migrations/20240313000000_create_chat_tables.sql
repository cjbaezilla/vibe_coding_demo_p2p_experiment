-- Create rooms table to store chat rooms
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES public.users(id),
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create messages table to store chat messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create room_members table to track room membership
CREATE TABLE IF NOT EXISTS public.chat_room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_read_message_id UUID REFERENCES public.chat_messages(id),
  UNIQUE(room_id, user_id)
);

-- Add last_seen_at to users table for online presence
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

-- Create function to update user's last_seen_at
CREATE OR REPLACE FUNCTION update_user_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET last_seen_at = now()
  WHERE id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update last_seen_at when messages are inserted
CREATE TRIGGER update_last_seen_on_message
AFTER INSERT ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_user_last_seen();

-- Enable RLS on all tables
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_room_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_rooms
CREATE POLICY "Users can view all public rooms"
  ON public.chat_rooms
  FOR SELECT
  USING (is_private = false OR created_by = auth.uid());

CREATE POLICY "Users can view private rooms they are members of"
  ON public.chat_rooms
  FOR SELECT
  USING (
    is_private = true AND 
    EXISTS (
      SELECT 1 FROM public.chat_room_members 
      WHERE room_id = chat_rooms.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create rooms"
  ON public.chat_rooms
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Room creators can update their rooms"
  ON public.chat_rooms
  FOR UPDATE
  USING (created_by = auth.uid());

-- RLS policies for chat_messages
CREATE POLICY "Users can view messages in rooms they can access"
  ON public.chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE id = chat_messages.room_id AND (
        is_private = false OR
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.chat_room_members
          WHERE room_id = chat_messages.room_id AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can insert messages in rooms they can access"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE id = chat_messages.room_id AND (
        is_private = false OR
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.chat_room_members
          WHERE room_id = chat_messages.room_id AND user_id = auth.uid()
        )
      )
    )
  );

-- RLS policies for chat_room_members
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
            AND m.id != chat_room_members.id
        )
      )
    )
  );

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

CREATE POLICY "Room creators can add members to private rooms"
  ON public.chat_room_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE id = chat_room_members.room_id AND created_by = auth.uid()
    )
  );

-- Enable realtime for needed tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_room_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users; 