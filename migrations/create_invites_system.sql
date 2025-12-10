-- Create organization_invites table
CREATE TABLE IF NOT EXISTS organization_invites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'agent',
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- Enable RLS
ALTER TABLE organization_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Invites
-- Admins can view/create/delete invites for their org
CREATE POLICY "Admins can view invites for own org" ON organization_invites
  FOR SELECT USING (
    organization_id IN (SELECT get_user_org_ids())
  );

CREATE POLICY "Admins can insert invites for own org" ON organization_invites
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT get_user_org_ids())
  );

CREATE POLICY "Admins can delete invites for own org" ON organization_invites
  FOR DELETE USING (
    organization_id IN (SELECT get_user_org_ids())
  );

-- RPC to Create Invite (Optional, but helps with token generation logic if needed, or just do in frontend)
-- Let's do it in frontend for simplicity, but we need a secure way to ensure the user is admin of that org.
-- The RLS `WITH CHECK` handles the permission.

-- RPC to Accept Invite
-- This is called AFTER the user signs up.
CREATE OR REPLACE FUNCTION accept_invite(invite_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite_record RECORD;
  current_user_id UUID;
  user_email TEXT;
BEGIN
  current_user_id := auth.uid();
  
  -- Get invite
  SELECT * INTO invite_record FROM organization_invites 
  WHERE token = invite_token AND status = 'pending' AND expires_at > NOW();
  
  IF invite_record IS NULL THEN
    RAISE EXCEPTION 'Convite inválido ou expirado.';
  END IF;

  -- Verify email matches (Optional: strictly enforce email match?)
  -- Ideally yes, but if the user signs up with a different email, maybe we block?
  -- Let's enforce email match for security.
  SELECT email INTO user_email FROM auth.users WHERE id = current_user_id;
  
  IF user_email != invite_record.email THEN
    RAISE EXCEPTION 'O e-mail do usuário não corresponde ao convite.';
  END IF;

  -- Add to organization_members
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (invite_record.organization_id, current_user_id, invite_record.role);

  -- Sync public.users
  INSERT INTO public.users (id, name, email, role, organization_id)
  VALUES (
    current_user_id, 
    (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = current_user_id), 
    user_email, 
    invite_record.role, 
    invite_record.organization_id
  )
  ON CONFLICT (id) DO UPDATE
  SET organization_id = EXCLUDED.organization_id,
      role = EXCLUDED.role;

  -- Mark invite as accepted
  UPDATE organization_invites SET status = 'accepted' WHERE id = invite_record.id;

  RETURN TRUE;
END;
$$;
