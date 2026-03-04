import { supabase } from '../supabaseClient';
import { Agent } from '../types';
import { Tables, TablesInsert } from '../supabase_types';
import { agentSchema } from '../schemas';

type AgentRow = Tables<'agents'>;
type AgentInsert = TablesInsert<'agents'>;

export const agentService = {
    async getAgents(organizationId?: string): Promise<Agent[]> {
        let query = supabase.from('agents').select('*');
        if (organizationId) {
            query = query.eq('organization_id', organizationId);
        }
        const { data, error } = await query;
        if (error) throw error;

        return (data || []).map((a: AgentRow) => ({
            id: a.id,
            name: a.name || 'Sem Nome',
            cpf: a.cpf || '',
            email: a.email || '',
            phone: a.phone || '',
            creci: a.creci || '',
            zipCode: a.zip_code || '',
            address: a.address || '',
            number: a.number || '',
            neighborhood: a.neighborhood || '',
            city: a.city || '',
            state: a.state || '',
            pixKey: a.pix_key || '',
            bankDetails: a.bank_details || '',
            status: (a.status as any) || 'active',
            totalCommissionEarned: a.total_commission_earned || 0,
            totalCommissionPaid: a.total_commission_paid || 0,
            specialties: a.specialties || [],
            previous_agencies: a.previous_agencies || '',
            experience_years: a.experience_years || 0,
            cnai: a.cnai || '',
            instagram_url: a.instagram_url || '',
            linkedin_url: a.linkedin_url || '',
            birth_date: a.birth_date || '',
            admission_date: a.admission_date || '',
            emergency_contact: a.emergency_contact || '',
            organizationId: a.organization_id || undefined
        }));
    },

    async addAgent(agent: Agent): Promise<Agent> {
        const validatedAgent = agentSchema.parse(agent);

        const insertData: AgentInsert = {
            name: validatedAgent.name,
            cpf: validatedAgent.cpf,
            email: validatedAgent.email,
            phone: validatedAgent.phone,
            creci: validatedAgent.creci,
            status: validatedAgent.status,
            zip_code: validatedAgent.zipCode,
            address: validatedAgent.address,
            number: validatedAgent.number,
            neighborhood: validatedAgent.neighborhood,
            city: validatedAgent.city,
            state: validatedAgent.state,
            pix_key: (agent as any).pixKey,
            bank_details: (agent as any).bankDetails,
            specialties: validatedAgent.specialties,
            previous_agencies: validatedAgent.previous_agencies,
            experience_years: validatedAgent.experience_years,
            cnai: validatedAgent.cnai,
            instagram_url: validatedAgent.instagram_url,
            linkedin_url: validatedAgent.linkedin_url,
            birth_date: validatedAgent.birth_date,
            admission_date: validatedAgent.admission_date,
            emergency_contact: validatedAgent.emergency_contact,
            organization_id: agent.organizationId
        };

        const { data, error } = await supabase
            .from('agents')
            .insert([insertData])
            .select()
            .single();

        if (error) throw error;
        return { ...agent, id: data.id };
    },

    async updateAgent(id: string, agentData: Partial<Agent>): Promise<void> {
        const validatedUpdate = agentSchema.partial().parse(agentData);

        const updateData: any = { ...validatedUpdate };

        // Remove Zod format differences and remap them to Supabase format
        updateData.zip_code = validatedUpdate.zipCode; delete updateData.zipCode;
        updateData.pix_key = (agentData as any).pixKey;
        updateData.bank_details = (agentData as any).bankDetails;

        // Limpar chaves undefined para não corromper query
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        const { error } = await supabase.from('agents').update(updateData).eq('id', id);
        if (error) throw error;
    },

    async deleteAgent(id: string): Promise<void> {
        const { error } = await supabase.from('agents').delete().eq('id', id);
        if (error) throw error;
    }
};
