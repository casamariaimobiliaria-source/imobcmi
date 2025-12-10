-- Update RPC: create_new_organization to handle orphans
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
  orphan_id UUID;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Generate slug
  slug_val := lower(regexp_replace(company_name, '[^a-zA-Z0-9]', '-', 'g'));
  
  -- Check for orphan user record (same email, different ID)
  SELECT id INTO orphan_id FROM public.users WHERE email = user_email AND id != current_user_id;
  
  IF orphan_id IS NOT NULL THEN
    -- Delete orphan's membership
    DELETE FROM organization_members WHERE user_id = orphan_id;
    -- Delete orphan user
    DELETE FROM public.users WHERE id = orphan_id;
  END IF;

  -- Create Organization
  INSERT INTO organizations (name, slug)
  VALUES (company_name, slug_val)
  RETURNING id INTO new_org_id;
  
  -- Add User as Owner in organization_members
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (new_org_id, current_user_id, 'owner');
  
  -- Update User Name in auth.users
  UPDATE auth.users
  SET raw_user_meta_data = 
    COALESCE(raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object('name', user_name)
  WHERE id = current_user_id;

  -- Sync with public.users
  INSERT INTO public.users (id, name, email, role, organization_id)
  VALUES (current_user_id, user_name, user_email, 'admin', new_org_id)
  ON CONFLICT (id) DO UPDATE
  SET organization_id = EXCLUDED.organization_id,
      name = EXCLUDED.name,
      role = 'admin';

  RETURN new_org_id;
END;
$$;
