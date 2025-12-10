
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, ArrowRight, UserCircle2, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppProvider';
import { supabase } from '../supabaseClient';
import { UserRole } from '../types';

export const Login = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      await login(email, password);

      // Check for invite token (HashRouter support)
      const getInviteToken = () => {
        const hash = window.location.hash;
        if (!hash.includes('?')) return null;
        const searchParams = new URLSearchParams(hash.split('?')[1]);
        return searchParams.get('invite');
      };
      const inviteToken = getInviteToken();

      if (inviteToken) {
        navigate(`/signup?invite=${inviteToken}`);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
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

        <div className="p-8">
          <div className="flex gap-4 mb-6 border-b border-slate-100">
            <button
              className="flex-1 pb-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600 transition-colors"
            >
              Login
            </button>
            <Link
              to="/signup"
              className="flex-1 pb-2 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors text-center"
            >
              Criar Conta
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            {successMsg && (
              <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle size={16} />
                {successMsg}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span>Processando...</span>
              ) : (
                <>
                  <span>Acessar Painel</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
