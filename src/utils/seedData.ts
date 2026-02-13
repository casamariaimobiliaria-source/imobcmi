
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';

// Helpers
const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

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

export const populateDatabase = async (userId: string, organizationId?: string) => {
    try {
        toast.info('Iniciando população de dados...');

        // 1. Create Developers
        const devIds: string[] = [];
        for (const devName of developersList.slice(0, 5)) {
            const { data: existing } = await supabase.from('developers').select('id').eq('companyName', devName).single();
            if (existing) {
                devIds.push(existing.id);
            } else {
                const { data } = await supabase.from('developers').insert({
                    company_name: devName,
                    cnpj: generateCPF().replace('-', '/0001-'),
                    contact_name: generateName(),
                    email: `contato@${devName.toLowerCase()}.com`,
                    phone: generatePhone(),
                    status: 'active',
                    city: 'São Paulo',
                    state: 'SP',
                    organization_id: organizationId
                }).select().single();
                if (data) devIds.push(data.id);
            }
        }

        // 2. Create Clients
        const clientIds: string[] = [];
        for (let i = 0; i < 10; i++) {
            const { data } = await supabase.from('clients').insert({
                name: generateName(),
                email: `client${randomInt(1, 10000)}@example.com`,
                phone: generatePhone(),
                cpf_cnpj: generateCPF(),
                status: 'active',
                city: 'São Paulo',
                state: 'SP',
                notes: 'Cliente Demo',
                organization_id: organizationId
            }).select().single();
            if (data) clientIds.push(data.id);
        }

        // 3. Create Leads
        const leadStatuses = ['Novo', 'Em Atendimento', 'Agendou Visita', 'Proposta', 'Venda', 'Cancelado'];
        const leadTemperatures = ['Quente', 'Morno', 'Frio'];

        for (let i = 0; i < 20; i++) {
            await supabase.from('leads').insert({
                nome: generateName(),
                telefone: generatePhone(),
                email: `lead${randomInt(1, 10000)}@test.com`,
                midia: getRandom(midias),
                // corretor: ... we don't have other agents, use current user name if possible, or leave blank
                empreendimento: getRandom(developersList),
                temperatura: getRandom(leadTemperatures),
                status: getRandom(leadStatuses),
                created_at: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000).toISOString(),
                organizationId
            });
        }

        // 4. Create Categories
        const categories = ['Comissão Venda', 'Aluguel Escritório', 'Marketing', 'Software', 'Ajuda de Custo', 'Impostos'];
        for (const cat of categories) {
            await supabase.from('categories').upsert({
                name: cat,
                type: cat === 'Comissão Venda' ? 'income' : 'expense',
                organizationId
            }, { onConflict: 'name' });
        }

        // 5. Create Sales & Financials
        if (devIds.length > 0 && clientIds.length > 0) {
            for (let i = 0; i < 10; i++) {
                const devId = getRandom(devIds);
                const clientId = getRandom(clientIds);
                const saleValue = randomInt(300, 2000) * 1000;
                const commission = saleValue * 0.05;
                const date = new Date(Date.now() - randomInt(0, 90) * 24 * 60 * 60 * 1000);

                const { data: sale } = await supabase.from('sales').insert({
                    date: date.toISOString(),
                    developerId: devId,
                    projectId: 'Residencial ' + getRandom(bairros),
                    unit: `${randomInt(1, 25)}0${randomInt(1, 4)}`,
                    agentId: userId, // Assign to current user
                    clientId: clientId,
                    leadSource: getRandom(midias),
                    unitValue: saleValue,
                    commissionPercent: 5,
                    grossCommission: commission,
                    taxPercent: 6,
                    taxValue: commission * 0.06,
                    miscExpensesDescription: 'Taxa Adm',
                    miscExpensesValue: 150,
                    agentSplitPercent: 40,
                    agentCommission: (commission * 0.94 - 150) * 0.40,
                    agencyCommission: (commission * 0.94 - 150) * 0.60,
                    status: 'approved',
                    organizationId
                }).select().single();

                if (sale) {
                    // Income
                    await supabase.from('financial_records').insert({
                        description: `Comissão Venda ${sale.unit}`,
                        type: 'income',
                        amount: commission,
                        date: date.toISOString(),
                        dueDate: date.toISOString(),
                        status: 'paid',
                        category: 'Comissão Venda',
                        organizationId
                    });
                }
            }
        }

        // Expenses
        for (let i = 0; i < 3; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);

            await supabase.from('financial_records').insert({
                description: 'Aluguel Escritório Demo',
                type: 'expense',
                amount: 2500,
                date: d.toISOString(),
                dueDate: d.toISOString(),
                status: 'paid',
                category: 'Aluguel Escritório',
                organizationId
            });
        }

        toast.success('Banco de dados populado com sucesso! Atualize a página.');
    } catch (error: any) {
        console.error('Populate error:', error);
        toast.error('Erro ao popular dados: ' + error.message);
    }
};
