-- Create application_payments table for tracking monthly payment history
CREATE TABLE IF NOT EXISTS application_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES agent_applications(id) ON DELETE CASCADE,
  month_number INTEGER NOT NULL CHECK (month_number BETWEEN 1 AND 12),
  payment_status TEXT,
  payment_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Create a unique constraint to ensure only one record per application per month
  UNIQUE (application_id, month_number)
);

-- Add RLS policies for application_payments
ALTER TABLE application_payments ENABLE ROW LEVEL SECURITY;

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_application_payments_updated_at
  BEFORE UPDATE
  ON application_payments
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Create a function to update payment status and policy health
CREATE OR REPLACE FUNCTION update_payment_and_policy_health(
  p_application_id UUID,
  p_month_number INTEGER,
  p_payment_status TEXT,
  p_payment_date DATE DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_missing_count INTEGER;
  v_total_payments INTEGER;
  v_health TEXT;
BEGIN
  -- Insert or update the payment record
  INSERT INTO application_payments (
    application_id, 
    month_number, 
    payment_status, 
    payment_date
  )
  VALUES (
    p_application_id, 
    p_month_number, 
    p_payment_status, 
    p_payment_date
  )
  ON CONFLICT (application_id, month_number) 
  DO UPDATE SET
    payment_status = p_payment_status,
    payment_date = p_payment_date,
    updated_at = now();
    
  -- Count missed payments
  SELECT COUNT(*) INTO v_missing_count
  FROM application_payments
  WHERE application_id = p_application_id
    AND payment_status = 'MISSED';
    
  -- Count total payments that have been set
  SELECT COUNT(*) INTO v_total_payments
  FROM application_payments
  WHERE application_id = p_application_id
    AND payment_status IS NOT NULL;
    
  -- Determine health status
  IF v_missing_count >= 2 THEN
    v_health := 'Critical';
  ELSIF v_missing_count = 1 THEN
    v_health := 'Needs Attention';
  ELSIF v_total_payments >= 3 AND v_missing_count = 0 THEN
    v_health := 'Healthy';
  ELSE
    v_health := 'New';
  END IF;
  
  -- Update policy health in agent_applications table
  UPDATE agent_applications
  SET policy_health = v_health,
      updated_at = now()
  WHERE id = p_application_id;
  
END;
$$ LANGUAGE plpgsql; 