export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            agents: {
                Row: {
                    address: string | null
                    bank_details: string | null
                    city: string | null
                    cpf: string | null
                    created_at: string | null
                    creci: string | null
                    email: string | null
                    id: string
                    name: string
                    neighborhood: string | null
                    number: string | null
                    organization_id: string | null
                    phone: string | null
                    pix_key: string | null
                    state: string | null
                    status: string | null
                    total_commission_earned: number | null
                    total_commission_paid: number | null
                    zip_code: string | null
                }
                Insert: {
                    address?: string | null
                    bank_details?: string | null
                    city?: string | null
                    cpf?: string | null
                    created_at?: string | null
                    creci?: string | null
                    email?: string | null
                    id?: string
                    name: string
                    neighborhood?: string | null
                    number?: string | null
                    organization_id?: string | null
                    phone?: string | null
                    pix_key?: string | null
                    state?: string | null
                    status?: string | null
                    total_commission_earned?: number | null
                    total_commission_paid?: number | null
                    zip_code?: string | null
                }
                Update: {
                    address?: string | null
                    bank_details?: string | null
                    city?: string | null
                    cpf?: string | null
                    created_at?: string | null
                    creci?: string | null
                    email?: string | null
                    id?: string
                    name?: string
                    neighborhood?: string | null
                    number?: string | null
                    organization_id?: string | null
                    phone?: string | null
                    pix_key?: string | null
                    state?: string | null
                    status?: string | null
                    total_commission_earned?: number | null
                    total_commission_paid?: number | null
                    zip_code?: string | null
                }
                Relationships: []
            }
            categories: {
                Row: {
                    created_at: string | null
                    id: string
                    name: string
                    organization_id: string | null
                    type: string | null
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    name: string
                    organization_id?: string | null
                    type?: string | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    name?: string
                    organization_id?: string | null
                    type?: string | null
                }
                Relationships: []
            }
            clients: {
                Row: {
                    address: string | null
                    birth_date: string | null
                    city: string | null
                    cpf_cnpj: string | null
                    created_at: string | null
                    email: string | null
                    id: string
                    name: string
                    neighborhood: string | null
                    notes: string | null
                    number: string | null
                    organization_id: string | null
                    phone: string | null
                    preferences: Json | null
                    state: string | null
                    status: string | null
                    zip_code: string | null
                }
                Insert: {
                    address?: string | null
                    birth_date?: string | null
                    city?: string | null
                    cpf_cnpj?: string | null
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    name: string
                    neighborhood?: string | null
                    notes?: string | null
                    number?: string | null
                    organization_id?: string | null
                    phone?: string | null
                    preferences?: Json | null
                    state?: string | null
                    status?: string | null
                    zip_code?: string | null
                }
                Update: {
                    address?: string | null
                    birth_date?: string | null
                    city?: string | null
                    cpf_cnpj?: string | null
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    name?: string
                    neighborhood?: string | null
                    notes?: string | null
                    number?: string | null
                    organization_id?: string | null
                    phone?: string | null
                    preferences?: Json | null
                    state?: string | null
                    status?: string | null
                    zip_code?: string | null
                }
                Relationships: []
            }
            developers: {
                Row: {
                    address: string | null
                    city: string | null
                    cnpj: string | null
                    company_name: string
                    contact_name: string | null
                    created_at: string | null
                    email: string | null
                    id: string
                    neighborhood: string | null
                    notes: string | null
                    number: string | null
                    organization_id: string | null
                    phone: string | null
                    state: string | null
                    status: string | null
                    zip_code: string | null
                }
                Insert: {
                    address?: string | null
                    city?: string | null
                    cnpj?: string | null
                    company_name: string
                    contact_name?: string | null
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    neighborhood?: string | null
                    notes?: string | null
                    number?: string | null
                    organization_id?: string | null
                    phone?: string | null
                    state?: string | null
                    status?: string | null
                    zip_code?: string | null
                }
                Update: {
                    address?: string | null
                    city?: string | null
                    cnpj?: string | null
                    company_name?: string
                    contact_name?: string | null
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    neighborhood?: string | null
                    notes?: string | null
                    number?: string | null
                    organization_id?: string | null
                    phone?: string | null
                    state?: string | null
                    status?: string | null
                    zip_code?: string | null
                }
                Relationships: []
            }
            events: {
                Row: {
                    agent_id: string | null
                    client_id: string | null
                    created_at: string
                    description: string | null
                    end_time: string
                    id: string
                    organization_id: string | null
                    start_time: string
                    title: string
                    type: string
                }
                Insert: {
                    agent_id?: string | null
                    client_id?: string | null
                    created_at?: string
                    description?: string | null
                    end_time: string
                    id?: string
                    organization_id?: string | null
                    start_time: string
                    title: string
                    type: string
                }
                Update: {
                    agent_id?: string | null
                    client_id?: string | null
                    created_at?: string
                    description?: string | null
                    end_time?: string
                    id?: string
                    organization_id?: string | null
                    start_time?: string
                    title?: string
                    type?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "events_agent_id_fkey"
                        columns: ["agent_id"]
                        isOneToOne: false
                        referencedRelation: "agents"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "events_client_id_fkey"
                        columns: ["client_id"]
                        isOneToOne: false
                        referencedRelation: "clients"
                        referencedColumns: ["id"]
                    },
                ]
            }
            financial_records: {
                Row: {
                    amount: number
                    category_id: string | null
                    created_at: string | null
                    date: string
                    description: string
                    due_date: string | null
                    id: string
                    organization_id: string | null
                    related_entity_id: string | null
                    status: string | null
                    type: string | null
                }
                Insert: {
                    amount: number
                    category_id?: string | null
                    created_at?: string | null
                    date: string
                    description: string
                    due_date?: string | null
                    id?: string
                    organization_id?: string | null
                    related_entity_id?: string | null
                    status?: string | null
                    type?: string | null
                }
                Update: {
                    amount?: number
                    category_id?: string | null
                    created_at?: string | null
                    date?: string
                    description?: string
                    due_date?: string | null
                    id?: string
                    organization_id?: string | null
                    related_entity_id?: string | null
                    status?: string | null
                    type?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "financial_records_category_id_fkey"
                        columns: ["category_id"]
                        isOneToOne: false
                        referencedRelation: "categories"
                        referencedColumns: ["id"]
                    },
                ]
            }
            projects: {
                Row: {
                    address: string | null
                    created_at: string | null
                    developer_id: string | null
                    id: string
                    name: string
                    notes: string | null
                    organization_id: string | null
                    status: string | null
                }
                Insert: {
                    address?: string | null
                    created_at?: string | null
                    developer_id?: string | null
                    id?: string
                    name: string
                    notes?: string | null
                    organization_id?: string | null
                    status?: string | null
                }
                Update: {
                    address?: string | null
                    created_at?: string | null
                    developer_id?: string | null
                    id?: string
                    name?: string
                    notes?: string | null
                    organization_id?: string | null
                    status?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "projects_developer_id_fkey"
                        columns: ["developer_id"]
                        isOneToOne: false
                        referencedRelation: "developers"
                        referencedColumns: ["id"]
                    },
                ]
            }
            deals: {
                Row: {
                    id: string
                    title: string
                    value: number
                    stage: string
                    client_id: string | null
                    agent_id: string | null
                    created_at: string
                    updated_at: string
                    organization_id: string | null
                }
                Insert: {
                    id?: string
                    title: string
                    value: number
                    stage: string
                    client_id?: string | null
                    agent_id?: string | null
                    created_at?: string
                    updated_at?: string
                    organization_id?: string | null
                }
                Update: {
                    id?: string
                    title?: string
                    value?: number
                    stage?: string
                    client_id?: string | null
                    agent_id?: string | null
                    created_at?: string
                    updated_at?: string
                    organization_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "deals_agent_id_fkey"
                        columns: ["agent_id"]
                        isOneToOne: false
                        referencedRelation: "agents"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "deals_client_id_fkey"
                        columns: ["client_id"]
                        isOneToOne: false
                        referencedRelation: "clients"
                        referencedColumns: ["id"]
                    }
                ]
            }
            leads: {
                Row: {
                    id: string
                    nome: string
                    telefone: string | null
                    email: string | null
                    midia: string | null
                    data_compra: string | null
                    corretor: string | null
                    empreendimento: string | null
                    temperatura: string | null
                    status: string | null
                    historico: string | null
                    user_id: string | null
                    created_at: string
                    proximo_contato: string | null
                    organization_id: string | null
                }
                Insert: {
                    id?: string
                    nome: string
                    telefone?: string | null
                    email?: string | null
                    midia?: string | null
                    data_compra?: string | null
                    corretor?: string | null
                    empreendimento?: string | null
                    temperatura?: string | null
                    status?: string | null
                    historico?: string | null
                    user_id?: string | null
                    created_at?: string
                    proximo_contato?: string | null
                    organization_id?: string | null
                }
                Update: {
                    id?: string
                    nome?: string
                    telefone?: string | null
                    email?: string | null
                    midia?: string | null
                    data_compra?: string | null
                    corretor?: string | null
                    empreendimento?: string | null
                    temperatura?: string | null
                    status?: string | null
                    historico?: string | null
                    user_id?: string | null
                    created_at?: string
                    proximo_contato?: string | null
                    organization_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "leads_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            sales: {
                Row: {
                    agency_commission: number | null
                    agent_commission: number | null
                    agent_id: string | null
                    agent_split_percent: number | null
                    client_id: string | null
                    commission_percent: number | null
                    created_at: string | null
                    date: string
                    developer_id: string | null
                    gross_commission: number | null
                    id: string
                    lead_source: string | null
                    misc_expenses_description: string | null
                    misc_expenses_value: number | null
                    organization_id: string | null
                    project_id: string | null
                    status: string | null
                    tax_percent: number | null
                    tax_value: number | null
                    unit: string | null
                    unit_value: number | null
                }
                Insert: {
                    agency_commission?: number | null
                    agent_commission?: number | null
                    agent_id?: string | null
                    agent_split_percent?: number | null
                    client_id?: string | null
                    commission_percent?: number | null
                    created_at?: string | null
                    date: string
                    developer_id?: string | null
                    gross_commission?: number | null
                    id?: string
                    lead_source?: string | null
                    misc_expenses_description?: string | null
                    misc_expenses_value?: number | null
                    organization_id?: string | null
                    project_id?: string | null
                    status?: string | null
                    tax_percent?: number | null
                    tax_value?: number | null
                    unit?: string | null
                    unit_value?: number | null
                }
                Update: {
                    agency_commission?: number | null
                    agent_commission?: number | null
                    agent_id?: string | null
                    agent_split_percent?: number | null
                    client_id?: string | null
                    commission_percent?: number | null
                    created_at?: string | null
                    date?: string
                    developer_id?: string | null
                    gross_commission?: number | null
                    id?: string
                    lead_source?: string | null
                    misc_expenses_description?: string | null
                    misc_expenses_value?: number | null
                    organization_id?: string | null
                    project_id?: string | null
                    status?: string | null
                    tax_percent?: number | null
                    tax_value?: number | null
                    unit?: string | null
                    unit_value?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "sales_agent_id_fkey"
                        columns: ["agent_id"]
                        isOneToOne: false
                        referencedRelation: "agents"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "sales_client_id_fkey"
                        columns: ["client_id"]
                        isOneToOne: false
                        referencedRelation: "clients"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "sales_developer_id_fkey"
                        columns: ["developer_id"]
                        isOneToOne: false
                        referencedRelation: "developers"
                        referencedColumns: ["id"]
                    },
                ]
            }
            users: {
                Row: {
                    created_at: string | null
                    email: string
                    id: string
                    is_super_admin: boolean | null
                    name: string
                    organization_id: string | null
                    role: string | null
                    phone: string | null
                }
                Insert: {
                    created_at?: string | null
                    email: string
                    id?: string
                    is_super_admin?: boolean | null
                    name: string
                    organization_id?: string | null
                    role?: string | null
                    phone?: string | null
                }
                Update: {
                    created_at?: string | null
                    email?: string
                    id?: string
                    is_super_admin?: boolean | null
                    name?: string
                    organization_id?: string | null
                    role?: string | null
                    phone?: string | null
                }
                Relationships: []
            }
            organization_settings: {
                Row: {
                    accent_color: string | null
                    company_name: string | null
                    created_at: string | null
                    id: string
                    logo_url: string | null
                    organization_id: string | null
                    primary_color: string | null
                    secondary_color: string | null
                    system_name: string | null
                    updated_at: string | null
                }
                Insert: {
                    accent_color?: string | null
                    company_name?: string | null
                    created_at?: string | null
                    id?: string
                    logo_url?: string | null
                    organization_id?: string | null
                    primary_color?: string | null
                    secondary_color?: string | null
                    system_name?: string | null
                    updated_at?: string | null
                }
                Update: {
                    accent_color?: string | null
                    company_name?: string | null
                    created_at?: string | null
                    id?: string
                    logo_url?: string | null
                    organization_id?: string | null
                    primary_color?: string | null
                    secondary_color?: string | null
                    system_name?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            audit_logs: {
                Row: {
                    id: string
                    created_at: string
                    user_id: string | null
                    action: string
                    resource_type: string
                    resource_id: string
                    old_data: any
                    new_data: any
                    organization_id: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    user_id?: string | null
                    action: string
                    resource_type: string
                    resource_id: string
                    old_data?: any
                    new_data?: any
                    organization_id?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    user_id?: string | null
                    action?: string
                    resource_type?: string
                    resource_id?: string
                    old_data?: any
                    new_data?: any
                    organization_id?: string | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type PublicSchema = Database["public"]

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

