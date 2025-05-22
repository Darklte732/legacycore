-- Drop existing function first
DROP FUNCTION IF EXISTS get_manager_applications(UUID);

-- Create a function to get applications for a manager's agents
CREATE OR REPLACE FUNCTION get_manager_applications(manager_id UUID)
RETURNS SETOF agent_applications AS $$
BEGIN
  RETURN QUERY
  SELECT a.*
  FROM agent_applications a
  JOIN profiles p ON a.agent_id = p.id
  WHERE p.manager_id = manager_id;
END;
$$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON FUNCTION get_manager_applications IS 'Get all applications for agents managed by the specified manager';