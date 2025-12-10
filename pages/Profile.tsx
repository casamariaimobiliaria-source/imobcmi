import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppProvider';
import { supabase } from '../supabaseClient';
import { User, Lock, Save, AlertCircle, CheckCircle } from 'lucide-react';

export const Profile = () => {
    const { user } = useApp();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Check for reset flow
    useEffect(() => {
        const hash = window.location.hash;
        if (hash && hash.includes('type=recovery')) {
            setMessage({ type: 'success', text: 'Defina sua nova senha abaixo.' });
        }
    }, []);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'As senhas não coincidem.' });
            return;
        }

        if (password.length < 6) {
            setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres.' });
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: password });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Senha atualizada com sucesso!' });
            setPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Erro ao atualizar senha: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Meu Perfil</h1>
                <p className="text-slate-500">Gerencie suas informações e segurança</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                            {user?.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">{user?.name}</h2>
                            <p className="text-slate-500">{user?.email}</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${user?.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                {user?.role === 'admin' ? 'Administrador' : 'Corretor'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Lock size={20} className="text-slate-400" />
                        Alterar Senha
                    </h3>

                    {message && (
                        <div className={`p-4 rounded-lg mb-4 flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nova Senha</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Nova Senha</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Repita a nova senha"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : (
                                <>
                                    <Save size={18} />
                                    Atualizar Senha
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
