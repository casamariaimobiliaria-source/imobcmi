import React, { useState, useEffect } from 'react';
import {
    ClipboardList, Search, Filter, Calendar, User as UserIcon,
    ChevronRight, ArrowLeft, Clock, Info, AlertTriangle, Trash2, Plus, Edit
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auditService, AuditLogInsert, ResourceType } from '../services/auditService';
import { useApp } from '../context/AppProvider';

export const ActivityLog = () => {
    const navigate = useNavigate();
    const { user } = useApp();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<ResourceType | ''>('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLogs();
    }, [filter]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await auditService.getLogs({ resource_type: filter || undefined, limit: 100 });
            setLogs(data || []);
        } catch (err) {
            console.error('Erro ao buscar logs:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log =>
        log.resource_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'CREATE': return <Plus className="text-emerald-400" size={16} />;
            case 'UPDATE': return <Edit className="text-amber-400" size={16} />;
            case 'DELETE': return <Trash2 className="text-red-400" size={16} />;
            default: return <Info className="text-blue-400" size={16} />;
        }
    };

    const getResourceLabel = (type: string) => {
        switch (type) {
            case 'SALE': return 'Venda';
            case 'DEAL': return 'Negócio';
            case 'LEAD': return 'Lead';
            case 'FINANCE': return 'Financeiro';
            case 'AGENT': return 'Corretor';
            case 'CLIENT': return 'Cliente';
            default: return type;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-2 text-xs font-black uppercase tracking-widest italic"
                    >
                        <ArrowLeft size={14} /> Voltar
                    </button>
                    <h1 className="text-3xl font-black text-foreground italic tracking-tighter flex items-center gap-3">
                        <ClipboardList className="text-primary" size={32} />
                        HISTÓRICO DE <span className="text-primary uppercase">ATIVIDADE</span>
                    </h1>
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mt-1">Audit Trail & Governança do Sistema</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="BUSCAR POR ID OU AÇÃO..."
                            className="w-64 h-[46px] pl-10 pr-4 rounded-xl border border-white/10 bg-secondary text-foreground text-[10px] font-black uppercase tracking-widest italic focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="h-[46px] px-4 rounded-xl border border-white/10 bg-secondary text-foreground text-[10px] font-black uppercase tracking-widest italic focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer pr-10"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as ResourceType)}
                    >
                        <option value="">TODOS OS RECURSOS</option>
                        <option value="SALE">VENDAS</option>
                        <option value="DEAL">NEGÓCIOS</option>
                        <option value="LEAD">LEADS</option>
                        <option value="FINANCE">FINANCEIRO</option>
                        <option value="AGENT">CORRETORES</option>
                        <option value="CLIENT">CLIENTES</option>
                    </select>
                </div>
            </div>

            {/* Logs Table */}
            <div className="premium-card !rounded-[2.5rem] overflow-hidden flex flex-col h-[calc(100vh-16rem)] relative border border-white/10">
                <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead className="bg-secondary/50 sticky top-0 z-20 shadow-sm backdrop-blur-md">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-white/10 italic">Data/Hora</th>
                                <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-white/10 italic">Usuário</th>
                                <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-white/10 italic">Ação</th>
                                <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-white/10 italic">Recurso</th>
                                <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-white/10 italic">ID do Recurso</th>
                                <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-white/10 italic text-right">Detalhes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-primary text-[10px] font-black uppercase tracking-widest animate-pulse italic">
                                        Sincronizando registros de auditoria...
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-muted-foreground text-[10px] font-black uppercase tracking-widest italic opacity-40">
                                        Nenhum registro de atividade encontrado.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-secondary/30 transition-all group">
                                        <td className="px-8 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-foreground">
                                                    {new Date(log.created_at).toLocaleDateString()}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-black italic">
                                                    <Clock size={10} className="text-primary" /> {new Date(log.created_at).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center border border-white/10 group-hover:border-primary/40 transition-all">
                                                    <UserIcon size={14} className="text-primary" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-foreground uppercase italic tracking-tight">{log.users?.name || 'Sistema'}</span>
                                                    <span className="text-[9px] text-muted-foreground font-black lowercase truncate max-w-[120px]">{log.users?.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-2">
                                                {getActionIcon(log.action)}
                                                <span className={`text-[10px] font-black uppercase tracking-widest italic ${log.action === 'CREATE' ? 'text-emerald-500' :
                                                    log.action === 'UPDATE' ? 'text-amber-500' :
                                                        log.action === 'DELETE' ? 'text-red-500' : 'text-primary'
                                                    }`}>
                                                    {log.action}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">
                                            {getResourceLabel(log.resource_type)}
                                        </td>
                                        <td className="px-8 py-4 text-[10px] font-mono text-muted-foreground group-hover:text-primary transition-colors">
                                            {log.resource_id}
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <button
                                                onClick={() => console.log('Show Log Detail', log)}
                                                className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
