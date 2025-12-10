
import React, { useState } from 'react';
import { useApp } from '../context/AppProvider';
import { generateId } from '../utils';
import { TransactionType, Category } from '../types';
import { Trash2, Plus, List, ArrowDownCircle, ArrowUpCircle, Pencil, X, Save } from 'lucide-react';

export const Categories = () => {
  const { categories, addCategory, deleteCategory, updateCategory } = useApp();
  
  // Add State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<TransactionType>('expense');

  // Edit State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<TransactionType>('expense');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    addCategory({
      id: generateId(),
      name: newCategoryName,
      type: newCategoryType
    });
    setNewCategoryName('');
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditType(category.type);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory && editName.trim()) {
        updateCategory(editingCategory.id, {
            name: editName,
            type: editType
        });
        setEditingCategory(null);
    }
  };

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
           <List className="text-blue-600" />
           Plano de Contas
        </h1>
        <p className="text-slate-500">Gerencie as categorias de receitas e despesas do sistema.</p>
      </div>

      {/* ADD FORM */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
         <h2 className="text-lg font-bold text-slate-700 mb-4">Adicionar Nova Categoria</h2>
         <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
               <label className="block text-sm font-medium text-slate-600 mb-1">Nome da Categoria</label>
               <input 
                 type="text" 
                 className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                 placeholder="Ex: Marketing Digital, Venda de Terrenos..."
                 value={newCategoryName}
                 onChange={(e) => setNewCategoryName(e.target.value)}
               />
            </div>
            <div className="w-full md:w-48">
               <label className="block text-sm font-medium text-slate-600 mb-1">Tipo</label>
               <select 
                 className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                 value={newCategoryType}
                 onChange={(e) => setNewCategoryType(e.target.value as TransactionType)}
               >
                 <option value="income">Receita (Entrada)</option>
                 <option value="expense">Despesa (Saída)</option>
               </select>
            </div>
            <button 
              type="submit"
              className="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Plus size={20} /> Adicionar
            </button>
         </form>
      </div>

      {/* LISTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* INCOME COLUMN */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-emerald-50 flex items-center gap-2">
                <ArrowUpCircle className="text-emerald-600" size={20} />
                <h3 className="font-bold text-emerald-800">Categorias de Receitas</h3>
            </div>
            <div className="divide-y divide-slate-100">
                {incomeCategories.map(cat => (
                  <div key={cat.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors group">
                      <span className="font-medium text-slate-700">{cat.name}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                              onClick={() => openEditModal(cat)}
                              className="text-slate-400 hover:text-blue-500 p-2 rounded-full hover:bg-blue-50 transition-colors"
                              title="Editar"
                          >
                              <Pencil size={16} />
                          </button>
                          <button 
                              onClick={() => {
                              if(window.confirm('Excluir esta categoria?')) deleteCategory(cat.id);
                              }}
                              className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                              title="Excluir"
                          >
                              <Trash2 size={16} />
                          </button>
                      </div>
                  </div>
                ))}
                {incomeCategories.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-sm">Nenhuma categoria cadastrada.</div>
                )}
            </div>
        </div>

        {/* EXPENSE COLUMN */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-red-50 flex items-center gap-2">
                <ArrowDownCircle className="text-red-600" size={20} />
                <h3 className="font-bold text-red-800">Categorias de Despesas</h3>
            </div>
            <div className="divide-y divide-slate-100">
                {expenseCategories.map(cat => (
                  <div key={cat.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors group">
                      <span className="font-medium text-slate-700">{cat.name}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                              onClick={() => openEditModal(cat)}
                              className="text-slate-400 hover:text-blue-500 p-2 rounded-full hover:bg-blue-50 transition-colors"
                              title="Editar"
                          >
                              <Pencil size={16} />
                          </button>
                          <button 
                              onClick={() => {
                              if(window.confirm('Excluir esta categoria?')) deleteCategory(cat.id);
                              }}
                              className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                              title="Excluir"
                          >
                              <Trash2 size={16} />
                          </button>
                      </div>
                  </div>
                ))}
                {expenseCategories.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-sm">Nenhuma categoria cadastrada.</div>
                )}
            </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Editar Categoria</h2>
                    <button onClick={() => setEditingCategory(null)} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Nome</label>
                        <input 
                            type="text" 
                            className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Tipo</label>
                        <select 
                            className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={editType}
                            onChange={(e) => setEditType(e.target.value as TransactionType)}
                        >
                            <option value="income">Receita (Entrada)</option>
                            <option value="expense">Despesa (Saída)</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button 
                            type="button" 
                            onClick={() => setEditingCategory(null)}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2"
                        >
                            <Save size={18} /> Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};
