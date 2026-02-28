import React, { createContext, useContext, useState } from 'react';
import { FinancialRecord, Category, BankAccount, PaymentMethod } from '../types';
import { financeService } from '../services/financeService';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';
import { useSales } from './SalesContext';

interface FinanceContextType {
    financialRecords: FinancialRecord[];
    setFinancialRecords: React.Dispatch<React.SetStateAction<FinancialRecord[]>>;
    categories: Category[];
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
    addFinancialRecord: (record: FinancialRecord) => Promise<void>;
    updateFinancialRecord: (id: string, data: Partial<FinancialRecord>) => Promise<void>;
    deleteFinancialRecord: (id: string) => Promise<void>;
    addCategory: (category: Category) => Promise<void>;
    updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;

    bankAccounts: BankAccount[];
    setBankAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>;
    addBankAccount: (account: BankAccount) => Promise<void>;
    updateBankAccount: (id: string, data: Partial<BankAccount>) => Promise<void>;
    deleteBankAccount: (id: string) => Promise<void>;

    paymentMethods: PaymentMethod[];
    setPaymentMethods: React.Dispatch<React.SetStateAction<PaymentMethod[]>>;
    addPaymentMethod: (method: PaymentMethod) => Promise<void>;
    updatePaymentMethod: (id: string, data: Partial<PaymentMethod>) => Promise<void>;
    deletePaymentMethod: (id: string) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { agents, updateAgent } = useSales();
    const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

    const addFinancialRecord = async (record: FinancialRecord) => {
        let catId = record.category;
        const catByName = categories.find(c => c.name === record.category);
        if (catByName) catId = catByName.id;
        const saved = await financeService.addFinancialRecord({ ...record, category: catId, organizationId: user?.organizationId });
        setFinancialRecords(prev => [{ ...saved, category: catByName ? catByName.name : record.category, organizationId: user?.organizationId }, ...prev]);

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

    const addCategory = async (category: Category) => {
        const saved = await financeService.addCategory({ ...category, organizationId: user?.organizationId });
        setCategories(prev => [saved, ...prev]);
    };

    const updateCategory = async (id: string, data: Partial<Category>) => {
        await supabase.from('categories').update({ name: data.name, type: data.type }).eq('id', id);
        setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    };

    const deleteCategory = async (id: string) => {
        await supabase.from('categories').delete().eq('id', id);
        setCategories(prev => prev.filter(c => c.id !== id));
    };

    const addBankAccount = async (account: BankAccount) => {
        const saved = await financeService.addBankAccount({ ...account, organizationId: user?.organizationId });
        setBankAccounts(prev => [saved, ...prev]);
    };

    const updateBankAccount = async (id: string, data: Partial<BankAccount>) => {
        await financeService.updateBankAccount(id, data);
        setBankAccounts(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
    };

    const deleteBankAccount = async (id: string) => {
        await financeService.deleteBankAccount(id);
        setBankAccounts(prev => prev.filter(b => b.id !== id));
    };

    const addPaymentMethod = async (method: PaymentMethod) => {
        const saved = await financeService.addPaymentMethod({ ...method, organizationId: user?.organizationId });
        setPaymentMethods(prev => [saved, ...prev]);
    };

    const updatePaymentMethod = async (id: string, data: Partial<PaymentMethod>) => {
        await financeService.updatePaymentMethod(id, data);
        setPaymentMethods(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    };

    const deletePaymentMethod = async (id: string) => {
        await financeService.deletePaymentMethod(id);
        setPaymentMethods(prev => prev.filter(p => p.id !== id));
    };

    return (
        <FinanceContext.Provider value={{
            financialRecords, setFinancialRecords, categories, setCategories,
            addFinancialRecord, updateFinancialRecord, deleteFinancialRecord,
            addCategory, updateCategory, deleteCategory,
            bankAccounts, setBankAccounts, addBankAccount, updateBankAccount, deleteBankAccount,
            paymentMethods, setPaymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod
        }}>
            {children}
        </FinanceContext.Provider>
    );
};

export const useFinance = () => {
    const context = useContext(FinanceContext);
    if (!context) throw new Error('useFinance deve ser usado dentro de um FinanceProvider');
    return context;
};
