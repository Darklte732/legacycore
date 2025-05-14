-- Create function to get attachment with download URLs
-- This will be used to generate temporary URLs for downloading attachments
CREATE OR REPLACE FUNCTION public.get_attachment_download_url(
  p_attachment_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_file_path TEXT;
  v_url TEXT;
BEGIN
  -- Get the file path from the attachment
  SELECT 
    CASE 
      WHEN file_url LIKE '%/storage/v1/object/public/%' THEN 
        REPLACE(
          REPLACE(file_url, storage.get_bucket_url('attachments'), ''),
          '/storage/v1/object/public/attachments/', ''
        )
      ELSE NULL
    END INTO v_file_path
  FROM attachments
  WHERE id = p_attachment_id;
  
  -- If no file path found, return null
  IF v_file_path IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Create a signed URL that expires in 60 minutes (3600 seconds)
  SELECT storage.get_presigned_url('attachments', v_file_path, 3600)
  INTO v_url;
  
  RETURN v_url;
END;
$$;

-- Function to get recent attachments with download URLs for an agent
CREATE OR REPLACE FUNCTION public.get_recent_attachments_with_urls(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  attachment_type TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  content TEXT,
  carrier_name TEXT,
  carrier_id UUID,
  policy_number TEXT,
  reason TEXT,
  amount NUMERIC,
  effective_date TIMESTAMP WITH TIME ZONE,
  insured_name TEXT,
  status TEXT,
  return_date TIMESTAMP WITH TIME ZONE,
  second_return_date TIMESTAMP WITH TIME ZONE,
  product_name TEXT,
  download_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH attachment_details AS (
    SELECT
      a.id,
      a.title,
      a.description,
      a.attachment_type,
      a.file_url,
      a.file_name,
      a.file_size,
      a.content,
      c.name AS carrier_name,
      a.carrier_id,
      ad.policy_number,
      ad.reason,
      ad.amount,
      -- Cast date to timestamp with timezone to match return type
      ad.effective_date::TIMESTAMP WITH TIME ZONE,
      ad.insured_name,
      ad.status,
      ad.return_date,
      ad.second_return_date,
      ad.product_name,
      a.created_at,
      a.updated_at
    FROM
      attachments a
    LEFT JOIN
      carriers c ON a.carrier_id = c.id
    LEFT JOIN
      attachment_details ad ON a.id = ad.attachment_id
    WHERE
      a.user_id = p_user_id
    ORDER BY
      a.created_at DESC
    LIMIT p_limit
  )
  SELECT
    ad.id,
    ad.title,
    ad.description,
    ad.attachment_type,
    ad.file_url,
    ad.file_name,
    ad.file_size,
    ad.content,
    ad.carrier_name,
    ad.carrier_id,
    ad.policy_number,
    ad.reason,
    ad.amount,
    ad.effective_date,
    ad.insured_name,
    ad.status,
    ad.return_date,
    ad.second_return_date,
    ad.product_name,
    -- Generate download URL for each attachment
    CASE WHEN ad.file_url IS NOT NULL THEN
      public.get_attachment_download_url(ad.id)
    ELSE
      NULL
    END AS download_url,
    ad.created_at,
    ad.updated_at
  FROM
    attachment_details ad;
END;
$$; 