
import React, { useState } from 'react';
import { useApp } from '../context/AppProvider';
import { generateId } from '../utils';
import { TransactionType, Category } from '../types';
import { Trash2, Plus, List, ArrowDownCircle, ArrowUpCircle, Pencil, X, Save, ShieldCheck, Sparkles, CornerDownRight } from 'lucide-react';
import { FlattenedCategory, buildCategoryTree } from '../utils/categoryUtils';

export const Categories = () => {
    const { categories, addCategory, deleteCategory, updateCategory } = useApp();

    // Add State
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryType, setNewCategoryType] = useState<TransactionType>('expense');
    const [newCategoryParent, setNewCategoryParent] = useState<string>('');

    // Edit State
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editName, setEditName] = useState('');
    const [editType, setEditType] = useState<TransactionType>('expense');
    const [editParent, setEditParent] = useState<string>('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        addCategory({ id: generateId(), name: newCategoryName, type: newCategoryType, parentId: newCategoryParent || null });
        setNewCategoryName('');
        setNewCategoryParent('');
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setEditName(category.name);
        setEditType(category.type);
        setEditParent(category.parentId || '');
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory && editName.trim()) {
            updateCategory(editingCategory.id, { name: editName, type: editType, parentId: editParent || null });
            setEditingCategory(null);
        }
    };

    const incomeCategories = buildCategoryTree(categories.filter(c => c.type === 'income'));
    const expenseCategories = buildCategoryTree(categories.filter(c => c.type === 'expense'));

    return (
        <div className="space-y-10 max-w-6xl mx-auto pb-20 animate-in fade-in duration-700">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-gradient-to-tr dark:from-slate-700 dark:to-slate-900 border border-slate-200 dark:border-transparent flex items-center justify-center shadow-lg shadow-black/5 dark:shadow-black/50 transform -rotate-2">
                        <List size={28} className="text-slate-800 dark:text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Plano de <span className="text-cyan-600 dark:text-cyan-400">Contas</span></h1>
                        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-1">Estruturação estratégica de categorias financeiras.</p>
                    </div>
                </div>
            </div>

            {/* ADD FORM - DARK MODERN CARD */}
            <div className="bg-white dark:bg-[#09090b] p-8 md:p-10 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-cyan-500/10 transition-all"></div>

                <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-500 font-black text-[10px] uppercase tracking-[0.3em] mb-10 px-1">
                    <Sparkles size={14} /> Arquitetura de Fluxo
                </div>

                <form onSubmit={handleAdd} className="flex flex-col lg:flex-row gap-8 items-end relative z-10">
                    <div className="flex-1 w-full group">
                        <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 ml-1">Nome da Categoria</label>
                        <div className="relative">
                            <input
                                type="text"
                                className="category-input w-full"
                                placeholder="Ex: Marketing Digital, Vendas etc..."
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="w-full lg:w-72 group">
                        <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 ml-1">Tipo de Fluxo</label>
                        <select
                            className="category-input w-full appearance-none cursor-pointer"
                            value={newCategoryType}
                            onChange={(e) => {
                                setNewCategoryType(e.target.value as TransactionType);
                                setNewCategoryParent(''); // reset parent if type changes
                            }}
                        >
                            <option value="income">Receita (Entrada)</option>
                            <option value="expense">Despesa (Saída)</option>
                        </select>
                    </div>
                    <div className="w-full lg:w-72 group">
                        <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 ml-1">Categoria Superior</label>
                        <select
                            className="category-input w-full appearance-none cursor-pointer"
                            value={newCategoryParent}
                            onChange={(e) => setNewCategoryParent(e.target.value)}
                        >
                            <option value="">Nenhuma (Nível Principal)</option>
                            {(newCategoryType === 'income' ? incomeCategories : expenseCategories).map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.displayName}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="premium-button !h-16 !px-10 shadow-[0_0_30px_rgba(34,211,238,0.1)] hover:shadow-[0_0_40px_rgba(34,211,238,0.2)]"
                    >
                        Adicionar Categoria
                    </button>
                </form>
            </div>

            {/* LISTS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                {/* INCOME COLUMN */}
                <div className="bg-white dark:bg-[#09090b] rounded-[3rem] border border-slate-300 dark:border-white/5 overflow-hidden flex flex-col shadow-2xl transition-all hover:border-emerald-500/10">
                    <div className="p-8 md:p-10 border-b border-slate-300 dark:border-white/5 bg-slate-50 dark:bg-[#0f0f12] flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner">
                                <ArrowUpCircle size={28} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-800 dark:text-white italic text-xl uppercase tracking-tighter">Receitas</h3>
                                <p className="text-[8px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-[0.2em] mt-0.5">Entradas Gerenciais</p>
                            </div>
                        </div>
                        <div className="px-3 py-1 bg-emerald-500/10 rounded-full text-[10px] font-black text-emerald-500 border border-emerald-500/20">
                            {incomeCategories.length} Itens
                        </div>
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-white/[0.03] flex-1 max-h-[500px] overflow-y-auto custom-scrollbar">
                        {incomeCategories.map(cat => (
                            <div key={cat.id} className={`py-3 pr-5 flex justify-between items-center hover:bg-slate-100 dark:hover:bg-white/[0.01] transition-all group ${cat.level > 0 ? 'bg-slate-50/50 dark:bg-[#0f0f12]/50 border-l-2 border-emerald-500/20' : ''}`} style={{ paddingLeft: cat.level > 0 ? `${cat.level * 1.5 + 1.25}rem` : '1.25rem' }}>
                                <div className="flex items-center gap-4">
                                    {cat.level > 0 ? <CornerDownRight size={14} className="text-emerald-500/50 flex-shrink-0" /> : <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)] flex-shrink-0"></div>}
                                    <span className={`font-bold transition-colors uppercase tracking-widest text-[11px] group-hover:text-slate-900 dark:group-hover:text-white ${cat.level > 0 ? 'text-slate-500 dark:text-slate-400' : 'text-slate-600 dark:text-slate-300'}`}>{cat.name}</span>
                                </div>
                                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                    <button onClick={() => openEditModal(cat)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-cyan-400 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/5 transition-all"><Pencil size={14} /></button>
                                    <button onClick={() => { if (window.confirm('Remover esta categoria?')) deleteCategory(cat.id); }} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/5 transition-all"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))}
                        {incomeCategories.length === 0 && (
                            <div className="py-24 text-center space-y-4">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-slate-400 dark:text-slate-800">
                                    <ArrowUpCircle size={32} />
                                </div>
                                <p className="text-slate-700 font-bold uppercase tracking-widest text-[9px]">Nenhuma receita listada</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* EXPENSE COLUMN */}
                <div className="bg-white dark:bg-[#09090b] rounded-[3rem] border border-slate-300 dark:border-white/5 overflow-hidden flex flex-col shadow-2xl transition-all hover:border-red-500/10">
                    <div className="p-8 md:p-10 border-b border-slate-300 dark:border-white/5 bg-slate-50 dark:bg-[#0f0f12] flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 shadow-inner">
                                <ArrowDownCircle size={28} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-800 dark:text-white italic text-xl uppercase tracking-tighter">Despesas</h3>
                                <p className="text-[8px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-[0.2em] mt-0.5">Saídas e Custos</p>
                            </div>
                        </div>
                        <div className="px-3 py-1 bg-red-500/10 rounded-full text-[10px] font-black text-red-500 border border-red-500/20">
                            {expenseCategories.length} Itens
                        </div>
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-white/[0.03] flex-1 max-h-[500px] overflow-y-auto custom-scrollbar">
                        {expenseCategories.map(cat => (
                            <div key={cat.id} className={`py-3 pr-5 flex justify-between items-center hover:bg-slate-100 dark:hover:bg-white/[0.01] transition-all group ${cat.level > 0 ? 'bg-slate-50/50 dark:bg-[#0f0f12]/50 border-l-2 border-red-500/20' : ''}`} style={{ paddingLeft: cat.level > 0 ? `${cat.level * 1.5 + 1.25}rem` : '1.25rem' }}>
                                <div className="flex items-center gap-4">
                                    {cat.level > 0 ? <CornerDownRight size={14} className="text-red-500/50 flex-shrink-0" /> : <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)] flex-shrink-0"></div>}
                                    <span className={`font-bold transition-colors uppercase tracking-widest text-[11px] group-hover:text-slate-900 dark:group-hover:text-white ${cat.level > 0 ? 'text-slate-500 dark:text-slate-400' : 'text-slate-600 dark:text-slate-300'}`}>{cat.name}</span>
                                </div>
                                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                    <button onClick={() => openEditModal(cat)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-cyan-400 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/5 transition-all"><Pencil size={14} /></button>
                                    <button onClick={() => { if (window.confirm('Remover esta categoria?')) deleteCategory(cat.id); }} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/5 transition-all"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))}
                        {expenseCategories.length === 0 && (
                            <div className="py-24 text-center space-y-4">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-slate-400 dark:text-slate-800">
                                    <ArrowDownCircle size={32} />
                                </div>
                                <p className="text-slate-700 font-bold uppercase tracking-widest text-[9px]">Nenhuma despesa listada</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* EDIT MODAL - PREMIUM UI */}
            {editingCategory && (
                <div className="fixed inset-0 bg-black/98 backdrop-blur-2xl z-[90] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/10 rounded-[3.5rem] w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300 shadow-3xl">
                        <div className="px-10 py-10 bg-slate-50 dark:bg-[#0f0f12] border-b border-slate-200 dark:border-white/5 flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
                            <div className="flex items-center gap-5 relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-center text-cyan-600 dark:text-cyan-400"><Pencil size={24} /></div>
                                <div>
                                    <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-1">Gerenciamento</p>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">Ajustar Categoria</h2>
                                </div>
                            </div>
                            <button onClick={() => setEditingCategory(null)} className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all border border-slate-200 dark:border-white/5"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-12 space-y-10">
                            <div className="group">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-3 px-1">Nome da Categoria</label>
                                <input
                                    type="text" className="category-input w-full"
                                    value={editName} onChange={(e) => setEditName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="group">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-3 px-1">Tipo de Fluxo</label>
                                <select
                                    className="category-input w-full appearance-none"
                                    value={editType} onChange={(e) => {
                                        setEditType(e.target.value as TransactionType);
                                        setEditParent('');
                                    }}
                                >
                                    <option value="income">Receita (Entrada)</option>
                                    <option value="expense">Despesa (Saída)</option>
                                </select>
                            </div>
                            <div className="group">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-3 px-1">Categoria Superior</label>
                                <select
                                    className="category-input w-full appearance-none cursor-pointer"
                                    value={editParent}
                                    onChange={(e) => setEditParent(e.target.value)}
                                >
                                    <option value="">Nenhuma (Nível Principal)</option>
                                    {(editType === 'income' ? incomeCategories : expenseCategories)
                                        .filter(cat => cat.id !== editingCategory.id) // previne auto-relacionamento
                                        .map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.displayName}</option>
                                        ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-6 pt-6">
                                <button type="button" onClick={() => setEditingCategory(null)} className="px-8 py-4 text-[10px] font-black text-slate-500 hover:text-slate-800 dark:hover:text-white uppercase tracking-[0.2em] transition-all">Cancelar</button>
                                <button type="submit" className="premium-button !px-10">Aplicar Alterações</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
