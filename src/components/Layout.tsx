
import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import {
  LayoutDashboard, Users, Building2, BadgeDollarSign, Wallet,
  LogOut, Menu, X, Briefcase, TrendingUp, FileBarChart, List, Calendar as CalendarIcon, Trello,
  Bell, Check, Trash2, Sun, Moon, ChevronLeft, ChevronRight, ClipboardList, Map, Network
} from 'lucide-react';
import { useApp } from '../context/AppProvider';

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, settings, logout, notifications, markNotificationAsRead, clearAllNotifications, theme, setTheme } = useApp();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Define nav groups
  const navGroups = [
    {
      title: 'Geral',
      items: [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'agent'] },
        { to: '/calendar', label: 'Agenda', icon: CalendarIcon, roles: ['admin', 'agent'] },
      ]
    },
    {
      title: 'CRM & Vendas',
      items: [
        { to: '/leads', label: 'Leads', icon: Users, roles: ['admin', 'agent'] },
        { to: '/pipeline', label: 'Pipeline', icon: Trello, roles: ['admin', 'agent'] },
        { to: '/sales', label: 'Vendas', icon: BadgeDollarSign, roles: ['admin', 'agent'] },
        { to: '/clients', label: 'Clientes', icon: Briefcase, roles: ['admin'] },
      ]
    },
    {
      title: 'Gestão Imobiliária',
      items: [
        { to: '/projects', label: 'Projetos', icon: Map, roles: ['admin'] },
        { to: '/developers', label: 'Incorporadoras', icon: Building2, roles: ['admin'] },
        { to: '/agents', label: 'Corretores', icon: Users, roles: ['admin'] },
        { to: '/lead-sources', label: 'Mídias e Origens', icon: Network, roles: ['admin', 'agent'] },
      ]
    },
    {
      title: 'Financeiro & Análise',
      items: [
        { to: '/finance', label: 'Contas Pagar/Receber', icon: Wallet, roles: ['admin'] },
        { to: '/cash-flow', label: 'Fluxo de Caixa', icon: TrendingUp, roles: ['admin'] },
        { to: '/reports', label: 'Relatórios', icon: FileBarChart, roles: ['admin', 'agent'] },
        { to: '/categories', label: 'Plano de Contas', icon: List, roles: ['admin'] },
      ]
    },
    {
      title: 'Sistema',
      items: [
        { to: '/activity-log', label: 'Histórico', icon: ClipboardList, roles: ['admin'] },
        { to: '/users', label: 'Usuários', icon: Users, roles: ['admin'] },
        { to: '/settings', label: 'Configurações', icon: Briefcase, roles: ['admin', 'agent'] },
      ]
    }
  ];

  // Filter groups and items based on user role
  const filteredNavGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item => item.roles.includes(user?.role || 'admin'))
  })).filter(group => group.items.length > 0);

  return (
    <div className="flex h-screen bg-[#050B18] overflow-hidden relative print:bg-white print:h-auto print:overflow-visible">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none z-0 print:hidden"></div>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-[#050B18]/90 backdrop-blur-2xl text-white transform transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
        ${sidebarOpen ? 'translate-x-0 outline outline-[#00F5FF]/20' : '-translate-x-full'}
        md:relative md:translate-x-0 border-r border-[#00F5FF]/10 shadow-[20px_0_60px_rgba(0,0,0,0.5)]
        ${isCollapsed ? 'w-24' : 'w-72'}
        flex flex-col print:hidden
      `} aria-label="Navegação Principal">
        {/* Logo Section */}
        <div className={`flex items-center gap-3 p-8 mb-4 transition-all duration-500 overflow-hidden ${isCollapsed ? 'justify-center px-4' : 'px-8'}`}>
          <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00F5FF] via-[#00F5FF] to-[#7B2FFF] flex items-center justify-center shadow-[0_0_20px_rgba(0,245,255,0.4)] transition-all overflow-hidden border border-white/20 active:scale-95 shimmer" aria-hidden="true">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="" className="w-full h-full object-contain p-2" />
            ) : (
              <span className="font-black text-xl text-white italic drop-shadow-md">{settings?.system_name.charAt(0) || 'C'}</span>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-700">
              <span className="text-2xl font-black tracking-tighter text-foreground italic truncate max-w-[160px] drop-shadow-sm">
                {settings?.system_name.split(' ')[0]}<span className="accent-text !lowercase !text-lg !ml-0.5">{settings?.system_name.split(' ').slice(1).join(' ')}</span>
              </span>
              <span className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.3em] ml-0.5 opacity-70">{settings?.company_name || 'Premium CRM'}</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden ml-auto text-muted-foreground hover:text-red-400 transition-all hover:rotate-90"
            aria-label="Fechar menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Sidebar Toggle (Desktop) */}
        {!sidebarOpen && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex absolute -right-3 top-24 bg-white dark:bg-[#0f0f12] border border-white/10 text-muted-foreground hover:text-primary w-7 h-7 rounded-full items-center justify-center transition-all hover:scale-125 z-10 shadow-xl"
            aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}

        {/* Scrollable Nav Area */}
        <nav className="flex-1 overflow-y-auto no-scrollbar py-4" aria-label="Menu Lateral">
          {filteredNavGroups.map((group, groupIdx) => (
            <div key={group.title} className={groupIdx > 0 ? 'mt-6' : ''}>
              {/* Group Header */}
              {!isCollapsed ? (
                <div className="px-8 mt-4 mb-3">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 italic">
                    {group.title}
                  </h3>
                </div>
              ) : groupIdx > 0 ? (
                <div className="px-6 mb-4">
                  <div className="border-t border-white/5 w-full"></div>
                </div>
              ) : null}

              <ul className={`px-4 space-y-2 transition-all duration-500 ${isCollapsed ? 'px-3' : ''}`}>
                {group.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={() => { if (window.innerWidth < 768) setSidebarOpen(false); }}
                      className={({ isActive }) => `
                        flex items-center rounded-2xl transition-all duration-500 group relative overflow-hidden h-14
                        ${isCollapsed ? 'justify-center px-0 w-14 mx-auto' : 'px-5 gap-5 w-full'}
                        ${isActive
                          ? 'bg-gradient-to-r from-[#00F5FF]/20 to-[#7B2FFF]/10 text-[#00F5FF] shadow-[0_0_30px_rgba(0,245,255,0.15)] ring-1 ring-[#00F5FF]/20'
                          : 'text-muted-foreground hover:bg-white/5 hover:text-white'}
                      `}
                      aria-current={({ isActive }: { isActive: boolean }) => isActive ? 'page' : undefined}
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon size={22} className={`flex-shrink-0 transition-all duration-500 group-hover:scale-110 group-active:scale-90 ${isCollapsed ? '' : ''}`} aria-hidden="true" />
                          {!isCollapsed && (
                            <span className="font-extrabold text-[11px] uppercase tracking-[0.1em] italic truncate text-foreground/80 group-hover:text-foreground transition-colors">
                              {item.label}
                            </span>
                          )}

                          {/* Active Indicator Bar */}
                          <div className={`absolute left-0 w-1 rounded-r-full transition-all duration-700 ${isActive ? 'h-8 bg-gradient-to-b from-[#00F5FF] to-[#7B2FFF] animate-in slide-in-from-left-2 shadow-[0_0_10px_#00F5FF]' : 'h-0 bg-transparent'}`} />

                          {/* Tooltip for Collapsed State */}
                          {isCollapsed && (
                            <div className="absolute left-20 bg-black/90 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2.5 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 pointer-events-none z-50 whitespace-nowrap shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl">
                              {item.label}
                            </div>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="flex-shrink-0 p-6 border-t border-white/10 bg-gradient-to-t from-black/20 to-transparent">
          <button
            onClick={handleLogout}
            className={`flex items-center text-muted-foreground hover:text-red-400 transition-all group overflow-hidden ${isCollapsed ? 'justify-center' : 'px-5 gap-5 w-full h-14 rounded-2xl hover:bg-red-500/5'}`}
            aria-label="Sair da conta"
          >
            <LogOut size={22} className="flex-shrink-0 group-hover:-translate-x-1.5 transition-transform" aria-hidden="true" />
            {!isCollapsed && <span className="font-black text-[11px] uppercase tracking-widest italic">Encerrar Sessão</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-700 bg-transparent print:bg-transparent print:p-0 relative">
        {/* Web3 Orb Background Desktop */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-[#00F5FF]/5 via-[#7B2FFF]/5 to-transparent blur-[100px] rounded-full pointer-events-none -mr-40 -mt-40"></div>

        <header className="h-24 flex items-center justify-between px-6 md:px-12 relative z-30 w-full bg-[#050B18]/60 backdrop-blur-xl border-b border-[#00F5FF]/10 print:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-3 text-foreground bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all active:scale-95"
          >
            <Menu size={24} />
          </button>

          <div className="flex-1"></div> {/* Spacer */}

          <div className="flex items-center gap-8">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`relative p-3 text-muted-foreground hover:text-primary hover:bg-white/5 rounded-2xl transition-all active:scale-90 border border-transparent hover:border-white/10 ${unreadCount > 0 ? 'bg-primary/5' : ''}`}
                aria-label="Notificações"
              >
                <Bell size={22} className={unreadCount > 0 ? 'animate-[pulse_2s_infinite]' : ''} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-background shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
                )}
              </button>

              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)}></div>
                  <div className="absolute right-0 mt-5 w-96 glass-thick !bg-white/95 dark:!bg-card/90 overflow-hidden z-50 animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-500 border-white/20 dark:border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.4)] rounded-[2rem]">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-3xl relative overflow-hidden shimmer">
                      <h3 className="text-xs font-black text-foreground uppercase tracking-[0.2em] italic relative z-10">Central de Alertas</h3>
                      {notifications.length > 0 && (
                        <button onClick={clearAllNotifications} className="relative z-10 text-[10px] font-black text-muted-foreground hover:text-red-400 uppercase tracking-widest flex items-center gap-1.5 transition-colors group">
                          <Trash2 size={12} className="group-hover:rotate-12" /> Limpar Tudo
                        </button>
                      )}
                    </div>
                    <div className="max-h-[450px] overflow-y-auto custom-scrollbar no-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-16 text-center">
                          <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4 opacity-20">
                            <Bell size={32} />
                          </div>
                          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest italic leading-relaxed">
                            O céu está limpo!<br />Nenhuma pendência por enquanto.
                          </p>
                        </div>
                      ) : (
                        notifications.map(notification => (
                          <div
                            key={notification.id}
                            className={`p-6 border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer group relative overflow-hidden ${notification.read ? 'opacity-50' : 'bg-primary/5'}`}
                            onClick={() => {
                              markNotificationAsRead(notification.id);
                              if (notification.link) {
                                navigate(notification.link);
                                setNotificationsOpen(false);
                              }
                            }}
                          >
                            {!notification.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary animate-in slide-in-from-left-2" />}
                            <div className="flex gap-5">
                              <div className={`mt-1.5 w-3 h-3 rounded-full flex-shrink-0 shadow-[0_0_12px_rgba(34,211,238,0.5)] ${notification.type === 'warning' ? 'bg-amber-500 shadow-amber-500/50' :
                                notification.type === 'error' ? 'bg-red-500 shadow-red-500/50' :
                                  'bg-cyan-400 shadow-cyan-400/50'
                                }`}></div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-[13px] font-black tracking-tight leading-snug group-hover:text-primary transition-colors ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                                  {notification.title}
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2 font-medium leading-relaxed italic">{notification.message}</p>
                                <div className="flex items-center justify-between mt-4">
                                  <span className="text-[8px] text-muted-foreground font-black uppercase tracking-[0.2em] bg-white/5 px-2 py-1 rounded-md">
                                    {new Date(notification.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  {!notification.read && <span className="text-[7px] font-black text-primary uppercase tracking-widest animate-pulse">Novo Registro</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-4 bg-white/5 border-t border-white/10 text-center">
                        <button className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-all">Ver todos os alertas</button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-6 group cursor-pointer" onClick={() => navigate('/settings')}>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-foreground uppercase italic tracking-tighter group-hover:text-primary transition-colors">{user?.name}</p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
                  <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60">
                    {user?.role === 'admin' ? 'Administrador' : 'Corretor Parceiro'}
                  </p>
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#0A1025] flex items-center justify-center text-[#00F5FF] font-black italic border border-[#00F5FF]/20 shadow-2xl group-hover:border-[#7B2FFF]/50 group-hover:shadow-[0_0_20px_rgba(123,47,255,0.3)] transition-all duration-500 overflow-hidden relative">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <span className="text-xl relative z-10 transition-transform duration-500 group-hover:scale-125">{user?.name.charAt(0)}</span>
                )}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#00F5FF]/20 via-transparent to-[#7B2FFF]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8 print:p-0 print:overflow-visible">
          {children || <Outlet />}
        </main>
      </div>
      <Toaster position="top-right" richColors theme={theme === 'system' ? 'dark' : theme} />
    </div>
  );
};
