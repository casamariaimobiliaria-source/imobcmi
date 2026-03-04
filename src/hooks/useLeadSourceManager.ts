import React, { useState } from 'react';
import { useApp } from '../context/AppProvider';
import { LeadSource } from '../types';
import { generateId } from '../utils';
import { toast } from 'sonner';

export const useLeadSourceManager = () => {
    const { leadSources, addLeadSource, updateLeadSource, deleteLeadSource } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const initialFormState: Partial<LeadSource> = {
        name: '', status: 'active'
    };

    const [formData, setFormData] = useState<Partial<LeadSource>>(initialFormState);

    const filteredSources = leadSources.filter(s => {
        return s.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleOpenModal = (source?: LeadSource) => {
        if (source) {
            setFormData(source);
            setEditingId(source.id);
        } else {
            setFormData(initialFormState);
            setEditingId(null);
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;

        try {
            if (editingId) {
                await updateLeadSource(editingId, formData);
                toast.success('Origem/Mídia atualizada com sucesso!');
            } else {
                await addLeadSource({ ...formData, id: generateId() } as LeadSource);
                toast.success('Origem/Mídia criada com sucesso!');
            }
            setIsModalOpen(false);
        } catch (error: any) {
            console.error('Error saving lead source:', error);
            toast.error(`Erro ao salvar mídia: ${error?.message || 'Erro desconhecido'}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja remover esta origem? Muitos leads podem estar atrelados a ela.')) {
            try {
                await deleteLeadSource(id);
                toast.success('Mídia removida com sucesso!');
            } catch (error: any) {
                console.error('Error deleting lead source:', error);
                toast.error(`Erro ao remover mídia: ${error?.message || 'Erro desconhecido'}`);
            }
        }
    };

    return {
        state: {
            searchTerm,
            isModalOpen,
            editingId,
            formData,
            filteredSources
        },
        actions: {
            setSearchTerm,
            setIsModalOpen,
            handleOpenModal,
            handleSave,
            handleDelete,
            setFormData
        }
    };
};
