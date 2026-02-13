import React from 'react';
import { User as UserIcon, Plus, Search } from 'lucide-react';

// UI Components
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ClientTable } from '../components/clients/ClientTable';
import { ClientDetailsSlider } from '../components/clients/ClientDetailsSlider';
import { ClientFormModal } from '../components/clients/ClientFormModal';

// Hooks
import { useClientManager } from '../hooks/useClientManager';
import { useApp } from '../context/AppProvider';
import { AdvancedFilters } from '../components/shared/AdvancedFilters';
import { MobileCard } from '../components/ui/MobileCard';
import { Trash2, Users, Briefcase, MapPin, Phone, Mail } from 'lucide-react';

export const Clients = () => {
  const { agents } = useApp();
  const { state, actions } = useClientManager();
  const {
    searchTerm, isModalOpen, isDetailsOpen, selectedClient, editingId,
    clientDeals, clientEvents, loadingHistory, formData, filteredClients, selectedClients,
    advancedFilters
  } = state;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-700">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-900/20 transform rotate-2">
            <UserIcon size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tighter uppercase italic">Clientes <span className="text-primary">CMI</span></h1>
            <p className="text-muted-foreground font-bold text-[9px] md:text-[10px] uppercase tracking-widest mt-1 italic">Gestão inteligente da carteira de clientes.</p>
          </div>
        </div>
        <Button onClick={() => actions.handleOpenModal()} icon={Plus} className="shadow-[0_0_20px_rgba(6,182,212,0.2)]">
          Novo Cliente
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <AdvancedFilters
          searchTerm={searchTerm}
          onSearch={actions.setSearchTerm}
          filters={advancedFilters}
          setFilters={actions.setAdvancedFilters}
          options={{ agents }}
        />
      </div>

      {/* Bulk Actions Bar */}
      {selectedClients.length > 0 && (
        <div className="bg-primary p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-bottom-4 duration-300 shadow-2xl shadow-primary/20">
          <div className="flex items-center gap-4">
            <span className="text-black font-black text-xs uppercase italic tracking-tighter">
              {selectedClients.length} selecionados
            </span>
            <div className="h-4 w-[1px] bg-black/20" />
            <button onClick={actions.handleBulkDelete} className="text-black/70 hover:text-black transition-colors font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
              <Trash2 size={14} /> Excluir
            </button>
          </div>
          <button onClick={() => actions.setSelectedClients?.([])} className="text-black/50 hover:text-black">
            <Plus className="rotate-45" size={20} />
          </button>
        </div>
      )}

      {/* Content Area */}
      <div className="premium-card !rounded-[2.5rem] shadow-2xl border-white/10 overflow-hidden flex flex-col h-[calc(100vh-16rem)] relative">
        <div className="md:hidden p-4 space-y-4 overflow-y-auto">
          {filteredClients.map(client => (
            <MobileCard
              key={client.id}
              title={client.name}
              subtitle={client.cpfCnpj || 'PENDENTE'}
              description={client.city ? `${client.city}/${client.state}` : 'Localização não informada'}
              checkbox={
                <input
                  type="checkbox"
                  className="rounded border-white/10 bg-white/5 checked:bg-primary"
                  checked={selectedClients.includes(client.id)}
                  onChange={(e) => actions.toggleSelectClient(client.id, e as any)}
                />
              }
              icon={<Briefcase size={18} />}
              status={
                <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-tighter ${client.status === 'active' ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'} border border-white/5`}>
                  {client.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
              }
              tags={[
                <span key="phone" className="flex items-center gap-1"><Phone size={10} /> {client.phone || '--'}</span>,
                <span key="email" className="flex items-center gap-1"><Mail size={10} /> {client.email || '--'}</span>
              ]}
              onClick={() => actions.handleOpenDetails(client)}
            />
          ))}
        </div>
        <div className="hidden md:block h-full overflow-hidden">
          <ClientTable
            clients={filteredClients}
            selectedClients={selectedClients}
            onToggleSelect={actions.toggleSelectClient}
            onToggleSelectAll={actions.toggleSelectAll}
            onSelect={actions.handleOpenDetails}
            onEdit={actions.handleOpenModal}
            onDelete={actions.handleDelete}
          />
        </div>
      </div>

      <ClientDetailsSlider
        client={selectedClient}
        onClose={actions.handleCloseDetails}
        deals={clientDeals}
        events={clientEvents}
        loading={loadingHistory}
      />

      <ClientFormModal
        isOpen={isModalOpen}
        onClose={() => actions.setIsModalOpen(false)}
        formData={formData}
        setFormData={actions.setFormData}
        onSubmit={actions.handleSave}
        editingId={editingId}
        togglePreference={actions.togglePreference}
      />
    </div>
  );
};
