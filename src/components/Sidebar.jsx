import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, CheckSquare, BarChart2, Calendar, Settings, LogOut, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '../lib/utils';

import { useTheme } from '../context/ThemeContext';
import logoWhite from '../assets/logo_white.png';
import logoBlack from '../assets/logo_black.png';

const Sidebar = ({ isCollapsed, toggleCollapse, isMobileOpen, closeMobile }) => {
    const { theme } = useTheme();
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Users, label: 'Contacts', path: '/contacts' },
        { icon: Briefcase, label: 'Deals', path: '/deals' },
        { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
        { icon: Calendar, label: 'Calendar', path: '/calendar' },
        { icon: BarChart2, label: 'Reports', path: '/reports' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={closeMobile}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 h-screen bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/50 flex flex-col z-50 transition-all duration-300",
                    isCollapsed ? "w-20" : "w-64",
                    // Mobile: slide in/out
                    isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            >
                <div className={cn("p-6 flex items-center justify-center", isCollapsed && "px-2")}>
                    <div className={cn("transition-all duration-300 flex items-center justify-center", isCollapsed ? "w-10 h-10" : "w-64 h-64 -my-10")}>
                        <img src={theme === 'dark' ? logoWhite : logoBlack} alt="Visual CRM" className="w-full h-full object-contain" />
                    </div>
                    {/* Mobile Close Button */}
                    <button onClick={closeMobile} className="md:hidden absolute top-4 right-4 text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => closeMobile()} // Close on mobile when clicked
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative",
                                    isActive
                                        ? "bg-primary/20 text-white shadow-lg shadow-primary/10 border border-primary/20"
                                        : "text-slate-400 hover:bg-white/5 hover:text-white",
                                    isCollapsed && "justify-center px-2"
                                )
                            }
                            title={isCollapsed ? item.label : undefined}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className="w-5 h-5 min-w-[1.25rem]" />
                                    {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                                    {isActive && !isCollapsed && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                    )}
                                    {isActive && isCollapsed && (
                                        <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10 space-y-2">
                    {/* Collapse Toggle (Desktop Only) */}
                    <button
                        onClick={toggleCollapse}
                        className="hidden md:flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-300 justify-center"
                    >
                        {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>

                    <button
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-white/5 hover:text-danger transition-all duration-300 group",
                            isCollapsed && "justify-center px-2"
                        )}
                    >
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform min-w-[1.25rem]" />
                        {!isCollapsed && <span className="font-medium whitespace-nowrap">Logout</span>}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
