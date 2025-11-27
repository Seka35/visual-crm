import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock } from 'lucide-react';
import EventModal from '../components/calendar/EventModal';

import { useCRM } from '../context/CRMContext';

const Calendar = () => {
    const { events, addEvent, updateEvent, deleteEvent } = useCRM();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const goToToday = () => setCurrentDate(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getEventsForDay = (day) => {
        return events.filter(event => isSameDay(new Date(event.date), day));
    };

    const handleEditEvent = (event, e) => {
        e.stopPropagation();
        setEditingEvent(event);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingEvent(null);
    };

    const handleDayClick = (day) => {
        // Optional: Open modal pre-filled with clicked date
        // For now, just open modal
        setEditingEvent({ date: day });
        setIsModalOpen(true);
    };

    const getEventTypeColor = (type) => {
        switch (type) {
            case 'meeting':
                return 'bg-blue-500/20 dark:bg-blue-500/30 text-blue-700 dark:text-blue-300 border-blue-500/40 dark:border-blue-500/50';
            case 'call':
                return 'bg-green-500/20 dark:bg-green-500/30 text-green-700 dark:text-green-300 border-green-500/40 dark:border-green-500/50';
            case 'deadline':
                return 'bg-red-500/20 dark:bg-red-500/30 text-red-700 dark:text-red-300 border-red-500/40 dark:border-red-500/50';
            case 'personal':
                return 'bg-purple-500/20 dark:bg-purple-500/30 text-purple-700 dark:text-purple-300 border-purple-500/40 dark:border-purple-500/50';
            default:
                return 'bg-slate-500/20 dark:bg-slate-500/30 text-slate-700 dark:text-slate-300 border-slate-500/40 dark:border-slate-500/50';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-6xl font-bold font-gta text-slate-800 dark:text-white mb-4">THE PLAN</h2>
                    <p className="text-slate-500 dark:text-slate-400">Know where you need to be.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="flex bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-1 shadow-sm w-full sm:w-auto justify-center">
                        <button onClick={prevMonth} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={goToToday} className="px-4 py-2 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            Today
                        </button>
                        <button onClick={nextMonth} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
                    >
                        <Plus className="w-5 h-5" />
                        <span>New Sit Down</span>
                    </button>
                </div>
            </div>

            <div className="glass-card rounded-2xl flex-1 flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] dark:bg-slate-900 dark:border-slate-800">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-primary" />
                        {format(currentDate, 'MMMM yyyy')}
                    </h3>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    {weekDays.map(day => (
                        <div key={day} className="py-3 text-center text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                    {calendarDays.map((day, dayIdx) => {
                        const dayEvents = getEventsForDay(day);
                        return (
                            <div
                                key={day.toString()}
                                onClick={() => handleDayClick(day)}
                                className={`
                                    min-h-[100px] p-2 border-b border-r border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer relative group
                                    ${!isSameMonth(day, currentDate) ? 'bg-slate-50/30 dark:bg-slate-800/30 text-slate-400 dark:text-slate-600' : 'bg-white dark:bg-slate-900'}
                                    ${isToday(day) ? 'bg-primary/5' : ''}
                                `}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`
                                        text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                                        ${isToday(day) ? 'bg-primary text-white shadow-md' : 'text-slate-700 dark:text-slate-300'}
                                    `}>
                                        {format(day, 'd')}
                                    </span>
                                    {isToday(day) && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50" />
                                    )}
                                    {dayEvents.length > 0 && !isToday(day) && (
                                        <span className="text-xs font-bold text-slate-400">{dayEvents.length}</span>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    {dayEvents.map(event => (
                                        <div
                                            key={event.id}
                                            onClick={(e) => handleEditEvent(event, e)}
                                            className="relative group/event"
                                        >
                                            <div
                                                className={`
                                                    px-2 py-1 rounded-lg text-xs font-medium border truncate transition-all hover:scale-105 hover:shadow-sm cursor-pointer
                                                    ${getEventTypeColor(event.type)}
                                                `}
                                            >
                                                {event.time} {event.title}
                                            </div>

                                            {/* Tooltip on hover */}
                                            <div className="absolute left-0 top-full mt-1 w-64 bg-slate-900 text-white p-3 rounded-xl shadow-2xl z-50 opacity-0 invisible group-hover/event:opacity-100 group-hover/event:visible transition-all duration-200 pointer-events-none">
                                                <div className="space-y-2">
                                                    <div>
                                                        <p className="text-xs text-slate-400 uppercase tracking-wide">Event</p>
                                                        <p className="font-bold text-sm">{event.title}</p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div>
                                                            <p className="text-xs text-slate-400">Time</p>
                                                            <p className="text-sm font-medium">{event.time}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-slate-400">Type</p>
                                                            <p className="text-sm font-medium capitalize">{event.type}</p>
                                                        </div>
                                                    </div>
                                                    {event.description && (
                                                        <div>
                                                            <p className="text-xs text-slate-400">Description</p>
                                                            <p className="text-sm">{event.description}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Arrow */}
                                                <div className="absolute -top-1 left-4 w-2 h-2 bg-slate-900 transform rotate-45"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Add button on hover */}
                                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20">
                                        <Plus className="w-3 h-3" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <EventModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                initialData={editingEvent}
                onSubmit={async (eventData) => {
                    if (editingEvent && editingEvent.id) {
                        await updateEvent(editingEvent.id, eventData);
                    } else {
                        await addEvent(eventData);
                    }
                }}
                onDelete={deleteEvent}
            />
        </div>
    );
};

export default Calendar;
