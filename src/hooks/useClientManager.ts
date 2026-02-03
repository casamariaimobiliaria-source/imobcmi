import React, { useState } from 'react';
import { useApp } from '../context/AppProvider';
import { Client, Deal, Event } from '../types';
import { generateId } from '../utils';
import { supabase } from '../supabaseClient';

export const useClientManager = () => {
    const { clients, addClient, updateClient, deleteClient } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Client History Data
    const [clientDeals, setClientDeals] = useState<Deal[]>([]);
    const [clientEvents, setClientEvents] = useState<Event[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const initialFormState: Partial<Client> = {
        name: '', cpfCnpj: '', email: '', phone: '', status: 'active', birthDate: '',
        address: '', city: '', state: '', zipCode: '', number: '', neighborhood: '', notes: '',
        preferences: {
            propertyType: [],
            minBudget: 0,
            maxBudget: 0,
            bedrooms: 0,
            garages: 0,
            neighborhoods: [],
            purpose: 'buy'
        }
    };

    const [formData, setFormData] = useState<Partial<Client>>(initialFormState);

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.cpfCnpj && c.cpfCnpj.includes(searchTerm)) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleOpenModal = (client?: any) => {
        console.log('🔍 handleOpenModal called with:', client);

        if (client) {
            const incomingPrefs = client.preferences || {};

            console.log('📝 Incoming preferences:', incomingPrefs);

            const newFormData = {
                ...client,
                // Safe mapping
                cpfCnpj: client.cpfCnpj || client.cpf_cnpj || '',
                zipCode: client.zipCode || client.zip_code || '',

                // CRITICAL: Ensure arrays are arrays. Spread can overwrite with undefined.
                preferences: {
                    ...initialFormState.preferences,
                    ...incomingPrefs,
                    propertyType: Array.isArray(incomingPrefs.propertyType) ? incomingPrefs.propertyType : [],
                    neighborhoods: Array.isArray(incomingPrefs.neighborhoods) ? incomingPrefs.neighborhoods : []
                }
            };

            console.log('✅ Setting form data:', newFormData);
            setFormData(newFormData);
            setEditingId(client.id);
        } else {
            console.log('➕ Opening new client form');
            setFormData(initialFormState);
            setEditingId(null);
        }

        console.log('🚪 Opening modal...');
        setIsModalOpen(true);
    };

    const handleOpenDetails = async (client: Client) => {
        setSelectedClient(client);
        setIsDetailsOpen(true);
        setLoadingHistory(true);

        try {
            const { data: deals } = await (supabase as any).from('deals').select('*').eq('client_id', client.id);
            const { data: events } = await (supabase as any).from('events').select('*').eq('client_id', client.id);

            if (deals) setClientDeals(deals);
            if (events) setClientEvents(events);
        } catch (error) {
            console.error("Error fetching history", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleCloseDetails = () => {
        setIsDetailsOpen(false);
        setSelectedClient(null);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('💾 handleSave called');
        console.log('📋 Form Data:', formData);
        console.log('🆔 Editing ID:', editingId);

        if (!formData.name) {
            console.error('❌ Name is required!');
            return;
        }

        if (editingId) {
            console.log('✏️ Updating client:', editingId);
            updateClient(editingId, formData);
        } else {
            console.log('➕ Adding new client');
            addClient({ ...formData, id: generateId() } as Client);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
            deleteClient(id);
        }
    };

    const togglePreference = (field: 'propertyType' | 'neighborhoods', value: string) => {
        const current = formData.preferences?.[field] || [];
        const updated = current.includes(value)
            ? current.filter(item => item !== value)
            : [...current, value];

        setFormData({
            ...formData,
            preferences: { ...formData.preferences!, [field]: updated }
        });
    };

    return {
        state: {
            searchTerm,
            isModalOpen,
            isDetailsOpen,
            selectedClient,
            editingId,
            clientDeals,
            clientEvents,
            loadingHistory,
            formData,
            filteredClients
        },
        actions: {
            setSearchTerm,
            setIsModalOpen,
            setIsDetailsOpen,
            setSelectedClient,
            handleOpenModal,
            handleOpenDetails,
            handleCloseDetails,
            handleSave,
            handleDelete,
            togglePreference,
            setFormData
        }
    };
};
