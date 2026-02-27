import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppProvider';
import { Sale } from '../types';
import { generateId } from '../utils';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const useSalesManager = () => {
    const { sales, agents, clients, developers, addSale, updateSale, deleteSale, user } = useApp();
    const [view, setView] = useState<'list' | 'form'>('list');
    const [editingId, setEditingId] = useState<string | null>(null);

    // Receipt Modal State
    const [receiptSale, setReceiptSale] = useState<Sale | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const receiptRef = useRef<HTMLDivElement>(null);

    // Filters State
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterDateStart, setFilterDateStart] = useState('');

    // Form State
    const initialFormState: Partial<Sale> = {
        date: new Date().toISOString().split('T')[0],
        commissionPercent: 5.0,
        taxPercent: 6.0,
        agentSplitPercent: 50.0,
        unitValue: 0,
        grossCommission: 0,
        taxValue: 0,
        miscExpensesValue: 0,
        miscExpensesDescription: '',
        agentCommission: 0,
        agencyCommission: 0,
        status: 'pending'
    };

    const [formData, setFormData] = useState<Partial<Sale>>(initialFormState);

    // Set default agent if user is an agent
    useEffect(() => {
        if (user?.role === 'agent' && view === 'form' && !editingId) {
            setFormData(prev => ({ ...prev, agentId: user.id }));
        }
    }, [user, view, editingId]);

    // Handlers
    const handleOpenAdd = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setView('form');
    };

    const handleEdit = (sale: Sale) => {
        setFormData(sale);
        setEditingId(sale.id);
        setView('form');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (user?.role === 'agent') return;

        if (!formData.agentId || !formData.clientId || !formData.developerId) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        if (editingId) {
            updateSale(editingId, formData);
        } else {
            addSale({
                ...formData as unknown as Sale,
                id: generateId()
            });
        }

        setFormData(initialFormState);
        setEditingId(null);
        setView('list');
    };

    const handleDelete = (id: string) => {
        if (user?.role === 'agent') return;
        if (window.confirm('Tem certeza que deseja excluir esta venda?')) {
            deleteSale(id);
        }
    };

    const handleExportPDF = async () => {
        if (!receiptRef.current) return;
        setIsExporting(true);

        try {
            const element = receiptRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`recibo-${receiptSale?.id.substring(0, 8) || 'venda'}.pdf`);
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            alert("Ocorreu um erro ao gerar o PDF. Tente novamente.");
        } finally {
            setIsExporting(false);
        }
    };

    // Filter Logic
    const filteredSales = sales.filter(sale => {
        const matchSearch = sale.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sale.projectId.toLowerCase().includes(searchTerm.toLowerCase());

        let matchAgent = true;
        if (user?.role === 'agent') {
            matchAgent = sale.agentId === user.id;
        }

        const matchDateStart = filterDateStart ? sale.date >= filterDateStart : true;

        return matchSearch && matchAgent && matchDateStart;
    });

    return {
        state: {
            view,
            editingId,
            formData,
            receiptSale,
            isExporting,
            receiptRef,
            searchTerm,
            showFilters,
            filterDateStart,
            filteredSales,
            agents,
            clients,
            developers,
            user
        },
        actions: {
            setView,
            setFormData,
            setReceiptSale,
            setSearchTerm,
            setShowFilters,
            setFilterDateStart,
            handleOpenAdd,
            handleEdit,
            handleSubmit,
            handleDelete,
            handleExportPDF,
            onClearFilters: () => { setSearchTerm(''); setFilterDateStart(''); }
        }
    };
};
