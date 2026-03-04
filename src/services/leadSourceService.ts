import { supabase } from '../supabaseClient';
import { LeadSource } from '../types';

export const leadSourceService = {
    getLeadSources: async (organizationId?: string): Promise<LeadSource[]> => {
        let query = supabase.from('lead_sources').select('*').order('name', { ascending: true });

        if (organizationId) {
            query = query.eq('organization_id', organizationId);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Error fetching lead sources:', error);
            throw error;
        }

        return data.map((item: any) => ({
            ...item,
            organizationId: item.organization_id // normalize case
        })) as LeadSource[];
    },

    addLeadSource: async (source: LeadSource): Promise<LeadSource> => {
        const { id, organizationId, ...rest } = source;
        // ensure db fields
        const insertData: any = {
            ...rest,
            organization_id: organizationId
        };

        if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
            insertData.id = id;
        }

        const { data, error } = await supabase
            .from('lead_sources')
            .insert([insertData])
            .select()
            .single();

        if (error) {
            console.error('Error adding lead source:', error);
            throw error;
        }
        return { ...data, organizationId: data.organization_id } as LeadSource;
    },

    updateLeadSource: async (id: string, source: Partial<LeadSource>): Promise<void> => {
        const { organizationId, ...rest } = source;
        const updateData: any = { ...rest };
        if (organizationId) updateData.organization_id = organizationId;

        const { error } = await supabase
            .from('lead_sources')
            .update(updateData)
            .eq('id', id);

        if (error) {
            console.error('Error updating lead source:', error);
            throw error;
        }
    },

    deleteLeadSource: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('lead_sources')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting lead source:', error);
            throw error;
        }
    }
};
