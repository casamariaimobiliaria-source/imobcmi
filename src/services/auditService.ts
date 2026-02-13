import { supabase } from '../supabaseClient';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
export type ResourceType = 'SALE' | 'DEAL' | 'LEAD' | 'FINANCE' | 'AGENT' | 'CLIENT' | 'DEVELOPER' | 'USER';

export interface AuditLogInsert {
    user_id?: string;
    action: AuditAction;
    resource_type: ResourceType;
    resource_id: string;
    old_data?: any;
    new_data?: any;
    organization_id?: string;
}

export const auditService = {
    logAction: async (log: AuditLogInsert) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('audit_logs')
                .insert({
                    user_id: log.user_id || user?.id,
                    action: log.action,
                    resource_type: log.resource_type,
                    resource_id: log.resource_id,
                    old_data: log.old_data,
                    new_data: log.new_data,
                    organization_id: log.organization_id
                });

            if (error) console.error('Erro ao registrar log de auditoria:', error);
        } catch (err) {
            console.error('Falha crítica no auditService:', err);
        }
    },

    getLogs: async (filters?: { resource_type?: ResourceType, resource_id?: string, limit?: number }) => {
        let query = supabase
            .from('audit_logs')
            .select(`
        *,
        users (name, email)
      `)
            .order('created_at', { ascending: false });

        if (filters?.resource_type) query = query.eq('resource_type', filters.resource_type);
        if (filters?.resource_id) query = query.eq('resource_id', filters.resource_id);
        if (filters?.limit) query = query.limit(filters.limit);

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }
};
