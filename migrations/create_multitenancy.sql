-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create organization_members table
CREATE TABLE IF NOT EXISTS organization_members (
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (organization_id, user_id)
);

-- Add organization_id to existing tables
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name IN ('projects', 'sales', 'clients', 'agents', 'developers', 'events', 'financial_records', 'categories')
  LOOP
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id)', t);
  END LOOP;
END $$;

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Organizations: Users can view organizations they are members of
CREATE POLICY "Users can view own organizations" ON organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  );

-- Organization Members: Users can view members of their organizations
CREATE POLICY "Users can view members of own organizations" ON organization_members
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  );

-- Data Tables: Generic policy for data tables
-- Note: We need to create this for each table. 
-- For simplicity in this script, we'll define a helper function or just repeat the policy creation.
-- Let's repeat for clarity and safety.

CREATE POLICY "Users can view own projects" ON projects
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view own sales" ON sales
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view own clients" ON clients
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view own agents" ON agents
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view own developers" ON developers
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view own events" ON events
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view own financial_records" ON financial_records
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view own categories" ON categories
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  );


-- Create RPC: create_new_organization
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
  
  -- Add User as Owner
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (new_org_id, current_user_id, 'owner');
  
  -- Update User Name (optional, if not set)
  UPDATE auth.users
  SET raw_user_meta_data = 
    COALESCE(raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object('name', user_name)
  WHERE id = current_user_id;

  RETURN new_org_id;
END;
$$;
