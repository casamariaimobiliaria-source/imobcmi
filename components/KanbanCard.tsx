
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Deal } from '../types';
import { GripVertical, DollarSign, User, MessageCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppProvider';
import { formatPhoneForWhatsapp } from '../utils';
import { differenceInDays, parseISO } from 'date-fns';

interface KanbanCardProps {
    deal: Deal;
    clientName?: string;
    onClick?: (deal: Deal) => void;
}

export const KanbanCard = ({ deal, clientName, onClick }: KanbanCardProps) => {
    const { clients } = useApp();
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: deal.id,
        data: { deal }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
    };

    const client = clients.find(c => c.id === deal.client_id);
    const whatsappPhone = client?.phone ? formatPhoneForWhatsapp(client.phone) : null;

    // Stagnation Check
    const daysInactive = deal.updated_at ? differenceInDays(new Date(), parseISO(deal.updated_at)) : 0;
    const isStagnant = daysInactive > 7;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
        bg-white p-3 rounded-lg shadow-sm border border-slate-200 
        hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing
        ${isDragging ? 'ring-2 ring-blue-500 rotate-2' : ''}
        ${isStagnant ? 'border-l-4 border-l-amber-400' : ''}
      `}
            {...attributes}
            {...listeners}
            onClick={() => onClick?.(deal)}
        >
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-slate-800 text-sm line-clamp-2 flex-1">{deal.title}</h4>
                <div className="flex items-center gap-1">
                    {isStagnant && (
                        <div className="text-amber-500" title={`Sem interação há ${daysInactive} dias`}>
                            <AlertCircle size={14} />
                        </div>
                    )}
                    <button className="text-slate-400 hover:text-slate-600 cursor-grab">
                        <GripVertical size={14} />
                    </button>
                </div>
            </div>

            <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <DollarSign size={12} />
                    <span className="font-semibold text-slate-700">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(deal.value)}
                    </span>
                </div>

                {clientName && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <User size={12} />
                            <span className="truncate max-w-[120px]">{clientName}</span>
                        </div>
                        {whatsappPhone && (
                            <a
                                href={`https://wa.me/${whatsappPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-700 p-1 hover:bg-green-50 rounded-full transition-colors"
                                title="Conversar no WhatsApp"
                                onClick={e => e.stopPropagation()}
                            >
                                <MessageCircle size={14} />
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
