import { supabase } from '../supabaseClient';
import { Client } from '../types';
import { Tables, TablesInsert } from '../supabase_types';
import { z } from 'zod';

import { clientSchema } from '../schemas';

type ClientRow = Tables<'clients'>;
type ClientInsert = TablesInsert<'clients'>;

export const clientService = {
    async getClients(organizationId?: string): Promise<Client[]> {
        let query = supabase.from('clients').select('*');
        if (organizationId) {
            query = query.eq('organization_id', organizationId);
        }
        const { data, error } = await query;
        if (error) throw error;

        return (data || []).map((c: ClientRow) => ({
            id: c.id,
            name: c.name || 'Cliente Sem Nome',
            cpfCnpj: c.cpf_cnpj || '',
            email: c.email || '',
            phone: c.phone || '',
            birthDate: c.birth_date || '',
            status: (c.status as any) || 'active',
            notes: c.notes || '',
            zipCode: c.zip_code || '',
            address: c.address || '',
            number: c.number || '',
            neighborhood: c.neighborhood || '',
            city: c.city || '',
            state: c.state || '',
            preferences: c.preferences as any,
            organizationId: c.organization_id || undefined
        }));
    },

    async addClient(client: Client): Promise<Client> {
        // Validação básica
        clientSchema.parse(client);

        const insertData: ClientInsert = {
            name: client.name,
            cpf_cnpj: client.cpfCnpj,
            email: client.email,
            phone: client.phone,
            birth_date: client.birthDate,
            status: client.status,
            notes: client.notes,
            zip_code: client.zipCode,
            address: client.address,
            number: client.number,
            neighborhood: client.neighborhood,
            city: client.city,
            state: client.state,
            preferences: client.preferences as any,
            organization_id: client.organizationId
        };

        const { data, error } = await supabase.from('clients').insert([insertData]).select().single();

        if (error) throw error;
        return { ...client, id: data.id };
    },

    async updateClient(id: string, clientData: Partial<Client>): Promise<void> {
        console.log('🔧 clientService.updateClient called');
        console.log('🆔 ID:', id);
        console.log('📦 Client Data received:', clientData);

        const updateData: any = {};

        // Map all fields from camelCase to snake_case
        if (clientData.name !== undefined) updateData.name = clientData.name;
        if (clientData.cpfCnpj !== undefined) updateData.cpf_cnpj = clientData.cpfCnpj;
        if (clientData.email !== undefined) updateData.email = clientData.email;
        if (clientData.phone !== undefined) updateData.phone = clientData.phone;
        // Handle date field - convert empty string to null to avoid PostgreSQL error
        if (clientData.birthDate !== undefined) {
            updateData.birth_date = clientData.birthDate && clientData.birthDate.trim() !== ''
                ? clientData.birthDate
                : null;
        }
        if (clientData.status !== undefined) updateData.status = clientData.status;
        if (clientData.notes !== undefined) updateData.notes = clientData.notes;
        if (clientData.zipCode !== undefined) updateData.zip_code = clientData.zipCode;
        if (clientData.address !== undefined) updateData.address = clientData.address;
        if (clientData.number !== undefined) updateData.number = clientData.number;
        if (clientData.neighborhood !== undefined) updateData.neighborhood = clientData.neighborhood;
        if (clientData.city !== undefined) updateData.city = clientData.city;
        if (clientData.state !== undefined) updateData.state = clientData.state;
        if (clientData.preferences !== undefined) updateData.preferences = clientData.preferences as any;

        console.log('📤 Mapped data to send to Supabase:', updateData);

        const { error } = await supabase.from('clients').update(updateData).eq('id', id);

        if (error) {
            console.error('❌ Supabase update error:', error);
            throw error;
        }

        console.log('✅ Client updated successfully in database!');
    },

    async deleteClient(id: string): Promise<void> {
        const { error } = await supabase.from('clients').delete().eq('id', id);
        if (error) throw error;
    }
};
