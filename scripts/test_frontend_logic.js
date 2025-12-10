
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env');

let supabaseUrl = '';
let supabaseKey = '';

try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const lines = envFile.split('\n');
    for (const line of lines) {
        if (line.startsWith('VITE_SUPABASE_URL=')) {
            supabaseUrl = line.split('=')[1].trim();
        }
        if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
            supabaseKey = line.split('=')[1].trim();
        }
    }
} catch (e) {
    console.error('Error reading .env file:', e);
}

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFrontendLogic() {
    console.log('--- Starting Frontend Logic Test ---');

    const timestamp = Date.now();
    const email = `fe_user_${timestamp}@test.com`;
    const password = 'password123';
    const orgName = `FE Org ${timestamp}`;

    // 1. Create User & Org
    console.log(`Creating User: ${email}`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
    });

    if (authError) {
        console.error('Error creating user:', authError);
        return;
    }

    // Login
    const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (loginError) {
        console.error('Error logging in:', loginError);
        return;
    }

    const client = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: `Bearer ${sessionData.session.access_token}` } }
    });

    // Create Org via RPC
    console.log(`Creating Org: ${orgName}`);
    const { data: orgId, error: rpcError } = await client.rpc('create_new_organization', {
        company_name: orgName,
        user_name: 'FE User',
        user_email: email
    });

    if (rpcError) {
        console.error('Error creating org:', rpcError);
        return;
    }
    console.log('Org Created:', orgId);

    // 2. Simulate AppProvider Logic

    // Simulate getting user profile to get organization_id (RPC should have synced it)
    const { data: userProfile } = await client.from('users').select('*').eq('id', sessionData.user.id).single();
    const userOrgId = userProfile.organization_id;

    if (userOrgId !== orgId) {
        console.error('Mismatch in organization_id:', userOrgId, 'vs', orgId);
        return;
    }

    // Simulate addSale -> Create Project
    const projectName = `Project ${timestamp}`;
    console.log(`Creating Project: ${projectName} with org_id: ${userOrgId}`);

    const { data: newProject, error: projError } = await client.from('projects').insert([{
        name: projectName,
        organization_id: userOrgId // This is what we added to AppProvider
    }]).select().single();

    if (projError) {
        console.error('Error creating project:', projError);
    } else {
        console.log('Project Created:', newProject.id, 'Org ID:', newProject.organization_id);
    }

    // Simulate addCategory
    const catName = `Category ${timestamp}`;
    console.log(`Creating Category: ${catName}`);

    const { data: newCat, error: catError } = await client.from('categories').insert([{
        name: catName,
        type: 'income',
        organization_id: userOrgId // This is what we added to AppProvider
    }]).select().single();

    if (catError) {
        console.error('Error creating category:', catError);
    } else {
        console.log('Category Created:', newCat.id, 'Org ID:', newCat.organization_id);
    }

    // Verify isolation (optional, but good practice)
    // Create another client (User B) and verify they can't see this project
    // ... skipping for brevity as we already tested isolation. 
    // This test focuses on "Can we create with org_id and does it work?"
}

testFrontendLogic();
