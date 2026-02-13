import React, { createContext, useContext, useState, useEffect } from 'react';
import { Event, Notification } from '../types';
import { supabase } from '../supabaseClient';

interface UIContextType {
    theme: 'dark' | 'light' | 'system';
    setTheme: (theme: 'dark' | 'light' | 'system') => void;
    notifications: Notification[];
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
    markNotificationAsRead: (id: string) => void;
    clearAllNotifications: () => void;
    events: Event[];
    setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
    refreshEvents: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<'dark' | 'light' | 'system'>(() => {
        return (localStorage.getItem('theme') as any) || 'dark';
    });

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [events, setEvents] = useState<Event[]>([]);

    const setTheme = (t: 'dark' | 'light' | 'system') => {
        setThemeState(t);
        localStorage.setItem('theme', t);
    };

    useEffect(() => {
        if (theme === 'system') {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.classList.toggle('dark', isDark);
        } else {
            document.documentElement.classList.toggle('dark', theme === 'dark');
        }
    }, [theme]);

    const markNotificationAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const clearAllNotifications = () => setNotifications([]);

    const refreshEvents = async () => {
        const { data } = await supabase.from('events').select('*');
        if (data) setEvents(data);
    };

    return (
        <UIContext.Provider value={{
            theme, setTheme, notifications, setNotifications, markNotificationAsRead, clearAllNotifications, events, setEvents, refreshEvents
        }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) throw new Error('useUI deve ser usado dentro de um UIProvider');
    return context;
};
