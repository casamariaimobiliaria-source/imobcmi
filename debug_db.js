
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

async function debug() {
    console.log('Fetching projects...');
    const { data: projects, error: projectsError } = await supabase.from('projects').select('*');
    if (projectsError) {
        console.error('Error fetching projects:', projectsError);
    } else {
        console.log('Projects found:', projects.length);
        console.table(projects);
    }

    console.log('Fetching sales...');
    const { data: sales, error: salesError } = await supabase.from('sales').select('*').limit(5);
    if (salesError) {
        console.error('Error fetching sales:', salesError);
    } else {
        console.log('Sales sample:', sales.length);
        console.table(sales.map(s => ({ id: s.id, projectId: s.project_id })));
    }
}

debug();
