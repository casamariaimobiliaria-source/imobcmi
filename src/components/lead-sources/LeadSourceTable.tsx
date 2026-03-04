import React from 'react';
import { LeadSource } from '../../types';
import { Edit, Trash2 } from 'lucide-react';

interface LeadSourceTableProps {
    sources: LeadSource[];
    onEdit: (source: LeadSource) => void;
    onDelete: (id: string) => void;
}

export const LeadSourceTable: React.FC<LeadSourceTableProps> = ({ sources, onEdit, onDelete }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-border bg-secondary/30">
                        <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Nome da Mídia / Origem</th>
                        <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest italic w-32 text-center">Status</th>
                        <th className="p-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest italic w-24">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {sources.length === 0 ? (
                        <tr>
                            <td colSpan={3} className="p-8 text-center text-muted-foreground text-sm italic">
                                Nenhuma origem encontrada. Adicione uma nova mídia.
                            </td>
                        </tr>
                    ) : (
                        sources.map((source) => (
                            <tr key={source.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                    <div className="font-bold text-foreground">
                                        {source.name}
                                    </div>
                                </td>
                                <td className="p-4 text-center text-sm">
                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${source.status === 'active'
                                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                        }`}>
                                        {source.status === 'active' ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={() => onEdit(source)}
                                            className="p-2 text-slate-400 hover:text-cyan-400 transition-colors"
                                            aria-label="Editar"
                                            title="Editar Origem"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(source.id)}
                                            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                                            aria-label="Remover"
                                            title="Remover Origem"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};
