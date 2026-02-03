
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env');

let supabaseUrl = '';
let supabaseKey = '';

try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const lines = envFile.split('\n');
    for (const line of lines) {
        if (line.trim().startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
        if (line.trim().startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
    }
} catch (e) { }

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const tables = ['users', 'agents', 'developers', 'clients', 'leads', 'sales', 'financial_records', 'deals'];
    for (const t of tables) {
        const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
        if (error) console.log(`${t}: Error ${error.message}`);
        else console.log(`${t}: ${count}`);
    }
}
check();
