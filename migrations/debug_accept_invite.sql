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

  -- Verify email matches (Case insensitive and trimmed)
  SELECT email INTO user_email FROM auth.users WHERE id = current_user_id;
  
  -- DEBUG: Log the values (visible in Supabase logs if enabled)
  -- RAISE NOTICE 'Checking invite for user: %, invite email: %', user_email, invite_record.email;

  IF LOWER(TRIM(user_email)) != LOWER(TRIM(invite_record.email)) THEN
    RAISE EXCEPTION 'Erro de validação: O e-mail do usuário (%) não corresponde ao e-mail do convite (%). Verifique se está usando a conta correta.', user_email, invite_record.email;
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
