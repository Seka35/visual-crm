import React from 'react';
import { TrendingUp, Users, CheckCircle, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { Briefcase as BriefcaseIcon } from 'lucide-react';

const KPICard = ({ title, value, change, icon: Icon, color, trend, path }) => {
    const navigate = useNavigate();

    const colorStyles = {
        primary: "text-primary bg-primary/10 border-primary/20",
        secondary: "text-secondary bg-secondary/10 border-secondary/20",
        success: "text-success bg-success/10 border-success/20",
        warning: "text-warning bg-warning/10 border-warning/20",
    };

    return (
        <div
            onClick={() => path && navigate(path)}
            className="glass-card p-5 rounded-2xl hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-xl", colorStyles[color])}>
                    <Icon className="w-6 h-6" />
                </div>
                <span className={cn(
                    "text-xs font-bold px-2 py-1 rounded-lg",
                    trend > 0 ? "text-success bg-success/10" : "text-danger bg-danger/10"
                )}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
            </div>

            <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
    );
};

const KPICards = ({ revenue = 0, activeDeals = 0, pendingTasks = 0, meetingsToday = 0 }) => {
    const kpis = [
        {
            title: "Total Revenue",
            value: `$${revenue.toLocaleString()}`,
            change: 12.5,
            icon: TrendingUp,
            color: "primary",
            trend: 12.5,
            path: '/deals'
        },
        {
            title: "Active Deals",
            value: activeDeals.toString(),
            change: 5.2,
            icon: BriefcaseIcon,
            color: "secondary",
            trend: 5.2,
            path: '/deals'
        },
        {
            title: "Pending Tasks",
            value: pendingTasks.toString(),
            change: -2.4,
            icon: CheckCircle,
            color: "success",
            trend: -2.4,
            path: '/tasks'
        },
        {
            title: "Meetings Today",
            value: meetingsToday.toString(),
            change: 0,
            icon: Calendar,
            color: "warning",
            trend: 0,
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
