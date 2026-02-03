import { supabase } from '../supabaseClient';
import { Lead } from '../types';
import { auditService } from './auditService';

export const leadService = {
    getLeads: async (organizationId?: string): Promise<Lead[]> => {
        let query = supabase
            .from('leads')
            .select('*');

        if (organizationId) {
            query = query.eq('organization_id', organizationId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((l: any) => ({
            ...l,
            nome: l.name || '',
            telefone: l.phone || '',
            midia: l.source || '',
            proximo_contato: l.next_contact || '',
            organizationId: l.organization_id || ''
        }));
    },

    addLead: async (lead: Partial<Lead> & { organizationId?: string }): Promise<Lead> => {
        const { data, error } = await supabase
            .from('leads')
            .insert([{
                name: lead.nome,
                phone: lead.telefone,
                email: lead.email,
                source: lead.midia,
                data_compra: lead.data_compra || null,
                corretor: lead.corretor,
                empreendimento: lead.empreendimento,
                temperatura: lead.temperatura,
                status: lead.status || 'novo',
                historico: lead.historico,
                user_id: lead.user_id,
                next_contact: lead.proximo_contato || null,
                organization_id: lead.organizationId
            }] as any[])
            .select()
            .single();

        if (error) throw error;

        await auditService.logAction({
            action: 'CREATE',
            resource_type: 'LEAD',
            resource_id: data.id,
            new_data: data,
            organization_id: lead.organizationId
        });

        const savedData = data as any;
        return {
            ...savedData,
            nome: savedData.name,
            telefone: savedData.phone,
            midia: savedData.source,
            proximo_contato: savedData.next_contact,
            organizationId: savedData.organization_id
        };
    },

    updateLead: async (id: string, lead: Partial<Lead>): Promise<void> => {
        const updateData: any = {
            ...lead,
            name: lead.nome,
            phone: lead.telefone,
            source: lead.midia,
            next_contact: lead.proximo_contato || null,
            data_compra: lead.data_compra || null,
            organization_id: lead.organizationId
        };

        // Remove os campos de mapeamento do frontend para não dar conflito no Postgres
        delete updateData.nome;
        delete updateData.telefone;
        delete updateData.midia;
        delete updateData.proximo_contato;
        delete updateData.organizationId;

        const { error } = await supabase
            .from('leads')
            .update(updateData)
            .eq('id', id);

        if (error) throw error;

        await auditService.logAction({
            action: 'UPDATE',
            resource_type: 'LEAD',
            resource_id: id,
            new_data: lead
        });
    },

    deleteLead: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('leads')
            .delete()
            .eq('id', id);

        if (error) throw error;

        await auditService.logAction({
            action: 'DELETE',
            resource_type: 'LEAD',
            resource_id: id
        });
    }
};
