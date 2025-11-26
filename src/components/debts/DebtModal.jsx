import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, User, FileText, Bell, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const DebtModal = ({ isOpen, onClose, initialData, onSubmit, onDelete }) => {
    const [formData, setFormData] = useState({
        borrowerName: '',
        amountLent: '',
        amountRepaid: '$0',
        dateLent: new Date().toISOString().split('T')[0],
        reminderDate: '',
        description: '',
        status: 'lent'
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                borrowerName: initialData.borrower_name || '',
                amountLent: initialData.amount_lent || '',
                amountRepaid: initialData.amount_repaid || '$0',
                dateLent: initialData.date_lent ? new Date(initialData.date_lent).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                reminderDate: initialData.reminder_date ? new Date(initialData.reminder_date).toISOString().slice(0, 16) : '',
                description: initialData.description || '',
                status: initialData.status || 'lent'
            });
        } else {
            setFormData({
                borrowerName: '',
                amountLent: '',
                amountRepaid: '$0',
                dateLent: new Date().toISOString().split('T')[0],
                reminderDate: '',
                description: '',
                status: 'lent'
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this debt?')) {
            onDelete(initialData.id);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h2 className="text-xl font-bold font-gta tracking-wide text-slate-800 dark:text-white">
                        {initialData ? 'EDIT DEBT' : 'NEW DEBT'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Borrower Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    required
                                    value={formData.borrowerName}
                                    onChange={(e) => setFormData({ ...formData, borrowerName: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white font-medium"
                                    placeholder="Who owes you?"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white font-medium appearance-none"
                            >
                                <option value="lent">Money Lent</option>
                                <option value="partial">Partially Repaid</option>
                                <option value="repaid">Fully Repaid</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount Lent</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                                <input
                                    type="text"
                                    required
                                    value={formData.amountLent}
                                    onChange={(e) => setFormData({ ...formData, amountLent: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white font-medium"
                                    placeholder="$0"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Repaid</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                                <input
                                    type="text"
                                    value={formData.amountRepaid}
                                    onChange={(e) => setFormData({ ...formData, amountRepaid: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white font-medium"
                                    placeholder="$0"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date Lent</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="date"
                                    value={formData.dateLent}
                                    onChange={(e) => setFormData({ ...formData, dateLent: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white font-medium [color-scheme:dark]"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reminder</label>
                            <div className="relative">
                                <Bell className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />
                                <input
                                    type="datetime-local"
                                    value={formData.reminderDate}
                                    onChange={(e) => setFormData({ ...formData, reminderDate: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white font-medium [color-scheme:dark]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white font-medium min-h-[100px] resize-none"
                                placeholder="Add details..."
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        {initialData && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-6 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-bold transition-all"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            type="submit"
                            className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] font-gta tracking-wide text-lg"
                        >
                            {initialData ? 'SAVE CHANGES' : 'ADD DEBT'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DebtModal;
