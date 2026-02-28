import { supabase } from '../supabaseClient';
import { FinancialRecord, Category, BankAccount, PaymentMethod } from '../types';
import { auditService } from './auditService';

export const financeService = {
    async getFinancialRecords(organizationId?: string): Promise<FinancialRecord[]> {
        let query = supabase.from('financial_records').select('*');
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
            bankAccountId: f.bank_account_id || undefined,
            paymentMethodId: f.payment_method_id || undefined,
            relatedEntityId: f.related_entity_id,
            organizationId: f.organization_id || undefined
        }));
    },

    async addFinancialRecord(record: FinancialRecord): Promise<FinancialRecord> {
        const { data, error } = await supabase.from('financial_records').insert([{
            description: record.description,
            type: record.type,
            amount: record.amount,
            date: record.date,
            due_date: record.dueDate,
            status: record.status,
            category_id: record.category,
            bank_account_id: record.bankAccountId || null,
            payment_method_id: record.paymentMethodId || null,
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
        if (data.bankAccountId !== undefined) updateData.bank_account_id = data.bankAccountId || null;
        if (data.paymentMethodId !== undefined) updateData.payment_method_id = data.paymentMethodId || null;
        if (data.relatedEntityId !== undefined) updateData.related_entity_id = data.relatedEntityId || null;

        const { error } = await supabase.from('financial_records').update(updateData).eq('id', id);
        if (error) throw error;

        await auditService.logAction({
            action: 'UPDATE',
            resource_type: 'FINANCE',
            resource_id: id,
            new_data: updateData
        });
    },

    async deleteFinancialRecord(id: string): Promise<void> {
        const { error } = await supabase.from('financial_records').delete().eq('id', id);
        if (error) throw error;

        await auditService.logAction({
            action: 'DELETE',
            resource_type: 'FINANCE',
            resource_id: id
        });
    },

    async getCategories(organizationId?: string): Promise<Category[]> {
        let query = supabase.from('categories').select('*');
        if (organizationId) {
            query = query.eq('organization_id', organizationId);
        }
        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            type: c.type as any,
            parentId: c.parent_id || undefined,
            organizationId: c.organization_id || undefined
        }));
    },

    async addCategory(category: Category): Promise<Category> {
        const { data, error } = await supabase.from('categories').insert([{
            name: category.name,
            type: category.type,
            parent_id: category.parentId || null,
            organization_id: category.organizationId
        } as any]).select().single();

        if (error) throw error;
        return {
            id: data.id,
            name: data.name,
            type: data.type as any,
            parentId: (data as any).parent_id || undefined
        };
    },

    async updateCategory(id: string, data: Partial<Category>): Promise<void> {
        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.type !== undefined) updateData.type = data.type;
        if (data.parentId !== undefined) updateData.parent_id = data.parentId || null;

        const { error } = await supabase.from('categories').update(updateData).eq('id', id);
        if (error) throw error;
    },

    // --- Bank Accounts CRUD ---

    async getBankAccounts(organizationId?: string): Promise<BankAccount[]> {
        let query = supabase.from('bank_accounts' as any).select('*');
        if (organizationId) {
            query = query.eq('organization_id', organizationId);
        }
        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map((b: any) => ({
            id: b.id,
            bankName: b.bank_name,
            agency: b.agency,
            accountNumber: b.account_number,
            name: b.name,
            initialBalance: b.initial_balance,
            status: b.status as any,
            organizationId: b.organization_id || undefined
        }));
    },

    async addBankAccount(account: BankAccount): Promise<BankAccount> {
        const { data, error } = await supabase.from('bank_accounts' as any).insert([{
            bank_name: account.bankName,
            agency: account.agency,
            account_number: account.accountNumber,
            name: account.name,
            initial_balance: account.initialBalance,
            status: account.status,
            organization_id: account.organizationId
        } as any]).select().single();

        if (error) throw error;
        return {
            id: (data as any).id,
            bankName: (data as any).bank_name,
            agency: (data as any).agency,
            accountNumber: (data as any).account_number,
            name: (data as any).name,
            initialBalance: (data as any).initial_balance,
            status: (data as any).status as any
        };
    },

    async updateBankAccount(id: string, data: Partial<BankAccount>): Promise<void> {
        const updateData: any = {};
        if (data.bankName !== undefined) updateData.bank_name = data.bankName;
        if (data.agency !== undefined) updateData.agency = data.agency;
        if (data.accountNumber !== undefined) updateData.account_number = data.accountNumber;
        if (data.name !== undefined) updateData.name = data.name;
        if (data.initialBalance !== undefined) updateData.initial_balance = data.initialBalance;
        if (data.status !== undefined) updateData.status = data.status;

        const { error } = await supabase.from('bank_accounts' as any).update(updateData).eq('id', id);
        if (error) throw error;
    },

    async deleteBankAccount(id: string): Promise<void> {
        const { error } = await supabase.from('bank_accounts' as any).delete().eq('id', id);
        if (error) throw error;
    },

    // --- Payment Methods CRUD ---

    async getPaymentMethods(organizationId?: string): Promise<PaymentMethod[]> {
        let query = supabase.from('payment_methods' as any).select('*');
        if (organizationId) {
            query = query.eq('organization_id', organizationId);
        }
        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            status: p.status as any,
            organizationId: p.organization_id || undefined
        }));
    },

    async addPaymentMethod(method: PaymentMethod): Promise<PaymentMethod> {
        const { data, error } = await supabase.from('payment_methods' as any).insert([{
            name: method.name,
            status: method.status,
            organization_id: method.organizationId
        } as any]).select().single();

        if (error) throw error;
        return {
            id: (data as any).id,
            name: (data as any).name,
            status: (data as any).status as any
        };
    },

    async updatePaymentMethod(id: string, data: Partial<PaymentMethod>): Promise<void> {
        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.status !== undefined) updateData.status = data.status;

        const { error } = await supabase.from('payment_methods' as any).update(updateData).eq('id', id);
        if (error) throw error;
    },

    async deletePaymentMethod(id: string): Promise<void> {
        const { error } = await supabase.from('payment_methods' as any).delete().eq('id', id);
        if (error) throw error;
    }
};
