import React from 'react';
import { Sun, Cloud, CloudRain } from 'lucide-react';

const WelcomeCard = ({ user, tasks = [], events = [] }) => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    const pendingTasks = tasks.filter(t => !t.completed).length;
    const today = new Date().toISOString().split('T')[0];
    const todaysMeetings = events.filter(e => {
        const eventDate = e.date instanceof Date ? e.date.toISOString().split('T')[0] : new Date(e.date).toISOString().split('T')[0];
        return eventDate === today;
    }).length;

    return (
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />

            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">
                        {greeting}, {user?.user_metadata?.full_name?.split(' ')[0] || 'User'}! 👋
                    </h2>
                    <p className="text-slate-500 mb-4">
                        You have {pendingTasks} tasks pending and {todaysMeetings} meetings today.
                    </p>
                    <div className="flex items-center gap-2 text-sm font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-lg w-fit">
                        <Sun className="w-4 h-4" />
                        <span>Sales Forecast: Sunny</span>
                    </div>
                </div>

                <div className="text-right hidden sm:block">
                    <p className="text-sm text-slate-400 font-medium">Daily Goal</p>
                    <div className="flex items-end gap-2 justify-end">
                        <span className="text-3xl font-bold text-slate-800">85%</span>
                        <span className="text-sm text-success mb-1 font-medium">+12%</span>
                    </div>
                    <div className="w-32 h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-secondary w-[85%] rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeCard;
