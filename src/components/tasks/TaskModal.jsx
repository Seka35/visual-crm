import React, { useState, useEffect } from 'react';
import { X, Calendar, Flag, Link, Bell, Users } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

const TaskModal = ({ isOpen, onClose, initialData = null, onSubmit, onDelete }) => {
    const { contacts } = useCRM();
    const [formData, setFormData] = useState({
        title: '',
        dueDate: '',
        priority: 'medium',
        reminderTime: '',
        contactIds: []
    });
    const [showReminderInput, setShowReminderInput] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                dueDate: initialData.dueDate || '',
                priority: initialData.priority || 'medium',
                reminderTime: initialData.reminderTime || '',
                contactIds: initialData.contacts?.map(c => c.id) || []
            });
            if (initialData.reminderTime) {
                setShowReminderInput(true);
            }
        } else {
            setFormData({
                title: '',
                dueDate: '',
                priority: 'medium',
                reminderTime: '',
                contactIds: []
            });
            setShowReminderInput(false);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const isEditing = !!initialData;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const toggleContact = (contactId) => {
        setFormData(prev => {
            const current = prev.contactIds || [];
            if (current.includes(contactId)) {
                return { ...prev, contactIds: current.filter(id => id !== contactId) };
            } else {
                return { ...prev, contactIds: [...current, contactId] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const taskData = {
                title: formData.title,
                dueDate: formData.dueDate,
                priority: formData.priority,
                reminderTime: formData.reminderTime,
                completed: initialData ? initialData.completed : false,
                contactIds: formData.contactIds
            };
            await onSubmit(taskData);
            onClose();
        } catch (error) {
            console.error('Error saving task:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-20">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">{isEditing ? 'Edit Task' : 'New Task'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Task Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Call Sarah about the contract"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none text-slate-600 dark:text-white"
                                autoFocus
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Due Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="date"
                                        name="dueDate"
                                        value={formData.dueDate}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none text-slate-600 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Priority</label>
                                <div className="relative">
                                    <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none text-slate-600 dark:text-white appearance-none"
                                    >
                                        <option value="low">Low Priority</option>
                                        <option value="medium">Medium Priority</option>
                                        <option value="high">High Priority</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Associated Contacts</label>
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {formData.contactIds.map(id => {
                                        const contact = contacts.find(c => c.id === id);
                                        if (!contact) return null;
                                        return (
                                            <span key={id} className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm border border-slate-200 dark:border-slate-600">
                                                {contact.avatar && <img src={contact.avatar} alt="" className="w-4 h-4 rounded-full" />}
                                                {contact.name}
                                                <button type="button" onClick={() => toggleContact(id)} className="hover:text-red-500 ml-1">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        );
                                    })}
                                    {formData.contactIds.length === 0 && (
                                        <span className="text-slate-400 text-sm italic">No contacts selected</span>
                                    )}
                                </div>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                toggleContact(e.target.value);
                                                e.target.value = "";
                                            }
                                        }}
                                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none text-slate-600 dark:text-white appearance-none"
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Add a contact...</option>
                                        {contacts.filter(c => !formData.contactIds.includes(c.id)).map(contact => (
                                            <option key={contact.id} value={contact.id}>
                                                {contact.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button type="button" className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-colors">
                                <Link className="w-4 h-4" />
                                <span>Link Deal</span>
                            </button>

                            <div className="flex-1 relative">
                                {!showReminderInput ? (
                                    <button
                                        type="button"
                                        onClick={() => setShowReminderInput(true)}
                                        className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Bell className="w-4 h-4" />
                                        <span>Set Reminder</span>
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2 w-full">
                                        <input
                                            type="time"
                                            name="reminderTime"
                                            value={formData.reminderTime}
                                            onChange={handleChange}
                                            className="flex-1 py-3 px-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none text-slate-600 dark:text-white"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowReminderInput(false);
                                                setFormData(prev => ({ ...prev, reminderTime: '' }));
                                            }}
                                            className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between gap-3 sticky bottom-0 bg-white dark:bg-slate-900 z-20">
                        {isEditing ? (
                            <button
                                type="button"
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this task?')) {
                                        onDelete(initialData.id);
                                        onClose();
                                    }
                                }}
                                className="px-6 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                Delete
                            </button>
                        ) : (
                            <div></div>
                        )}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : (isEditing ? 'Save Changes' : 'Create Task')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;
