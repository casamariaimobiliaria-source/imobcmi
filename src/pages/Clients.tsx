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

export const Clients = () => {
  const { state, actions } = useClientManager();
  const {
    searchTerm, isModalOpen, isDetailsOpen, selectedClient, editingId,
    clientDeals, clientEvents, loadingHistory, formData, filteredClients
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

      {/* Search Bar */}
      <div className="premium-card p-4 !rounded-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative z-10 max-w-xl">
          <Input
            icon={<Search size={18} />}
            placeholder="PESQUISE POR NOME, DOCUMENTO OU EMAIL..."
            value={searchTerm}
            onChange={(e) => actions.setSearchTerm(e.target.value)}
            className="uppercase tracking-widest text-[10px] font-black italic"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="premium-card !rounded-[2.5rem] shadow-2xl border-white/10 overflow-hidden flex flex-col h-[calc(100vh-14rem)] relative">
        <ClientTable
          clients={filteredClients}
          onSelect={actions.handleOpenDetails}
          onEdit={actions.handleOpenModal}
          onDelete={actions.handleDelete}
        />
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
