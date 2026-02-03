import React from 'react';
import { User } from 'lucide-react';

// UI Components
import { AgentList } from '../components/agents/AgentList';
import { AgentDetails } from '../components/agents/AgentDetails';
import { AgentFormModal } from '../components/agents/AgentFormModal';

// Hooks
import { useAgentManager } from '../hooks/useAgentManager';

export const Agents = () => {
  const { state, actions } = useAgentManager();
  const { selectedAgent, isModalOpen, editingId, searchTerm, formData, filteredAgents } = state;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full lg:h-[calc(100vh-8rem)] animate-in fade-in duration-700">

      {/* Sidebar: Agent List */}
      <div className={`${selectedAgent ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-1/3 h-full`}>
        <AgentList
          agents={filteredAgents}
          selectedAgentId={selectedAgent?.id}
          onSelect={actions.setSelectedAgent}
          onAdd={actions.handleOpenAdd}
          searchTerm={searchTerm}
          setSearchTerm={actions.setSearchTerm}
        />
      </div>

      {/* Main View: Agent Details */}
      <div className={`${!selectedAgent ? 'hidden lg:flex' : 'flex'} flex-col flex-1 h-full`}>
        {selectedAgent ? (
          <AgentDetails
            agent={selectedAgent}
            sales={actions.getAgentSales(selectedAgent.id)}
            onClose={() => actions.setSelectedAgent(null)}
            onEdit={() => actions.handleOpenEdit(selectedAgent)}
            onDelete={actions.handleDelete}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground premium-card !rounded-[2rem] border-white/10 shadow-2xl">
            <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center text-muted-foreground mb-6 border border-white/5">
              <User size={40} />
            </div>
            <p className="font-black uppercase tracking-[0.2em] text-[10px] italic">Selecione um corretor para visualizar o dashboard</p>
          </div>
        )}
      </div>

      <AgentFormModal
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
