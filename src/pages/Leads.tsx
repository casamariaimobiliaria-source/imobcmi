import React, { useState, useEffect } from 'react';
import {
    Search, Plus, Filter, Users, Calendar,
    MoreHorizontal, Edit, Trash2, Mail, Phone,
    MessageSquare, Sparkles, LayoutGrid, List as ListIcon,
    AlertCircle, CheckCircle2, Clock, Flame, Snowflake, Thermometer,
    ExternalLink, ArrowRight, Building2
} from 'lucide-react';
import { getWhatsAppLink } from '../utils/whatsapp';
import { useApp } from '../context/AppProvider';
import { Lead } from '../types';
import { aiService, AIInsight } from '../services/aiService';
import { toast } from 'sonner';
import { Input } from '../components/ui/Input';
import { MobileCard } from '../components/ui/MobileCard';
import { AdvancedFilters } from '../components/shared/AdvancedFilters';

const TEMPERATURES = [
    { id: 'hot', label: 'Quente', icon: Flame, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    { id: 'warm', label: 'Morno', icon: Thermometer, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { id: 'cold', label: 'Frio', icon: Snowflake, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
];

const STATUS_OPTIONS = [
    { id: 'novo', label: 'Novo', color: 'bg-cyan-500' },
    { id: 'contato', label: 'Em Contato', color: 'bg-blue-500' },
    { id: 'visita', label: 'Visita Agendada', color: 'bg-purple-500' },
    { id: 'proposta', label: 'Proposta', color: 'bg-orange-500' },
    { id: 'fechado', label: 'Fechado', color: 'bg-emerald-500' },
    { id: 'perdido', label: 'Perdido', color: 'bg-red-500' },
];

export const Leads = () => {
    const { leads, addLead, updateLead, deleteLead, agents, developers } = useApp();
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [tempFilter, setTempFilter] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
    const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
    const [advancedFilters, setAdvancedFilters] = useState({
        agent: '',
        source: '',
        date: ''
    });

    const handleGetAIInsights = async (lead: Lead) => {
        setIsAnalyzing(true);
        setAiInsight(null);
        try {
            const insight = await aiService.getLeadInsights(lead);
            setAiInsight(insight);
            toast.success('IA: Análise concluída!');
        } catch (err) {
            toast.error('Erro ao obter insights da IA');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const [formData, setFormData] = useState<Partial<Lead>>({
        nome: '',
        email: '',
        telefone: '',
        midia: '',
        empreendimento: '',
        corretor: '',
        temperatura: 'warm',
        status: 'novo',
        historico: '',
        proximo_contato: ''
    });

    const filteredLeads = leads.filter(lead => {
        if (!lead) return false;
        const nome = lead.nome || '';
        const email = lead.email || '';
        const telefones = lead.telefone || '';

        const matchesSearch = nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            telefones.includes(searchTerm);

        const matchesTemp = tempFilter ? lead.temperatura === tempFilter : true;
        const matchesAgent = advancedFilters.agent ? lead.corretor === advancedFilters.agent : true;
        const matchesSource = advancedFilters.source ? lead.midia === advancedFilters.source : true;
        const matchesDate = advancedFilters.date ? lead.proximo_contato?.includes(advancedFilters.date) : true;

        return matchesSearch && matchesTemp && matchesAgent && matchesSource && matchesDate;
    });

    const toggleSelectAll = () => {
        if (selectedLeads.length === filteredLeads.length) {
            setSelectedLeads([]);
        } else {
            setSelectedLeads(filteredLeads.map(l => l.id));
        }
    };

    const toggleSelectLead = (id: string) => {
        setSelectedLeads(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        if (confirm(`Excluir ${selectedLeads.length} leads selecionados?`)) {
            for (const id of selectedLeads) {
                await deleteLead(id);
            }
            setSelectedLeads([]);
            toast.success('Leads removidos em massa!');
        }
    };

    const [currentStep, setCurrentStep] = useState(1);

    const handleOpenModal = (lead?: Lead) => {
        setCurrentStep(1); // Reset to first step
        if (lead) {
            setEditingLead(lead);
            setFormData(lead);
        } else {
            setEditingLead(null);
            setFormData({
                nome: '',
                email: '',
                telefone: '',
                midia: '',
                empreendimento: '',
                corretor: '',
                temperatura: 'warm',
                status: 'novo',
                historico: '',
                proximo_contato: ''
            });
        }
        setIsModalOpen(true);
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentStep < 3) {
            nextStep();
            return;
        }

        try {
            if (editingLead) {
                await updateLead(editingLead.id, formData);
                toast.success('Lead atualizado com sucesso!');
            } else {
                await addLead(formData as Lead);
                toast.success('Novo lead cadastrado!');
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error('Erro detalhado ao salvar lead:', err);
            toast.error('Erro ao salvar lead.');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Deseja realmente excluir este lead?')) {
            await deleteLead(id);
            toast.success('Lead removido');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground italic tracking-tighter flex items-center gap-3">
                        <Users className="text-primary" size={32} />
                        CENTRAL DE <span className="text-primary uppercase">LEADS</span>
                    </h1>
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mt-1">Gestão Proativa de Oportunidades</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-secondary p-1 rounded-xl border border-white/10 flex">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <ListIcon size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <LayoutGrid size={20} />
                        </button>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="premium-button"
                    >
                        <Plus size={18} /> Cadastrar Lead
                    </button>
                </div>
            </div>

            {/* AI Insight Panel */}
            {aiInsight && !('error' in aiInsight) && (
                <div className="premium-card p-6 border-primary/30 bg-primary/5 animate-in slide-in-from-top-4 duration-500 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary rounded-lg text-primary-foreground shadow-lg shadow-primary/20">
                                <Sparkles size={18} />
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-foreground uppercase italic tracking-widest">Análise Estratégica da <span className="text-primary">IA</span></h3>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Temperatura Sugerida: <span className="text-primary italic font-black">{aiInsight.temperatura || 'Não avaliada'}</span></p>
                            </div>
                        </div>
                        <button onClick={() => setAiInsight(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                            <Plus size={18} className="rotate-45" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic">💡 Insights para o Corretor</h4>
                            <ul className="space-y-2">
                                {Array.isArray(aiInsight.insights) ? aiInsight.insights.map((insight, idx) => (
                                    <li key={idx} className="text-xs text-foreground/80 flex items-start gap-2 bg-secondary/50 p-3 rounded-xl border border-white/5">
                                        <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                        {insight}
                                    </li>
                                )) : <li className="text-xs text-muted-foreground italic">Nenhum insight disponível no momento.</li>}
                            </ul>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic text-right">💬 Sugestão Follow-up WhatsApp</h4>
                            <div className="premium-card bg-secondary/40 border-dashed border-cyan-500/20 p-4 relative group" aria-label="Sugestão de WhatsApp">
                                <p className="text-xs text-cyan-700 dark:text-cyan-100 italic leading-relaxed pr-8">{aiInsight.whatsapp_suggestion || 'Sugestão não gerada.'}</p>
                                {aiInsight.whatsapp_suggestion && (
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(aiInsight.whatsapp_suggestion);
                                            toast.success('Copiado para a área de transferência!');
                                        }}
                                        className="absolute top-4 right-4 text-cyan-400 hover:text-white transition-colors"
                                        title="Copiar mensagem"
                                    >
                                        <Plus size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters Bar */}
            <AdvancedFilters
                searchTerm={searchTerm}
                onSearch={setSearchTerm}
                filters={advancedFilters}
                setFilters={setAdvancedFilters}
                options={{ agents }}
            />

            <div className="flex items-center gap-2 overflow-x-auto pb-4">
                <button
                    onClick={() => setTempFilter(null)}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${!tempFilter ? 'bg-primary/10 border-primary/20 text-primary' : 'border-border text-muted-foreground hover:border-primary/20'}`}
                >
                    Temperaturas
                </button>
                {TEMPERATURES.map(temp => (
                    <button
                        key={temp.id}
                        onClick={() => setTempFilter(temp.id)}
                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 whitespace-nowrap ${tempFilter === temp.id ? `${temp.bg} ${temp.border} ${temp.color}` : 'border-border text-muted-foreground hover:border-primary/20'}`}
                    >
                        <temp.icon size={14} />
                        {temp.label}
                    </button>
                ))}
            </div>

            {/* Bulk Actions Bar */}
            {selectedLeads.length > 0 && (
                <div className="bg-primary/90 backdrop-blur-md p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-bottom-4 duration-300 shadow-2xl shadow-primary/20">
                    <div className="flex items-center gap-4">
                        <span className="text-black font-black text-xs uppercase italic tracking-tighter">
                            {selectedLeads.length} selecionados
                        </span>
                        <div className="h-4 w-[1px] bg-black/20" />
                        <button onClick={handleBulkDelete} className="text-black/70 hover:text-black transition-colors font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                            <Trash2 size={14} /> Excluir
                        </button>
                    </div>
                    <button onClick={() => setSelectedLeads([])} className="text-black/50 hover:text-black">
                        <Plus className="rotate-45" size={20} />
                    </button>
                </div>
            )}

            {/* Main View Area */}
            {viewMode === 'list' ? (
                <div className="space-y-4">
                    {/* MOBILE VIEW cards (hidden on desktop) */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {filteredLeads.map(lead => (
                            <MobileCard
                                key={lead.id}
                                title={lead.nome || 'Sem Nome'}
                                subtitle={`${lead.midia || 'Direto'} • ${lead.empreendimento || 'Geral'}`}
                                description={lead.historico}
                                checkbox={
                                    <input
                                        type="checkbox"
                                        className="rounded border-white/10 bg-white/5 checked:bg-primary"
                                        checked={selectedLeads.includes(lead.id)}
                                        onChange={() => toggleSelectLead(lead.id)}
                                    />
                                }
                                status={
                                    <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-tighter ${STATUS_OPTIONS.find(s => s.id === lead.status)?.color?.replace('bg-', 'text-') || 'text-muted-foreground'} bg-white/5 border border-white/5`}>
                                        {lead.status}
                                    </span>
                                }
                                tags={[
                                    <span key="phone" className="flex items-center gap-1"><Phone size={10} /> {lead.telefone || '--'}</span>,
                                    <span key="agent" className="flex items-center gap-1"><Users size={10} /> {lead.corretor || '--'}</span>
                                ]}
                                actions={
                                    <div className="flex gap-2">
                                        <button onClick={() => handleGetAIInsights(lead)} className="p-2 text-cyan-400"><Sparkles size={14} /></button>
                                        <button onClick={() => handleOpenModal(lead)} className="p-2 text-slate-400"><Edit size={14} /></button>
                                    </div>
                                }
                                onClick={() => handleOpenModal(lead)}
                            />
                        ))}
                    </div>

                    {/* DESKTOP VIEW table (hidden on mobile) */}
                    <div className="premium-card overflow-hidden hidden md:block" role="region" aria-label="Lista de Leads">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 bg-secondary/50">
                                        <th className="p-4 w-10">
                                            <input
                                                type="checkbox"
                                                className="rounded border-white/10 bg-white/5 checked:bg-primary"
                                                checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                                                onChange={toggleSelectAll}
                                            />
                                        </th>
                                        <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Lead / Contato</th>
                                        <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Origem / Midia</th>
                                        <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest italic text-center">Temp.</th>
                                        <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Status</th>
                                        <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Corretor</th>
                                        <th className="p-4 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredLeads.map(lead => (
                                        <tr key={lead.id} className={`hover:bg-white/5 transition-all group ${selectedLeads.includes(lead.id) ? 'bg-primary/5' : ''}`}>
                                            <td className="p-4">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-white/10 bg-white/5 checked:bg-primary"
                                                    checked={selectedLeads.includes(lead.id)}
                                                    onChange={() => toggleSelectLead(lead.id)}
                                                />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-black italic border border-white/5">
                                                        {(lead.nome || '?').charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors uppercase italic">{lead.nome || 'Sem Nome'}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium"><Phone size={10} /> {lead.telefone || '--'}</span>
                                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium"><Mail size={10} /> {lead.email || '--'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{lead.midia || 'Direto'}</span>
                                                    <span className="text-[10px] text-muted-foreground lowercase italic">{lead.empreendimento || 'Geral'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                {TEMPERATURES.find(t => t.id === lead.temperatura) && (
                                                    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${TEMPERATURES.find(t => t.id === lead.temperatura)?.bg}`}>
                                                        {React.createElement(TEMPERATURES.find(t => t.id === lead.temperatura)!.icon, { size: 16, className: TEMPERATURES.find(t => t.id === lead.temperatura)?.color })}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter ${STATUS_OPTIONS.find(s => s.id === lead.status)?.color?.replace('bg-', 'text-') || 'text-muted-foreground'
                                                    } bg-white/5 border border-white/5`}>
                                                    {lead.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs font-bold text-muted-foreground">
                                                {lead.corretor || 'Não atribuído'}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <a
                                                        href={getWhatsAppLink(lead.telefone || '')}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-all border border-transparent hover:border-green-500/20"
                                                        aria-label="Contatar via WhatsApp"
                                                    >
                                                        <MessageSquare size={16} />
                                                    </a>
                                                    <button
                                                        onClick={() => handleGetAIInsights(lead)}
                                                        disabled={isAnalyzing}
                                                        className={`p-2 transition-all ${isAnalyzing ? 'animate-pulse text-cyan-400' : 'text-muted-foreground hover:text-cyan-400'}`}
                                                        aria-label="Insights da IA"
                                                    >
                                                        <Sparkles size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenModal(lead)}
                                                        className="p-2 text-slate-500 hover:text-cyan-400 transition-all"
                                                        aria-label="Editar Lead"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(lead.id)}
                                                        className="p-2 text-slate-500 hover:text-red-400 transition-all"
                                                        aria-label="Remover Lead"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x" role="region" aria-label="Quadro Kanban de Leads">
                    {STATUS_OPTIONS.map(status => (
                        <div key={status.id} className="flex-shrink-0 w-[85vw] md:w-80 flex flex-col gap-4 snap-center">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-xs font-black text-foreground uppercase italic tracking-widest flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
                                    {status.label}
                                    <span className="text-muted-foreground text-[10px]">({filteredLeads.filter(l => l.status === status.id).length})</span>
                                </h3>
                            </div>

                            <div className="flex flex-col gap-3 min-h-[500px] bg-white/[0.02] rounded-3xl p-3 border border-white/5">
                                {filteredLeads.filter(l => l.status === status.id).map(lead => (
                                    <button
                                        key={lead.id}
                                        className="premium-card text-left !p-4 group w-full cursor-pointer hover:border-cyan-500/30 transition-all active:scale-[0.98]"
                                        onClick={() => handleOpenModal(lead)}
                                        aria-label={`Ver detalhes do lead ${lead.nome}`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className={`w-8 h-8 rounded-lg ${TEMPERATURES.find(t => t.id === lead.temperatura)?.bg} flex items-center justify-center`}>
                                                {React.createElement(TEMPERATURES.find(t => t.id === lead.temperatura)!.icon, { size: 14, className: TEMPERATURES.find(t => t.id === lead.temperatura)?.color })}
                                            </div>
                                            <span className="text-[10px] text-slate-600 font-mono">#{lead.id.slice(0, 4)}</span>
                                        </div>

                                        <h4 className="text-sm font-black text-foreground uppercase italic tracking-tighter group-hover:text-primary transition-colors mb-1">{lead.nome}</h4>
                                        <p className="text-[10px] text-muted-foreground mb-3 flex items-center gap-1"><Phone size={10} /> {lead.telefone || '--'}</p>

                                        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                                            <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">{lead.midia || 'Direto'}</span>
                                            <div className="flex items-center gap-1">
                                                <a
                                                    href={getWhatsAppLink(lead.telefone || '')}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="p-1.5 rounded-lg text-green-500 hover:bg-green-500/10 transition-all border border-transparent hover:border-green-500/20"
                                                    title="WhatsApp"
                                                >
                                                    <MessageSquare size={14} />
                                                </a>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleGetAIInsights(lead); }}
                                                    disabled={isAnalyzing}
                                                    className={`p-1.5 rounded-lg transition-all ${isAnalyzing ? 'animate-pulse text-primary' : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'}`}
                                                >
                                                    <Sparkles size={14} />
                                                </button>
                                                <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[8px] font-black text-primary border border-white/5">
                                                    {lead.corretor?.charAt(0) || '?'}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Lead Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="premium-card bg-card w-full max-w-xl border-border shadow-3xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-border/50 bg-secondary/80 backdrop-blur-md">
                            <div>
                                <h3 className="text-xl font-black text-foreground italic uppercase tracking-tighter">
                                    {editingLead ? <>Editar <span className="text-primary">Lead</span></> : <>Novo <span className="text-primary">Lead</span></>}
                                </h3>
                                <div className="flex gap-1 mt-2">
                                    {[1, 2, 3].map(step => (
                                        <div
                                            key={step}
                                            className={`h-1 rounded-full transition-all duration-500 ${currentStep >= step ? 'w-8 bg-primary shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'w-4 bg-border'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-transform hover:rotate-90" aria-label="Fechar modal">
                                <Plus className="rotate-45" size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            {/* Step 1: Identificação */}
                            {currentStep === 1 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                            <Users size={18} />
                                        </div>
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Passo 1: Identificação Básica</h4>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6">
                                        <Input
                                            label="Nome Completo"
                                            required
                                            placeholder="Ex: João Silva"
                                            value={formData.nome || ''}
                                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input
                                                label="Telefone / WhatsApp"
                                                icon={<Phone size={16} />}
                                                placeholder="(00) 00000-0000"
                                                value={formData.telefone || ''}
                                                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                            />
                                            <Input
                                                label="E-mail"
                                                icon={<Mail size={16} />}
                                                type="email"
                                                placeholder="email@exemplo.com"
                                                value={formData.email || ''}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Qualificação */}
                            {currentStep === 2 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                            <Filter size={18} />
                                        </div>
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Passo 2: Qualificação e Origem</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            as="select"
                                            label="Mídia de Origem"
                                            value={formData.midia || ''}
                                            onChange={(e) => setFormData({ ...formData, midia: e.target.value })}
                                        >
                                            <option value="">Selecione...</option>
                                            <option value="Instagram">Instagram</option>
                                            <option value="Facebook">Facebook</option>
                                            <option value="Google">Google Search</option>
                                            <option value="Indicação">Indicação</option>
                                        </Input>
                                        <Input
                                            label="Empreendimento"
                                            icon={<Building2 size={16} />}
                                            placeholder="Nome do projeto..."
                                            value={formData.empreendimento || ''}
                                            onChange={(e) => setFormData({ ...formData, empreendimento: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Temperatura Sugerida</label>
                                        <div className="flex gap-3">
                                            {TEMPERATURES.map(temp => (
                                                <button
                                                    key={temp.id}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, temperatura: temp.id })}
                                                    className={`flex-1 p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${formData.temperatura === temp.id ? `${temp.bg} ${temp.border} ${temp.color} shadow-lg` : 'bg-secondary/50 border-border text-slate-500 hover:bg-secondary'}`}
                                                >
                                                    <temp.icon size={20} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">{temp.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Fechamento */}
                            {currentStep === 3 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                            <Sparkles size={18} />
                                        </div>
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Passo 3: Observações e Agendamento</h4>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6">
                                        <Input
                                            type="date"
                                            label="Próximo Contato"
                                            icon={<Calendar size={16} />}
                                            value={formData.proximo_contato || ''}
                                            onChange={(e) => setFormData({ ...formData, proximo_contato: e.target.value })}
                                        />
                                        <Input
                                            as="textarea"
                                            label="Histórico / Observações"
                                            placeholder="Registre aqui os detalhes da conversa..."
                                            rows={4}
                                            value={formData.historico || ''}
                                            onChange={(e) => setFormData({ ...formData, historico: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="pt-8 border-t border-border flex justify-between items-center">
                                {currentStep > 1 ? (
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="text-muted-foreground hover:text-foreground text-[10px] font-black uppercase tracking-widest transition-colors"
                                    >
                                        Voltar
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-muted-foreground hover:text-red-400 text-[10px] font-black uppercase tracking-widest transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                )}

                                <button type="submit" className="premium-button flex items-center gap-2 group">
                                    {currentStep < 3 ? (
                                        <>
                                            PRÓXIMO PASSO
                                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    ) : (
                                        <>
                                            GRAVAR LEAD
                                            <CheckCircle2 size={16} className="text-black" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
