import React from 'react';
import { Client, Deal, Event } from '../../types';
import { formatDate, formatCurrency } from '../../utils';
import { X, User as UserIcon, Mail, Phone, Target, Home, History, Clock, MessageSquare } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { getWhatsAppLink } from '../../utils/whatsapp';

interface ClientDetailsSliderProps {
    client: Client | null;
    onClose: () => void;
    deals: Deal[];
    events: Event[];
    loading: boolean;
}

export const ClientDetailsSlider: React.FC<ClientDetailsSliderProps> = ({
    client,
    onClose,
    deals,
    events,
    loading
}) => {
    if (!client) return null;

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-xl z-[60] flex justify-end">
            <div
                className="bg-card w-full max-w-2xl h-full shadow-[-20px_0_50px_rgba(0,0,0,0.5)] border-l border-border/40 flex flex-col animate-in slide-in-from-right duration-500"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8 border-b border-border/40 flex justify-between items-start bg-secondary/30 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"></div>
                    <div className="relative z-10 flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-primary/60 flex items-center justify-center shadow-lg transform -rotate-3 text-primary-foreground">
                            <UserIcon size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase italic">{client.name}</h2>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold"><Mail size={12} className="text-primary" /> {client.email || 'Sem email'}</div>
                                <div className="flex items-center gap-1.5 text-xs text-foreground font-bold">
                                    <Phone size={12} className="text-primary" /> {client.phone || 'Sem telefone'}
                                    {client.phone && (
                                        <a
                                            href={getWhatsAppLink(client.phone)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-2 p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 transition-all animate-pulse hover:animate-none"
                                            title="Enviar WhatsApp"
                                        >
                                            <MessageSquare size={12} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-all ring-1 ring-border/40"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                    {/* Preferences Section */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2 italic"><Target size={16} /> Perfil do Cliente</h3>
                        </div>
                        {client.preferences ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-secondary/50 rounded-2xl p-5 border border-border/40 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-all"></div>
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-3 italic">Budget & Propósito</p>
                                    <p className="text-sm font-black text-foreground italic tracking-tight">{formatCurrency(client.preferences.minBudget || 0)} - {formatCurrency(client.preferences.maxBudget || 0)}</p>
                                    <div className="mt-3">
                                        <Badge variant="info" className="!text-[8px] !px-3 font-black uppercase tracking-widest italic">
                                            {client.preferences.purpose === 'buy' ? 'Compra' : 'Locação'}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="bg-secondary/50 rounded-2xl p-5 border border-border/40 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-all"></div>
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-3 italic">Preferências de Imóvel</p>
                                    <div className="flex flex-wrap gap-2">
                                        {client.preferences.propertyType && client.preferences.propertyType.length > 0 ? (
                                            client.preferences.propertyType.map(type => (
                                                <span key={type} className="bg-secondary text-foreground px-3 py-1.5 rounded-xl text-[9px] font-black border border-border/40 flex items-center gap-2 uppercase italic tracking-wider">
                                                    <Home size={10} className="text-primary" /> {type}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-[10px] text-muted-foreground italic">Nenhuma preferência definida</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-secondary/30 rounded-3xl border border-dashed border-border/40 text-muted-foreground text-[10px] font-black uppercase tracking-widest italic">
                                Sem preferências cadastradas.
                            </div>
                        )}
                    </section>

                    {/* Timeline Section */}
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <History size={18} className="text-muted-foreground" />
                            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] italic">Timeline de Atividades</h3>
                        </div>
                        {loading ? (
                            <div className="flex justify-center p-10"><Clock className="animate-spin text-primary" /></div>
                        ) : (
                            <div className="relative space-y-6 pl-8 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[1px] before:bg-border/20">
                                {events.length > 0 ? (
                                    events.map(event => (
                                        <div key={event.id} className="relative group/item">
                                            <div className="absolute -left-[25.5px] top-1 w-2.5 h-2.5 rounded-full bg-primary/50 border-2 border-background z-10 group-hover/item:bg-primary group-hover/item:scale-125 transition-all shadow-[0_0_10px_rgba(var(--primary),0.3)]"></div>
                                            <div className="bg-secondary/40 border border-border/40 p-4 rounded-2xl group-hover/item:border-primary/30 transition-colors">
                                                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest italic mb-1">{formatDate(event.start_time)}</p>
                                                <p className="text-xs font-black text-foreground uppercase italic tracking-tight">{event.title}</p>
                                                {event.description && <p className="text-[10px] text-muted-foreground mt-2 line-clamp-2">{event.description}</p>}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest italic ml-4 opacity-50">Nenhuma atividade registrada.</div>
                                )}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};
