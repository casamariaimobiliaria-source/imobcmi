
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppProvider';
import { formatCurrency, formatPercent, formatDate } from '../utils';
import { supabase } from '../supabaseClient';
import {
    FileBarChart, TrendingUp, Users, Building2, Wallet, PieChart,
    ArrowUpRight, BadgeDollarSign, CalendarRange, Scale, X,
    BarChart as BarChartIcon, Table as TableIcon, Filter, Calendar, User, Download
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart as RePieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ReportCardProps {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    colorClass: string;
    category: 'Vendas' | 'Financeiro' | 'Gestão';
}

const REPORT_SUGGESTIONS: ReportCardProps[] = [
    // VENDAS
    {
        id: 'sales_period',
        title: "Evolução de Vendas",
        description: "Acompanhamento do volume de vendas ao longo do tempo.",
        icon: TrendingUp,
        colorClass: "bg-green-100 text-green-600",
        category: 'Vendas'
    },
    {
        id: 'sales_agent',
        title: "Vendas por Corretor",
        description: "Detalhamento de vendas, unidades e VGV por corretor.",
        icon: Users,
        colorClass: "bg-blue-100 text-blue-600",
        category: 'Vendas'
    },
    {
        id: 'sales_project',
        title: "Vendas por Empreendimento",
        description: "Performance de vendas por empreendimento.",
        icon: Building2,
        colorClass: "bg-purple-100 text-purple-600",
        category: 'Vendas'
    },
    {
        id: 'sales_dev',
        title: "Vendas por Incorporadora",
        description: "Detalhamento de vendas por parceiro/construtora.",
        icon: Building2,
        colorClass: "bg-indigo-100 text-indigo-600",
        category: 'Vendas'
    },
    {
        id: 'funnel',
        title: "Funil de Vendas (Origem)",
        description: "Performance de vendas por origem do lead (Instagram, Google, etc).",
        icon: FilterIcon,
        colorClass: "bg-sky-100 text-sky-600",
        category: 'Vendas'
    },
    // FINANCEIRO
    {
        id: 'commissions',
        title: "Relatório de Comissões",
        description: "Detalhamento de comissões geradas, pagas e a receber.",
        icon: BadgeDollarSign,
        colorClass: "bg-yellow-100 text-yellow-600",
        category: 'Financeiro'
    },
    {
        id: 'dre',
        title: "DRE Gerencial Detalhado",
        description: "Demonstrativo completo com competência (Mês/Ano).",
        icon: Scale,
        colorClass: "bg-emerald-100 text-emerald-600",
        category: 'Financeiro'
    },
    {
        id: 'category_expenses',
        title: "Despesas por Categoria",
        description: "Onde o dinheiro está sendo gasto (Marketing, Aluguel, etc).",
        icon: PieChart,
        colorClass: "bg-orange-100 text-orange-600",
        category: 'Financeiro'
    },
];

function FilterIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg> }

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#f43f5e', '#6366f1'];

