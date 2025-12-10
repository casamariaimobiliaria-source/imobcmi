
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppProvider';
import { Sale, SaleStatus } from '../types';
import { formatCurrency, formatPercent, formatDate, generateId } from '../utils';
import { supabase } from '../supabaseClient';
import { Plus, Search, Filter, Save, X, Pencil, Trash2, Calendar, User, Tag, Building2, Briefcase, Scissors, Calculator, FileDown, FileText, Eye } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const Sales = () => {
  const { sales, agents, clients, developers, projects, addSale, updateSale, deleteSale, user } = useApp();
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);



  // Receipt Modal State
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const activeAgents = agents.filter(a => a.status === 'active');

  // --- FILTERS STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Specific Filters
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [filterAgentId, setFilterAgentId] = useState('');
  const [filterClientId, setFilterClientId] = useState('');
  const [filterDeveloperId, setFilterDeveloperId] = useState('');
  const [filterStatus, setFilterStatus] = useState<SaleStatus | ''>('');

  // --- FORM STATE ---
  const initialFormState: Partial<Sale> = {
    date: new Date().toISOString().split('T')[0],
    commissionPercent: 0,
    taxPercent: 0,
    agentSplitPercent: 50.0,
    unitValue: 0,
    grossCommission: 0,
    taxValue: 0,
    miscExpensesValue: 0,
    miscExpensesDescription: '',
    agentCommission: 0,
    agencyCommission: 0,
    status: 'pending'
  };

  const [formData, setFormData] = useState<Partial<Sale>>(initialFormState);

  // Set default agent if user is an agent
  useEffect(() => {
    if (user?.role === 'agent' && view === 'form' && !editingId) {
      setFormData(prev => ({ ...prev, agentId: user.id }));
    }
  }, [user, view, editingId]);

  // --- CALCULATIONS ---
  // --- CALCULATIONS ---
  useEffect(() => {
    // Recalculate whenever these inputs change
    // We now calculate % based on Gross, instead of Gross based on %

    const gross = formData.grossCommission || 0;
    const unitVal = formData.unitValue || 0;

    // 1. Calculate % Commission Total (if unitValue > 0)
    let calculatedPercent = 0;
    if (unitVal > 0) {
      calculatedPercent = (gross / unitVal) * 100;
    }

    // 2. Calculate Tax (Based on Gross)
    // If taxPercent is null/undefined, tax is 0
    const taxPct = formData.taxPercent || 0;
    const tax = gross * (taxPct / 100);

    // 3. Misc Expenses
    const misc = formData.miscExpensesValue || 0;

    // 4. Net Base for Distribution (Gross - Tax - Misc)
    const netBase = gross - tax - misc;

    // 5. Split
    const agentShare = netBase * ((formData.agentSplitPercent || 0) / 100);
    const agencyShare = netBase - agentShare;

    // Only update if values are different to avoid infinite loops
    // We use a functional update to check previous values if needed, 
    // but here we just set the derived values.
    // Note: We do NOT set grossCommission here, as it is now an input.
    // We DO set commissionPercent.

    setFormData(prev => {
      if (
        prev.commissionPercent === calculatedPercent &&
        prev.taxValue === tax &&
        prev.agentCommission === agentShare &&
        prev.agencyCommission === agencyShare
      ) {
        return prev;
      }

      return {
        ...prev,
        commissionPercent: parseFloat(calculatedPercent.toFixed(2)),
        taxValue: tax,
        agentCommission: agentShare,
        agencyCommission: agencyShare
      };
    });
  }, [formData.unitValue, formData.grossCommission, formData.taxPercent, formData.agentSplitPercent, formData.miscExpensesValue]);

  // --- ACTIONS ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role === 'agent') return; // Security check

    if (!formData.agentId || !formData.clientId || !formData.developerId) return;

    if (editingId) {
      updateSale(editingId, formData);
    } else {
      addSale({
        id: generateId(),
        ...formData as Sale
      });
    }

    setFormData(initialFormState);
    setEditingId(null);
    setView('list');
  };

  const handleEdit = (sale: Sale) => {
    setFormData(sale);
    setEditingId(sale.id);
    setView('form');
  };

  const handleDelete = (id: string) => {
    if (user?.role === 'agent') return;
    if (window.confirm('Tem certeza que deseja excluir esta venda?')) {
      deleteSale(id);
    }
  };

  const handleNewSale = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setView('form');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterDateStart('');
    setFilterDateEnd('');
    setFilterAgentId('');
    setFilterClientId('');
    setFilterDeveloperId('');
    setFilterStatus('');
  };

  const handleExportPDF = async () => {
    if (!receiptRef.current) return;
    setIsExporting(true);

    try {
      const element = receiptRef.current;
      // Use html2canvas options to ensure full capture even if scrolled
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        backgroundColor: '#ffffff',
        useCORS: true,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`recibo-${receiptSale?.id || 'venda'}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Ocorreu um erro ao gerar o PDF. Tente novamente.");
    } finally {
      setIsExporting(false);
    }
  };

  // --- FILTER LOGIC ---
  const filteredSales = sales.filter(sale => {
    const matchSearch = sale.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.projectId.toLowerCase().includes(searchTerm.toLowerCase());

    // ROLE RESTRICTION: Agents can only see their own sales
    let matchAgent = true;
    if (user?.role === 'agent') {
      matchAgent = sale.agentId === user.id;
    } else {
      matchAgent = filterAgentId ? sale.agentId === filterAgentId : true;
    }

    const matchClient = filterClientId ? sale.clientId === filterClientId : true;
    const matchDeveloper = filterDeveloperId ? sale.developerId === filterDeveloperId : true;
    const matchStatus = filterStatus ? sale.status === filterStatus : true;
    const matchDateStart = filterDateStart ? sale.date >= filterDateStart : true;
    const matchDateEnd = filterDateEnd ? sale.date <= filterDateEnd : true;

    return matchSearch && matchAgent && matchClient && matchDeveloper && matchStatus && matchDateStart && matchDateEnd;
  });

  const statusBadge = (status: SaleStatus) => {
    const styles = {
      approved: 'bg-emerald-100 text-emerald-700',
      pending: 'bg-amber-100 text-amber-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    const labels = {
      approved: 'Aprovada',
      pending: 'Pendente',
      cancelled: 'Cancelada'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // --- RENDER FORM ---
  if (view === 'form') {
    // Helper to calculate agent's share of expenses for display
    const totalDeductions = (formData.taxValue || 0) + (formData.miscExpensesValue || 0);
    const agentDeductionShare = totalDeductions * ((formData.agentSplitPercent || 0) / 100);
    const agencyDeductionShare = totalDeductions - agentDeductionShare;
    const baseCalculation = (formData.grossCommission || 0) - totalDeductions;
    const isReadOnly = user?.role === 'agent';

    return (
      <div className="max-w-5xl mx-auto animate-in slide-in-from-right-4 fade-in duration-300 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            {isReadOnly ? 'Detalhes da Venda' : (editingId ? 'Editar Venda' : 'Nova Venda')}
          </h2>
          <button
            onClick={() => setView('list')}
            className="text-slate-500 hover:text-slate-800"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-8">
          {/* Section 1: Basic Info */}
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Dados do Imóvel</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Incorporadora</label>
                <select
                  required
                  disabled={isReadOnly}
                  className={`w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none ${isReadOnly ? 'bg-slate-50' : ''}`}
                  value={formData.developerId}
                  onChange={e => setFormData({ ...formData, developerId: e.target.value })}
                >
                  <option value="">Selecione...</option>
                  {developers.map(d => <option key={d.id} value={d.id}>{d.companyName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Empreendimento (Projeto)</label>
                <select
                  required
                  disabled={isReadOnly}
                  className={`w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none ${isReadOnly ? 'bg-slate-50' : ''}`}
                  value={formData.projectId || ''}
                  onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                >
                  <option value="">Selecione...</option>
                  {projects
                    .filter(p => !formData.developerId || p.developerId === formData.developerId)
                    .map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Unidade/Torre</label>
                <input
                  type="text" required
                  disabled={isReadOnly}
                  className={`w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none ${isReadOnly ? 'bg-slate-50' : ''}`}
                  value={formData.unit || ''}
                  onChange={e => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="Ex: 104 - Bloco A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data da Venda</label>
                <input
                  type="date" required
                  disabled={isReadOnly}
                  className={`w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none ${isReadOnly ? 'bg-slate-50' : ''}`}
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 2: People */}
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Envolvidos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                <select
                  required
                  disabled={isReadOnly}
                  className={`w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none ${isReadOnly ? 'bg-slate-50' : ''}`}
                  value={formData.clientId}
                  onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                >
                  <option value="">Selecione...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Corretor Responsável</label>
                <select
                  required
                  disabled={user?.role === 'agent'}
                  className={`w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none ${user?.role === 'agent' ? 'bg-slate-50' : ''}`}
                  value={formData.agentId}
                  onChange={e => setFormData({ ...formData, agentId: e.target.value })}
                >
                  <option value="">Selecione...</option>
                  {(editingId ? agents : activeAgents).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Origem do Lead</label>
                <select
                  disabled={isReadOnly}
                  className={`w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none ${isReadOnly ? 'bg-slate-50' : ''}`}
                  value={formData.leadSource}
                  onChange={e => setFormData({ ...formData, leadSource: e.target.value })}
                >
                  <option value="">Selecione...</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Google">Google Ads</option>
                  <option value="Placa">Placa/Fachada</option>
                  <option value="Indicação">Indicação</option>
                  <option value="Portal">Portal Imobiliário</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Values */}
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Comissionamento (Split)</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor do Imóvel (R$)</label>
                <input
                  type="number" step="0.01" required
                  disabled={isReadOnly}
                  className={`w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-lg ${isReadOnly ? 'bg-slate-50' : ''}`}
                  value={formData.unitValue || ''}
                  onChange={e => setFormData({ ...formData, unitValue: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">% Comissão Total</label>
                <input
                  type="number" step="0.01"
                  readOnly
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-100 text-slate-600 outline-none"
                  value={formData.commissionPercent || ''}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Comissão Bruta (Total)</label>
                <input
                  type="number" step="0.01" required
                  disabled={isReadOnly}
                  className={`w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 ${isReadOnly ? 'bg-slate-50' : ''}`}
                  value={formData.grossCommission || ''}
                  onChange={e => setFormData({ ...formData, grossCommission: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            {/* Deductions: Tax & Misc */}
            {user?.role === 'admin' ? (
              // ADMIN SEES ALL DEDUCTION CONTROLS
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 mb-6">
                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Scissors size={16} /> Deduções (Antes do Split)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tax */}
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">% Nota Fiscal (Imposto)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number" step="0.1"
                        className="w-24 p-2 rounded-lg border border-slate-300 outline-none text-red-600"
                        value={formData.taxPercent || ''}
                        onChange={e => setFormData({ ...formData, taxPercent: e.target.value ? parseFloat(e.target.value) : undefined })}
                        placeholder="0"
                      />
                      <span className="text-sm text-red-500 font-medium whitespace-nowrap">
                        = - {formatCurrency(formData.taxValue || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Misc Expenses */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-600 mb-1">Descontos Diversos (Descrição)</label>
                      <input
                        type="text"
                        className="w-full p-2 rounded-lg border border-slate-300 outline-none text-sm"
                        placeholder="Ex: Taxa WayBropay"
                        value={formData.miscExpensesDescription || ''}
                        onChange={e => setFormData({ ...formData, miscExpensesDescription: e.target.value })}
                      />
                    </div>
                    <div className="w-32">
                      <label className="block text-sm font-medium text-slate-600 mb-1">Valor (R$)</label>
                      <input
                        type="number" step="0.01"
                        className="w-full p-2 rounded-lg border border-slate-300 outline-none text-red-600"
                        value={formData.miscExpensesValue || ''}
                        onChange={e => setFormData({ ...formData, miscExpensesValue: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // AGENT SEES READONLY DEDUCTIONS
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 mb-6">
                <h4 className="text-sm font-bold text-slate-700 mb-2">Deduções da Venda</h4>
                <p className="text-sm text-slate-600">Total Descontos (Impostos + Taxas): <span className="text-red-600 font-bold">{formatCurrency(totalDeductions)}</span></p>
              </div>
            )}

            {/* Split Slider - READONLY FOR AGENT */}
            <div className="mb-6 px-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Divisão (Split)</label>
              <input
                type="range" min="0" max="100" step="1"
                disabled={isReadOnly}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer mb-2 ${isReadOnly ? 'bg-slate-200' : 'bg-slate-200'}`}
                value={formData.agentSplitPercent || 0}
                onChange={e => setFormData({ ...formData, agentSplitPercent: parseFloat(e.target.value) })}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600">Corretor: {formData.agentSplitPercent}%</span>
                <span className="text-xs font-bold text-indigo-600">Imobiliária: {100 - (formData.agentSplitPercent || 0)}%</span>
              </div>
            </div>

            {/* DETAILED BREAKDOWN CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {/* 1. Summary Calculation */}
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-4 text-slate-600 font-semibold border-b border-slate-200 pb-2">
                  <Calculator size={18} /> Base de Cálculo
                </div>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>(+) Comissão Bruta</span>
                    <span className="font-bold">{formatCurrency(formData.grossCommission || 0)}</span>
                  </div>
                  <div className="flex justify-between text-red-500">
                    <span>(-) Impostos ({formData.taxPercent}%)</span>
                    <span>{formatCurrency(formData.taxValue || 0)}</span>
                  </div>
                  {formData.miscExpensesValue ? (
                    <div className="flex justify-between text-red-500">
                      <span>(-) Despesas Diversas</span>
                      <span>{formatCurrency(formData.miscExpensesValue)}</span>
                    </div>
                  ) : null}
                  <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between font-bold text-slate-800 text-base">
                    <span>(=) Líquido a Dividir</span>
                    <span>{formatCurrency(baseCalculation)}</span>
                  </div>
                </div>
              </div>

              {/* 2. Agency Share */}
              <div className="p-5 bg-indigo-50 rounded-xl border border-indigo-100 opacity-70">
                <div className="flex items-center gap-2 mb-4 text-indigo-700 font-bold border-b border-indigo-200 pb-2">
                  <Building2 size={18} /> Parte da Imobiliária
                </div>
                <div className="flex justify-between items-baseline mb-4">
                  <h3 className="text-3xl font-bold text-indigo-700">{formatCurrency(formData.agencyCommission || 0)}</h3>
                </div>
                <div className="text-xs text-indigo-800 space-y-1 bg-white/50 p-3 rounded-lg">
                  <p className="flex justify-between"><span>% Participação:</span> <span>{100 - (formData.agentSplitPercent || 0)}%</span></p>
                </div>
              </div>

              {/* 3. Agent Share */}
              <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-100 ring-2 ring-emerald-100">
                <div className="flex items-center gap-2 mb-4 text-emerald-700 font-bold border-b border-emerald-200 pb-2">
                  <User size={18} /> Parte do Corretor
                </div>
                <div className="flex justify-between items-baseline mb-4">
                  <h3 className="text-3xl font-bold text-emerald-700">{formatCurrency(formData.agentCommission || 0)}</h3>
                </div>
                <div className="text-xs text-emerald-800 space-y-1 bg-white/50 p-3 rounded-lg">
                  <p className="flex justify-between"><span>% Participação:</span> <span>{formData.agentSplitPercent}%</span></p>
                  <p className="flex justify-between border-t border-emerald-100 pt-1 mt-1">
                    <span>Sua parte nos descontos:</span>
                    <span className="font-bold">{formatCurrency(agentDeductionShare)}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4: Status */}
            <div className="mt-6 border-t border-slate-100 pt-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">Status da Venda</label>
              {user?.role === 'admin' ? (
                <select
                  className="w-full md:w-1/3 p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <option value="pending">Pendente</option>
                  <option value="approved">Aprovada</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              ) : (
                <div className="p-3 bg-slate-100 rounded-lg inline-block font-bold text-slate-700">
                  {statusBadge(formData.status || 'pending')}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-6">
            {!isReadOnly && (
              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all"
              >
                <Save size={20} />
                {editingId ? 'Atualizar Venda' : 'Salvar Venda'}
              </button>
            )}
            {isReadOnly && (
              <button
                type="button"
                onClick={() => setView('list')}
                className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all"
              >
                Voltar
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  // --- RECEIPT MODAL (Unchanged) ---
  const renderReceiptModal = () => {
    // ... (Keep existing receipt modal code exactly as is)
    if (!receiptSale) return null;

    const agent = agents.find(a => a.id === receiptSale.agentId);
    const client = clients.find(c => c.id === receiptSale.clientId);
    const developer = developers.find(d => d.id === receiptSale.developerId);

    const splitRatio = receiptSale.agentSplitPercent / 100;
    const grossAgentShare = receiptSale.grossCommission * splitRatio;
    const proportionalTax = receiptSale.taxValue * splitRatio;
    const proportionalMisc = receiptSale.miscExpensesValue * splitRatio;
    const totalDiscounts = proportionalTax + proportionalMisc;
    const netReceived = grossAgentShare - totalDiscounts;
    const today = new Date().toISOString().split('T')[0];

    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="relative bg-slate-900 w-full max-w-5xl shadow-2xl overflow-hidden rounded-md flex flex-col max-h-[90vh]">
          <div className="bg-slate-800 p-4 flex justify-between items-center shrink-0 border-b border-slate-700">
            <h2 className="text-white font-medium flex items-center gap-2 text-sm tracking-wide">
              <FileText size={16} /> VISUALIZAÇÃO DO RECIBO
            </h2>
            <div className="flex gap-2">
              <button onClick={handleExportPDF} disabled={isExporting} className={`bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded text-sm flex items-center gap-2 font-medium transition-colors ${isExporting ? 'opacity-70 cursor-wait' : ''}`}>
                <FileDown size={16} /> {isExporting ? 'Processando...' : 'Baixar PDF'}
              </button>
              <button onClick={() => setReceiptSale(null)} className="text-slate-400 hover:text-white px-2 py-2 transition-colors"><X size={20} /></button>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-slate-100 p-4 md:p-8 flex justify-center">
            <div ref={receiptRef} className="bg-white p-12 md:p-16 flex flex-col font-sans text-slate-800 relative shadow-xl" style={{ width: '800px', minWidth: '800px', minHeight: '900px' }}>
              <div className="flex justify-between items-start mb-16 border-b border-slate-100 pb-8">
                <div><h1 className="text-3xl font-serif text-slate-900 tracking-wide mb-1 font-bold">CASA MARIA</h1><p className="text-xs uppercase tracking-[0.3em] text-amber-600 font-semibold">Imóveis Exclusivos</p></div>
                <div className="text-right"><h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-1">Recibo de Pagamento</h2><p className="text-slate-900 font-mono text-sm">#{receiptSale.id.substring(0, 8).toUpperCase()}</p><p className="text-slate-500 text-sm mt-1">{formatDate(today)}</p></div>
              </div>
              <div className="mb-16 text-center"><p className="text-xs uppercase tracking-widest text-slate-400 mb-4 font-medium">Valor Líquido Recebido</p><h1 className="text-6xl font-light text-slate-900 tracking-tight">{formatCurrency(netReceived)}</h1><div className="w-16 h-1 bg-amber-500 mx-auto mt-6 rounded-full"></div></div>
              <div className="grid grid-cols-2 gap-12 mb-16">
                <div className="space-y-6">
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 border-b border-slate-100 pb-2">Detalhes da Transação</h3>
                  <div><p className="text-xs text-slate-500 mb-1">Unidade / Empreendimento</p><p className="text-lg text-slate-900 font-medium">{receiptSale.unit} - {projects.find(p => p.id === receiptSale.projectId)?.name || receiptSale.projectId}</p></div>
                  <div><p className="text-xs text-slate-500 mb-1">Incorporadora / Cliente</p><p className="text-base text-slate-800">{developer?.companyName}</p><p className="text-sm text-slate-500">{client?.name}</p></div>
                  <div><p className="text-xs text-slate-500 mb-1">Valor Venda</p><p className="text-base text-slate-800 font-mono">{formatCurrency(receiptSale.unitValue)}</p></div>
                </div>
                <div className="space-y-6">
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 border-b border-slate-100 pb-2">Beneficiário (Corretor)</h3>
                  <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-serif font-bold text-slate-700">{agent?.name.charAt(0)}</div><div><p className="text-lg text-slate-900 font-medium">{agent?.name}</p><p className="text-sm text-slate-500">CPF: {agent?.cpf}</p></div></div>
                  <div className="bg-slate-50 p-6 rounded-lg space-y-3">
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Comissão Bruta (Proporcional)</span><span className="text-slate-900 font-medium">{formatCurrency(grossAgentShare)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">Dedução Impostos</span><span className="text-red-500 font-medium text-xs">({formatCurrency(proportionalTax)})</span></div>
                    {proportionalMisc > 0 && (<div className="flex justify-between text-sm"><span className="text-slate-500">Outros Descontos</span><span className="text-red-500 font-medium text-xs">({formatCurrency(proportionalMisc)})</span></div>)}
                    <div className="border-t border-slate-200 pt-3 mt-1 flex justify-between items-center"><span className="text-slate-800 font-bold text-sm">Total Líquido</span><span className="text-slate-900 font-bold text-lg">{formatCurrency(netReceived)}</span></div>
                  </div>
                </div>
              </div>
              <div className="mt-auto pt-12 border-t border-slate-100">
                <p className="text-slate-500 text-sm leading-relaxed mb-12 italic">"Declaro que recebi a importância líquida acima descrita, referente aos serviços de intermediação imobiliária prestados para a venda da unidade mencionada. Dou plena e geral quitação, nada mais tendo a reclamar a qualquer título."</p>
                <div className="flex justify-between items-end">
                  <div className="text-center"><div className="w-64 border-b border-slate-300 mb-2"></div><p className="text-xs uppercase font-bold text-slate-900">{agent?.name}</p><p className="text-[10px] text-slate-400">Assinatura do Corretor</p></div>
                  <div className="text-center"><div className="w-64 border-b border-slate-300 mb-2"></div><p className="text-xs uppercase font-bold text-slate-900">Casa Maria Imóveis</p><p className="text-[10px] text-slate-400">Departamento Financeiro</p></div>
                </div>
              </div>
              <div className="absolute bottom-8 right-8 opacity-5 pointer-events-none"><Building2 size={120} /></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- RENDER LIST ---
  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {user?.role === 'agent' ? 'Minhas Vendas' : 'Gestão de Vendas'}
            </h1>
            <p className="text-slate-500">
              {user?.role === 'agent' ? 'Histórico de transações e comissões.' : 'Controle de transações e comissionamento.'}
            </p>
          </div>
          {/* AGENT CANNOT SEE ADD BUTTON */}
          {user?.role !== 'agent' && (
            <button
              onClick={handleNewSale}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors"
            >
              <Plus size={20} />
              Nova Venda
            </button>
          )}
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          {/* ... Keep Filters code same ... */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Buscar por empreendimento..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}> <Filter size={18} /> <span>Filtros</span></button>
            {(filterDateStart || filterDateEnd || (user?.role === 'admin' && filterAgentId) || filterClientId || filterDeveloperId || filterStatus) && (<button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-700 underline">Limpar</button>)}
          </div>
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2 fade-in duration-300">
              <div className="lg:col-span-1"><label className="block text-xs font-semibold text-slate-500 mb-1">Início</label><input type="date" className="w-full p-2 rounded border border-slate-200 text-sm" value={filterDateStart} onChange={(e) => setFilterDateStart(e.target.value)} /></div>
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-14rem)]">
          <div className="overflow-auto flex-1">
            <table className="w-full text-left text-sm min-w-[1000px]">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-600">Data</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">Unidade/Projeto</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">Corretor</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">Venda</th>
                  {user?.role === 'admin' && <th className="px-6 py-4 font-semibold text-slate-600">Bruto</th>}
                  {user?.role === 'admin' && <th className="px-6 py-4 font-semibold text-slate-600 text-center">Split</th>}
                  <th className="px-6 py-4 font-semibold text-slate-600">{user?.role === 'agent' ? 'Minha Comissão' : 'Liquido Imob.'}</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSales.map(sale => {
                  const agent = agents.find(a => a.id === sale.agentId);
                  return (
                    <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{formatDate(sale.date)}</td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800">{sale.unit}</p>
                        <p className="text-xs text-slate-500">
                          {projects.find(p => p.id === sale.projectId)?.name || sale.projectId}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 text-xs flex items-center justify-center font-bold text-slate-600">
                            {agent?.name.charAt(0)}
                          </div>
                          <span className="text-slate-700">{agent?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">{formatCurrency(sale.unitValue)}</td>

                      {user?.role === 'admin' && <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{formatCurrency(sale.grossCommission)}</td>}
                      {user?.role === 'admin' && (
                        <td className="px-6 py-4 text-center">
                          <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-600">
                            {sale.agentSplitPercent}% / {100 - sale.agentSplitPercent}%
                          </span>
                        </td>
                      )}

                      <td className="px-6 py-4 font-semibold text-indigo-600 whitespace-nowrap">
                        {user?.role === 'agent' ? formatCurrency(sale.agentCommission) : formatCurrency(sale.agencyCommission)}
                      </td>
                      <td className="px-6 py-4">{statusBadge(sale.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setReceiptSale(sale)} className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Gerar Recibo"><FileText size={16} /></button>

                          {/* RESTRICTED ACTIONS */}
                          {user?.role === 'admin' ? (
                            <>
                              <button onClick={() => handleEdit(sale)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar"><Pencil size={16} /></button>
                              <button onClick={() => handleDelete(sale.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Excluir"><Trash2 size={16} /></button>
                            </>
                          ) : (
                            <button onClick={() => handleEdit(sale)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Visualizar Detalhes"><Eye size={16} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredSales.length === 0 && (
                  <tr><td colSpan={9} className="text-center py-10 text-slate-400">Nenhuma venda encontrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {filteredSales.map(sale => {
            const agent = agents.find(a => a.id === sale.agentId);
            return (
              <div key={sale.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                {/* Mobile card content */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{sale.unit}</h3>
                    <p className="text-sm text-slate-500">
                      {projects.find(p => p.id === sale.projectId)?.name || sale.projectId}
                    </p>
                  </div>
                  {statusBadge(sale.status)}
                </div>
                <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-xs">
                    {agent?.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{agent?.name}</p>
                    <p className="text-xs text-slate-400">{formatDate(sale.date)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-slate-400 text-xs">Valor Venda</p>
                    <p className="font-semibold text-slate-800">{formatCurrency(sale.unitValue)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">{user?.role === 'agent' ? 'Minha Comissão' : 'Comissão Liq.'}</p>
                    <p className="font-semibold text-emerald-600">
                      {user?.role === 'agent' ? formatCurrency(sale.agentCommission) : formatCurrency(sale.agencyCommission)}
                    </p>
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400">
                    {user?.role === 'agent' ? `Comissão: ${sale.agentSplitPercent}%` : `Split: ${sale.agentSplitPercent}/${100 - sale.agentSplitPercent}`}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => setReceiptSale(sale)} className="p-2 text-slate-400 hover:text-emerald-600 bg-slate-50 rounded-lg"><FileText size={18} /></button>
                    {user?.role === 'admin' ? (
                      <>
                        <button onClick={() => handleEdit(sale)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg"><Pencil size={18} /></button>
                        <button onClick={() => handleDelete(sale.id)} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 rounded-lg"><Trash2 size={18} /></button>
                      </>
                    ) : (
                      <button onClick={() => handleEdit(sale)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg"><Eye size={18} /></button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {renderReceiptModal()}
    </>
  );
};
