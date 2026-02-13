import React from 'react';
import { Sale, Agent, Client, Developer } from '../../types';
import { formatDate, formatCurrency } from '../../utils';
import { FileText, FileDown, Building2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface ReceiptModalProps {
    sale: Sale | null;
    onClose: () => void;
    agents: Agent[];
    clients: Client[];
    developers: Developer[];
    onExport: () => void;
    isExporting: boolean;
    receiptRef: React.RefObject<HTMLDivElement>;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
    sale,
    onClose,
    agents,
    clients,
    developers,
    onExport,
    isExporting,
    receiptRef
}) => {
    if (!sale) return null;

    const agent = agents.find(a => a.id === sale.agentId);
    const client = clients.find(c => c.id === sale.clientId);
    const developer = developers.find(d => d.id === sale.developerId);

    const splitRatio = sale.agentSplitPercent / 100;
    const grossAgentShare = sale.grossCommission * splitRatio;
    const proportionalTax = sale.taxValue * splitRatio;
    const proportionalMisc = sale.miscExpensesValue * splitRatio;
    const totalDiscounts = proportionalTax + proportionalMisc;
    const netReceived = grossAgentShare - totalDiscounts;
    const today = new Date().toISOString().split('T')[0];

    return (
        <Modal
            isOpen={!!sale}
            onClose={onClose}
            title="Visualização do Recibo"
            maxWidth="max-w-5xl"
        >
            <div className="flex justify-end mb-4">
                <Button
                    onClick={onExport}
                    loading={isExporting}
                    icon={FileDown}
                >
                    {isExporting ? 'Processando...' : 'Baixar PDF'}
                </Button>
            </div>

            <div className="flex-1 overflow-auto bg-[#050505] p-4 flex justify-center custom-scrollbar rounded-2xl">
                {/* White background paper for PDF generation */}
                <div
                    ref={receiptRef}
                    className="bg-white p-12 md:p-16 flex flex-col font-sans text-slate-800 relative shadow-2xl"
                    style={{ width: '800px', minWidth: '800px', minHeight: '900px' }}
                >
                    <div className="flex justify-between items-start mb-16 border-b border-slate-100 pb-8">
                        <div>
                            <h1 className="text-3xl font-serif text-slate-900 tracking-wide mb-1 font-bold">CRM CMI</h1>
                            <p className="text-xs uppercase tracking-[0.3em] text-cyan-600 font-semibold">Imóveis Exclusivos</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-1">Recibo de Pagamento</h2>
                            <p className="text-slate-900 font-mono text-sm">#{sale.id.substring(0, 8).toUpperCase()}</p>
                            <p className="text-slate-500 text-sm mt-1">{formatDate(today)}</p>
                        </div>
                    </div>

                    <div className="mb-16 text-center">
                        <p className="text-xs uppercase tracking-widest text-slate-400 mb-4 font-medium">Valor Líquido Recebido</p>
                        <h1 className="text-6xl font-light text-slate-900 tracking-tight">{formatCurrency(netReceived)}</h1>
                        <div className="w-16 h-1 bg-cyan-500 mx-auto mt-6 rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-12 mb-16">
                        <div className="space-y-6">
                            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 border-b border-slate-100 pb-2">Detalhes da Transação</h3>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Unidade / Empreendimento</p>
                                <p className="text-lg text-slate-900 font-medium">{sale.unit} - {sale.projectId}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Incorporadora / Cliente</p>
                                <p className="text-base text-slate-800">{developer?.companyName}</p>
                                <p className="text-sm text-slate-500">{client?.name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Valor Venda</p>
                                <p className="text-base text-slate-800 font-mono">{formatCurrency(sale.unitValue)}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 border-b border-slate-100 pb-2">Beneficiário (Corretor)</h3>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-serif font-bold text-slate-700">
                                    {agent?.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-lg text-slate-900 font-medium">{agent?.name}</p>
                                    <p className="text-sm text-slate-500">CPF: {agent?.cpf}</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-lg space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Comissão Bruta (Proporcional)</span>
                                    <span className="text-slate-900 font-medium">{formatCurrency(grossAgentShare)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Dedução Impostos</span>
                                    <span className="text-red-500 font-medium text-xs">({formatCurrency(proportionalTax)})</span>
                                </div>
                                {proportionalMisc > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Outros Descontos</span>
                                        <span className="text-red-500 font-medium text-xs">({formatCurrency(proportionalMisc)})</span>
                                    </div>
                                )}
                                <div className="border-t border-slate-200 pt-3 mt-1 flex justify-between items-center">
                                    <span className="text-slate-800 font-bold text-sm">Total Líquido</span>
                                    <span className="text-slate-900 font-bold text-lg">{formatCurrency(netReceived)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-12 border-t border-slate-100">
                        <p className="text-slate-500 text-sm leading-relaxed mb-12 italic">
                            "Declaro que recebi a importância líquida acima descrita, referente aos serviços de intermediação imobiliária prestados para a venda da unidade mencionada. Dou plena e geral quitação, nada mais tendo a reclamar a qualquer título."
                        </p>
                        <div className="flex justify-between items-end">
                            <div className="text-center">
                                <div className="w-64 border-b border-slate-300 mb-2"></div>
                                <p className="text-xs uppercase font-bold text-slate-900">{agent?.name}</p>
                                <p className="text-[10px] text-slate-400">Assinatura do Corretor</p>
                            </div>
                            <div className="text-center">
                                <div className="w-64 border-b border-slate-300 mb-2"></div>
                                <p className="text-xs uppercase font-bold text-slate-900">CRM CMI</p>
                                <p className="text-[10px] text-slate-400">Departamento Financeiro</p>
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-8 right-8 opacity-5 pointer-events-none">
                        <Building2 size={120} />
                    </div>
                </div>
            </div>
        </Modal>
    );
};
