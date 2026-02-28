import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppProvider';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatPercent, formatDate } from '../utils';
import {
    FileBarChart, TrendingUp, Users, Building2, Wallet, PieChart as PieChartIcon,
    ArrowUpRight, BadgeDollarSign, Scale, X,
    BarChart as BarChartIcon, Table as TableIcon, Filter, Calendar, User, Download,
    ShieldCheck, Sparkles, LayoutGrid, FileSpreadsheet, FileText
} from 'lucide-react';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, ComposedChart, Legend
} from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

interface ReportCardProps {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    category: 'Vendas' | 'Financeiro' | 'Gestão';
}

const REPORT_SUGGESTIONS: ReportCardProps[] = [
    {
        id: 'sales_agent',
        title: "Vendas por Corretor",
        description: "Performance individual, unidades e VGV total.",
        icon: Users,
        color: "cyan",
        category: 'Vendas'
    },
    {
        id: 'sales_dev',
        title: "Vendas por Incorporadora",
        description: "Market share por parceiro e construtora.",
        icon: Building2,
        color: "indigo",
        category: 'Vendas'
    },
    {
        id: 'funnel',
        title: "Funil de Vendas",
        description: "Conversão: Leads > Negócios > Vendas.",
        icon: LayoutGrid,
        color: "emerald",
        category: 'Vendas'
    },
    {
        id: 'developer_ranking',
        title: "Ranking de Empreendimentos",
        description: "Performance de vendas por empreendimento.",
        icon: TrendingUp,
        color: "cyan",
        category: 'Vendas'
    },
    {
        id: 'dre',
        title: "DRE Gerencial",
        description: "Demonstrativo financeiro completo por competência.",
        icon: Scale,
        color: "amber",
        category: 'Financeiro'
    },
    {
        id: 'category_expenses',
        title: "Despesas por Categoria",
        description: "Análise de Pareto sobre custos operacionais.",
        icon: PieChartIcon,
        color: "rose",
        category: 'Financeiro'
    },
    {
        id: 'commissions',
        title: "Análise de Comissões",
        description: "Comissões a receber, recebidas e pendentes.",
        icon: BadgeDollarSign,
        color: "emerald",
        category: 'Financeiro'
    },
    {
        id: 'bank_analysis',
        title: "Análise Bancária",
        description: "Entradas e Saídas detalhadas por conta bancária.",
        icon: Wallet,
        color: "indigo",
        category: 'Financeiro'
    }
];

const COLOR_VARIANTS: any = {
    cyan: { iconBg: 'bg-cyan-500/10', iconText: 'text-cyan-400', titleHover: 'group-hover:text-cyan-400', borderHover: 'group-hover:border-cyan-500/30', glow: 'bg-cyan-500/5', iconBorder: 'group-hover:border-cyan-500/30' },
    indigo: { iconBg: 'bg-indigo-500/10', iconText: 'text-indigo-400', titleHover: 'group-hover:text-indigo-400', borderHover: 'group-hover:border-indigo-500/30', glow: 'bg-indigo-500/5', iconBorder: 'group-hover:border-indigo-500/30' },
    emerald: { iconBg: 'bg-emerald-500/10', iconText: 'text-emerald-400', titleHover: 'group-hover:text-emerald-400', borderHover: 'group-hover:border-emerald-500/30', glow: 'bg-emerald-500/5', iconBorder: 'group-hover:border-emerald-500/30' },
    amber: { iconBg: 'bg-amber-500/10', iconText: 'text-amber-400', titleHover: 'group-hover:text-amber-400', borderHover: 'group-hover:border-amber-500/30', glow: 'bg-amber-500/5', iconBorder: 'group-hover:border-amber-500/30' },
    rose: { iconBg: 'bg-rose-500/10', iconText: 'text-rose-400', titleHover: 'group-hover:text-rose-400', borderHover: 'group-hover:border-rose-500/30', glow: 'bg-rose-500/5', iconBorder: 'group-hover:border-rose-500/30' }
};

