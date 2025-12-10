export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "13.0.5"
    }
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
                    type: string | null
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    name: string
                    type?: string | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    name?: string
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
                    phone: string | null
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
                    phone?: string | null
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
                    phone?: string | null
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
                    phone?: string | null
                    state?: string | null
                    status?: string | null
                    zip_code?: string | null
                }
                Relationships: []
            }
            events: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    start_time: string
                    end_time: string
                    type: string
                    agent_id: string | null
                    client_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    start_time: string
                    end_time: string
                    type: string
                    agent_id?: string | null
                    client_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    start_time?: string
                    end_time?: string
                    type?: string
                    agent_id?: string | null
                    client_id?: string | null
                    created_at?: string
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
                    }
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
            organization_invites: {
                Row: {
                    created_at: string | null
                    created_by: string | null
                    email: string
                    expires_at: string
                    id: string
                    organization_id: string
                    role: string
                    token: string
                }
                Insert: {
                    created_at?: string | null
                    created_by?: string | null
                    email: string
                    expires_at?: string
                    id?: string
                    organization_id: string
                    role?: string
                    token?: string
                }
                Update: {
                    created_at?: string | null
                    created_by?: string | null
                    email?: string
                    expires_at?: string
                    id?: string
                    organization_id?: string
                    role?: string
                    token?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "organization_invites_organization_id_fkey"
                        columns: ["organization_id"]
                        isOneToOne: false
                        referencedRelation: "organizations"
                        referencedColumns: ["id"]
                    }
                ]
            }
            organizations: {
                Row: {
                    created_at: string | null
                    id: string
                    name: string
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    name: string
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    name?: string
                }
                Relationships: []
            }
            projects: {
                Row: {
                    created_at: string | null
                    developer_id: string | null
                    id: string
                    name: string
                }
                Insert: {
                    created_at?: string | null
                    developer_id?: string | null
                    id?: string
                    name: string
                }
                Update: {
                    created_at?: string | null
                    developer_id?: string | null
                    id?: string
                    name?: string
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
                    {
                        foreignKeyName: "sales_project_id_fkey"
                        columns: ["project_id"]
                        isOneToOne: false
                        referencedRelation: "projects"
                        referencedColumns: ["id"]
                    },
                ]
            }
            users: {
                Row: {
                    created_at: string | null
                    email: string
                    id: string
                    name: string
                    organization_id: string | null
                    role: string | null
                }
                Insert: {
                    created_at?: string | null
                    email: string
                    id?: string
                    name: string
                    organization_id?: string | null
                    role?: string | null
                }
                Update: {
                    created_at?: string | null
                    email?: string
                    id?: string
                    name?: string
                    organization_id?: string | null
                    role?: string | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            accept_invite: {
                Args: {
                    invite_token: string
                }
                Returns: void
            }
            create_new_organization: {
                Args: {
                    company_name: string
                    user_name: string
                    user_email: string
                }
                Returns: void
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

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

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
