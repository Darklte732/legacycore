-- Enable Row Level Security (RLS) for agent_applications table
ALTER TABLE agent_applications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select their own rows
CREATE POLICY "Users can view their own applications"
ON agent_applications
FOR SELECT
USING (agent_id = auth.uid());

-- Create policy to allow users to delete their own rows
CREATE POLICY "Users can delete their own applications"
ON agent_applications
FOR DELETE
USING (agent_id = auth.uid());

-- Create policy to allow users to update their own rows
CREATE POLICY "Users can update their own applications"
ON agent_applications
FOR UPDATE
USING (agent_id = auth.uid());

-- Create policy to allow users to insert applications with their user ID
CREATE POLICY "Users can insert their own applications"
ON agent_applications
FOR INSERT
WITH CHECK (agent_id = auth.uid());

-- Allow managers and admins broader access
CREATE POLICY "Managers can see all applications"
ON agent_applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'manager' OR profiles.role = 'admin')
  )
);

CREATE POLICY "Managers can update all applications"
ON agent_applications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'manager' OR profiles.role = 'admin')
  )
);

CREATE POLICY "Managers can delete all applications"
ON agent_applications
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'manager' OR profiles.role = 'admin')
  )
); 