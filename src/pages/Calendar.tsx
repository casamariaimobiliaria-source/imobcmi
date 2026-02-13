import React, { useState, useEffect } from 'react';
import {
    format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths,
    parseISO, isWithinInterval
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    ChevronLeft, ChevronRight, Calendar as CalendarIcon,
    Plus, Clock, MapPin, User, X, Trash2, Check
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useApp } from '../context/AppProvider';
import { Event } from '../types';

export const Calendar = () => {
    const { user, agents, clients } = useApp();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        type: 'visit' as Event['type'],
        agent_id: '',
        client_id: ''
    });

    // Fetch Events
    useEffect(() => {
        fetchEvents();
    }, [currentDate]);

    const fetchEvents = async () => {
        setLoading(true);
        const start = startOfWeek(startOfMonth(currentDate));
        const end = endOfWeek(endOfMonth(currentDate));

        const { data, error } = await supabase
            .from('events')
            .select('*')
            .gte('start_time', start.toISOString())
            .lte('end_time', end.toISOString());

        if (data) {
            setEvents(data);
        }
        setLoading(false);
    };

    // Calendar Logic
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    // Handlers
    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    const handleDayClick = (day: Date) => {
        setSelectedDate(day);
        setFormData({
            ...formData,
            start_time: format(day, "yyyy-MM-dd'T'09:00"),
            end_time: format(day, "yyyy-MM-dd'T'10:00")
        });
        setEditingEvent(null);
        setIsModalOpen(true);
    };

    const handleEventClick = (e: React.MouseEvent, event: Event) => {
        e.stopPropagation();
        setEditingEvent(event);
        setFormData({
            title: event.title,
            description: event.description || '',
            start_time: format(parseISO(event.start_time), "yyyy-MM-dd'T'HH:mm"),
            end_time: format(parseISO(event.end_time), "yyyy-MM-dd'T'HH:mm"),
            type: event.type,
            agent_id: event.agent_id || '',
            client_id: event.client_id || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('📅 handleSubmit called');
        console.log('📦 Form Data:', formData);

        try {
            const eventData = {
                ...formData,
                start_time: new Date(formData.start_time).toISOString(),
                end_time: new Date(formData.end_time).toISOString(),
                agent_id: formData.agent_id || null,
                client_id: formData.client_id || null,
                organization_id: user?.organizationId // Add organization_id for RLS
            };

            console.log('📤 Data to send to Supabase:', eventData);

            const { data, error } = editingEvent
                ? await supabase.from('events').update(eventData).eq('id', editingEvent.id).select()
                : await supabase.from('events').insert([eventData]).select();

            if (error) {
                console.error('❌ Supabase error:', error);
                throw error;
            }

            console.log('✅ Success! Data:', data);

            setIsModalOpen(false);
            fetchEvents();
        } catch (error) {
            console.error('Error saving event:', error);
            alert(`Erro ao salvar evento: ${(error as any).message || 'Verifique o console'}`);
        }
    };

    const handleDelete = async () => {
        if (!editingEvent) return;
        if (confirm('Tem certeza que deseja excluir este evento?')) {
            try {
                const { error } = await supabase.from('events').delete().eq('id', editingEvent.id);
                if (error) throw error;

                setIsModalOpen(false);
                fetchEvents();
            } catch (error) {
                console.error('Error deleting event:', error);
                alert('Erro ao excluir o evento.');
            }
        }
    };

    const getEventTypeColor = (type: string) => {
        switch (type) {
            case 'visit': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'meeting': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'deadline': return 'bg-red-100 text-red-700 border-red-200';
            case 'task': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getEventTypeLabel = (type: string) => {
        switch (type) {
            case 'visit': return 'Visita';
            case 'meeting': return 'Reunião';
            case 'deadline': return 'Prazo';
            case 'task': return 'Tarefa';
            default: return type;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-foreground italic tracking-tighter flex items-center gap-3 uppercase">
                        <CalendarIcon className="text-primary" size={28} />
                        AGENDA <span className="text-primary uppercase">INTELIGENTE</span>
                    </h1>
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mt-1">Gerencie visitas e compromissos com precisão.</p>
                </div>
                <button
                    onClick={() => handleDayClick(new Date())}
                    className="premium-button py-3"
                >
                    <Plus size={20} />
                    NOVO EVENTO
                </button>
            </div>

            {/* Calendar Container */}
            <div className="premium-card !p-0 overflow-hidden">
                {/* Calendar Header */}
                <div className="p-6 flex items-center justify-between border-b border-slate-300 dark:border-white/5 bg-slate-100 dark:bg-white/[0.02]">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">
                        {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                    </h2>
                    <div className="flex items-center gap-3">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-200 dark:hover:bg-white/5 border border-slate-300 dark:border-white/5 rounded-xl text-slate-600 hover:text-slate-900 dark:hover:text-white transition-all">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={() => setCurrentDate(new Date())} className="px-5 py-2 text-[10px] font-black text-slate-600 hover:text-slate-900 dark:hover:text-white uppercase tracking-widest bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 border border-slate-300 dark:border-white/5 rounded-xl transition-all">
                            Hoje
                        </button>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-slate-200 dark:hover:bg-white/5 border border-slate-300 dark:border-white/5 rounded-xl text-slate-600 hover:text-slate-900 dark:hover:text-white transition-all">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 border-b border-slate-300 dark:border-white/5 bg-slate-200 dark:bg-white/[0.01]">
                    {weekDays.map(day => (
                        <div key={day} className="py-4 text-center text-[10px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-[0.2em]">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 auto-rows-fr bg-slate-300 dark:bg-white/5 gap-px">
                    {calendarDays.map((day, idx) => {
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isToday = isSameDay(day, new Date());
                        const dayEvents = events.filter(e => isSameDay(parseISO(e.start_time), day));

                        return (
                            <div
                                key={day.toString()}
                                onClick={() => handleDayClick(day)}
                                className={`
                                    min-h-[140px] p-3 transition-all duration-300 hover:bg-slate-50 dark:hover:bg-white/[0.03] group relative cursor-pointer
                                    ${!isCurrentMonth ? 'bg-slate-100 dark:bg-black/[0.15] opacity-60 dark:opacity-30' : 'bg-white dark:bg-[#09090b]'}
                                `}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`
                                        text-xs font-black italic w-8 h-8 flex items-center justify-center rounded-xl transition-all
                                        ${isToday ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-110' : 'text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'}
                                    `}>
                                        {format(day, 'd')}
                                    </span>
                                    {dayEvents.length > 0 && (
                                        <div className="flex -space-x-1">
                                            {dayEvents.slice(0, 3).map((_, i) => (
                                                <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/40 ring-1 ring-background"></div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    {dayEvents.map(event => (
                                        <div
                                            key={event.id}
                                            onClick={(e) => handleEventClick(e, event)}
                                            className={`
                                                text-[9px] p-2 rounded-lg border transition-all duration-300 truncate cursor-pointer hover:scale-[1.02] active:scale-95 font-black uppercase tracking-wider
                                                ${getEventTypeColor(event.type).replace(/bg-blue-100|bg-purple-100|bg-red-100|bg-emerald-100|bg-slate-100/g, (m) => {
                                                if (m.includes('blue')) return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
                                                if (m.includes('purple')) return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
                                                if (m.includes('red')) return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
                                                if (m.includes('emerald')) return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
                                                return 'bg-white/5 border-white/10 text-slate-400';
                                            })}
                                            `}
                                        >
                                            <div className="truncate mb-0.5 italic">{event.title}</div>
                                            <div className="opacity-60 flex items-center gap-1 text-[8px]">
                                                <Clock size={10} />
                                                {format(parseISO(event.start_time), 'HH:mm')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="premium-card bg-card shadow-[0_0_50px_rgba(34,211,238,0.1)] w-full max-w-md animate-in zoom-in-95 duration-200 border-border">
                        <div className="flex justify-between items-center p-6 border-b border-border/50">
                            <h3 className="text-lg font-black text-foreground italic uppercase tracking-tighter">
                                {editingEvent ? (
                                    <>Editar <span className="text-primary">Evento</span></>
                                ) : (
                                    <>Novo <span className="text-primary">Agendamento</span></>
                                )}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 italic">Título do Compromisso</label>
                                <input
                                    type="text"
                                    required
                                    className="premium-input !pl-4 uppercase"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Ex: Visita ao Residencial..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 italic">Início</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        className="premium-input !pl-4 uppercase"
                                        value={formData.start_time}
                                        onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 italic">Término</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        className="premium-input !pl-4 uppercase"
                                        value={formData.end_time}
                                        onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 italic">Categoria</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['visit', 'meeting', 'task', 'deadline'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: type as any })}
                                            className={`
                                                py-3 text-[9px] font-black uppercase tracking-widest rounded-xl border transition-all
                                                ${formData.type === type
                                                    ? 'bg-primary text-black border-primary shadow-lg shadow-primary/10'
                                                    : 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10 hover:text-white'}
                                            `}
                                        >
                                            {getEventTypeLabel(type)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 italic">Observações</label>
                                <textarea
                                    className="premium-input !pl-4 min-h-[100px] py-4"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Detalhes adicionais..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 italic">Corretor Responsável</label>
                                    <select
                                        className="premium-input !pl-4 appearance-none"
                                        value={formData.agent_id}
                                        onChange={e => setFormData({ ...formData, agent_id: e.target.value })}
                                    >
                                        <option value="" className="bg-card text-foreground">Selecione...</option>
                                        {agents.map(agent => (
                                            <option key={agent.id} value={agent.id} className="bg-card text-foreground">{agent.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 italic">Cliente Vinculado</label>
                                    <select
                                        className="premium-input !pl-4 appearance-none"
                                        value={formData.client_id}
                                        onChange={e => setFormData({ ...formData, client_id: e.target.value })}
                                    >
                                        <option value="" className="bg-card text-foreground">Selecione...</option>
                                        {clients.map(client => (
                                            <option key={client.id} value={client.id} className="bg-card text-foreground">{client.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-4">
                                {editingEvent && (
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="mr-auto px-4 py-2 text-rose-500 hover:bg-rose-500/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-rose-500/20"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="premium-button"
                                >
                                    <Check size={18} /> SALVAR COMPROMISSO
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
