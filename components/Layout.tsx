
import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, BadgeDollarSign, Wallet,
  LogOut, Menu, X, Briefcase, TrendingUp, FileBarChart, List, Calendar as CalendarIcon, Trello,
  Bell, Check, Trash2, User as UserIcon
} from 'lucide-react';
import { useApp } from '../context/AppProvider';

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, logout, notifications, markNotificationAsRead, clearAllNotifications } = useApp();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Define all nav items
  const allNavItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'agent'] },
    { to: '/sales', label: 'Vendas', icon: BadgeDollarSign, roles: ['admin', 'agent'] },
    { to: '/reports', label: 'Relatórios', icon: FileBarChart, roles: ['admin', 'agent'] },
    { to: '/users', label: 'Usuários', icon: Users, roles: ['admin'] },
    { to: '/agents', label: 'Corretores', icon: Users, roles: ['admin'] },
    { to: '/finance', label: 'Contas Pagar/Receber', icon: Wallet, roles: ['admin'] },
    { to: '/cash-flow', label: 'Fluxo de Caixa', icon: TrendingUp, roles: ['admin'] },
    { to: '/clients', label: 'Clientes', icon: Briefcase, roles: ['admin'] },
    { to: '/developers', label: 'Incorporadoras', icon: Building2, roles: ['admin'] },
    { to: '/projects', label: 'Empreendimentos', icon: Building2, roles: ['admin'] },
    { to: '/pipeline', label: 'Pipeline', icon: Trello, roles: ['admin', 'agent'] },
    { to: '/calendar', label: 'Agenda', icon: CalendarIcon, roles: ['admin', 'agent'] },
    { to: '/categories', label: 'Plano de Contas', icon: List, roles: ['admin'] },
  ];

  // Filter based on user role
  const navItems = allNavItems.filter(item => item.roles.includes(user?.role || 'admin'));

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 shadow-xl
      `}>
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">ImobCMI</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-950/30 hover:text-red-300 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 relative z-10">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-600">
            <Menu size={24} />
          </button>

          <div className="flex items-center ml-auto gap-6">

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setNotificationsOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-semibold text-slate-700 text-sm">Notificações</h3>
                      {notifications.length > 0 && (
                        <button onClick={clearAllNotifications} className="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1">
                          <Trash2 size={12} /> Limpar
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">
                          Nenhuma notificação.
                        </div>
                      ) : (
                        notifications.map(notification => (
                          <div
                            key={notification.id}
                            className={`p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${notification.read ? 'opacity-60' : 'bg-blue-50/30'}`}
                            onClick={() => {
                              markNotificationAsRead(notification.id);
                              if (notification.link) {
                                navigate(notification.link);
                                setNotificationsOpen(false);
                              }
                            }}
                          >
                            <div className="flex gap-3">
                              <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notification.type === 'warning' ? 'bg-amber-500' :
                                notification.type === 'error' ? 'bg-red-500' :
                                  'bg-blue-500'
                                }`}></div>
                              <div>
                                <p className={`text-sm font-medium ${notification.read ? 'text-slate-600' : 'text-slate-800'}`}>
                                  {notification.title}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">{notification.message}</p>
                                <p className="text-[10px] text-slate-400 mt-1.5">
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

            <div className="flex items-center gap-4 group relative cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-500 capitalize">
                  {user?.role === 'admin' ? 'Administrador' : 'Corretor Parceiro'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold border-2 border-white shadow-sm">
                {user?.name.charAt(0)}
              </div>

              {/* User Dropdown */}
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden hidden group-hover:block z-20 animate-in fade-in zoom-in-95 duration-200">
                <div className="py-1">
                  <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <UserIcon size={16} /> Meu Perfil
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} /> Sair
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
