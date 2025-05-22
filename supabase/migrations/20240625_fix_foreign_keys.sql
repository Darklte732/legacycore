-- Add foreign key relationships between tables

-- First, add foreign key from applications to profiles (agent_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'applications_agent_id_fkey'
  ) THEN
    ALTER TABLE applications 
    ADD CONSTRAINT applications_agent_id_fkey 
    FOREIGN KEY (agent_id) REFERENCES profiles(id);
  END IF;
END$$;

-- Add foreign key from agent_applications to profiles (agent_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'agent_applications_agent_id_fkey'
  ) THEN
    ALTER TABLE agent_applications 
    ADD CONSTRAINT agent_applications_agent_id_fkey 
    FOREIGN KEY (agent_id) REFERENCES profiles(id);
  END IF;
END$$;

-- Add get_all_applications function with a better implementation
-- that doesn't hit the 100 argument limit
DROP FUNCTION IF EXISTS get_all_applications();
CREATE OR REPLACE FUNCTION get_all_applications()
RETURNS SETOF agent_applications AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM agent_applications;
END;
$$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON FUNCTION get_all_applications IS 'Get all applications without hitting the 100 argument limit'; 