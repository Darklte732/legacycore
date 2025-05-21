-- Migration to add street_address column to agent_applications table

-- Add the street_address column
ALTER TABLE public.agent_applications
ADD COLUMN IF NOT EXISTS street_address TEXT;

-- Set default values for existing records
UPDATE public.agent_applications
SET street_address = 'Unknown'
WHERE street_address IS NULL OR street_address = '';

-- Update the check_required_application_fields function
CREATE OR REPLACE FUNCTION public.check_required_application_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Check Policy Number
  IF NEW.policy_number IS NULL OR NEW.policy_number = '' THEN
    RAISE EXCEPTION 'Policy number is required';
  END IF;

  -- Check Effective Policy Date
  IF NEW.effective_policy_date IS NULL THEN
    RAISE EXCEPTION 'Effective policy date is required';
  END IF;

  -- Check Paid Status
  IF NEW.paid_status IS NULL OR NEW.paid_status = '' THEN
    RAISE EXCEPTION 'Paid status is required';
  END IF;

  -- Check Date of Birth
  IF NEW.date_of_birth IS NULL THEN
    RAISE EXCEPTION 'Date of birth is required';
  END IF;

  -- Check Street Address
  IF NEW.street_address IS NULL OR NEW.street_address = '' THEN
    RAISE EXCEPTION 'Street address is required';
  END IF;

  -- Check City
  IF NEW.city IS NULL OR NEW.city = '' THEN
    RAISE EXCEPTION 'City is required';
  END IF;

  -- Check State
  IF NEW.client_state IS NULL OR NEW.client_state = '' THEN
    RAISE EXCEPTION 'State is required';
  END IF;

  -- Check ZIP
  IF NEW.zip IS NULL OR NEW.zip = '' THEN
    RAISE EXCEPTION 'ZIP code is required';
  END IF;

  -- Check Gender
  IF NEW.gender IS NULL OR NEW.gender = '' THEN
    RAISE EXCEPTION 'Gender is required';
  END IF;

  -- Check Primary Beneficiary
  IF NEW.primary_beneficiary IS NULL OR NEW.primary_beneficiary = '' THEN
    RAISE EXCEPTION 'Primary beneficiary is required';
  END IF;

  -- Check Relationship to Insured
  IF NEW.relationship_to_insured IS NULL OR NEW.relationship_to_insured = '' THEN
    RAISE EXCEPTION 'Relationship to insured is required';
  END IF;

  -- Check Tobacco Use
  IF NEW.tobacco_nicotine_use IS NULL THEN
    RAISE EXCEPTION 'Tobacco/nicotine use status is required';
  END IF;

  -- Check Height & Weight
  IF NEW.height_feet IS NULL THEN
    RAISE EXCEPTION 'Height (feet) is required';
  END IF;
  
  IF NEW.height_inches IS NULL THEN
    RAISE EXCEPTION 'Height (inches) is required';
  END IF;
  
  IF NEW.weight_lbs IS NULL THEN
    RAISE EXCEPTION 'Weight is required';
  END IF;

  -- Check Medical Conditions
  IF NEW.medical_lung_disease IS NULL THEN
    RAISE EXCEPTION 'Medical condition (lung disease) status is required';
  END IF;
  
  IF NEW.medical_heart_attack IS NULL THEN
    RAISE EXCEPTION 'Medical condition (heart attack) status is required';
  END IF;
  
  IF NEW.medical_heart_failure IS NULL THEN
    RAISE EXCEPTION 'Medical condition (heart failure) status is required';
  END IF;
  
  IF NEW.medical_blood_clots IS NULL THEN
    RAISE EXCEPTION 'Medical condition (blood clots) status is required';
  END IF;
  
  IF NEW.medical_cancer IS NULL THEN
    RAISE EXCEPTION 'Medical condition (cancer) status is required';
  END IF;
  
  IF NEW.medical_diabetes IS NULL THEN
    RAISE EXCEPTION 'Medical condition (diabetes) status is required';
  END IF;
  
  IF NEW.medical_high_bp IS NULL THEN
    RAISE EXCEPTION 'Medical condition (high blood pressure) status is required';
  END IF;
  
  IF NEW.medical_high_cholesterol IS NULL THEN
    RAISE EXCEPTION 'Medical condition (high cholesterol) status is required';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Comment to explain the update
COMMENT ON FUNCTION public.check_required_application_fields() 
IS 'Checks that all required fields are present in agent applications, including street address'; 