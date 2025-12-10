
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

async function testRpcSync() {
    console.log('--- Starting RPC Sync Test ---');

    const timestamp = Date.now();
    const email = `sync_user_${timestamp}@test.com`;
    const password = 'password123';
    const orgName = `Sync Org ${timestamp}`;

    // 1. Create User
    console.log(`Creating User: ${email}`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
    });

    if (authError) {
        console.error('Error creating user:', authError);
        return;
    }

    // Login to get session
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

    // 2. Call RPC
    console.log(`Calling create_new_organization: ${orgName}`);
    const { data: orgId, error: rpcError } = await client.rpc('create_new_organization', {
        company_name: orgName,
        user_name: 'Sync User',
        user_email: email
    });

    if (rpcError) {
        console.error('Error calling RPC:', rpcError);
        return;
    }
    console.log('Org Created:', orgId);

    // 3. Verify public.users
    console.log('Verifying public.users...');
    // We need to use admin client (supabase) to check public.users if RLS prevents reading other users (though we are checking our own user, so client might work if RLS allows reading own user)
    // Let's use the authenticated client first.
    const { data: userProfile, error: profileError } = await client
        .from('users')
        .select('*')
        .eq('id', sessionData.user.id)
        .single();

    if (profileError) {
        console.error('Error fetching user profile:', profileError);
    } else {
        console.log('User Profile:', userProfile);
        if (userProfile.organization_id === orgId) {
            console.log('SUCCESS: organization_id synced correctly!');
        } else {
            console.error('FAILURE: organization_id mismatch!', userProfile.organization_id, 'vs', orgId);
        }
    }
}

testRpcSync();
