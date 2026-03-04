
import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { KanbanColumn } from '../components/KanbanColumn';
import { KanbanCard } from '../components/KanbanCard';
import { supabase } from '../supabaseClient';
import { useApp } from '../context/AppProvider';
import { Deal } from '../types';
import { Plus, Trello, X, Check, Trash2 } from 'lucide-react';

const STAGES = [
    { id: 'lead', title: 'Lead', color: 'bg-cyan-500/20 border-cyan-500/40' },
    { id: 'contact', title: 'Contato', color: 'bg-blue-500/20 border-blue-500/40' },
    { id: 'visit', title: 'Visita', color: 'bg-purple-500/20 border-purple-500/40' },
    { id: 'proposal', title: 'Proposta', color: 'bg-orange-500/20 border-orange-500/40' },
    { id: 'negotiation', title: 'Negociação', color: 'bg-pink-500/20 border-pink-500/40' },
    { id: 'closed_won', title: 'Fechado', color: 'bg-emerald-500/20 border-emerald-500/40' },
    { id: 'closed_lost', title: 'Perdido', color: 'bg-red-500/20 border-red-500/40' },
];

export const Pipeline = () => {
    const {
        clients, agents, leads, deals, projects,
        addClient, addDeal, updateDeal, deleteDeal,
        fetchData, loading: globalLoading
    } = useApp();

    const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        value: '',
        client_id: '',
        lead_id: '',
        agent_id: ''
    });

    const formatCurrency = (value: string | number) => {
        const val = typeof value === 'string' ? value.replace(/\D/g, '') : value.toString();
        const amount = Number(val) / 100;
        if (isNaN(amount)) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(amount);
    };

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        setFormData({ ...formData, value: rawValue });
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const getEntityName = (deal: Deal) => {
        if (deal.client_id) {
            return clients.find(c => c.id === deal.client_id)?.name;
        }
        if (deal.lead_id) {
            return leads.find(l => l.id === deal.lead_id)?.nome;
        }
        return undefined;
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const deal = deals.find(d => d.id === active.id);
        if (deal) setActiveDeal(deal);
    };

    const convertLeadToClient = async (leadId: string, orgId?: string) => {
        const lead = leads.find(l => l.id === leadId);
        if (!lead) return null;

        try {
            const newClient = await addClient({
                id: '', // Will be generated
                name: lead.nome,
                email: lead.email || '',
                phone: lead.telefone || '',
                cpfCnpj: '', // Lead might not have this, leave empty for now
                status: 'active',
                organizationId: orgId || lead.organizationId
            } as any);
            return newClient.id;
        } catch (error) {
            console.error('Error converting lead to client:', error);
            return null;
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDeal(null);

        if (!over) return;

        const dealId = active.id as string;
        const newStage = over.id as Deal['stage'];

        const deal = deals.find(d => d.id === dealId);
        if (!deal || deal.stage === newStage) return;

        let clientUpdateId = deal.client_id;

        // Auto-conversion logic
        if (newStage === 'closed_won' && !deal.client_id && deal.lead_id) {
            const convertedClientId = await convertLeadToClient(deal.lead_id, deal.organizationId);
            if (convertedClientId) {
                clientUpdateId = convertedClientId;
            }
        }

        try {
            await updateDeal(dealId, {
                stage: newStage,
                client_id: clientUpdateId,
                updated_at: new Date().toISOString()
            });

            if (newStage === 'closed_won') {
                // Refresh data to show the new client correctly everywhere
                fetchData(false);
            }
        } catch (error) {
            console.error('Error updating deal stage:', error);
            alert('Erro ao mover o card. Tente novamente.');
        }
    };

    const handleDealClick = (deal: Deal) => {
        setEditingDeal(deal);
        setFormData({
            title: deal.title,
            value: (deal.value * 100).toString(), // Convert to raw integer-like string for the mask
            client_id: deal.client_id || '',
            lead_id: deal.lead_id || '',
            agent_id: deal.agent_id || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!editingDeal) return;
        if (confirm('Tem certeza que deseja excluir este negócio?')) {
            try {
                await deleteDeal(editingDeal.id);
                setIsModalOpen(false);
            } catch (error) {
                console.error('Error deleting deal:', error);
                alert('Erro ao excluir negócio.');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const dealValue = Number(formData.value) / 100;
            const dealData = {
                title: formData.title,
                value: dealValue,
                client_id: formData.client_id || null,
                lead_id: formData.lead_id || null,
                agent_id: formData.agent_id || null,
                updated_at: new Date().toISOString()
            };

            if (editingDeal) {
                await updateDeal(editingDeal.id, dealData);
            } else {
                await addDeal({
                    ...dealData,
                    id: '',
                    stage: 'lead',
                    created_at: new Date().toISOString()
                } as any);
            }

            setIsModalOpen(false);
            setFormData({ title: '', value: '', client_id: '', lead_id: '', agent_id: '' });
            setEditingDeal(null);
        } catch (error) {
            console.error('Error saving deal:', error);
            alert('Erro ao salvar negócio.');
        }
    };

    return (
        <div className="h-full flex flex-col animate-in fade-in duration-500 overflow-hidden">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 md:mb-8 gap-4 px-1 flex-shrink-0">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tighter uppercase italic flex items-center gap-3">
                        <Trello className="text-primary" size={24} />
                        Pipeline de <span className="text-primary">Vendas</span>
                    </h1>
                    <p className="text-muted-foreground font-bold text-[9px] md:text-[10px] uppercase tracking-widest mt-1">Gerencie suas oportunidades de negócio com precisão.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingDeal(null);
                        setFormData({ title: '', value: '', client_id: '', lead_id: '', agent_id: '' });
                        setIsModalOpen(true);
                    }}
                    className="premium-button shadow-[0_0_20px_rgba(6,182,212,0.2)] w-full lg:w-auto justify-center"
                >
                    <Plus size={18} />
                    Novo Negócio
                </button>
            </div>

            {/* Board */}
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 overflow-x-auto p-1 custom-scrollbar">
                    <div className="inline-flex h-full space-x-6 pb-6">
                        {STAGES.map(stage => (
                            <KanbanColumn
                                key={stage.id}
                                id={stage.id}
                                title={stage.title}
                                color={stage.color}
                                deals={deals.filter(deal => deal.stage === stage.id)}
                                getEntityName={getEntityName}
                                onDealClick={handleDealClick}
                            />
                        ))}
                    </div>
                </div>

                <DragOverlay>
                    {activeDeal ? (
                        <div className="transform rotate-2 opacity-90 cursor-grabbing w-[300px] shadow-2xl">
                            <KanbanCard deal={activeDeal} clientName={getEntityName(activeDeal)} />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center p-0 md:p-4 overflow-y-auto">
                    <div className="premium-card !bg-background w-full h-full md:h-auto md:max-w-md animate-in zoom-in-95 duration-200 border-white/10 shadow-3xl flex flex-col md:rounded-[2.5rem] rounded-none">
                        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-transparent">
                            <h3 className="text-xl font-black text-slate-800 dark:text-foreground italic uppercase tracking-tighter">
                                {editingDeal ? (
                                    <>Editar <span className="text-cyan-600 dark:text-primary">Negócio</span></>
                                ) : (
                                    <>Novo <span className="text-cyan-600 dark:text-primary">Negócio</span></>
                                )}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-800 dark:text-muted-foreground dark:hover:text-foreground transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest mb-2">Empreendimento (Título)</label>
                                <select
                                    required
                                    className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:border-cyan-500/50 outline-none transition-all appearance-none cursor-pointer font-bold"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                >
                                    <option value="" className="text-slate-500">Selecione o empreendimento...</option>
                                    {projects.map(project => (
                                        <option key={project.id} value={project.name} className="text-slate-800 dark:bg-[#0f0f12] dark:text-white">
                                            {project.name}
                                        </option>
                                    ))}
                                    {/* Fallback for cases where project is not in list or generic name is preferred */}
                                    {formData.title && !projects.some(p => p.name === formData.title) && (
                                        <option value={formData.title}>{formData.title}</option>
                                    )}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest mb-2">Valor Estimado</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:border-cyan-500/50 outline-none transition-all font-bold"
                                        value={formatCurrency(formData.value)}
                                        onChange={handleValueChange}
                                        placeholder="R$ 0,00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest mb-2">Status</label>
                                    <div className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-slate-600 dark:text-slate-400 text-sm italic font-bold uppercase tracking-tighter">
                                        {editingDeal ? editingDeal.stage.replace('_', ' ') : 'LEAD'}
                                    </div>
                                </div>
                            </div>

                            {(!editingDeal || !editingDeal.client_id) ? (
                                <div>
                                    <label className="block text-[10px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest mb-2">Lead Relacionado</label>
                                    <select
                                        className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:border-cyan-500/50 outline-none transition-all appearance-none cursor-pointer font-bold"
                                        value={formData.lead_id}
                                        onChange={e => setFormData({ ...formData, lead_id: e.target.value })}
                                    >
                                        <option value="" className="text-slate-500">Selecione um lead...</option>
                                        {leads.map(lead => (
                                            <option key={lead.id} value={lead.id} className="text-slate-800 dark:bg-[#0f0f12] dark:text-white">{lead.nome}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-[10px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest mb-2">Cliente (Convertido)</label>
                                    <div className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-slate-800 dark:text-white text-sm font-bold italic">
                                        {clients.find(c => c.id === formData.client_id)?.name || 'Cliente Desconhecido'}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest mb-2">Responsável (Corretor)</label>
                                <select
                                    className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:border-cyan-500/50 outline-none transition-all appearance-none cursor-pointer font-bold"
                                    value={formData.agent_id}
                                    onChange={e => setFormData({ ...formData, agent_id: e.target.value })}
                                >
                                    <option value="" className="text-slate-500">Selecione um corretor...</option>
                                    {agents.map(agent => (
                                        <option key={agent.id} value={agent.id} className="text-slate-800 dark:bg-[#0f0f12] dark:text-white">{agent.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-between gap-4 pt-4 border-t border-white/10 mt-4">
                                {editingDeal && (
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="text-red-500 hover:text-white hover:bg-red-500/20 px-3 py-2 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                                    >
                                        <Trash2 size={16} /> Excluir
                                    </button>
                                )}
                                <div className="flex gap-3 ml-auto">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-2 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="premium-button"
                                    >
                                        <Check size={16} /> Salvar Alterações
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
