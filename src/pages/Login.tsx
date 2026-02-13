
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowRight, AlertCircle, CheckCircle, Lock, Mail } from 'lucide-react';
import { useApp } from '../context/AppProvider';
import { Input } from '../components/ui/Input';
import { supabase } from '../supabaseClient';

export const Login = () => {
  const { login, user, loading } = useApp();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Redirect if already logged in
  React.useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const authErrorMap: Record<string, string> = {
    'Invalid login credentials': 'Credenciais de login inválidas. Verifique seu e-mail e senha.',
    'User not found': 'Usuário não encontrado.',
    'Email not confirmed': 'E-mail não confirmado. Verifique sua caixa de entrada.',
    'Password is too short': 'A senha deve ter pelo menos 6 caracteres.',
    'User already registered': 'Este e-mail já está cadastrado.',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (isLogin) {
        await login(email, password);
        // navigate handled by useEffect or after await
      } else {
        // Sign Up Logic
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password
        });
        if (signUpError) throw signUpError;
        setSuccessMsg('Conta criada com sucesso! Faça login para continuar.');
        setIsLogin(true);
      }
    } catch (err: any) {
      console.error(err);
      const message = authErrorMap[err.message] || err.message || 'Ocorreu um erro. Tente novamente.';
      setError(message);
      setLocalLoading(false); // Only turn off if error. If success, we rely on navigation
    } finally {
      if (!isLogin || error) {
        setLocalLoading(false);
      }
      // If login success, keep loading until redirect
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 mb-6 shadow-[0_0_30px_rgba(6,182,212,0.3)] transform rotate-3 hover:rotate-0 transition-transform duration-500 text-white">
            <span className="font-bold text-3xl">C</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">CRM CMI <span className="text-cyan-400">Premium</span></h1>
          <p className="text-slate-400 text-lg">Gestão Imobiliária de Alta Performance</p>
        </div>

        <div className="bg-[#09090b]/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative group">
          {/* Card Glow Border */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 pointer-events-none"></div>

          <div className="p-1">
            <div className="flex bg-[#0f0f11] rounded-t-xl">
              <button
                className={`flex-1 py-4 text-sm font-bold transition-all duration-300 relative ${isLogin ? 'text-white bg-white/5' : 'text-slate-500 hover:text-slate-300'}`}
                onClick={() => setIsLogin(true)}
              >
                LOGIN
                {isLogin && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>}
              </button>
              <button
                className={`flex-1 py-4 text-sm font-bold transition-all duration-300 relative ${!isLogin ? 'text-white bg-white/5' : 'text-slate-500 hover:text-slate-300'}`}
                onClick={() => setIsLogin(false)}
              >
                CRIAR CONTA
                {!isLogin && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>}
              </button>
            </div>
          </div>

          <div className="p-8 pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-sm flex items-center gap-2">
                  <CheckCircle size={16} />
                  {successMsg}
                </div>
              )}

              <div className="space-y-4">
                <Input
                  icon={<Mail size={20} />}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#18181b] focus:ring-2 focus:ring-cyan-500/50 py-3"
                  placeholder="Seu e-mail profissional"
                />

                <Input
                  icon={<Lock size={20} />}
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#18181b] focus:ring-2 focus:ring-cyan-500/50 py-3"
                  placeholder="Sua senha segura"
                />
              </div>

              <button
                type="submit"
                disabled={localLoading}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {localLoading ? (
                  <span className="animate-pulse">Acessando...</span>
                ) : (
                  <>
                    <span>{isLogin ? 'ACESSAR PAINEL' : 'CRIAR CONTA'}</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="text-center">
                <a href="#" className="text-xs text-slate-500 hover:text-cyan-400 transition-colors">Esqueceu sua senha?</a>
              </div>
            </form>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-8">
          &copy; 2025 ImobCMI Premium. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};
