
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- CONFIG ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env');

let supabaseUrl = '';
let supabaseKey = '';

try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const lines = envFile.split('\n');
    for (const line of lines) {
        if (line.trim().startsWith('VITE_SUPABASE_URL=')) {
            supabaseUrl = line.split('=')[1].trim();
        }
        if (line.trim().startsWith('VITE_SUPABASE_ANON_KEY=')) {
            supabaseKey = line.split('=')[1].trim();
        }
    }
} catch (e) {
    console.error('Error reading .env file:', e);
}

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- HELPERS ---
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => (Math.random() * (max - min) + min);

const firstNames = ['Ana', 'Bruno', 'Carlos', 'Daniela', 'Eduardo', 'Fernanda', 'Gabriel', 'Helena', 'Igor', 'Julia', 'Lucas', 'Mariana', 'Nicolas', 'Olivia', 'Pedro', 'Rafaela', 'Samuel', 'Tatiana', 'Vitor', 'Yasmin'];
const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida'];
const developersList = ['Cyrela', 'MRV', 'Gafisa', 'Even', 'Tenda', 'Direcional', 'Eztec', 'Pacaembu', 'Moura Dubeux', 'Cury'];
const midias = ['Instagram', 'Facebook', 'Google Ads', 'Indicação', 'Portal Imóveis', 'Outdoor', 'Linkedin'];
const bairros = ['Centro', 'Jardins', 'Bela Vista', 'Moema', 'Pinheiros', 'Vila Mariana', 'Perdizes', 'Itaim Bibi'];

function generateName() {
    return `${getRandom(firstNames)} ${getRandom(lastNames)}`;
}

function generateCPF() {
    return `${randomInt(100, 999)}.${randomInt(100, 999)}.${randomInt(100, 999)}-${randomInt(10, 99)}`;
}

function generatePhone() {
    return `(11) 9${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`;
}

