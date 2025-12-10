
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppProvider';
import { Agent } from '../types';
import { formatCurrency, generateId, formatDate } from '../utils';
import { Plus, User, Phone, Mail, FileText, ChevronRight, X, Pencil, Trash2, Save, MapPin, Search } from 'lucide-react';

export const Agents = () => {
  const { agents, addAgent, updateAgent, deleteAgent, sales } = useApp();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Filter State
  const [searchTerm, setSearchTerm] = useState('');

  // New Agent Form State (Quick Add)
  const [newAgent, setNewAgent] = useState<Partial<Agent>>({
    name: '', cpf: '', email: '', phone: '', creci: '', status: 'active',
    address: '', city: '', state: '', zipCode: '', number: '', neighborhood: '',
    totalCommissionEarned: 0, totalCommissionPaid: 0
  });

  // Edit Form State (Full Edit)
  const [editFormData, setEditFormData] = useState<Partial<Agent>>({});

  useEffect(() => {
    if (selectedAgent) {
      setEditFormData(selectedAgent);
      setIsEditing(false); // Reset edit mode when switching agents
    }
  }, [selectedAgent]);

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    addAgent({ ...newAgent, id: generateId() } as Agent);
    setIsAdding(false);
    setNewAgent({ 
      name: '', status: 'active', totalCommissionEarned: 0, totalCommissionPaid: 0,
      email: '', phone: '', creci: '', cpf: '',
      address: '', city: '', state: '', zipCode: '', number: '', neighborhood: ''
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAgent && editFormData.id) {
      updateAgent(editFormData.id, editFormData);
      setSelectedAgent(editFormData as Agent); // Update local view
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (selectedAgent && window.confirm(`Tem certeza que deseja excluir o corretor ${selectedAgent.name}?`)) {
      deleteAgent(selectedAgent.id);
      setSelectedAgent(null);
    }
  };

  const getAgentSales = (agentId: string) => sales.filter(s => s.agentId === agentId);

  // Filter Logic: Filter by Name OR CPF OR Phone OR CRECI
  const filteredAgents = agents.filter(agent => {
    const term = searchTerm.toLowerCase();
    return (
        agent.name.toLowerCase().includes(term) ||
        agent.cpf.toLowerCase().includes(term) ||
        agent.phone.toLowerCase().includes(term) ||
        agent.creci.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      
      {/* Left Column: List */}
      <div className={`${selectedAgent ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden`}>
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="font-semibold text-slate-800">Corretores</h2>
          <button 
            onClick={() => setIsAdding(true)}
            className="p-2 hover:bg-slate-200 rounded-full text-blue-600 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="p-3 border-b border-slate-100 bg-white">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Nome, CPF, Tel ou CRECI" 
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
        
        {isAdding && (
          <form onSubmit={handleSaveNew} className="p-4 bg-blue-50 border-b border-blue-100 space-y-3 max-h-96 overflow-y-auto">
             <div className="space-y-3">
               <p className="text-xs font-bold text-slate-400 uppercase">Dados Pessoais</p>
               <input placeholder="Nome Completo" required className="w-full p-2 rounded border text-sm" value={newAgent.name} onChange={e => setNewAgent({...newAgent, name: e.target.value})} />
               <input placeholder="Email" required className="w-full p-2 rounded border text-sm" value={newAgent.email} onChange={e => setNewAgent({...newAgent, email: e.target.value})} />
               <div className="flex gap-2">
                  <input placeholder="Telefone" className="w-1/2 p-2 rounded border text-sm" value={newAgent.phone} onChange={e => setNewAgent({...newAgent, phone: e.target.value})} />
                  <input placeholder="CRECI" className="w-1/2 p-2 rounded border text-sm" value={newAgent.creci} onChange={e => setNewAgent({...newAgent, creci: e.target.value})} />
               </div>
               
               <p className="text-xs font-bold text-slate-400 uppercase pt-2">Endereço</p>
               <div className="flex gap-2">
                 <input placeholder="CEP" className="w-1/3 p-2 rounded border text-sm" value={newAgent.zipCode} onChange={e => setNewAgent({...newAgent, zipCode: e.target.value})} />
                 <input placeholder="Cidade" className="w-2/3 p-2 rounded border text-sm" value={newAgent.city} onChange={e => setNewAgent({...newAgent, city: e.target.value})} />
               </div>
               <input placeholder="Rua / Logradouro" className="w-full p-2 rounded border text-sm" value={newAgent.address} onChange={e => setNewAgent({...newAgent, address: e.target.value})} />
               <div className="flex gap-2">
                 <input placeholder="Número" className="w-1/3 p-2 rounded border text-sm" value={newAgent.number} onChange={e => setNewAgent({...newAgent, number: e.target.value})} />
                 <input placeholder="Bairro" className="w-2/3 p-2 rounded border text-sm" value={newAgent.neighborhood} onChange={e => setNewAgent({...newAgent, neighborhood: e.target.value})} />
               </div>
               
               <div className="flex gap-2 justify-end pt-2">
                 <button type="button" onClick={() => setIsAdding(false)} className="text-xs text-slate-500 hover:text-slate-800">Cancelar</button>
                 <button type="submit" className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Salvar</button>
               </div>
             </div>
          </form>
        )}

        <div className="flex-1 overflow-y-auto">
          {filteredAgents.map(agent => (
            <div 
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between
                ${selectedAgent?.id === agent.id ? 'bg-blue-50 border-blue-100' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                  {agent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium text-slate-800">{agent.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-emerald-500' : 'bg-red-400'}`}></span>
                    <span className="text-xs text-slate-500 capitalize">{agent.status === 'active' ? 'Ativo' : 'Inativo'}</span>
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </div>
          ))}
          {filteredAgents.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-sm">Nenhum corretor encontrado.</div>
          )}
        </div>
      </div>

      {/* Right Column: Details or Edit */}
      <div className={`${!selectedAgent ? 'hidden lg:flex' : 'flex'} flex-col flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden`}>
        {selectedAgent ? (
          <>
            {/* Header Details */}
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-start justify-between gap-4 bg-slate-50">
               <div className="flex-1">
                 <div className="flex items-center justify-between mb-2">
                   <div className="flex items-center gap-3">
                     <button className="lg:hidden" onClick={() => setSelectedAgent(null)}>
                       <X size={20} className="text-slate-500"/>
                     </button>
                     <h2 className="text-2xl font-bold text-slate-800">
                       {isEditing ? 'Editar Corretor' : selectedAgent.name}
                     </h2>
                     {!isEditing && (
                       <span className={`px-2 py-0.5 rounded text-xs font-semibold ${selectedAgent.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                         {selectedAgent.status === 'active' ? 'Ativo' : 'Inativo'}
                       </span>
                     )}
                   </div>
                   
                   {/* Actions */}
                   <div className="flex gap-2">
                     {!isEditing ? (
                       <>
                        <button 
                          onClick={() => setIsEditing(true)} 
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil size={20} />
                        </button>
                        <button 
                          onClick={handleDelete} 
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={20} />
                        </button>
                       </>
                     ) : (
                       <button 
                          onClick={() => setIsEditing(false)} 
                          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Cancelar Edição"
                        >
                          <X size={20} />
                        </button>
                     )}
                   </div>
                 </div>

                 {!isEditing && (
                   <div className="flex flex-col gap-1 text-sm text-slate-500">
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-1"><Mail size={14}/> {selectedAgent.email}</div>
                        <div className="flex items-center gap-1"><Phone size={14}/> {selectedAgent.phone}</div>
                        <div className="flex items-center gap-1"><FileText size={14}/> CRECI: {selectedAgent.creci}</div>
                      </div>
                      {(selectedAgent.city || selectedAgent.address) && (
                        <div className="flex items-center gap-1 mt-1 text-slate-400">
                          <MapPin size={14}/> 
                          {selectedAgent.address}, {selectedAgent.number} - {selectedAgent.neighborhood}, {selectedAgent.city}/{selectedAgent.state} - {selectedAgent.zipCode}
                        </div>
                      )}
                   </div>
                 )}
               </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6">
              
              {isEditing ? (
                // EDIT FORM
                <form onSubmit={handleUpdate} className="space-y-6 max-w-2xl">
                  {/* Status Section */}
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Status do Corretor</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="status" 
                          value="active" 
                          checked={editFormData.status === 'active'}
                          onChange={() => setEditFormData({...editFormData, status: 'active'})}
                          className="text-emerald-600 focus:ring-emerald-500" 
                        />
                        <span className="text-sm font-medium text-slate-700">Ativo</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="status" 
                          value="inactive" 
                          checked={editFormData.status === 'inactive'}
                          onChange={() => setEditFormData({...editFormData, status: 'inactive'})}
                          className="text-red-600 focus:ring-red-500" 
                        />
                        <span className="text-sm font-medium text-slate-700">Inativo</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                      <input 
                        className="w-full p-2.5 rounded border border-slate-300"
                        value={editFormData.name}
                        onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <input 
                        className="w-full p-2.5 rounded border border-slate-300"
                        value={editFormData.email}
                        onChange={e => setEditFormData({...editFormData, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                      <input 
                        className="w-full p-2.5 rounded border border-slate-300"
                        value={editFormData.phone}
                        onChange={e => setEditFormData({...editFormData, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                      <input 
                        className="w-full p-2.5 rounded border border-slate-300"
                        value={editFormData.cpf}
                        onChange={e => setEditFormData({...editFormData, cpf: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">CRECI</label>
                      <input 
                        className="w-full p-2.5 rounded border border-slate-300"
                        value={editFormData.creci}
                        onChange={e => setEditFormData({...editFormData, creci: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="pt-2 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-700 mb-3">Endereço</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">CEP</label>
                        <input className="w-full p-2 rounded border border-slate-300 text-sm" value={editFormData.zipCode || ''} onChange={e => setEditFormData({...editFormData, zipCode: e.target.value})} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Rua</label>
                        <input className="w-full p-2 rounded border border-slate-300 text-sm" value={editFormData.address || ''} onChange={e => setEditFormData({...editFormData, address: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Número</label>
                        <input className="w-full p-2 rounded border border-slate-300 text-sm" value={editFormData.number || ''} onChange={e => setEditFormData({...editFormData, number: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Bairro</label>
                        <input className="w-full p-2 rounded border border-slate-300 text-sm" value={editFormData.neighborhood || ''} onChange={e => setEditFormData({...editFormData, neighborhood: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Cidade/UF</label>
                        <div className="flex gap-1">
                          <input className="w-3/4 p-2 rounded border border-slate-300 text-sm" placeholder="Cidade" value={editFormData.city || ''} onChange={e => setEditFormData({...editFormData, city: e.target.value})} />
                          <input className="w-1/4 p-2 rounded border border-slate-300 text-sm" placeholder="UF" value={editFormData.state || ''} onChange={e => setEditFormData({...editFormData, state: e.target.value})} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Banking Section */}
                  <div className="pt-2 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-700 mb-3">Dados Financeiros</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Chave PIX</label>
                        <input 
                          className="w-full p-2.5 rounded border border-slate-300"
                          value={editFormData.pixKey}
                          onChange={e => setEditFormData({...editFormData, pixKey: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Dados Bancários</label>
                        <input 
                          className="w-full p-2.5 rounded border border-slate-300"
                          value={editFormData.bankDetails}
                          onChange={e => setEditFormData({...editFormData, bankDetails: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
                      <Save size={18} /> Salvar Alterações
                    </button>
                  </div>
                </form>
              ) : (
                // VIEW DETAILS
                <div className="space-y-6">
                  {/* Bank Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <p className="text-xs text-slate-400 mb-1">Chave PIX</p>
                      <p className="font-medium text-slate-700">{selectedAgent.pixKey || '-'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <p className="text-xs text-slate-400 mb-1">Dados Bancários</p>
                      <p className="font-medium text-slate-700">{selectedAgent.bankDetails || '-'}</p>
                    </div>
                  </div>

                  {/* Financial Stats */}
                  <div className="flex gap-4">
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex-1">
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1">Total Recebido</p>
                      <p className="text-lg font-bold text-emerald-600">
                        {formatCurrency(selectedAgent.totalCommissionPaid)}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex-1">
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1">A Receber</p>
                      <p className="text-lg font-bold text-amber-600">
                        {formatCurrency(selectedAgent.totalCommissionEarned - selectedAgent.totalCommissionPaid)}
                      </p>
                    </div>
                  </div>

                  {/* History Table */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Histórico de Vendas</h3>
                    <div className="border rounded-lg overflow-hidden bg-white">
                      
                      {/* Desktop Table View - With Sticky Header & Height */}
                      <div className="hidden md:block overflow-auto max-h-[400px]">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 text-slate-600 sticky top-0 z-10 shadow-sm">
                            <tr>
                              <th className="p-3">Data</th>
                              <th className="p-3">Unidade</th>
                              <th className="p-3">Valor Venda</th>
                              <th className="p-3">Comissão</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getAgentSales(selectedAgent.id).map(sale => (
                              <tr key={sale.id} className="border-t border-slate-100 hover:bg-slate-50">
                                <td className="p-3">{formatDate(sale.date)}</td>
                                <td className="p-3">{sale.unit}</td>
                                <td className="p-3 text-slate-500">{formatCurrency(sale.unitValue)}</td>
                                <td className="p-3 font-medium text-emerald-600">{formatCurrency(sale.agentCommission)}</td>
                              </tr>
                            ))}
                            {getAgentSales(selectedAgent.id).length === 0 && (
                              <tr><td colSpan={4} className="p-4 text-center text-slate-400">Nenhuma venda encontrada.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="md:hidden">
                          {getAgentSales(selectedAgent.id).map(sale => (
                              <div key={sale.id} className="p-4 border-b border-slate-100 last:border-0">
                                  <div className="flex justify-between items-center mb-1">
                                      <p className="font-bold text-slate-800">{sale.unit}</p>
                                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                          {formatCurrency(sale.agentCommission)}
                                      </span>
                                  </div>
                                  <div className="flex justify-between items-center text-xs text-slate-500">
                                      <span>{formatDate(sale.date)}</span>
                                      <span>Venda: {formatCurrency(sale.unitValue)}</span>
                                  </div>
                              </div>
                          ))}
                          {getAgentSales(selectedAgent.id).length === 0 && (
                             <div className="p-6 text-center text-slate-400 text-sm">Nenhuma venda encontrada.</div>
                          )}
                      </div>

                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <User size={48} className="mb-4 text-slate-200" />
            <p>Selecione um corretor para ver os detalhes</p>
          </div>
        )}
      </div>
    </div>
  );
};
