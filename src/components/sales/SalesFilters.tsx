import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface SalesFiltersProps {
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    showFilters: boolean;
    setShowFilters: (val: boolean) => void;
    onClear: () => void;
    hasFilters: boolean;
    filterDateStart: string;
    setFilterDateStart: (val: string) => void;
}

export const SalesFilters: React.FC<SalesFiltersProps> = ({
    searchTerm,
    setSearchTerm,
    showFilters,
    setShowFilters,
    onClear,
    hasFilters,
    filterDateStart,
    setFilterDateStart
}) => {
    return (
        <div className="premium-card p-4 !rounded-2xl shadow-sm overflow-hidden">
            <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                    <Input
                        icon={<Search className="text-slate-500" size={18} />}
                        placeholder="Buscar por empreendimento..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="uppercase italic font-bold tracking-wider text-[10px]"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant={showFilters ? 'primary' : 'secondary'}
                        onClick={() => setShowFilters(!showFilters)}
                        icon={Filter}
                        className="!py-2.5"
                    >
                        Filtros
                    </Button>

                    {hasFilters && (
                        <button
                            onClick={onClear}
                            className="text-[10px] font-black uppercase tracking-widest text-red-500/70 hover:text-red-400 px-2 transition-colors italic"
                        >
                            Limpar
                        </button>
                    )}
                </div>
            </div>

            {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2 fade-in duration-300">
                    <div className="lg:col-span-1">
                        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 italic">Data Início</label>
                        <input
                            type="date"
                            className="w-full p-2 rounded-xl border border-white/10 bg-[#0f0f12] text-white text-xs outline-none focus:border-cyan-500/50"
                            style={{ colorScheme: 'dark' }}
                            value={filterDateStart}
                            onChange={(e) => setFilterDateStart(e.target.value)}
                        />
                    </div>
                    {/* Outros filtros podem ser adicionados aqui conforme necessário */}
                </div>
            )}
        </div>
    );
};
