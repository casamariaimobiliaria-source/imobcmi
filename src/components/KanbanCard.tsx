
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Deal } from '../types';
import { GripVertical, DollarSign, User } from 'lucide-react';

interface KanbanCardProps {
    deal: Deal;
    clientName?: string;
    onClick?: (deal: Deal) => void;
    [key: string]: any;
}

export const KanbanCard = ({ deal, clientName, onClick }: KanbanCardProps) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: deal.id,
        data: { deal }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
        premium-card p-4 !bg-card !border-white/5 
        hover:!border-primary/30 transition-all cursor-grab active:cursor-grabbing group
        ${isDragging ? 'ring-2 ring-primary shadow-lg shadow-primary/20 rotate-1 scale-105 z-50' : ''}
      `}
            {...attributes}
            {...listeners}
            onClick={() => onClick?.(deal)}
        >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/60 opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="flex justify-between items-start mb-3">
                <h4 className="font-black text-foreground text-xs uppercase italic tracking-tighter leading-tight line-clamp-2 pr-4">{deal.title}</h4>
                <div className="text-muted-foreground group-hover:text-primary transition-colors">
                    <GripVertical size={14} />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2 text-[11px]">
                    <div className="p-1 bg-emerald-500/10 rounded-md text-emerald-500">
                        <DollarSign size={10} />
                    </div>
                    <span className="font-black text-emerald-500 italic">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(deal.value)}
                    </span>
                </div>

                {clientName && (
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <div className="p-1 bg-secondary/50 rounded-md text-muted-foreground">
                            <User size={10} />
                        </div>
                        <span className="truncate font-bold uppercase tracking-widest">{clientName}</span>
                    </div>
                )}
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Ver Detalhes</span>
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
            </div>
        </div>
    );
};
