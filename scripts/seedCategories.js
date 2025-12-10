import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NjA4NTcsImV4cCI6MjA3OTEzNjg1N30.KnYyOgTALeRO4RMAQ19B6M3ZEYC8KZrt6BnS31us2Kk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('Fetching organizations...');
    const { data: orgs, error: orgsError } = await supabase.from('organizations').select('id');

    if (orgsError) {
        console.error('Error fetching orgs:', orgsError);
        return;
    }

    console.log(`Found ${orgs.length} organizations.`);

    const categories = [
        { name: 'Receita Vendas', type: 'income' },
        { name: 'Consultoria', type: 'income' },
        { name: 'Outras Receitas', type: 'income' },
        { name: 'Comissão', type: 'expense' },
        { name: 'Marketing', type: 'expense' },
        { name: 'Aluguel', type: 'expense' },
        { name: 'Energia', type: 'expense' },
        { name: 'Água', type: 'expense' },
        { name: 'Internet', type: 'expense' },
        { name: 'Salários', type: 'expense' },
        { name: 'Impostos', type: 'expense' },
        { name: 'Outras Despesas', type: 'expense' }
    ];

    for (const org of orgs) {
        console.log(`Processing org: ${org.id}`);
        for (const cat of categories) {
            // Check if exists
            const { data: existing } = await supabase
                .from('categories')
                .select('id')
                .eq('organization_id', org.id)
                .eq('name', cat.name)
                .single();

            if (!existing) {
                console.log(`Creating ${cat.name} for ${org.id}`);
                const { error } = await supabase.from('categories').insert({
                    name: cat.name,
                    type: cat.type,
                    organization_id: org.id
                });
                if (error) console.error(`Error creating ${cat.name}:`, error);
            } else {
                console.log(`Skipping ${cat.name} (exists)`);
            }
        }
    }
    console.log('Done!');
}

seed();
