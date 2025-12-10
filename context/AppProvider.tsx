
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AppContextType, Agent, Client, Developer, Project, Sale, FinancialRecord, Category, User, UserRole, Notification, Event
} from '../types';
import { generateId } from '../utils';
import { supabase } from '../supabaseClient';
import { useToast } from './ToastContext';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToast } = useToast();
  console.log('AppProvider mounting...');
  const [user, setUser] = useState<User | null>(null);

  const [agents, setAgents] = useState<Agent[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [sales, setSales] = useState<Sale[]>([]);
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Notifications & Events
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  // --- DATA FETCHING ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: agentsData, error: agentsError } = await supabase.from('agents').select('*');
      console.log('Agents Fetch:', { data: agentsData, error: agentsError });

      const { data: clientsData } = await supabase.from('clients').select('*');
      const { data: developersData } = await supabase.from('developers').select('*');
      const { data: projectsData } = await supabase.from('projects').select('*');

      const { data: salesData } = await supabase.from('sales').select('*');
      const { data: financeData } = await supabase.from('financial_records').select('*');
      const { data: categoriesData } = await supabase.from('categories').select('*');
      const { data: usersData } = await supabase.from('users').select('*');
      const { data: eventsData } = await supabase.from('events').select('*');

      if (usersData) {
        setUsersList(usersData.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role as UserRole
        })));
      }

      if (agentsData) {
        setAgents(agentsData.map((a: any) => ({
          id: a.id,
          name: a.name,
          cpf: a.cpf,
          email: a.email,
          phone: a.phone,
          creci: a.creci,
          zipCode: a.zip_code,
          address: a.address,
          number: a.number,
          neighborhood: a.neighborhood,
          city: a.city,
          state: a.state,
          pixKey: a.pix_key,
          bankDetails: a.bank_details,
          status: a.status,
          totalCommissionEarned: a.total_commission_earned,
          totalCommissionPaid: a.total_commission_paid,
        })));
      }

      if (clientsData) {
        setClients(clientsData.map((c: any) => ({
          id: c.id,
          name: c.name,
          cpfCnpj: c.cpf_cnpj,
          email: c.email,
          phone: c.phone,
          birthDate: c.birth_date,
          status: c.status,
          notes: c.notes,
          zipCode: c.zip_code,
          address: c.address,
          number: c.number,
          neighborhood: c.neighborhood,
          city: c.city,
          state: c.state,
        })));
      }

      if (developersData) {
        setDevelopers(developersData.map((d: any) => ({
          id: d.id,
          companyName: d.company_name,
          cnpj: d.cnpj,
          contactName: d.contact_name,
          email: d.email,
          phone: d.phone,
          status: d.status,
          notes: d.notes,
          zipCode: d.zip_code,
          address: d.address,
          number: d.number,
          neighborhood: d.neighborhood,
          city: d.city,
          state: d.state,
        })));
      }

      if (projectsData) {
        setProjects(projectsData.map((p: any) => ({
          id: p.id,
          name: p.name,
          developerId: p.developer_id,
          address: p.address,
          notes: p.notes,
          status: p.status || 'active',
        })));
      }





      if (salesData) {
        setSales(salesData.map((s: any) => ({
          id: s.id,
          date: s.date,
          developerId: s.developer_id,
          projectId: s.project_id,
          unit: s.unit,
          agentId: s.agent_id,
          clientId: s.client_id,
          leadSource: s.lead_source,
          unitValue: s.unit_value,
          commissionPercent: s.commission_percent,
          grossCommission: s.gross_commission,
          taxPercent: s.tax_percent,
          taxValue: s.tax_value,
          miscExpensesDescription: s.misc_expenses_description,
          miscExpensesValue: s.misc_expenses_value,
          agentSplitPercent: s.agent_split_percent,
          agentCommission: s.agent_commission,
          agencyCommission: s.agency_commission,
          status: s.status,
        })));
      }

      if (financeData) {
        setFinancialRecords(financeData.map((f: any) => ({
          id: f.id,
          description: f.description,
          type: f.type,
          amount: f.amount,
          date: f.date,
          dueDate: f.due_date,
          status: f.status,
          category: f.category_id,
          relatedEntityId: f.related_entity_id,
        })));
      }

      if (categoriesData) {
        setCategories(categoriesData.map((c: any) => ({
          id: c.id,
          name: c.name,
          type: c.type,
        })));
      }

      if (eventsData) {
        setEvents(eventsData);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- SEED CATEGORIES IF MISSING ---
  const seedCategories = async (currentCategories: Category[], orgId: string) => {
    const defaults = [
      { name: 'Receita Vendas', type: 'income' },
      { name: 'Consultoria', type: 'income' },
      { name: 'Outras Receitas', type: 'income' },
      { name: 'Comissão', type: 'expense' },
      { name: 'Marketing', type: 'expense' },
      { name: 'Aluguel', type: 'expense' },
      { name: 'Energia', type: 'expense' },
      { name: 'Água', type: 'expense' },
      { name: 'Internet', type: 'expense' },
      { name: 'Salários', type: 'expense' },
      { name: 'Impostos', type: 'expense' },
      { name: 'Outras Despesas', type: 'expense' }
    ];

    const missing = defaults.filter(d => !currentCategories.some(c => c.name === d.name && c.type === d.type));

    if (missing.length > 0) {
      console.log('Seeding missing categories...', missing);
      const { data, error } = await supabase.from('categories').insert(
        missing.map(m => ({ ...m, organization_id: orgId }))
      ).select();

      if (data) {
        setCategories(prev => [...prev, ...data.map((c: any) => ({ id: c.id, name: c.name, type: c.type }))]);
      }
    }
  };

  useEffect(() => {
    if (!loading && user?.organization_id) {
      seedCategories(categories, user.organization_id);
    }
  }, [loading, user?.organization_id]);

  // --- NOTIFICATIONS LOGIC ---
  const checkNotifications = () => {
    const newNotifications: Notification[] = [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // 1. Check Events (Next 30 mins)
    events.forEach(event => {
      const eventTime = new Date(event.start_time);
      const diffMs = eventTime.getTime() - now.getTime();
      const diffMins = diffMs / (1000 * 60);

      if (diffMins > 0 && diffMins <= 30) {
        newNotifications.push({
          id: `evt-${event.id}`,
          title: 'Compromisso Próximo',
          message: `${event.title} começa em ${Math.round(diffMins)} minutos.`,
          type: 'info',
          date: now.toISOString(),
          read: false,
          link: '/calendar'
        });
      }
    });

    // 2. Check Financial Records (Due Today or Overdue)
    financialRecords.forEach(record => {
      if (record.status === 'pending' && record.type === 'expense') {
        if (record.dueDate === todayStr) {
          newNotifications.push({
            id: `fin-${record.id}`,
            title: 'Conta Vence Hoje',
            message: `${record.description} vence hoje.`,
            type: 'warning',
            date: now.toISOString(),
            read: false,
            link: '/finance'
          });
        } else if (record.dueDate && record.dueDate < todayStr) {
          newNotifications.push({
            id: `fin-overdue-${record.id}`,
            title: 'Conta Atrasada',
            message: `${record.description} venceu em ${record.dueDate}.`,
            type: 'error',
            date: now.toISOString(),
            read: false,
            link: '/finance'
          });
        }
      }
    });

    // Merge with existing notifications to avoid duplicates (simplified)
    // In a real app, we'd track dismissed notifications more robustly
    setNotifications(prev => {
      const existingIds = new Set(prev.map(n => n.id));
      const uniqueNew = newNotifications.filter(n => !existingIds.has(n.id));
      return [...prev, ...uniqueNew];
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Check notifications periodically
  useEffect(() => {
    if (!loading) {
      checkNotifications();
      const interval = setInterval(checkNotifications, 60000); // Every minute
      return () => clearInterval(interval);
    }
  }, [loading, events, financialRecords]);

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const refreshEvents = async () => {
    const { data } = await supabase.from('events').select('*');
    if (data) setEvents(data);
  };


  // Re-map financial records categories names after fetch if needed
  // Ideally we should change FinancialRecord type to use categoryId, but to minimize changes:
  // We will store the category NAME in the context state if that's what the app expects, 
  // OR we update the app to handle category IDs.
  // Looking at the mock: category: 'Aluguel'.
  // Looking at DB: category_id.
  // Let's try to map ID to Name when setting state, and Name to ID when saving.
  // But wait, if we have multiple categories with same name? Unlikely.
  // Let's assume for now we map ID to Name for the frontend state to keep it working.

  useEffect(() => {
    if (financialRecords.length > 0 && categories.length > 0) {
      // Check if any record has a UUID as category (which means it came from DB)
      // and replace with name.
      const needsUpdate = financialRecords.some(r => r.category && r.category.length > 20 && r.category.includes('-'));
      if (needsUpdate) {
        setFinancialRecords(prev => prev.map(r => {
          const cat = categories.find(c => c.id === r.category);
          return cat ? { ...r, category: cat.name } : r;
        }));
      }
    }
  }, [categories, financialRecords]);


  // --- AUTHENTICATION ---
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleUserSession(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        handleUserSession(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [agents]); // Depend on agents to map roles correctly

  const handleUserSession = async (authUser: any) => {
    // 1. Check if user exists in 'users' table (Source of Truth for Roles)
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('email', authUser.email)
      .single();

    if (userProfile) {
      setUser({
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        role: userProfile.role as UserRole,
        organization_id: userProfile.organization_id
      });
    } else {
      // Fallback: Check agents (Legacy support)
      const agent = agents.find(a => a.email === authUser.email);
      if (agent) {
        setUser({
          id: agent.id,
          name: agent.name,
          email: authUser.email,
          role: 'agent',
          organization_id: agent.organization_id
        });
      } else {
        // Default / Guest
        setUser({
          id: authUser.id,
          name: authUser.user_metadata?.name || 'Visitante',
          email: authUser.email,
          role: 'agent' // Default to restricted role
        });
      }
    }
    setLoading(false);
  };

  const login = async (email?: string, password?: string) => {
    if (!email || !password) return;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Login error:', error);
      throw error; // Propagate error to UI
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // --- USERS CRUD ---
  const [usersList, setUsersList] = useState<User[]>([]);

  const addUser = async (newUser: User) => {
    const { data, error } = await supabase.from('users').insert([{
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      organization_id: user?.organization_id // Inherit from current admin
    }]).select().single();

    if (error) {
      console.error('Error adding user:', error);
      console.error('Error adding user:', error);
      addToast('Erro ao adicionar usuário: ' + error.message, 'error');
      return;
      return;
    }
    if (data) {
      setUsersList(prev => [...prev, { ...newUser, id: data.id }]);
    }
  };

  const updateUser = async (id: string, data: Partial<User>) => {
    const { error } = await supabase.from('users').update({
      name: data.name,
      email: data.email,
      role: data.role
    }).eq('id', id);

    if (error) {
      console.error('Error updating user:', error);
      return;
    }
    setUsersList(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
  };

  const deleteUser = async (id: string) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) {
      console.error('Error deleting user:', error);
      return;
    }
    setUsersList(prev => prev.filter(u => u.id !== id));
  };

  // --- AGENTS CRUD ---
  const addAgent = async (agent: Agent) => {
    const { data, error } = await supabase.from('agents').insert([{
      name: agent.name,
      cpf: agent.cpf || null,
      email: agent.email || null,
      phone: agent.phone,
      creci: agent.creci || null,
      zip_code: agent.zipCode,
      address: agent.address,
      number: agent.number,
      neighborhood: agent.neighborhood,
      city: agent.city,
      state: agent.state,
      pix_key: agent.pixKey,
      bank_details: agent.bankDetails,
      status: agent.status,
      total_commission_earned: agent.totalCommissionEarned,
      total_commission_paid: agent.totalCommissionPaid,
      organization_id: user?.organization_id
    }]).select().single();

    if (error) {
      console.error('Error adding agent:', error);
      if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
        addToast('Erro: CPF ou Email já cadastrado para outro corretor.', 'error');
      } else {
        addToast('Erro ao adicionar corretor: ' + error.message, 'error');
      }
      return;
    }

    if (data) {
      setAgents(prev => [...prev, { ...agent, id: data.id }]);
      addToast('Corretor adicionado com sucesso!', 'success');
    }
  };

  const updateAgent = async (id: string, data: Partial<Agent>) => {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.cpf !== undefined) updateData.cpf = data.cpf || null;
    if (data.email !== undefined) updateData.email = data.email || null;
    if (data.phone) updateData.phone = data.phone;
    if (data.creci !== undefined) updateData.creci = data.creci || null;
    if (data.zipCode) updateData.zip_code = data.zipCode;
    if (data.address) updateData.address = data.address;
    if (data.number) updateData.number = data.number;
    if (data.neighborhood) updateData.neighborhood = data.neighborhood;
    if (data.city) updateData.city = data.city;
    if (data.state) updateData.state = data.state;
    if (data.pixKey) updateData.pix_key = data.pixKey;
    if (data.bankDetails) updateData.bank_details = data.bankDetails;
    if (data.status) updateData.status = data.status;
    if (data.totalCommissionEarned !== undefined) updateData.total_commission_earned = data.totalCommissionEarned;
    if (data.totalCommissionPaid !== undefined) updateData.total_commission_paid = data.totalCommissionPaid;

    const { error } = await supabase.from('agents').update(updateData).eq('id', id);

    if (error) {
      console.error('Error updating agent:', error);
      if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
        addToast('Erro: CPF ou Email já cadastrado para outro corretor.', 'error');
      } else {
        addToast('Erro ao atualizar corretor: ' + error.message, 'error');
      }
      return;
    }

    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
    addToast('Corretor atualizado com sucesso!', 'success');
  };

  const deleteAgent = async (id: string) => {
    const { error } = await supabase.from('agents').delete().eq('id', id);
    if (error) {
      console.error('Error deleting agent:', error);
      addToast('Erro ao excluir corretor: ' + error.message, 'error');
      return;
    }
    setAgents(prev => prev.filter(a => a.id !== id));
    addToast('Corretor excluído com sucesso!', 'success');
  };

  // --- CLIENTS CRUD ---
  const addClient = async (client: Client) => {
    const { data, error } = await supabase.from('clients').insert([{
      name: client.name,
      cpf_cnpj: client.cpfCnpj,
      email: client.email,
      phone: client.phone,
      birth_date: client.birthDate || null,
      status: client.status,
      notes: client.notes,
      zip_code: client.zipCode,
      address: client.address,
      number: client.number,
      neighborhood: client.neighborhood,
      city: client.city,
      state: client.state,
      preferences: client.preferences, // JSONB
      organization_id: user?.organization_id
    }]).select().single();

    if (error) {
      console.error('Error adding client:', error);
      return;
    }

    if (data) {
      setClients(prev => [...prev, { ...client, id: data.id }]);
    }
  };

  const updateClient = async (id: string, data: Partial<Client>) => {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.cpfCnpj) updateData.cpf_cnpj = data.cpfCnpj;
    if (data.email) updateData.email = data.email;
    if (data.phone) updateData.phone = data.phone;
    if (data.phone) updateData.phone = data.phone;
    if (data.birthDate !== undefined) updateData.birth_date = data.birthDate || null;
    if (data.status) updateData.status = data.status;
    if (data.status) updateData.status = data.status;
    if (data.notes) updateData.notes = data.notes;
    if (data.zipCode) updateData.zip_code = data.zipCode;
    if (data.address) updateData.address = data.address;
    if (data.number) updateData.number = data.number;
    if (data.neighborhood) updateData.neighborhood = data.neighborhood;
    if (data.city) updateData.city = data.city;
    if (data.state) updateData.state = data.state;
    if (data.preferences) updateData.preferences = data.preferences;

    const { error } = await supabase.from('clients').update(updateData).eq('id', id);

    if (error) {
      console.error('Error updating client:', error);
      return;
    }

    setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteClient = async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) {
      console.error('Error deleting client:', error);
      return;
    }
    setClients(prev => prev.filter(c => c.id !== id));
  };

  // --- DEVELOPERS CRUD ---
  const addDeveloper = async (developer: Developer) => {
    const { data, error } = await supabase.from('developers').insert([{
      company_name: developer.companyName,
      cnpj: developer.cnpj || null,
      contact_name: developer.contactName,
      email: developer.email || null,
      phone: developer.phone,
      status: developer.status,
      notes: developer.notes,
      zip_code: developer.zipCode,
      address: developer.address,
      number: developer.number,
      city: developer.city,
      state: developer.state,
      organization_id: user?.organization_id
    }]).select().single();

    if (error) {
      console.error('Error adding developer:', error);
      if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
        addToast('Erro: CNPJ já cadastrado para outra incorporadora.', 'error');
      } else {
        addToast('Erro ao adicionar incorporadora: ' + error.message, 'error');
      }
      return;
    }

    if (data) {
      setDevelopers(prev => [...prev, { ...developer, id: data.id }]);
      addToast('Incorporadora adicionada com sucesso!', 'success');
    }
  };

  const updateDeveloper = async (id: string, data: Partial<Developer>) => {
    const updateData: any = {};
    if (data.companyName) updateData.company_name = data.companyName;
    if (data.cnpj !== undefined) updateData.cnpj = data.cnpj || null;
    if (data.contactName) updateData.contact_name = data.contactName;
    if (data.email !== undefined) updateData.email = data.email || null;
    if (data.phone) updateData.phone = data.phone;
    if (data.status) updateData.status = data.status;
    if (data.notes) updateData.notes = data.notes;
    if (data.zipCode) updateData.zip_code = data.zipCode;
    if (data.address) updateData.address = data.address;
    if (data.number) updateData.number = data.number;
    if (data.neighborhood) updateData.neighborhood = data.neighborhood;
    if (data.city) updateData.city = data.city;
    if (data.state) updateData.state = data.state;

    const { error } = await supabase.from('developers').update(updateData).eq('id', id);

    if (error) {
      console.error('Error updating developer:', error);
      if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
        addToast('Erro: CNPJ já cadastrado para outra incorporadora.', 'error');
      } else {
        addToast('Erro ao atualizar incorporadora: ' + error.message, 'error');
      }
      return;
    }

    setDevelopers(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
    addToast('Incorporadora atualizada com sucesso!', 'success');
  };

  const deleteDeveloper = async (id: string) => {
    const { error } = await supabase.from('developers').delete().eq('id', id);
    if (error) {
      console.error('Error deleting developer:', error);
      addToast('Erro ao excluir incorporadora: ' + error.message, 'error');
      return;
    }
    setDevelopers(prev => prev.filter(d => d.id !== id));
    addToast('Incorporadora excluída com sucesso!', 'success');
  };

  // --- PROJECTS CRUD ---
  const addProject = async (project: Project) => {
    const { data, error } = await supabase.from('projects').insert([{
      name: project.name,
      developer_id: project.developerId,
      address: project.address,
      notes: project.notes,
      status: project.status,
      organization_id: user?.organization_id
    }]).select().single();

    if (error) {
      console.error('Error adding project:', error);
      addToast('Erro ao adicionar empreendimento: ' + error.message, 'error');
      return;
    }

    if (data) {
      setProjects(prev => [...prev, { ...project, id: data.id }]);
      addToast('Empreendimento adicionado com sucesso!', 'success');
    }
  };

  const updateProject = async (id: string, data: Partial<Project>) => {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.developerId) updateData.developer_id = data.developerId;
    if (data.address) updateData.address = data.address;
    if (data.notes) updateData.notes = data.notes;
    if (data.status) updateData.status = data.status;

    const { error } = await supabase.from('projects').update(updateData).eq('id', id);

    if (error) {
      console.error('Error updating project:', error);
      addToast('Erro ao atualizar empreendimento: ' + error.message, 'error');
      return;
    }

    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    addToast('Empreendimento atualizado com sucesso!', 'success');
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      console.error('Error deleting project:', error);
      addToast('Erro ao excluir empreendimento: ' + error.message, 'error');
      return;
    }
    setProjects(prev => prev.filter(p => p.id !== id));
    addToast('Empreendimento excluído com sucesso!', 'success');
  };

  // --- SALES CRUD ---
  const addSale = async (sale: Sale) => {
    // Ensure project exists or create it?
    // For simplicity, we assume project ID is passed or we handle it.
    // In the mock, projectId was a string name. In DB it is UUID.
    // We need to handle this. If projectId is not a UUID, we might need to create a project first.
    // But let's assume for now the UI will be updated to select projects or we create them on the fly.
    // Given the current UI likely sends a string name for projectId (based on mock), we should probably check if it exists in 'projects' table by name, if not create.

    let realProjectId = sale.projectId;

    // Check if projectId is a UUID (simple regex check)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sale.projectId);

    if (!isUuid) {
      // It's a name, try to find or create
      const { data: existingProject } = await supabase.from('projects')
        .select('id')
        .eq('name', sale.projectId)
        .eq('developer_id', sale.developerId)
        .single();

      if (existingProject) {
        realProjectId = existingProject.id;
      } else {
        const { data: newProject } = await supabase.from('projects').insert([{
          name: sale.projectId,
          developer_id: sale.developerId,
          organization_id: user?.organization_id
        }]).select().single();
        if (newProject) realProjectId = newProject.id;
      }
    }

    const { data, error } = await supabase.from('sales').insert([{
      date: sale.date,
      developer_id: sale.developerId,
      project_id: realProjectId,
      unit: sale.unit,
      agent_id: sale.agentId,
      client_id: sale.clientId,
      lead_source: sale.leadSource,
      unit_value: sale.unitValue,
      commission_percent: sale.commissionPercent,
      gross_commission: sale.grossCommission,
      tax_percent: sale.taxPercent,
      tax_value: sale.taxValue,
      misc_expenses_description: sale.miscExpensesDescription,
      misc_expenses_value: sale.miscExpensesValue,
      agent_split_percent: sale.agentSplitPercent,
      agent_commission: sale.agentCommission,
      agency_commission: sale.agencyCommission,
      status: sale.status,
      organization_id: user?.organization_id
    }]).select().single();

    if (error) {
      console.error('Error adding sale:', error);
      console.error('Error adding sale:', error);
      addToast(`Erro ao salvar venda: ${error.message}`, 'error'); // Feedback visual para o usuário
      return;
      return;
    }

    if (data) {
      const newSale = { ...sale, id: data.id, projectId: realProjectId }; // Update with real UUID
      setSales(prev => [newSale, ...prev]);

      if (sale.status === 'approved') {
        // Update Agent Balance
        const agent = agents.find(a => a.id === sale.agentId);
        if (agent) {
          const newTotal = (agent.totalCommissionEarned || 0) + sale.agentCommission;
          await updateAgent(agent.id, { totalCommissionEarned: newTotal });
        }

        // Add Financial Record
        // Find category ID for 'Receita Vendas'
        let catId = categories.find(c => c.name === 'Receita Vendas')?.id;

        // If not found, create it
        if (!catId) {
          const { data: newCat } = await supabase.from('categories').insert([{
            name: 'Receita Vendas',
            type: 'income',
            organization_id: user?.organization_id
          }]).select().single();

          if (newCat) {
            catId = newCat.id;
            setCategories(prev => [...prev, { id: newCat.id, name: 'Receita Vendas', type: 'income', organization_id: user?.organization_id }]);
          }
        }

        if (catId) {
          await addFinancialRecord({
            id: generateId(), // Temp ID, will be replaced by DB
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date().toISOString().split('T')[0],
            description: `Receita Venda ${sale.unit}`,
            amount: sale.agencyCommission,
            type: 'income',
            category: catId,
            status: 'pending'
          });
        }

        // --- NEW: Add Commission Expense Record ---
        let commCatId = categories.find(c => c.name === 'Comissão')?.id;

        if (!commCatId) {
          const { data: newCommCat } = await supabase.from('categories').insert([{
            name: 'Comissão',
            type: 'expense',
            organization_id: user?.organization_id
          }]).select().single();

          if (newCommCat) {
            commCatId = newCommCat.id;
            setCategories(prev => [...prev, { id: newCommCat.id, name: 'Comissão', type: 'expense', organization_id: user?.organization_id }]);
          }
        }

        if (commCatId) {
          await addFinancialRecord({
            id: generateId(),
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date().toISOString().split('T')[0],
            description: `Comissão Venda ${sale.unit} - ${agent?.name}`,
            amount: sale.agentCommission,
            type: 'expense',
            category: commCatId,
            status: 'pending',
            relatedEntityId: sale.agentId // Link to agent for statement
          });
        }
      }
    }
  };

  const updateSale = async (id: string, data: Partial<Sale>) => {
    const updateData: any = {};
    // Map fields...
    if (data.status) updateData.status = data.status;
    // ... add other fields as needed for update. For now assuming status update is main use case.

    const { error } = await supabase.from('sales').update(updateData).eq('id', id);

    if (error) {
      console.error('Error updating sale:', error);
      return;
    }

    setSales(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const deleteSale = async (id: string) => {
    const { error } = await supabase.from('sales').delete().eq('id', id);
    if (error) {
      console.error('Error deleting sale:', error);
      return;
    }
    setSales(prev => prev.filter(s => s.id !== id));
  };

  // --- FINANCE CRUD ---
  const addFinancialRecord = async (record: FinancialRecord) => {
    // Resolve category ID if name passed
    let catId = record.category;
    const catByName = categories.find(c => c.name === record.category);
    if (catByName) catId = catByName.id;

    // Validate UUID for category_id to prevent DB error
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(catId);
    if (!isUuid) {
      console.error('Invalid Category ID:', catId);
      console.error('Invalid Category ID:', catId);
      addToast('Erro: Categoria inválida ou não encontrada. Tente recarregar a página.', 'error');
      return;
      return;
    }

    const { data, error } = await supabase.from('financial_records').insert([{
      description: record.description,
      type: record.type,
      amount: record.amount,
      date: record.date,
      due_date: record.dueDate,
      status: record.status,
      category_id: catId,
      related_entity_id: record.relatedEntityId || null,
      organization_id: user?.organization_id
    }]).select().single();

    if (error) {
      console.error('Error adding financial record:', error);
      console.error('Error adding financial record:', error);
      addToast(`Erro ao salvar registro financeiro: ${error.message}`, 'error');
      return;
      return;
    }

    if (data) {
      setFinancialRecords(prev => [{ ...record, id: data.id, category: catByName ? catByName.name : record.category }, ...prev]);

      if (record.category === 'Comissão' && record.relatedEntityId && record.status === 'paid') {
        const agent = agents.find(a => a.id === record.relatedEntityId);
        if (agent) {
          const newPaid = (agent.totalCommissionPaid || 0) + record.amount;
          await updateAgent(agent.id, { totalCommissionPaid: newPaid });
        }
      }
    }
  };

  const updateFinancialRecord = async (id: string, data: Partial<FinancialRecord>) => {
    const updateData: any = {};

    // Map fields to Supabase columns
    if (data.description) updateData.description = data.description;
    if (data.type) updateData.type = data.type;
    if (data.amount) updateData.amount = data.amount;
    if (data.date) updateData.date = data.date;
    if (data.dueDate) updateData.due_date = data.dueDate;
    if (data.status) updateData.status = data.status;
    if (data.relatedEntityId !== undefined) updateData.related_entity_id = data.relatedEntityId || null;

    // Handle Category Mapping (Name -> ID)
    if (data.category) {
      const catByName = categories.find(c => c.name === data.category);
      if (catByName) {
        updateData.category_id = catByName.id;
      } else {
        // Fallback: check if it is already an ID
        const catById = categories.find(c => c.id === data.category);
        if (catById) updateData.category_id = data.category;
      }
    }

    const { error } = await supabase.from('financial_records').update(updateData).eq('id', id);

    if (error) {
      console.error('Error updating financial record:', error);
      console.error('Error updating financial record:', error);
      addToast(`Erro ao atualizar registro: ${error.message}`, 'error');
      return;
      return;
    }

    // Logic for updating agent paid amount if status changes to paid
    const oldRecord = financialRecords.find(r => r.id === id);
    if (oldRecord && oldRecord.category === 'Comissão' && oldRecord.relatedEntityId) {
      // If changing FROM pending TO paid
      if (oldRecord.status === 'pending' && data.status === 'paid') {
        const agent = agents.find(a => a.id === oldRecord.relatedEntityId);
        if (agent) {
          const newPaid = (agent.totalCommissionPaid || 0) + (data.amount || oldRecord.amount);
          await updateAgent(agent.id, { totalCommissionPaid: newPaid });
        }
      }
      // If changing FROM paid TO pending (undoing payment)
      else if (oldRecord.status === 'paid' && data.status === 'pending') {
        const agent = agents.find(a => a.id === oldRecord.relatedEntityId);
        if (agent) {
          const newPaid = Math.max(0, (agent.totalCommissionPaid || 0) - (oldRecord.amount));
          await updateAgent(agent.id, { totalCommissionPaid: newPaid });
        }
      }
    }

    // Update local state
    setFinancialRecords(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
  };

  const deleteFinancialRecord = async (id: string) => {
    const { error } = await supabase.from('financial_records').delete().eq('id', id);
    if (error) {
      console.error('Error deleting financial record:', error);
      return;
    }
    setFinancialRecords(prev => prev.filter(r => r.id !== id));
  };

  // --- CATEGORIES CRUD ---
  const addCategory = async (category: Category) => {
    const { data, error } = await supabase.from('categories').insert([{
      name: category.name,
      type: category.type,
      organization_id: user?.organization_id
    }]).select().single();

    if (error) {
      console.error('Error adding category:', error);
      return;
    }

    if (data) {
      setCategories(prev => [...prev, { ...category, id: data.id }]);
    }
  };

  const updateCategory = async (id: string, data: Partial<Category>) => {
    const { error } = await supabase.from('categories').update({
      name: data.name,
      type: data.type
    }).eq('id', id);

    if (error) {
      console.error('Error updating category:', error);
      return;
    }
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      console.error('Error deleting category:', error);
      return;
    }
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  return (
    <AppContext.Provider value={{
      user, loading, login, logout,
      usersList, addUser, updateUser, deleteUser,
      agents, addAgent, updateAgent, deleteAgent,
      clients, addClient, updateClient, deleteClient,
      developers, addDeveloper, updateDeveloper, deleteDeveloper,
      projects, addProject, updateProject, deleteProject,
      sales, addSale, updateSale, deleteSale,
      financialRecords, addFinancialRecord, updateFinancialRecord, deleteFinancialRecord,
      categories, addCategory, updateCategory, deleteCategory,
      notifications, markNotificationAsRead, clearAllNotifications,
      events, refreshEvents
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
