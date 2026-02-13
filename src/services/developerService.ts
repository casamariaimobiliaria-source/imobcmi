import { supabase } from '../supabaseClient';
import { Developer } from '../types';
import { Tables, TablesInsert } from '../supabase_types';
import { z } from 'zod';

import { developerSchema } from '../schemas';

type DeveloperRow = Tables<'developers'>;
type DeveloperInsert = TablesInsert<'developers'>;

export const developerService = {
    async getDevelopers(organizationId?: string): Promise<Developer[]> {
        let query = supabase.from('developers').select('*');
        if (organizationId) {
            query = query.eq('organization_id', organizationId);
        }
        const { data, error } = await query;
        if (error) throw error;

        return (data || []).map((d: DeveloperRow) => ({
            id: d.id,
            companyName: d.company_name || 'Empresa Sem Nome',
            cnpj: d.cnpj || '',
            contactName: d.contact_name || '',
            email: d.email || '',
            phone: d.phone || '',
            status: (d.status as any) || 'active',
            notes: d.notes || '',
            zipCode: d.zip_code || '',
            address: d.address || '',
            number: d.number || '',
            neighborhood: d.neighborhood || '',
            city: d.city || '',
            state: d.state || '',
            organizationId: d.organization_id || undefined
        }));
    },

    async addDeveloper(developer: Developer): Promise<Developer> {
        developerSchema.parse(developer);

        const insertData: DeveloperInsert = {
            company_name: developer.companyName,
            cnpj: developer.cnpj,
            contact_name: developer.contactName,
            email: developer.email,
            phone: developer.phone,
            status: developer.status,
            notes: developer.notes,
            zip_code: developer.zipCode,
            address: developer.address,
            number: developer.number,
            neighborhood: developer.neighborhood,
            city: developer.city,
            state: developer.state,
            organization_id: developer.organizationId
        };

        const { data, error } = await supabase.from('developers').insert([insertData]).select().single();

        if (error) throw error;
        return { ...developer, id: data.id };
    },

    async updateDeveloper(id: string, devData: Partial<Developer>): Promise<void> {
        const updateData: any = {};
        if (devData.companyName) updateData.company_name = devData.companyName;
        if (devData.cnpj) updateData.cnpj = devData.cnpj;
        if (devData.status) updateData.status = devData.status;

        const { error } = await supabase.from('developers').update(updateData).eq('id', id);
        if (error) throw error;
    },

    async deleteDeveloper(id: string): Promise<void> {
        const { error } = await supabase.from('developers').delete().eq('id', id);
        if (error) throw error;
    }
};
