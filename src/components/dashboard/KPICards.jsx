import React from 'react';
import { TrendingUp, Users, CheckCircle, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { Briefcase as BriefcaseIcon } from 'lucide-react';

const KPICard = ({ title, value, icon: Icon, color, path }) => {
    const navigate = useNavigate();

    const colorStyles = {
        primary: "text-primary bg-primary/10 border-primary/20",
        secondary: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        success: "text-green-500 bg-green-500/10 border-green-500/20",
        warning: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    };

    const iconColorStyles = {
        primary: "text-primary",
        secondary: "text-blue-500",
        success: "text-green-500",
        warning: "text-orange-500",
    };

    return (
        <div
            onClick={() => path && navigate(path)}
            className="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden group min-h-[140px] flex items-center"
        >
            <div className="relative z-10 flex items-center justify-between w-full">
                <div className={cn("p-4 rounded-2xl transition-colors shrink-0", colorStyles[color])}>
                    <Icon className="w-8 h-8" />
                </div>

                <div className="flex flex-col items-end">
                    <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 font-gta text-right">{title}</h3>
                    <p className="text-5xl font-bold text-slate-800 dark:text-white font-gta tracking-wide text-right -rotate-2 origin-bottom-right drop-shadow-md">{value}</p>
                </div>
            </div>

            {/* Decorative background icon */}
            <Icon className={cn("absolute -bottom-4 -right-4 w-32 h-32 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rotate-12", iconColorStyles[color])} />
        </div>
    );
};

const KPICards = ({ revenue = 0, activeDeals = 0, pendingTasks = 0, meetingsToday = 0 }) => {
    const kpis = [
        {
            title: "THE STASH",
            value: `$${revenue.toLocaleString()}`,
            icon: TrendingUp,
            color: "primary",
            path: '/reports'
        },
        {
            title: "ACTIVE HUSTLES",
            value: activeDeals.toString(),
            icon: BriefcaseIcon,
            color: "secondary",
            path: '/deals'
        },
        {
            title: "LOOSE ENDS",
            value: pendingTasks.toString(),
            icon: CheckCircle,
            color: "success",
            path: '/tasks'
        },
        {
            title: "SIT DOWNS",
            value: meetingsToday.toString(),
            icon: Calendar,
            color: "warning",
            path: '/calendar'
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, index) => (
                <KPICard key={index} {...kpi} />
            ))}
        </div>
    );
};

export default KPICards;
