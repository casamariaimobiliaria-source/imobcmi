
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Manually parse .env
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.trim();
    }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEventInsert() {
    console.log('Testing event insertion...');

    const testEvent = {
        title: 'Debug Event',
        description: 'Test description',
        start_time: new Date().toISOString(),
        end_time: new Date(new Date().getTime() + 3600000).toISOString(), // +1 hour
        type: 'task',
        // We leave agent_id and client_id null for this basic test to avoid FK issues if IDs don't exist
        agent_id: null,
        client_id: null
    };

    const { data, error } = await supabase
        .from('events')
        .insert([testEvent])
        .select();

    if (error) {
        console.error('❌ Error inserting event:', error);
    } else {
        console.log('✅ Event inserted successfully:', data);

        // Cleanup
        if (data && data[0]?.id) {
            const { error: delError } = await supabase
                .from('events')
                .delete()
                .eq('id', data[0].id);

            if (delError) console.error('Error cleaning up:', delError);
            else console.log('✅ Cleanup successful');
        }
    }
}

testEventInsert();
