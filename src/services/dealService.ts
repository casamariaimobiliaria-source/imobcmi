import { supabase } from '../supabaseClient';
import { Deal } from '../types';
import { TablesInsert } from '../supabase_types';
import { auditService } from './auditService';

export const dealService = {
    getDeals: async (organizationId?: string): Promise<Deal[]> => {
        let query = supabase
            .from('deals')
            .select('*');

        if (organizationId) {
            query = query.eq('organization_id', organizationId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(d => ({
            id: d.id,
            title: d.title,
            value: Number(d.value),
            stage: d.stage as any,
            client_id: d.client_id ?? undefined,
            agent_id: d.agent_id ?? undefined,
            created_at: d.created_at,
            updated_at: d.updated_at,
            organizationId: d.organization_id ?? undefined
        }));
    },

    addDeal: async (deal: Partial<Deal> & { organizationId?: string }): Promise<Deal> => {
        const { data, error } = await supabase
            .from('deals')
            .insert([{
                title: deal.title ?? 'Novo Negócio',
                value: deal.value ?? 0,
                stage: deal.stage ?? 'lead',
                client_id: deal.client_id ?? null,
                agent_id: deal.agent_id ?? null,
                organization_id: deal.organizationId ?? null
            }])
            .select()
            .single();

        if (error) throw error;

        await auditService.logAction({
            action: 'CREATE',
            resource_type: 'DEAL',
            resource_id: data.id,
            new_data: data,
            organization_id: deal.organizationId
        });

        return {
            id: data.id,
            title: data.title,
            value: Number(data.value),
            stage: data.stage as any,
            client_id: data.client_id ?? undefined,
            agent_id: data.agent_id ?? undefined,
            created_at: data.created_at,
            updated_at: data.updated_at,
            organizationId: data.organization_id ?? undefined
        };
    },

    updateDeal: async (id: string, deal: Partial<Deal>): Promise<void> => {
        const updateData: any = {
            updated_at: new Date().toISOString()
        };

        if (deal.title !== undefined) updateData.title = deal.title;
        if (deal.value !== undefined) updateData.value = deal.value;
        if (deal.stage !== undefined) updateData.stage = deal.stage;
        if (deal.client_id !== undefined) updateData.client_id = deal.client_id;
        if (deal.agent_id !== undefined) updateData.agent_id = deal.agent_id;

        const { error } = await supabase
            .from('deals')
            .update(updateData)
            .eq('id', id);

        if (error) throw error;

        await auditService.logAction({
            action: 'UPDATE',
            resource_type: 'DEAL',
            resource_id: id,
            new_data: updateData
        });
    },

    deleteDeal: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('deals')
            .delete()
            .eq('id', id);

        if (error) throw error;

        await auditService.logAction({
            action: 'DELETE',
            resource_type: 'DEAL',
            resource_id: id
        });
    }
};
