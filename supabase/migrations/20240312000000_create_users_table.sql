-- Create users table to store Clerk user data
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create a trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own record
CREATE POLICY "Users can read their own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Create policy for service role to create users
CREATE POLICY "Service role can create users"
  ON public.users
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create policy for service role to update users
CREATE POLICY "Service role can update users"
  ON public.users
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow public to view limited user data
CREATE POLICY "Public can view limited user data"
  ON public.users
  FOR SELECT
  TO anon
  USING (true);

-- Public function to get current user based on Clerk ID
CREATE OR REPLACE FUNCTION public.get_user_by_clerk_id(clerk_id TEXT)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  user_record jsonb;
BEGIN
  SELECT json_build_object(
    'id', id,
    'clerk_id', clerk_id,
    'email', email,
    'full_name', full_name,
    'image_url', image_url,
    'created_at', created_at
  ) INTO user_record
  FROM public.users
  WHERE users.clerk_id = get_user_by_clerk_id.clerk_id
  LIMIT 1;
  
  RETURN user_record;
END;
$$; 