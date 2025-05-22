-- Create application_payments table to track monthly payment data
CREATE TABLE IF NOT EXISTS application_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES agent_applications(id) ON DELETE CASCADE,
  month_number INTEGER NOT NULL CHECK (month_number >= 1 AND month_number <= 12),
  payment_status TEXT CHECK (payment_status IN ('PAID', 'MISSED', 'PENDING', 'NSF', 'WAIVED', NULL)),
  payment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (application_id, month_number)
);

-- Create index for faster lookup by application_id
CREATE INDEX IF NOT EXISTS application_payments_application_id_idx ON application_payments(application_id);

-- Enable Row Level Security
ALTER TABLE application_payments ENABLE ROW LEVEL SECURITY;

-- Create policies to allow agents to access their own application payment data
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

-- Allow managers and admins broader access
CREATE POLICY "Managers can access all application payments"
ON application_payments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'manager' OR profiles.role = 'admin')
  )
);

-- Trigger to update agent_applications month columns for backward compatibility
CREATE OR REPLACE FUNCTION update_application_month_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the corresponding MONTH column in agent_applications
  EXECUTE format('
    UPDATE agent_applications 
    SET "MONTH %s" = $1,
        updated_at = NOW()
    WHERE id = $2
  ', NEW.month_number)
  USING NEW.payment_status, NEW.application_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER application_payment_update_month_columns
AFTER INSERT OR UPDATE ON application_payments
FOR EACH ROW
EXECUTE FUNCTION update_application_month_columns(); 