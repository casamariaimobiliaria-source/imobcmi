import React from 'react';
import { Client } from '../../types';
import { Pencil, Trash2, Briefcase, MapPin, Mail, Phone, MessageSquare } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { getWhatsAppLink } from '../../utils/whatsapp';

interface ClientTableProps {
    clients: Client[];
    onSelect: (client: Client) => void;
    onEdit: (client: Client) => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
    selectedClients: string[];
    onToggleSelect: (id: string, e?: React.MouseEvent) => void;
    onToggleSelectAll: () => void;
}

export const ClientTable: React.FC<ClientTableProps> = ({
    clients,
    onSelect,
    onEdit,
    onDelete,
    selectedClients,
    onToggleSelect,
    onToggleSelectAll
}) => {
    return (
        <div className="overflow-auto flex-1 custom-scrollbar">
            <table className="w-full text-left text-sm border-separate border-spacing-0">
                <thead className="bg-secondary/50 sticky top-0 z-20 shadow-sm backdrop-blur-md">
                    <tr>
                        <th className="px-4 py-5 w-10 border-b border-white/10">
                            <input
                                type="checkbox"
                                className="rounded border-white/10 bg-white/5 checked:bg-primary"
                                checked={selectedClients.length === clients.length && clients.length > 0}
                                onChange={onToggleSelectAll}
                            />
                        </th>
                        <th className="px-4 md:px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/10 italic">Nome & Status</th>
                        <th className="hidden lg:table-cell px-4 md:px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/10 italic">Identificação</th>
                        <th className="hidden xl:table-cell px-4 md:px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/10 italic">Localização</th>
                        <th className="hidden md:table-cell px-4 md:px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/10 italic">Contato</th>
                        <th className="sticky right-0 bg-secondary/50 backdrop-blur-md px-4 md:px-8 py-5 text-right border-b border-white/10 italic text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {clients.map(client => (
                        <tr
                            key={client.id}
                            className={`hover:bg-secondary/30 cursor-pointer group transition-colors ${selectedClients.includes(client.id) ? 'bg-primary/5' : ''}`}
                            onClick={() => onSelect(client)}
                        >
                            <td className="px-4 py-5">
                                <input
                                    type="checkbox"
                                    className="rounded border-white/10 bg-white/5 checked:bg-primary"
                                    checked={selectedClients.includes(client.id)}
                                    onChange={(e) => onToggleSelect(client.id, e as any)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </td>
                            <td className="px-4 md:px-8 py-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary group-hover:scale-105 transition-transform bg-gradient-to-br from-primary/5 to-transparent border border-white/5">
                                        <Briefcase size={18} />
                                    </div>
                                    <div>
                                        <span className="font-bold text-foreground group-hover:text-primary transition-colors block uppercase italic tracking-tight">{client.name}</span>
                                        <div className="mt-1">
                                            <Badge variant={client.status === 'active' ? 'success' : 'error'} className="!text-[8px] !px-2">
                                                {client.status === 'active' ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="hidden lg:table-cell px-4 md:px-8 py-5">
                                <span className="text-muted-foreground font-mono text-xs">{client.cpfCnpj || 'PENDENTE'}</span>
                            </td>
                            <td className="hidden xl:table-cell px-4 md:px-8 py-5">
                                <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-black uppercase tracking-widest italic">
                                    <MapPin size={14} className="opacity-50 text-primary" />
                                    {client.city ? `${client.city}/${client.state}` : '-'}
                                </div>
                            </td>
                            <td className="hidden md:table-cell px-4 md:px-8 py-5">
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium truncate max-w-[150px]">
                                        <Mail size={12} className="text-primary opacity-50" />
                                        {client.email || '-'}
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-foreground font-bold">
                                        <Phone size={12} className="text-primary" />
                                        {client.phone || '-'}
                                    </div>
                                </div>
                            </td>
                            <td className="sticky right-0 bg-background/95 backdrop-blur-sm px-4 md:px-8 py-5 text-right border-l border-white/5">
                                <div className="flex items-center justify-end gap-2">
                                    <a
                                        href={getWhatsAppLink(client.phone || '')}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-2 rounded-lg hover:text-green-500 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 transition-all"
                                        title="Chamar no WhatsApp"
                                    >
                                        <MessageSquare size={16} />
                                    </a>
                                    <Button
                                        variant="ghost"
                                        onClick={(e) => { e.stopPropagation(); onEdit(client); }}
                                        className="!p-2 hover:!text-primary !bg-primary/10 hover:!bg-primary/20 border border-primary/20"
                                        title="Editar Cliente"
                                    >
                                        <Pencil size={16} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={(e) => { e.stopPropagation(); onDelete(client.id, e); }}
                                        className="!p-2 hover:!text-red-500 !bg-red-500/10 hover:!bg-red-500/20 border border-red-500/20"
                                        title="Excluir Cliente"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {clients.length === 0 && (
                        <tr><td colSpan={5} className="p-20 text-center text-muted-foreground italic text-[10px] font-black tracking-widest uppercase opacity-40">Nenhum cliente encontrado.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
