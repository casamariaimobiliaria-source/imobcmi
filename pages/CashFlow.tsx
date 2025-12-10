
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppProvider';
import { FinanceStatus, FinancialRecord, TransactionType } from '../types';
import { formatCurrency, formatDate, generateId } from '../utils';
import { 
  Search, Filter, TrendingUp, Calendar, ArrowUpCircle, ArrowDownCircle, 
  Plus, Pencil, Trash2, X, CheckCircle2
} from 'lucide-react';

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
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="text-indigo-600" />
            Fluxo de Caixa
          </h1>
          <p className="text-slate-500">Extrato detalhado de movimentações e saldo acumulado.</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Entradas (Período)</p>
            <p className="text-xl font-bold text-emerald-600 flex items-center gap-2">
                <ArrowUpCircle size={18}/> {formatCurrency(periodMetrics.in)}
            </p>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Saídas (Período)</p>
            <p className="text-xl font-bold text-red-600 flex items-center gap-2">
                <ArrowDownCircle size={18}/> {formatCurrency(periodMetrics.out)}
            </p>
         </div>
         <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm text-white">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Saldo Acumulado (Final)</p>
            <p className="text-xl font-bold flex items-center gap-2">
                <TrendingUp size={18}/> {formatCurrency(currentBalance)}
            </p>
         </div>
      </div>

      {/* FILTERS TOOLBAR */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex flex-wrap gap-4 items-center">
             <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar no extrato..." 
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
                <Filter size={18} />
                <span>Filtros</span>
            </button>
            {(filterDateStart || filterDateEnd || filterCategory) && (
                 <button 
                    onClick={clearFilters}
                    className="text-sm text-red-500 hover:text-red-700 underline"
                 >
                    Limpar
                 </button>
            )}
          </div>
          
          {/* Expanded Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2 fade-in duration-300">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Data Início</label>
                    <input 
                        type="date"
                        className="w-full p-2 rounded-md border border-slate-200 text-sm focus:border-blue-500 outline-none"
                        value={filterDateStart}
                        onChange={(e) => setFilterDateStart(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Data Fim</label>
                    <input 
                        type="date"
                        className="w-full p-2 rounded-md border border-slate-200 text-sm focus:border-blue-500 outline-none"
                        value={filterDateEnd}
                        onChange={(e) => setFilterDateEnd(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Categoria</label>
                    <select 
                        className="w-full p-2 rounded-md border border-slate-200 text-sm focus:border-blue-500 outline-none appearance-none bg-white"
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
            <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4 text-right text-emerald-600">Entrada</th>
                <th className="px-6 py-4 text-right text-red-600">Saída</th>
                <th className="px-6 py-4 text-right text-slate-800 font-bold bg-slate-100/50">Saldo</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
            {cashFlowData.map(record => (
                <tr key={record.id} className="hover:bg-slate-50 group transition-colors">
                <td className="px-6 py-4 text-slate-600 whitespace-nowrap flex items-center gap-2">
                    <Calendar size={14} className="text-slate-300 group-hover:text-blue-400 transition-colors"/>
                    {formatDate(record.date)}
                </td>
                <td className="px-6 py-4 font-medium text-slate-800">{record.description}</td>
                <td className="px-6 py-4 text-slate-500">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{record.category}</span>
                </td>
                <td className="px-6 py-4 text-right text-emerald-600 font-medium">
                    {record.type === 'income' ? formatCurrency(record.amount) : '-'}
                </td>
                <td className="px-6 py-4 text-right text-red-600 font-medium">
                    {record.type === 'expense' ? formatCurrency(record.amount) : '-'}
                </td>
                <td className={`px-6 py-4 text-right font-bold bg-slate-50 group-hover:bg-slate-100 transition-colors ${record.balance >= 0 ? 'text-slate-700' : 'text-red-600'}`}>
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
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Excluir"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </td>
                </tr>
            ))}
            {cashFlowData.length === 0 && (
                <tr><td colSpan={8} className="p-12 text-center text-slate-400">Nenhum movimento encontrado para o período selecionado.</td></tr>
            )}
            </tbody>
        </table>
      </div>

      {/* CRUD Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? 'Editar Lançamento' : `Nova ${formData.type === 'expense' ? 'Saída' : 'Entrada'}`}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Type Toggle */}
              <div className="flex gap-4 p-1 bg-slate-100 rounded-lg">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'expense', category: ''})}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${formData.type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}
                >
                  Saída (Despesa)
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'income', category: ''})}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${formData.type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                >
                  Entrada (Receita)
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <input 
                  required
                  className="w-full p-2.5 rounded border border-slate-300"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Ex: Pagamento Fornecedor, Recebimento Venda..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                    <input 
                      type="number" step="0.01" required
                      className="w-full p-2.5 rounded border border-slate-300"
                      value={formData.amount || ''}
                      onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                    <select 
                      required
                      className="w-full p-2.5 rounded border border-slate-300"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
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
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <label className="block text-sm font-medium text-blue-800 mb-1">Selecione o Corretor</label>
                  <select 
                    className="w-full p-2.5 rounded border border-blue-200"
                    value={formData.relatedEntityId || ''}
                    onChange={e => setFormData({...formData, relatedEntityId: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                  <p className="text-xs text-blue-600 mt-1">Vincula ao extrato do corretor.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data Competência</label>
                  <input 
                    type="date" required
                    className="w-full p-2.5 rounded border border-slate-300"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Data para o fluxo cronológico.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1">Data Vencimento</label>
                  <input 
                    type="date" required
                    className="w-full p-2.5 rounded border border-slate-300 bg-yellow-50 focus:bg-white transition-colors"
                    value={formData.dueDate}
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Referência para contas a pagar.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                 <input 
                    type="checkbox" 
                    id="statusCheck"
                    checked={formData.status === 'paid'}
                    onChange={e => setFormData({...formData, status: e.target.checked ? 'paid' : 'pending'})}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                 />
                 <label htmlFor="statusCheck" className="text-sm font-medium text-slate-700">
                    {formData.type === 'expense' ? 'Já foi pago?' : 'Já foi recebido?'}
                 </label>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
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
