
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

async function testMultitenancy() {
    console.log('--- Starting Multi-tenancy Test ---');

    const timestamp = Date.now();
    const emailA = 'test_user_a@example.com';
    const password = 'password123';
    const orgNameA = `Org A ${timestamp}`;

    const emailB = 'test_user_b@example.com';
    const orgNameB = `Org B ${timestamp}`;

    // 1. Login User A
    console.log(`Logging in User A: ${emailA}`);
    const { data: sessionA, error: loginErrorA } = await supabase.auth.signInWithPassword({
        email: emailA,
        password: password
    });

    if (loginErrorA) {
        console.error('Error logging in User A:', loginErrorA);
        return;
    }

    const clientA = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: `Bearer ${sessionA.session.access_token}` } }
    });

    // 2. Create Org A
    console.log(`Creating Org A: ${orgNameA}`);
    const { data: orgIdA, error: rpcErrorA } = await clientA.rpc('create_new_organization', {
        company_name: orgNameA,
        user_name: 'User A',
        user_email: emailA
    });

    if (rpcErrorA) {
        console.error('Error creating Org A:', rpcErrorA);
        // Continue anyway to see if we can still test isolation if org exists
    } else {
        console.log('Org A Created:', orgIdA);
    }

    // 3. Login User B
    console.log(`Logging in User B: ${emailB}`);
    const { data: sessionB, error: loginErrorB } = await supabase.auth.signInWithPassword({
        email: emailB,
        password: password
    });

    if (loginErrorB) {
        console.error('Error logging in User B:', loginErrorB);
        return;
    }

    const clientB = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: `Bearer ${sessionB.session.access_token}` } }
    });

    // 4. Create Org B
    console.log(`Creating Org B: ${orgNameB}`);
    const { data: orgIdB, error: rpcErrorB } = await clientB.rpc('create_new_organization', {
        company_name: orgNameB,
        user_name: 'User B',
        user_email: emailB
    });

    if (rpcErrorB) {
        console.error('Error creating Org B:', rpcErrorB);
    } else {
        console.log('Org B Created:', orgIdB);
    }

    // 5. User A inserts data (Project)
    console.log('User A creating a project...');
    // We need orgIdA. If creation failed (e.g. already exists), we need to fetch it.
    // But for now let's assume it succeeded or we can't easily fetch without listing.
    // If org creation failed, orgIdA is undefined.
    // Let's try to fetch orgs for User A.
    const { data: orgsA } = await clientA.from('organizations').select('id').limit(1);
    const activeOrgIdA = orgIdA || (orgsA && orgsA[0]?.id);

    if (!activeOrgIdA) {
        console.error('Could not get Org ID for User A');
        return;
    }

    const { data: projectA, error: projErrorA } = await clientA
        .from('projects')
        .insert({ name: 'Project A', organization_id: activeOrgIdA })
        .select()
        .single();

    if (projErrorA) {
        console.error('Error creating Project A:', projErrorA);
    } else {
        console.log('Project A created:', projectA.id);
    }

    // 6. Verify User A can see it
    const { data: fetchA } = await clientA.from('projects').select('*');
    console.log('User A sees projects:', fetchA ? fetchA.length : 0);

    // 7. Verify User B CANNOT see it
    const { data: fetchB } = await clientB.from('projects').select('*');
    console.log('User B sees projects:', fetchB ? fetchB.length : 0);

    if (fetchB && fetchB.length === 0) {
        console.log('SUCCESS: User B cannot see User A\'s data.');
    } else {
        console.error('FAILURE: User B can see data!', fetchB);
    }
}

testMultitenancy();
