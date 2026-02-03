import React, { useState, useEffect } from 'react';
import {
    Search, Plus, Filter, Users, Calendar,
    MoreHorizontal, Edit, Trash2, Mail, Phone,
    MessageSquare, Sparkles, LayoutGrid, List as ListIcon,
    AlertCircle, CheckCircle2, Clock, Flame, Snowflake, Thermometer,
    ExternalLink
} from 'lucide-react';
import { getWhatsAppLink } from '../utils/whatsapp';
import { useApp } from '../context/AppProvider';
import { Lead } from '../types';
import { aiService, AIInsight } from '../services/aiService';
import { toast } from 'sonner';
import { Input } from '../components/ui/Input';

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
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

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
        const telefone = lead.telefone || '';

        const matchesSearch = nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            telefone.includes(searchTerm);
        const matchesTemp = tempFilter ? lead.temperatura === tempFilter : true;
        return matchesSearch && matchesTemp;
    });

    const handleOpenModal = (lead?: Lead) => {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
            toast.error('Erro ao salvar lead. Verifique o console para mais detalhes.');
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
                            <div className="premium-card !bg-black/40 border-dashed border-cyan-500/20 p-4 relative group">
                                <p className="text-xs text-cyan-100 italic leading-relaxed pr-8">{aiInsight.whatsapp_suggestion || 'Sugestão não gerada.'}</p>
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
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <Input
                        icon={<Search size={18} />}
                        placeholder="Buscar por nome, email ou telefone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="uppercase tracking-wider text-[11px] font-bold"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                    <button
                        onClick={() => setTempFilter(null)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${!tempFilter ? 'bg-primary/10 border-primary/20 text-primary' : 'border-border text-muted-foreground hover:border-primary/20'}`}
                    >
                        Todos
                    </button>
                    {TEMPERATURES.map(temp => (
                        <button
                            key={temp.id}
                            onClick={() => setTempFilter(temp.id)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 whitespace-nowrap ${tempFilter === temp.id ? `${temp.bg} ${temp.border} ${temp.color}` : 'border-border text-muted-foreground hover:border-primary/20'}`}
                        >
                            <temp.icon size={14} />
                            {temp.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main View Area */}
            {viewMode === 'list' ? (
                <div className="premium-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-secondary/50">
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
                                    <tr key={lead.id} className="hover:bg-white/5 transition-all group">
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
                                                    title="Abrir WhatsApp"
                                                >
                                                    <MessageSquare size={16} />
                                                </a>
                                                <button
                                                    onClick={() => handleGetAIInsights(lead)}
                                                    disabled={isAnalyzing}
                                                    className={`p-2 transition-all ${isAnalyzing ? 'animate-pulse text-cyan-400' : 'text-muted-foreground hover:text-cyan-400'}`}
                                                    title="Obter Insights da IA"
                                                >
                                                    <Sparkles size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenModal(lead)}
                                                    className="p-2 text-slate-500 hover:text-cyan-400 transition-all"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(lead.id)}
                                                    className="p-2 text-slate-500 hover:text-red-400 transition-all"
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
            ) : (
                <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
                    {STATUS_OPTIONS.map(status => (
                        <div key={status.id} className="flex-shrink-0 w-80 flex flex-col gap-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-xs font-black text-foreground uppercase italic tracking-widest flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
                                    {status.label}
                                    <span className="text-muted-foreground text-[10px]">({filteredLeads.filter(l => l.status === status.id).length})</span>
                                </h3>
                            </div>

                            <div className="flex flex-col gap-3 min-h-[500px] bg-white/[0.02] rounded-3xl p-3 border border-white/5">
                                {filteredLeads.filter(l => l.status === status.id).map(lead => (
                                    <div
                                        key={lead.id}
                                        className="premium-card !p-4 group cursor-pointer hover:border-cyan-500/30 transition-all active:scale-[0.98]"
                                        onClick={() => handleOpenModal(lead)}
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
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Lead Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="premium-card !bg-background w-full max-w-2xl max-h-[90vh] overflow-y-auto border-white/10 shadow-3xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-secondary/30 sticky top-0 z-10">
                            <h3 className="text-xl font-black text-foreground italic uppercase tracking-tighter">
                                {editingLead ? <>Editar <span className="text-primary">Lead</span></> : <>Novo <span className="text-primary">Lead</span></>}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground"><Plus className="rotate-45" size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nome Completo</label>
                                    <input
                                        type="text"
                                        required
                                        className="premium-input w-full"
                                        placeholder="Nome do cliente..."
                                        value={formData.nome || ''}
                                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Telefone / WhatsApp</label>
                                    <input
                                        type="text"
                                        className="premium-input w-full"
                                        placeholder="(00) 00000-0000"
                                        value={formData.telefone || ''}
                                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">E-mail</label>
                                    <input
                                        type="email"
                                        className="premium-input w-full"
                                        placeholder="email@exemplo.com"
                                        value={formData.email || ''}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 italic">Mídia / Canal de Origem</label>
                                    <select
                                        className="premium-input w-full"
                                        value={formData.midia || ''}
                                        onChange={(e) => setFormData({ ...formData, midia: e.target.value })}
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="Instagram">Instagram</option>
                                        <option value="Facebook">Facebook</option>
                                        <option value="Google">Google Search</option>
                                        <option value="Site">Site Institucional</option>
                                        <option value="Indicação">Indicação</option>
                                        <option value="Outdoor">Outdoor / Placa</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Temperatura do Lead</label>
                                    <div className="flex gap-2">
                                        {TEMPERATURES.map(temp => (
                                            <button
                                                key={temp.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, temperatura: temp.id })}
                                                className={`flex-1 p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${formData.temperatura === temp.id ? `${temp.bg} ${temp.border} ${temp.color}` : 'bg-white/5 border-white/5 text-slate-500'
                                                    }`}
                                            >
                                                <temp.icon size={18} />
                                                <span className="text-[8px] font-black uppercase tracking-widest">{temp.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 italic">Próximo Contato</label>
                                    <input
                                        type="date"
                                        className="premium-input w-full"
                                        value={formData.proximo_contato || ''}
                                        onChange={(e) => setFormData({ ...formData, proximo_contato: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 italic">Observações / Histórico de Contato</label>
                                <textarea
                                    className="premium-input w-full min-h-[100px] resize-none"
                                    placeholder="Registre o que foi conversado..."
                                    value={formData.historico || ''}
                                    onChange={(e) => setFormData({ ...formData, historico: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest"
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="premium-button px-8">
                                    Gravar Dados
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
