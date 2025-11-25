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
            case 'meeting': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'call': return 'bg-green-100 text-green-700 border-green-200';
            case 'deadline': return 'bg-red-100 text-red-700 border-red-200';
            case 'personal': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Calendar</h2>
                    <p className="text-slate-500">Manage your schedule and events</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm w-full sm:w-auto justify-center">
                        <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={goToToday} className="px-4 py-2 font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                            Today
                        </button>
                        <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add Event</span>
                    </button>
                </div>
            </div>

            <div className="glass-card rounded-2xl flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-primary" />
                        {format(currentDate, 'MMMM yyyy')}
                    </h3>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
                    {weekDays.map(day => (
                        <div key={day} className="py-3 text-center text-sm font-bold text-slate-500 uppercase tracking-wider">
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
                                    min-h-[100px] p-2 border-b border-r border-slate-100 transition-colors hover:bg-slate-50 cursor-pointer relative group
                                    ${!isSameMonth(day, currentDate) ? 'bg-slate-50/30 text-slate-400' : 'bg-white'}
                                    ${isToday(day) ? 'bg-blue-50/30' : ''}
                                `}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`
                                        text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                                        ${isToday(day) ? 'bg-blue-600 text-white shadow-md' : 'text-slate-700'}
                                    `}>
                                        {format(day, 'd')}
                                    </span>
                                    {dayEvents.length > 0 && (
                                        <span className="text-xs font-bold text-slate-400">{dayEvents.length}</span>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    {dayEvents.map(event => (
                                        <div
                                            key={event.id}
                                            onClick={(e) => handleEditEvent(event, e)}
                                            className={`
                                                px-2 py-1 rounded-lg text-xs font-medium border truncate transition-all hover:scale-105 hover:shadow-sm
                                                ${getEventTypeColor(event.type)}
                                            `}
                                        >
                                            {event.time} {event.title}
                                        </div>
                                    ))}
                                </div>

                                {/* Add button on hover */}
                                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
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
