import React, { createContext, useContext, useState } from 'react';
import { Deal, Lead, LeadSource } from '../types';
import { dealService } from '../services/dealService';
import { leadService } from '../services/leadService';
import { leadSourceService } from '../services/leadSourceService';
import { useAuth } from './AuthContext';

interface CRMContextType {
    deals: Deal[];
    setDeals: React.Dispatch<React.SetStateAction<Deal[]>>;
    leads: Lead[];
    setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
    addDeal: (deal: Deal) => Promise<Deal>;
    updateDeal: (id: string, data: Partial<Deal>) => Promise<void>;
    deleteDeal: (id: string) => Promise<void>;
    addLead: (lead: Lead) => Promise<Lead>;
    updateLead: (id: string, data: Partial<Lead>) => Promise<void>;
    deleteLead: (id: string) => Promise<void>;
    leadSources: LeadSource[];
    setLeadSources: React.Dispatch<React.SetStateAction<LeadSource[]>>;
    addLeadSource: (source: LeadSource) => Promise<LeadSource>;
    updateLeadSource: (id: string, data: Partial<LeadSource>) => Promise<void>;
    deleteLeadSource: (id: string) => Promise<void>;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [deals, setDeals] = useState<Deal[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [leadSources, setLeadSources] = useState<LeadSource[]>([]);

    const addDeal = async (deal: Deal) => {
        const saved = await dealService.addDeal({ ...deal, organizationId: user?.organizationId });
        setDeals(prev => [saved, ...prev]);
        return saved;
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
        return saved;
    };

    const updateLead = async (id: string, data: Partial<Lead>) => {
        await leadService.updateLead(id, data);
        setLeads(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
    };

    const deleteLead = async (id: string) => {
        await leadService.deleteLead(id);
        setLeads(prev => prev.filter(l => l.id !== id));
    };

    const addLeadSource = async (source: LeadSource) => {
        const saved = await leadSourceService.addLeadSource({ ...source, organizationId: user?.organizationId });
        setLeadSources(prev => [saved, ...prev]);
        return saved;
    };

    const updateLeadSource = async (id: string, data: Partial<LeadSource>) => {
        await leadSourceService.updateLeadSource(id, data);
        setLeadSources(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    };

    const deleteLeadSource = async (id: string) => {
        await leadSourceService.deleteLeadSource(id);
        setLeadSources(prev => prev.filter(s => s.id !== id));
    };

    return (
        <CRMContext.Provider value={{
            deals, setDeals, leads, setLeads, addDeal, updateDeal, deleteDeal, addLead, updateLead, deleteLead,
            leadSources, setLeadSources, addLeadSource, updateLeadSource, deleteLeadSource
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
