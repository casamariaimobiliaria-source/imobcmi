
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
}

export const KanbanColumn = ({ id, title, deals, getClientName, color = 'bg-slate-100', onDealClick }: KanbanColumnProps) => {
    const { setNodeRef } = useDroppable({
        id: id,
    });

    const totalValue = deals.reduce((sum, deal) => sum + Number(deal.value), 0);

    return (
        <div className="flex flex-col h-full min-w-[280px] w-[280px]">
            {/* Header */}
            <div className={`p-3 rounded-t-lg border-b-2 ${color} border-slate-200 flex justify-between items-center`}>
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 text-sm uppercase">{title}</span>
                    <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold text-slate-500">
                        {deals.length}
                    </span>
                </div>
            </div>

            {/* Total Value */}
            <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 text-xs text-slate-500 font-medium text-right">
                Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
            </div>

            {/* Droppable Area */}
            <div
                ref={setNodeRef}
                className="flex-1 bg-slate-50/50 p-2 space-y-2 overflow-y-auto rounded-b-lg border-x border-b border-slate-200"
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
                    <div className="h-full flex items-center justify-center text-slate-300 text-xs italic border-2 border-dashed border-slate-200 rounded-lg m-2">
                        Arraste aqui
                    </div>
                )}
            </div>
        </div>
    );
};
