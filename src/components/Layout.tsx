
import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import {
  LayoutDashboard, Users, Building2, BadgeDollarSign, Wallet,
  LogOut, Menu, X, Briefcase, TrendingUp, FileBarChart, List, Calendar as CalendarIcon, Trello,
  Bell, Check, Trash2, Sun, Moon, ChevronLeft, ChevronRight, ClipboardList
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

  // Define all nav items
  const allNavItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'agent'] },
    { to: '/pipeline', label: 'Pipeline', icon: Trello, roles: ['admin', 'agent'] },
    { to: '/calendar', label: 'Agenda', icon: CalendarIcon, roles: ['admin', 'agent'] },
    { to: '/sales', label: 'Vendas', icon: BadgeDollarSign, roles: ['admin', 'agent'] },
    { to: '/leads', label: 'Leads', icon: Users, roles: ['admin', 'agent'] },
    { to: '/clients', label: 'Clientes', icon: Briefcase, roles: ['admin'] },
    { to: '/agents', label: 'Corretores', icon: Users, roles: ['admin'] },
    { to: '/developers', label: 'Incorporadoras', icon: Building2, roles: ['admin'] },
    { to: '/finance', label: 'Contas Pagar/Receber', icon: Wallet, roles: ['admin'] },
    { to: '/cash-flow', label: 'Fluxo de Caixa', icon: TrendingUp, roles: ['admin'] },
    { to: '/reports', label: 'Relatórios', icon: FileBarChart, roles: ['admin', 'agent'] },
    { to: '/users', label: 'Usuários', icon: Users, roles: ['admin'] },
    { to: '/categories', label: 'Plano de Contas', icon: List, roles: ['admin'] },
    { to: '/activity-log', label: 'Histórico', icon: ClipboardList, roles: ['admin'] },
    { to: '/settings', label: 'Configurações', icon: Briefcase, roles: ['admin', 'agent'] },
  ];

  // Filter based on user role
  const navItems = allNavItems.filter(item => item.roles.includes(user?.role || 'admin'));

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0"></div>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-sidebar text-sidebar-foreground transform transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 border-r border-white/5 shadow-[10px_0_40px_rgba(0,0,0,0.1)]
        ${isCollapsed ? 'w-20' : 'w-72'}
        flex flex-col
      `}>
        {/* Logo Section */}
        <div className={`flex items-center gap-3 p-6 mb-4 transition-all duration-500 ${isCollapsed ? 'justify-center px-0' : 'px-8'}`}>
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all overflow-hidden border border-white/10">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="w-full h-full object-contain p-1.5" />
            ) : (
              <span className="font-black text-lg text-white italic">{settings?.system_name.charAt(0) || 'C'}</span>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-500">
              <span className="text-xl font-black tracking-tighter text-foreground italic truncate max-w-[160px]">
                {settings?.system_name.split(' ')[0]} <span className="text-primary">{settings?.system_name.split(' ').slice(1).join(' ')}</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">{settings?.company_name || 'Premium'}</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(false)} className="md:hidden ml-auto text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Sidebar Toggle (Desktop) */}
        {!sidebarOpen && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex absolute -right-3 top-20 bg-background border border-border text-muted-foreground hover:text-primary w-6 h-6 rounded-full items-center justify-center transition-all hover:scale-110 z-10"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}

        {/* Scrollable Nav Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar no-scrollbar py-2">
          <nav className={`px-3 space-y-1.5 transition-all duration-500 ${isCollapsed ? 'px-2' : ''}`}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => { if (window.innerWidth < 768) setSidebarOpen(false); }}
                className={({ isActive }) => `
                flex items-center rounded-xl transition-all duration-300 group relative overflow-hidden h-12
                ${isCollapsed ? 'justify-center px-0 w-12 mx-auto' : 'px-4 gap-4 w-full'}
                ${isActive
                    ? 'bg-gradient-to-r from-cyan-500/10 to-transparent border-l-4 border-cyan-500 text-cyan-700 dark:text-cyan-400 dark:from-cyan-400/20 dark:to-transparent dark:border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-cyan-700 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 border-l-4 border-transparent'}
              `}
                title={isCollapsed ? item.label : ''}
              >
                <item.icon size={20} className={`flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]`} />
                {!isCollapsed && (
                  <span className="font-black text-xs uppercase tracking-widest italic truncate animate-in fade-in slide-in-from-left-1 duration-300">
                    {item.label}
                  </span>
                )}

                {/* Tooltip for Collapsed State */}
                {isCollapsed && (
                  <div className="absolute left-16 bg-white dark:bg-[#0f0f12] text-slate-800 dark:text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-2xl">
                    {item.label}
                  </div>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-white/5 bg-gradient-to-t from-slate-100/50 to-transparent dark:from-black/80">
          <button
            onClick={handleLogout}
            className={`flex items-center text-slate-600 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-all group overflow-hidden ${isCollapsed ? 'justify-center' : 'px-4 gap-4 w-full h-12'}`}
            title={isCollapsed ? "Sair da conta" : ""}
          >
            <LogOut size={20} className="flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
            {!isCollapsed && <span className="font-black text-xs uppercase tracking-widest italic">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-500">
        <header className="h-20 flex items-center justify-between px-4 md:px-8 relative z-30 w-full">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 text-white bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
          >
            <Menu size={24} />
          </button>

          <div className="flex-1"></div> {/* Spacer */}

          <div className="flex items-center gap-6">
            {/* Theme Toggle Override (Hidden or specialized) */}
            <div className="hidden">
              <button onClick={toggleTheme}><Sun size={20} /></button>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-slate-500 hover:bg-white/5 rounded-full transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-black"></span>
                )}
              </button>

              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-80 premium-card !bg-white dark:!bg-[#0f0f12] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 border-slate-200 dark:border-white/10 shadow-3xl">
                    <div className="p-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-white/5">
                      <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest italic">Notificações</h3>
                      {notifications.length > 0 && (
                        <button onClick={clearAllNotifications} className="text-[10px] font-black text-slate-500 hover:text-red-400 uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                          <Trash2 size={12} /> Limpar Tudo
                        </button>
                      )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-10 text-center text-slate-600 text-[10px] font-black uppercase tracking-widest italic">
                          Nenhuma notificação por enquanto.
                        </div>
                      ) : (
                        notifications.map(notification => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer group ${notification.read ? 'opacity-40' : 'bg-cyan-500/5'}`}
                            onClick={() => {
                              markNotificationAsRead(notification.id);
                              if (notification.link) {
                                navigate(notification.link);
                                setNotificationsOpen(false);
                              }
                            }}
                          >
                            <div className="flex gap-4">
                              <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(34,211,238,0.5)] ${notification.type === 'warning' ? 'bg-amber-500 shadow-amber-500/50' :
                                notification.type === 'error' ? 'bg-red-500 shadow-red-500/50' :
                                  'bg-cyan-400 shadow-cyan-400/50'
                                }`}></div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-black tracking-tight leading-tight group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors ${notification.read ? 'text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                                  {notification.title}
                                </p>
                                <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 font-medium">{notification.message}</p>
                                <p className="text-[8px] text-slate-600 mt-2 font-black uppercase tracking-widest">
                                  {new Date(notification.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-800 dark:text-white uppercase italic tracking-tighter">{user?.name}</p>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">
                  {user?.role === 'admin' ? 'Administrador' : 'Corretor Parceiro'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-black italic border border-slate-200 dark:border-white/10 shadow-lg group hover:border-cyan-500/50 transition-all overflow-hidden">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name.charAt(0)
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          {children || <Outlet />}
        </main>
      </div>
      <Toaster position="top-right" richColors theme={theme === 'system' ? 'dark' : theme} />
    </div>
  );
};