async function populate() {
    console.log('🚀 Iniciando script de população de dados...');

    // 1. Get or Create Organization (Optional, if applicable)
    // Assuming single-tenant or using user's org. For now, skipping org specific constraint if not strict.

    // 2. Create Users/Agents
    console.log('Creating Agents...');
    const agents = [];
    for (let i = 0; i < 5; i++) {
        const name = generateName();
        const email = `${name.toLowerCase().replace(' ', '.')}@imobcmi.com`;

        // Check if exists
        const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();

        if (existing) {
            agents.push({ ...existing, name }); // Keep name for ref
        } else {
            const { data, error } = await supabase.from('users').insert({
                name: name,
                email: email,
                role: 'agent'
            }).select().single();

            if (data) agents.push(data);
            else console.error('Failed to create agent:', error);
        }
    }

    // Also add entries to 'agents' table if it exists separately from users (based on types, it seems so)
    const agentRecords = [];
    for (const user of agents) {
        try {
            // Check if already in agents table
            const { data: existingAgent } = await supabase.from('agents').select('id').eq('email', user.email).single();
            if (existingAgent) {
                agentRecords.push(existingAgent);
                continue;
            }

            const { data: newAgent } = await supabase.from('agents').insert({
                name: user.name,
                email: user.email,
                phone: generatePhone(),
                creci: `${randomInt(10000, 99999)}-F`,
                cpf: generateCPF(),
                status: 'active',
                zipCode: '01001-000',
                address: 'Av Paulista',
                number: String(randomInt(100, 2000)),
                neighborhood: 'Bela Vista',
                city: 'São Paulo',
                state: 'SP',
                pixKey: user.email,
                bankDetails: 'Banco Inter',
                totalCommissionEarned: 0,
                totalCommissionPaid: 0
            }).select().single();
            if (newAgent) agentRecords.push(newAgent);
        } catch (e) { console.log('Skipping agent table insert', e.message); }
    }

    // 3. Create Developers
    console.log('Creating Developers...');
    const developerRecords = [];
    for (const devName of developersList.slice(0, 5)) { // Top 5
        const { data: existing } = await supabase.from('developers').select('id').eq('companyName', devName).single();
        if (existing) {
            developerRecords.push(existing);
        } else {
            const { data } = await supabase.from('developers').insert({
                companyName: devName,
                cnpj: generateCPF().replace('-', '/0001-'), // Fake CNPJ
                contactName: generateName(),
                email: `contato@${devName.toLowerCase()}.com`,
                phone: generatePhone(),
                status: 'active',
                city: 'São Paulo',
                state: 'SP'
            }).select().single();
            if (data) developerRecords.push(data);
        }
    }

    // 4. Create Clients
    console.log('Creating Clients...');
    const clientRecords = [];
    for (let i = 0; i < 20; i++) {
        const { data } = await supabase.from('clients').insert({
            name: generateName(),
            email: `client${i}@example.com`,
            phone: generatePhone(),
            cpfCnpj: generateCPF(),
            status: 'active',
            city: 'São Paulo',
            state: 'SP',
            notes: 'Cliente gerado automaticamente.'
        }).select().single();
        if (data) clientRecords.push(data);
    }

    // 5. Create Leads
    console.log('Creating Leads...');
    const leadStatuses = ['Novo', 'Em Atendimento', 'Agendou Visita', 'Proposta', 'Venda', 'Cancelado'];
    const leadTemperatures = ['Quente', 'Morno', 'Frio'];

    if (agents.length > 0) {
        for (let i = 0; i < 30; i++) {
            const agent = getRandom(agents);
            await supabase.from('leads').insert({
                nome: generateName(),
                phone: generatePhone(), // Using 'phone' as per supabase insert likely, though types said 'telefone'
                // Let's check types.ts... Lead interface has 'nome', 'telefone', 'email'.
                // Ideally we should match database columns. Assuming DB cols match types or standard snake_case.
                // If types.ts says `telefone`, I'll try that.
                // Wait, types.ts says `telefone?: string`, `nome: string`.
                // But in step 5 logic I should stick to DB columns. Let's try both or standard english if fails?
                // Actually looking at `seed_users.js` it uses English/JS keys.
                // Let's assume the DB has either English or Portuguese columns.
                // Based on types.ts interface Lead: { nome, telefone, midia ... }
                // I will use those keys.
                nome: generateName(),
                telefone: generatePhone(),
                email: `lead${i}@test.com`,
                midia: getRandom(midias),
                corretor: agent.name, // Storing name as per Lead interface? Or ID? Interface says string.
                empreendimento: getRandom(developersList), // Using dev name as project for simplicity
                temperatura: getRandom(leadTemperatures),
                status: getRandom(leadStatuses),
                created_at: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString()
            });
        }
    }

    // 6. Create Sales & Financials
    console.log('Creating Sales & Financial Records...');
    // Create Categories
    const categories = ['Comissão Venda', 'Aluguel Escritório', 'Marketing', 'Software', 'Ajuda de Custo', 'Impostos'];
    const categoryRecords = [];
    for (const cat of categories) {
        const { data } = await supabase.from('categories').upsert({
            name: cat,
            type: cat === 'Comissão Venda' ? 'income' : 'expense'
        }, { onConflict: 'name' }).select().single();
        if (data) categoryRecords.push(data);
    }

    if (agents.length > 0 && developerRecords.length > 0 && clientRecords.length > 0) {
        for (let i = 0; i < 15; i++) {
            const agent = getRandom(agents);
            const dev = getRandom(developerRecords);
            const client = getRandom(clientRecords);
            const saleValue = randomInt(300, 2000) * 1000; // 300k to 2M
            const commission = saleValue * 0.05; // 5%
            const date = new Date(Date.now() - randomInt(0, 90) * 24 * 60 * 60 * 1000); // Last 90 days

            // Create Sale
            const { data: sale } = await supabase.from('sales').insert({
                date: date.toISOString(),
                developerId: dev.id,
                projectId: 'Residencial ' + getRandom(bairros),
                unit: `${randomInt(1, 25)}0${randomInt(1, 4)}`,
                agentId: agentRecords.find(a => a.email === agent.email)?.id || agent.id, // Try to find Agent ID, else User ID
                clientId: client.id,
                leadSource: getRandom(midias),
                unitValue: saleValue,
                commissionPercent: 5,
                grossCommission: commission,
                taxPercent: 6,
                taxValue: commission * 0.06,
                miscExpensesDescription: 'Taxa Adm',
                miscExpensesValue: 150,
                agentSplitPercent: 40, // 40% to agent
                agentCommission: (commission * 0.94 - 150) * 0.40,
                agencyCommission: (commission * 0.94 - 150) * 0.60,
                status: 'approved'
            }).select().single();

            // Create Financial Records relating to this sale (Income)
            if (sale) {
                await supabase.from('financial_records').insert({
                    description: `Comissão Venda ${sale.unit}`,
                    type: 'income',
                    amount: commission,
                    date: date.toISOString(),
                    dueDate: date.toISOString(),
                    status: 'paid',
                    category: 'Comissão Venda'
                });

                // Expense (Agent split)
                await supabase.from('financial_records').insert({
                    description: `Pagamento Comissão ${agent.name}`,
                    type: 'expense',
                    amount: (commission * 0.94 - 150) * 0.40,
                    date: date.toISOString(),
                    dueDate: date.toISOString(),
                    status: 'pending',
                    category: 'Comissão Venda'
                });
            }
        }
    }

    // Create some fixed expenses
    console.log('Creating Expenses...');
    for (let i = 0; i < 3; i++) {
        // Last 3 months
        const d = new Date();
        d.setMonth(d.getMonth() - i);

        await supabase.from('financial_records').insert({
            description: 'Aluguel Escritório',
            type: 'expense',
            amount: 2500,
            date: d.toISOString(),
            dueDate: d.toISOString(),
            status: 'paid',
            category: 'Aluguel Escritório'
        });

        await supabase.from('financial_records').insert({
            description: 'Marketing Digital Ads',
            type: 'expense',
            amount: 1500,
            date: d.toISOString(),
            dueDate: d.toISOString(),
            status: 'paid',
            category: 'Marketing'
        });
    }

    console.log('✅ População de dados concluída!');
}

populate().catch(console.error);
