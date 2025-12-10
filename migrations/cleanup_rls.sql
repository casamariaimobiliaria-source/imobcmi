
-- Cleanup Permissive RLS Policies
-- These policies were likely default or legacy and compromise multi-tenancy security.

-- Users
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert access for all users" ON users;
DROP POLICY IF EXISTS "Enable update access for all users" ON users;
DROP POLICY IF EXISTS "Enable delete access for all users" ON users;

-- Projects
DROP POLICY IF EXISTS "Enable read access for all users" ON projects;
DROP POLICY IF EXISTS "Enable insert access for all users" ON projects;
DROP POLICY IF EXISTS "Enable update access for all users" ON projects;
DROP POLICY IF EXISTS "Enable delete access for all users" ON projects;

-- Agents
DROP POLICY IF EXISTS "Enable read access for all users" ON agents;
DROP POLICY IF EXISTS "Enable insert access for all users" ON agents;
DROP POLICY IF EXISTS "Enable update access for all users" ON agents;
DROP POLICY IF EXISTS "Enable delete access for all users" ON agents;

-- Clients
DROP POLICY IF EXISTS "Enable read access for all users" ON clients;
DROP POLICY IF EXISTS "Enable insert access for all users" ON clients;
DROP POLICY IF EXISTS "Enable update access for all users" ON clients;
DROP POLICY IF EXISTS "Enable delete access for all users" ON clients;

-- Developers
DROP POLICY IF EXISTS "Enable read access for all users" ON developers;
DROP POLICY IF EXISTS "Enable insert access for all users" ON developers;
DROP POLICY IF EXISTS "Enable update access for all users" ON developers;
DROP POLICY IF EXISTS "Enable delete access for all users" ON developers;

-- Sales
DROP POLICY IF EXISTS "Enable read access for all users" ON sales;
DROP POLICY IF EXISTS "Enable insert access for all users" ON sales;
DROP POLICY IF EXISTS "Enable update access for all users" ON sales;
DROP POLICY IF EXISTS "Enable delete access for all users" ON sales;

-- Financial Records
DROP POLICY IF EXISTS "Enable read access for all users" ON financial_records;
DROP POLICY IF EXISTS "Enable insert access for all users" ON financial_records;
DROP POLICY IF EXISTS "Enable update access for all users" ON financial_records;
DROP POLICY IF EXISTS "Enable delete access for all users" ON financial_records;

-- Categories
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Enable insert access for all users" ON categories;
DROP POLICY IF EXISTS "Enable update access for all users" ON categories;
DROP POLICY IF EXISTS "Enable delete access for all users" ON categories;

-- Events
DROP POLICY IF EXISTS "Enable read access for all users" ON events;
DROP POLICY IF EXISTS "Enable insert access for all users" ON events;
DROP POLICY IF EXISTS "Enable update access for all users" ON events;
DROP POLICY IF EXISTS "Enable delete access for all users" ON events;
