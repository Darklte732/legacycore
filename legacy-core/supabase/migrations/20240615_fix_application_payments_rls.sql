-- Fix RLS policies for application_payments table

-- First drop any existing policies
DROP POLICY IF EXISTS "Users can view their own application payments" ON application_payments;
DROP POLICY IF EXISTS "Users can update their own application payments" ON application_payments;
DROP POLICY IF EXISTS "Users can insert their own application payments" ON application_payments;
DROP POLICY IF EXISTS "Users can delete their own application payments" ON application_payments;
DROP POLICY IF EXISTS "Managers can access all application payments" ON application_payments;

-- Recreate proper RLS policies
CREATE POLICY "Users can view their own application payments"
ON application_payments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM agent_applications
    WHERE agent_applications.id = application_payments.application_id
    AND agent_applications.agent_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own application payments"
ON application_payments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM agent_applications
    WHERE agent_applications.id = application_payments.application_id
    AND agent_applications.agent_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own application payments"
ON application_payments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM agent_applications
    WHERE agent_applications.id = application_payments.application_id
    AND agent_applications.agent_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own application payments"
ON application_payments
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM agent_applications
    WHERE agent_applications.id = application_payments.application_id
    AND agent_applications.agent_id = auth.uid()
  )
);

-- Give managers and admins full access
CREATE POLICY "Managers and admins can access all application payments"
ON application_payments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'manager' OR profiles.role = 'admin')
  )
);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON application_payments TO authenticated;

-- Check if the agent_applications table has proper ownership permissions
ALTER TABLE agent_applications OWNER TO postgres;
GRANT SELECT, INSERT, UPDATE, DELETE ON agent_applications TO authenticated; 