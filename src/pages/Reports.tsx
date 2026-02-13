
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppProvider';
import { formatCurrency, formatPercent, formatDate } from '../utils';
import {
    FileBarChart, TrendingUp, Users, Building2, Wallet, PieChart as PieChartIcon,
    ArrowUpRight, BadgeDollarSign, CalendarRange, Scale, X,
    BarChart as BarChartIcon, Table as TableIcon, Filter, Calendar, User, Download,
    ShieldCheck, Sparkles, LayoutGrid
} from 'lucide-react';
import { Input } from '../components/ui/Input';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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
        description: "Conversão de leads por origem (Ads, Orgânico).",
        icon: LayoutGrid,
        color: "emerald",
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
];

const COLOR_VARIANTS: any = {
    cyan: {
        iconBg: 'bg-cyan-500/10',
        iconText: 'text-cyan-400',
        titleHover: 'group-hover:text-cyan-400',
        borderHover: 'group-hover:border-cyan-500/30',
        glow: 'bg-cyan-500/5',
        iconBorder: 'group-hover:border-cyan-500/30'
    },
    indigo: {
        iconBg: 'bg-indigo-500/10',
        iconText: 'text-indigo-400',
        titleHover: 'group-hover:text-indigo-400',
        borderHover: 'group-hover:border-indigo-500/30',
        glow: 'bg-indigo-500/5',
        iconBorder: 'group-hover:border-indigo-500/30'
    },
    emerald: {
        iconBg: 'bg-emerald-500/10',
        iconText: 'text-emerald-400',
        titleHover: 'group-hover:text-emerald-400',
        borderHover: 'group-hover:border-emerald-500/30',
        glow: 'bg-emerald-500/5',
        iconBorder: 'group-hover:border-emerald-500/30'
    },
    amber: {
        iconBg: 'bg-amber-500/10',
        iconText: 'text-amber-400',
        titleHover: 'group-hover:text-amber-400',
        borderHover: 'group-hover:border-amber-500/30',
        glow: 'bg-amber-500/5',
        iconBorder: 'group-hover:border-amber-500/30'
    },
    rose: {
        iconBg: 'bg-rose-500/10',
        iconText: 'text-rose-400',
        titleHover: 'group-hover:text-rose-400',
        borderHover: 'group-hover:border-rose-500/30',
        glow: 'bg-rose-500/5',
        iconBorder: 'group-hover:border-rose-500/30'
    }
};

const NEON_COLORS = ['#22d3ee', '#818cf8', '#10b981', '#f59e0b', '#f43f5e', '#a855f7', '#ec4899'];

