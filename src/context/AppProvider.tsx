
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  AppContextType, Agent, Client, Developer, Sale, FinancialRecord, Category, User, UserRole, Notification, Event, Deal, Lead, OrganizationSettings
} from '../types';
import { generateId } from '../utils';
import { supabase } from '../supabaseClient';
import { salesService } from '../services/salesService';
import { agentService } from '../services/agentService';
import { clientService } from '../services/clientService';
import { developerService } from '../services/developerService';
import { financeService } from '../services/financeService';
import { dealService } from '../services/dealService';
import { leadService } from '../services/leadService';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('AppProvider mounting...');
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [theme, setThemeState] = useState<'dark' | 'light' | 'system'>(() => {
    return (localStorage.getItem('theme') as any) || 'dark';
  });

  const setTheme = useCallback((t: 'dark' | 'light' | 'system') => {
    setThemeState(t);
    localStorage.setItem('theme', t);
  }, []);

  // Apply theme whenever it changes
  useEffect(() => {
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', isDark);
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  const [agents, setAgents] = useState<Agent[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);

  const [sales, setSales] = useState<Sale[]>([]);
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Notifications & Events
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  // --- DATA FETCHING ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        agentsData,
        clientsData,
        developersData,
        salesData,
        financeData,
        categoriesData,
        dealsData,
        leadsData,
        usersResponse,
        eventsResponse
      ] = await Promise.all([
        agentService.getAgents(user?.organizationId),
        clientService.getClients(user?.organizationId),
        developerService.getDevelopers(user?.organizationId),
        salesService.getSales(user?.organizationId),
        financeService.getFinancialRecords(user?.organizationId),
        financeService.getCategories(user?.organizationId),
        dealService.getDeals(user?.organizationId),
        leadService.getLeads(user?.organizationId),
        supabase.from('users').select('*'),
        supabase.from('events').select('*')
      ]);

      setAgents(agentsData);
      setClients(clientsData);
      setDevelopers(developersData);
      setSales(salesData);
      setFinancialRecords(financeData);
      setCategories(categoriesData);
      setDeals(dealsData);
      setLeads(leadsData);

      const { data: usersData } = usersResponse;
      const { data: eventsData } = eventsResponse;

      if (usersData) {
        setUsersList(usersData.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role as UserRole
        })));
      }

      if (eventsData) {
        setEvents(eventsData);
      }

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

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

    // 3. Check Stale Leads (Phase 9)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    leads.forEach(lead => {
      if (lead.status !== 'fechado' && lead.status !== 'perdido') {
        const lastAction = lead.created_at ? new Date(lead.created_at) : new Date();
        if (lastAction < threeDaysAgo) {
          newNotifications.push({
            id: `stale-${lead.id}`,
            title: 'Lead sem Contato',
            message: `${lead.nome} está há mais de 3 dias sem atualização.`,
            type: 'warning',
            date: now.toISOString(),
            read: false,
            link: '/leads'
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

  // --- REALTIME SUBSCRIPTIONS ---
  useEffect(() => {
    if (!user) return;

    console.log('Setting up realtime subscriptions...');

    const channel = supabase
      .channel('app-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sales' },
        (payload) => {
          console.log('Realtime Sales change:', payload);
          fetchData(); // Simplest way to ensure data integrity
          if (payload.eventType === 'INSERT') toast.success('Nova venda registrada!');
          if (payload.eventType === 'UPDATE' && payload.new.status === 'approved') toast.success('Venda aprovada com sucesso!');
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'deals' },
        (payload) => {
          console.log('Realtime Deals change:', payload);
          fetchData();
          if (payload.eventType === 'INSERT') toast.info('Novo negócio no pipeline!');
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        (payload) => {
          console.log('Realtime Leads change:', payload);
          fetchData();
          if (payload.eventType === 'INSERT') toast.info('Novo lead recebido!');
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'financial_records' },
        (payload) => {
          console.log('Realtime Finance change:', payload);
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

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

  // --- WHITE LABEL THEME LOGIC ---
  useEffect(() => {
    if (settings) {
      const root = document.documentElement;
      root.style.setProperty('--primary-color', settings.primary_color);
      root.style.setProperty('--secondary-color', settings.secondary_color);
      root.style.setProperty('--accent-color', settings.accent_color);
    }
  }, [settings]);

  const loadSettings = async (orgId: string) => {
    try {
      const { data, error } = await supabase
        .from('organization_settings')
        .select('*')
        .eq('organization_id', orgId)
        .single();

      if (data) {
        setSettings(data as OrganizationSettings);
      } else if (error && error.code === 'PGRST116') {
        // No settings found, create default
        const defaultSettings = {
          organization_id: orgId,
          company_name: 'Imobiliária CMI',
          system_name: 'CMI CRM',
          primary_color: '#06b6d4',
          secondary_color: '#6366f1',
          accent_color: '#a855f7',
          logo_url: null
        };

        const { data: newData } = await supabase
          .from('organization_settings')
          .insert([defaultSettings])
          .select()
          .single();

        if (newData) setSettings(newData as OrganizationSettings);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  };

  const updateSettings = async (data: Partial<OrganizationSettings>) => {
    if (!settings) return;
    const { error } = await supabase
      .from('organization_settings')
      .update(data)
      .eq('id', settings.id);

    if (error) {
      toast.error('Erro ao atualizar configurações');
      return;
    }
    setSettings(prev => prev ? { ...prev, ...data } : null);
    toast.success('Configurações atualizadas!');
  };

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
        organizationId: userProfile.organization_id,
        phone: (userProfile as any).phone
      });
      if (userProfile.organization_id) {
        loadSettings(userProfile.organization_id);
      }
    } else {
      // Fallback: Check agents (Legacy support)
      const agent = agents.find(a => a.email === authUser.email);
      if (agent) {
        setUser({
          id: agent.id,
          name: agent.name,
          email: authUser.email,
          role: 'agent'
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

    setLoading(true);
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
      phone: newUser.phone
    }]).select().single();

    if (error) {
      console.error('Erro ao adicionar usuário:', error);
      alert('Erro ao adicionar usuário: ' + error.message);
      return;
    }
    if (data) {
      setUsersList(prev => [...prev, { ...newUser, id: data.id }]);
    }
  };

  const updateUser = async (id: string, data: Partial<User>) => {
    const { data: updatedData, error } = await supabase.from('users').update(data).eq('id', id).select();

    if (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }

    if (!updatedData || updatedData.length === 0) {
      console.error('Nenhum usuário atualizado. Verifique as permissões (RLS).');
      throw new Error('Falha ao atualizar perfil. Permissão negada.');
    }

    // Update local users list
    setUsersList(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));

    // If updating current user, update session state
    if (user?.id === id) {
      setUser(prev => prev ? { ...prev, ...data } : null);
    }
  };

  const deleteUser = async (id: string) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) {
      console.error('Erro ao excluir usuário:', error);
      return;
    }
    setUsersList(prev => prev.filter(u => u.id !== id));
  };

  // --- AGENTS CRUD ---
  const addAgent = async (agent: Agent) => {
    const savedAgent = await agentService.addAgent({ ...agent, organizationId: user?.organizationId });
    setAgents(prev => [savedAgent, ...prev]);
  };

  const updateAgent = async (id: string, data: Partial<Agent>) => {
    await agentService.updateAgent(id, data);
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
  };

  const deleteAgent = async (id: string) => {
    await agentService.deleteAgent(id);
    setAgents(prev => prev.filter(a => a.id !== id));
  };

  // --- CLIENTS CRUD ---
  const addClient = async (client: Client) => {
    const savedClient = await clientService.addClient({ ...client, organizationId: user?.organizationId });
    setClients(prev => [savedClient, ...prev]);
  };

  const updateClient = async (id: string, data: Partial<Client>) => {
    await clientService.updateClient(id, data);
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteClient = async (id: string) => {
    await clientService.deleteClient(id);
    setClients(prev => prev.filter(c => c.id !== id));
  };

  // --- DEVELOPERS CRUD ---
  const addDeveloper = async (developer: Developer) => {
    const savedDeveloper = await developerService.addDeveloper({ ...developer, organizationId: user?.organizationId });
    setDevelopers(prev => [savedDeveloper, ...prev]);
  };

  const updateDeveloper = async (id: string, data: Partial<Developer>) => {
    await developerService.updateDeveloper(id, data);
    setDevelopers(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
  };

  const deleteDeveloper = async (id: string) => {
    await developerService.deleteDeveloper(id);
    setDevelopers(prev => prev.filter(d => d.id !== id));
  };

  // --- SALES CRUD ---
  const addSale = async (sale: Sale) => {
    let realProjectId = sale.projectId;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sale.projectId);

    if (!isUuid) {
      const { data: existingProject } = await supabase.from('projects')
        .select('id')
        .eq('name', sale.projectId)
        .eq('developer_id', sale.developerId)
        .eq('organization_id', user?.organizationId)
        .single();

      if (existingProject) {
        realProjectId = existingProject.id;
      } else {
        const { data: newProject } = await supabase.from('projects').insert([{
          name: sale.projectId,
          developer_id: sale.developerId,
          organization_id: user?.organizationId
        }]).select().single();
        if (newProject) realProjectId = newProject.id;
      }
    }

    const newSaleData = { ...sale, projectId: realProjectId, organizationId: user?.organizationId };
    const savedSale = await salesService.addSale(newSaleData);
    setSales(prev => [savedSale, ...prev]);

    // Lógica de automação financeira removida: agora é processada via Trigger (PostgreSQL)
  };

  const updateSale = async (id: string, data: Partial<Sale>) => {
    await salesService.updateSale(id, data);
    setSales(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const deleteSale = async (id: string) => {
    await salesService.deleteSale(id);
    setSales(prev => prev.filter(s => s.id !== id));
  };

  // --- FINANCE CRUD ---
  const addFinancialRecord = async (record: FinancialRecord) => {
    let catId = record.category;
    const catByName = categories.find(c => c.name === record.category);
    if (catByName) catId = catByName.id;

    const newRecordData = { ...record, category: catId, organizationId: user?.organizationId };
    const savedRecord = await financeService.addFinancialRecord(newRecordData);
    setFinancialRecords(prev => [{ ...savedRecord, category: catByName ? catByName.name : record.category, organizationId: user?.organizationId }, ...prev]);

    if (record.category === 'Comissão' && record.relatedEntityId && record.status === 'paid') {
      const agent = agents.find(a => a.id === record.relatedEntityId);
      if (agent) {
        const newPaid = (agent.totalCommissionPaid || 0) + record.amount;
        await updateAgent(agent.id, { totalCommissionPaid: newPaid });
      }
    }
  };

  const updateFinancialRecord = async (id: string, data: Partial<FinancialRecord>) => {
    const updateData: any = { ...data };
    if (data.category) {
      const catByName = categories.find(c => c.name === data.category);
      if (catByName) updateData.category = catByName.id;
    }

    await financeService.updateFinancialRecord(id, updateData);

    const oldRecord = financialRecords.find(r => r.id === id);
    if (oldRecord && oldRecord.category === 'Comissão' && oldRecord.relatedEntityId) {
      if (oldRecord.status === 'pending' && data.status === 'paid') {
        const agent = agents.find(a => a.id === oldRecord.relatedEntityId);
        if (agent) {
          const newPaid = (agent.totalCommissionPaid || 0) + (data.amount || oldRecord.amount);
          await updateAgent(agent.id, { totalCommissionPaid: newPaid });
        }
      } else if (oldRecord.status === 'paid' && data.status === 'pending') {
        const agent = agents.find(a => a.id === oldRecord.relatedEntityId);
        if (agent) {
          const newPaid = Math.max(0, (agent.totalCommissionPaid || 0) - (oldRecord.amount));
          await updateAgent(agent.id, { totalCommissionPaid: newPaid });
        }
      }
    }
    setFinancialRecords(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
  };

  const deleteFinancialRecord = async (id: string) => {
    await financeService.deleteFinancialRecord(id);
    setFinancialRecords(prev => prev.filter(r => r.id !== id));
  };

  // --- CATEGORIES CRUD ---
  const addCategory = async (category: Category) => {
    const savedCategory = await financeService.addCategory({ ...category, organizationId: user?.organizationId });
    setCategories(prev => [savedCategory, ...prev]);
  };

  const updateCategory = async (id: string, data: Partial<Category>) => {
    // Note: financeService updateCategory not implemented, using supabase direct for now
    await supabase.from('categories').update({
      name: data.name,
      type: data.type
    }).eq('id', id);
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteCategory = async (id: string) => {
    await supabase.from('categories').delete().eq('id', id);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // --- DEALS CRUD ---
  const addDeal = async (deal: Deal) => {
    const saved = await dealService.addDeal({ ...deal, organizationId: user?.organizationId });
    setDeals(prev => [saved, ...prev]);
  };

  const updateDeal = async (id: string, data: Partial<Deal>) => {
    await dealService.updateDeal(id, data);
    setDeals(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
  };

  const deleteDeal = async (id: string) => {
    await dealService.deleteDeal(id);
    setDeals(prev => prev.filter(d => d.id !== id));
  };

  // --- LEADS CRUD ---
  const addLead = async (lead: Lead) => {
    const saved = await leadService.addLead({ ...lead, organizationId: user?.organizationId });
    setLeads(prev => [saved, ...prev]);
  };

  const updateLead = async (id: string, data: Partial<Lead>) => {
    await leadService.updateLead(id, data);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
  };

  const deleteLead = async (id: string) => {
    await leadService.deleteLead(id);
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  return (
    <AppContext.Provider value={{
      user, settings, loading, login, logout, updateSettings, theme, setTheme,
      usersList, addUser, updateUser, deleteUser,
      agents, addAgent, updateAgent, deleteAgent,
      clients, addClient, updateClient, deleteClient,
      developers, addDeveloper, updateDeveloper, deleteDeveloper,
      sales, addSale, updateSale, deleteSale,
      financialRecords, addFinancialRecord, updateFinancialRecord, deleteFinancialRecord,
      categories, addCategory, updateCategory, deleteCategory,
      notifications, markNotificationAsRead, clearAllNotifications,
      events, refreshEvents,
      deals, addDeal, updateDeal, deleteDeal,
      leads, addLead, updateLead, deleteLead
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp deve ser usado dentro de um AppProvider');
  return context;
};