const CHART_COLORS = ['#22d3ee', '#818cf8', '#10b981', '#f59e0b', '#f43f5e', '#a855f7', '#ec4899', '#6366f1', '#14b8a6', '#f59e0b'];

export const Reports = () => {
    const { sales, agents, developers, financialRecords, user, leads, deals } = useApp();
    const { bankAccounts } = useFinance();
    const [selectedReport, setSelectedReport] = useState<ReportCardProps | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterAgentId, setFilterAgentId] = useState('');
    const [filterDeveloperId, setFilterDeveloperId] = useState('');
    const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
    const [isExporting, setIsExporting] = useState(false);
    const reportContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user?.role === 'agent') setFilterAgentId(user.id);
    }, [user]);

    // Data Filtering logic
    const activeAgentFilter = user?.role === 'agent' ? user.id : filterAgentId;

    const filteredSales = useMemo(() => sales.filter(s => {
        return s.status === 'approved' && (!startDate || s.date >= startDate) && (!endDate || s.date <= endDate) && (!activeAgentFilter || s.agentId === activeAgentFilter) && (!filterDeveloperId || s.developerId === filterDeveloperId);
    }), [sales, startDate, endDate, activeAgentFilter, filterDeveloperId]);

    const filteredFinance = useMemo(() => {
        if (user?.role === 'agent') return [];
        return financialRecords.filter(r => (!startDate || r.date >= startDate) && (!endDate || r.date <= endDate) && (!activeAgentFilter || r.relatedEntityId === activeAgentFilter));
    }, [financialRecords, startDate, endDate, activeAgentFilter, user]);

    // --- Report Specific Data Generators ---

    const salesByAgentData = useMemo(() => {
        const map = new Map();
        filteredSales.forEach(s => {
            const name = agents.find(a => a.id === s.agentId)?.name || 'Outro';
            const curr = map.get(name) || { value: 0, units: 0 };
            map.set(name, { value: curr.value + s.unitValue, units: curr.units + 1 });
        });
        return Array.from(map.entries()).map(([name, data]) => ({ name, value: data.value, units: data.units })).sort((a, b) => b.value - a.value);
    }, [filteredSales, agents]);

    const salesByDevData = useMemo(() => {
        const map = new Map();
        filteredSales.forEach(s => {
            const name = developers.find(d => d.id === s.developerId)?.companyName || 'Outra';
            const curr = map.get(name) || { value: 0, units: 0 };
            map.set(name, { value: curr.value + s.unitValue, units: curr.units + 1 });
        });
        return Array.from(map.entries()).map(([name, data]) => ({ name, value: data.value, units: data.units })).sort((a, b) => b.value - a.value);
    }, [filteredSales, developers]);

    const funnelData = useMemo(() => {
        const totalLeads = leads.filter(l => (!startDate || l.createdAt >= startDate) && (!endDate || l.createdAt <= endDate)).length;
        const totalDeals = deals.filter(d => (!startDate || d.createdAt >= startDate) && (!endDate || d.createdAt <= endDate)).length;
        const totalSales = filteredSales.length;

        return [
            { name: 'Leads Capturados', value: totalLeads },
            { name: 'Negócios Gerados', value: totalDeals },
            { name: 'Vendas Aprovadas', value: totalSales }
        ];
    }, [leads, deals, filteredSales, startDate, endDate]);

    const developerRankingData = useMemo(() => {
        const map = new Map();
        filteredSales.forEach(s => {
            const name = s.projectId || 'Não Informado';
            const dev = developers.find(d => d.id === s.developerId)?.companyName || '-';
            const key = `${name} (${dev})`;
            const curr = map.get(key) || { value: 0, units: 0, name: s.projectId || 'Não Informado', dev };
            map.set(key, { ...curr, value: curr.value + s.unitValue, units: curr.units + 1 });
        });
        return Array.from(map.values()).sort((a, b) => b.value - a.value);
    }, [filteredSales, developers]);

    const paretoData = useMemo(() => {
        const map = new Map();
        let totalExpenses = 0;
        filteredFinance.filter(r => r.type === 'expense' && r.status === 'paid').forEach(r => {
            const cat = r.category || 'Outros';
            map.set(cat, (map.get(cat) || 0) + r.amount);
            totalExpenses += r.amount;
        });

        const sorted = Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
        let cumulative = 0;
        return sorted.map(item => {
            cumulative += item.value;
            return {
                ...item,
                percent: (item.value / totalExpenses) * 100,
                cumulativePercent: (cumulative / totalExpenses) * 100
            };
        });
    }, [filteredFinance]);

    const commissionData = useMemo(() => {
        const data = agents.map(agent => {
            const agentSales = filteredSales.filter(s => s.agentId === agent.id);
            const comissaoGerada = agentSales.reduce((acc, s) => acc + s.comissaoCorretor, 0);

            const received = filteredFinance.filter(r =>
                r.type === 'expense' && r.category.toLowerCase().includes('comissão') &&
                r.relatedEntityId === agent.id && r.status === 'paid'
            ).reduce((acc, r) => acc + r.amount, 0);

            const pending = filteredFinance.filter(r =>
                r.type === 'expense' && r.category.toLowerCase().includes('comissão') &&
                r.relatedEntityId === agent.id && r.status === 'pending'
            ).reduce((acc, r) => acc + r.amount, 0);

            return {
                name: agent.name,
                gerado: comissaoGerada,
                recebido: received,
                pendente: pending,
                total: comissaoGerada
            };
        });
        return data.filter(d => d.gerado > 0 || d.recebido > 0 || d.pendente > 0).sort((a, b) => b.total - a.total);
    }, [agents, filteredSales, filteredFinance]);

    const bankAnalysisData = useMemo(() => {
        const banksMap = new Map();
        bankAccounts.forEach(b => banksMap.set(b.id, { ...b, in: 0, out: 0 }));

        filteredFinance.filter(r => r.status === 'paid' && r.bankAccountId).forEach(r => {
            const bank = banksMap.get(r.bankAccountId);
            if (bank) {
                if (r.type === 'income') bank.in += r.amount;
                else bank.out += r.amount;
            }
        });

        return Array.from(banksMap.values()).map(b => ({
            name: b.name,
            bank: b.bank_name,
            agency: b.agency,
            account: b.account_number,
            incomes: b.in,
            expenses: b.out,
            balance: b.in - b.out
        })).filter(b => b.incomes > 0 || b.expenses > 0);
    }, [filteredFinance, bankAccounts]);

    const dreData = useMemo(() => {
        let grossRevenue = 0, commissions = 0, marketing = 0, taxes = 0, fixedCosts = 0, otherExpenses = 0;

        filteredFinance.filter(r => r.status === 'paid').forEach(r => {
            if (r.type === 'income') {
                grossRevenue += r.amount;
            } else {
                const category = r.category.toLowerCase();
                if (category.includes('comissão')) commissions += r.amount;
                else if (category.includes('marketing') || category.includes('ads')) marketing += r.amount;
                else if (category.includes('imposto')) taxes += r.amount;
                else if (category.includes('fixo') || category.includes('aluguel') || category.includes('salário')) fixedCosts += r.amount;
                else otherExpenses += r.amount;
            }
        });

        const netRevenue = grossRevenue - taxes;
        const ebitda = netRevenue - commissions - marketing - fixedCosts - otherExpenses;

        return [
            { name: 'Receita Bruta', value: grossRevenue, color: '#10b981' },
            { name: 'Impostos', value: taxes, color: '#f43f5e' },
            { name: 'Comissões', value: commissions, color: '#f59e0b' },
            { name: 'Marketing', value: marketing, color: '#818cf8' },
            { name: 'Custos Fixos', value: fixedCosts, color: '#64748b' },
            { name: 'Outros', value: otherExpenses, color: '#94a3b8' },
            { name: 'Resultado Líquido', value: ebitda, color: ebitda >= 0 ? '#22d3ee' : '#ef4444' }
        ];
    }, [filteredFinance]);


    // --- EXPORTS ---

    const getReportExportData = () => {
        if (!selectedReport) return [];
        switch (selectedReport.id) {
            case 'sales_agent':
                return salesByAgentData.map(d => ({ 'Corretor': d.name, 'Unidades': d.units, 'VGV': d.value, 'VGV Formatado': formatCurrency(d.value) }));
            case 'sales_dev':
                return salesByDevData.map(d => ({ 'Incorporadora': d.name, 'Unidades': d.units, 'VGV': d.value, 'VGV Formatado': formatCurrency(d.value) }));
            case 'funnel':
                return funnelData.map(d => ({ 'Estágio': d.name, 'Volume': d.value }));
            case 'developer_ranking':
                return developerRankingData.map((d, i) => ({ 'Rank': i + 1, 'Empreendimento': d.name, 'Incorporadora': d.dev, 'Unidades': d.units, 'VGV': d.value, 'VGV Formatado': formatCurrency(d.value) }));
            case 'dre':
                return dreData.map(d => ({ 'Categoria DRE': d.name, 'Valor': d.value, 'Valor Formatado': formatCurrency(d.value) }));
            case 'category_expenses':
                return paretoData.map(d => ({ 'Categoria': d.name, 'Despesa': d.value, 'Despesa Formatada': formatCurrency(d.value), 'Percentual (%)': d.percent.toFixed(2), 'Acumulado (%)': d.cumulativePercent.toFixed(2) }));
            case 'commissions':
                return commissionData.map(d => ({ 'Corretor': d.name, 'Comissão Gerada': d.gerado, 'Comissão Recebida': d.recebido, 'Comissão Pendente': d.pendente }));
            case 'bank_analysis':
                return bankAnalysisData.map(d => ({ 'Conta CMI': d.name, 'Banco': d.bank, 'Agência/Conta': `${d.agency} - ${d.account}`, 'Entradas': d.incomes, 'Saídas': d.expenses, 'Saldo': d.balance }));
            default:
                return [];
        }
    };

    const hasValidDataForExport = (data: any[]) => {
        if (!data || data.length === 0) return false;
        // Se todas as colunas numéricas de todas as linhas forem 0, consideramos vazio.
        return data.some(row => Object.values(row).some(val => typeof val === 'number' && val !== 0));
    };

    const handleExportExcel = () => {
        const data = getReportExportData();
        if (!hasValidDataForExport(data)) {
            toast.error("Sem dados para exportar no período.");
            return;
        }
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório");
        const fileName = `${selectedReport?.id}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    const handleExportCSV = () => {
        const data = getReportExportData();
        if (!hasValidDataForExport(data)) {
            toast.error("Sem dados para exportar no período.");
            return;
        }
        const worksheet = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });

        const fileName = `${selectedReport?.id}_${new Date().toISOString().split('T')[0]}.csv`;
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = fileName; // <- fix proper download filename
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }, 100);
    };

    const handleExportPDF = async () => {
        if (!reportContentRef.current || !selectedReport) return;
        const data = getReportExportData();
        if (!hasValidDataForExport(data)) {
            toast.error("Sem dados para exportar no período.");
            return;
        }

        setIsExporting(true);
        try {
            const canvas = await html2canvas(reportContentRef.current, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
            pdf.save(`relatorio_${selectedReport.id}.pdf`);
        } catch (error) {
            toast.error("Erro na exportação PDF.");
        } finally {
            setIsExporting(false);
        }
    };

    // --- RENDERERS ---

    const renderCustomTooltip = (props: any, formatAsCurrency = true) => {
        if (!props.active || !props.payload) return null;
        return (
            <div className="bg-[#0f0f12] border border-[#333] rounded-xl p-3 shadow-xl">
                <p className="font-bold text-white mb-2">{props.label}</p>
                {props.payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-[11px]">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                        <span className="text-slate-400 capitalize">{entry.name}:</span>
                        <span className="text-white font-bold ml-auto">
                            {formatAsCurrency ? formatCurrency(entry.value) : entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    const renderChart = () => {
        switch (selectedReport?.id) {
            case 'sales_agent':
            case 'sales_dev':
                const salesData = selectedReport.id === 'sales_agent' ? salesByAgentData : salesByDevData;
                return (
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={salesData} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={120} />
                            <Tooltip content={p => renderCustomTooltip(p, true)} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                            <Bar dataKey="value" name="VGV" fill="#22d3ee" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'funnel':
                return (
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={funnelData} margin={{ left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                            <YAxis stroke="#94a3b8" fontSize={11} />
                            <Tooltip content={p => renderCustomTooltip(p, false)} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                            <Bar dataKey="value" name="Volume" fill="#10b981" radius={[4, 4, 0, 0]} barSize={60}>
                                {funnelData.map((e, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'developer_ranking':
                return (
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={developerRankingData.slice(0, 10)} margin={{ left: 20, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} angle={-30} textAnchor="end" />
                            <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(val) => `R$${(val / 1000000).toFixed(1)}M`} />
                            <Tooltip content={p => renderCustomTooltip(p, true)} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                            <Bar dataKey="value" name="VGV Gerado" fill="#818cf8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'dre':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={dreData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tick={{ fill: '#94a3b8', fontWeight: 'bold' }} angle={-45} textAnchor="end" interval={0} />
                            <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`} />
                            <Tooltip content={p => renderCustomTooltip(p, true)} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {dreData.map((e, index) => <Cell key={`cell-${index}`} fill={e.color} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'category_expenses':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <ComposedChart data={paretoData} margin={{ top: 20, right: 60, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} angle={-45} textAnchor="end" interval={0} />
                            <YAxis yAxisId="left" stroke="#94a3b8" fontSize={10} tickFormatter={v => `R$ ${(v / 1000).toFixed(0)}k`} />
                            <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" fontSize={10} tickFormatter={v => `${v}%`} domain={[0, 100]} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f0f12', border: '1px solid #333' }} />
                            <Bar yAxisId="left" dataKey="value" name="Valor Gasto" fill="#64748b" radius={[4, 4, 0, 0]} />
                            <Line yAxisId="right" type="monotone" dataKey="cumulativePercent" name="% Acumulado" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                );
            case 'commissions':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={commissionData} margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                            <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`} />
                            <Tooltip content={p => renderCustomTooltip(p, true)} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                            <Legend />
                            <Bar dataKey="recebido" name="Recebida" fill="#10b981" radius={[0, 0, 0, 0]} stackId="a" />
                            <Bar dataKey="pendente" name="Pendente" fill="#f59e0b" radius={[4, 4, 0, 0]} stackId="a" />
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'bank_analysis':
                return (
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={bankAnalysisData} margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                            <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`} />
                            <Tooltip content={p => renderCustomTooltip(p, true)} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                            <Legend />
                            <Bar dataKey="incomes" name="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expenses" name="Saídas" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                );
            default:
                return <div className="p-20 text-center text-slate-500 italic">Visualização gráfica não disponível para este relatório.</div>;
        }
    };

    const renderTable = () => {
        const _commonHead = (headers: string[]) => (
            <thead className="bg-slate-100 text-slate-500 uppercase text-[9px] font-black tracking-widest">
                <tr>
                    {headers.map((h, i) => <th key={i} className={`px-6 py-4 ${i === 0 ? 'rounded-tl-xl' : ''} ${i === headers.length - 1 ? 'text-right rounded-tr-xl' : ''}`}>{h}</th>)}
                </tr>
            </thead>
        );

        const data = getReportExportData();

        if (selectedReport?.id === 'dre') {
            const revenue = dreData.find(d => d.name === 'Receita Bruta')?.value || 0;
            const expenses = dreData.filter(d => d.name !== 'Receita Bruta' && d.name !== 'Resultado Líquido').reduce((acc, d) => acc + d.value, 0);
            const profit = dreData.find(d => d.name === 'Resultado Líquido')?.value || 0;
            const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {/* Indicadores do DRE */}
                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100"><p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Receita Total</p><p className="text-xl font-black text-slate-900">{formatCurrency(revenue)}</p></div>
                        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100"><p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1">Despesas Totais</p><p className="text-xl font-black text-slate-900">{formatCurrency(expenses)}</p></div>
                        <div className="p-4 bg-cyan-50 rounded-2xl border border-cyan-100"><p className="text-[9px] font-black text-cyan-600 uppercase tracking-widest mb-1">Lucro Líquido</p><p className="text-xl font-black text-slate-900">{formatCurrency(profit)}</p></div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200"><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Margem Líquida</p><p className="text-xl font-black text-slate-900">{margin.toFixed(1)}%</p></div>
                    </div>
                    <table className="w-full text-xs text-left border-collapse">
                        {_commonHead(['Categoria DRE', 'Valor Acumulado'])}
                        <tbody className="divide-y divide-slate-100 border-x border-b border-slate-100 rounded-b-xl overflow-hidden">
                            {dreData.map((item, idx) => (
                                <tr key={idx} className={item.name === 'Resultado Líquido' ? 'bg-slate-50 font-black italic' : 'hover:bg-slate-50/50'}>
                                    <td className="px-6 py-4 flex items-center gap-3"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>{item.name}</td>
                                    <td className="px-6 py-4 text-right">{formatCurrency(item.value)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        if (data.length === 0) return <div className="text-center p-10 text-slate-400">Nenhum dado encontrado para o período/filtros selecionados.</div>;

        const headers = Object.keys(data[0]);
        // filter out unwanted columns from table view if needed, but for simplicity we render all or selected
        return (
            <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                    {_commonHead(headers)}
                    <tbody className="divide-y divide-slate-100 border-x border-b border-slate-100 rounded-b-xl overflow-hidden">
                        {data.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                                {headers.map((h, cellIdx) => (
                                    <td key={cellIdx} className={`px-6 py-4 ${cellIdx === headers.length - 1 ? 'text-right font-bold' : ''}`}>
                                        {String(row[h])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 transform -rotate-2">
                        <FileBarChart size={28} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase italic">Insights <span className="text-primary">CMI</span></h1>
                        <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest mt-1">Inteligência de mercado e análise de negócios.</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="premium-card p-10 !rounded-[3rem] relative overflow-hidden group border border-white/10">
                <div className="flex flex-col gap-8 relative z-10">
                    <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em] px-1">
                        <Filter size={14} /> Filtros Globais
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 italic">Período Inicial</label>
                            <Input type="date" icon={<Calendar size={16} />} value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 italic">Período Final</label>
                            <Input type="date" icon={<Calendar size={16} />} value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                        {user?.role === 'admin' && (
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 italic">Corretor</label>
                                <Input as="select" icon={<User size={16} />} value={filterAgentId} onChange={e => setFilterAgentId(e.target.value)}>
                                    <option value="">Todos</option>
                                    {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </Input>
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 italic">Incorporadora</label>
                            <Input as="select" icon={<Building2 size={16} />} value={filterDeveloperId} onChange={e => setFilterDeveloperId(e.target.value)}>
                                <option value="">Todas</option>
                                {developers.map(d => <option key={d.id} value={d.id}>{d.companyName}</option>)}
                            </Input>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Categories */}
            {['Vendas', 'Financeiro'].map(cat => {
                const items = REPORT_SUGGESTIONS.filter(r => r.category === cat);
                if (!items.length) return null;
                return (
                    <div key={cat} className="space-y-6">
                        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] flex items-center gap-2 px-2">
                            <Sparkles size={14} className="text-primary" /> {cat}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {items.map(report => {
                                const colors = COLOR_VARIANTS[report.color] || COLOR_VARIANTS.cyan;
                                return (
                                    <div
                                        key={report.id} onClick={() => setSelectedReport(report)}
                                        className={`premium-card p-8 !rounded-[2rem] border border-white/5 ${colors.borderHover} transition-all cursor-pointer group relative overflow-hidden active:scale-[0.98] shadow-2xl flex flex-col justify-between`}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl ${colors.iconBg} ${colors.iconText} border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-all shadow-xl`}>
                                            <report.icon size={24} />
                                        </div>
                                        <div>
                                            <h4 className={`text-lg font-black text-foreground mb-2 ${colors.titleHover} transition-colors uppercase italic tracking-tighter`}>{report.title}</h4>
                                            <p className="text-[10px] text-muted-foreground leading-relaxed font-bold uppercase tracking-tight opacity-70 group-hover:opacity-100 transition-opacity">{report.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )
            })}

            {/* MODAL VIEWER */}
            {selectedReport && (
                <div className="fixed inset-0 bg-background/95 backdrop-blur-2xl z-[80] flex items-center justify-center p-0 md:p-8 animate-in fade-in duration-500 px-4">
                    <div className="bg-background border border-border w-full max-w-6xl h-full md:h-auto md:max-h-[92vh] flex flex-col md:rounded-[3.5rem] overflow-hidden animate-in zoom-in-95 duration-300 shadow-3xl">

                        {/* Modal Header */}
                        <div className="p-6 md:p-8 bg-card/60 backdrop-blur-md border-b border-border/40 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-6">
                                <div className={`w-14 h-14 rounded-2xl ${COLOR_VARIANTS[selectedReport.color]?.iconBg} border border-white/10 flex items-center justify-center ${COLOR_VARIANTS[selectedReport.color]?.iconText}`}>
                                    <selectedReport.icon size={28} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">{selectedReport.category}</p>
                                    <h2 className="text-2xl md:text-3xl font-black text-foreground italic uppercase tracking-tighter">{selectedReport.title}</h2>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-3">
                                <div className="bg-black/60 rounded-xl p-1.5 border border-white/5 flex shadow-inner">
                                    <button onClick={() => setViewMode('table')} className={`px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'table' ? 'bg-white text-black shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}>
                                        <TableIcon size={14} className="inline mr-2" /> Tabela
                                    </button>
                                    <button onClick={() => setViewMode('chart')} className={`px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'chart' ? 'bg-white text-black shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}>
                                        <BarChartIcon size={14} className="inline mr-2" /> Gráfico
                                    </button>
                                </div>
                                <div className="h-8 w-px bg-white/10 mx-2"></div>
                                <button onClick={handleExportPDF} disabled={isExporting} title="Exportar PDF" className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all">
                                    <FileText size={20} />
                                </button>
                                <button onClick={handleExportExcel} title="Exportar Excel" className="w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all">
                                    <FileSpreadsheet size={20} />
                                </button>
                                <button onClick={handleExportCSV} title="Exportar CSV" className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-500 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-all">
                                    <Download size={20} />
                                </button>
                                <button onClick={() => setSelectedReport(null)} className="ml-2 w-12 h-12 rounded-xl bg-white/5 text-slate-500 hover:text-white hover:bg-red-500/20 flex items-center justify-center transition-all">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-12 bg-black/40 custom-scrollbar relative">
                            <div ref={reportContentRef} className="bg-white p-6 md:p-16 shadow-2xl rounded-xl min-h-full text-slate-900 border border-slate-200 printable-card max-md:scale-[0.85] max-md:origin-top">
                                <div className="flex justify-between items-start border-b-4 border-slate-900 pb-10 mb-10">
                                    <div>
                                        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-slate-900 leading-[0.9]">{selectedReport.title}</h1>
                                        <p className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-[0.3em]">Gerado em {new Date().toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black italic tracking-tighter">IMOB<span className="text-blue-600">CMI</span></div>
                                    </div>
                                </div>

                                <div className="py-2 min-h-[400px]">
                                    {viewMode === 'chart' ? (
                                        <div className="p-8 border border-slate-100 rounded-[2rem] bg-slate-50/50 shadow-inner">
                                            {renderChart()}
                                        </div>
                                    ) : (
                                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            {renderTable()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
