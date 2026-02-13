import React from 'react';
import { Agent } from '../../types';
import { Search, Plus, ChevronRight } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';

interface AgentListProps {
    agents: Agent[];
    selectedAgentId?: string;
    onSelect: (agent: Agent) => void;
    onAdd: () => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

export const AgentList: React.FC<AgentListProps> = ({
    agents,
    selectedAgentId,
    onSelect,
    onAdd,
    searchTerm,
    setSearchTerm
}) => {
    return (
        <div className="flex flex-col h-full premium-card !rounded-[2rem] border-white/10 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-secondary/30">
                <h2 className="text-lg font-black text-foreground italic uppercase tracking-tighter">Corretores <span className="text-primary">Parceiros</span></h2>
                <button
                    onClick={onAdd}
                    className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all"
                >
                    <Plus size={20} />
                </button>
            </div>

            <div className="p-4 border-b border-white/10 bg-card">
                <Input
                    icon={<Search size={18} />}
                    placeholder="BUSQUE POR NOME, CPF OU CRECI..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="uppercase tracking-widest text-[10px] font-black italic"
                />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {agents.map(agent => (
                    <div
                        key={agent.id}
                        onClick={() => onSelect(agent)}
                        className={`p-6 border-b border-white/5 hover:bg-secondary/30 cursor-pointer transition-all flex items-center justify-between group
              ${selectedAgentId === agent.id ? 'bg-primary/10 border-primary/20' : ''}
            `}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black italic border transition-all
                ${selectedAgentId === agent.id ? 'bg-primary text-primary-foreground border-primary font-black' : 'bg-secondary text-muted-foreground border-white/5 group-hover:border-primary/40'}
              `}>
                                {agent.name ? agent.name.charAt(0) : '?'}
                            </div>
                            <div>
                                <h3 className={`font-black text-sm uppercase italic tracking-tight transition-colors ${selectedAgentId === agent.id ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>{agent.name || 'Sem Nome'}</h3>
                                <div className="mt-1">
                                    <Badge variant={agent.status === 'active' ? 'success' : 'error'} className="!text-[8px] !px-2">
                                        {agent.status === 'active' ? 'Ativo' : 'Inativo'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <ChevronRight size={16} className={`transition-transform ${selectedAgentId === agent.id ? 'text-primary translate-x-1' : 'text-muted-foreground'}`} />
                    </div>
                ))}
                {agents.length === 0 && (
                    <div className="p-10 text-center text-muted-foreground text-[10px] font-black uppercase tracking-widest italic opacity-40">Nenhum corretor encontrado.</div>
                )}
            </div>
        </div>
    );
};
