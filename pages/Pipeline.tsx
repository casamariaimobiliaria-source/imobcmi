
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { KanbanColumn } from '../components/KanbanColumn';
import { KanbanCard } from '../components/KanbanCard';
import { supabase } from '../supabaseClient';
import { useApp } from '../context/AppProvider';
import { Deal, DealHistory } from '../types';
import { Plus, Trello, X, Check, Trash2, History as HistoryIcon } from 'lucide-react';
import { format } from 'date-fns';

const STAGES = [
    { id: 'lead', title: 'Lead', color: 'bg-slate-100' },
    { id: 'contact', title: 'Contato', color: 'bg-blue-50' },
    { id: 'visit', title: 'Visita', color: 'bg-yellow-50' },
    { id: 'proposal', title: 'Proposta', color: 'bg-orange-50' },
    { id: 'negotiation', title: 'Negociação', color: 'bg-purple-50' },
    { id: 'closed_won', title: 'Fechado', color: 'bg-green-50' },
    { id: 'closed_lost', title: 'Perdido', color: 'bg-red-50' },
];

export const Pipeline = () => {
    const { clients, agents, user } = useApp();
    const [deals, setDeals] = useState<Deal[]>([]);
    const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        value: '',
        client_id: '',
        agent_id: ''
    });
    const [dealHistory, setDealHistory] = useState<DealHistory[]>([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAgent, setSelectedAgent] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    useEffect(() => {
        fetchDeals();
    }, []);

    const fetchDeals = async () => {
        setLoading(true);
        // Casting supabase to any to avoid strict type checking for now
        const { data, error } = await (supabase as any).from('deals').select('*');
        if (error) {
            console.error('Error fetching deals:', error);
        } else {
            setDeals(data || []);
        }
        setLoading(false);
    };

    const fetchHistory = async (dealId: string) => {
        const { data, error } = await (supabase as any)
            .from('deal_history')
            .select('*')
            .eq('deal_id', dealId)
            .order('created_at', { ascending: false });

        if (data) {
            setDealHistory(data);
        }
    };

    const logHistory = async (dealId: string, action: string, details: any) => {
        if (!user) return;
        await (supabase as any).from('deal_history').insert([{
            deal_id: dealId,
            user_id: user.id,
            action,
            details
        }]);
    };

    const getClientName = (id?: string | null) => {
        if (!id) return undefined;
        return clients.find(c => c.id === id)?.name;
    };

    const filteredDeals = deals.filter(deal => {
        const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getClientName(deal.client_id)?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAgent = selectedAgent ? deal.agent_id === selectedAgent : true;
        return matchesSearch && matchesAgent;
    });

    const navigate = useNavigate();

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const deal = deals.find(d => d.id === active.id);
        if (deal) setActiveDeal(deal);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDeal(null);

        if (!over) return;

        const dealId = active.id as string;
        const newStage = over.id as Deal['stage'];

        const deal = deals.find(d => d.id === dealId);
        if (!deal || deal.stage === newStage) return;

        const oldStage = deal.stage;

        // Optimistic Update
        setDeals(deals.map(d =>
            d.id === dealId ? { ...d, stage: newStage } : d
        ));

        // Backend Update
        // Casting supabase to any to avoid strict type checking for now
        const { error } = await (supabase as any)
            .from('deals')
            .update({ stage: newStage, updated_at: new Date().toISOString() })
            .eq('id', dealId);

        if (error) {
            console.error('Error updating deal stage:', error);
            // Revert on error
            fetchDeals();
            alert('Erro ao mover o card. Tente novamente.');
        } else {
            // Log History
            logHistory(dealId, 'moved', { from: oldStage, to: newStage });

            // Automation Triggers
            if (newStage === 'visit') {
                if (window.confirm('Deseja agendar uma visita para este negócio agora?')) {
                    navigate('/calendar');
                }
            } else if (newStage === 'closed_won') {
                if (window.confirm('Parabéns pela venda! Deseja registrar a venda agora?')) {
                    navigate('/sales');
                }
            }
        }
    };

    const handleDealClick = (deal: Deal) => {
        setEditingDeal(deal);
        setFormData({
            title: deal.title,
            value: deal.value.toString(),
            client_id: deal.client_id || '',
            agent_id: deal.agent_id || ''
        });
        fetchHistory(deal.id);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!editingDeal) return;
        if (confirm('Tem certeza que deseja excluir este negócio?')) {
            try {
                const { error } = await (supabase as any).from('deals').delete().eq('id', editingDeal.id);
                if (error) throw error;
                setIsModalOpen(false);
                fetchDeals();
            } catch (error) {
                console.error('Error deleting deal:', error);
                alert('Erro ao excluir negócio.');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const dealData = {
                title: formData.title,
                value: Number(formData.value),
                client_id: formData.client_id || null,
                agent_id: formData.agent_id || null,
                updated_at: new Date().toISOString()
            };

            let dealId = editingDeal?.id;

            if (editingDeal) {
                const { error } = await (supabase as any).from('deals').update(dealData).eq('id', editingDeal.id);
                if (error) throw error;
                logHistory(editingDeal.id, 'updated', {});
            } else {
                const { data, error } = await (supabase as any)
                    .from('deals')
                    .insert([{ ...dealData, stage: 'lead', created_at: new Date().toISOString() }])
                    .select();
                if (error) throw error;
                if (data && data[0]) {
                    dealId = data[0].id;
                    logHistory(dealId, 'created', {});
                }
            }

            setIsModalOpen(false);
            setFormData({ title: '', value: '', client_id: '', agent_id: '' });
            setEditingDeal(null);
            fetchDeals();
        } catch (error) {
            console.error('Error saving deal:', error);
            alert('Erro ao salvar negócio.');
        }
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 px-1 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Trello className="text-blue-600" />
                        Pipeline de Vendas
                    </h1>
                    <p className="text-slate-500">Gerencie suas oportunidades de negócio.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Buscar por título ou cliente..."
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {/* Filter by Agent */}
                    <select
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-48"
                        value={selectedAgent}
                        onChange={(e) => setSelectedAgent(e.target.value)}
                    >
                        <option value="">Todos os Corretores</option>
                        {agents.map(agent => (
                            <option key={agent.id} value={agent.id}>{agent.name}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => {
                            setEditingDeal(null);
                            setFormData({ title: '', value: '', client_id: '', agent_id: '' });
                            setIsModalOpen(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap justify-center"
                    >
                        <Plus size={20} />
                        Novo Negócio
                    </button>
                </div>
            </div>

            {/* Board */}
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 overflow-x-auto p-1">
                    <div className="inline-flex h-full space-x-4 pb-4">
                        {STAGES.map(stage => (
                            <KanbanColumn
                                key={stage.id}
                                id={stage.id}
                                title={stage.title}
                                color={stage.color}
                                deals={filteredDeals.filter(deal => deal.stage === stage.id)}
                                getClientName={getClientName}
                                onDealClick={handleDealClick}
                            />
                        ))}
                    </div>
                </div>

                <DragOverlay>
                    {activeDeal ? (
                        <div className="transform rotate-2 opacity-80 cursor-grabbing w-[280px]">
                            <KanbanCard deal={activeDeal} clientName={getClientName(activeDeal.client_id)} />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">
                                {editingDeal ? 'Editar Negócio' : 'Novo Negócio'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Ex: Venda Apartamento Centro"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.value}
                                    onChange={e => setFormData({ ...formData, value: e.target.value })}
                                    placeholder="0,00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    value={formData.client_id}
                                    onChange={e => setFormData({ ...formData, client_id: e.target.value })}
                                >
                                    <option value="">Selecione...</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>{client.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Corretor</label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    value={formData.agent_id}
                                    onChange={e => setFormData({ ...formData, agent_id: e.target.value })}
                                >
                                    <option value="">Selecione...</option>
                                    {agents.map(agent => (
                                        <option key={agent.id} value={agent.id}>{agent.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* History Section */}
                            {editingDeal && dealHistory.length > 0 && (
                                <div className="pt-4 border-t border-slate-100">
                                    <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                        <HistoryIcon size={16} />
                                        Histórico
                                    </h4>
                                    <div className="space-y-3 max-h-40 overflow-y-auto">
                                        {dealHistory.map(history => (
                                            <div key={history.id} className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
                                                <div className="flex justify-between mb-1">
                                                    <span className="font-medium capitalize">{history.action === 'moved' ? 'Moveu' : history.action === 'updated' ? 'Editou' : 'Criou'}</span>
                                                    <span className="text-slate-400">{format(new Date(history.created_at), 'dd/MM HH:mm')}</span>
                                                </div>
                                                {history.action === 'moved' && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="bg-white px-1 rounded border border-slate-200">{STAGES.find(s => s.id === history.details.from)?.title}</span>
                                                        <span>→</span>
                                                        <span className="bg-white px-1 rounded border border-slate-200">{STAGES.find(s => s.id === history.details.to)?.title}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
                                {editingDeal && (
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="mr-auto text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                                    >
                                        <Trash2 size={16} /> Excluir
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-2"
                                >
                                    <Check size={16} /> Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
