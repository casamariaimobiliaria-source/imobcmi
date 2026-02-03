
import React, { useState } from 'react';
import { useApp } from '../context/AppProvider';
import { Client } from '../types';
import { generateId } from '../utils';
import { Plus, Search, Pencil, Trash2, X, Briefcase, Mail, Phone, Fingerprint, MapPin, AlignLeft, Calendar } from 'lucide-react';

export const Clients = () => {
  const { clients, addClient, updateClient, deleteClient } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialFormState: Partial<Client> = {
    name: '', cpfCnpj: '', email: '', phone: '', status: 'active', birthDate: '',
    address: '', city: '', state: '', zipCode: '', number: '', neighborhood: '', notes: ''
  };
  const [formData, setFormData] = useState<Partial<Client>>(initialFormState);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cpfCnpj.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setFormData(client);
      setEditingId(client.id);
    } else {
      setFormData(initialFormState);
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingId) {
      updateClient(editingId, formData);
    } else {
      addClient({ ...formData, id: generateId() } as Client);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este cliente?')) {
      deleteClient(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
          <p className="text-slate-500">Gestão da carteira de clientes e leads.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors"
        >
          <Plus size={20} />
          Novo Cliente
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
                type="text" 
                placeholder="Buscar por nome, CPF, email ou cidade..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[calc(100vh-14rem)] flex flex-col">
        {/* Desktop Table View - With Sticky Header */}
        <div className="hidden md:block overflow-auto flex-1">
            <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 sticky top-0 z-10 shadow-sm">
                <tr>
                <th className="px-6 py-4">Nome / Status</th>
                <th className="px-6 py-4">CPF/CNPJ</th>
                <th className="px-6 py-4">Localização</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4 text-right">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {filteredClients.map(client => (
                <tr key={client.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Briefcase size={16} />
                        </div>
                        <div>
                            <span className="font-medium text-slate-800 block">{client.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${client.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {client.status === 'active' ? 'Ativo' : 'Inativo'}
                            </span>
                        </div>
                    </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{client.cpfCnpj}</td>
                    <td className="px-6 py-4 text-slate-600">
                    {client.city ? `${client.city}/${client.state}` : '-'}
                    </td>
                    <td className="px-6 py-4">
                    <div className="flex flex-col text-xs text-slate-500 gap-1">
                        <div className="flex items-center gap-1"><Mail size={12}/> {client.email}</div>
                        <div className="flex items-center gap-1"><Phone size={12}/> {client.phone}</div>
                    </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                        onClick={() => handleOpenModal(client)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                        <Pencil size={16} />
                        </button>
                        <button 
                        onClick={() => handleDelete(client.id)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                        <Trash2 size={16} />
                        </button>
                    </div>
                    </td>
                </tr>
                ))}
                {filteredClients.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">Nenhum cliente encontrado.</td></tr>
                )}
            </tbody>
            </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden overflow-y-auto">
            {filteredClients.map(client => (
                <div key={client.id} className="p-4 border-b border-slate-100 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Briefcase size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">{client.name}</h3>
                                <p className="text-xs text-slate-500">{client.cpfCnpj}</p>
                            </div>
                         </div>
                         <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${client.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {client.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                    </div>

                    <div className="text-sm text-slate-600 space-y-1 mb-4 pl-[52px]">
                         <p className="flex items-center gap-2"><Mail size={14} className="text-slate-400"/> {client.email}</p>
                         <p className="flex items-center gap-2"><Phone size={14} className="text-slate-400"/> {client.phone}</p>
                         <p className="flex items-center gap-2"><MapPin size={14} className="text-slate-400"/> {client.city ? `${client.city}/${client.state}` : 'Endereço não informado'}</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-slate-50">
                        <button onClick={() => handleOpenModal(client)} className="flex items-center gap-1 text-slate-500 text-sm">
                            <Pencil size={16} /> Editar
                        </button>
                        <div className="w-px h-4 bg-slate-200"></div>
                        <button onClick={() => handleDelete(client.id)} className="flex items-center gap-1 text-slate-500 text-sm hover:text-red-500">
                            <Trash2 size={16} /> Excluir
                        </button>
                    </div>
                </div>
            ))}
            {filteredClients.length === 0 && (
                <div className="p-8 text-center text-slate-400">Nenhum cliente encontrado.</div>
            )}
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Basic Info */}
              <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Dados Pessoais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                            required
                            className="w-full pl-10 p-2.5 rounded border border-slate-300 focus:border-blue-500 outline-none"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            placeholder="Ex: João da Silva"
                            />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">CPF / CNPJ</label>
                        <div className="relative">
                            <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                            className="w-full pl-10 p-2.5 rounded border border-slate-300 focus:border-blue-500 outline-none"
                            value={formData.cpfCnpj}
                            onChange={e => setFormData({...formData, cpfCnpj: e.target.value})}
                            placeholder="000.000.000-00"
                            />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Data de Nascimento</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                            type="date"
                            className="w-full pl-10 p-2.5 rounded border border-slate-300 focus:border-blue-500 outline-none"
                            value={formData.birthDate || ''}
                            onChange={e => setFormData({...formData, birthDate: e.target.value})}
                            />
                        </div>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                          <div className="flex gap-4 pt-2">
                              <label className="flex items-center gap-2 cursor-pointer">
                                  <input 
                                  type="radio" name="status" value="active" 
                                  checked={formData.status === 'active'}
                                  onChange={() => setFormData({...formData, status: 'active'})}
                                  className="text-emerald-600 focus:ring-emerald-500" 
                                  />
                                  <span className="text-sm font-medium text-slate-700">Ativo</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                  <input 
                                  type="radio" name="status" value="inactive" 
                                  checked={formData.status === 'inactive'}
                                  onChange={() => setFormData({...formData, status: 'inactive'})}
                                  className="text-red-600 focus:ring-red-500" 
                                  />
                                  <span className="text-sm font-medium text-slate-700">Inativo</span>
                              </label>
                          </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                            type="email"
                            className="w-full pl-10 p-2.5 rounded border border-slate-300 focus:border-blue-500 outline-none"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            placeholder="cliente@email.com"
                            />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                            className="w-full pl-10 p-2.5 rounded border border-slate-300 focus:border-blue-500 outline-none"
                            value={formData.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                            placeholder="(00) 00000-0000"
                            />
                        </div>
                      </div>
                  </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Endereço</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">CEP</label>
                          <input className="w-full p-2 rounded border border-slate-300 text-sm" value={formData.zipCode || ''} onChange={e => setFormData({...formData, zipCode: e.target.value})} />
                      </div>
                      <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Rua / Logradouro</label>
                          <input className="w-full p-2 rounded border border-slate-300 text-sm" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Número</label>
                          <input className="w-full p-2 rounded border border-slate-300 text-sm" value={formData.number || ''} onChange={e => setFormData({...formData, number: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Bairro</label>
                          <input className="w-full p-2 rounded border border-slate-300 text-sm" value={formData.neighborhood || ''} onChange={e => setFormData({...formData, neighborhood: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Cidade/UF</label>
                          <div className="flex gap-1">
                            <input className="w-2/3 p-2 rounded border border-slate-300 text-sm" placeholder="Cidade" value={formData.city || ''} onChange={e => setFormData({...formData, city: e.target.value})} />
                            <input className="w-1/3 p-2 rounded border border-slate-300 text-sm" placeholder="UF" value={formData.state || ''} onChange={e => setFormData({...formData, state: e.target.value})} />
                          </div>
                      </div>
                  </div>
              </div>

              {/* Notes */}
              <div className="space-y-4">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Observações</h3>
                   <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Anotações Gerais</label>
                       <div className="relative">
                            <AlignLeft className="absolute left-3 top-3 text-slate-400" size={18} />
                            <textarea 
                                className="w-full pl-10 p-2.5 rounded border border-slate-300 focus:border-blue-500 outline-none h-24 resize-none"
                                value={formData.notes || ''}
                                onChange={e => setFormData({...formData, notes: e.target.value})}
                                placeholder="Preferências do cliente, histórico, etc."
                            ></textarea>
                       </div>
                   </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors"
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
