import React, { useState } from 'react';
import { useApp } from '../context/AppProvider';
import { Agent } from '../types';
import { generateId } from '../utils';

export const useAgentManager = () => {
    const { agents, addAgent, updateAgent, deleteAgent, sales } = useApp();
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const initialFormState: Partial<Agent> = {
        name: '', cpf: '', email: '', phone: '', creci: '', status: 'active',
        address: '', city: '', state: '', zipCode: '', number: '', neighborhood: '',
        totalCommissionEarned: 0, totalCommissionPaid: 0
    };

    const [formData, setFormData] = useState<Partial<Agent>>(initialFormState);

    const handleOpenAdd = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (agent: Agent) => {
        setFormData(agent);
        setEditingId(agent.id);
        setIsModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            updateAgent(editingId, formData);
            if (selectedAgent?.id === editingId) {
                setSelectedAgent({ ...selectedAgent, ...formData } as Agent);
            }
        } else {
            addAgent({ ...formData, id: generateId() } as Agent);
        }
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if (selectedAgent && window.confirm('Tem certeza que deseja excluir este corretor?')) {
            deleteAgent(selectedAgent.id);
            setSelectedAgent(null);
        }
    };

    const getAgentSales = (agentId: string) => sales.filter(s => s.agentId === agentId);

    const filteredAgents = agents.filter(agent => {
        if (!agent) return false;
        try {
            const term = (searchTerm || '').toLowerCase();
            const name = (agent.name || '').toLowerCase();
            const cpf = (agent.cpf || '').toLowerCase();
            const phone = (agent.phone || '').toLowerCase();
            const creci = (agent.creci || '').toLowerCase();

            return (
                name.includes(term) ||
                cpf.includes(term) ||
                phone.includes(term) ||
                creci.includes(term)
            );
        } catch (err) {
            console.error('Error filtering agent:', agent, err);
            return false;
        }
    });

    return {
        state: {
            selectedAgent,
            isModalOpen,
            editingId,
            searchTerm,
            formData,
            filteredAgents,
            sales
        },
        actions: {
            setSelectedAgent,
            setIsModalOpen,
            setSearchTerm,
            setFormData,
            handleOpenAdd,
            handleOpenEdit,
            handleSave,
            handleDelete,
            getAgentSales
        }
    };
};
