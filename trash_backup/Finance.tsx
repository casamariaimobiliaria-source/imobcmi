
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppProvider';
import { FinancialRecord, TransactionType, FinanceStatus } from '../types';
import { formatCurrency, formatDate, generateId } from '../utils';
import { 
  ArrowDownCircle, ArrowUpCircle, Wallet, Search, Filter, 
  Pencil, Trash2, CheckCircle2, Calendar, X, AlertCircle, Clock, CheckCircle
} from 'lucide-react';

export const Finance = () => {
  const { financialRecords, agents, categories, addFinancialRecord, updateFinancialRecord, deleteFinancialRecord } = useApp();
  
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
    relatedEntityId: ''
  };
  const [formData, setFormData] = useState<Partial<FinancialRecord>>(initialFormState);

  // Derive categories based on current form type
  const availableCategories = categories.filter(c => c.type === formData.type);

  // --- KPI CALCULATIONS (GLOBAL) ---
  const kpis = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    return financialRecords.reduce((acc, r) => {
        // Income Stats
        if (r.type === 'income') {
            if (r.status === 'paid') {
                acc.received += r.amount;
            } else {
                acc.toReceive += r.amount;
            }
        } 
        // Expense Stats
        else {
            if (r.status === 'paid') {
                acc.paid += r.amount;
            } else {
                acc.toPay += r.amount;
            }
        }

        // Overdue Stats (Pending AND DueDate < Today)
        if (r.status === 'pending' && r.dueDate < today) {
            acc.overdue += r.amount;
            acc.overdueCount++;
        }

        return acc;
    }, { received: 0, toReceive: 0, paid: 0, toPay: 0, overdue: 0, overdueCount: 0 });
  }, [financialRecords]);

  // --- LIST FILTER LOGIC ---
  let baseRecords = financialRecords;
  if (activeTab === 'payable') {
      baseRecords = financialRecords.filter(r => r.type === 'expense');
  } else if (activeTab === 'receivable') {
      baseRecords = financialRecords.filter(r => r.type === 'income');
  }

  const filteredRecords = baseRecords.filter(record => {
      // Text Search
      const matchSearch = record.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by Due Date (dueDate) for AP/AR
      const dateToCheck = record.dueDate;
      
      const matchDateStart = filterDateStart ? dateToCheck >= filterDateStart : true;
      const matchDateEnd = filterDateEnd ? dateToCheck <= filterDateEnd : true;
      const matchCategory = filterCategory ? record.category === filterCategory : true;
      const matchStatus = filterStatus ? record.status === filterStatus : true;

      return matchSearch && matchDateStart && matchDateEnd && matchCategory && matchStatus;
  });
  
  const clearFilters = () => {
      setSearchTerm('');
      setFilterDateStart('');
      setFilterDateEnd('');
      setFilterCategory('');
      setFilterStatus('');
  };

  // Handlers
  const handleOpenModal = (type: TransactionType = 'expense', record?: FinancialRecord) => {
    const today = new Date().toISOString().split('T')[0];
    
    if (record) {
      setFormData({
        ...record,
        // Ensure dates are valid strings (fallback to today if missing)
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
        category: '' // Reset category when opening new
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
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      deleteFinancialRecord(id);
    }
  };

  const handleToggleStatus = (record: FinancialRecord) => {
    updateFinancialRecord(record.id, { 
      status: record.status === 'pending' ? 'paid' : 'pending' 
    });
  };

  // Helper Components
  const StatusBadge = ({ status }: { status: FinanceStatus }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
      status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
    }`}>
      {status === 'paid' ? 'Pago/Recebido' : 'Pendente'}
    </span>
  );

  const KPICard = ({ title, value, icon: Icon, colorClass, subText }: any) => (
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between min-w-[200px]">
         <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">{title}</p>
            <h3 className={`text-xl font-bold ${colorClass}`}>{formatCurrency(value)}</h3>
            {subText && <p className="text-xs text-slate-400 mt-1">{subText}</p>}
         </div>
         <div className={`p-2 rounded-lg ${colorClass.replace('text-', 'bg-').replace('600', '50').replace('500', '50')} ${colorClass}`}>
            <Icon size={20} />
         </div>
      </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Contas a Pagar/Receber</h1>
           <p className="text-slate-500">Gestão de títulos e vencimentos.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleOpenModal('expense')}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all"
          >
            <ArrowDownCircle size={18} />
            <span>Nova Conta (Pagar)</span>
          </button>
          <button 
            onClick={() => handleOpenModal('income')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all"
          >
            <ArrowUpCircle size={18} />
            <span>Nova Conta (Receber)</span>
          </button>
        </div>
      </div>

      {/* KPI CARDS (Always Visible) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-2 md:pb-0">
        <KPICard 
            title="Total Recebido" 
            value={kpis.received} 
            icon={CheckCircle} 
            colorClass="text-emerald-600" 
        />
        <KPICard 
            title="A Receber" 
            value={kpis.toReceive} 
            icon={Clock} 
            colorClass="text-blue-600" 
        />
        <KPICard 
            title="Total Pago" 
            value={kpis.paid} 
            icon={CheckCircle} 
            colorClass="text-slate-600" 
        />
        <KPICard 
            title="A Pagar" 
            value={kpis.toPay} 
            icon={Clock} 
            colorClass="text-amber-500" 
        />
        <KPICard 
            title="Em Atraso" 
            value={kpis.overdue} 
            icon={AlertCircle} 
            colorClass="text-red-600" 
            subText={`${kpis.overdueCount} lançamentos`}
        />
      </div>

      {/* TABS */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-medium text-sm transition-colors whitespace-nowrap relative ${activeTab === 'overview' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Visão Geral (Todos)
          {activeTab === 'overview' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('payable')}
          className={`px-6 py-3 font-medium text-sm transition-colors whitespace-nowrap relative ${activeTab === 'payable' ? 'text-red-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          A Pagar (Despesas)
          {activeTab === 'payable' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('receivable')}
          className={`px-6 py-3 font-medium text-sm transition-colors whitespace-nowrap relative ${activeTab === 'receivable' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          A Receber (Receitas)
          {activeTab === 'receivable' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600"></div>}
        </button>
      </div>

      {/* FILTERS TOOLBAR */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex flex-wrap gap-4 items-center">
             <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar por descrição..." 
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
            {(filterDateStart || filterDateEnd || filterCategory || filterStatus) && (
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2 fade-in duration-300">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Vencimento Início</label>
                    <input 
                        type="date"
                        className="w-full p-2 rounded-md border border-slate-200 text-sm focus:border-blue-500 outline-none"
                        value={filterDateStart}
                        onChange={(e) => setFilterDateStart(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Vencimento Fim</label>
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
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
                    <select 
                        className="w-full p-2 rounded-md border border-slate-200 text-sm focus:border-blue-500 outline-none appearance-none bg-white"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as FinanceStatus)}
                    >
                        <option value="">Todos</option>
                        <option value="paid">Pago / Recebido</option>
                        <option value="pending">Pendente</option>
                    </select>
                </div>
            </div>
          )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-0 md:p-6 overflow-hidden flex flex-col h-[calc(100vh-14rem)]">
        <h3 className="hidden md:block font-semibold text-slate-800 mb-4 p-4 md:p-0">
            <span>
              {activeTab === 'overview' && 'Listagem de Lançamentos'}
              {activeTab === 'payable' && 'Contas a Pagar (A Vencer)'}
              {activeTab === 'receivable' && 'Contas a Receber (A Vencer)'}
            </span>
        </h3>

        {/* Desktop Table View - With Sticky Header */}
        <div className="hidden md:block overflow-auto flex-1">
          <table className="w-full text-left text-sm relative">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Vencimento</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .map(record => (
                <tr key={record.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800">{record.description}</p>
                    {record.relatedEntityId && (
                      <p className="text-xs text-slate-400">Ref: {agents.find(a => a.id === record.relatedEntityId)?.name}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{record.category}</td>
                  <td className="px-6 py-4 text-slate-600 flex items-center gap-2">
                     <Calendar size={14} className={`text-slate-400 ${record.status === 'pending' && record.dueDate < new Date().toISOString().split('T')[0] ? 'text-red-500' : ''}`}/>
                     <span className={record.status === 'pending' && record.dueDate < new Date().toISOString().split('T')[0] ? 'text-red-600 font-bold' : ''}>
                        {formatDate(record.dueDate)}
                     </span>
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={record.status} /></td>
                  <td className={`px-6 py-4 text-right font-bold ${
                    record.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(record.amount)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleToggleStatus(record)}
                        className={`p-1.5 rounded transition-colors ${record.status === 'paid' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                        title={record.status === 'pending' ? "Marcar como Pago" : "Marcar como Pendente"}
                      >
                        <CheckCircle2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleOpenModal(record.type, record)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(record.id)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">Nenhum registro encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
            {filteredRecords.map(record => (
                <div key={record.id} className="p-4 border-b border-slate-100 last:border-0 flex flex-col gap-2">
                     <div className="flex justify-between items-start">
                         <div>
                             <p className="font-bold text-slate-800">{record.description}</p>
                             <p className="text-xs text-slate-400">{record.category}</p>
                         </div>
                         <p className={`font-bold ${record.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                             {formatCurrency(record.amount)}
                         </p>
                     </div>
                     
                     <div className="flex justify-between items-center mt-1">
                         <div className="flex items-center gap-2 text-xs text-slate-500">
                             <Calendar size={14} className={record.status === 'pending' && record.dueDate < new Date().toISOString().split('T')[0] ? 'text-red-500' : ''} />
                             <span className={record.status === 'pending' && record.dueDate < new Date().toISOString().split('T')[0] ? 'text-red-600 font-bold' : ''}>
                                {formatDate(record.dueDate)}
                             </span>
                         </div>
                         <StatusBadge status={record.status} />
                     </div>

                     <div className="flex justify-end gap-3 mt-3 pt-3 border-t border-slate-50">
                        <button 
                            onClick={() => handleToggleStatus(record)}
                            className={`flex items-center gap-1 text-xs font-medium ${record.status === 'paid' ? 'text-emerald-600' : 'text-slate-500'}`}
                        >
                            <CheckCircle2 size={16} /> {record.status === 'paid' ? 'Pago' : 'Marcar Pago'}
                        </button>
                        <div className="w-px h-4 bg-slate-200"></div>
                        <button onClick={() => handleOpenModal(record.type, record)} className="text-slate-400">
                            <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(record.id)} className="text-slate-400">
                            <Trash2 size={16} />
                        </button>
                     </div>
                </div>
            ))}
            {filteredRecords.length === 0 && (
                <div className="p-8 text-center text-slate-400">Nenhum registro encontrado.</div>
            )}
        </div>
      </div>

      {/* CRUD Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? 'Editar Lançamento' : `Nova ${formData.type === 'expense' ? 'Despesa' : 'Receita'}`}
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
                  Despesa (A Pagar)
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'income', category: ''})}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${formData.type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                >
                  Receita (A Receber)
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">Plano de Contas</label>
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

              {/* Conditional Agent Selection */}
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
                  <p className="text-xs text-blue-600 mt-1">Este valor será vinculado ao extrato do corretor.</p>
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
                  <p className="text-[10px] text-slate-400 mt-0.5">Quando ocorreu o fato gerador.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1">Data de Vencimento</label>
                  <input 
                    type="date" required
                    className="w-full p-2.5 rounded border border-slate-300 bg-yellow-50 focus:bg-white transition-colors"
                    value={formData.dueDate}
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Data limite para pagamento.</p>
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
