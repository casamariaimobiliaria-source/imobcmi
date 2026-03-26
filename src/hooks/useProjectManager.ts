import React, { useState } from 'react';
import { useApp } from '../context/AppProvider';
import { Project } from '../types';
import { generateId } from '../utils';
import { toast } from 'sonner';

export const useProjectManager = () => {
    const { projects, addProject, updateProject, deleteProject, developers } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const initialFormState: Partial<Project> = {
        name: '', developerId: '', status: 'active',
        address: '', notes: ''
    };

    const [formData, setFormData] = useState<Partial<Project>>(initialFormState);

    const filteredProjects = projects.filter(p => {
        const dev = developers.find(d => d.id === p.developerId);
        const devName = dev ? dev.companyName.toLowerCase() : '';
        return p.name.toLowerCase().includes(searchTerm.toLowerCase()) || devName.includes(searchTerm.toLowerCase());
    });

    const handleOpenModal = (project?: Project) => {
        if (project) {
            setFormData(project);
            setEditingId(project.id);
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
                await updateProject(editingId, formData);
                toast.success('Projeto atualizado com sucesso!');
            } else {
                await addProject({ ...formData, id: generateId() } as Project);
                toast.success('Projeto criado com sucesso!');
            }
            setIsModalOpen(false);
        } catch (error: any) {
            console.error('Error saving project:', error);
            toast.error(`Erro ao salvar projeto: ${error?.message || 'Erro desconhecido'}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja remover este projeto?')) {
            try {
                await deleteProject(id);
                toast.success('Projeto removido com sucesso!');
            } catch (error: any) {
                console.error('Error deleting project:', error);
                toast.error(`Erro ao remover projeto: ${error?.message || 'Erro desconhecido'}`);
            }
        }
    };

    return {
        state: {
            searchTerm,
            isModalOpen,
            editingId,
            formData,
            filteredProjects
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
