import React from 'react';
import { Developer } from '../../types';
import { Building2, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface DeveloperTableProps {
    developers: Developer[];
    onEdit: (dev: Developer) => void;
    onDelete: (id: string) => void;
}

export const DeveloperTable: React.FC<DeveloperTableProps> = ({ developers, onEdit, onDelete }) => {
    return (
        <div className="hidden md:block overflow-auto flex-1 custom-scrollbar">
            <table className="w-full text-left text-sm min-w-[800px] border-separate border-spacing-0">
                <thead className="bg-secondary/50 text-muted-foreground sticky top-0 z-10 backdrop-blur-md">
                    <tr>
                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest border-b border-white/10 italic">Razão Social / Status</th>
                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest border-b border-white/10 italic">CNPJ</th>
                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest border-b border-white/10 italic">Localização</th>
                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest border-b border-white/10 italic">Contato Principal</th>
                        <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest border-b border-white/10 text-right italic">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {developers.map(dev => (
                        <tr key={dev.id} className="hover:bg-secondary/30 transition-colors group">
                            <td className="px-8 py-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-secondary text-primary flex items-center justify-center border border-white/5 group-hover:border-primary/40 transition-all">
                                        <Building2 size={20} />
                                    </div>
                                    <div>
                                        <span className="font-bold text-foreground block group-hover:text-primary transition-colors uppercase tracking-tight italic">{dev.companyName}</span>
                                        <div className="mt-1">
                                            <Badge variant={dev.status === 'active' ? 'success' : 'error'}>
                                                {dev.status === 'active' ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-8 py-5 text-muted-foreground font-mono text-xs">{dev.cnpj || '---'}</td>
                            <td className="px-8 py-5 text-muted-foreground text-[10px] font-black uppercase tracking-widest italic">
                                {dev.city ? `${dev.city}/${dev.state}` : '-'}
                            </td>
                            <td className="px-8 py-5">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[11px] font-bold text-foreground uppercase italic tracking-tight">{dev.contactName}</span>
                                    <span className="text-[10px] text-muted-foreground font-medium">{dev.email || dev.phone || 'Sem contato'}</span>
                                </div>
                            </td>
                            <td className="px-8 py-5 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <Button variant="ghost" onClick={() => onEdit(dev)} className="!p-2.5 hover:text-primary">
                                        <Pencil size={16} />
                                    </Button>
                                    <Button variant="ghost" onClick={() => onDelete(dev.id)} className="!p-2.5 hover:text-red-500">
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {developers.length === 0 && (
                        <tr><td colSpan={5} className="p-20 text-center text-muted-foreground italic text-[10px] font-black uppercase tracking-widest opacity-40">Nenhuma incorporadora encontrada.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
