
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppProvider';
import { FinanceStatus, FinancialRecord, TransactionType } from '../types';
import { formatCurrency, formatDate, generateId } from '../utils';
import {
  Search, Filter, TrendingUp, Calendar, ArrowUpCircle, ArrowDownCircle,
  Plus, Pencil, Trash2, X, CheckCircle2
} from 'lucide-react';
import { Input } from '../components/ui/Input';

export const CashFlow = () => {
  const { financialRecords, addFinancialRecord, updateFinancialRecord, deleteFinancialRecord, agents, categories } = useApp();

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // CRUD State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialFormState: Partial<FinancialRecord> = {
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    type: 'income',
    category: '',
    description: '',
    amount: 0,
    status: 'paid', // Default to paid in Cash Flow view usually
    relatedEntityId: ''
  };
  const [formData, setFormData] = useState<Partial<FinancialRecord>>(initialFormState);

  // Derive available categories
  const availableCategories = categories.filter(c => c.type === formData.type);

  // --- LOGIC: RUNNING BALANCE ON FULL DATASET ---
  const cashFlowData = useMemo(() => {
    // 1. Sort ALL records chronologically by Competence Date (date)
    const sortedAll = [...financialRecords].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // 2. Calculate Running Balance for everything
    let runningBalance = 0;
    const withBalance = sortedAll.map(record => {
      const value = record.type === 'income' ? record.amount : -record.amount;
      runningBalance += value;
      return { ...record, balance: runningBalance };
    });

    // 3. Apply Filters for Display
    return withBalance.filter(record => {
      const matchSearch = record.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDateStart = filterDateStart ? record.date >= filterDateStart : true;
      const matchDateEnd = filterDateEnd ? record.date <= filterDateEnd : true;
      const matchCategory = filterCategory ? record.category === filterCategory : true;

      return matchSearch && matchDateStart && matchDateEnd && matchCategory;
    });
  }, [financialRecords, searchTerm, filterDateStart, filterDateEnd, filterCategory]);

  // Summary Metrics for the VISIBLE period
  const periodMetrics = useMemo(() => {
    return cashFlowData.reduce((acc, curr) => {
      if (curr.type === 'income') acc.in += curr.amount;
      else acc.out += curr.amount;
      return acc;
    }, { in: 0, out: 0 });
  }, [cashFlowData]);

  const currentBalance = cashFlowData.length > 0 ? cashFlowData[cashFlowData.length - 1].balance : 0;

  const clearFilters = () => {
    setSearchTerm('');
    setFilterDateStart('');
    setFilterDateEnd('');
    setFilterCategory('');
  };

  // --- ACTIONS ---
  const handleOpenModal = (type: TransactionType = 'income', record?: FinancialRecord) => {
    const today = new Date().toISOString().split('T')[0];

    if (record) {
      setFormData({
        ...record,
        date: record.date || today,
        dueDate: record.dueDate || today
      });
      setEditingId(record.id);
    } else {
      setFormData({
        ...initialFormState,
        type,
        date: today,
        dueDate: today,
        status: 'paid', // New manual entries in cash flow default to paid
        category: ''
      });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    if (editingId) {
      updateFinancialRecord(editingId, formData);
    } else {
      addFinancialRecord({ ...formData, id: generateId() } as FinancialRecord);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro do fluxo de caixa?')) {
      deleteFinancialRecord(id);
    }
  };

  const handleToggleStatus = (record: FinancialRecord) => {
    updateFinancialRecord(record.id, {
      status: record.status === 'pending' ? 'paid' : 'pending'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2 uppercase italic tracking-tighter">
            <TrendingUp className="text-primary" />
            Fluxo de <span className="text-primary">Caixa</span>
          </h1>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-1">Extrato detalhado de movimentações e saldo acumulado.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenModal('income')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all text-sm font-medium"
          >
            <Plus size={18} />
            Entrada
          </button>
          <button
            onClick={() => handleOpenModal('expense')}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all text-sm font-medium"
          >
            <Plus size={18} />
            Saída
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-6">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 italic">Entradas (Período)</p>
          <p className="text-2xl font-black text-emerald-500 flex items-center gap-2 italic tracking-tighter">
            <ArrowUpCircle size={22} /> {formatCurrency(periodMetrics.in)}
          </p>
        </div>
        <div className="premium-card p-6">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 italic">Saídas (Período)</p>
          <p className="text-2xl font-black text-red-500 flex items-center gap-2 italic tracking-tighter">
            <ArrowDownCircle size={22} /> {formatCurrency(periodMetrics.out)}
          </p>
        </div>
        <div className="premium-card p-6 border-primary/20 bg-primary/5">
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 italic">Saldo Acumulado (Final)</p>
          <p className="text-2xl font-black text-foreground flex items-center gap-2 italic tracking-tighter">
            <TrendingUp size={22} /> {formatCurrency(currentBalance)}
          </p>
        </div>
      </div>

      {/* FILTERS TOOLBAR */}
      <div className="premium-card p-4 !rounded-2xl border-white/10">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <Input
              icon={<Search size={18} />}
              placeholder="Buscar no extrato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-all text-[10px] font-black uppercase tracking-widest ${showFilters ? 'bg-primary text-black border-primary' : 'border-white/10 text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}
          >
            <Filter size={18} />
            <span>Filtros</span>
          </button>
          {(filterDateStart || filterDateEnd || filterCategory) && (
            <button
              onClick={clearFilters}
              className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 pt-6 border-t border-border/40 animate-in slide-in-from-top-2 fade-in duration-300">
            <div>
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 italic">Data Início</label>
              <input
                type="date"
                className="w-full bg-background p-2.5 rounded-xl border border-border text-xs font-bold text-foreground focus:border-primary outline-none"
                value={filterDateStart}
                onChange={(e) => setFilterDateStart(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 italic">Data Fim</label>
              <input
                type="date"
                className="w-full bg-background p-2.5 rounded-xl border border-border text-xs font-bold text-foreground focus:border-primary outline-none"
                value={filterDateEnd}
                onChange={(e) => setFilterDateEnd(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 italic">Categoria</label>
              <select
                className="w-full bg-background p-2.5 rounded-xl border border-border text-xs font-bold text-foreground focus:border-primary outline-none appearance-none"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">Todas</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* CASH FLOW TABLE */}
      <div className="premium-card !rounded-2xl overflow-hidden border-white/10">
        <table className="w-full text-left text-xs">
          <thead className="bg-secondary/50 border-b border-white/10 text-muted-foreground font-black uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Descrição</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4 text-right">Entrada</th>
              <th className="px-6 py-4 text-right">Saída</th>
              <th className="px-6 py-4 text-right bg-secondary/30">Saldo</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[11px] font-bold">
            {cashFlowData.map(record => (
              <tr key={record.id} className="hover:bg-white/5 group transition-colors">
                <td className="px-6 py-4 text-muted-foreground whitespace-nowrap flex items-center gap-2">
                  <Calendar size={14} className="text-muted-foreground/30 group-hover:text-primary transition-colors" />
                  {formatDate(record.date)}
                </td>
                <td className="px-6 py-4 font-black text-foreground uppercase italic">{record.description}</td>
                <td className="px-6 py-4">
                  <span className="bg-secondary text-muted-foreground px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">{record.category}</span>
                </td>
                <td className="px-6 py-4 text-right text-emerald-500 font-black italic">
                  {record.type === 'income' ? formatCurrency(record.amount) : '-'}
                </td>
                <td className="px-6 py-4 text-right text-red-500 font-black italic">
                  {record.type === 'expense' ? formatCurrency(record.amount) : '-'}
                </td>
                <td className={`px-6 py-4 text-right font-black italic bg-white/[0.02] group-hover:bg-white/[0.05] transition-colors ${record.balance >= 0 ? 'text-foreground' : 'text-red-500'}`}>
                  {formatCurrency(record.balance)}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleToggleStatus(record)}
                    className={`w-3 h-3 rounded-full inline-block transition-transform hover:scale-125 ${record.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-400'}`}
                    title={record.status === 'paid' ? 'Realizado (Clique para pendente)' : 'Previsto (Clique para baixar)'}
                  />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenModal(record.type, record)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-500/10 rounded"
                      title="Excluir"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {cashFlowData.length === 0 && (
              <tr><td colSpan={8} className="p-12 text-center text-muted-foreground">Nenhum movimento encontrado para o período selecionado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CRUD Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="premium-card bg-card border border-border w-full max-w-lg p-8 shadow-3xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-foreground uppercase italic tracking-tighter">
                {editingId ? 'Editar Lançamento' : `Nova ${formData.type === 'expense' ? 'Saída' : 'Entrada'}`}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Type Toggle */}
              <div className="flex gap-2 p-1.5 bg-secondary rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                  className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === 'expense' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-muted-foreground hover:bg-white/5'}`}
                >
                  Saída (Despesa)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
                  className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === 'income' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-muted-foreground hover:bg-white/5'}`}
                >
                  Entrada (Receita)
                </button>
              </div>

              <div>
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2 px-1">Descrição</label>
                <input
                  required
                  className="premium-input w-full"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Pagamento Fornecedor, Recebimento Venda..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2 px-1">Valor (R$)</label>
                  <input
                    type="number" step="0.01" required
                    className="premium-input w-full font-mono text-sm"
                    value={formData.amount || ''}
                    onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2 px-1">Categoria</label>
                  <select
                    required
                    className="premium-input w-full appearance-none"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">Selecione...</option>
                    {availableCategories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Conditional Agent Selection for Commission */}
              {formData.category === 'Comissão' && formData.type === 'expense' && (
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <label className="block text-sm font-medium text-primary mb-1">Selecione o Corretor</label>
                  <select
                    className="premium-input w-full appearance-none mb-1"
                    value={formData.relatedEntityId || ''}
                    onChange={e => setFormData({ ...formData, relatedEntityId: e.target.value })}
                  >
                    <option value="">Selecione...</option>
                    {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">Vincula ao extrato do corretor.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2 px-1">Data Competência</label>
                  <input
                    type="date" required
                    className="premium-input w-full text-xs"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                  />
                  <p className="text-[10px] text-muted-foreground mt-0.5 ml-1 italic opacity-70">Data para o fluxo cronológico.</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-2 px-1">Data Vencimento</label>
                  <input
                    type="date" required
                    className="premium-input w-full text-xs"
                    value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                  <p className="text-[10px] text-muted-foreground mt-0.5 ml-1 italic opacity-70">Referência para contas a pagar.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="statusCheck"
                  checked={formData.status === 'paid'}
                  onChange={e => setFormData({ ...formData, status: e.target.checked ? 'paid' : 'pending' })}
                  className="w-5 h-5 accent-primary rounded"
                />
                <label htmlFor="statusCheck" className="text-xs font-bold text-muted-foreground cursor-pointer select-none uppercase tracking-wide">
                  {formData.type === 'expense' ? 'Já foi pago?' : 'Já foi recebido?'}
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border/50">

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 rounded-xl text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-primary to-cyan-500 hover:to-cyan-400 text-black rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
