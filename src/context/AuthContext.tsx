import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, OrganizationSettings } from '../types';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';

interface AuthContextType {
    user: User | null;
    settings: OrganizationSettings | null;
    loading: boolean;
    login: (email?: string, password?: string) => Promise<void>;
    logout: () => void;
    updateSettings: (data: Partial<OrganizationSettings>) => Promise<void>;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [settings, setSettings] = useState<OrganizationSettings | null>(null);
    const [loading, setLoading] = useState(true);

    const loadSettings = async (orgId: string) => {
        try {
            const { data, error } = await supabase
                .from('organization_settings')
                .select('*')
                .eq('organization_id', orgId)
                .single();

            if (data) {
                setSettings(data as OrganizationSettings);
            } else if (error && error.code === 'PGRST116') {
                const defaultSettings = {
                    organization_id: orgId,
                    company_name: 'Imobiliária CMI',
                    system_name: 'CMI CRM',
                    primary_color: '#06b6d4',
                    secondary_color: '#6366f1',
                    accent_color: '#a855f7',
                    logo_url: null
                };
                const { data: newData } = await supabase.from('organization_settings').insert([defaultSettings]).select().single();
                if (newData) setSettings(newData as OrganizationSettings);
            }
        } catch (err) {
            console.error('Error loading settings:', err);
        }
    };

    const handleUserSession = async (authUser: any) => {
        const { data: userProfile } = await supabase.from('users').select('*').eq('email', authUser.email).single();
        if (userProfile) {
            setUser({
                id: userProfile.id,
                name: userProfile.name,
                email: userProfile.email,
                role: userProfile.role as UserRole,
                organizationId: userProfile.organization_id,
                phone: (userProfile as any).phone
            });
            if (userProfile.organization_id) loadSettings(userProfile.organization_id);
        } else {
            setUser({
                id: authUser.id,
                name: authUser.user_metadata?.name || 'Visitante',
                email: authUser.email,
                role: 'agent'
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) handleUserSession(session.user);
            else setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) handleUserSession(session.user);
            else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email?: string, password?: string) => {
        if (!email || !password) return;
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    const updateSettings = async (data: Partial<OrganizationSettings>) => {
        if (!settings) return;
        const { error } = await supabase.from('organization_settings').update(data).eq('id', settings.id);
        if (error) {
            toast.error('Erro ao atualizar configurações');
            return;
        }
        setSettings(prev => prev ? { ...prev, ...data } : null);
        toast.success('Configurações atualizadas!');
    };

    return (
        <AuthContext.Provider value={{ user, settings, loading, login, logout, updateSettings, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    return context;
};
