import React from 'react';
import { Sun, Cloud, CloudRain } from 'lucide-react';

const WelcomeCard = ({ user, tasks = [], events = [] }) => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Rise & Grind' : hour < 18 ? "Keep Hustlin'" : 'Night Moves';

    const pendingTasks = tasks.filter(t => !t.completed).length;
    const today = new Date().toISOString().split('T')[0];
    const todaysMeetings = events.filter(e => {
        const eventDate = e.date instanceof Date ? e.date.toISOString().split('T')[0] : new Date(e.date).toISOString().split('T')[0];
        return eventDate === today;
    }).length;

    return (
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />

            <div className="relative z-10">
                <div>
                    <h2 className="text-5xl font-bold font-gta text-slate-800 dark:text-white mb-2 tracking-wide uppercase">
                        {greeting}, {user?.user_metadata?.full_name?.split(' ')[0] || 'Boss'}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-4 font-medium">
                        You got {pendingTasks} loose ends and {todaysMeetings} sit downs on the docket.
                    </p>
                    <div className="flex items-center gap-2 text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg w-fit uppercase tracking-wider">
                        <Sun className="w-4 h-4" />
                        <span>Money Forecast: Making Bank</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeCard;
