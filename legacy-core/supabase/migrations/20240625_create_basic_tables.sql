-- Create basic schema for the LegacyCore application

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'agent',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create applications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES auth.users,
  proposed_insured TEXT,
  carrier TEXT,
  status TEXT DEFAULT 'submitted',
  product_type TEXT,
  face_amount DECIMAL DEFAULT 0,
  premium DECIMAL DEFAULT 0,
  commission_amount DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chats table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chat_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES public.chats,
  role TEXT,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create basic security policies
CREATE POLICY "Users can view their own profiles"
ON public.profiles
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can update their own profiles"
ON public.profiles
FOR UPDATE
USING (id = auth.uid());

-- Applications policies
CREATE POLICY "Users can view their own applications"
ON public.applications
FOR SELECT
USING (agent_id = auth.uid());

CREATE POLICY "Managers can see all applications"
ON public.applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'manager' OR profiles.role = 'admin')
  )
);

-- Chat policies
CREATE POLICY "Users can view their own chats"
ON public.chats
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own chats"
ON public.chats
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Chat messages policies
CREATE POLICY "Users can view messages from their chats"
ON public.chat_messages
FOR SELECT
USING (
  chat_id IN (
    SELECT id FROM public.chats
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert messages to their chats"
ON public.chat_messages
FOR INSERT
WITH CHECK (
  chat_id IN (
    SELECT id FROM public.chats
    WHERE user_id = auth.uid()
  )
); 