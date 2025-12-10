
import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Shield, User as UserIcon, KeyRound, Mail, CheckCircle, Copy } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useApp } from '../context/AppProvider';
import { useToast } from '../context/ToastContext';
import { User, UserRole } from '../types';

export const Users = () => {
    const { usersList, deleteUser, user: currentUser } = useApp();
    const { addToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [invites, setInvites] = useState<any[]>([]);
    const [loadingInvites, setLoadingInvites] = useState(false);

    const [inviteData, setInviteData] = useState({
        email: '',
        role: 'agent' as UserRole
    });

    const [generatedLink, setGeneratedLink] = useState('');

    const closeInviteModal = () => {
        setIsInviteModalOpen(false);
        setGeneratedLink('');
        setInviteData({ email: '', role: 'agent' });
    };

    const filteredUsers = usersList.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Fetch invites on mount
    React.useEffect(() => {
        fetchInvites();
    }, [currentUser?.organization_id]);

    const fetchInvites = async () => {
        if (!currentUser?.organization_id) return;
        setLoadingInvites(true);

        const { data, error } = await supabase
            .from('organization_invites')
            .select('*')
            .eq('organization_id', currentUser.organization_id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching invites:', error);
        } else {
            setInvites(data || []);
        }
        setLoadingInvites(false);
    };

    const handleCreateInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser?.organization_id) return;

        try {
            const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);


            const { error } = await supabase.from('organization_invites').insert({
                organization_id: currentUser.organization_id,
                email: inviteData.email.trim().toLowerCase(),
                role: inviteData.role,
                token: token
            });

            if (error) throw error;

            const link = `${window.location.origin}/#/signup?invite=${token}`;
            setGeneratedLink(link);
            addToast('Convite criado com sucesso!', 'success');
            fetchInvites();
        } catch (error: any) {
            addToast('Erro ao criar convite: ' + error.message, 'error');
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(generatedLink);
        addToast('Link copiado para a área de transferência!', 'success');
    };

    const handleDeleteInvite = async (id: string) => {
        if (!window.confirm('Cancelar este convite?')) return;


        const { error } = await supabase.from('organization_invites').delete().eq('id', id);
        if (error) {
            addToast('Erro ao cancelar convite', 'error');
        } else {
            addToast('Convite cancelado', 'success');
            fetchInvites();
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (window.confirm('Tem certeza que deseja remover este usuário da organização?')) {
            await deleteUser(id);
        }
    };

    const handleResetPassword = async (email: string) => {
        if (window.confirm(`Enviar e-mail de redefinição de senha para ${email}?`)) {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/profile?reset=true',
            });

            if (error) {
                addToast('Erro ao enviar e-mail: ' + error.message, 'error');
            } else {
                addToast('E-mail de redefinição enviado com sucesso!', 'success');
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Equipe e Acessos</h1>
                    <p className="text-slate-500">Gerencie os membros da sua organização</p>
                </div>
                <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                >
                    <Mail size={20} />
                    Convidar Membro
                </button>
            </div>

            {/* Active Users List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <h2 className="font-semibold text-slate-700">Membros Ativos</h2>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar membro..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Função</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                                                {user.role === 'admin' ? <Shield size={16} /> : <UserIcon size={16} />}
                                            </div>
                                            <span className="font-medium text-slate-900">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin'
                                            ? 'bg-purple-100 text-purple-800'
                                            : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {user.role === 'admin' ? 'Administrador' : 'Corretor'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                                title="Remover Membro"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleResetPassword(user.email)}
                                                className="p-1 text-slate-400 hover:text-amber-600 transition-colors"
                                                title="Enviar Reset de Senha"
                                            >
                                                <KeyRound size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        Nenhum membro encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pending Invites List */}
            {invites.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-amber-50">
                        <h2 className="font-semibold text-amber-800 flex items-center gap-2">
                            <Mail size={18} /> Convites Pendentes
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Função</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Criado em</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {invites.map((invite) => (
                                    <tr key={invite.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-600">{invite.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                {invite.role === 'admin' ? 'Administrador' : 'Corretor'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-sm">
                                            {new Date(invite.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => handleDeleteInvite(invite.id)}
                                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                                            >
                                                Cancelar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Invite Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-slate-800">Convidar Membro</h3>
                            <button onClick={closeInviteModal} className="text-slate-400 hover:text-slate-600">
                                &times;
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {!generatedLink ? (
                                <form onSubmit={handleCreateInvite} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">E-mail do Membro</label>
                                        <input
                                            type="email"
                                            required
                                            value={inviteData.email}
                                            onChange={e => setInviteData({ ...inviteData, email: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="exemplo@imobiliaria.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Função</label>
                                        <select
                                            value={inviteData.role}
                                            onChange={e => setInviteData({ ...inviteData, role: e.target.value as UserRole })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="agent">Corretor</option>
                                            <option value="admin">Administrador</option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Mail size={18} />
                                        Gerar Link de Convite
                                    </button>
                                </form>
                            ) : (
                                <div className="space-y-4 text-center">
                                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle size={24} />
                                    </div>
                                    <h4 className="text-lg font-medium text-slate-800">Convite Criado!</h4>
                                    <p className="text-sm text-slate-600">
                                        Copie o link abaixo e envie para o novo membro.
                                    </p>

                                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                                        <code className="flex-1 text-xs text-slate-600 break-all text-left">
                                            {generatedLink}
                                        </code>
                                        <button
                                            onClick={handleCopyLink}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                            title="Copiar"
                                        >
                                            <Copy size={18} />
                                        </button>
                                    </div>

                                    <button
                                        onClick={closeInviteModal}
                                        className="text-sm text-slate-500 hover:text-slate-700"
                                    >
                                        Fechar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
