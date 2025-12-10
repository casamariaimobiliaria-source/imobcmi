-- Fix RLS Recursion

-- Create helper function to get user's organizations (bypassing RLS)
CREATE OR REPLACE FUNCTION get_user_org_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT organization_id FROM organization_members WHERE user_id = auth.uid();
$$;

-- Drop existing policies that might be recursive
DROP POLICY IF EXISTS "Users can view members of own organizations" ON organization_members;
DROP POLICY IF EXISTS "Users can view own organizations" ON organizations;
-- Drop data table policies to update them to use the function (optional but cleaner/faster)
-- Actually, the data table policies used the subquery which is fine if it doesn't recurse on the data table itself.
-- But the subquery `SELECT organization_id FROM organization_members ...` triggers RLS on `organization_members`.
-- So ALL policies using that subquery will trigger the recursion if `organization_members` RLS is recursive.
-- By using the function, we avoid triggering RLS on `organization_members` from within the policy check.

-- Update Organization Members Policy
CREATE POLICY "Users can view members of own organizations" ON organization_members
  FOR SELECT USING (
    organization_id IN (SELECT get_user_org_ids())
  );

-- Update Organizations Policy
CREATE POLICY "Users can view own organizations" ON organizations
  FOR SELECT USING (
    id IN (SELECT get_user_org_ids())
  );

-- Update Data Table Policies
-- We need to drop and recreate them to use the function for better performance and to avoid any potential issues,
-- although technically if they call the subquery, they just hit `organization_members` RLS.
-- If `organization_members` RLS is fixed (using the function), then the subquery in data tables might be fine?
-- No, if the subquery is `SELECT ... FROM organization_members`, it triggers RLS.
-- If `organization_members` RLS uses `get_user_org_ids` (which bypasses RLS), then it's fine.
-- BUT, it's better to use the function directly in all policies to avoid the overhead of the subquery + RLS check.

DROP POLICY IF EXISTS "Users can view own projects" ON projects;
CREATE POLICY "Users can view own projects" ON projects
  FOR ALL USING (
    organization_id IN (SELECT get_user_org_ids())
  );

DROP POLICY IF EXISTS "Users can view own sales" ON sales;
CREATE POLICY "Users can view own sales" ON sales
  FOR ALL USING (
    organization_id IN (SELECT get_user_org_ids())
  );

DROP POLICY IF EXISTS "Users can view own clients" ON clients;
CREATE POLICY "Users can view own clients" ON clients
  FOR ALL USING (
    organization_id IN (SELECT get_user_org_ids())
  );

DROP POLICY IF EXISTS "Users can view own agents" ON agents;
CREATE POLICY "Users can view own agents" ON agents
  FOR ALL USING (
    organization_id IN (SELECT get_user_org_ids())
  );

DROP POLICY IF EXISTS "Users can view own developers" ON developers;
CREATE POLICY "Users can view own developers" ON developers
  FOR ALL USING (
    organization_id IN (SELECT get_user_org_ids())
  );

DROP POLICY IF EXISTS "Users can view own events" ON events;
CREATE POLICY "Users can view own events" ON events
  FOR ALL USING (
    organization_id IN (SELECT get_user_org_ids())
  );

DROP POLICY IF EXISTS "Users can view own financial_records" ON financial_records;
CREATE POLICY "Users can view own financial_records" ON financial_records
  FOR ALL USING (
    organization_id IN (SELECT get_user_org_ids())
  );

DROP POLICY IF EXISTS "Users can view own categories" ON categories;
CREATE POLICY "Users can view own categories" ON categories
  FOR ALL USING (
    organization_id IN (SELECT get_user_org_ids())
  );
