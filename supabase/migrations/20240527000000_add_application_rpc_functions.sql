-- Create RPC function to get application with client data
CREATE OR REPLACE FUNCTION get_application_with_client(app_id UUID)
RETURNS SETOF json AS $$
BEGIN
  RETURN QUERY
  SELECT json_build_object(
    'id', a.id,
    'proposed_insured', a.proposed_insured,
    'agent_id', a.agent_id,
    'client_email', COALESCE(c.email, a.client_email),
    'client_phone_number', COALESCE(c.phone, a.client_phone_number),
    'client_state', COALESCE(c.state, a.client_state),
    'city', c.city,
    'zip', c.zip_code,
    'street_address', c.address_line1,
    'date_of_birth', c.date_of_birth,
    'policy_number', a.policy_number,
    'policy_submit_date', a.policy_submit_date,
    'carrier', a.carrier,
    'product', a.product,
    'monthly_premium', a.monthly_premium,
    'ap', a.ap,
    'status', a.status,
    'policy_health', a.policy_health,
    'paid_status', a.paid_status,
    'closed_by_agent', a.closed_by_agent,
    'point_of_sale', a.point_of_sale,
    'pms_form_filled_out', a.pms_form_filled_out,
    'split_with', a.split_with,
    'split_percentage', a.split_percentage,
    'effective_policy_date', a.effective_policy_date,
    'effective_policy_status', a.effective_policy_status,
    'notes', a.notes,
    'notes_for_pay', a.notes_for_pay,
    'paid_split', a.paid_split,
    'commission_status', a.commission_status,
    'commission_paid_date', a.commission_paid_date,
    'policy_payment_cycle', a.policy_payment_cycle,
    'commission_amount', a.commission_amount,
    'created_at', a.created_at,
    'updated_at', a.updated_at,
    'organization_id', a.organization_id,
    'month_1', a.month_1,
    'month_2', a.month_2,
    'month_3', a.month_3,
    'month_4', a.month_4,
    'month_5', a.month_5,
    'month_6', a.month_6,
    'month_7', a.month_7,
    'month_8', a.month_8,
    'month_9', a.month_9,
    'month_10', a.month_10,
    'month_11', a.month_11,
    'month_12', a.month_12
  )
  FROM agent_applications a
  LEFT JOIN clients c ON a.agent_id = c.id
  WHERE a.id = app_id;
END;
$$ LANGUAGE plpgsql;

-- Create simpler fetch application function as a fallback
CREATE OR REPLACE FUNCTION fetch_application_direct(app_id UUID)
RETURNS SETOF agent_applications AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM agent_applications
  WHERE id = app_id;
END;
$$ LANGUAGE plpgsql; 