export const Reports = () => {
    const { sales, agents, developers, financialRecords, user } = useApp();
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedReport, setSelectedReport] = useState<ReportCardProps | null>(null);

    // Filters State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterAgentId, setFilterAgentId] = useState('');
    const [filterDeveloperId, setFilterDeveloperId] = useState('');

    // View State (Chart vs Table)
    const [viewMode, setViewMode] = useState<'chart' | 'table'>('table'); // Default to table for printing usually

    // Export State
    const [isExporting, setIsExporting] = useState(false);
    const reportContentRef = useRef<HTMLDivElement>(null);

    // Initialize filter for agent if logged in as agent
    useEffect(() => {
        if (user?.role === 'agent') {
            setFilterAgentId(user.id);
        }
    }, [user]);

    // Fetch Projects for mapping
    useEffect(() => {
        const fetchProjects = async () => {
            const { data } = await supabase.from('projects').select('id, name');
            if (data) setProjects(data);
        };
        fetchProjects();
    }, []);

    // --- EXPORT FUNCTION ---
    const handleExportPDF = async () => {
        if (!reportContentRef.current || !selectedReport) return;
        setIsExporting(true);

        try {
            // Capture the content
            const element = reportContentRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

            // Add image to PDF (Fit Width)
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
            pdf.save(`relatorio-${selectedReport.id}-${new Date().toISOString().split('T')[0]}.pdf`);

        } catch (error) {
            console.error("Erro ao exportar:", error);
            alert("Ocorreu um erro ao gerar o PDF. Tente novamente.");
        } finally {
            setIsExporting(false);
        }
    };

    // --- FILTER LOGIC ---
    const activeAgentFilter = user?.role === 'agent' ? user.id : filterAgentId;

    const filteredSales = useMemo(() => {
        return sales.filter(s => {
            const isApproved = s.status === 'approved';
            const afterStart = startDate ? s.date >= startDate : true;
            const beforeEnd = endDate ? s.date <= endDate : true;
            const matchAgent = activeAgentFilter ? s.agentId === activeAgentFilter : true;
            const matchDev = filterDeveloperId ? s.developerId === filterDeveloperId : true;

            return isApproved && afterStart && beforeEnd && matchAgent && matchDev;
        });
    }, [sales, startDate, endDate, activeAgentFilter, filterDeveloperId]);

    const filteredFinance = useMemo(() => {
        // Agents generally shouldn't see full DRE or Company Expenses, but if they access, show nothing or only their own commissions
        if (user?.role === 'agent') return [];

        return financialRecords.filter(r => {
            const afterStart = startDate ? r.date >= startDate : true;
            const beforeEnd = endDate ? r.date <= endDate : true;
            const matchAgent = activeAgentFilter ? (r.relatedEntityId === activeAgentFilter) : true;
            return afterStart && beforeEnd && matchAgent;
        });
    }, [financialRecords, startDate, endDate, activeAgentFilter, user]);

    // --- REPORT DATA CALCULATORS (CHARTS) ---
    const salesByAgentData = useMemo(() => {
        const map = new Map<string, { value: number, count: number }>();
        filteredSales.forEach(s => {
            const agentName = agents.find(a => a.id === s.agentId)?.name || 'Desconhecido';
            const current = map.get(agentName) || { value: 0, count: 0 };
            map.set(agentName, { value: current.value + s.unitValue, count: current.count + 1 });
        });
        return Array.from(map.entries())
            .map(([name, data]) => ({ name, value: data.value, count: data.count }))
            .sort((a, b) => b.value - a.value);
    }, [filteredSales, agents]);

    const salesByDevData = useMemo(() => {
        const map = new Map<string, { value: number, count: number }>();
        filteredSales.forEach(s => {
            const devName = developers.find(d => d.id === s.developerId)?.companyName || 'Desconhecida';
            const current = map.get(devName) || { value: 0, count: 0 };
            map.set(devName, { value: current.value + s.unitValue, count: current.count + 1 });
        });
        return Array.from(map.entries())
            .map(([name, data]) => ({ name, value: data.value, count: data.count }))
            .sort((a, b) => b.value - a.value);
    }, [filteredSales, developers]);

    const salesBySourceData = useMemo(() => {
        const map = new Map<string, number>();
        filteredSales.forEach(s => {
            const source = s.leadSource || 'Indefinido';
            map.set(source, (map.get(source) || 0) + 1);
        });
        return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [filteredSales]);

    const financialSummaryData = useMemo(() => {
        let income = 0; let expense = 0;
        filteredFinance.forEach(r => {
            if (r.status === 'paid') {
                if (r.type === 'income') income += r.amount;
                else expense += r.amount;
            }
        });
        return [
            { name: 'Receitas (Realizadas)', value: income },
            { name: 'Despesas (Pagas)', value: expense },
            { name: 'Resultado', value: income - expense }
        ];
    }, [filteredFinance]);

    const expensesByCategoryData = useMemo(() => {
        const map = new Map<string, number>();
        filteredFinance.filter(r => r.type === 'expense' && r.status === 'paid').forEach(r => {
            map.set(r.category, (map.get(r.category) || 0) + r.amount);
        });
        return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [filteredFinance]);

    // --- NEW REPORTS DATA ---

    const salesByPeriodData = useMemo(() => {
        const map = new Map<string, number>();
        // Sort by date asc
        const sortedSales = [...filteredSales].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        sortedSales.forEach(s => {
            // Group by Month/Year (e.g., "Jan/2024")
            const date = new Date(s.date);
            const key = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
            map.set(key, (map.get(key) || 0) + s.unitValue);
        });

        return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
    }, [filteredSales]);

    const salesByProjectData = useMemo(() => {
        const map = new Map<string, { value: number, count: number }>();
        filteredSales.forEach(s => {
            const project = projects.find(p => p.id === s.projectId);
            const name = project ? project.name : (s.projectId || 'N/A');
            const current = map.get(name) || { value: 0, count: 0 };
            map.set(name, { value: current.value + s.unitValue, count: current.count + 1 });
        });
        return Array.from(map.entries())
            .map(([name, data]) => ({ name, value: data.value, count: data.count }))
            .sort((a, b) => b.value - a.value);
    }, [filteredSales, projects]);

    const commissionsData = useMemo(() => {
        // Group by Agent
        const map = new Map<string, { generated: number, paid: number, toReceive: number }>();

        // Initialize with all agents (or filtered)
        const targetAgents = activeAgentFilter ? agents.filter(a => a.id === activeAgentFilter) : agents;
        targetAgents.forEach(a => map.set(a.name, { generated: 0, paid: 0, toReceive: 0 }));

        // Add Generated
        filteredSales.forEach(s => {
            const agent = agents.find(a => a.id === s.agentId);
            if (agent && map.has(agent.name)) {
                const curr = map.get(agent.name)!;
                curr.generated += s.agentCommission;
                // Simple calculation for toReceive based on this period's sales (might not be accurate for historical debt, but good for period report)
                // For a true "To Receive" report, we should look at the agent's global balance, but here we are reporting on the PERIOD.
                // So let's define: Generated in Period, Paid in Period.
            }
        });

        // Add Paid
        filteredFinance.filter(r => r.type === 'expense' && r.status === 'paid' && r.category === 'Comissão').forEach(r => {
            const agent = agents.find(a => a.id === r.relatedEntityId);
            if (agent && map.has(agent.name)) {
                const curr = map.get(agent.name)!;
                curr.paid += r.amount;
            }
        });

        return Array.from(map.entries()).map(([name, data]) => ({
            name,
            generated: data.generated,
            paid: data.paid,
            balance: data.generated - data.paid // Net for the period
        })).filter(d => d.generated > 0 || d.paid > 0).sort((a, b) => b.generated - a.generated);
    }, [filteredSales, filteredFinance, agents, activeAgentFilter]);

    // Filter available reports based on role
    const allowedReports = useMemo(() => {
        if (user?.role === 'agent') {
            return REPORT_SUGGESTIONS.filter(r => r.category === 'Vendas');
        }
        return REPORT_SUGGESTIONS;
    }, [user]);

    const renderReportChart = () => {
        if (!selectedReport) return null;
        switch (selectedReport.id) {
            case 'sales_period':
                return (
                    <div className="h-96 w-full"><ResponsiveContainer><LineChart data={salesByPeriodData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis tickFormatter={(val) => `R$${val / 1000}k`} /><Tooltip formatter={(val: number) => formatCurrency(val)} /><Legend /><Line type="monotone" dataKey="value" name="Vendas" stroke="#10b981" activeDot={{ r: 8 }} strokeWidth={2} /></LineChart></ResponsiveContainer></div>
                );
            case 'sales_agent':
                return (
                    <div className="h-96 w-full"><ResponsiveContainer><BarChart data={salesByAgentData} layout="vertical" margin={{ left: 20 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" tickFormatter={(val) => `R$${val / 1000}k`} /><YAxis dataKey="name" type="category" width={120} style={{ fontSize: '11px', fontWeight: 500 }} /><Tooltip formatter={(val: number) => formatCurrency(val)} /><Bar dataKey="value" name="VGV Total" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} /></BarChart></ResponsiveContainer></div>
                );
            case 'sales_project':
                return (
                    <div className="h-96 w-full"><ResponsiveContainer><BarChart data={salesByProjectData} layout="vertical" margin={{ left: 20 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" tickFormatter={(val) => `R$${val / 1000}k`} /><YAxis dataKey="name" type="category" width={120} style={{ fontSize: '11px', fontWeight: 500 }} /><Tooltip formatter={(val: number) => formatCurrency(val)} /><Bar dataKey="value" name="VGV Total" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} /></BarChart></ResponsiveContainer></div>
                );
            case 'sales_dev':
                return (
                    <div className="h-96 w-full"><ResponsiveContainer><BarChart data={salesByDevData} margin={{ bottom: 20 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" style={{ fontSize: '11px' }} interval={0} /><YAxis tickFormatter={(val) => `R$${val / 1000}k`} /><Tooltip formatter={(val: number) => formatCurrency(val)} /><Bar dataKey="value" name="VGV Total" fill="#6366f1" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
                );
            case 'funnel':
                return (
                    <div className="h-96 w-full flex flex-col items-center"><ResponsiveContainer><RePieChart><Pie data={salesBySourceData} cx="50%" cy="50%" outerRadius={120} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>{salesBySourceData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip /><Legend /></RePieChart></ResponsiveContainer></div>
                );
            case 'commissions':
                return (
                    <div className="h-96 w-full"><ResponsiveContainer><BarChart data={commissionsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis tickFormatter={(val) => `R$${val / 1000}k`} /><Tooltip formatter={(val: number) => formatCurrency(val)} /><Legend /><Bar dataKey="generated" name="Gerado" fill="#10b981" /><Bar dataKey="paid" name="Pago" fill="#3b82f6" /></BarChart></ResponsiveContainer></div>
                );
            case 'dre':
                const dreData = financialSummaryData.filter(d => d.name !== 'Resultado');
                return (
                    <div className="h-96 w-full flex flex-col items-center"><ResponsiveContainer><BarChart data={dreData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip formatter={(val: number) => formatCurrency(val)} /><Bar dataKey="value" fill="#10b981">{dreData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.name.includes('Receitas') ? '#10b981' : '#ef4444'} />))}</Bar></BarChart></ResponsiveContainer></div>
                );
            case 'category_expenses':
                return (
                    <div className="h-96 w-full"><ResponsiveContainer><RePieChart><Pie data={expensesByCategoryData} cx="50%" cy="50%" outerRadius={120} fill="#8884d8" dataKey="value" label={({ name }) => name}>{expensesByCategoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip formatter={(val: number) => formatCurrency(val)} /><Legend /></RePieChart></ResponsiveContainer></div>
                );
            default: return <div className="p-10 text-center text-slate-400">Dados do relatório não disponíveis na visualização gráfica.</div>;
        }
    };

    // --- RENDER CONTENT (TABLE) ---
    const renderReportTable = () => {
        if (!selectedReport) return null;

        switch (selectedReport.id) {
            case 'sales_agent':
                // Group sales by Agent
                const groupedByAgent = (activeAgentFilter ? agents.filter(a => a.id === activeAgentFilter) : agents).map(agent => {
                    const agentSales = filteredSales.filter(s => s.agentId === agent.id);
                    // Sort sales by date desc inside the agent group
                    agentSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                    return {
                        agent,
                        sales: agentSales,
                        total: agentSales.reduce((acc, s) => acc + s.unitValue, 0)
                    };
                }).filter(g => g.sales.length > 0).sort((a, b) => b.total - a.total);

                return (
                    <div className="space-y-6">
                        {groupedByAgent.map((group) => (
                            <div key={group.agent.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden break-inside-avoid">
                                <div className="bg-slate-50 px-4 py-3 flex justify-between items-center border-b border-slate-200">
                                    <h4 className="font-bold text-slate-700 flex items-center gap-2">
                                        <Users size={16} className="text-blue-500" />
                                        {group.agent.name}
                                    </h4>
                                    <span className="text-sm font-bold text-slate-800 bg-white px-2 py-1 rounded border border-slate-200">
                                        Total VGV: {formatCurrency(group.total)}
                                    </span>
                                </div>
                                <div className="overflow-auto">
                                    <table className="w-full text-xs text-left min-w-[600px]">
                                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                                            <tr>
                                                <th className="px-4 py-2 font-medium">Data</th>
                                                <th className="px-4 py-2 font-medium">Empreendimento</th>
                                                <th className="px-4 py-2 font-medium">Unidade</th>
                                                <th className="px-4 py-2 font-medium text-right">Valor Venda</th>
                                                <th className="px-4 py-2 font-medium text-right">Comissão</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {group.sales.map(sale => {
                                                const project = projects.find(p => p.id === sale.projectId);
                                                return (
                                                    <tr key={sale.id} className="hover:bg-slate-50">
                                                        <td className="px-4 py-1.5 text-slate-600">{formatDate(sale.date)}</td>
                                                        <td className="px-4 py-1.5 font-medium text-slate-700">{project ? project.name : sale.projectId}</td>
                                                        <td className="px-4 py-1.5 text-slate-600">{sale.unit}</td>
                                                        <td className="px-4 py-1.5 text-right font-medium text-slate-600">{formatCurrency(sale.unitValue)}</td>
                                                        <td className="px-4 py-1.5 text-right font-medium text-emerald-600">
                                                            {formatCurrency(user?.role === 'agent' ? sale.agentCommission : sale.grossCommission)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                        {groupedByAgent.length === 0 && <div className="text-center p-8 text-slate-400">Nenhuma venda encontrada para o filtro selecionado.</div>}
                    </div>
                );

            case 'sales_period':
                return (
                    <div className="overflow-auto">
                        <table className="w-full text-sm min-w-[400px]">
                            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                                <tr>
                                    <th className="p-3 text-left">Período</th>
                                    <th className="p-3 text-right">Volume de Vendas</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {salesByPeriodData.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50">
                                        <td className="p-3 font-medium text-slate-700">{item.name}</td>
                                        <td className="p-3 text-right font-bold text-emerald-600">{formatCurrency(item.value)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );

            case 'sales_project':
                return (
                    <div className="overflow-auto">
                        <table className="w-full text-sm min-w-[400px]">
                            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                                <tr>
                                    <th className="p-3 text-left">Empreendimento</th>
                                    <th className="p-3 text-right">Qtd Vendas</th>
                                    <th className="p-3 text-right">Volume Total (VGV)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {salesByProjectData.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50">
                                        <td className="p-3 font-medium text-slate-700">{item.name}</td>
                                        <td className="p-3 text-right">{item.count}</td>
                                        <td className="p-3 text-right font-bold text-blue-600">{formatCurrency(item.value)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );

            case 'commissions':
                return (
                    <div className="overflow-auto">
                        <table className="w-full text-sm min-w-[500px]">
                            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                                <tr>
                                    <th className="p-3 text-left">Corretor</th>
                                    <th className="p-3 text-right">Gerado (Vendas)</th>
                                    <th className="p-3 text-right">Pago (Financeiro)</th>
                                    <th className="p-3 text-right">Saldo Período</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {commissionsData.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50">
                                        <td className="p-3 font-medium text-slate-700">{item.name}</td>
                                        <td className="p-3 text-right text-emerald-600">{formatCurrency(item.generated)}</td>
                                        <td className="p-3 text-right text-blue-600">{formatCurrency(item.paid)}</td>
                                        <td className={`p-3 text-right font-bold ${item.balance > 0 ? 'text-amber-600' : 'text-slate-400'}`}>{formatCurrency(item.balance)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );

            case 'sales_dev':
                const developersList = filterDeveloperId ? developers.filter(d => d.id === filterDeveloperId) : developers;
                const groupedByDev = developersList.map(dev => {
                    const devSales = filteredSales.filter(s => s.developerId === dev.id);
                    // Sort sales by date desc inside the developer group
                    devSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                    return {
                        dev,
                        sales: devSales,
                        total: devSales.reduce((acc, s) => acc + s.unitValue, 0)
                    };
                }).filter(g => g.sales.length > 0).sort((a, b) => b.total - a.total);

                return (
                    <div className="space-y-6">
                        {groupedByDev.map((group) => (
                            <div key={group.dev.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden break-inside-avoid">
                                <div className="bg-slate-50 px-4 py-3 flex justify-between items-center border-b border-slate-200">
                                    <h4 className="font-bold text-slate-700 flex items-center gap-2">
                                        <Building2 size={16} className="text-indigo-500" />
                                        {group.dev.companyName}
                                    </h4>
                                    <span className="text-sm font-bold text-slate-800 bg-white px-2 py-1 rounded border border-slate-200">
                                        Total VGV: {formatCurrency(group.total)}
                                    </span>
                                </div>
                                <div className="overflow-auto">
                                    <table className="w-full text-xs text-left min-w-[600px]">
                                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                                            <tr>
                                                <th className="px-4 py-2 font-medium">Data</th>
                                                <th className="px-4 py-2 font-medium">Corretor</th>
                                                <th className="px-4 py-2 font-medium">Empreendimento</th>
                                                <th className="px-4 py-2 font-medium">Unidade</th>
                                                <th className="px-4 py-2 font-medium text-right">Valor Venda</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {group.sales.map(sale => {
                                                const agentName = agents.find(a => a.id === sale.agentId)?.name || '-';
                                                return (
                                                    <tr key={sale.id} className="hover:bg-slate-50">
                                                        <td className="px-4 py-1.5 text-slate-600">{formatDate(sale.date)}</td>
                                                        <td className="px-4 py-1.5 text-slate-600">{agentName}</td>
                                                        <td className="px-4 py-1.5 font-medium text-slate-700">{projects.find(p => p.id === sale.projectId)?.name || sale.projectId}</td>
                                                        <td className="px-4 py-1.5 text-slate-600">{sale.unit}</td>
                                                        <td className="px-4 py-1.5 text-right font-medium text-emerald-600">{formatCurrency(sale.unitValue)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                        {groupedByDev.length === 0 && <div className="text-center p-8 text-slate-400">Nenhuma venda encontrada para o filtro selecionado.</div>}
                    </div>
                );

            case 'funnel':
                const totalFunnel = salesBySourceData.reduce((acc, curr) => acc + curr.value, 0);
                return (
                    <div className="overflow-auto">
                        <table className="w-full text-sm min-w-[300px]">
                            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                                <tr>
                                    <th className="p-3 text-left">Origem</th>
                                    <th className="p-3 text-right">Qtd Vendas</th>
                                    <th className="p-3 text-right">% Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {salesBySourceData.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50">
                                        <td className="p-3 font-medium text-slate-700">{item.name}</td>
                                        <td className="p-3 text-right">{item.value}</td>
                                        <td className="p-3 text-right text-slate-500">{formatPercent((item.value / totalFunnel) * 100)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );

            case 'dre':
                const dreIncomes = filteredFinance.filter(r => r.type === 'income' && r.status === 'paid');
                const dreExpenses = filteredFinance.filter(r => r.type === 'expense' && r.status === 'paid');
                const incomeByCat = new Map<string, number>(); dreIncomes.forEach(r => incomeByCat.set(r.category, (incomeByCat.get(r.category) || 0) + r.amount));
                const incomeTotal = dreIncomes.reduce((acc, r) => acc + r.amount, 0);
                const expenseByCat = new Map<string, number>(); dreExpenses.forEach(r => expenseByCat.set(r.category, (expenseByCat.get(r.category) || 0) + r.amount));
                const expenseTotal = dreExpenses.reduce((acc, r) => acc + r.amount, 0);
                const netResult = incomeTotal - expenseTotal;
                const allDreRecords = [...dreIncomes, ...dreExpenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                return (
                    <div className="space-y-8">
                        <div className="border border-slate-200 rounded-lg overflow-hidden break-inside-avoid">
                            <div className="overflow-auto">
                                <table className="w-full text-sm border-b border-slate-200 min-w-[400px]">
                                    <tbody className="divide-y divide-slate-100">
                                        <tr className="bg-emerald-50"><td colSpan={2} className="px-4 py-2 font-bold text-emerald-800 uppercase text-xs">Receitas Operacionais</td></tr>
                                        {Array.from(incomeByCat.entries()).map(([cat, val]) => (
                                            <tr key={cat} className="hover:bg-slate-50"><td className="px-4 py-2 text-slate-700">{cat}</td><td className="px-4 py-2 text-right text-emerald-600 font-medium">{formatCurrency(val)}</td></tr>
                                        ))}
                                        <tr className="bg-slate-50 font-bold"><td className="px-4 py-2 text-slate-800 text-right">Total Receitas:</td><td className="px-4 py-2 text-right text-emerald-700">{formatCurrency(incomeTotal)}</td></tr>

                                        <tr className="bg-red-50"><td colSpan={2} className="px-4 py-2 font-bold text-red-800 uppercase text-xs border-t border-red-100">Despesas Operacionais</td></tr>
                                        {Array.from(expenseByCat.entries()).map(([cat, val]) => (
                                            <tr key={cat} className="hover:bg-slate-50"><td className="px-4 py-2 text-slate-700">{cat}</td><td className="px-4 py-2 text-right text-red-600 font-medium">{formatCurrency(val)}</td></tr>
                                        ))}
                                        <tr className="bg-slate-50 font-bold"><td className="px-4 py-2 text-slate-800 text-right">Total Despesas:</td><td className="px-4 py-2 text-right text-red-700">{formatCurrency(expenseTotal)}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="bg-slate-100 px-4 py-3 flex justify-between items-center">
                                <h4 className="font-bold text-slate-800 uppercase text-base">Resultado</h4>
                                <span className={`text-lg font-bold ${netResult >= 0 ? 'text-blue-700' : 'text-red-600'}`}>{formatCurrency(netResult)}</span>
                            </div>
                        </div>

                        <div className="break-before-auto">
                            <h4 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">Detalhamento</h4>
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <div className="overflow-auto">
                                    <table className="w-full text-xs text-left min-w-[500px]">
                                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                            <tr>
                                                <th className="px-4 py-2">Mês/Ano</th>
                                                <th className="px-4 py-2">Descrição</th>
                                                <th className="px-4 py-2">Categoria</th>
                                                <th className="px-4 py-2 text-right">Valor</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {allDreRecords.map(r => {
                                                const monthYear = new Date(r.date).toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });
                                                return (
                                                    <tr key={r.id} className="hover:bg-slate-50">
                                                        <td className="px-4 py-2 text-slate-600 font-medium">{monthYear}</td>
                                                        <td className="px-4 py-2 text-slate-800">{r.description}</td>
                                                        <td className="px-4 py-2 text-slate-500">{r.category}</td>
                                                        <td className={`px-4 py-2 text-right font-medium ${r.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                            {r.type === 'expense' ? '-' : ''}{formatCurrency(r.amount)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'category_expenses':
                const totalExp = expensesByCategoryData.reduce((acc, curr) => acc + curr.value, 0);
                return (
                    <div className="overflow-auto">
                        <table className="w-full text-sm min-w-[400px]">
                            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                                <tr>
                                    <th className="p-3 text-left">Categoria</th>
                                    <th className="p-3 text-right">Valor Total</th>
                                    <th className="p-3 text-right">% Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {expensesByCategoryData.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50">
                                        <td className="p-3 font-medium text-slate-700">{item.name}</td>
                                        <td className="p-3 text-right font-bold text-red-600">{formatCurrency(item.value)}</td>
                                        <td className="p-3 text-right text-slate-500">{formatPercent((item.value / totalExp) * 100)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            default: return <div className="p-10 text-center text-slate-400">Tabela não disponível.</div>;
        }
    }

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <FileBarChart className="text-blue-600" />
                        Central de Relatórios
                    </h1>
                    <p className="text-slate-500">Indicadores estratégicos e operacionais.</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-600 font-semibold text-sm">
                        <Filter size={18} />
                        Filtros:
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input type="date" className="pl-8 pr-2 py-1.5 rounded-md border border-slate-300 text-sm focus:border-blue-500 outline-none" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <span className="text-slate-400">-</span>
                        <div className="relative">
                            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input type="date" className="pl-8 pr-2 py-1.5 rounded-md border border-slate-300 text-sm focus:border-blue-500 outline-none" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                    </div>

                    {user?.role === 'admin' && (
                        <div className="relative">
                            <User className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <select className="pl-8 pr-2 py-1.5 rounded-md border border-slate-300 text-sm focus:border-blue-500 outline-none bg-white min-w-[150px]" value={filterAgentId} onChange={(e) => setFilterAgentId(e.target.value)}>
                                <option value="">Todos Corretores</option>
                                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                    )}

                    <div className="relative">
                        <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <select className="pl-8 pr-2 py-1.5 rounded-md border border-slate-300 text-sm focus:border-blue-500 outline-none bg-white min-w-[150px]" value={filterDeveloperId} onChange={(e) => setFilterDeveloperId(e.target.value)}>
                            <option value="">Todas Incorporadoras</option>
                            {developers.map(d => <option key={d.id} value={d.id}>{d.companyName}</option>)}
                        </select>
                    </div>

                    {(startDate || endDate || (user?.role === 'admin' && filterAgentId) || filterDeveloperId) && (
                        <button onClick={() => { setStartDate(''); setEndDate(''); setFilterAgentId(''); setFilterDeveloperId(''); }} className="text-xs text-red-500 hover:text-red-700 font-medium underline">Limpar Filtros</button>
                    )}
                </div>
            </div>

            {['Vendas', 'Financeiro', 'Gestão'].map((category) => {
                const categoryReports = allowedReports.filter(r => r.category === category);
                if (categoryReports.length === 0) return null;

                return (
                    <div key={category}>
                        <h3 className="text-lg font-bold text-slate-700 mb-4 border-l-4 border-blue-600 pl-3 uppercase tracking-wide">{category}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categoryReports.map((report) => (
                                <div key={report.id} onClick={() => { setSelectedReport(report); setViewMode('table'); }} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-blue-300 relative overflow-hidden">
                                    <div className={`w-12 h-12 rounded-lg ${report.colorClass} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}><report.icon size={24} /></div>
                                    <h4 className="font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{report.title}</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed">{report.description}</p>
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowUpRight className="text-blue-400" size={20} /></div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* REPORT VIEWER MODAL */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${selectedReport.colorClass}`}><selectedReport.icon size={24} /></div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">{selectedReport.title}</h2>
                                    <p className="text-sm text-slate-500">{startDate || endDate || activeAgentFilter || filterDeveloperId ? <span>Filtros Ativos</span> : 'Período Completo'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex bg-slate-200 p-1 rounded-lg">
                                    <button onClick={() => setViewMode('table')} className={`p-2 rounded-md transition-all flex items-center gap-2 text-sm font-medium ${viewMode === 'table' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}><TableIcon size={16} /> <span className="hidden sm:inline">Relatório</span></button>
                                    <button onClick={() => setViewMode('chart')} className={`p-2 rounded-md transition-all flex items-center gap-2 text-sm font-medium ${viewMode === 'chart' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}><BarChartIcon size={16} /> <span className="hidden sm:inline">Gráfico</span></button>
                                </div>

                                <div className="h-8 w-px bg-slate-200 mx-2"></div>

                                <button
                                    onClick={handleExportPDF}
                                    disabled={isExporting}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition-colors shadow-sm ${isExporting ? 'opacity-50 cursor-wait' : ''}`}
                                    title="Exportar PDF"
                                >
                                    <Download size={18} />
                                    <span className="hidden sm:inline">{isExporting ? 'Gerando...' : 'Exportar PDF'}</span>
                                </button>

                                <button onClick={() => setSelectedReport(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-8">
                            {/* WRAPPER FOR PDF EXPORT */}
                            <div ref={reportContentRef} className="min-h-full bg-white p-8 shadow-sm border border-slate-100 max-w-4xl mx-auto">
                                <div className="mb-8 pb-4 border-b border-slate-100 flex justify-between items-end">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800">{selectedReport.title}</h2>
                                        <p className="text-sm text-slate-500 mt-1">Gerado em {new Date().toLocaleDateString()} às {new Date().toLocaleTimeString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">ImobCMI</p>
                                    </div>
                                </div>

                                {viewMode === 'chart' ? renderReportChart() : renderReportTable()}

                                <div className="mt-12 pt-4 border-t border-slate-100 flex justify-between text-[10px] text-slate-400 uppercase tracking-wider">
                                    <span>Sistema de Gestão Imobiliária</span>
                                    <span>Relatório Confidencial</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
