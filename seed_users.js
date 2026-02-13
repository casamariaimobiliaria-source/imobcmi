
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

async function seedAdmin() {
    const adminEmail = 'admin@imobcmi.com';

    console.log(`Checking if admin exists in public.users...`);

    // Check if already exists
    const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', adminEmail)
        .single();

    if (existingUser) {
        console.log('Admin user already exists in public.users:', existingUser);

        // Ensure role is admin
        if (existingUser.role !== 'admin') {
            console.log('Updating role to admin...');
            const { error } = await supabase
                .from('users')
                .update({ role: 'admin' })
                .eq('id', existingUser.id);

            if (error) console.error('Error updating role:', error);
            else console.log('Role updated.');
        }
    } else {
        console.log('Creating admin user in public.users...');
        const { data, error } = await supabase
            .from('users')
            .insert([{
                name: 'Admin Gestor',
                email: adminEmail,
                role: 'admin'
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating admin:', error);
        } else {
            console.log('Admin created successfully:', data);
        }
    }
}

seedAdmin();
