import { z } from 'zod';

export const saleSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (formato YYYY-MM-DD)"),
    developerId: z.string().uuid("ID da Incorporadora inválido"),
    projectId: z.string().min(2, "Projeto é obrigatório"),
    unit: z.string().min(1, "Unidade é obrigatória"),
    agentId: z.string().uuid("ID do Corretor inválido"),
    clientId: z.string().uuid("ID do Cliente inválido"),
    leadSource: z.string(),
    unitValue: z.number().positive("Valor do imóvel deve ser positivo"),
    commissionPercent: z.number().min(0).max(100),
    grossCommission: z.number().min(0),
    taxPercent: z.number().min(0).max(100),
    taxValue: z.number().min(0),
    miscExpensesDescription: z.string().optional(),
    miscExpensesValue: z.number().min(0).default(0),
    agentSplitPercent: z.number().min(0).max(100),
    agentCommission: z.number().min(0),
    agencyCommission: z.number().min(0),
    status: z.enum(['pending', 'approved', 'cancelled']),
    organizationId: z.string().uuid().optional()
});

export const agentSchema = z.object({
    name: z.string().min(3, "Nome muito curto"),
    cpf: z.string().min(11, "CPF inválido"),
    email: z.string().email("Email inválido").or(z.literal('')),
    phone: z.string().min(10, "Telefone inválido"),
    creci: z.string().optional(),
    status: z.enum(['active', 'inactive']),
    zipCode: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    number: z.string().optional(),
    neighborhood: z.string().optional(),
    organizationId: z.string().uuid().optional()
});

export const clientSchema = z.object({
    name: z.string().min(2, "Nome é obrigatório"),
    cpfCnpj: z.string().optional(),
    email: z.string().email("Email inválido").optional().or(z.literal('')),
    phone: z.string().optional(),
    status: z.enum(['active', 'inactive']),
    preferences: z.any().optional(),
    organizationId: z.string().uuid().optional()
});

export const developerSchema = z.object({
    companyName: z.string().min(2, "Razão Social é obrigatória"),
    cnpj: z.string().optional(),
    contactName: z.string().optional(),
    status: z.enum(['active', 'inactive']),
    organizationId: z.string().uuid().optional()
});

export type SaleInput = z.infer<typeof saleSchema>;
export type AgentInput = z.infer<typeof agentSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type DeveloperInput = z.infer<typeof developerSchema>;
