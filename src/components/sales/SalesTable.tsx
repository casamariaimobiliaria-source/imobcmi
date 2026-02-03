import React from 'react';
import { Sale, Agent, User } from '../../types';
import { formatDate, formatCurrency } from '../../utils';
import { Eye, Pencil, Trash2, FileText } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface SalesTableProps {
    sales: Sale[];
    agents: Agent[];
    user: User | null;
    onEdit: (sale: Sale) => void;
    onDelete: (id: string) => void;
    onReceipt: (sale: Sale) => void;
}

export const SalesTable: React.FC<SalesTableProps> = ({
    sales,
    agents,
    user,
    onEdit,
    onDelete,
    onReceipt
}) => {
    const getStatusVariant = (status: string): any => {
        if (status === 'approved') return 'success';
        if (status === 'pending') return 'warning';
        if (status === 'cancelled') return 'error';
        return 'neutral';
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            approved: 'Aprovada',
            pending: 'Pendente',
            cancelled: 'Cancelada'
        };
        return labels[status] || status;
    };

    return (
        <div className="overflow-auto flex-1 custom-scrollbar">
            <table className="w-full text-left text-sm min-w-[1000px]">
                <thead className="bg-slate-100 dark:bg-[#0f0f12] border-b border-slate-200 dark:border-white/10 sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] !text-black dark:!text-slate-500 italic">Data</th>
                        <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] !text-black dark:!text-slate-500 italic">Unidade/Projeto</th>
                        <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] !text-black dark:!text-slate-500 italic">Corretor</th>
                        <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] !text-black dark:!text-slate-500 italic">Venda</th>
                        {user?.role === 'admin' && <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] !text-black dark:!text-slate-500 italic">Bruto</th>}
                        {user?.role === 'admin' && <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] !text-black dark:!text-slate-500 italic text-center">Split</th>}
                        <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] !text-black dark:!text-slate-500 italic">{user?.role === 'agent' ? 'Minha Comissão' : 'Líquido Imob.'}</th>
                        <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] !text-black dark:!text-slate-500 italic">Status</th>
                        <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] !text-black dark:!text-slate-500 italic text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {sales.map(sale => {
                        const agent = agents.find(a => a.id === sale.agentId);
                        return (
                            <tr key={sale.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">{formatDate(sale.date)}</td>
                                <td className="px-6 py-4">
                                    <p className="font-medium text-slate-800 dark:text-slate-200">{sale.unit}</p>
                                    <p className="text-xs text-slate-500">{sale.projectId}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-cyan-900/50 text-xs flex items-center justify-center font-bold text-cyan-400 border border-cyan-500/20">
                                            {agent?.name.charAt(0)}
                                        </div>
                                        <span className="text-slate-700 dark:text-slate-300">{agent?.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-300 whitespace-nowrap">{formatCurrency(sale.unitValue)}</td>

                                {user?.role === 'admin' && <td className="px-6 py-4 text-slate-600 dark:text-slate-500 whitespace-nowrap">{formatCurrency(sale.grossCommission)}</td>}
                                {user?.role === 'admin' && (
                                    <td className="px-6 py-4 text-center">
                                        <span className="bg-white/5 px-2 py-1 rounded text-xs font-bold text-slate-400 border border-white/10">
                                            {sale.agentSplitPercent}% / {100 - sale.agentSplitPercent}%
                                        </span>
                                    </td>
                                )}

                                <td className="px-6 py-4 font-bold text-emerald-400 whitespace-nowrap drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                                    {user?.role === 'agent' ? formatCurrency(sale.agentCommission) : formatCurrency(sale.agencyCommission)}
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant={getStatusVariant(sale.status)}>
                                        {getStatusLabel(sale.status)}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" onClick={() => onReceipt(sale)} title="Gerar Recibo" className="!p-1.5 h-auto">
                                            <FileText size={16} />
                                        </Button>

                                        {user?.role === 'admin' ? (
                                            <>
                                                <Button variant="ghost" onClick={() => onEdit(sale)} title="Editar" className="!p-1.5 h-auto hover:text-blue-400">
                                                    <Pencil size={16} />
                                                </Button>
                                                <Button variant="ghost" onClick={() => onDelete(sale.id)} title="Excluir" className="!p-1.5 h-auto hover:text-red-400">
                                                    <Trash2 size={16} />
                                                </Button>
                                            </>
                                        ) : (
                                            <Button variant="ghost" onClick={() => onEdit(sale)} title="Visualizar Detalhes" className="!p-1.5 h-auto hover:text-blue-400">
                                                <Eye size={16} />
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    {sales.length === 0 && (
                        <tr><td colSpan={9} className="text-center py-10 text-slate-500 italic uppercase text-[10px] tracking-widest">Nenhuma venda encontrada.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
