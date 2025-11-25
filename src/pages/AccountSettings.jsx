import React, { useState } from 'react';
import { User, Lock, Bell, Trash2, Save, Shield } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { supabase } from '../lib/supabaseClient';

const AccountSettings = () => {
    const { user } = useCRM();
    const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: fullName }
            });
            if (error) throw error;
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            setMessage({ type: 'success', text: 'Password updated successfully!' });
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto pb-10">
            {message && (
                <div className={`p-4 rounded-xl text-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    {message.text}
                </div>
            )}

            {/* Profile Section */}
            <div className="glass-card p-6 rounded-2xl space-y-6">
                <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold font-gta text-slate-800 dark:text-white tracking-wide">SYSTEM CONFIG</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Tweak the system.</p>
                    </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                        <label className="block text-slate-700 dark:text-slate-300 mb-2 font-medium">Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-800 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-700 dark:text-slate-300 mb-2 font-medium">Email Address</label>
                        <input
                            type="email"
                            value={user?.email}
                            disabled
                            className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 cursor-not-allowed"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 uppercase tracking-wide"
                    >
                        <Save className="w-5 h-5" />
                        <span>CONFIRM CHANGES</span>
                    </button>
                </form>
            </div>

            {/* Security Section */}
            <div className="glass-card p-6 rounded-2xl space-y-6">
                <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold font-gta text-slate-800 dark:text-white tracking-wide">Security</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your password</p>
                    </div>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                        <label className="block text-slate-700 dark:text-slate-300 mb-2 font-medium">New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-800 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-700 dark:text-slate-300 mb-2 font-medium">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-800 dark:text-white"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !password}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 uppercase tracking-wide"
                    >
                        <Lock className="w-5 h-5" />
                        <span>Update Password</span>
                    </button>
                </form>
            </div>

            {/* Danger Zone */}
            <div className="glass-card p-6 rounded-2xl space-y-6 border border-red-500/20">
                <div className="flex items-center gap-4 border-b border-red-500/10 pb-4">
                    <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
                        <Trash2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold font-gta text-red-500 tracking-wide">BURN IT DOWN</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Irreversible actions</p>
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-500/5 rounded-xl border border-red-500/10">
                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-white text-lg">Delete Account</h4>
                        <p className="text-slate-500 dark:text-slate-400">Permanently remove your account and all data</p>
                    </div>
                    <button className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors uppercase tracking-wide">
                        BURN IT DOWN
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountSettings;
