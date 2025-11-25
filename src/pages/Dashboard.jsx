import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { useNavigate } from 'react-router-dom';
import WelcomeCard from '../components/dashboard/WelcomeCard';
import KPICards from '../components/dashboard/KPICards';
import PipelineWidget from '../components/dashboard/PipelineWidget';
import FunDashboard from '../components/dashboard/FunDashboard';
import SortableItem from '../components/dashboard/SortableItem';
import { Clock, Calendar, ArrowRight, Sparkles, GripVertical } from 'lucide-react';
import { useCRM } from '../context/CRMContext';

const Dashboard = () => {
    const { user, deals, tasks, events } = useCRM();
    const navigate = useNavigate();
    const [funMode, setFunMode] = useState(false);

    // Initial widget order
    const [items, setItems] = useState([
        'welcome',
        'kpi',
        'pipeline',
        'schedule'
    ]);

    // Load saved order from localStorage on mount
    useEffect(() => {
        const savedOrder = localStorage.getItem('dashboardOrder');
        if (savedOrder) {
            setItems(JSON.parse(savedOrder));
        }
    }, []);

    // Save order to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('dashboardOrder', JSON.stringify(items));
    }, [items]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // Calculate KPIs
    const allDeals = Object.values(deals).flatMap(column => column.items || []);

    const totalRevenue = (deals.won?.items || []).reduce((acc, deal) => {
        const amount = parseFloat(deal.amount?.replace(/[^0-9.-]+/g, "") || 0);
        return acc + amount;
    }, 0);

    const activeDealsCount = allDeals.filter(d => d.status !== 'won' && d.status !== 'lost').length;

    // Calculate pending tasks (To Do)
    const pendingTasksCount = tasks.filter(t => !t.completed).length;

    // Calculate meetings today
    const today = new Date().toISOString().split('T')[0];
    const todaysEvents = events.filter(e => {
        if (!e.date) return false;
        try {
            const eventDate = e.date instanceof Date ? e.date.toISOString().split('T')[0] : new Date(e.date).toISOString().split('T')[0];
            return eventDate === today;
        } catch (e) {
            return false;
        }
    });
    const meetingsTodayCount = todaysEvents.length;

    // Widget Renderers
    const renderWidget = (id) => {
        switch (id) {
            case 'welcome':
                return <WelcomeCard user={user} tasks={tasks} events={events} />;
            case 'kpi':
                return <KPICards
                    revenue={totalRevenue}
                    activeDeals={activeDealsCount}
                    pendingTasks={pendingTasksCount}
                    meetingsToday={meetingsTodayCount}
                />;
            case 'pipeline':
                return <PipelineWidget deals={deals} />;

            case 'schedule':
                return (
                    <div className="glass-card p-6 rounded-2xl h-full cursor-pointer hover:-translate-y-1 transition-transform duration-300" onClick={() => navigate('/calendar')}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                                Today's Schedule
                            </h3>
                            <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>
                                <Calendar className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {todaysEvents.length > 0 ? (
                                todaysEvents.map(event => (
                                    <div key={event.id} className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                                        <p className="font-bold text-slate-800 dark:text-white text-sm">{event.title}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{event.time}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500 text-center py-4">No events scheduled for today.</p>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const getItemClass = (id) => {
        switch (id) {
            case 'welcome': return 'col-span-1 md:col-span-2 lg:col-span-4';
            case 'kpi': return 'col-span-1 md:col-span-2 lg:col-span-4';
            case 'pipeline': return 'col-span-1 md:col-span-2 lg:col-span-3';

            case 'schedule': return 'col-span-1 md:col-span-1 lg:col-span-1';
            default: return 'col-span-1';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">


            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={items} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {items.map((id) => (
                            <SortableItem key={id} id={id} className={getItemClass(id)}>
                                {renderWidget(id)}
                            </SortableItem>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
};

export default Dashboard;
