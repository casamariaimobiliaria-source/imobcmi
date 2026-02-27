
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppProvider';
import { formatCurrency, formatDate } from '../utils';
import {
    TrendingUp, Users, DollarSign, Wallet, Building2,
    Calendar, Clock, ChevronRight, Trello, PieChart as PieChartIcon,
    Medal, FileBarChart, Filter
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie, LabelList
} from 'recharts';
import { Link } from 'react-router-dom';
import { aiService } from '../services/aiService';
import { toast } from 'sonner';
import { Sparkles, BrainCircuit, Activity, Zap, TrendingDown as TrendingDownIcon, Plus } from 'lucide-react';

const COLORS = ['#22d3ee', '#818cf8', '#10b981', '#f59e0b', '#f43f5e', '#a855f7', '#ec4899'];
const getDynamicPrimary = () => getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#22d3ee';

export const Dashboard = () => {
    const { sales, agents, developers, financialRecords, user, events, deals, leads } = useApp();
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedDeveloper, setSelectedDeveloper] = useState('');
    const [selectedAgent, setSelectedAgent] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [financeAnalysis, setFinanceAnalysis] = useState<any>(null);
    const [strategicBriefing, setStrategicBriefing] = useState<string | null>(null);
    const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);

    const handleGenerateBriefing = async () => {
        setIsGeneratingBriefing(true);
        try {
            const context = {
                salesCount: filteredSales.length,
                totalRevenue: totalSales,
                leadsCount: leads.length,
                activeDeals: deals.length,
                growth: momStats.growth
            };
            const briefing = await aiService.getStrategicBriefing(context);
            setStrategicBriefing(briefing);
            toast.success('Briefing estratégico atualizado!');
        } catch (error) {
            toast.error('Erro ao gerar briefing.');
        } finally {
            setIsGeneratingBriefing(false);
        }
    };


    const filteredSales = useMemo(() => {
        return sales.filter(s => {
            const saleDate = new Date(s.date);
            const matchesYear = saleDate.getFullYear().toString() === selectedYear;
            const matchesMonth = selectedMonth ? (saleDate.getMonth() + 1).toString() === selectedMonth : true;
            const matchesDev = selectedDeveloper ? s.developerId === selectedDeveloper : true;
            const matchesAgent = user?.role === 'agent' ? s.agentId === user.id : (selectedAgent ? s.agentId === selectedAgent : true);
            return s.status === 'approved' && matchesYear && matchesMonth && matchesDev && matchesAgent;
        });
    }, [sales, selectedYear, selectedMonth, selectedDeveloper, selectedAgent, user]);

    const totalSales = filteredSales.reduce((acc, s) => acc + (s.unitValue || 0), 0);
    const totalGrossCommission = filteredSales.reduce((acc, s) => acc + (s.grossCommission || 0), 0);
    const totalAgencyRevenue = filteredSales.reduce((acc, s) => acc + (s.agencyCommission || 0), 0);
    const totalAgentCommission = filteredSales.reduce((acc, s) => acc + (s.agentCommission || 0), 0);

    const agentStats = useMemo(() => {
        if (user?.role !== 'agent') return null;
        const mySales = sales.filter(s => s.agentId === user.id && s.status === 'approved');
        const myPayments = financialRecords.filter(r => r.type === 'expense' && r.category === 'Commision Payment' && r.relatedEntityId === user.id && r.status === 'paid');

        return {
            earnedInPeriod: filteredSales.reduce((acc, s) => acc + s.agentCommission, 0),
            paidInPeriod: myPayments.reduce((acc, p) => acc + p.amount, 0),
            toReceive: mySales.reduce((acc, s) => acc + s.agentCommission, 0) - myPayments.reduce((acc, p) => acc + p.amount, 0)
        };
    }, [filteredSales, sales, financialRecords, user]);

    const momStats = useMemo(() => {
        const currentDate = new Date();
        const year = parseInt(selectedYear);
        const month = selectedMonth ? parseInt(selectedMonth) : currentDate.getMonth() + 1;

        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;

        const currentMonthSales = sales.filter(s => {
            const d = new Date(s.date);
            return s.status === 'approved' && d.getFullYear() === year && (d.getMonth() + 1) === month;
        });

        const prevMonthSales = sales.filter(s => {
            const d = new Date(s.date);
            return s.status === 'approved' && d.getFullYear() === prevYear && (d.getMonth() + 1) === prevMonth;
        });

        const currentTotal = currentMonthSales.reduce((acc, s) => acc + s.unitValue, 0);
        const prevTotal = prevMonthSales.reduce((acc, s) => acc + s.unitValue, 0);

        const growth = prevTotal === 0 ? 100 : ((currentTotal - prevTotal) / prevTotal) * 100;

        return { currentTotal, prevTotal, growth };
    }, [sales, selectedYear, selectedMonth]);

    const funnelData = useMemo(() => {
        // Filtrar por organização e filtros de tempo se aplicável
        // Aqui usamos o estado geral para o Dashboard consolidado
        const leadCount = leads.length;
        const contactCount = deals.filter(d => d.stage === 'contact').length;
        const visitCount = deals.filter(d => d.stage === 'visit').length;
        const proposalCount = deals.filter(d => d.stage === 'proposal').length;
        const negotiationCount = deals.filter(d => d.stage === 'negotiation').length;
        const closedCount = sales.length; // Ou deals.filter(d => d.stage === 'closed_won').length;

        return [
            { name: 'Leads', value: leadCount, color: getDynamicPrimary() },
            { name: 'Contatos', value: contactCount, color: '#818cf8' },
            { name: 'Visitas', value: visitCount, color: '#a855f7' },
            { name: 'Propostas', value: proposalCount, color: '#f59e0b' },
            { name: 'Negociação', value: negotiationCount, color: '#f43f5e' },
            { name: 'Vendas', value: closedCount, color: '#10b981' },
        ];
    }, [leads, deals, sales]);

    const cashFlowData = useMemo(() => {
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return months.map((month, i) => {
            const monthInc = financialRecords.filter(r => r.type === 'income' && new Date(r.date).getMonth() === i).reduce((acc, r) => acc + r.amount, 0);
            const monthExp = financialRecords.filter(r => r.type === 'expense' && new Date(r.date).getMonth() === i).reduce((acc, r) => acc + r.amount, 0);

            // Forecast: Propostas e Negociações no Pipeline (considerando % de fechamento?)
            // Para simplificar, vamos projetar 20% do volume de Negociações para o mês atual/próximo
            const forecast = deals
                .filter(d => (d.stage === 'negotiation' || d.stage === 'proposal') && new Date(d.created_at).getMonth() === i)
                .reduce((acc, d) => acc + (d.value * 0.1), 0); // 10% probability forecast

            return {
                name: month,
                receitas: monthInc,
                despesas: monthExp,
                projeção: monthInc - monthExp + forecast,
                forecast
            };
        });
    }, [financialRecords, deals]);

    const developerRanking = useMemo(() => {
        const rankingMap = new Map();
        filteredSales.forEach(s => {
            const dev = developers.find(d => d.id === s.developerId);
            const name = dev ? dev.companyName : 'Outros';
            rankingMap.set(name, (rankingMap.get(name) || 0) + s.unitValue);
        });
        return Array.from(rankingMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [filteredSales, developers]);

    const agentRanking = useMemo(() => {
        const rankingMap = new Map();
        filteredSales.forEach(s => {
            const agent = agents.find(a => a.id === s.agentId);
            const name = agent ? agent.name : 'Desconhecido';
            rankingMap.set(name, (rankingMap.get(name) || 0) + s.unitValue);
        });
        return Array.from(rankingMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [filteredSales, agents]);

    const chartData = useMemo(() => {
        if (selectedMonth) {
            const daysInMonth = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate();
            return Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const daySales = filteredSales.filter(s => new Date(s.date).getDate() === day);
                return {
                    name: day.toString(),
                    vendas: daySales.reduce((acc, s) => acc + (s.unitValue || 0), 0),
                    comissaoBruta: daySales.reduce((acc, s) => acc + (s.grossCommission || 0), 0),
                    comissaoImob: daySales.reduce((acc, s) => acc + (s.agencyCommission || 0), 0),
                    comissaoCorretor: daySales.reduce((acc, s) => acc + (s.agentCommission || 0), 0),
                };
            });
        } else {
            const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            return months.map((month, i) => {
                const monthSales = filteredSales.filter(s => new Date(s.date).getMonth() === i);
                return {
                    name: month,
                    vendas: monthSales.reduce((acc, s) => acc + (s.unitValue || 0), 0),
                    comissaoBruta: monthSales.reduce((acc, s) => acc + (s.grossCommission || 0), 0),
                    comissaoImob: monthSales.reduce((acc, s) => acc + (s.agencyCommission || 0), 0),
                    comissaoCorretor: monthSales.reduce((acc, s) => acc + (s.agentCommission || 0), 0),
                };
            });
        }
    }, [filteredSales, selectedYear, selectedMonth]);

    const monthlyFinancialData = useMemo(() => {
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return months.map((month, i) => {
            const monthSales = sales.filter(s => {
                const d = new Date(s.date);
                return d.getMonth() === i && d.getFullYear().toString() === selectedYear;
            });
            return {
                name: month,
                revenue: monthSales.reduce((acc, s) => acc + (s.agencyCommission || 0), 0),
                expense: financialRecords.filter(r => {
                    const d = new Date(r.dueDate);
                    return r.type === 'expense' && d.getMonth() === i && d.getFullYear().toString() === selectedYear;
                }).reduce((acc, r) => acc + (r.amount || 0), 0)
            };
        });
    }, [sales, financialRecords, selectedYear]);

    const handleAIFinancialAnalysis = async () => {
        if (user?.role !== 'admin') {
            toast.error('Apenas administradores podem realizar diagnóstico financeiro.');
            return;
        }

        setIsAnalyzing(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const summary = {
                totalSales,
                totalGrossCommission,
                totalAgencyRevenue,
                totalAgentCommission,
                cashFlowSummary: cashFlowData.slice(-3), // Últimos 3 meses
                accountsStatus: {
                    toPay: financialRecords.filter(r => r.type === 'expense' && r.status === 'pending').reduce((acc, r) => acc + r.amount, 0),
                    toReceive: financialRecords.filter(r => r.type === 'income' && r.status === 'pending').reduce((acc, r) => acc + r.amount, 0),
                    overdue: financialRecords.filter(r => r.status === 'pending' && r.dueDate < today).reduce((acc, r) => acc + r.amount, 0)
                }
            };

            const result = await aiService.getFinancialAnalysis(summary);
            setFinanceAnalysis(result);
            toast.success('Diagnóstico Financeiro concluído!');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const agentSalesByDeveloper = useMemo(() => {
        if (user?.role !== 'agent') return [];
        const mySales = sales.filter(s => s.agentId === user.id && s.status === 'approved');
        const map = new Map();
        mySales.forEach(s => {
            const devName = developers.find(d => d.id === s.developerId)?.companyName || 'Outras';
            map.set(devName, (map.get(devName) || 0) + s.unitValue);
        });
        return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
    }, [user, sales, developers]);

    const agentSalesBySource = useMemo(() => {
        if (user?.role !== 'agent') return [];
        const mySales = sales.filter(s => s.agentId === user.id && s.status === 'approved');
        const map = new Map();
        mySales.forEach(s => {
            const source = s.leadSource || 'Indicação';
            map.set(source, (map.get(source) || 0) + s.unitValue);
        });
        return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
    }, [user, sales]);

    const agentSalesByStatus = useMemo(() => {
        if (user?.role !== 'agent') return [];
        const allSales = sales.filter(s => s.agentId === user?.id);
        return [
            { name: 'Aprovada', value: allSales.filter(s => s.status === 'approved').reduce((acc, s) => acc + s.unitValue, 0) },
            { name: 'Pendente', value: allSales.filter(s => s.status === 'pending').reduce((acc, s) => acc + s.unitValue, 0) },
            { name: 'Cancelada', value: allSales.filter(s => s.status === 'rejected').reduce((acc, s) => acc + s.unitValue, 0) }
        ];
    }, [user, sales]);

    const agentChartData = useMemo(() => {
        if (user?.role !== 'agent') return null;

        const commissionHistory = chartData.map(d => ({
            name: d.name,
            gerado: d.comissaoCorretor,
            recebido: financialRecords.filter(r =>
                r.type === 'expense' &&
                r.category === 'Commision Payment' &&
                r.relatedEntityId === user.id &&
                r.status === 'paid' &&
                (selectedMonth ? new Date(r.date).getDate().toString() === d.name : new Date(r.date).getMonth() === chartData.indexOf(d))
            ).reduce((acc, p) => acc + p.amount, 0)
        }));

        return { byDeveloper: agentSalesByDeveloper, bySource: agentSalesBySource, byStatus: agentSalesByStatus, commissionHistory };
    }, [user, agentSalesByDeveloper, agentSalesBySource, agentSalesByStatus, financialRecords, chartData, selectedMonth]);

    const upcomingEvents = useMemo(() => {
        const now = new Date();
        return events
            .filter(e => new Date(e.start_time) >= now)
            .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
            .slice(0, 5);
    }, [events]);

    const pipelineStats = useMemo(() => {
        // Mock or derive from actual deals if they existed in context
        return {
            count: 0,
            value: 0,
            byStage: {} as Record<string, number>
        };
    }, []);

    const filteredAgentPayments = useMemo(() => {
        if (user?.role !== 'agent') return [];
        return financialRecords.filter(r =>
            r.type === 'expense' &&
            r.category === 'Commision Payment' &&
            r.relatedEntityId === user.id &&
            r.status === 'paid' &&
            new Date(r.date).getFullYear().toString() === selectedYear &&
            (!selectedMonth || (new Date(r.date).getMonth() + 1).toString() === selectedMonth)
        );
    }, [financialRecords, user, selectedYear, selectedMonth]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass-thick p-6 !rounded-[1.5rem] !border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-300 min-w-[200px]">
                    <p className="text-foreground font-black mb-4 border-b border-white/10 pb-3 text-[10px] uppercase tracking-[0.2em] italic">
                        {selectedMonth ? `Dia ${label}` : label}
                    </p>
                    <div className="space-y-2">
                        {payload.map((entry: any, index: number) => (
                            <div key={index} className="flex justify-between items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.stroke || entry.fill }} />
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{entry.name}:</span>
                                </div>
                                <span className="font-black text-[11px] italic" style={{ color: entry.stroke || entry.fill }}>
                                    {formatCurrency(entry.value)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-1000">

            {/* AI Strategic Briefing Section */}
            <div className={`premium-card p-1 text-white overflow-hidden relative group transition-all duration-700 ${strategicBriefing ? 'max-h-[500px] opacity-100' : 'max-h-[140px] opacity-90'}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 via-blue-600/10 to-transparent pointer-events-none"></div>

                <div className="relative z-10 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-[1.5rem] bg-black/40 border border-white/10 flex items-center justify-center text-primary shadow-2xl relative ${isGeneratingBriefing ? 'animate-pulse' : ''}`}>
                            <BrainCircuit size={32} />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-ping"></div>
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter">Strategic <span className="text-primary">Briefing</span></h2>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Análise em tempo real do ecossistema ImobCMI.</p>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerateBriefing}
                        disabled={isGeneratingBriefing}
                        className="bg-white text-black px-8 py-4 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-cyan-500/20 disabled:opacity-50"
                    >
                        {isGeneratingBriefing ? <Zap size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        {strategicBriefing ? 'Recalcular Insights' : 'Gerar Briefing de Hoje'}
                    </button>
                </div>

                {strategicBriefing && (
                    <div className="px-8 pb-8 pt-2 animate-in slide-in-from-top-4 duration-500">
                        <div className="bg-black/20 backdrop-blur-md rounded-[2rem] p-8 border border-white/5 text-sm font-medium leading-relaxed text-slate-300 italic">
                            <div className="flex items-center gap-2 text-primary mb-4 text-[10px] uppercase font-black tracking-widest not-italic">
                                <Activity size={12} /> Diagnóstico do Sistema
                            </div>
                            {strategicBriefing}
                        </div>
                    </div>
                )}
            </div>

            {/* --- HEADER & FILTERS --- */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between w-full">
                    <div>
                        <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase italic">
                            {user?.role === 'agent' ? (
                                <>Meu <span className="accent-text">Painel</span></>
                            ) : (
                                <>Dashboard <span className="accent-text">Geral</span></>
                            )}
                        </h1>
                        <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest mt-1">
                            {user?.role === 'agent' ? 'Acompanhe seu desempenho e comissões profissionalmente.' : 'Visão analítica completa de performance e saúde financeira.'}
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleAIFinancialAnalysis}
                            disabled={isAnalyzing}
                            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all mt-4 md:mt-0 active:scale-95 shimmer ${isAnalyzing
                                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400 animate-pulse'
                                : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-500/40 shadow-xl shadow-indigo-500/10'
                                }`}
                        >
                            <BrainCircuit size={18} className={isAnalyzing ? 'animate-spin' : ''} />
                            {isAnalyzing ? 'Analisando Saúde Financeira...' : 'IA Diagnóstico'}
                        </button>
                    </div>
                </div>

                {/* Filters Panel - Dark Modern */}
                <div className="glass-thick p-2 flex flex-wrap gap-2 items-center !rounded-[1.5rem] !border-white/10 w-full xl:w-auto overflow-x-auto custom-scrollbar no-scrollbar shadow-2xl">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20 flex-shrink-0 active:scale-95 transition-transform">
                        <Filter size={14} className="md:size-[16px]" />
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap italic">Filtros</span>
                    </div>

                    <div className="h-6 w-px bg-white/5 mx-1 flex-shrink-0"></div>

                    <select
                        value={selectedYear}
                        onChange={e => setSelectedYear(e.target.value)}
                        className="bg-background border border-border/40 rounded-xl px-3 md:px-4 py-2 text-foreground text-[9px] md:text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary/50 flex-shrink-0"
                    >
                        {[2023, 2024, 2025].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>

                    <select
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(e.target.value)}
                        className="bg-background border border-border/40 rounded-xl px-3 md:px-4 py-2 text-foreground text-[9px] md:text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary/50 min-w-[100px] md:min-w-[120px] flex-shrink-0"
                    >
                        <option value="">Todo o Ano</option>
                        {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((m, i) => (
                            <option key={i} value={i + 1}>{m}</option>
                        ))}
                    </select>

                    {user?.role === 'admin' && (
                        <div className="flex gap-2 flex-shrink-0">
                            <select
                                value={selectedDeveloper}
                                onChange={e => setSelectedDeveloper(e.target.value)}
                                className="bg-background border border-border/40 rounded-xl px-3 md:px-4 py-2 text-foreground text-[9px] md:text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary/50 min-w-[120px] max-w-[150px] truncate"
                            >
                                <option value="">Incorp. Todas</option>
                                {developers.map(d => <option key={d.id} value={d.id}>{d.companyName}</option>)}
                            </select>

                            <select
                                value={selectedAgent}
                                onChange={e => setSelectedAgent(e.target.value)}
                                className="bg-background border border-border/40 rounded-xl px-3 md:px-4 py-2 text-foreground text-[9px] md:text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary/50 min-w-[120px] max-w-[150px] truncate"
                            >
                                <option value="">Corretor Todos</option>
                                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                    )}

                    {(selectedMonth || selectedDeveloper || selectedAgent) && (
                        <button
                            onClick={() => { setSelectedMonth(''); setSelectedDeveloper(''); setSelectedAgent(''); }}
                            className="bg-red-500/10 text-red-500 px-4 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all flex-shrink-0"
                        >
                            Limpar
                        </button>
                    )}
                </div>
            </div>

            {/* AI Financial Diagnosis Panel */}
            {financeAnalysis && (
                <div className="mb-8 premium-card p-0 border-indigo-500/30 bg-indigo-500/5 animate-in slide-in-from-top-4 duration-500 overflow-hidden">
                    <div className="bg-indigo-500/10 p-6 border-b border-indigo-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-500 rounded-2xl text-white shadow-xl shadow-indigo-500/20">
                                <Activity size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-foreground uppercase italic tracking-tighter">CFO Virtual <span className="text-indigo-400">Diagnosis</span></h2>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Análise de IA baseada em dados reais</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1">Health Score</p>
                                <div className="flex items-center gap-2">
                                    <span className={`text-2xl font-black italic ${financeAnalysis.score >= 80 ? 'text-emerald-400' :
                                        financeAnalysis.score >= 60 ? 'text-yellow-400' : 'text-rose-500'
                                        }`}>
                                        {financeAnalysis.score}%
                                    </span>
                                    <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <div
                                            className={`h-full transition-all duration-1000 ${financeAnalysis.score >= 80 ? 'bg-emerald-400' :
                                                financeAnalysis.score >= 60 ? 'bg-yellow-400' : 'bg-rose-500'
                                                }`}
                                            style={{ width: `${financeAnalysis.score}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setFinanceAnalysis(null)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                                <Plus size={20} className="rotate-45" />
                            </button>
                        </div>
                    </div>

                    <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div>
                                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <Zap size={14} className="text-yellow-400" /> Diagnóstico Principal
                                </h4>
                                <p className="text-sm text-foreground/80 leading-relaxed font-medium italic border-l-2 border-indigo-500/30 pl-4 bg-indigo-500/5 py-3 rounded-r-xl">
                                    "{financeAnalysis.main_diagnosis}"
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <Zap size={14} className="text-cyan-400" /> Insights Estratégicos
                                    </h4>
                                    <ul className="space-y-3">
                                        {financeAnalysis.top_insights.map((insight: string, idx: number) => (
                                            <li key={idx} className="bg-white/5 border border-white/5 p-4 rounded-xl text-xs text-foreground/70 flex items-start gap-3 hover:border-indigo-500/20 transition-all group">
                                                <div className="w-5 h-5 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-[10px] font-black group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                                    {idx + 1}
                                                </div>
                                                {insight}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <Calendar size={14} className="text-indigo-400" /> Projeção Próximos 60 dias
                                        </h4>
                                        <div className="bg-black/20 border border-white/5 p-5 rounded-2xl">
                                            <p className="text-xs text-muted-foreground leading-relaxed italic">
                                                {financeAnalysis.cash_flow_prediction}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="premium-card !bg-indigo-500/10 border-indigo-500/20 p-5">
                                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-3">Recomendação Master</h4>
                                        <p className="text-xs text-foreground font-bold leading-relaxed">
                                            {financeAnalysis.recommendation}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <Activity size={14} className="text-indigo-400" /> Indicadores Críticos
                            </h4>
                            <div className="space-y-4">
                                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl group hover:border-rose-500/30 transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase">Inadimplência</span>
                                        <TrendingDownIcon size={14} className="text-rose-500" />
                                    </div>
                                    <p className="text-lg font-black text-white italic">{formatCurrency(financialRecords.filter(r => r.status === 'pending' && r.dueDate < new Date().toISOString().split('T')[0]).reduce((acc, r) => acc + r.amount, 0))}</p>
                                    <p className="text-[9px] text-muted-foreground font-bold uppercase mt-1">Total vencido e não recebido</p>
                                </div>
                                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl group hover:border-emerald-500/30 transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase">Receita Líquida Est.</span>
                                        <TrendingUp size={14} className="text-emerald-500" />
                                    </div>
                                    <p className="text-lg font-black text-white italic">{formatCurrency(totalAgencyRevenue)}</p>
                                    <p className="text-[9px] text-muted-foreground font-bold uppercase mt-1">Geração de caixa da imobiliária</p>
                                </div>
                                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl group hover:border-indigo-500/30 transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase">Status</span>
                                        <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${financeAnalysis.status_label === 'Excelente' ? 'bg-emerald-500/10 text-emerald-400' :
                                            financeAnalysis.status_label === 'Estável' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-rose-500/10 text-rose-500'
                                            }`}>
                                            {financeAnalysis.status_label}
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium">Fluxo operacional equilibrado com reservas em crescimento.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- KPI CARDS --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="premium-card p-8 group relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-cyan-500/[0.03] rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-125 blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[var(--primary-color,#22d3ee)]/10 rounded-xl text-[var(--primary-color,#22d3ee)] flex items-center justify-center ring-1 ring-[var(--primary-color,#22d3ee)]/20 group-hover:ring-[var(--primary-color,#22d3ee)]/40 transition-all"><TrendingUp size={22} /></div>
                                <span className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">{user?.role === 'agent' ? 'Meu VGV' : 'VGV Geral'}</span>
                            </div>
                            <div className={`px-2 py-1 rounded-lg text-[9px] font-black flex items-center gap-1 ${momStats.growth >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                {momStats.growth >= 0 ? '+' : ''}{momStats.growth.toFixed(1)}% MoM
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-foreground italic tracking-tighter drop-shadow-[0_0_10px_rgba(34,211,238,0.2)]">{formatCurrency(totalSales)}</h3>
                        <p className="text-[9px] text-muted-foreground mt-2 font-bold uppercase tracking-widest opacity-60">Volume Bruto de Vendas</p>
                    </div>
                </div>

                {user?.role === 'agent' ? (
                    <>
                        <div className="premium-card p-8 group relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/[0.03] rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-125 blur-3xl"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl text-emerald-400 flex items-center justify-center ring-1 ring-emerald-500/20 group-hover:ring-emerald-500/40 transition-all"><DollarSign size={22} /></div>
                                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl text-emerald-400 flex items-center justify-center ring-1 ring-emerald-500/20 group-hover:ring-emerald-500/40 transition-all"><DollarSign size={22} /></div>
                                    <span className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">Comissão Gerada</span>
                                </div>
                                <h3 className="text-3xl font-black text-foreground italic tracking-tighter drop-shadow-[0_0_10px_rgba(16,185,129,0.2)]">{formatCurrency(agentStats?.earnedInPeriod || 0)}</h3>
                                <p className="text-[9px] text-muted-foreground mt-2 font-bold uppercase tracking-widest opacity-60">Resultante de vendas aprovadas</p>
                            </div>
                        </div>
                        <div className="premium-card p-8 group relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/[0.03] rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-125 blur-3xl"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl text-blue-400 flex items-center justify-center ring-1 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all"><Wallet size={22} /></div>
                                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl text-blue-400 flex items-center justify-center ring-1 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all"><Wallet size={22} /></div>
                                    <span className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">Recebido</span>
                                </div>
                                <h3 className="text-3xl font-black text-foreground italic tracking-tighter drop-shadow-[0_0_10px_rgba(59,130,246,0.2)]">{formatCurrency(agentStats?.paidInPeriod || 0)}</h3>
                                <p className="text-[9px] text-muted-foreground mt-2 font-bold uppercase tracking-widest opacity-60">Total liquidado na conta</p>
                            </div>
                        </div>
                        <div className="premium-card p-8 group relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/[0.03] rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-125 blur-3xl"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl text-amber-400 flex items-center justify-center ring-1 ring-amber-500/20 group-hover:ring-amber-500/40 transition-all"><Clock size={22} /></div>
                                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl text-amber-400 flex items-center justify-center ring-1 ring-amber-500/20 group-hover:ring-amber-500/40 transition-all"><Clock size={22} /></div>
                                    <span className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">A Receber</span>
                                </div>
                                <h3 className="text-3xl font-black text-amber-400 italic tracking-tighter drop-shadow-[0_0_10px_rgba(251,191,36,0.2)]">{formatCurrency(agentStats?.toReceive || 0)}</h3>
                                <p className="text-[9px] text-muted-foreground mt-2 font-bold uppercase tracking-widest opacity-60">Saldo pendente acumulado</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="premium-card !p-6 md:!p-8 group relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/[0.03] rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-125 blur-3xl"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl text-indigo-400 flex items-center justify-center ring-1 ring-indigo-500/20 group-hover:ring-indigo-500/40 transition-all"><DollarSign size={20} /></div>
                                    <span className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">Comissão Bruta</span>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black text-foreground italic tracking-tighter drop-shadow-[0_0_10px_rgba(99,102,241,0.2)]">{formatCurrency(totalGrossCommission)}</h3>
                                <p className="text-[9px] text-muted-foreground mt-2 font-bold uppercase tracking-widest opacity-60">Faturamento Realizado</p>
                            </div>
                        </div>
                        <div className="premium-card !p-6 md:!p-8 group relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-pink-500/[0.03] rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-125 blur-3xl"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-pink-500/10 rounded-xl text-pink-400 flex items-center justify-center ring-1 ring-pink-500/20 group-hover:ring-pink-500/40 transition-all"><Users size={20} /></div>
                                    <span className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">Pago a Corretores</span>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black text-foreground italic tracking-tighter drop-shadow-[0_0_10px_rgba(236,72,153,0.2)]">{formatCurrency(totalAgentCommission)}</h3>
                                <p className="text-[9px] text-muted-foreground mt-2 font-bold uppercase tracking-widest opacity-60">Repasse de Performance</p>
                            </div>
                        </div>
                        <div className="premium-card !p-6 md:!p-8 group sm:col-span-2 lg:col-span-1 relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/[0.03] rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-125 blur-3xl"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl text-emerald-400 flex items-center justify-center ring-1 ring-emerald-500/20 group-hover:ring-emerald-500/40 transition-all"><Wallet size={20} /></div>
                                    <span className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">Receita Imob.</span>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black text-foreground italic tracking-tighter drop-shadow-[0_0_10px_rgba(16,185,129,0.2)]">{formatCurrency(totalAgencyRevenue)}</h3>
                                <p className="text-[9px] text-muted-foreground mt-2 font-bold uppercase tracking-widest opacity-60">Margem Operacional Líquida</p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* --- ANALYTICS ROW --- */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Sales Funnel Chart */}
                <div className="premium-card p-8 flex flex-col min-h-[400px]">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-black text-foreground italic flex items-center gap-3 uppercase">
                            <Filter className="text-cyan-400" size={20} /> Funil de Conversão
                        </h3>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Topo</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Fim</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                layout="vertical"
                                data={funnelData}
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                                    {funnelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                    <LabelList dataKey="value" position="right" fill="#fff" fontSize={11} fontWeight={900} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest text-center mt-6 opacity-40 italic">Mapeamento Leads › Oportunidades › Vendas</p>
                </div>

                {/* Cash Flow Projection Chart */}
                <div className="premium-card p-8 flex flex-col min-h-[400px]">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-black text-foreground italic flex items-center gap-3 uppercase">
                            <Wallet className="text-emerald-400" size={20} /> Fluxo de Caixa & Projeção
                        </h3>
                    </div>

                    <div className="flex-1 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={cashFlowData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }}
                                    tickFormatter={(v) => `R$ ${v / 1000}k`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    verticalAlign="top"
                                    align="right"
                                    iconType="circle"
                                    formatter={(value) => <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">{value}</span>}
                                />
                                <Bar dataKey="receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="forecast" fill="#818cf8" radius={[4, 4, 0, 0]} opacity={0.6} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* --- WIDGETS SECTION (Agenda & Pipeline) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="premium-card p-6 md:p-10 flex flex-col">
                    <div className="flex justify-between items-center mb-6 md:mb-8">
                        <h3 className="text-lg md:text-xl font-black text-foreground italic flex items-center gap-3 uppercase">
                            <Calendar className="text-cyan-400" size={20} /> Próximos Eventos
                        </h3>
                        <Link to="/calendar" className="text-[10px] font-black text-cyan-400 uppercase tracking-widest hover:text-white transition-colors">Ver Agenda ›</Link>
                    </div>
                    <div className="space-y-4 flex-1">
                        {upcomingEvents.length > 0 ? (
                            upcomingEvents.map(event => (
                                <div key={event.id} className="p-4 bg-secondary/50 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-cyan-500/10 flex flex-col items-center justify-center text-cyan-400 ring-1 ring-cyan-500/20 group-hover:bg-cyan-500/20 transition-all">
                                            <span className="text-base md:text-lg font-black leading-none">{new Date(event.start_time).getDate()}</span>
                                            <span className="text-[7px] md:text-[8px] font-black uppercase">{new Date(event.start_time).toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-xs font-black text-foreground uppercase italic truncate">{event.title}</h4>
                                            <div className="flex items-center gap-2 mt-1 opacity-60 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                                <Clock size={12} /> {new Date(event.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600 italic text-[10px] uppercase py-10 opacity-30">Vazio</div>
                        )}
                    </div>
                </div>

                <div className="premium-card p-6 md:p-10 flex flex-col lg:col-span-2">
                    <div className="flex justify-between items-center mb-6 md:mb-8">
                        <h3 className="text-lg md:text-xl font-black text-foreground italic flex items-center gap-3 uppercase">
                            <Trello className="text-blue-400" size={20} /> Resumo do Pipeline
                        </h3>
                        <Link to="/pipeline" className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-white transition-colors">Ver Quadro ›</Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                        {[
                            { label: 'Total Negócios', val: pipelineStats.count, color: 'slate' },
                            { label: 'Valor Total (VGV)', val: formatCurrency(pipelineStats.value), color: 'slate' },
                            { label: 'Em Negociação', val: pipelineStats.byStage['negotiation'] || 0, color: 'orange' },
                            { label: 'Fechados', val: pipelineStats.byStage['closed_won'] || 0, color: 'emerald' }
                        ].map(stat => (
                            <div key={stat.label} className="bg-secondary/50 p-4 md:p-5 rounded-2xl border border-white/5">
                                <span className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-tight block">{stat.label}</span>
                                <div className={`text-xl md:text-2xl font-black mt-1 ${stat.color === 'orange' ? 'text-orange-400' : stat.color === 'emerald' ? 'text-emerald-400' : 'text-foreground'}`}>{stat.val}</div>
                            </div>
                        ))}
                    </div>
                    <div className="flex-1 bg-black/5 dark:bg-black/40 rounded-3xl p-6 md:p-8 border border-white/5 flex items-center justify-around gap-2">
                        {['lead', 'visit', 'proposal', 'negotiation'].map((stage, idx) => (
                            <div key={stage} className="flex flex-col items-center relative group">
                                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-[1.2rem] md:rounded-[1.5rem] flex items-center justify-center shadow-lg transition-all ${(pipelineStats.byStage[stage] || 0) > 0 ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white scale-110 shadow-blue-500/20 ring-4 ring-blue-500/10' : 'bg-white/5 text-slate-700'}`}>
                                    <span className="text-lg md:text-xl font-black italic">{pipelineStats.byStage[stage] || 0}</span>
                                </div>
                                <span className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-4 text-center">{stage === 'lead' ? 'Leads' : stage === 'visit' ? 'Visitas' : stage === 'proposal' ? 'Propostas' : 'Negoc.'}</span>
                                {idx < 3 && <div className="hidden md:block absolute top-8 -right-12 w-12 h-[2px] bg-white/5"></div>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- ADMIN DASHBOARD --- */}
            {user?.role === 'admin' && (
                <>
                    <div className="premium-card p-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                            <div>
                                <h3 className="text-xl font-black text-foreground italic uppercase flex items-center gap-3">
                                    <FileBarChart size={24} className="text-cyan-400" /> Fluxo de Comissões
                                </h3>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">Análise comparativa de Bruto, Líquido e Repasses.</p>
                            </div>
                            <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-500"></div> Bruto</div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-500"></div> Imob</div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-cyan-400"></div> Corretores</div>
                            </div>
                        </div>

                        <div className="h-96 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }} tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                    <Bar dataKey="comissaoBruta" name="Bruto" fill="#475569" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Bar dataKey="comissaoImob" name="Imob" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Bar dataKey="comissaoCorretor" name="Corretores" fill="#22d3ee" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="premium-card p-10 flex flex-col">
                            <h3 className="text-xl font-black text-foreground italic flex items-center gap-3 uppercase mb-10"><Building2 className="text-blue-400" /> Top Incorporadoras</h3>
                            <div className="space-y-6 flex-1">
                                {developerRanking.map((item, index) => (
                                    <div key={item.name} className="group cursor-default">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-[10px] font-black text-foreground uppercase italic flex items-center gap-2">
                                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${index === 0 ? 'bg-amber-400 text-black' : 'bg-white/5 text-muted-foreground'}`}>{index + 1}</span>
                                                {item.name}
                                            </span>
                                            <span className="text-sm font-black text-cyan-400 italic">{formatCurrency(item.value)}</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_10px_rgba(6,182,212,0.5)]" style={{ width: `${(item.value / (developerRanking[0]?.value || 1)) * 100}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="premium-card p-10 flex flex-col">
                            <h3 className="text-xl font-black text-foreground italic flex items-center gap-3 uppercase mb-10"><Medal className="text-emerald-400" /> Top Corretores</h3>
                            <div className="space-y-6 flex-1">
                                {agentRanking.map((item, index) => (
                                    <div key={item.name} className="group cursor-default">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-[10px] font-black text-foreground uppercase italic flex items-center gap-2">
                                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${index === 0 ? 'bg-amber-400 text-black' : 'bg-white/5 text-muted-foreground'}`}>{index + 1}</span>
                                                {item.name}
                                            </span>
                                            <span className="text-sm font-black text-emerald-400 italic">{formatCurrency(item.value)}</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-600 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${(item.value / (agentRanking[0]?.value || 1)) * 100}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* --- AGENT DASHBOARD SECTION --- */}
            {user?.role === 'agent' && agentChartData && (
                <div className="space-y-8 animate-in slide-in-from-bottom duration-700">
                    <div className="premium-card p-10">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-xl font-black text-foreground italic uppercase flex items-center gap-3">
                                    <TrendingUp className="text-emerald-400" /> Evolução Financeira
                                </h3>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">Comissões Geradas vs Recebidas no fluxo temporal.</p>
                            </div>
                        </div>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={agentChartData.commissionHistory}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }} tickFormatter={(val) => `R$${val / 1000}k`} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                    <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }} />
                                    <Bar dataKey="gerado" name="Gerado" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Bar dataKey="recebido" name="Recebido" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="premium-card p-8 flex flex-col">
                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                                <Building2 size={16} className="text-blue-400" /> Por Incorporadora
                            </h4>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart layout="vertical" data={agentChartData.byDeveloper} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 900 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={15} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="premium-card p-8 flex flex-col">
                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                                <Filter size={16} className="text-cyan-400" /> Origem do Lead
                            </h4>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={agentChartData.bySource} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                                            {agentChartData.bySource.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="premium-card p-8 flex flex-col">
                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                                <PieChartIcon size={16} className="text-indigo-400" /> Status Vendas
                            </h4>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={agentChartData.byStatus} cx="50%" cy="50%" innerRadius={0} outerRadius={60} dataKey="value">
                                            {agentChartData.byStatus.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.name === 'Aprovada' ? '#10b981' : entry.name === 'Pendente' ? '#f59e0b' : '#ef4444'} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
