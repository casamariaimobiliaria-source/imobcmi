
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppProvider';
import { formatCurrency, formatDate } from '../utils';
import { 
  ComposedChart, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, Line, Area, PieChart, Pie, Cell, LabelList
} from 'recharts';
import { 
  TrendingUp, Wallet, Building2, Medal, Filter, DollarSign, ArrowUpRight, Users, PieChart as PieChartIcon, CheckCircle, Clock, FileBarChart
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#f43f5e', '#6366f1'];

export const Dashboard = () => {
  const { sales, agents, developers, financialRecords, user } = useApp();
  
  // --- FILTER STATES ---
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(''); // Empty = All months
  const [selectedDeveloper, setSelectedDeveloper] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');

  // --- FILTER LOGIC ---
  
  // 1. Sales Filter
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      const matchYear = saleDate.getFullYear().toString() === selectedYear;
      const matchMonth = selectedMonth ? (saleDate.getMonth() + 1).toString() === selectedMonth : true;
      const matchDev = selectedDeveloper ? sale.developerId === selectedDeveloper : true;
      
      // Admin filters by state; Agent is FORCED to their ID
      let matchAgent = true;
      if (user?.role === 'agent') {
          matchAgent = sale.agentId === user.id;
      } else {
          matchAgent = selectedAgent ? sale.agentId === selectedAgent : true;
      }
      
      // For global dashboard, we usually show approved sales
      const matchStatus = sale.status === 'approved'; 
      
      return matchYear && matchMonth && matchDev && matchAgent && matchStatus;
    });
  }, [sales, selectedYear, selectedMonth, selectedDeveloper, selectedAgent, user]);

  // 2. Finance Filter (For Agent Received KPI)
  const filteredAgentPayments = useMemo(() => {
      if (user?.role !== 'agent') return [];
      return financialRecords.filter(record => {
          const recordDate = new Date(record.date);
          const matchYear = recordDate.getFullYear().toString() === selectedYear;
          const matchMonth = selectedMonth ? (recordDate.getMonth() + 1).toString() === selectedMonth : true;
          
          return (
              matchYear && 
              matchMonth && 
              record.relatedEntityId === user.id && 
              record.category === 'Comissão' && 
              record.status === 'paid' &&
              record.type === 'expense'
          );
      });
  }, [financialRecords, selectedYear, selectedMonth, user]);

  // --- AGGREGATIONS ---

  // 1. KPI Cards Data
  const totalSales = filteredSales.reduce((acc, s) => acc + s.unitValue, 0);
  const totalGrossCommission = filteredSales.reduce((acc, s) => acc + s.grossCommission, 0);
  const totalAgentCommission = filteredSales.reduce((acc, s) => acc + s.agentCommission, 0);
  const totalAgencyRevenue = filteredSales.reduce((acc, s) => acc + s.agencyCommission, 0);
  
  // Agent Specific Stats (If agent)
  const agentStats = useMemo(() => {
      if (user?.role !== 'agent') return null;
      
      const agentProfile = agents.find(a => a.id === user.id);
      
      // 1. Earned in Period (from filtered sales)
      const earnedInPeriod = filteredSales.reduce((acc, s) => acc + s.agentCommission, 0);
      
      // 2. Paid in Period (from filtered finance records)
      const paidInPeriod = filteredAgentPayments.reduce((acc, r) => acc + r.amount, 0);

      // 3. To Receive (ALWAYS Global Balance, ignores filter to show current debt)
      const globalEarned = agentProfile?.totalCommissionEarned || 0;
      const globalPaid = agentProfile?.totalCommissionPaid || 0;
      const toReceive = globalEarned - globalPaid;

      return {
          earnedInPeriod,
          paidInPeriod,
          toReceive
      };
  }, [user, agents, filteredSales, filteredAgentPayments]);

  // --- AGENT SPECIFIC CHARTS DATA ---
  const agentChartData = useMemo(() => {
      if (user?.role !== 'agent') return null;

      // Base sales for pie charts (use the filtered list to respect date filters)
      const salesForCharts = filteredSales;

      // 1. By Developer (Sum VGV)
      const byDevMap = new Map();
      salesForCharts.forEach(s => {
          const devName = developers.find(d => d.id === s.developerId)?.companyName || 'Unknown';
          byDevMap.set(devName, (byDevMap.get(devName) || 0) + s.unitValue); // Sum VGV
      });
      // Sort for Bar Chart (Descending)
      const byDeveloper = Array.from(byDevMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      // 2. By Lead Source (Sum VGV)
      const bySourceMap = new Map();
      salesForCharts.forEach(s => {
          const source = s.leadSource || 'N/A';
          bySourceMap.set(source, (bySourceMap.get(source) || 0) + s.unitValue); // Sum VGV
      });
      const bySource = Array.from(bySourceMap.entries()).map(([name, value]) => ({ name, value }));

      // 3. By Status (Sum VGV) - Need to check ALL sales for the agent in the period
      const allAgentSalesInPeriod = sales.filter(sale => {
          const saleDate = new Date(sale.date);
          const matchYear = saleDate.getFullYear().toString() === selectedYear;
          const matchMonth = selectedMonth ? (saleDate.getMonth() + 1).toString() === selectedMonth : true;
          return sale.agentId === user.id && matchYear && matchMonth;
      });
      
      const byStatusMap = new Map();
      allAgentSalesInPeriod.forEach(s => {
          const statusLabel = s.status === 'approved' ? 'Aprovada' : s.status === 'pending' ? 'Pendente' : 'Cancelada';
          byStatusMap.set(statusLabel, (byStatusMap.get(statusLabel) || 0) + s.unitValue); // Sum VGV
      });
      const byStatus = Array.from(byStatusMap.entries()).map(([name, value]) => ({ name, value }));

      // 4. Commission History (Received vs Generated)
      // Group by Month
      const historyMap = new Map();
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      months.forEach(m => historyMap.set(m, { generated: 0, received: 0 }));

      // Generated (Sales)
      allAgentSalesInPeriod.filter(s => s.status === 'approved').forEach(s => {
          const monthIndex = new Date(s.date).getMonth();
          const key = months[monthIndex];
          const curr = historyMap.get(key);
          curr.generated += s.agentCommission;
      });

      // Received (Payments)
      filteredAgentPayments.forEach(p => {
          const monthIndex = new Date(p.date).getMonth();
          const key = months[monthIndex];
          const curr = historyMap.get(key);
          curr.received += p.amount;
      });

      const commissionHistory = Array.from(historyMap.entries()).map(([name, data]) => ({
          name,
          gerado: data.generated,
          recebido: data.received
      }));

      return { byDeveloper, bySource, byStatus, commissionHistory };
  }, [user, filteredSales, developers, sales, selectedYear, selectedMonth, filteredAgentPayments]);


  // 2. Evolution Charts Data (Admin)
  const chartData = useMemo(() => {
    // ... (Keep existing Admin logic)
    if (selectedMonth) {
        // Daily breakdown
        const daysInMonth = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate();
        const data = Array.from({ length: daysInMonth }, (_, i) => ({
            name: (i + 1).toString(),
            vendas: 0,
            comissaoBruta: 0,
            comissaoImob: 0,
            comissaoCorretor: 0
        }));
        
        filteredSales.forEach(sale => {
            const day = new Date(sale.date).getDate();
            if (data[day - 1]) {
                data[day - 1].vendas += sale.unitValue;
                data[day - 1].comissaoBruta += sale.grossCommission;
                data[day - 1].comissaoImob += sale.agencyCommission;
                data[day - 1].comissaoCorretor += sale.agentCommission;
            }
        });
        return data;
    } else {
        // Monthly breakdown
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const data = months.map(m => ({ 
            name: m, vendas: 0, comissaoBruta: 0, comissaoImob: 0, comissaoCorretor: 0 
        }));
        
        filteredSales.forEach(sale => {
            const month = new Date(sale.date).getMonth();
            data[month].vendas += sale.unitValue;
            data[month].comissaoBruta += sale.grossCommission;
            data[month].comissaoImob += sale.agencyCommission;
            data[month].comissaoCorretor += sale.agentCommission;
        });
        return data;
    }
  }, [filteredSales, selectedMonth, selectedYear]);

  // 3. Rankings (Admin Only)
  const developerRanking = useMemo(() => {
    const map = new Map<string, number>();
    filteredSales.forEach(s => {
       map.set(s.developerId, (map.get(s.developerId) || 0) + s.unitValue);
    });
    
    return Array.from(map.entries())
      .map(([id, val]) => ({
          name: developers.find(d => d.id === id)?.companyName || 'Unknown',
          value: val
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredSales, developers]);

  const agentRanking = useMemo(() => {
    const map = new Map<string, number>();
    filteredSales.forEach(s => {
       map.set(s.agentId, (map.get(s.agentId) || 0) + s.unitValue);
    });
    
    return Array.from(map.entries())
      .map(([id, val]) => ({
          name: agents.find(a => a.id === id)?.name || 'Unknown',
          value: val
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredSales, agents]);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-slate-200 shadow-xl rounded-xl z-50 min-w-[200px]">
          <p className="text-slate-800 font-bold mb-2 border-b border-slate-100 pb-1">{selectedMonth ? `Dia ${label}` : label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between items-center gap-4 mb-1 text-sm">
                <span className="font-medium" style={{ color: entry.stroke || entry.fill }}>
                    {entry.name === 'vendas' && 'VGV'}
                    {entry.name === 'comissaoBruta' && 'Comissão Bruta'}
                    {entry.name === 'comissaoImob' && 'Receita Imob.'}
                    {entry.name === 'comissaoCorretor' && 'Repasse Corretor'}
                    {entry.name === 'gerado' && 'Comissão Gerada'}
                    {entry.name === 'recebido' && 'Comissão Recebida'}
                    {entry.name === 'value' && 'VGV Total'}
                </span>
                <span className="font-bold text-slate-700">
                    {formatCurrency(entry.value)}
                </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* --- HEADER & FILTERS --- */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
             {user?.role === 'agent' ? 'Meu Painel' : 'Dashboard Geral'}
          </h1>
          <p className="text-slate-500">
             {user?.role === 'agent' ? 'Acompanhe seu desempenho e comissões.' : 'Visão completa de performance e financeiro.'}
          </p>
        </div>
        
        {/* Filters Panel */}
        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-2 items-center">
           <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg text-slate-600 border border-slate-100">
               <Filter size={16} />
               <span className="text-xs font-bold uppercase tracking-wide">Filtros</span>
           </div>
           
           <div className="h-6 w-px bg-slate-200 mx-1"></div>

           <select 
              value={selectedYear} 
              onChange={e => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-white"
           >
              {[2023, 2024, 2025].map(y => <option key={y} value={y}>{y}</option>)}
           </select>

           <select 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-white min-w-[100px]"
           >
              <option value="">Todo o Ano</option>
              {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
              ))}
           </select>

           {user?.role === 'admin' && (
             <>
                <select 
                    value={selectedDeveloper} 
                    onChange={e => setSelectedDeveloper(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-white max-w-[150px]"
                >
                    <option value="">Todas Incorporadoras</option>
                    {developers.map(d => <option key={d.id} value={d.id}>{d.companyName}</option>)}
                </select>

               <select 
                  value={selectedAgent} 
                  onChange={e => setSelectedAgent(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-white max-w-[150px]"
               >
                  <option value="">Todos Corretores</option>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
               </select>
             </>
           )}

           {(selectedMonth || selectedDeveloper || selectedAgent) && (
              <button 
                onClick={() => { setSelectedMonth(''); setSelectedDeveloper(''); setSelectedAgent(''); }}
                className="text-xs text-red-500 font-semibold hover:text-red-700 px-2"
              >
                  Limpar
              </button>
           )}
        </div>
      </div>

      {/* --- KPI CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: VGV (Common) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-blue-100 rounded text-blue-600"><TrendingUp size={18}/></div>
                <span className="text-slate-500 text-xs font-bold uppercase">
                    {user?.role === 'agent' ? 'Meu VGV (Período)' : 'VGV Total'}
                </span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(totalSales)}</h3>
            <p className="text-xs text-slate-400 mt-1">Volume Geral de Vendas</p>
          </div>
        </div>

        {user?.role === 'agent' ? (
            // --- AGENT SPECIFIC KPIs ---
            <>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-emerald-100 rounded text-emerald-600"><DollarSign size={18}/></div>
                            <span className="text-slate-500 text-xs font-bold uppercase">Minha Comissão (Período)</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(agentStats?.earnedInPeriod || 0)}</h3>
                        <p className="text-xs text-slate-400 mt-1">Gerada em vendas aprovadas</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-teal-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-teal-100 rounded text-teal-600"><CheckCircle size={18}/></div>
                            <span className="text-slate-500 text-xs font-bold uppercase">Recebido (Período)</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(agentStats?.paidInPeriod || 0)}</h3>
                        <p className="text-xs text-slate-400 mt-1">Pagamentos realizados</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-amber-100 rounded text-amber-600"><Clock size={18}/></div>
                            <span className="text-slate-500 text-xs font-bold uppercase">A Receber (Total)</span>
                        </div>
                        <h3 className="text-2xl font-bold text-amber-600">{formatCurrency(agentStats?.toReceive || 0)}</h3>
                        <p className="text-xs text-slate-400 mt-1">Saldo acumulado pendente</p>
                    </div>
                </div>
            </>
        ) : (
            // --- ADMIN KPIs ---
            <>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-sky-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-sky-100 rounded text-sky-600"><DollarSign size={18}/></div>
                            <span className="text-slate-500 text-xs font-bold uppercase">Comissão Bruta</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(totalGrossCommission)}</h3>
                        <p className="text-xs text-slate-400 mt-1">Faturamento Total</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-teal-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-teal-100 rounded text-teal-600"><Users size={18}/></div>
                            <span className="text-slate-500 text-xs font-bold uppercase">Pago a Corretores</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(totalAgentCommission)}</h3>
                        <p className="text-xs text-slate-400 mt-1">Repasse de Comissões</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-indigo-100 rounded text-indigo-600"><Wallet size={18}/></div>
                            <span className="text-slate-500 text-xs font-bold uppercase">Receita Imobiliária</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(totalAgencyRevenue)}</h3>
                        <p className="text-xs text-slate-400 mt-1">Lucro Operacional Líquido</p>
                    </div>
                </div>
            </>
        )}
      </div>

      {/* --- AGENT DASHBOARD SECTION --- */}
      {user?.role === 'agent' && agentChartData && (
          <div className="space-y-6">
              
              {/* Financial Evolution Chart */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-center mb-6">
                      <div>
                          <h3 className="text-lg font-bold text-slate-800">Evolução Financeira</h3>
                          <p className="text-sm text-slate-500">Comissões Geradas vs Recebidas no período</p>
                      </div>
                  </div>
                  <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={agentChartData.commissionHistory}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} />
                              <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `R$${val/1000}k`}/>
                              <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}}/>
                              <Legend />
                              <Bar dataKey="gerado" name="Comissão Gerada" fill="#10b981" radius={[4, 4, 0, 0]}>
                                 <LabelList dataKey="gerado" position="top" formatter={(val: number) => val > 0 ? formatCurrency(val) : ''} style={{ fontSize: '10px', fill: '#666' }} />
                              </Bar>
                              <Bar dataKey="recebido" name="Comissão Recebida" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                 <LabelList dataKey="recebido" position="top" formatter={(val: number) => val > 0 ? formatCurrency(val) : ''} style={{ fontSize: '10px', fill: '#666' }} />
                              </Bar>
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </div>

              {/* Pie Charts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* By Developer (Horizontal Bar Chart) */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                      <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Building2 size={16} /> Vendas por Incorporadora (VGV)</h4>
                      <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart 
                                layout="vertical" 
                                data={agentChartData.byDeveloper} 
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                              >
                                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                  <XAxis type="number" hide />
                                  <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    width={90} 
                                    tick={{fontSize: 11, fill: '#475569'}} 
                                    interval={0}
                                  />
                                  <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
                                  <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20}>
                                    <LabelList dataKey="value" position="right" formatter={(val: number) => formatCurrency(val)} style={{ fontSize: '11px', fill: '#475569', fontWeight: 'bold' }} />
                                  </Bar>
                              </BarChart>
                          </ResponsiveContainer>
                      </div>
                  </div>

                  {/* By Source */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                      <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Filter size={16} /> Origem do Lead (VGV)</h4>
                      <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie 
                                    data={agentChartData.bySource} 
                                    cx="50%" cy="50%" 
                                    innerRadius={40} outerRadius={70} 
                                    paddingAngle={5} 
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                                  >
                                      {agentChartData.bySource.map((entry: any, index: number) => (
                                          <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                                      ))}
                                  </Pie>
                                  <Tooltip content={<CustomTooltip />} />
                              </PieChart>
                          </ResponsiveContainer>
                      </div>
                  </div>

                  {/* By Status */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                      <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><PieChartIcon size={16} /> Status das Vendas (VGV)</h4>
                      <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie 
                                    data={agentChartData.byStatus} 
                                    cx="50%" cy="50%" 
                                    innerRadius={0} outerRadius={70} 
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                                  >
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

              {/* STATEMENT SECTION */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <FileBarChart className="text-blue-600"/>
                          Extrato de Comissões Detalhado
                      </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                      {/* Left: Approved Sales (Credits) */}
                      <div className="p-0">
                          <div className="bg-emerald-50/50 p-3 border-b border-emerald-100 flex justify-between items-center">
                              <h4 className="font-bold text-emerald-800 text-sm">Vendas Aprovadas (Créditos)</h4>
                              <span className="text-xs bg-white px-2 py-1 rounded text-emerald-700 font-bold border border-emerald-100">
                                  Total: {formatCurrency(filteredSales.reduce((acc, s) => acc + s.agentCommission, 0))}
                              </span>
                          </div>
                          <div className="overflow-y-auto max-h-[400px]">
                              <table className="w-full text-left text-sm">
                                  <thead className="bg-slate-50 text-slate-500 sticky top-0">
                                      <tr>
                                          <th className="px-4 py-2 text-xs">Data</th>
                                          <th className="px-4 py-2 text-xs">Unidade</th>
                                          <th className="px-4 py-2 text-xs text-right">Comissão</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                      {filteredSales.map(sale => (
                                          <tr key={sale.id} className="hover:bg-slate-50">
                                              <td className="px-4 py-2 text-slate-600 text-xs">{formatDate(sale.date)}</td>
                                              <td className="px-4 py-2">
                                                  <div className="font-medium text-slate-700">{sale.unit}</div>
                                                  <div className="text-[10px] text-slate-400">{sale.projectId}</div>
                                              </td>
                                              <td className="px-4 py-2 text-right font-medium text-emerald-600">{formatCurrency(sale.agentCommission)}</td>
                                          </tr>
                                      ))}
                                      {filteredSales.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-slate-400 text-xs">Nenhuma venda aprovada no período.</td></tr>}
                                  </tbody>
                              </table>
                          </div>
                      </div>

                      {/* Right: Payments Received (Debits) */}
                      <div className="p-0">
                          <div className="bg-blue-50/50 p-3 border-b border-blue-100 flex justify-between items-center">
                              <h4 className="font-bold text-blue-800 text-sm">Pagamentos Recebidos</h4>
                              <span className="text-xs bg-white px-2 py-1 rounded text-blue-700 font-bold border border-blue-100">
                                  Total: {formatCurrency(filteredAgentPayments.reduce((acc, r) => acc + r.amount, 0))}
                              </span>
                          </div>
                          <div className="overflow-y-auto max-h-[400px]">
                              <table className="w-full text-left text-sm">
                                  <thead className="bg-slate-50 text-slate-500 sticky top-0">
                                      <tr>
                                          <th className="px-4 py-2 text-xs">Data</th>
                                          <th className="px-4 py-2 text-xs">Descrição</th>
                                          <th className="px-4 py-2 text-xs text-right">Valor</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                      {filteredAgentPayments.map(record => (
                                          <tr key={record.id} className="hover:bg-slate-50">
                                              <td className="px-4 py-2 text-slate-600 text-xs">{formatDate(record.date)}</td>
                                              <td className="px-4 py-2 text-xs text-slate-700">{record.description}</td>
                                              <td className="px-4 py-2 text-right font-medium text-blue-600">{formatCurrency(record.amount)}</td>
                                          </tr>
                                      ))}
                                      {filteredAgentPayments.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-slate-400 text-xs">Nenhum pagamento recebido no período.</td></tr>}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- ADMIN DASHBOARD --- */}
      {user?.role === 'admin' && (
        <>
            {/* ... Admin Charts (unchanged structure, just data labels if desired, or keep clean) ... */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <PieChartIcon size={20} className="text-sky-600"/>
                            Fluxo de Comissões: Bruto vs Líquido vs Repasse
                        </h3>
                        <p className="text-sm text-slate-500">Comparativo financeiro detalhado</p>
                    </div>
                    <div className="flex gap-4 text-xs font-medium">
                        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-slate-500"></span> Bruto</div>
                        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-indigo-500"></span> Imobiliária</div>
                        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-cyan-400"></span> Corretores</div>
                    </div>
                </div>

                <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                            <linearGradient id="gradGross" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#475569" stopOpacity={1}/>
                                <stop offset="100%" stopColor="#94a3b8" stopOpacity={0.8}/>
                            </linearGradient>
                            <linearGradient id="gradAgency" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#4f46e5" stopOpacity={1}/>
                                <stop offset="100%" stopColor="#818cf8" stopOpacity={0.8}/>
                            </linearGradient>
                            <linearGradient id="gradAgent" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#06b6d4" stopOpacity={1}/>
                                <stop offset="100%" stopColor="#67e8f9" stopOpacity={0.8}/>
                            </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                            <YAxis 
                                axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} 
                                tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                            <Legend />
                            {/* Render bars side by side */}
                            <Bar dataKey="comissaoBruta" name="Comissão Bruta" fill="url(#gradGross)" radius={[4, 4, 0, 0]} barSize={selectedMonth ? 8 : 20} />
                            <Bar dataKey="comissaoImob" name="Receita Imobiliária" fill="url(#gradAgency)" radius={[4, 4, 0, 0]} barSize={selectedMonth ? 8 : 20} />
                            <Bar dataKey="comissaoCorretor" name="Repasse Corretores" fill="url(#gradAgent)" radius={[4, 4, 0, 0]} barSize={selectedMonth ? 8 : 20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* DEVELOPER RANKING */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                    <Building2 className="text-blue-600" size={20}/>
                    <h3 className="text-lg font-bold text-slate-800">Top Incorporadoras</h3>
                </div>
                <div className="space-y-5 flex-1">
                    {developerRanking.map((item, index) => (
                        <div key={item.name}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-slate-700 flex items-center gap-2">
                                    <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${index === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {index + 1}
                                    </span>
                                    {item.name}
                                </span>
                                <span className="font-bold text-slate-800">{formatCurrency(item.value)}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div 
                                    className="h-2 rounded-full bg-blue-500"
                                    style={{ width: `${(item.value / developerRanking[0]?.value) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
                </div>

                {/* AGENT RANKING */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                    <Medal className="text-emerald-500" size={20}/>
                    <h3 className="text-lg font-bold text-slate-800">Top Corretores</h3>
                </div>
                <div className="space-y-5 flex-1">
                    {agentRanking.map((item, index) => (
                        <div key={item.name}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-slate-700 flex items-center gap-2">
                                    <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${index === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {index + 1}
                                    </span>
                                    {item.name}
                                </span>
                                <span className="font-bold text-slate-800">{formatCurrency(item.value)}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div 
                                    className="h-2 rounded-full bg-emerald-500"
                                    style={{ width: `${(item.value / agentRanking[0]?.value) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
                </div>
            </div>
        </>
      )}
    </div>
  );
};
