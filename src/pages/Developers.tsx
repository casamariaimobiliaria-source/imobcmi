import React from 'react';
import { Plus, Search, Building2 } from 'lucide-react';

// UI Components
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { DeveloperTable } from '../components/developers/DeveloperTable';
import { DeveloperForm } from '../components/developers/DeveloperForm';

// Hooks
import { useDeveloperManager } from '../hooks/useDeveloperManager';

export const Developers = () => {
  const { state, actions } = useDeveloperManager();
  const { searchTerm, isModalOpen, editingId, formData, filteredDevelopers } = state;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 transform -rotate-2">
            <Building2 size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tighter uppercase italic">Incorporadoras <span className="text-primary">Parceiras</span></h1>
            <p className="text-muted-foreground font-bold text-[9px] md:text-[10px] uppercase tracking-widest mt-1 italic">Gestão de construtoras e incorporação imobiliária.</p>
          </div>
        </div>
        <Button
          onClick={() => actions.handleOpenModal()}
          icon={Plus}
          className="shadow-[0_0_20px_rgba(99,102,241,0.2)]"
        >
          Nova Incorporadora
        </Button>
      </div>

      {/* Search Bar */}
      <div className="premium-card p-4 !rounded-2xl">
        <div className="relative group max-w-md">
          <Input
            icon={<Search size={18} />}
            placeholder="BUSQUE POR RAZÃO SOCIAL, CNPJ OU CIDADE..."
            value={searchTerm}
            onChange={(e) => actions.setSearchTerm(e.target.value)}
            className="uppercase tracking-widest text-[10px] font-black italic"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="premium-card !rounded-[2.5rem] border-white/10 shadow-2xl overflow-hidden h-[calc(100vh-16rem)] flex flex-col">
        <DeveloperTable
          developers={filteredDevelopers}
          onEdit={actions.handleOpenModal}
          onDelete={actions.handleDelete}
        />
      </div>

      <DeveloperForm
        isOpen={isModalOpen}
        onClose={() => actions.setIsModalOpen(false)}
        formData={formData}
        setFormData={actions.setFormData}
        onSubmit={actions.handleSave}
        editingId={editingId}
      />
    </div>
  );
};
