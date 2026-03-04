import React from 'react';
import { Agent, Sale } from '../../types';
import { formatCurrency, formatDate } from '../../utils';
import { X, Pencil, Trash2, Mail, Phone, FileText, MapPin, Sparkles, User as UserIcon, Briefcase, Link as LinkIcon, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface AgentDetailsProps {
    agent: Agent;
    sales: Sale[];
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export const AgentDetails: React.FC<AgentDetailsProps> = ({
    agent,
    sales,
    onClose,
    onEdit,
    onDelete
}) => {
    return (
        <div className="flex flex-col h-full premium-card !rounded-[2rem] border-border/40 overflow-hidden shadow-2xl relative">
            {/* Header Details */}
            <div className="p-8 border-b border-border/40 flex flex-col md:flex-row md:items-start justify-between gap-6 bg-secondary/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="flex-1 relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <button className="lg:hidden w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground" onClick={onClose}>
                                <X size={20} />
                            </button>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-foreground italic tracking-tighter uppercase">
                                    {agent.name}
                                </h2>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></div>
                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${agent.status === 'active' ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {agent.status === 'active' ? 'Agente Ativo' : 'Agente Inativo'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Button variant="secondary" onClick={onEdit} className="!w-10 !h-10 !p-0 !rounded-xl !border-border/40 hover:!text-primary">
                                <Pencil size={18} />
                            </Button>
                            <Button variant="secondary" onClick={onDelete} className="!w-10 !h-10 !p-0 !rounded-xl !border-border/40 hover:!text-red-500">
                                <Trash2 size={18} />
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg border border-border/40 truncate"><Mail size={12} className="text-primary flex-shrink-0" /> {agent.email}</div>
                            <div className="flex items-center gap-2 text-[11px] font-bold text-foreground bg-secondary/50 px-3 py-1.5 rounded-lg border border-border/40 truncate"><Phone size={12} className="text-primary flex-shrink-0" /> {agent.phone}</div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground tracking-widest"><FileText size={12} className="text-muted-foreground flex-shrink-0" /> CRECI: {agent.creci}</div>
                            {agent.birth_date && (
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground tracking-widest"><Calendar size={12} className="text-muted-foreground flex-shrink-0" /> NASC: {formatDate(agent.birth_date)}</div>
                            )}
                        </div>
                        {(agent.city || agent.address || agent.neighborhood) && (
                            <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic">
                                <MapPin size={10} className="text-primary opacity-50 flex-shrink-0" />
                                <span className="truncate">{agent.address}{agent.number ? `, ${agent.number}` : ''}{agent.neighborhood ? ` - ${agent.neighborhood}` : ''} • {agent.city}/{agent.state}</span>
                            </div>
                        )}
                        {(agent.specialties?.length ?? 0) > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {agent.specialties!.map(spec => (
                                    <span key={spec} className="px-2 py-1 rounded bg-primary/10 text-primary text-[9px] font-black uppercase tracking-wider italic">
                                        {spec}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="space-y-6">
                    {/* Financial Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="!bg-secondary/20 border-border/40 p-4 group hover:!bg-secondary/30">
                            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1 italic">Total Recebido</p>
                            <p className="text-2xl font-black text-emerald-500 italic tracking-tighter">
                                {formatCurrency(agent.totalCommissionPaid)}
                            </p>
                        </Card>
                        <Card className="!bg-secondary/20 border-border/40 p-4 group hover:!bg-secondary/30">
                            <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1 italic">A Receber</p>
                            <p className="text-2xl font-black text-amber-500 italic tracking-tighter">
                                {formatCurrency(agent.totalCommissionEarned - agent.totalCommissionPaid)}
                            </p>
                        </Card>
                    </div>

                    {/* Additional Details */}
                    {(agent.experience_years || agent.previous_agencies || agent.instagram_url || agent.linkedin_url) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(agent.experience_years || agent.previous_agencies || agent.cnai) && (
                                <Card className="!bg-secondary/10 border-border/20 p-4">
                                    <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-3 italic flex items-center gap-2"><Briefcase size={12} className="text-primary" /> Perfil Profissional</p>
                                    <div className="space-y-2">
                                        {agent.experience_years && <p className="text-xs text-foreground flex justify-between"><span className="text-muted-foreground">Tempo Mercado:</span> <b>{agent.experience_years} anos</b></p>}
                                        {agent.previous_agencies && <p className="text-xs text-foreground flex justify-between"><span className="text-muted-foreground">Ex Imobiliárias:</span> <b>{agent.previous_agencies}</b></p>}
                                        {agent.cnai && <p className="text-xs text-foreground flex justify-between"><span className="text-muted-foreground">CNAI:</span> <b>{agent.cnai}</b></p>}
                                    </div>
                                </Card>
                            )}
                            {(agent.instagram_url || agent.linkedin_url) && (
                                <Card className="!bg-secondary/10 border-border/20 p-4">
                                    <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-3 italic flex items-center gap-2"><LinkIcon size={12} className="text-primary" /> Redes Sociais</p>
                                    <div className="space-y-2">
                                        {agent.instagram_url && <p className="text-xs text-foreground flex justify-between"><span className="text-muted-foreground">Instagram:</span> <a href={agent.instagram_url.startsWith('http') ? agent.instagram_url : `https://${agent.instagram_url}`} target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold truncate max-w-[150px]">{agent.instagram_url.replace('https://', '').replace('http://', '').replace('www.', '')}</a></p>}
                                        {agent.linkedin_url && <p className="text-xs text-foreground flex justify-between"><span className="text-muted-foreground">LinkedIn:</span> <a href={agent.linkedin_url.startsWith('http') ? agent.linkedin_url : `https://${agent.linkedin_url}`} target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold truncate max-w-[150px]">{agent.linkedin_url.replace('https://', '').replace('http://', '').replace('www.', '')}</a></p>}
                                    </div>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* History Table */}
                    <div>
                        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-6 flex items-center gap-2 italic"><Sparkles size={16} className="text-primary" /> Histórico de Vendas</h3>
                        <div className="premium-card !rounded-[2rem] border-border/40 overflow-hidden">
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-auto max-h-[400px] custom-scrollbar">
                                <table className="w-full text-left text-sm border-separate border-spacing-0">
                                    <thead className="bg-secondary/50 text-muted-foreground sticky top-0 z-10 backdrop-blur-md">
                                        <tr>
                                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest border-b border-border/40 italic">Data</th>
                                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest border-b border-border/40 italic">Unidade</th>
                                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest border-b border-border/40 italic">Valor</th>
                                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest border-b border-border/40 text-right italic">Comissão</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/10">
                                        {sales.map(sale => (
                                            <tr key={sale.id} className="hover:bg-secondary/30 transition-colors group">
                                                <td className="px-6 py-4 text-xs font-medium text-muted-foreground">{formatDate(sale.date)}</td>
                                                <td className="px-6 py-4 text-xs font-bold text-foreground">{sale.unit}</td>
                                                <td className="px-6 py-4 text-xs text-muted-foreground">{formatCurrency(sale.unitValue)}</td>
                                                <td className="px-6 py-4 text-xs font-black text-emerald-500 text-right">{formatCurrency(sale.agentCommission)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y divide-border/20 bg-card">
                                {sales.map(sale => (
                                    <div key={sale.id} className="p-4 flex justify-between items-center group">
                                        <div>
                                            <p className="text-[11px] font-black text-foreground uppercase italic">{sale.unit}</p>
                                            <p className="text-[9px] text-muted-foreground font-bold mt-0.5">{formatDate(sale.date)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[11px] font-black text-emerald-500 italic">{formatCurrency(sale.agentCommission)}</p>
                                            <p className="text-[8px] text-muted-foreground font-black uppercase mt-0.5">Comissão</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {sales.length === 0 && (
                                <div className="p-12 text-center text-muted-foreground text-[10px] font-black uppercase tracking-widest italic opacity-40">Nenhum registro encontrado.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
