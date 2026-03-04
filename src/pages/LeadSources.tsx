import React from 'react';
import { Network, Plus, Search, Filter } from 'lucide-react';
import { useLeadSourceManager } from '../hooks/useLeadSourceManager';
import { Input } from '../components/ui/Input';
import { LeadSourceTable } from '../components/lead-sources/LeadSourceTable';
import { LeadSourceForm } from '../components/lead-sources/LeadSourceForm';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const LeadSources = () => {
    const { state, actions } = useLeadSourceManager();
    const { searchTerm, isModalOpen, filteredSources, formData, editingId } = state;
    const { setSearchTerm, setIsModalOpen, handleOpenModal, handleSave, handleDelete, setFormData } = actions;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground italic tracking-tighter flex items-center gap-3">
                        <Network className="text-primary" size={32} />
                        MÍDIAS DE <span className="text-primary uppercase">ORIGEM</span>
                    </h1>
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mt-1">Canais de Aquisição de Leads</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleOpenModal()}
                        className="premium-button"
                    >
                        <Plus size={18} /> Nova Mídia
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-secondary/30 border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder="Pesquisar origens..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-foreground"
                    />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="premium-card overflow-hidden">
                <LeadSourceTable
                    sources={filteredSources}
                    onEdit={handleOpenModal}
                    onDelete={handleDelete}
                />
            </div>

            {/* LeadSource Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="premium-card bg-card w-full max-w-md border-border shadow-3xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-border/50 bg-secondary/80 backdrop-blur-md">
                            <div>
                                <h3 className="text-xl font-black text-foreground italic uppercase tracking-tighter">
                                    {editingId ? <>Editar <span className="text-primary">Mídia</span></> : <>Nova <span className="text-primary">Mídia</span></>}
                                </h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-transform hover:rotate-90">
                                <Plus className="rotate-45" size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-8">
                            <LeadSourceForm formData={formData} setFormData={setFormData} />

                            <div className="pt-6 border-t border-border flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-secondary/50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="premium-button flex items-center gap-2"
                                >
                                    {editingId ? 'Salvar Alterações' : 'Criar Mídia'}
                                    <CheckCircle2 size={16} className="text-black" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
