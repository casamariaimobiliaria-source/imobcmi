export type Status = 'active' | 'inactive';
export type SaleStatus = 'pending' | 'approved' | 'cancelled';
export type TransactionType = 'income' | 'expense';
export type FinanceStatus = 'paid' | 'pending';
export type UserRole = 'admin' | 'agent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  avatar_url?: string;
  phone?: string;
}

export interface Agent {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  creci: string;

  // Address
  zipCode: string;
  address: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;

  pixKey: string;
  bankDetails: string;
  status: Status;
  totalCommissionEarned: number;
  totalCommissionPaid: number;
  organizationId?: string;
}

export interface ClientPreferences {
  propertyType: string[]; // Casa, Apartamento, Terreno...
  minBudget: number;
  maxBudget: number;
  bedrooms: number;
  garages: number;
  neighborhoods: string[];
  purpose: 'buy' | 'rent' | 'invest';
}

export interface Client {
  id: string;
  name: string;
  cpfCnpj: string;
  email: string;
  phone: string;

  // New Fields
  birthDate?: string;
  status: Status;
  notes?: string;
  zipCode?: string;
  address?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;

  preferences?: ClientPreferences;
  organizationId?: string;
}

export interface Developer {
  id: string;
  companyName: string;
  cnpj: string;
  contactName: string;

  // New Fields
  email?: string;
  phone?: string;
  status: Status;
  notes?: string;
  zipCode?: string;
  address?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  organizationId?: string;
}

export interface Sale {
  id: string;
  date: string;
  developerId: string;
  projectId: string;
  unit: string;
  agentId: string;
  clientId: string;
  leadSource: string;

  // Financials
  unitValue: number;         // Valor Venda (Ex: 500k)
  commissionPercent: number; // % Total (Ex: 5%)
  grossCommission: number;   // Bruto (Ex: 25k)

  // Deductions
  taxPercent: number;        // % Nota Fiscal (Ex: 6%)
  taxValue: number;          // Valor NF (Ex: 1.5k)

  miscExpensesDescription: string; // Descrição Desconto (Ex: Taxa WayBropay)
  miscExpensesValue: number;       // Valor Desconto (Ex: 200,00)

  // Distribution
  agentSplitPercent: number; // % Repasse Corretor (Ex: 50%)
  agentCommission: number;   // Valor Corretor (Liquido após impostos proprocionais)
  agencyCommission: number;  // Valor Imobiliária (Liquido após impostos proporcionais)

  status: SaleStatus;
  organizationId?: string;
}

export interface FinancialRecord {
  id: string;
  description: string;
  type: TransactionType;
  amount: number;
  date: string; // Date of payment/receipt or accrual
  dueDate: string; // Vencimento
  status: FinanceStatus;
  category: string; // Chart of Accounts
  bankAccountId?: string;
  paymentMethodId?: string;
  relatedEntityId?: string; // e.g. Agent ID for payments
  organizationId?: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  agency: string;
  accountNumber: string;
  name: string;
  initialBalance: number;
  status: Status;
  organizationId?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  status: Status;
  organizationId?: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  parentId?: string | null;
  organizationId?: string;
}

export interface OrganizationSettings {
  id: string;
  organization_id: string;
  company_name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  system_name: string;
}




export interface AppContextType {
  user: User | null;
  settings: OrganizationSettings | null;
  loading: boolean;
  login: (email?: string, password?: string) => Promise<void>;
  logout: () => void;
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  updateSettings: (data: Partial<OrganizationSettings>) => Promise<void>;

  usersList: User[];
  addUser: (user: User) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;

  agents: Agent[];
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, data: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;

  clients: Client[];
  addClient: (client: Client) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  developers: Developer[];
  addDeveloper: (developer: Developer) => void;
  updateDeveloper: (id: string, data: Partial<Developer>) => void;
  deleteDeveloper: (id: string) => void;



  sales: Sale[];
  addSale: (sale: Sale) => void;
  updateSale: (id: string, data: Partial<Sale>) => void;
  deleteSale: (id: string) => void;

  financialRecords: FinancialRecord[];
  addFinancialRecord: (record: FinancialRecord) => void;
  updateFinancialRecord: (id: string, data: Partial<FinancialRecord>) => void;
  deleteFinancialRecord: (id: string) => void;

  bankAccounts: BankAccount[];
  addBankAccount: (account: BankAccount) => void;
  updateBankAccount: (id: string, data: Partial<BankAccount>) => void;
  deleteBankAccount: (id: string) => void;

  paymentMethods: PaymentMethod[];
  addPaymentMethod: (method: PaymentMethod) => void;
  updatePaymentMethod: (id: string, data: Partial<PaymentMethod>) => void;
  deletePaymentMethod: (id: string) => void;

  categories: Category[];
  addCategory: (category: Category) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Notifications
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Events (Global Access)
  events: Event[];
  refreshEvents: () => void;

  deals: Deal[];
  addDeal: (deal: Deal) => void;
  updateDeal: (id: string, data: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;

  leads: Lead[];
  addLead: (lead: Lead) => void;
  updateLead: (id: string, data: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date: string;
  read: boolean;
  link?: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  type: 'visit' | 'meeting' | 'task' | 'deadline';
  agent_id?: string | null;
  client_id?: string | null;
  created_at: string;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: 'lead' | 'contact' | 'visit' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  client_id?: string | null;
  agent_id?: string | null;
  created_at: string;
  updated_at: string;
  organizationId?: string;
}
export interface Lead {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  midia?: string;
  data_compra?: string;
  corretor?: string;
  empreendimento?: string;
  temperatura?: string;
  status: string;
  historico?: string;
  user_id?: string;
  created_at: string;
  proximo_contato?: string;
  organizationId?: string;
}
