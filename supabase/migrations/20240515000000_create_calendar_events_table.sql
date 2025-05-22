-- Create a calendar_events table for storing events
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  organizer_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  organization_id UUID REFERENCES public.organizations(id),
  is_all_day BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  attendees JSONB DEFAULT '[]'::jsonb
);

-- Add RLS policies
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Policy for admins to see all events
CREATE POLICY "Admins can see all events" 
ON public.calendar_events 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Policy for managers to see their organization's events
CREATE POLICY "Managers can see their organization's events" 
ON public.calendar_events 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'manager'
    AND profiles.organization_id = calendar_events.organization_id
  )
);

-- Policy for agents to see their organization's events
CREATE POLICY "Agents can see their organization's events" 
ON public.calendar_events 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'agent'
    AND profiles.organization_id = calendar_events.organization_id
  )
);

-- Policies for creating events
CREATE POLICY "Users can create their own events" 
ON public.calendar_events 
FOR INSERT 
WITH CHECK (auth.uid() = organizer_id);

-- Policies for updating events
CREATE POLICY "Admins can update all events" 
ON public.calendar_events 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Managers can update their organization's events" 
ON public.calendar_events 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'manager'
    AND profiles.organization_id = calendar_events.organization_id
  )
);

CREATE POLICY "Users can update their own events" 
ON public.calendar_events 
FOR UPDATE 
USING (auth.uid() = organizer_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at timestamp
CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON public.calendar_events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add index for better performance
CREATE INDEX idx_calendar_events_organizer_id ON public.calendar_events(organizer_id);
CREATE INDEX idx_calendar_events_organization_id ON public.calendar_events(organization_id);
CREATE INDEX idx_calendar_events_start_time ON public.calendar_events(start_time); 