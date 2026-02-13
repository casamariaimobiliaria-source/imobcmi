import React, { createContext, useContext, useState } from 'react';
import { Sale, Agent, Developer, Client } from '../types';
import { salesService } from '../services/salesService';
import { agentService } from '../services/agentService';
import { developerService } from '../services/developerService';
import { clientService } from '../services/clientService';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

interface SalesContextType {
    sales: Sale[];
    setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
    agents: Agent[];
    setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
    developers: Developer[];
    setDevelopers: React.Dispatch<React.SetStateAction<Developer[]>>;
    clients: Client[];
    setClients: React.Dispatch<React.SetStateAction<Client[]>>;
    addSale: (sale: Sale) => Promise<void>;
    updateSale: (id: string, data: Partial<Sale>) => Promise<void>;
    deleteSale: (id: string) => Promise<void>;
    addAgent: (agent: Agent) => Promise<void>;
    updateAgent: (id: string, data: Partial<Agent>) => Promise<void>;
    deleteAgent: (id: string) => Promise<void>;
    addDeveloper: (developer: Developer) => Promise<void>;
    updateDeveloper: (id: string, data: Partial<Developer>) => Promise<void>;
    deleteDeveloper: (id: string) => Promise<void>;
    addClient: (client: Client) => Promise<void>;
    updateClient: (id: string, data: Partial<Client>) => Promise<void>;
    deleteClient: (id: string) => Promise<void>;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [sales, setSales] = useState<Sale[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [developers, setDevelopers] = useState<Developer[]>([]);
    const [clients, setClients] = useState<Client[]>([]);

    const addSale = async (sale: Sale) => {
        let realProjectId = sale.projectId;
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sale.projectId);
        if (!isUuid) {
            const { data: existingProject } = await supabase.from('projects').select('id').eq('name', sale.projectId).eq('developer_id', sale.developerId).eq('organization_id', user?.organizationId).single();
            if (existingProject) realProjectId = existingProject.id;
            else {
                const { data: newProject } = await supabase.from('projects').insert([{ name: sale.projectId, developer_id: sale.developerId, organization_id: user?.organizationId }]).select().single();
                if (newProject) realProjectId = newProject.id;
            }
        }
        const savedSale = await salesService.addSale({ ...sale, projectId: realProjectId, organizationId: user?.organizationId });
        setSales(prev => [savedSale, ...prev]);
    };

    const updateSale = async (id: string, data: Partial<Sale>) => {
        await salesService.updateSale(id, data);
        setSales(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    };

    const deleteSale = async (id: string) => {
        await salesService.deleteSale(id);
        setSales(prev => prev.filter(s => s.id !== id));
    };

    const addAgent = async (agent: Agent) => {
        const saved = await agentService.addAgent({ ...agent, organizationId: user?.organizationId });
        setAgents(prev => [saved, ...prev]);
    };

    const updateAgent = async (id: string, data: Partial<Agent>) => {
        await agentService.updateAgent(id, data);
        setAgents(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
    };

    const deleteAgent = async (id: string) => {
        await agentService.deleteAgent(id);
        setAgents(prev => prev.filter(a => a.id !== id));
    };

    const addDeveloper = async (developer: Developer) => {
        const saved = await developerService.addDeveloper({ ...developer, organizationId: user?.organizationId });
        setDevelopers(prev => [saved, ...prev]);
    };

    const updateDeveloper = async (id: string, data: Partial<Developer>) => {
        await developerService.updateDeveloper(id, data);
        setDevelopers(prev => prev.map(d => d.id === id ? { ...d, ...data } : d));
    };

    const deleteDeveloper = async (id: string) => {
        await developerService.deleteDeveloper(id);
        setDevelopers(prev => prev.filter(d => d.id !== id));
    };

    const addClient = async (client: Client) => {
        const saved = await clientService.addClient({ ...client, organizationId: user?.organizationId });
        setClients(prev => [saved, ...prev]);
    };

    const updateClient = async (id: string, data: Partial<Client>) => {
        await clientService.updateClient(id, data);
        setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    };

    const deleteClient = async (id: string) => {
        await clientService.deleteClient(id);
        setClients(prev => prev.filter(c => c.id !== id));
    };

    return (
        <SalesContext.Provider value={{
            sales, setSales, agents, setAgents, developers, setDevelopers, clients, setClients,
            addSale, updateSale, deleteSale, addAgent, updateAgent, deleteAgent,
            addDeveloper, updateDeveloper, deleteDeveloper, addClient, updateClient, deleteClient
        }}>
            {children}
        </SalesContext.Provider>
    );
};

export const useSales = () => {
    const context = useContext(SalesContext);
    if (!context) throw new Error('useSales deve ser usado dentro de um SalesProvider');
    return context;
};
