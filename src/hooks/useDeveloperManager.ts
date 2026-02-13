import React, { useState } from 'react';
import { useApp } from '../context/AppProvider';
import { Developer } from '../types';
import { generateId } from '../utils';

export const useDeveloperManager = () => {
    const { developers, addDeveloper, updateDeveloper, deleteDeveloper } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const initialFormState: Partial<Developer> = {
        companyName: '', cnpj: '', contactName: '', status: 'active',
        email: '', phone: '',
        address: '', city: '', state: '', zipCode: '', number: '', neighborhood: '', notes: ''
    };

    const [formData, setFormData] = useState<Partial<Developer>>(initialFormState);

    const filteredDevelopers = developers.filter(d =>
        d.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.cnpj && d.cnpj.includes(searchTerm)) ||
        d.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.city && d.city.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleOpenModal = (developer?: Developer) => {
        if (developer) {
            setFormData(developer);
            setEditingId(developer.id);
        } else {
            setFormData(initialFormState);
            setEditingId(null);
        }
        setIsModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.companyName) return;

        if (editingId) {
            updateDeveloper(editingId, formData);
        } else {
            addDeveloper({ ...formData, id: generateId() } as Developer);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja remover esta incorporadora?')) {
            deleteDeveloper(id);
        }
    };

    return {
        state: {
            searchTerm,
            isModalOpen,
            editingId,
            formData,
            filteredDevelopers
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
