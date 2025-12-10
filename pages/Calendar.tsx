import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils';
import {
    format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths,
    addWeeks, subWeeks, addDays, subDays,
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
    const { user, agents, clients, financialRecords } = useApp();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'month' | 'week' | 'day'>('month');
    const [dbEvents, setDbEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);

    // Combine DB Events with Financial Records
    const events = React.useMemo(() => {
        const financeEvents: Event[] = financialRecords
            .filter(r => r.status === 'pending') // Only show pending? Or all? User asked for "contas a pagar e receber". Usually pending is most important, but maybe all. Let's show all but distinguish status.
            .map(r => ({
                id: `fin_${r.id}`, // Prefix to avoid collision
                title: `${r.type === 'income' ? '💰' : '💸'} ${r.description} (${formatCurrency(r.amount)})`,
                description: `Categoria: ${r.category} | Status: ${r.status === 'paid' ? 'Pago' : 'Pendente'}`,
                start_time: `${r.dueDate}T08:00:00`, // Default time
                end_time: `${r.dueDate}T09:00:00`,
                type: r.type === 'income' ? 'financial-receive' : 'financial-pay',
                agent_id: null,
                client_id: null
            }));

        return [...dbEvents, ...financeEvents];
    }, [dbEvents, financialRecords]);

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
            setDbEvents(data);
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
    const handlePrev = () => {
        if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
        if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
        if (view === 'day') setCurrentDate(subDays(currentDate, 1));
    };

    const handleNext = () => {
        if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
        if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
        if (view === 'day') setCurrentDate(addDays(currentDate, 1));
    };

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

        // Prevent editing financial records for now
        if (event.type === 'financial-pay' || event.type === 'financial-receive') {
            alert(`Detalhes do Lançamento:\n\n${event.title}\n${event.description}\nVencimento: ${format(parseISO(event.start_time), 'dd/MM/yyyy')}`);
            return;
        }

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

        try {
            const eventData = {
                ...formData,
                start_time: new Date(formData.start_time).toISOString(),
                end_time: new Date(formData.end_time).toISOString(),
                agent_id: formData.agent_id || null,
                client_id: formData.client_id || null
            };

            const { error } = editingEvent
                ? await supabase.from('events').update(eventData).eq('id', editingEvent.id)
                : await supabase.from('events').insert([eventData]);

            if (error) throw error;

            setIsModalOpen(false);
            fetchEvents();
        } catch (error) {
            console.error('Error saving event:', error);
            alert('Erro ao salvar evento. Verifique o console para mais detalhes.');
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
                alert('Erro ao excluir evento.');
            }
        }
    };

    const getEventTypeColor = (type: string) => {
        switch (type) {
            case 'visit': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'meeting': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'deadline': return 'bg-red-100 text-red-700 border-red-200';
            case 'task': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'financial-pay': return 'bg-red-50 text-red-600 border-red-100';
            case 'financial-receive': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getEventTypeLabel = (type: string) => {
        switch (type) {
            case 'visit': return 'Visita';
            case 'meeting': return 'Reunião';
            case 'deadline': return 'Prazo';
            case 'task': return 'Tarefa';
            case 'financial-pay': return 'Conta a Pagar';
            case 'financial-receive': return 'Conta a Receber';
            default: return type;
        }
    };

    // Render Methods
    const renderMonthView = () => (
        <>
            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                {weekDays.map(day => (
                    <div key={day} className="py-2 text-center text-sm font-semibold text-slate-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 auto-rows-fr bg-slate-200 gap-px">
                {calendarDays.map((day, idx) => {
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isToday = isSameDay(day, new Date());
                    const dayEvents = events.filter(e => isSameDay(parseISO(e.start_time), day));

                    return (
                        <div
                            key={day.toString()}
                            onClick={() => handleDayClick(day)}
                            className={`
                  min-h-[120px] bg-white p-2 transition-colors hover:bg-slate-50 cursor-pointer
                  ${!isCurrentMonth ? 'bg-slate-50/50 text-slate-400' : ''}
                `}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`
                    text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                    ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700'}
                  `}>
                                    {format(day, 'd')}
                                </span>
                                {dayEvents.length > 0 && (
                                    <span className="text-xs font-bold text-slate-400">{dayEvents.length}</span>
                                )}
                            </div>

                            <div className="space-y-1">
                                {dayEvents.map(event => (
                                    <div
                                        key={event.id}
                                        onClick={(e) => handleEventClick(e, event)}
                                        className={`
                        text-xs p-1.5 rounded border truncate cursor-pointer hover:opacity-80
                        ${getEventTypeColor(event.type)}
                      `}
                                    >
                                        <div className="font-semibold truncate">{event.title}</div>
                                        <div className="text-[10px] opacity-75 flex items-center gap-1">
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
        </>
    );

    const renderWeekView = () => {
        const start = startOfWeek(currentDate);
        const days = eachDayOfInterval({ start, end: endOfWeek(currentDate) });
        const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 08:00 to 18:00

        return (
            <div className="flex flex-col h-[600px] overflow-y-auto">
                {/* Header */}
                <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
                    <div className="p-2 text-center text-xs font-semibold text-slate-400 border-r border-slate-200">
                        Hora
                    </div>
                    {days.map(day => (
                        <div key={day.toString()} className={`p-2 text-center border-r border-slate-200 ${isSameDay(day, new Date()) ? 'bg-blue-50' : ''}`}>
                            <div className="text-xs font-semibold text-slate-500 uppercase">{format(day, 'EEE', { locale: ptBR })}</div>
                            <div className={`text-sm font-bold ${isSameDay(day, new Date()) ? 'text-blue-600' : 'text-slate-700'}`}>
                                {format(day, 'd')}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-8 flex-1">
                    {/* Time Column */}
                    <div className="border-r border-slate-200 bg-slate-50">
                        {hours.map(hour => (
                            <div key={hour} className="h-20 border-b border-slate-200 text-xs text-slate-400 p-2 text-right relative">
                                <span className="-top-2 relative">{hour}:00</span>
                            </div>
                        ))}
                    </div>

                    {/* Days Columns */}
                    {days.map(day => {
                        const dayEvents = events.filter(e => isSameDay(parseISO(e.start_time), day));
                        return (
                            <div key={day.toString()} className="border-r border-slate-200 relative group" onClick={() => handleDayClick(day)}>
                                {hours.map(hour => (
                                    <div key={hour} className="h-20 border-b border-slate-100 hover:bg-slate-50 transition-colors"></div>
                                ))}

                                {/* Events */}
                                {dayEvents.map(event => {
                                    const start = parseISO(event.start_time);
                                    const end = parseISO(event.end_time);
                                    const startHour = start.getHours();
                                    const startMin = start.getMinutes();
                                    const durationMin = (end.getTime() - start.getTime()) / (1000 * 60);

                                    // Calculate position relative to 08:00
                                    const topOffset = ((startHour - 8) * 80) + ((startMin / 60) * 80);
                                    const height = (durationMin / 60) * 80;

                                    if (startHour < 8 || startHour > 18) return null; // Hide out of bounds for now

                                    return (
                                        <div
                                            key={event.id}
                                            onClick={(e) => handleEventClick(e, event)}
                                            className={`absolute left-1 right-1 rounded border p-1 text-xs cursor-pointer hover:z-10 shadow-sm ${getEventTypeColor(event.type)}`}
                                            style={{ top: `${topOffset}px`, height: `${Math.max(height, 20)}px` }}
                                        >
                                            <div className="font-semibold truncate">{event.title}</div>
                                            <div className="text-[10px] opacity-75">{format(start, 'HH:mm')} - {format(end, 'HH:mm')}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderDayView = () => {
        const hours = Array.from({ length: 13 }, (_, i) => i + 7); // 07:00 to 19:00
        const dayEvents = events.filter(e => isSameDay(parseISO(e.start_time), currentDate));

        return (
            <div className="flex flex-col h-[600px] overflow-y-auto">
                <div className="grid grid-cols-1 flex-1 relative">
                    {hours.map(hour => (
                        <div key={hour} className="h-24 border-b border-slate-100 flex group hover:bg-slate-50 transition-colors">
                            <div className="w-20 border-r border-slate-200 p-2 text-right text-sm text-slate-400 font-medium">
                                {hour}:00
                            </div>
                            <div className="flex-1 relative" onClick={() => {
                                const date = new Date(currentDate);
                                date.setHours(hour, 0, 0, 0);
                                handleDayClick(date);
                            }}>
                                {/* Events for this hour */}
                            </div>
                        </div>
                    ))}

                    {/* Absolute Events Overlay */}
                    {dayEvents.map(event => {
                        const start = parseISO(event.start_time);
                        const end = parseISO(event.end_time);
                        const startHour = start.getHours();
                        const startMin = start.getMinutes();
                        const durationMin = (end.getTime() - start.getTime()) / (1000 * 60);

                        // Calculate position relative to 07:00
                        const topOffset = ((startHour - 7) * 96) + ((startMin / 60) * 96); // 96px = h-24
                        const height = (durationMin / 60) * 96;

                        if (startHour < 7 || startHour > 19) return null;

                        return (
                            <div
                                key={event.id}
                                onClick={(e) => handleEventClick(e, event)}
                                className={`absolute left-24 right-4 rounded-lg border p-3 text-sm cursor-pointer hover:z-10 shadow-md ${getEventTypeColor(event.type)}`}
                                style={{ top: `${topOffset}px`, height: `${Math.max(height, 40)}px` }}
                            >
                                <div className="flex justify-between items-start">
                                    <span className="font-bold">{event.title}</span>
                                    <span className="text-xs opacity-75 bg-white/30 px-2 py-1 rounded">{format(start, 'HH:mm')} - {format(end, 'HH:mm')}</span>
                                </div>
                                {event.description && <p className="text-xs mt-1 opacity-90 line-clamp-2">{event.description}</p>}
                                <div className="flex gap-2 mt-2 text-xs opacity-75">
                                    {event.client_id && <span className="flex items-center gap-1"><User size={12} /> Cliente</span>}
                                    {event.agent_id && <span className="flex items-center gap-1"><User size={12} /> Corretor</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <CalendarIcon className="text-blue-600" />
                        Agenda
                    </h1>
                    <p className="text-slate-500">Gerencie visitas e compromissos.</p>
                </div>
                <button
                    onClick={() => handleDayClick(new Date())}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <Plus size={20} />
                    Novo Evento
                </button>
            </div>

            {/* Calendar Container */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Calendar Header */}
                <div className="p-4 flex flex-col md:flex-row items-center justify-between border-b border-slate-200 bg-slate-50 gap-4">
                    <div className="flex items-center gap-2 bg-slate-200 rounded-lg p-1">
                        <button
                            onClick={() => setView('month')}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${view === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                        >
                            Mês
                        </button>
                        <button
                            onClick={() => setView('week')}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${view === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                        >
                            Semana
                        </button>
                        <button
                            onClick={() => setView('day')}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${view === 'day' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                        >
                            Dia
                        </button>
                    </div>

                    <h2 className="text-lg font-semibold text-slate-700 capitalize">
                        {view === 'month' && format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                        {view === 'week' && `Semana de ${format(startOfWeek(currentDate), 'dd/MM', { locale: ptBR })}`}
                        {view === 'day' && format(currentDate, "dd 'de' MMMM", { locale: ptBR })}
                    </h2>

                    <div className="flex items-center gap-2">
                        <button onClick={handlePrev} className="p-2 hover:bg-slate-200 rounded-full text-slate-600">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-md">
                            Hoje
                        </button>
                        <button onClick={handleNext} className="p-2 hover:bg-slate-200 rounded-full text-slate-600">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {view === 'month' && renderMonthView()}
                {view === 'week' && renderWeekView()}
                {view === 'day' && renderDayView()}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800">
                                {editingEvent ? 'Editar Evento' : 'Novo Evento'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Ex: Visita ao Residencial..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Início</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        value={formData.start_time}
                                        onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Fim</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        value={formData.end_time}
                                        onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                                <div className="flex gap-2">
                                    {['visit', 'meeting', 'task', 'deadline'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: type as any })}
                                            className={`
                        flex-1 py-2 text-xs font-medium rounded-md border transition-colors
                        ${formData.type === type
                                                    ? getEventTypeColor(type) + ' ring-2 ring-offset-1 ring-blue-500'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}
                      `}
                                        >
                                            {getEventTypeLabel(type)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    rows={3}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Corretor</label>
                                    <select
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        value={formData.agent_id}
                                        onChange={e => setFormData({ ...formData, agent_id: e.target.value })}
                                    >
                                        <option value="">Selecione...</option>
                                        {agents.map(agent => (
                                            <option key={agent.id} value={agent.id}>{agent.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                                    <select
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        value={formData.client_id}
                                        onChange={e => setFormData({ ...formData, client_id: e.target.value })}
                                    >
                                        <option value="">Selecione...</option>
                                        {clients.map(client => (
                                            <option key={client.id} value={client.id}>{client.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
                                {editingEvent && (
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="mr-auto text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                                    >
                                        <Trash2 size={16} /> Excluir
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-2"
                                >
                                    <Check size={16} /> Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
