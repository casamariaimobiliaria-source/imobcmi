-- Update RPC: create_new_organization to sync public.users
DROP FUNCTION IF EXISTS create_new_organization(text, text, text);

CREATE OR REPLACE FUNCTION create_new_organization(company_name TEXT, user_name TEXT, user_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_org_id UUID;
  current_user_id UUID;
  slug_val TEXT;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Generate slug (simple version)
  slug_val := lower(regexp_replace(company_name, '[^a-zA-Z0-9]', '-', 'g'));
  
  -- Create Organization
  INSERT INTO organizations (name, slug)
  VALUES (company_name, slug_val)
  RETURNING id INTO new_org_id;
  
  -- Add User as Owner in organization_members
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (new_org_id, current_user_id, 'owner');
  
  -- Update User Name in auth.users (optional)
  UPDATE auth.users
  SET raw_user_meta_data = 
    COALESCE(raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object('name', user_name)
  WHERE id = current_user_id;

  -- Sync with public.users
  -- We upsert to ensure the user record exists and has the correct organization_id
  INSERT INTO public.users (id, name, email, role, organization_id)
  VALUES (current_user_id, user_name, user_email, 'admin', new_org_id)
  ON CONFLICT (id) DO UPDATE
  SET organization_id = EXCLUDED.organization_id,
      name = EXCLUDED.name, -- Update name just in case
      role = 'admin'; -- Ensure they are admin

  RETURN new_org_id;
END;
$$;
