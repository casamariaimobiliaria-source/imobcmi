import { supabaseFinan } from '../supabaseClient';
import { FinancialRecord, Category } from '../types';
import { auditService } from './auditService';

export const financeService = {
    async getFinancialRecords(organizationId?: string): Promise<FinancialRecord[]> {
        let query = supabaseFinan.from('financial_records').select('*');
        if (organizationId) {
            query = query.eq('organization_id', organizationId);
        }
        const { data, error } = await query;
        if (error) throw error;

        return (data || []).map((f: any) => ({
            id: f.id,
            description: f.description,
            type: f.type,
            amount: f.amount,
            date: f.date,
            dueDate: f.due_date,
            status: f.status,
            category: f.category_id,
            relatedEntityId: f.related_entity_id,
            organizationId: f.organization_id || undefined
        }));
    },

    async addFinancialRecord(record: FinancialRecord): Promise<FinancialRecord> {
        const { data, error } = await supabaseFinan.from('financial_records').insert([{
            description: record.description,
            type: record.type,
            amount: record.amount,
            date: record.date,
            due_date: record.dueDate,
            status: record.status,
            category_id: record.category,
            related_entity_id: record.relatedEntityId || null,
            organization_id: record.organizationId
        }]).select().single();

        if (error) throw error;

        await auditService.logAction({
            action: 'CREATE',
            resource_type: 'FINANCE',
            resource_id: data.id,
            new_data: data,
            organization_id: record.organizationId
        });

        return { ...record, id: data.id };
    },

    async updateFinancialRecord(id: string, data: Partial<FinancialRecord>): Promise<void> {
        const updateData: any = {};
        if (data.description) updateData.description = data.description;
        if (data.type) updateData.type = data.type;
        if (data.amount) updateData.amount = data.amount;
        if (data.date) updateData.date = data.date;
        if (data.dueDate) updateData.due_date = data.dueDate;
        if (data.status) updateData.status = data.status;
        if (data.category) updateData.category_id = data.category;
        if (data.relatedEntityId !== undefined) updateData.related_entity_id = data.relatedEntityId || null;

        const { error } = await supabaseFinan.from('financial_records').update(updateData).eq('id', id);
        if (error) throw error;

        await auditService.logAction({
            action: 'UPDATE',
            resource_type: 'FINANCE',
            resource_id: id,
            new_data: updateData
        });
    },

    async deleteFinancialRecord(id: string): Promise<void> {
        const { error } = await supabaseFinan.from('financial_records').delete().eq('id', id);
        if (error) throw error;

        await auditService.logAction({
            action: 'DELETE',
            resource_type: 'FINANCE',
            resource_id: id
        });
    },

    async getCategories(organizationId?: string): Promise<Category[]> {
        let query = supabaseFinan.from('categories').select('*');
        if (organizationId) {
            query = query.eq('organization_id', organizationId);
        }
        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            type: c.type as any,
            organizationId: c.organization_id || undefined
        }));
    },

    async addCategory(category: Category): Promise<Category> {
        const { data, error } = await supabaseFinan.from('categories').insert([{
            name: category.name,
            type: category.type,
            organization_id: category.organizationId
        }]).select().single();

        if (error) throw error;
        return {
            id: data.id,
            name: data.name,
            type: data.type as any
        };
    }
};
