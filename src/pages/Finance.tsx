
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppProvider';
import { FinancialRecord, TransactionType, FinanceStatus } from '../types';
import { formatCurrency, formatDate, generateId } from '../utils';
import {
  ArrowDownCircle, ArrowUpCircle, Wallet, Search, Filter,
  Pencil, Trash2, CheckCircle2, Calendar, X, AlertCircle, Clock, CheckCircle,
  TrendingUp, TrendingDown, Landmark, Receipt, MoreHorizontal, Building
} from 'lucide-react';
import { Input } from '../components/ui/Input';
import { buildCategoryTree } from '../utils/categoryUtils';

export const Finance = () => {
  const { financialRecords, agents, categories, bankAccounts, paymentMethods, addFinancialRecord, updateFinancialRecord, deleteFinancialRecord } = useApp();

  // State
  const [activeTab, setActiveTab] = useState<'overview' | 'payable' | 'receivable'>('overview');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState<FinanceStatus | ''>('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const initialFormState: Partial<FinancialRecord> = {
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    type: 'expense',
    category: '',
    description: '',
    amount: 0,
    status: 'pending',
    relatedEntityId: '',
    bankAccountId: '',
    paymentMethodId: ''
  };
  const [formData, setFormData] = useState<Partial<FinancialRecord>>(initialFormState);

  // Derive categories
  const availableCategories = buildCategoryTree(categories.filter(c => c.type === formData.type));

  // KPIs
  const kpis = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    return financialRecords.reduce((acc, r) => {
      if (r.type === 'income') {
        if (r.status === 'paid') acc.received += r.amount;
        else acc.toReceive += r.amount;
      } else {
        if (r.status === 'paid') acc.paid += r.amount;
        else acc.toPay += r.amount;
      }
      if (r.status === 'pending' && r.dueDate < today) {
        acc.overdue += r.amount;
        acc.overdueCount++;
      }
      return acc;
    }, { received: 0, toReceive: 0, paid: 0, toPay: 0, overdue: 0, overdueCount: 0 });
  }, [financialRecords]);

  // List Filter
  let baseRecords = financialRecords;
  if (activeTab === 'payable') baseRecords = financialRecords.filter(r => r.type === 'expense');
  else if (activeTab === 'receivable') baseRecords = financialRecords.filter(r => r.type === 'income');

  const filteredRecords = baseRecords.filter(record => {
    const matchSearch = record.description.toLowerCase().includes(searchTerm.toLowerCase());
    const dateToCheck = record.dueDate;
    const matchDateStart = filterDateStart ? dateToCheck >= filterDateStart : true;
    const matchDateEnd = filterDateEnd ? dateToCheck <= filterDateEnd : true;
    const matchCategory = filterCategory ? record.category === filterCategory : true;
    const matchStatus = filterStatus ? record.status === filterStatus : true;
    return matchSearch && matchDateStart && matchDateEnd && matchCategory && matchStatus;
  });

  const handleOpenModal = (type: TransactionType = 'expense', record?: FinancialRecord) => {
    const today = new Date().toISOString().split('T')[0];
    if (record) {
      setFormData({ ...record, date: record.date || today, dueDate: record.dueDate || today });
      setEditingId(record.id);
    } else {
      setFormData({ ...initialFormState, type, date: today, dueDate: today, category: '' });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;
    if (editingId) updateFinancialRecord(editingId, formData);
    else addFinancialRecord({ ...formData, id: generateId() } as FinancialRecord);
    setShowModal(false);
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">

      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-1">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-900/20 transform rotate-2 hover:rotate-0 transition-transform">
            <Wallet size={24} className="md:size-[28px] text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tighter uppercase italic">Gestão <span className="text-emerald-500">Financeira</span></h1>
            <p className="text-muted-foreground font-bold text-[9px] md:text-[10px] uppercase tracking-widest mt-1">Controle de fluxo de caixa e obrigações.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:flex gap-3 w-full lg:w-auto">
          <button onClick={() => handleOpenModal('expense')} className="px-4 py-2.5 md:px-6 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 flex-1 lg:flex-none">
            <ArrowDownCircle size={16} /> Pagar
          </button>
          <button onClick={() => handleOpenModal('income')} className="px-4 py-2.5 md:px-6 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2 flex-1 lg:flex-none">
            <ArrowUpCircle size={16} /> Receber
          </button>
        </div>
      </div>

      {/* KPI GRID - PREMIUM STYLE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-1">
        <div className="premium-card p-6 !rounded-[2rem] relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><TrendingUp size={40} className="text-emerald-500" /></div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Total Recebido</p>
          <p className="text-3xl font-black text-foreground">{formatCurrency(kpis.received)}</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">Efetivado</span>
          </div>
        </div>

        <div className="premium-card p-6 !rounded-[2rem] relative overflow-hidden group hover:border-primary/30 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Clock size={40} className="text-primary" /></div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">A Receber</p>
          <p className="text-3xl font-black text-foreground">{formatCurrency(kpis.toReceive)}</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">Previsão</span>
          </div>
        </div>

        <div className="premium-card p-6 !rounded-[2rem] relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><TrendingDown size={40} className="text-amber-500" /></div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">A Pagar</p>
          <p className="text-3xl font-black text-foreground">{formatCurrency(kpis.toPay)}</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[9px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded uppercase">Compromissos</span>
          </div>
        </div>

        <div className="premium-card p-6 !rounded-[2rem] relative overflow-hidden group hover:border-red-500/30 transition-all shadow-[0_0_30px_rgba(239,68,68,0.05)]">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><AlertCircle size={40} className="text-red-500" /></div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Em Atraso</p>
          <p className="text-3xl font-black text-red-500">{formatCurrency(kpis.overdue)}</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[9px] font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded uppercase">{kpis.overdueCount} Títulos</span>
          </div>
        </div>
      </div>

      {/* TABS & SEARCH */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-1.5 md:gap-2 p-1 md:p-1.5 bg-secondary rounded-2xl border border-white/10 self-start overflow-x-auto no-scrollbar max-w-full">
          {[
            { id: 'overview', label: 'Todos', color: 'primary' },
            { id: 'payable', label: 'A Pagar', color: 'red' },
            { id: 'receivable', label: 'A Receber', color: 'emerald' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? `bg-primary text-primary-foreground shadow-lg shadow-primary/20` : 'text-muted-foreground hover:text-foreground'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="premium-card p-4 !rounded-3xl flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[300px]">
            <Input
              icon={<Search size={20} />}
              placeholder="Pesquisar por descrição..."
              className="bg-secondary/50 border-white/10 focus:border-primary/30 font-medium py-3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`p-3 rounded-2xl border transition-all ${showFilters ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-secondary/50 border-white/10 text-muted-foreground hover:text-foreground'}`}>
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* TABLE VIEW */}
      <div className="premium-card !rounded-[2.5rem] overflow-hidden flex flex-col h-[calc(100vh-22rem)] relative shadow-2xl border border-white/10">
        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-left text-sm border-separate border-spacing-0">
            <thead className="bg-secondary/50 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-white/10">Descrição</th>
                <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-white/10">Categoria</th>
                <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-white/10 text-center">Vencimento</th>
                <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-white/10 text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-white/10 text-right">Valor</th>
                <th className="px-8 py-5 border-b border-white/10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRecords.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map(record => (
                <tr key={record.id} className="group hover:bg-secondary/30 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${record.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {record.type === 'income' ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
                      </div>
                      <div>
                        <p className="font-bold text-foreground group-hover:text-primary transition-colors">{record.description}</p>
                        {record.relatedEntityId && (
                          <p className="text-[10px] text-muted-foreground font-black uppercase mt-1 italic">Beneficiário: {agents.find(a => a.id === record.relatedEntityId)?.name || 'Vários'}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col items-start gap-1">
                      <span className="bg-secondary px-3 py-1 rounded-lg text-[10px] font-black text-muted-foreground uppercase tracking-widest border border-white/10">{record.category}</span>
                      {record.bankAccountId && (
                        <span className="text-[9px] font-bold text-muted-foreground mt-1 flex items-center gap-1"><Building size={10} /> {bankAccounts.find(b => b.id === record.bankAccountId)?.name || 'Banco Excluído'}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                        <Calendar size={12} className="opacity-40" />
                        {formatDate(record.dueDate)}
                      </div>
                      {record.status === 'pending' && record.dueDate < new Date().toISOString().split('T')[0] && (
                        <span className="text-[9px] font-black text-red-500 uppercase flex items-center gap-1"><AlertCircle size={8} /> Atrasado</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center">
                      <button
                        onClick={() => updateFinancialRecord(record.id, { status: record.status === 'pending' ? 'paid' : 'pending' })}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${record.status === 'paid' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-amber-500/5 border-amber-500/20 text-amber-500'}`}
                      >
                        {record.status === 'paid' ? <CheckCircle size={12} /> : <Clock size={12} />}
                        <span className="text-[9px] font-black uppercase tracking-[0.1em]">{record.status === 'paid' ? 'Efetivado' : 'Aguardando'}</span>
                      </button>
                    </div>
                  </td>
                  <td className={`px-8 py-6 text-right font-black text-lg ${record.type === 'income' ? 'text-emerald-500' : 'text-foreground'}`}>
                    {formatCurrency(record.amount)}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(record.type, record)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all"><Pencil size={18} /></button>
                      <button onClick={() => deleteFinancialRecord(record.id)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="premium-card bg-card border border-border w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-10 py-8 bg-secondary border-b border-border flex justify-between items-center relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/60"></div>
              <div>
                <h2 className="text-2xl font-black text-foreground italic uppercase tracking-tighter">{editingId ? 'Editar Registro' : 'Novo Lançamento'}</h2>
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">Sistema de lançamento manual</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"><X /></button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
              <div className="flex gap-4 p-1.5 bg-secondary/50 rounded-[1.5rem] border border-white/10">
                <button type="button" onClick={() => setFormData({ ...formData, type: 'expense', category: '' })} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === 'expense' ? 'bg-red-500 text-black shadow-lg shadow-red-900/20' : 'text-muted-foreground hover:text-foreground'}`}>
                  <ArrowDownCircle size={14} /> Despesa
                </button>
                <button type="button" onClick={() => setFormData({ ...formData, type: 'income', category: '' })} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === 'income' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-900/20' : 'text-muted-foreground hover:text-foreground'}`}>
                  <ArrowUpCircle size={14} /> Receita
                </button>
              </div>

              <div className="space-y-6">
                <div className="group">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2 px-1 italic">Descrição do Lançamento</label>
                  <input required className="finance-input w-full" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Ex: Manutenção do escritório" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2 px-1">Valor (R$)</label>
                    <input type="number" step="0.01" required className="finance-input w-full font-mono text-lg" value={formData.amount || ''} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2 px-1">Categoria <span className="text-red-500">*</span></label>
                    <select required className="finance-input w-full" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                      <option value="">Selecione...</option>
                      {availableCategories.map(cat => <option key={cat.id} value={cat.name}>{cat.displayName}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2 px-1">Conta Bancária</label>
                    <select className="finance-input w-full" value={formData.bankAccountId || ''} onChange={e => setFormData({ ...formData, bankAccountId: e.target.value })}>
                      <option value="">Opcional...</option>
                      {bankAccounts.filter(b => b.status === 'active').map(bank => (
                        <option key={bank.id} value={bank.id}>{bank.name} - {bank.bankName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2 px-1">Forma de Pagto.</label>
                    <select className="finance-input w-full" value={formData.paymentMethodId || ''} onChange={e => setFormData({ ...formData, paymentMethodId: e.target.value })}>
                      <option value="">Opcional...</option>
                      {paymentMethods.filter(p => p.status === 'active').map(method => (
                        <option key={method.id} value={method.id}>{method.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2 px-1 text-cyan-400">Competência</label>
                    <input type="date" required className="finance-input w-full text-xs" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2 px-1 text-amber-500">Vencimento</label>
                    <input type="date" required className="finance-input w-full text-xs border-amber-500/20" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
                  </div>
                </div>

                {formData.category === 'Comissão' && (
                  <div className="bg-primary/5 border border-primary/20 p-5 rounded-3xl animate-in fade-in zoom-in-95 duration-300">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest block mb-3">Vincular Beneficiário</label>
                    <select className="finance-input w-full bg-secondary/40" value={formData.relatedEntityId || ''} onChange={e => setFormData({ ...formData, relatedEntityId: e.target.value })}>
                      <option value="">Selecione...</option>
                      {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 bg-secondary p-4 rounded-2xl border border-border">
                <input
                  type="checkbox" id="isPaid" checked={formData.status === 'paid'}
                  onChange={e => setFormData({ ...formData, status: e.target.checked ? 'paid' : 'pending' })}
                  className="w-5 h-5 accent-primary"
                />
                <label htmlFor="isPaid" className="text-sm font-bold text-muted-foreground cursor-pointer">Confirmar efetivação (Pago/Recebido)</label>
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors">Cancelar</button>
                <button type="submit" className="px-10 py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-black font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-emerald-900/20 transition-all active:scale-95">Salvar Registro</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
