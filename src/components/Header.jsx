import React, { useState } from 'react';
import { Search, Bell, ChevronDown, Settings, User, LogOut, HelpCircle, Moon, Sun, Share2, Plus, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { useCRM } from '../context/CRMContext';
import { useWorkflow } from '../context/WorkflowContext';
import { useNavigate } from 'react-router-dom';
import NotificationCenter from './NotificationCenter';
import WorkflowSettingsModal from './WorkflowSettingsModal';

import { useTheme } from '../context/ThemeContext';

import logoWhite from '../assets/logo_white.png';
import logoBlack from '../assets/logo_black.png';

const Header = ({ onMenuClick }) => {
    const { user, signOut } = useCRM();
    const { currentWorkflow, workflows, switchWorkflow, notifications } = useWorkflow();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isWorkflowOpen, setIsWorkflowOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    // Get user display name and email
    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const userEmail = user?.email || '';
    const userAvatar = user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userEmail}`;

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <>
            <header className="h-20 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 glass mb-8 rounded-b-2xl mx-4 mt-2">
                <div className="flex items-center gap-4 flex-1 max-w-xl">
                    {/* Mobile Logo */}
                    <div className="sm:hidden w-8 h-8 flex-shrink-0">
                        <img src={theme === 'dark' ? logoWhite : logoBlack} alt="Logo" className="w-full h-full object-contain" />
                    </div>

                    <div className="relative w-full group hidden sm:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search anything... (Cmd+K)"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-100/50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none text-slate-600 dark:text-slate-200 placeholder:text-slate-400"
                        />
                    </div>
                    <button className="sm:hidden p-2 hover:bg-slate-100 rounded-xl text-slate-600">
                        <Search className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex items-center gap-2 sm:gap-6">
                    {/* Workflow Switcher */}
                    <div className="relative hidden md:block">
                        <button
                            onClick={() => setIsWorkflowOpen(!isWorkflowOpen)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-100 dark:border-slate-700 transition-colors"
                        >
                            <Share2 className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[150px] truncate">
                                {currentWorkflow ? currentWorkflow.name : 'Personal Workspace'}
                            </span>
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                        </button>

                        {isWorkflowOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsWorkflowOpen(false)} />
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 p-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-2">
                                        <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider px-2">Switch Workspace</p>
                                        <button
                                            onClick={() => {
                                                switchWorkflow(null);
                                                setIsWorkflowOpen(false);
                                            }}
                                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            <span className={!currentWorkflow ? 'font-bold text-primary' : 'text-slate-600 dark:text-slate-300'}>Personal Workspace</span>
                                            {!currentWorkflow && <Check className="w-4 h-4 text-primary" />}
                                        </button>
                                        {workflows.map(wf => (
                                            <div key={wf.id} className="flex items-center group">
                                                <button
                                                    onClick={() => {
                                                        switchWorkflow(wf);
                                                        setIsWorkflowOpen(false);
                                                    }}
                                                    className="flex-1 flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                                                >
                                                    <span className={currentWorkflow?.id === wf.id ? 'font-bold text-primary' : 'text-slate-600 dark:text-slate-300'}>{wf.name}</span>
                                                    {currentWorkflow?.id === wf.id && <Check className="w-4 h-4 text-primary" />}
                                                </button>
                                                {currentWorkflow?.id === wf.id && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setIsSettingsOpen(true);
                                                            setIsWorkflowOpen(false);
                                                        }}
                                                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary"
                                                    >
                                                        <Settings className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t border-slate-100 dark:border-slate-800 p-2">
                                        <button
                                            onClick={() => {
                                                navigate('/profile?tab=workflows');
                                                setIsWorkflowOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Create / Join Workflow
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors group"
                        >
                            <Bell className="w-6 h-6 text-slate-500 group-hover:text-primary transition-colors" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                            )}
                        </button>
                        <NotificationCenter isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 pl-2 sm:pl-6 sm:border-l border-slate-200 hover:opacity-80 transition-opacity"
                        >
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{displayName}</p>
                                <p className="text-xs text-slate-500">CRM User</p>
                            </div>
                            <div className="flex items-center gap-2 p-1.5 rounded-xl transition-colors border border-transparent hover:border-slate-200">
                                <img
                                    src={userAvatar}
                                    alt="User"
                                    className="w-10 h-10 rounded-full bg-primary/10"
                                />
                                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isProfileOpen && "rotate-180")} />
                            </div>
                        </button>

                        {isProfileOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsProfileOpen(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-3 border-b border-slate-100 mb-2">
                                        <p className="font-bold text-slate-800 dark:text-white">{displayName}</p>
                                        <p className="text-xs text-slate-500">{userEmail}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <button
                                            onClick={() => {
                                                navigate('/profile');
                                                setIsProfileOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-colors"
                                        >
                                            <User className="w-4 h-4" />
                                            <span>My Profile</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigate('/profile?tab=workflows');
                                                setIsProfileOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-colors"
                                        >
                                            <Share2 className="w-4 h-4" />
                                            <span>Workflows</span>
                                        </button>
                                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-colors">
                                            <Settings className="w-4 h-4" />
                                            <span>Account Settings</span>
                                        </button>

                                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-colors">
                                            <HelpCircle className="w-4 h-4" />
                                            <span>Help & Support</span>
                                        </button>
                                    </div>

                                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-danger hover:bg-danger/5 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <WorkflowSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </>
    );
};

export default Header;
