-- Create calendar_events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_all_day BOOLEAN DEFAULT FALSE,
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Admin can see all events
CREATE POLICY "Admins can see all events" ON public.calendar_events
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Managers can see events for their organization
CREATE POLICY "Managers can see organization events" ON public.calendar_events
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'manager' AND
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- Agents can see events for their organization
CREATE POLICY "Agents can see organization events" ON public.calendar_events
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'agent' AND
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- Creator can update their own events
CREATE POLICY "Users can update their own events" ON public.calendar_events
  FOR UPDATE USING (
    organizer_id = auth.uid()
  );

-- Admins can update any event
CREATE POLICY "Admins can update any event" ON public.calendar_events
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Managers can update events in their organization
CREATE POLICY "Managers can update organization events" ON public.calendar_events
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'manager' AND
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- Creator can insert events
CREATE POLICY "Users can insert their own events" ON public.calendar_events
  FOR INSERT WITH CHECK (
    organizer_id = auth.uid()
  );

-- Creator can delete their own events
CREATE POLICY "Users can delete their own events" ON public.calendar_events
  FOR DELETE USING (
    organizer_id = auth.uid()
  );

-- Admins can delete any event
CREATE POLICY "Admins can delete any event" ON public.calendar_events
  FOR DELETE USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Managers can delete events in their organization
CREATE POLICY "Managers can delete organization events" ON public.calendar_events
  FOR DELETE USING (
    auth.jwt() ->> 'role' = 'manager' AND
    organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- Add "updated_at" trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON public.calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at(); 