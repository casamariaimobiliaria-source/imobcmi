import { supabase } from '../supabaseClient';
import { Sale } from '../types';
import { Tables, TablesInsert } from '../supabase_types';
import { saleSchema } from '../schemas';
import { auditService } from './auditService';

type SaleRow = Tables<'sales'>;
type SaleInsert = TablesInsert<'sales'>;

export const salesService = {
    async getSales(organizationId?: string): Promise<Sale[]> {
        let query = supabase
            .from('sales')
            .select('*');

        if (organizationId) {
            query = query.eq('organization_id', organizationId);
        }

        const { data, error } = await query;

        if (error) throw error;

        return (data || []).map((s: SaleRow) => ({
            id: s.id,
            date: s.date,
            developerId: s.developer_id || '',
            projectId: s.project_id || '',
            unit: s.unit || '',
            agentId: s.agent_id || '',
            clientId: s.client_id || '',
            leadSource: s.lead_source || '',
            unitValue: s.unit_value || 0,
            commissionPercent: s.commission_percent || 0,
            grossCommission: s.gross_commission || 0,
            taxPercent: s.tax_percent || 0,
            taxValue: s.tax_value || 0,
            miscExpensesDescription: s.misc_expenses_description || '',
            miscExpensesValue: s.misc_expenses_value || 0,
            agentSplitPercent: s.agent_split_percent || 0,
            agentCommission: s.agent_commission || 0,
            agencyCommission: s.agency_commission || 0,
            status: s.status as any,
            organizationId: s.organization_id || undefined
        }));
    },

    async addSale(sale: Sale): Promise<Sale> {
        // Validação de borda com Zod
        const validatedSale = saleSchema.parse(sale);

        const insertData: SaleInsert = {
            date: validatedSale.date,
            developer_id: validatedSale.developerId,
            project_id: validatedSale.projectId,
            unit: validatedSale.unit,
            agent_id: validatedSale.agentId,
            client_id: validatedSale.clientId,
            lead_source: validatedSale.leadSource,
            unit_value: validatedSale.unitValue,
            commission_percent: validatedSale.commissionPercent,
            gross_commission: validatedSale.grossCommission,
            tax_percent: validatedSale.taxPercent,
            tax_value: validatedSale.taxValue,
            misc_expenses_description: validatedSale.miscExpensesDescription,
            misc_expenses_value: validatedSale.miscExpensesValue,
            agent_split_percent: validatedSale.agentSplitPercent,
            agent_commission: validatedSale.agentCommission,
            agency_commission: validatedSale.agencyCommission,
            status: validatedSale.status,
            organization_id: validatedSale.organizationId
        };

        const { data, error } = await supabase
            .from('sales')
            .insert([insertData])
            .select()
            .single();

        if (error) throw error;

        await auditService.logAction({
            action: 'CREATE',
            resource_type: 'SALE',
            resource_id: data.id,
            new_data: insertData,
            organization_id: validatedSale.organizationId
        });

        return { ...sale, id: data.id };
    },

    async updateSale(id: string, saleData: Partial<Sale>): Promise<void> {
        // Validação parcial (permitimos campos parciais no update)
        const partialSchema = saleSchema.partial();
        const validatedUpdate = partialSchema.parse(saleData);

        const updateData: any = {}; // TODO: Melhorar tipagem do update se possível
        if (validatedUpdate.status) updateData.status = validatedUpdate.status;
        if (validatedUpdate.unit) updateData.unit = validatedUpdate.unit;
        if (validatedUpdate.unitValue) updateData.unit_value = validatedUpdate.unitValue;
        // Adicionar outros mapeamentos conforme necessário

        const { error } = await supabase
            .from('sales')
            .update(updateData)
            .eq('id', id);

        if (error) throw error;

        await auditService.logAction({
            action: 'UPDATE',
            resource_type: 'SALE',
            resource_id: id,
            new_data: updateData
        });
    },

    async deleteSale(id: string): Promise<void> {
        const { error } = await supabase
            .from('sales')
            .delete()
            .eq('id', id);

        if (error) throw error;

        await auditService.logAction({
            action: 'DELETE',
            resource_type: 'SALE',
            resource_id: id
        });
    }
};
