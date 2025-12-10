import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, ArrowRight, User, Mail, Lock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

export const SignUp = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        companyName: ''
    });

    const slugify = (text: string) => {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    };

    // Check for existing session on mount
    React.useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                // Pre-fill data if available
                setFormData(prev => ({
                    ...prev,
                    email: session.user.email || '',
                    name: session.user.user_metadata?.name || ''
                }));
            }
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Check if user is already logged in
            const { data: { session } } = await supabase.auth.getSession();

            // Check for invite token in URL (HashRouter support)
            const getInviteToken = () => {
                const hash = window.location.hash;
                if (!hash.includes('?')) return null;
                const searchParams = new URLSearchParams(hash.split('?')[1]);
                return searchParams.get('invite');
            };
            const inviteToken = getInviteToken();

            // Check if user is trying to use a different email than the active session
            const currentEmail = session?.user?.email?.trim().toLowerCase();
            const formEmail = formData.email.trim().toLowerCase();
            const isSwitchingAccount = session?.user && currentEmail !== formEmail;

            if (session?.user && !isSwitchingAccount) {
                // User is logged in AND using the same email
                if (inviteToken) {
                    // Accept invite
                    const { error: inviteError } = await supabase.rpc('accept_invite', { invite_token: inviteToken });

                    if (inviteError) throw inviteError;

                    // addToast('Convite aceito com sucesso!', 'success');
                    window.location.href = '/';
                    return;
                }

                // Create new organization logic (existing)
                const { data: userProfile } = await supabase
                    .from('users')
                    .select('organization_id')
                    .eq('id', session.user.id)
                    .single();

                if (userProfile?.organization_id) {
                    // addToast('Você já possui uma organização.', 'info');
                    window.location.href = '/';
                    return;
                }

                // Create organization
                const { error: rpcError } = await supabase.rpc('create_new_organization', {
                    company_name: formData.companyName,
                    user_name: formData.name,
                    user_email: session.user.email
                });

                if (rpcError) throw rpcError;

                // addToast('Organização criada com sucesso!', 'success');
                window.location.href = '/';
            } else {
                // User is NOT logged in OR is switching account
                if (isSwitchingAccount) {
                    await supabase.auth.signOut();
                }

                // Sign Up Flow
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: formData.email.trim().toLowerCase(),
                    password: formData.password,
                    options: {
                        data: {
                            name: formData.name,
                        },
                    },
                });

                if (authError) {
                    if (authError.message.includes('already registered')) {
                        throw new Error('Este e-mail já está cadastrado. Faça login para continuar.');
                    }
                    throw authError;
                }

                if (authData.user) {
                    if (inviteToken) {
                        // Try to accept invite immediately
                        const { error: inviteError } = await supabase.rpc('accept_invite', { invite_token: inviteToken });

                        if (inviteError) {
                            console.error('Error accepting invite:', inviteError);
                            // addToast('Conta criada, mas houve um erro ao aceitar o convite. Tente clicar no link novamente após fazer login.', 'warning');
                        } else {
                            // addToast('Conta criada e convite aceito!', 'success');
                        }
                    } else {
                        // Create organization for new user (no invite)
                        const { error: rpcError } = await supabase.rpc('create_new_organization', {
                            company_name: formData.companyName,
                            user_name: formData.name,
                            user_email: formData.email
                        });

                        if (rpcError) throw rpcError;
                        // addToast('Conta e organização criadas com sucesso!', 'success');
                    }

                    window.location.href = '/';
                }
            }
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Conta Criada!</h2>
                    <p className="text-slate-600 mb-6">
                        Sua imobiliária <strong>{formData.companyName}</strong> foi registrada com sucesso.
                        Você será redirecionado para o login...
                    </p>
                    <Link to="/login" className="text-blue-600 font-medium hover:underline">
                        Ir para Login agora
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-slate-900 p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 mb-4 shadow-lg">
                        <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Comece Grátis</h1>
                    <p className="text-slate-400">Crie sua conta e transforme sua imobiliária.</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                                {error.includes('não corresponde') && (
                                    <button
                                        onClick={async () => {
                                            await supabase.auth.signOut();
                                            window.location.reload();
                                        }}
                                        className="text-xs bg-red-100 hover:bg-red-200 text-red-700 py-1 px-2 rounded self-start transition-colors"
                                    >
                                        Sair e tentar com outra conta
                                    </button>
                                )}
                                {error.includes('já está cadastrado') && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const getInviteToken = () => {
                                                const hash = window.location.hash;
                                                if (!hash.includes('?')) return null;
                                                const searchParams = new URLSearchParams(hash.split('?')[1]);
                                                return searchParams.get('invite');
                                            };
                                            const inviteToken = getInviteToken();

                                            if (inviteToken) {
                                                window.location.href = `/#/login?invite=${inviteToken}`;
                                            } else {
                                                navigate('/login');
                                            }
                                        }}
                                        className="text-xs bg-red-100 hover:bg-red-200 text-red-700 py-1 px-2 rounded self-start transition-colors text-left"
                                    >
                                        Conta já existe. Clique aqui para fazer Login e aceitar o convite.
                                    </button>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Seu nome"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Imobiliária</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Ex: Imobiliária Silva"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail Profissional</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="seu@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Mínimo 6 caracteres"
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors mt-6 shadow-lg"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
                            Criar Minha Conta
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        Já tem uma conta?{' '}
                        <Link to="/login" className="text-blue-600 font-medium hover:underline">
                            Fazer Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
