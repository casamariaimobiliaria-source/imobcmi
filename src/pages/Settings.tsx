import React, { useState, useEffect } from 'react';
import {
    User, Building2, Palette, Bell, Shield, Camera,
    Upload, Save, Trash2, Globe, Mail, Phone, MapPin,
    ChevronRight, Laptop, Moon, Sun, Monitor
} from 'lucide-react';
import { useApp } from '../context/AppProvider';
import { toast } from 'sonner';
import { supabase } from '../supabaseClient';

export const Settings = () => {
    const { user, settings, theme, setTheme, agents, updateUser, updateSettings } = useApp();
    const [activeTab, setActiveTab] = useState<'profile' | 'org' | 'preferences'>('profile');
    const [isUploading, setIsUploading] = useState(false);
    const [notificationPrefs, setNotificationPrefs] = useState({
        sales: true,
        leads: true,
        summary: true
    });

    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        role: user?.role || 'agent'
    });

    // Sync profile data when user loads
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                role: user.role || 'agent'
            });
        }
    }, [user]);

    // Phone mask formatter
    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 10) {
            return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
        }
        return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
    };

    const [orgData, setOrgData] = useState({
        name: settings?.company_name || 'Imobiliária CMI',
        systemName: settings?.system_name || 'CMI CRM',
        primaryColor: settings?.primary_color || '#06b6d4',
        secondaryColor: settings?.secondary_color || '#6366f1',
        address: ''
    });

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Saving Profile:', profileData);
        try {
            // Update user name and phone in users table
            await updateUser(user?.id || '', {
                name: profileData.name,
                phone: profileData.phone
            });
            toast.success('Perfil atualizado com sucesso!');
        } catch (err) {
            toast.error('Erro ao atualizar perfil');
        }
    };

    // ... (rest of logic up to line 228) ...

    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 border-t border-white/5">
        <div className="md:col-span-4">
            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 italic">Cor Primária</label>
            <div className="flex gap-2 items-center">
                <input type="color" className="w-12 h-12 rounded-xl bg-secondary border border-border/40 cursor-pointer p-1 shrink-0" value={orgData.primaryColor} onChange={(e) => setOrgData({ ...orgData, primaryColor: e.target.value })} />
                <input type="text" className="premium-input w-full uppercase" value={orgData.primaryColor} onChange={(e) => setOrgData({ ...orgData, primaryColor: e.target.value })} />
            </div>
        </div>
        <div className="md:col-span-4">
            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 italic">Cor Secundária</label>
            <div className="flex gap-2 items-center">
                <input type="color" className="w-12 h-12 rounded-xl bg-secondary border border-border/40 cursor-pointer p-1 shrink-0" value={orgData.secondaryColor} onChange={(e) => setOrgData({ ...orgData, secondaryColor: e.target.value })} />
                <input type="text" className="premium-input w-full uppercase" value={orgData.secondaryColor} onChange={(e) => setOrgData({ ...orgData, secondaryColor: e.target.value })} />
            </div>
        </div>
        <div className="md:col-span-4 flex items-end">
            <button type="submit" className="premium-button w-full justify-center py-3">
                <Save size={18} /> Aplicar Marca
            </button>
        </div>
    </div>

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'logo') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
            const bucket = type === 'avatar' ? 'avatars' : 'logos';

            const { error } = await supabase.storage.from(bucket).upload(fileName, file);
            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);

            if (type === 'avatar') {
                await updateUser(user?.id || '', { avatar_url: publicUrl });
            } else {
                await updateSettings({ logo_url: publicUrl });
            }

            toast.success('Upload concluído!');
        } catch (err) {
            toast.error('Erro no upload');
        } finally {
            setIsUploading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Meu Perfil', icon: User },
        { id: 'org', label: 'Organização', icon: Building2, roles: ['admin'] },
        { id: 'preferences', label: 'Preferências', icon: Palette },
    ].filter(t => !t.roles || t.roles.includes(user?.role || ''));

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-foreground italic tracking-tighter flex items-center gap-3">
                    <Shield className="text-primary" size={32} />
                    CONFIGURAÇÕES DO <span className="text-primary uppercase">SISTEMA</span>
                </h1>
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mt-1">Gerencie sua conta e identidade visual</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Navigation Sidebar */}
                <div className="w-full md:w-64 space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 ring-1 ring-primary/50'
                                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    {activeTab === 'profile' && (
                        <div className="premium-card p-8 space-y-8">
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/5 flex items-center justify-center text-4xl font-black text-foreground italic overflow-hidden shadow-2xl">
                                        {user?.name?.charAt(0) || '?'}
                                    </div>
                                    <label className="absolute bottom-2 right-2 p-2 bg-primary text-primary-foreground rounded-xl cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-lg shadow-primary/20">
                                        <Camera size={18} />
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'avatar')} disabled={isUploading} />
                                    </label>
                                </div>

                                <div className="flex-1 space-y-1">
                                    <h3 className="text-xl font-black text-foreground uppercase italic tracking-tighter">{user?.name}</h3>
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{user?.role === 'admin' ? 'Administrador do Sistema' : 'Corretor Associado'}</p>
                                    <p className="text-xs text-muted-foreground italic mt-2">Membro desde Nov 2025</p>
                                </div>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 italic">Nome Completo</label>
                                    <input
                                        type="text"
                                        className="premium-input w-full"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 italic">E-mail Principal</label>
                                    <input
                                        type="email"
                                        className="premium-input w-full opacity-50 cursor-not-allowed"
                                        value={profileData.email}
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 italic">Telefone Profissional</label>
                                    <input
                                        type="text"
                                        className="premium-input w-full"
                                        placeholder="(00) 00000-0000"
                                        maxLength={15}
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: formatPhone(e.target.value) })}
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2 flex justify-end gap-3 pt-4">
                                    <button type="submit" className="premium-button">
                                        <Save size={18} /> Salvar Alterações
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'org' && (
                        <div className="premium-card p-8 space-y-10">
                            <div className="flex items-start gap-8">
                                <div className="relative group">
                                    <div className="w-48 h-24 rounded-2xl bg-secondary border border-white/5 flex items-center justify-center p-4 overflow-hidden shadow-inner">
                                        {settings?.logo_url ? (
                                            <img src={settings.logo_url} alt="Logo" className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Logo Empresa</span>
                                        )}
                                    </div>
                                    <label className="absolute -bottom-2 -right-2 p-2 bg-secondary text-foreground rounded-xl cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all border border-white/10 shadow-lg">
                                        <Upload size={16} />
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} disabled={isUploading} />
                                    </label>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-foreground italic uppercase tracking-tighter">Identidade Visual</h3>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Sua marca aparecerá em relatórios e no topo da navegação.</p>
                                </div>
                            </div>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                console.log('Saving Org Settings:', orgData);
                                await updateSettings({
                                    company_name: orgData.name,
                                    system_name: orgData.systemName,
                                    primary_color: orgData.primaryColor,
                                    secondary_color: orgData.secondaryColor
                                });
                            }} className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 italic">Nome da Imobiliária</label>
                                        <input type="text" className="premium-input w-full" value={orgData.name} onChange={(e) => setOrgData({ ...orgData, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 italic">Nome do Sistema (Ex: CMI CRM)</label>
                                        <input type="text" className="premium-input w-full" value={orgData.systemName} onChange={(e) => setOrgData({ ...orgData, systemName: e.target.value })} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 border-t border-white/10">
                                    <div className="md:col-span-4">
                                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 italic">Cor Primária</label>
                                        <div className="flex gap-2 items-center">
                                            <input type="color" className="w-12 h-12 rounded-lg bg-transparent border border-white/10 cursor-pointer p-1 shrink-0" value={orgData.primaryColor} onChange={(e) => setOrgData({ ...orgData, primaryColor: e.target.value })} />
                                            <input type="text" className="premium-input w-full uppercase" value={orgData.primaryColor} onChange={(e) => setOrgData({ ...orgData, primaryColor: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="md:col-span-4">
                                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 italic">Cor Secundária</label>
                                        <div className="flex gap-2 items-center">
                                            <input type="color" className="w-12 h-12 rounded-lg bg-transparent border border-white/10 cursor-pointer p-1 shrink-0" value={orgData.secondaryColor} onChange={(e) => setOrgData({ ...orgData, secondaryColor: e.target.value })} />
                                            <input type="text" className="premium-input w-full uppercase" value={orgData.secondaryColor} onChange={(e) => setOrgData({ ...orgData, secondaryColor: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="md:col-span-4 flex items-end">
                                        <button type="submit" className="premium-button w-full justify-center py-3">
                                            <Save size={18} /> Aplicar Marca
                                        </button>
                                    </div>
                                </div>
                            </form>

                            <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10">
                                <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Shield size={14} /> Zona de Administração
                                </h4>
                                <p className="text-xs text-muted-foreground mb-4 italic">Estas configurações afetam todos os corretores da unidade imobiliária.</p>
                                <div className="flex gap-3">
                                    <button className="px-4 py-2 bg-secondary/50 hover:bg-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-border/40">
                                        Resetar Organização
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div className="premium-card p-8 space-y-8">
                            <div className="space-y-6">
                                <h3 className="text-lg font-black text-foreground uppercase italic tracking-tighter border-b border-white/10 pb-4">Aparência do Dashboard</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { id: 'dark', label: 'Dark Mode', icon: Moon },
                                        { id: 'light', label: 'Light Mode', icon: Sun },
                                        { id: 'system', label: 'Sistema', icon: Monitor },
                                    ].map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => setTheme(t.id as any)}
                                            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all ${theme === t.id ? 'bg-primary/10 border-primary/50 text-primary shadow-lg shadow-primary/10' : 'bg-background border-border text-muted-foreground hover:text-foreground'}`}
                                        >
                                            <t.icon size={24} />
                                            <span className="text-[9px] font-black uppercase tracking-widest">{t.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6 pt-6 border-t border-white/10">
                                <h3 className="text-lg font-black text-foreground uppercase italic tracking-tighter">Notificações</h3>
                                <div className="space-y-4">
                                    {[
                                        { id: 'sales', label: 'E-mail de Novas Vendas', desc: 'Receba um alerta sempre que um contrato for assinado' },
                                        { id: 'leads', label: 'Alertas de Lead Obsoleto', desc: 'Notificações push para leads sem contato há 3 dias' },
                                        { id: 'summary', label: 'Resumo Semanal', desc: 'Relatório consolidado de performance no domingo' },
                                    ].map((item: any) => (
                                        <div key={item.id} className="flex items-center justify-between p-6 bg-secondary/5 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all group/item shadow-sm">
                                            <div>
                                                <p className="text-xs font-black text-foreground uppercase tracking-widest italic">{item.label}</p>
                                                <p className="text-[10px] text-muted-foreground italic font-bold mt-1 max-w-[280px]">{item.desc}</p>
                                            </div>
                                            <div
                                                onClick={() => setNotificationPrefs(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof prev] }))}
                                                className={`w-14 h-7 rounded-full relative cursor-pointer transition-all duration-300 border-2 ${notificationPrefs[item.id as keyof typeof notificationPrefs]
                                                    ? 'border-white/20'
                                                    : 'bg-slate-800/50 border-white/10'}`}
                                                style={{
                                                    backgroundColor: notificationPrefs[item.id as keyof typeof notificationPrefs]
                                                        ? 'var(--primary-color, #22d3ee)'
                                                        : undefined
                                                }}
                                            >
                                                <div className={`absolute top-0.5 w-5 h-5 rounded-full shadow-2xl transition-all duration-300 transform ${notificationPrefs[item.id as keyof typeof notificationPrefs]
                                                    ? 'translate-x-7 bg-white'
                                                    : 'translate-x-1 bg-slate-500'}`}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