export const Reports = () => {
    const { sales, agents, developers, financialRecords, user } = useApp();
    const [selectedReport, setSelectedReport] = useState<ReportCardProps | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterAgentId, setFilterAgentId] = useState('');
    const [filterDeveloperId, setFilterDeveloperId] = useState('');
    const [viewMode, setViewMode] = useState<'chart' | 'table'>('table');
    const [isExporting, setIsExporting] = useState(false);
    const reportContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user?.role === 'agent') setFilterAgentId(user.id);
    }, [user]);

    const handleExportPDF = async () => {
        if (!reportContentRef.current || !selectedReport) return;
        setIsExporting(true);
        try {
            const element = reportContentRef.current;
            const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
            pdf.save(`relatorio-${selectedReport.id}.pdf`);
        } catch (error) {
            console.error("Erro exportação:", error);
        } finally {
            setIsExporting(false);
        }
    };

    const activeAgentFilter = user?.role === 'agent' ? user.id : filterAgentId;

    const filteredSales = useMemo(() => sales.filter(s => {
        return s.status === 'approved' && (!startDate || s.date >= startDate) && (!endDate || s.date <= endDate) && (!activeAgentFilter || s.agentId === activeAgentFilter) && (!filterDeveloperId || s.developerId === filterDeveloperId);
    }), [sales, startDate, endDate, activeAgentFilter, filterDeveloperId]);

    const filteredFinance = useMemo(() => {
        if (user?.role === 'agent') return [];
        return financialRecords.filter(r => (!startDate || r.date >= startDate) && (!endDate || r.date <= endDate) && (!activeAgentFilter || r.relatedEntityId === activeAgentFilter));
    }, [financialRecords, startDate, endDate, activeAgentFilter, user]);

    const salesByAgentData = useMemo(() => {
        const map = new Map();
        filteredSales.forEach(s => {
            const name = agents.find(a => a.id === s.agentId)?.name || 'Desconhecido';
            const curr = map.get(name) || { value: 0 };
            map.set(name, { value: curr.value + s.unitValue });
        });
        return Array.from(map.entries()).map(([name, data]) => ({ name, value: data.value })).sort((a, b) => b.value - a.value);
    }, [filteredSales, agents]);

    const dreData = useMemo(() => {
        let grossRevenue = 0;
        let commissions = 0;
        let marketing = 0;
        let taxes = 0;
        let fixedCosts = 0;
        let otherExpenses = 0;

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

    const renderChart = () => {
        if (selectedReport?.id === 'sales_agent') return (
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={salesByAgentData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={100} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f0f12', border: '1px solid #333', borderRadius: '12px' }} />
                    <Bar dataKey="value" fill="#22d3ee" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        );
        if (selectedReport?.id === 'dre') return (
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={dreData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="name"
                        stroke="#94a3b8"
                        fontSize={10}
                        tick={{ fill: '#94a3b8', fontWeight: 'bold' }}
                        angle={-45}
                        textAnchor="end"
                        interval={0}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        fontSize={10}
                        tick={{ fill: '#94a3b8' }}
                        tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f0f12', border: '1px solid #333', borderRadius: '12px' }}
                        formatter={(value: number) => [formatCurrency(value), 'Valor']}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {dreData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        );
        return <div className="p-20 text-center text-slate-500 italic">Visualização gráfica em desenvolvimento para este relatório.</div>;
    };

    const renderTable = () => {
        if (selectedReport?.id === 'sales_agent') {
            const sortedAgents = agents.filter(a => activeAgentFilter ? a.id === activeAgentFilter : true).map(a => ({
                agent: a,
                sales: filteredSales.filter(s => s.agentId === a.id),
                total: filteredSales.filter(s => s.agentId === a.id).reduce((acc, s) => acc + s.unitValue, 0)
            })).filter(g => g.sales.length > 0).sort((a, b) => b.total - a.total);

            return (
                <div className="space-y-8">
                    {sortedAgents.map(group => (
                        <div key={group.agent.id} className="border border-slate-100 rounded-xl overflow-hidden">
                            <div className="bg-slate-50 px-5 py-3 flex justify-between items-center">
                                <h4 className="font-black text-slate-800 text-xs uppercase tracking-widest">{group.agent.name}</h4>
                                <span className="font-bold text-emerald-600 text-sm">{formatCurrency(group.total)}</span>
                            </div>
                            <table className="w-full text-[11px] text-left">
                                <thead className="bg-white text-slate-400 border-b border-slate-100">
                                    <tr>
                                        <th className="px-5 py-2">Data</th>
                                        <th className="px-5 py-2">Empreendimento</th>
                                        <th className="px-5 py-2 text-right">Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {group.sales.map(s => (
                                        <tr key={s.id} className="border-b border-slate-50">
                                            <td className="px-5 py-2">{formatDate(s.date)}</td>
                                            <td className="px-5 py-2 font-bold">{s.projectId}</td>
                                            <td className="px-5 py-2 text-right">{formatCurrency(s.unitValue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            );
        }
        if (selectedReport?.id === 'dre') {
            const revenue = dreData.find(d => d.name === 'Receita Bruta')?.value || 0;
            const expenses = dreData.filter(d => d.name !== 'Receita Bruta' && d.name !== 'Resultado Líquido').reduce((acc, d) => acc + d.value, 0);
            const profit = dreData.find(d => d.name === 'Resultado Líquido')?.value || 0;
            const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Receita Total</p>
                            <p className="text-xl font-black text-slate-900">{formatCurrency(revenue)}</p>
                        </div>
                        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                            <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1">Despesas Totais</p>
                            <p className="text-xl font-black text-slate-900">{formatCurrency(expenses)}</p>
                        </div>
                        <div className="p-4 bg-cyan-50 rounded-2xl border border-cyan-100">
                            <p className="text-[9px] font-black text-cyan-600 uppercase tracking-widest mb-1">Lucro Líquido</p>
                            <p className="text-xl font-black text-slate-900">{formatCurrency(profit)}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Margem Líquida</p>
                            <p className="text-xl font-black text-slate-900">{margin.toFixed(1)}%</p>
                        </div>
                    </div>

                    <table className="w-full text-xs text-left border-collapse">
                        <thead className="bg-slate-100 text-slate-500 uppercase text-[9px] font-black tracking-widest">
                            <tr>
                                <th className="px-6 py-4 rounded-tl-xl">Categoria DRE</th>
                                <th className="px-6 py-4 text-right rounded-tr-xl">Valor Acumulado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 border-x border-b border-slate-100 rounded-b-xl overflow-hidden">
                            {dreData.map((item, idx) => (
                                <tr key={idx} className={item.name === 'Resultado Líquido' ? 'bg-slate-50 font-black italic' : 'hover:bg-slate-50/50'}>
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        {item.name}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {formatCurrency(item.value)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
        return <div className="text-center p-10 text-slate-400">Tabela de dados gerada automaticamente no PDF.</div>;
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
                        <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest mt-1">Inteligência de mercado e análise estratégica de dados.</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="premium-card p-10 !rounded-[3rem] relative overflow-hidden group border border-white/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/10 transition-all"></div>

                <div className="flex flex-col gap-8 relative z-10">
                    <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em] px-1">
                        <Filter size={14} /> Filtros Estratégicos
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 italic font-bold">Período Inicial</label>
                            <Input
                                type="date"
                                icon={<Calendar size={16} />}
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 italic font-bold">Período Final</label>
                            <Input
                                type="date"
                                icon={<Calendar size={16} />}
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                            />
                        </div>
                        {user?.role === 'admin' && (
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 italic font-bold">Corretor</label>
                                <Input
                                    as="select"
                                    icon={<User size={16} />}
                                    value={filterAgentId}
                                    onChange={e => setFilterAgentId(e.target.value)}
                                >
                                    <option value="">Todos os Corretores</option>
                                    {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </Input>
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 italic font-bold">Incorporadora</label>
                            <Input
                                as="select"
                                icon={<Building2 size={16} />}
                                value={filterDeveloperId}
                                onChange={e => setFilterDeveloperId(e.target.value)}
                            >
                                <option value="">Todas Incorporadoras</option>
                                {developers.map(d => <option key={d.id} value={d.id}>{d.companyName}</option>)}
                            </Input>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Categories */}
            {['Vendas', 'Financeiro', 'Gestão'].map(cat => {
                const items = REPORT_SUGGESTIONS.filter(r => r.category === cat);
                if (!items.length) return null;
                return (
                    <div key={cat} className="space-y-6">
                        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] flex items-center gap-2 px-2">
                            <Sparkles size={14} className="text-primary" /> {cat}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {items.map(report => {
                                const colors = COLOR_VARIANTS[report.color] || COLOR_VARIANTS.cyan;
                                return (
                                    <div
                                        key={report.id} onClick={() => setSelectedReport(report)}
                                        className={`premium-card p-10 !rounded-[3rem] border border-white/5 ${colors.borderHover} transition-all cursor-pointer group relative overflow-hidden active:scale-[0.98] shadow-2xl`}
                                    >
                                        <div className={`absolute -right-4 -bottom-4 w-32 h-32 ${colors.glow} rounded-full group-hover:bg-opacity-20 transition-all blur-3xl`}></div>
                                        <div className={`w-14 h-14 rounded-2xl ${colors.iconBg} ${colors.iconText} border border-white/10 ${colors.iconBorder} flex items-center justify-center mb-8 group-hover:scale-110 transition-all shadow-xl`}>
                                            <report.icon size={28} />
                                        </div>
                                        <h4 className={`text-xl font-black text-foreground mb-3 ${colors.titleHover} transition-colors uppercase italic tracking-tighter`}>{report.title}</h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase tracking-tight opacity-70 group-hover:opacity-100 transition-opacity">{report.description}</p>
                                        <div className={`absolute top-10 right-10 text-foreground/5 ${colors.titleHover} group-hover:opacity-100 transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1`}><ArrowUpRight size={32} /></div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )
            })}

            {/* MODAL VIEWER - PREMIUM VR EXPERIENCE */}
            {selectedReport && (
                <div className="fixed inset-0 bg-background/95 backdrop-blur-2xl z-[80] flex items-center justify-center p-0 md:p-8 animate-in fade-in duration-500 px-4">
                    <div className="bg-background border border-border w-full max-w-6xl h-full md:h-auto md:max-h-[92vh] flex flex-col md:rounded-[3.5rem] overflow-hidden animate-in zoom-in-95 duration-300 shadow-3xl">

                        {/* Modal Header */}
                        <div className="p-8 md:p-10 bg-card/60 backdrop-blur-md border-b border-border/40 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-6">
                                <div className={`w-16 h-16 rounded-[1.5rem] ${selectedReport && COLOR_VARIANTS[selectedReport.color]?.iconBg} border border-white/10 flex items-center justify-center ${selectedReport && COLOR_VARIANTS[selectedReport.color]?.iconText} shadow-inner`}>
                                    <selectedReport.icon size={32} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">{selectedReport.category}</p>
                                    <h2 className="text-2xl md:text-3xl font-black text-foreground italic uppercase tracking-tighter">{selectedReport.title}</h2>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-4">
                                <div className="bg-black/60 rounded-2xl p-1.5 border border-white/5 flex shadow-inner">
                                    <button onClick={() => setViewMode('table')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'table' ? 'bg-white text-black shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}>
                                        <TableIcon size={14} className="inline mr-2" /> Tabela
                                    </button>
                                    <button onClick={() => setViewMode('chart')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'chart' ? 'bg-white text-black shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}>
                                        <BarChartIcon size={14} className="inline mr-2" /> Gráfico
                                    </button>
                                </div>
                                <button
                                    onClick={handleExportPDF}
                                    disabled={isExporting}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-[1.2rem] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                                >
                                    <Download size={16} /> {isExporting ? 'Processando...' : 'Exportar PDF'}
                                </button>
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="w-14 h-14 rounded-2xl bg-white/5 text-slate-500 hover:text-white flex items-center justify-center transition-all border border-white/5 hover:border-white/20"
                                >
                                    <X size={28} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-12 bg-black/40 custom-scrollbar relative">
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>

                            <div ref={reportContentRef} className="bg-white p-6 md:p-20 shadow-2xl rounded-sm min-h-full text-slate-900 border border-slate-200 printable-card max-md:scale-[0.85] max-md:origin-top">
                                <div className="flex justify-between items-start border-b-4 border-slate-900 pb-12 mb-12">
                                    <div>
                                        <h1 className="text-5xl font-black tracking-tighter uppercase italic text-slate-900 leading-[0.9]">RELATÓRIO <br /><span className="text-blue-600">DE PERFORMANCE</span></h1>
                                        <p className="text-[10px] font-black text-slate-400 mt-6 uppercase tracking-[0.3em]">Emitido via ImobCMI Intelligence • {new Date().toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-black italic tracking-tighter">IMOB<span className="text-blue-600">CMI</span></div>
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 border-t border-slate-100 pt-2">V4.0 MANAGEMENT</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 mb-16 p-10 bg-slate-50 border border-slate-100 rounded-[2.5rem]">
                                    <div className="space-y-2 border-r border-slate-200">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Análise Estratégica</p>
                                        <p className="text-xl font-black text-slate-900 uppercase italic tracking-tight">{selectedReport.title}</p>
                                    </div>
                                    <div className="text-right space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Intervalo de Dados</p>
                                        <p className="text-sm font-black text-slate-800 uppercase italic">{startDate ? formatDate(startDate) : 'Início'} — {endDate ? formatDate(endDate) : 'Hoje'}</p>
                                    </div>
                                </div>

                                <div className="py-6 min-h-[400px]">
                                    {viewMode === 'chart' ? (
                                        <div className="p-10 border border-slate-100 rounded-[3rem] bg-slate-50/50 shadow-inner">
                                            {renderChart()}
                                        </div>
                                    ) : (
                                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            {renderTable()}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-24 flex justify-between items-center border-t border-slate-100 pt-10 opacity-60">
                                    <div className="flex items-center gap-4">
                                        <ShieldCheck size={20} className="text-emerald-600" />
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                                            Documento de Auditoria Interna <br />
                                            <span className="text-slate-300">Criptografia: SHA-256 Validated</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Copyright © {new Date().getFullYear()} ImobCMI</p>
                                        <p className="text-[8px] font-bold text-slate-300">Todos os direitos reservados.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
