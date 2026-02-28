
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  AppContextType, UserRole
} from '../types';
import { supabase } from '../supabaseClient';
import { salesService } from '../services/salesService';
import { agentService } from '../services/agentService';
import { clientService } from '../services/clientService';
import { developerService } from '../services/developerService';
import { financeService } from '../services/financeService';
import { dealService } from '../services/dealService';
import { leadService } from '../services/leadService';

import { AuthProvider, useAuth } from './AuthContext';
import { UIProvider, useUI } from './UIContext';
import { SalesProvider, useSales } from './SalesContext';
import { FinanceProvider, useFinance } from './FinanceContext';
import { CRMProvider, useCRM } from './CRMContext';

const AppContext = createContext<AppContextType | undefined>(undefined);

const AppDataOrchestrator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, settings, loading: authLoading, login, logout, updateSettings } = useAuth();
  const { theme, setTheme, notifications, markNotificationAsRead, clearAllNotifications, events, setEvents, refreshEvents, setNotifications } = useUI();
  const { sales, setSales, agents, setAgents, developers, setDevelopers, clients, setClients, addSale, updateSale, deleteSale, addAgent, updateAgent, deleteAgent, addDeveloper, updateDeveloper, deleteDeveloper, addClient, updateClient, deleteClient } = useSales();
  const { financialRecords, setFinancialRecords, categories, setCategories, addFinancialRecord, updateFinancialRecord, deleteFinancialRecord, addCategory, updateCategory, deleteCategory, bankAccounts, setBankAccounts, addBankAccount, updateBankAccount, deleteBankAccount, paymentMethods, setPaymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod } = useFinance();
  const { deals, setDeals, leads, setLeads, addDeal, updateDeal, deleteDeal, addLead, updateLead, deleteLead } = useCRM();

  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const orgId = user?.organizationId;
      const [
        agentsData, clientsData, developersData, salesData,
        financeData, categoriesData, dealsData, leadsData,
        usersResponse, eventsResponse, bankAccountsData, paymentMethodsData
      ] = await Promise.all([
        agentService.getAgents(orgId),
        clientService.getClients(orgId),
        developerService.getDevelopers(orgId),
        salesService.getSales(orgId),
        financeService.getFinancialRecords(orgId),
        financeService.getCategories(orgId),
        dealService.getDeals(orgId),
        leadService.getLeads(orgId),
        supabase.from('users').select('*'),
        supabase.from('events').select('*'),
        financeService.getBankAccounts(orgId),
        financeService.getPaymentMethods(orgId)
      ]);

      setAgents(agentsData);
      setClients(clientsData);
      setDevelopers(developersData);
      setSales(salesData);
      setFinancialRecords(financeData);
      setCategories(categoriesData);
      setBankAccounts(bankAccountsData);
      setPaymentMethods(paymentMethodsData);
      setDeals(dealsData);
      setLeads(leadsData);
      if (usersResponse.data) setUsersList(usersResponse.data);
      if (eventsResponse.data) setEvents(eventsResponse.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) { // Only fetch data if a user is logged in
      fetchData();
    } else {
      setLoading(false); // If no user, stop loading
    }
  }, [user]);

  // Notifications Logic (Internal to Orchestrator for now)
  const checkNotifications = () => {
    const newNotifications: any[] = [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    events.forEach(event => {
      const eventTime = new Date(event.start_time);
      const diffMins = (eventTime.getTime() - now.getTime()) / (1000 * 60);
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

    financialRecords.forEach(record => {
      if (record.status === 'pending' && record.type === 'expense') {
        if (record.dueDate === todayStr) {
          newNotifications.push({ id: `fin-${record.id}`, title: 'Conta Vence Hoje', message: `${record.description} vence hoje.`, type: 'warning', date: now.toISOString(), read: false, link: '/finance' });
        } else if (record.dueDate && record.dueDate < todayStr) {
          newNotifications.push({ id: `fin-overdue-${record.id}`, title: 'Conta Atrasada', message: `${record.description} venceu em ${record.dueDate}.`, type: 'error', date: now.toISOString(), read: false, link: '/finance' });
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

    setNotifications(prev => {
      const existingIds = new Set(prev.map(n => n.id));
      const uniqueNew = newNotifications.filter(n => !existingIds.has(n.id));
      return [...prev, ...uniqueNew];
    });
  };

  useEffect(() => {
    if (!loading && user) { // Only check notifications if data is loaded and user is present
      checkNotifications();
      const interval = setInterval(checkNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [loading, user, events, financialRecords, leads]); // Added leads to dependencies

  // Realtime Subscriptions
  useEffect(() => {
    if (!user) return;
    console.log('Setting up realtime subscriptions...');
    const channel = supabase.channel('app-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, (p) => {
        fetchData();
        if (p.eventType === 'INSERT') toast.success('Nova venda registrada!');
        if (p.eventType === 'UPDATE' && (p.new as any).status === 'approved') toast.success('Venda aprovada com sucesso!');
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, (p) => {
        fetchData();
        if (p.eventType === 'INSERT') toast.info('Novo negócio no pipeline!');
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (p) => {
        fetchData();
        if (p.eventType === 'INSERT') toast.info('Novo lead recebido!');
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'financial_records' }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const addUser = async (u: any) => {
    const { data, error } = await supabase.from('users').insert([{ name: u.name, email: u.email, role: u.role, phone: u.phone, organization_id: user?.organizationId }]).select().single();
    if (error) {
      console.error('Erro ao adicionar usuário:', error);
      toast.error('Erro ao adicionar usuário: ' + error.message);
      return;
    }
    if (data) {
      setUsersList(p => [...p, data]);
      toast.success('Usuário adicionado com sucesso!');
    }
  };

  const updateUser = async (id: string, data: any) => {
    const { data: updatedData, error } = await supabase.from('users').update(data).eq('id', id).select();
    if (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error('Erro ao atualizar usuário: ' + error.message);
      throw error;
    }
    if (!updatedData || updatedData.length === 0) {
      console.error('Nenhum usuário atualizado. Verifique as permissões (RLS).');
      toast.error('Falha ao atualizar perfil. Permissão negada.');
      throw new Error('Falha ao atualizar perfil. Permissão negada.');
    }
    setUsersList(p => p.map(u => u.id === id ? { ...u, ...data } : u));
    toast.success('Usuário atualizado com sucesso!');
  };

  const deleteUser = async (id: string) => {
    // Delete from organization_members first to avoid FK constraint violation
    const { error: orgMemberError } = await supabase.from('organization_members' as any).delete().eq('user_id', id);
    if (orgMemberError) {
      console.warn('Could not delete organization_members, might not exist or need permission:', orgMemberError);
    }

    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) {
      console.error('Erro ao excluir usuário:', error);
      toast.error('Erro ao excluir usuário: ' + error.message);
      return;
    }
    setUsersList(p => p.filter(u => u.id !== id));
    toast.success('Usuário excluído com sucesso!');
  };

  return (
    <AppContext.Provider value={{
      user, settings, loading: loading || authLoading, login, logout, updateSettings, theme, setTheme,
      usersList, addUser, updateUser, deleteUser,
      agents, addAgent, updateAgent, deleteAgent,
      clients, addClient, updateClient, deleteClient,
      developers, addDeveloper, updateDeveloper, deleteDeveloper,
      sales, addSale, updateSale, deleteSale,
      financialRecords, addFinancialRecord, updateFinancialRecord, deleteFinancialRecord,
      categories, addCategory, updateCategory, deleteCategory,
      bankAccounts, addBankAccount, updateBankAccount, deleteBankAccount,
      paymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod,
      notifications, markNotificationAsRead, clearAllNotifications,
      events, refreshEvents,
      deals, addDeal, updateDeal, deleteDeal,
      leads, addLead, updateLead, deleteLead
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <UIProvider>
        <SalesProvider>
          <FinanceProvider>
            <CRMProvider>
              <AppDataOrchestrator>
                {children}
              </AppDataOrchestrator>
            </CRMProvider>
          </FinanceProvider>
        </SalesProvider>
      </UIProvider>
    </AuthProvider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp deve ser usado dentro de um AppProvider');
  return context;
};
