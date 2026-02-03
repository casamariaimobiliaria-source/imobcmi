
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowRight, UserCircle2, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppProvider';
import { UserRole } from '../types';

export const Login = () => {
  const { login, agents } = useApp();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('admin');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [email, setEmail] = useState('admin@imobcmi.com');
  const [password, setPassword] = useState('password123');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (role === 'admin') {
        await login(email, password);
      } else {
        // For agents, we need to find their email or use a specific login flow
        // Assuming for now agents login with their email found in agents list
        const agent = agents.find(a => a.id === selectedAgentId);
        if (agent && agent.email) {
          await login(agent.email, password);
        } else {
          alert('Corretor sem e-mail cadastrado.');
          return;
        }
      }
      navigate('/');
    } catch (error: any) {
      alert('Erro ao fazer login: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-slate-900 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">ImobCMI</h1>
          <p className="text-slate-400">Sistema de Gestão Imobiliária</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">

          {/* Role Selection */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${role === 'admin' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <ShieldCheck size={18} />
              Admin
            </button>
            <button
              type="button"
              onClick={() => setRole('agent')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${role === 'agent' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <UserCircle2 size={18} />
              Corretor
            </button>
          </div>

          {role === 'admin' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="admin@imobcmi.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Selecione seu Perfil</label>
                <select
                  required
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">Selecione...</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg"
          >
            <span>Acessar Painel</span>
            <ArrowRight size={18} />
          </button>

          <p className="text-center text-xs text-slate-400">
            Ambiente de demonstração
          </p>
        </form>
      </div>
    </div>
  );
};
