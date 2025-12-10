
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppProvider';
import { Client, Deal, Event, Sale, ClientPreferences } from '../types';
import { generateId, formatCurrency, formatDate, formatPhoneForWhatsapp } from '../utils';
import { supabase } from '../supabaseClient';
import {
  Plus, Search, Pencil, Trash2, X, Briefcase, Mail, Phone,
  Fingerprint, MapPin, AlignLeft, Calendar, User, History,
  Target, Home, DollarSign, Car, Bed, MessageCircle
} from 'lucide-react';

export const Clients = () => {
  const { clients, addClient, updateClient, deleteClient, sales } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Client History Data
  const [clientDeals, setClientDeals] = useState<Deal[]>([]);
  const [clientEvents, setClientEvents] = useState<Event[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const initialFormState: Partial<Client> = {
    name: '', cpfCnpj: '', email: '', phone: '', status: 'active', birthDate: '',
    address: '', city: '', state: '', zipCode: '', number: '', neighborhood: '', notes: '',
    preferences: {
      propertyType: [],
      minBudget: 0,
      maxBudget: 0,
      bedrooms: 0,
      garages: 0,
      neighborhoods: [],
      purpose: 'buy'
    }
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
      setFormData({
        ...client,
        preferences: client.preferences || initialFormState.preferences
      });
      setEditingId(client.id);
    } else {
      setFormData(initialFormState);
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleOpenDetails = async (client: Client) => {
    setSelectedClient(client);
    setIsDetailsOpen(true);
    setLoadingHistory(true);

    // Fetch History
    try {
      const { data: deals } = await (supabase as any).from('deals').select('*').eq('client_id', client.id);
      const { data: events } = await supabase.from('events').select('*').eq('client_id', client.id);

      if (deals) setClientDeals(deals);
      if (events) setClientEvents(events);
    } catch (error) {
      console.error("Error fetching history", error);
    } finally {
      setLoadingHistory(false);
    }
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

  // Helper for Preferences
  const togglePreference = (field: 'propertyType' | 'neighborhoods', value: string) => {
    const current = formData.preferences?.[field] || [];
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];

    setFormData({
      ...formData,
      preferences: { ...formData.preferences!, [field]: updated }
    });
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
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-auto flex-1">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4">Nome / Status</th>
                <th className="px-6 py-4">CPF/CNPJ</th>
                <th className="px-6 py-4">Objetivo</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.map(client => (
                <tr key={client.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => handleOpenDetails(client)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Briefcase size={16} />
                      </div>
                      <div>
                        <span className="font-medium text-slate-800 block">{client.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${client.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'} `}>
                          {client.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{client.cpfCnpj}</td>
                  <td className="px-6 py-4 text-slate-600">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium border border-blue-100 capitalize">
                      {client.preferences?.purpose === 'buy' ? 'Comprar' : client.preferences?.purpose === 'rent' ? 'Alugar' : client.preferences?.purpose === 'invest' ? 'Investir' : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col text-xs text-slate-500 gap-1">
                      <div className="flex items-center gap-1"><Mail size={12} /> {client.email}</div>
                      <div className="flex items-center gap-1">
                        <Phone size={12} /> {client.phone}
                        {client.phone && formatPhoneForWhatsapp(client.phone) && (
                          <a
                            href={`https://wa.me/${formatPhoneForWhatsapp(client.phone)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-1 text-green-600 hover:text-green-700"
                            title="Conversar no WhatsApp"
                            onClick={e => e.stopPropagation()}
                          >
                            <MessageCircle size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
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
                </tr >
              ))}
              {
                filteredClients.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-400">Nenhum cliente encontrado.</td></tr>
                )
              }
            </tbody >
          </table >
        </div >

        {/* Mobile Card View */}
        < div className="md:hidden overflow-y-auto" >
          {
            filteredClients.map(client => (
              <div key={client.id} className="p-4 border-b border-slate-100 last:border-0" onClick={() => handleOpenDetails(client)}>
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
                  <p className="flex items-center gap-2"><Mail size={14} className="text-slate-400" /> {client.email}</p>
                  <p className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" /> {client.phone}
                    {client.phone && formatPhoneForWhatsapp(client.phone) && (
                      <a
                        href={`https://wa.me/${formatPhoneForWhatsapp(client.phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-green-600 hover:text-green-700 flex items-center gap-1 text-xs font-medium"
                        onClick={e => e.stopPropagation()}
                      >
                        <MessageCircle size={14} /> WhatsApp
                      </a>
                    )}
                  </p>
                  <p className="flex items-center gap-2"><MapPin size={14} className="text-slate-400" /> {client.city ? `${client.city}/${client.state}` : 'Endereço não informado'}</p>
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-slate-50" onClick={e => e.stopPropagation()}>
                  <button onClick={() => handleOpenModal(client)} className="flex items-center gap-1 text-slate-500 text-sm">
                    <Pencil size={16} /> Editar
                  </button>
                  <div className="w-px h-4 bg-slate-200"></div>
                  <button onClick={() => handleDelete(client.id)} className="flex items-center gap-1 text-slate-500 text-sm hover:text-red-500">
                    <Trash2 size={16} /> Excluir
                  </button>
                </div>
              </div>
            ))
          }
        </div >
      </div >

      {/* DETAILS MODAL */}
      {
        isDetailsOpen && selectedClient && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end">
            <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{selectedClient.name}</h2>
                  <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
                    <Mail size={14} /> {selectedClient.email}
                    <span className="text-slate-300">|</span>
                    <Phone size={14} /> {selectedClient.phone}
                    {selectedClient.phone && formatPhoneForWhatsapp(selectedClient.phone) && (
                      <a
                        href={`https://wa.me/${formatPhoneForWhatsapp(selectedClient.phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold hover:bg-green-200 transition-colors flex items-center gap-1"
                      >
                        <MessageCircle size={12} /> Conversar
                      </a>
                    )}
                  </p>
                </div>
                <button onClick={() => setIsDetailsOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* PREFERENCES SECTION */}
                <section>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Target size={16} /> Perfil e Preferências
                  </h3>
                  {selectedClient.preferences ? (
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-blue-600 font-semibold mb-1">Objetivo</p>
                          <span className="bg-white text-blue-800 px-2 py-1 rounded text-sm font-medium border border-blue-100 capitalize">
                            {selectedClient.preferences.purpose === 'buy' ? 'Comprar' : selectedClient.preferences.purpose === 'rent' ? 'Alugar' : 'Investir'}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-blue-600 font-semibold mb-1">Orçamento</p>
                          <p className="text-sm font-bold text-blue-900">
                            {formatCurrency(selectedClient.preferences.minBudget)} - {formatCurrency(selectedClient.preferences.maxBudget)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {selectedClient.preferences.propertyType.map(type => (
                          <span key={type} className="bg-white text-slate-600 px-2 py-1 rounded text-xs border border-slate-200 flex items-center gap-1">
                            <Home size={12} /> {type}
                          </span>
                        ))}
                        {selectedClient.preferences.bedrooms > 0 && (
                          <span className="bg-white text-slate-600 px-2 py-1 rounded text-xs border border-slate-200 flex items-center gap-1">
                            <Bed size={12} /> {selectedClient.preferences.bedrooms}+ Quartos
                          </span>
                        )}
                        {selectedClient.preferences.garages > 0 && (
                          <span className="bg-white text-slate-600 px-2 py-1 rounded text-xs border border-slate-200 flex items-center gap-1">
                            <Car size={12} /> {selectedClient.preferences.garages}+ Vagas
                          </span>
                        )}
                      </div>
                      {selectedClient.preferences.neighborhoods.length > 0 && (
                        <div>
                          <p className="text-xs text-blue-600 font-semibold mb-1">Bairros de Interesse</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedClient.preferences.neighborhoods.map(b => (
                              <span key={b} className="text-xs text-blue-800 bg-blue-100/50 px-2 py-0.5 rounded">
                                {b}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                      Nenhuma preferência registrada. Edite o cliente para adicionar.
                    </div>
                  )}
                </section>

                {/* HISTORY SECTION */}
                <section>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <History size={16} /> Histórico de Interações
                  </h3>

                  {loadingHistory ? (
                    <div className="text-center py-8 text-slate-400">Carregando histórico...</div>
                  ) : (
                    <div className="space-y-4">
                      {/* Sales */}
                      {sales.filter(s => s.clientId === selectedClient.id).map(sale => (
                        <div key={sale.id} className="flex gap-4 items-start">
                          <div className="mt-1">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                              <DollarSign size={16} />
                            </div>
                          </div>
                          <div className="flex-1 bg-white border border-slate-200 p-3 rounded-lg">
                            <div className="flex justify-between">
                              <p className="font-bold text-slate-800">Compra Realizada</p>
                              <span className="text-xs text-slate-400">{formatDate(sale.date)}</span>
                            </div>
                            <p className="text-sm text-slate-600">Unidade {sale.unit} - {sale.projectId}</p>
                            <p className="text-sm font-medium text-emerald-600 mt-1">{formatCurrency(sale.unitValue)}</p>
                          </div>
                        </div>
                      ))}

                      {/* Deals */}
                      {clientDeals.map(deal => (
                        <div key={deal.id} className="flex gap-4 items-start">
                          <div className="mt-1">
                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                              <Briefcase size={16} />
                            </div>
                          </div>
                          <div className="flex-1 bg-white border border-slate-200 p-3 rounded-lg">
                            <div className="flex justify-between">
                              <p className="font-bold text-slate-800">Oportunidade: {deal.title}</p>
                              <span className="text-xs text-slate-400">{formatDate(deal.created_at)}</span>
                            </div>
                            <p className="text-sm text-slate-600">Estágio: <span className="uppercase text-xs font-bold">{deal.stage}</span></p>
                            <p className="text-sm font-medium text-slate-800 mt-1">{formatCurrency(deal.value)}</p>
                          </div>
                        </div>
                      ))}

                      {/* Events */}
                      {clientEvents.map(event => (
                        <div key={event.id} className="flex gap-4 items-start">
                          <div className="mt-1">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                              <Calendar size={16} />
                            </div>
                          </div>
                          <div className="flex-1 bg-white border border-slate-200 p-3 rounded-lg">
                            <div className="flex justify-between">
                              <p className="font-bold text-slate-800">{event.title}</p>
                              <span className="text-xs text-slate-400">{formatDate(event.start_time)}</span>
                            </div>
                            <p className="text-sm text-slate-600">{event.description || 'Sem descrição'}</p>
                            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded mt-2 inline-block uppercase">{event.type}</span>
                          </div>
                        </div>
                      ))}

                      {sales.filter(s => s.clientId === selectedClient.id).length === 0 && clientDeals.length === 0 && clientEvents.length === 0 && (
                        <p className="text-center text-slate-400 text-sm py-4">Nenhuma interação registrada.</p>
                      )}
                    </div>
                  )}
                </section>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button
                  onClick={() => {
                    setIsDetailsOpen(false);
                    handleOpenModal(selectedClient);
                  }}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  <Pencil size={18} /> Editar Perfil Completo
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* EDIT/CREATE MODAL */}
      {
        isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">
                  {editingId ? 'Editar Cliente' : 'Novo Cliente'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-8">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* LEFT COLUMN - BASIC INFO */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                      <User size={18} /> Dados Pessoais
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                        <input required className="w-full p-2 rounded border border-slate-300" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">CPF/CNPJ</label>
                          <input className="w-full p-2 rounded border border-slate-300" value={formData.cpfCnpj} onChange={e => setFormData({ ...formData, cpfCnpj: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                          <input className="w-full p-2 rounded border border-slate-300" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input type="email" className="w-full p-2 rounded border border-slate-300" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <input className="col-span-2 p-2 rounded border border-slate-300 text-sm" placeholder="Rua" value={formData.address || ''} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                          <input className="p-2 rounded border border-slate-300 text-sm" placeholder="Nº" value={formData.number || ''} onChange={e => setFormData({ ...formData, number: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <input className="p-2 rounded border border-slate-300 text-sm" placeholder="Bairro" value={formData.neighborhood || ''} onChange={e => setFormData({ ...formData, neighborhood: e.target.value })} />
                          <input className="p-2 rounded border border-slate-300 text-sm" placeholder="Cidade" value={formData.city || ''} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                          <input className="p-2 rounded border border-slate-300 text-sm" placeholder="UF" maxLength={2} value={formData.state || ''} onChange={e => setFormData({ ...formData, state: e.target.value.toUpperCase() })} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN - PREFERENCES */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                      <Target size={18} /> Preferências de Compra/Aluguel
                    </h3>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Objetivo</label>
                        <div className="flex gap-2">
                          {['buy', 'rent', 'invest'].map(p => (
                            <button
                              key={p} type="button"
                              onClick={() => setFormData({ ...formData, preferences: { ...formData.preferences!, purpose: p as any } })}
                              className={`flex-1 py-1.5 text-sm rounded border ${formData.preferences?.purpose === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}
                            >
                              {p === 'buy' ? 'Comprar' : p === 'rent' ? 'Alugar' : 'Investir'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Tipo de Imóvel</label>
                        <div className="flex flex-wrap gap-2">
                          {['Casa', 'Apartamento', 'Terreno', 'Comercial', 'Rural'].map(type => (
                            <button
                              key={type} type="button"
                              onClick={() => togglePreference('propertyType', type)}
                              className={`px-3 py-1 text-xs rounded-full border ${formData.preferences?.propertyType.includes(type) ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-slate-500 border-slate-200'}`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Orçamento Min</label>
                          <input
                            type="number" className="w-full p-2 rounded border border-slate-300 text-sm"
                            value={formData.preferences?.minBudget || ''}
                            onChange={e => setFormData({ ...formData, preferences: { ...formData.preferences!, minBudget: Number(e.target.value) } })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Orçamento Max</label>
                          <input
                            type="number" className="w-full p-2 rounded border border-slate-300 text-sm"
                            value={formData.preferences?.maxBudget || ''}
                            onChange={e => setFormData({ ...formData, preferences: { ...formData.preferences!, maxBudget: Number(e.target.value) } })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Quartos (Min)</label>
                          <input
                            type="number" className="w-full p-2 rounded border border-slate-300 text-sm"
                            value={formData.preferences?.bedrooms || ''}
                            onChange={e => setFormData({ ...formData, preferences: { ...formData.preferences!, bedrooms: Number(e.target.value) } })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Vagas (Min)</label>
                          <input
                            type="number" className="w-full p-2 rounded border border-slate-300 text-sm"
                            value={formData.preferences?.garages || ''}
                            onChange={e => setFormData({ ...formData, preferences: { ...formData.preferences!, garages: Number(e.target.value) } })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
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
        )
      }
    </div >
  );
};
