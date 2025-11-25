import React, { useEffect, useState } from 'react';
import { User, Mail, Calendar, Shield, Share2 } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { useSearchParams } from 'react-router-dom';
import WorkflowManager from '../components/WorkflowManager';
import EditProfileModal from '../components/EditProfileModal';

const Profile = () => {
    const { user } = useCRM();
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    if (!user) return null;

    const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
    const email = user.email;
    const lastSignIn = new Date(user.last_sign_in_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    const avatarUrl = user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`;

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 p-4 sm:p-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">My Profile</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account settings and preferences</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => handleTabChange('profile')}
                    className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === 'profile' ? 'text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                >
                    Profile Details
                    {activeTab === 'profile' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => handleTabChange('workflows')}
                    className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === 'workflows' ? 'text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                >
                    Workflows
                    {activeTab === 'workflows' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                    )}
                </button>
            </div>

            {activeTab === 'profile' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Identity Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 flex flex-col items-center text-center h-full">
                            <div className="relative mb-4 group">
                                <div className="w-32 h-32 rounded-full p-1 border-2 border-slate-100 dark:border-slate-800">
                                    <img
                                        src={avatarUrl}
                                        alt="Profile"
                                        className="w-full h-full rounded-full object-cover bg-slate-50 dark:bg-slate-800"
                                    />
                                </div>
                                <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-slate-800 rounded-full shadow-md border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-primary transition-colors">
                                    <Share2 className="w-4 h-4" />
                                </button>
                            </div>

                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{displayName}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700">
                                CRM User
                            </p>

                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                            >
                                Edit Profile
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Details Grid */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* General Info */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                General Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary/30 transition-colors group">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-primary group-hover:text-primary">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-semibold text-slate-400 uppercase">Email</span>
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-200 font-medium truncate" title={email}>{email}</p>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-purple-200 transition-colors group">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-purple-500 group-hover:text-purple-600">
                                            <Shield className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-semibold text-slate-400 uppercase">User ID</span>
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-200 font-medium font-mono text-xs truncate" title={user.id}>{user.id}</p>
                                </div>
                            </div>
                        </div>

                        {/* Security & Activity */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                Security & Activity
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-green-200 transition-colors group">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-green-500 group-hover:text-green-600">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-semibold text-slate-400 uppercase">Last Sign In</span>
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-200 font-medium">{lastSignIn}</p>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-orange-200 transition-colors group">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-orange-500 group-hover:text-orange-600">
                                            <Shield className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-semibold text-slate-400 uppercase">Account Status</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                        </span>
                                        <p className="text-slate-700 dark:text-slate-200 font-medium">Active</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'workflows' && (
                <WorkflowManager />
            )}

            <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
        </div>
    );
};

export default Profile;
