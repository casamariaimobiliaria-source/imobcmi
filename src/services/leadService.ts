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
            organizationId: l.organization_id || ''
        }));
    },

    addLead: async (lead: Partial<Lead> & { organizationId?: string }): Promise<Lead> => {
        const payload: any = {
            name: lead.nome,
            nome: lead.nome,
            telefone: lead.telefone || null,
            email: lead.email || null,
            midia: lead.midia || null,
            data_compra: lead.data_compra || null,
            corretor: lead.corretor || null,
            empreendimento: lead.empreendimento || null,
            temperatura: lead.temperatura || null,
            status: lead.status || 'novo',
            historico: lead.historico || null,
            user_id: lead.user_id || null,
            proximo_contato: lead.proximo_contato || null,
        };

        if (lead.organizationId) {
            payload.organization_id = lead.organizationId;
        }

        const { data, error } = await supabase
            .from('leads')
            .insert([payload])
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
            organizationId: savedData.organization_id
        };
    },

    updateLead: async (id: string, lead: Partial<Lead>): Promise<void> => {
        const updateData: any = {
            ...lead,
            name: lead.nome // Mantém a coluna name que o banco exige
        };

        if (lead.organizationId) {
            updateData.organization_id = lead.organizationId;
        }

        // Remove o campo organizationId antes de enviar para o Supabase
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
