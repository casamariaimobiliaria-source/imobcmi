import React from 'react';
import { Filter, X, Calendar, User, Tag } from 'lucide-react';

interface AdvancedFiltersProps {
    onSearch: (term: string) => void;
    searchTerm: string;
    filters: any;
    setFilters: (filters: any) => void;
    options?: {
        agents?: any[];
        categories?: string[];
        developers?: any[];
    };
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
    onSearch,
    searchTerm,
    filters,
    setFilters,
    options
}) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const activeFiltersCount = Object.values(filters).filter(v => v !== '' && v !== null).length;

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <div className="flex-1 relative group">
                    <input
                        type="text"
                        placeholder="BUSCAR..."
                        value={searchTerm}
                        onChange={(e) => onSearch(e.target.value)}
                        className="w-full bg-secondary/50 border border-white/10 rounded-2xl px-5 py-3 text-[10px] font-black uppercase tracking-widest focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`px-5 py-3 rounded-2xl border transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${isOpen || activeFiltersCount > 0 ? 'bg-primary border-primary text-black' : 'bg-secondary/50 border-white/10 text-muted-foreground'}`}
                >
                    <Filter size={16} />
                    Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </button>
            </div>

            {isOpen && (
                <div className="premium-card !p-6 border-primary/20 bg-primary/5 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                            <Filter size={14} /> Filtros Avançados
                        </h4>
                        <button onClick={() => { setFilters({}); setIsOpen(false); }} className="text-[9px] font-black uppercase text-rose-500 hover:text-rose-400 underline tracking-widest transition-colors">
                            Limpar Tudo
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                                <User size={12} /> Responsável
                            </label>
                            <select
                                value={filters.agent || ''}
                                onChange={(e) => setFilters({ ...filters, agent: e.target.value })}
                                className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-[10px] font-bold uppercase outline-none focus:border-primary/30"
                            >
                                <option value="">Todos</option>
                                {options?.agents?.map(a => (
                                    <option key={a.id} value={a.nome}>{a.nome}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                                <Tag size={12} /> Mídia / Origem
                            </label>
                            <select
                                value={filters.source || ''}
                                onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                                className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-[10px] font-bold uppercase outline-none focus:border-primary/30"
                            >
                                <option value="">Todas</option>
                                <option value="Instagram">Instagram</option>
                                <option value="Facebook">Facebook</option>
                                <option value="Google">Google</option>
                                <option value="Indicação">Indicação</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                                <Calendar size={12} /> Período
                            </label>
                            <input
                                type="date"
                                value={filters.date || ''}
                                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                                className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-[10px] font-bold uppercase outline-none focus:border-primary/30"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
