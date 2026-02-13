import React, { useEffect } from 'react';
import { Sale, Agent, Client, Developer, User } from '../../types';
import { formatCurrency } from '../../utils';
import { Save, Calculator, Building2, User as UserIcon, Scissors } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface SaleFormProps {
    formData: Partial<Sale>;
    setFormData: (data: Partial<Sale>) => void;
    agents: Agent[];
    clients: Client[];
    developers: Developer[];
    user: User | null;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    editingId: string | null;
}

export const SaleForm: React.FC<SaleFormProps> = ({
    formData,
    setFormData,
    agents,
    clients,
    developers,
    user,
    onSubmit,
    onCancel,
    editingId
}) => {
    const isReadOnly = user?.role === 'agent';
    const activeAgents = agents.filter(a => a.status === 'active');

    useEffect(() => {
        if (formData.unitValue !== undefined && formData.commissionPercent && formData.taxPercent && formData.agentSplitPercent !== undefined) {
            const gross = formData.unitValue * (formData.commissionPercent / 100);
            const tax = gross * (formData.taxPercent / 100);
            const misc = formData.miscExpensesValue || 0;
            const netBase = gross - tax - misc;
            const agentShare = netBase * (formData.agentSplitPercent / 100);
            const agencyShare = netBase - agentShare;

            setFormData({
                ...formData,
                grossCommission: gross,
                taxValue: tax,
                agentCommission: agentShare,
                agencyCommission: agencyShare
            });
        }
    }, [formData.unitValue, formData.commissionPercent, formData.taxPercent, formData.agentSplitPercent, formData.miscExpensesValue]);

    const totalDeductions = (formData.taxValue || 0) + (formData.miscExpensesValue || 0);
    const agentDeductionShare = totalDeductions * ((formData.agentSplitPercent || 0) / 100);
    const baseCalculation = (formData.grossCommission || 0) - totalDeductions;

    return (
        <form onSubmit={onSubmit} className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-300 pb-20">
            <Card className="p-6 md:p-8 space-y-8">
                <div>
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 border-b border-border/50 pb-2 italic">Dados do Imóvel</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input as="select" label="Incorporadora" required disabled={isReadOnly} value={formData.developerId} onChange={e => setFormData({ ...formData, developerId: e.target.value })}>
                            <option value="">Selecione...</option>
                            {developers.map(d => <option key={d.id} value={d.id}>{d.companyName}</option>)}
                        </Input>
                        <Input label="Empreendimento (Projeto)" required disabled={isReadOnly} value={formData.projectId || ''} onChange={e => setFormData({ ...formData, projectId: e.target.value })} placeholder="Ex: Living One" />
                        <Input label="Unidade/Torre" required disabled={isReadOnly} value={formData.unit || ''} onChange={e => setFormData({ ...formData, unit: e.target.value })} placeholder="Ex: 104 - Bloco A" />
                        <Input type="date" label="Data da Venda" required disabled={isReadOnly} value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                    </div>
                </div>

                <div>
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 border-b border-border/50 pb-2 italic">Envolvidos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Input as="select" label="Cliente" required disabled={isReadOnly} value={formData.clientId} onChange={e => setFormData({ ...formData, clientId: e.target.value })}>
                            <option value="">Selecione...</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </Input>
                        <Input as="select" label="Corretor Responsável" required disabled={user?.role === 'agent'} value={formData.agentId} onChange={e => setFormData({ ...formData, agentId: e.target.value })}>
                            <option value="">Selecione...</option>
                            {(editingId ? agents : activeAgents).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </Input>
                        <Input as="select" label="Origem do Lead" disabled={isReadOnly} value={formData.leadSource} onChange={e => setFormData({ ...formData, leadSource: e.target.value })}>
                            <option value="">Selecione...</option>
                            <option value="Instagram">Instagram</option>
                            <option value="Google">Google Ads</option>
                            <option value="Placa">Placa/Fachada</option>
                            <option value="Indicação">Indicação</option>
                            <option value="Portal">Portal Imobiliário</option>
                        </Input>
                    </div>
                </div>

                <div>
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 border-b border-border/50 pb-2 italic">Comissionamento (Split)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-6">
                        <Input type="number" step="0.01" label="Valor do Imóvel (R$)" required disabled={isReadOnly} className="font-bold text-lg" value={formData.unitValue || ''} onChange={e => setFormData({ ...formData, unitValue: parseFloat(e.target.value) })} />
                        <Input type="number" step="0.1" label="% Comissão Total" required disabled={isReadOnly} value={formData.commissionPercent || ''} onChange={e => setFormData({ ...formData, commissionPercent: parseFloat(e.target.value) })} />
                        <div className="w-full">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 ml-1 italic">Comissão Bruta (Total)</label>
                            <div className="p-3 bg-cyan-500/5 rounded-xl border border-cyan-500/20 text-cyan-400 font-black text-lg border-l-4 border-l-cyan-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                                {formatCurrency(formData.grossCommission || 0)}
                            </div>
                        </div>
                    </div>

                    {user?.role === 'admin' ? (
                        <div className="bg-red-500/5 rounded-2xl border border-red-500/10 p-5 mb-6">
                            <h4 className="text-[10px] font-black text-red-500/80 mb-4 flex items-center gap-2 uppercase tracking-widest italic"><Scissors size={14} /> Deduções (Antes do Split)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-end gap-3">
                                    <Input type="number" step="0.1" label="% Nota Fiscal (Imposto)" className="bg-red-500/5 dark:!bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400" value={formData.taxPercent || ''} onChange={e => setFormData({ ...formData, taxPercent: parseFloat(e.target.value) })} />
                                    <div className="mb-3 text-xs text-red-600 dark:text-red-500 font-black whitespace-nowrap italic">= - {formatCurrency(formData.taxValue || 0)}</div>
                                </div>
                                <div className="flex gap-3">
                                    <Input label="Descontos Diversos (Descrição)" placeholder="Ex: Taxa WayBropay" className="bg-red-500/5 dark:!bg-red-500/5 border-red-500/20" value={formData.miscExpensesDescription || ''} onChange={e => setFormData({ ...formData, miscExpensesDescription: e.target.value })} />
                                    <Input type="number" step="0.01" label="Valor (R$)" className="w-32 bg-red-500/5 dark:!bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400" value={formData.miscExpensesValue || ''} onChange={e => setFormData({ ...formData, miscExpensesValue: parseFloat(e.target.value) })} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-red-500/5 rounded-2xl border border-red-500/10 p-5 mb-6">
                            <h4 className="text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest italic">Deduções da Venda</h4>
                            <p className="text-xs text-slate-400 font-bold">Total Descontos (Impostos + Taxas): <span className="text-red-400">{formatCurrency(totalDeductions)}</span></p>
                        </div>
                    )}

                    <div className="mb-10 px-2 group">
                        <label className="block text-[10px] font-black text-muted-foreground mb-4 uppercase tracking-widest italic">Divisão (Split)</label>
                        <input type="range" min="0" max="100" step="1" disabled={isReadOnly} className="w-full h-1.5 rounded-lg appearance-none cursor-pointer mb-4 bg-secondary accent-primary" value={formData.agentSplitPercent || 0} onChange={e => setFormData({ ...formData, agentSplitPercent: parseFloat(e.target.value) })} />
                        <div className="flex items-center justify-between">
                            <Badge variant="info">Corretor: {formData.agentSplitPercent}%</Badge>
                            <Badge variant="neutral">Imobiliária: {100 - (formData.agentSplitPercent || 0)}%</Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                        <Card className="bg-secondary/20 border-border/50 shadow-none group hover:bg-secondary/40 transition-colors">
                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-4 text-muted-foreground font-black uppercase text-[10px] tracking-widest italic border-b border-border/50 pb-2">
                                    <Calculator size={16} /> Base de Cálculo
                                </div>
                                <div className="space-y-2 text-xs font-bold">
                                    <div className="flex justify-between text-muted-foreground"><span>(+) Bruto</span><span className="text-foreground">{formatCurrency(formData.grossCommission || 0)}</span></div>
                                    <div className="flex justify-between text-red-500/80"><span>(-) Impostos</span><span>{formatCurrency(formData.taxValue || 0)}</span></div>
                                    {formData.miscExpensesValue ? <div className="flex justify-between text-red-500/80"><span>(-) Diversos</span><span>{formatCurrency(formData.miscExpensesValue)}</span></div> : null}
                                    <div className="border-t border-border/50 pt-3 mt-3 flex justify-between font-black text-foreground text-sm italic"><span>(=) Líquido</span><span>{formatCurrency(baseCalculation)}</span></div>
                                </div>
                            </div>
                        </Card>
                        <Card className="bg-indigo-500/[0.05] dark:bg-indigo-500/[0.03] border-indigo-500/20 shadow-none hover:bg-indigo-500/[0.08] transition-colors">
                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400/70 font-black uppercase text-[10px] tracking-widest italic border-b border-indigo-500/10 pb-2"><Building2 size={16} /> Imobiliária</div>
                                <h3 className="text-3xl font-black text-foreground italic tracking-tighter mb-4">{formatCurrency(formData.agencyCommission || 0)}</h3>
                                <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600/70 dark:text-indigo-300/50 bg-indigo-500/10 p-2 rounded-lg text-center">Participação: {100 - (formData.agentSplitPercent || 0)}%</div>
                            </div>
                        </Card>
                        <Card className="bg-emerald-500/[0.05] dark:bg-emerald-500/[0.03] border-emerald-500/20 shadow-none ring-1 ring-emerald-500/10 hover:bg-emerald-500/[0.08] transition-colors">
                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400/70 font-black uppercase text-[10px] tracking-widest italic border-b border-emerald-500/10 pb-2"><UserIcon size={16} /> Corretor</div>
                                <h3 className="text-3xl font-black text-foreground italic tracking-tighter mb-4">{formatCurrency(formData.agentCommission || 0)}</h3>
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600/70 dark:text-emerald-300/50 bg-emerald-500/10 p-2 rounded-lg text-center">Participação: {formData.agentSplitPercent}%</div>
                                    <div className="text-[9px] font-bold text-center text-emerald-600/60 dark:text-emerald-500/40 uppercase italic">Dedução Proporcional: {formatCurrency(agentDeductionShare)}</div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="mt-10 pt-6 border-t border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-1">
                            <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest italic">Status da Venda</label>
                            {user?.role === 'admin' ? (
                                <select className="w-full md:w-48 p-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/40 outline-none uppercase text-[10px] font-black italic tracking-widest transition-all" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })}>
                                    <option value="pending">Pendente</option>
                                    <option value="approved">Aprovada</option>
                                    <option value="cancelled">Cancelada</option>
                                </select>
                            ) : (
                                <div className="inline-block"><Badge variant={formData.status === 'approved' ? 'success' : formData.status === 'cancelled' ? 'error' : 'warning'}>{formData.status === 'approved' ? 'Aprovada' : formData.status === 'cancelled' ? 'Cancelada' : 'Pendente'}</Badge></div>
                            )}
                        </div>
                        <div className="flex gap-4">
                            <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
                            {!isReadOnly && <Button type="submit" icon={Save}>{editingId ? 'Atualizar Venda' : 'Salvar Venda'}</Button>}
                        </div>
                    </div>
                </div>
            </Card>
        </form>
    );
};
