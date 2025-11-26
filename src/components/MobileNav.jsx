import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, CheckSquare, Calendar, Sparkles, BarChart2 } from 'lucide-react';
import { cn } from '../lib/utils';

const MobileNav = ({ onOpenAI }) => {
    const navItems = [
        { icon: LayoutDashboard, label: 'Home', path: '/' },
        { icon: Users, label: 'Contacts', path: '/contacts' },
        { icon: Briefcase, label: 'Deals', path: '/deals' },
        { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
        { icon: Calendar, label: 'Calendar', path: '/calendar' },
        { icon: BarChart2, label: 'Debts', path: '/debts' },
    ];

    // Split items to place AI button in middle (3 on left, 3 on right)
    const leftItems = navItems.slice(0, 3);
    const rightItems = navItems.slice(3);

    return (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-4 z-[9999] md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            {leftItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                        cn(
                            "flex flex-col items-center justify-center w-12 h-full gap-1 transition-colors",
                            isActive ? "text-primary" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                        )
                    }
                >
                    <item.icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium">{item.label}</span>
                </NavLink>
            ))}

            {/* Central AI Button */}
            <div className="relative -top-6">
                <button
                    onClick={onOpenAI}
                    className="w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full shadow-lg shadow-orange-500/30 flex items-center justify-center text-white hover:scale-110 transition-transform ring-4 ring-slate-50 dark:ring-slate-900"
                >
                    <Sparkles className="w-6 h-6 animate-pulse" />
                </button>
            </div>

            {rightItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                        cn(
                            "flex flex-col items-center justify-center w-12 h-full gap-1 transition-colors",
                            isActive ? "text-primary" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                        )
                    }
                >
                    <item.icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium">{item.label}</span>
                </NavLink>
            ))}
        </div>
    );
};

export default MobileNav;
