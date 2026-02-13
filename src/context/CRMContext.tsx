import React, { createContext, useContext, useState } from 'react';
import { Deal, Lead } from '../types';
import { dealService } from '../services/dealService';
import { leadService } from '../services/leadService';
import { useAuth } from './AuthContext';

interface CRMContextType {
    deals: Deal[];
    setDeals: React.Dispatch<React.SetStateAction<Deal[]>>;
    leads: Lead[];
    setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
    addDeal: (deal: Deal) => Promise<void>;
    updateDeal: (id: string, data: Partial<Deal>) => Promise<void>;
    deleteDeal: (id: string) => Promise<void>;
    addLead: (lead: Lead) => Promise<void>;
    updateLead: (id: string, data: Partial<Lead>) => Promise<void>;
    deleteLead: (id: string) => Promise<void>;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [deals, setDeals] = useState<Deal[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);

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
        <CRMContext.Provider value={{
            deals, setDeals, leads, setLeads, addDeal, updateDeal, deleteDeal, addLead, updateLead, deleteLead
        }}>
            {children}
        </CRMContext.Provider>
    );
};

export const useCRM = () => {
    const context = useContext(CRMContext);
    if (!context) throw new Error('useCRM deve ser usado dentro de um CRMProvider');
    return context;
};
