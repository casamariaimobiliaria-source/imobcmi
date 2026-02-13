
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { KanbanCard } from './KanbanCard';
import { Deal } from '../types';

interface KanbanColumnProps {
    id: string;
    title: string;
    deals: Deal[];
    getClientName: (id?: string | null) => string | undefined;
    color?: string;
    onDealClick?: (deal: Deal) => void;
    [key: string]: any;
}

export const KanbanColumn = ({ id, title, deals, getClientName, color = 'bg-cyan-500/10', onDealClick }: KanbanColumnProps) => {
    const { setNodeRef } = useDroppable({
        id: id,
    });

    const totalValue = deals.reduce((sum, deal) => sum + Number(deal.value), 0);

    return (
        <div className="flex flex-col h-full min-w-[300px] w-[300px] animate-in slide-in-from-top-4 duration-500">
            {/* Header */}
            <div className={`p-4 rounded-t-3xl border-b border-slate-200 dark:border-white/5 ${color} flex justify-between items-center backdrop-blur-md bg-slate-50/50 dark:bg-secondary/20`}>
                <div className="flex items-center gap-3">
                    <span className="font-black text-slate-950 dark:text-foreground text-xs uppercase tracking-widest italic">{title}</span>
                    <span className="bg-white/50 dark:bg-primary/10 px-2 py-0.5 rounded-lg text-[10px] font-black text-cyan-700 dark:text-primary ring-1 ring-slate-200 dark:ring-white/5">
                        {deals.length}
                    </span>
                </div>
            </div>

            {/* Total Value */}
            <div className="bg-slate-100 dark:bg-card/40 px-4 py-2 border-b border-slate-200 dark:border-white/5 text-[9px] text-slate-500 dark:text-muted-foreground font-black uppercase tracking-widest text-right flex justify-between items-center">
                <span className="opacity-60 dark:opacity-40">Total</span>
                <span className="text-slate-900 dark:text-foreground font-black italic">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}</span>
            </div>

            {/* Droppable Area */}
            <div
                ref={setNodeRef}
                className="flex-1 bg-slate-50 dark:bg-secondary/5 p-3 space-y-3 overflow-y-auto rounded-b-[2rem] border-x border-b border-slate-200 dark:border-white/5 scrollbar-hide mb-4"
            >
                {deals.map((deal) => (
                    <KanbanCard
                        key={deal.id}
                        deal={deal}
                        clientName={getClientName(deal.client_id)}
                        onClick={onDealClick}
                    />
                ))}
                {deals.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-700 text-[10px] font-black uppercase tracking-widest border-2 border-dashed border-white/5 rounded-2xl m-2 opacity-50 py-10">
                        <span className="mb-2 italic">Vazio</span>
                        <div className="w-8 h-1 bg-white/5 rounded-full"></div>
                    </div>
                )}
            </div>
        </div>
    );
};
