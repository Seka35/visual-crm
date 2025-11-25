import React, { useState, useEffect } from 'react';
import { X, Calendar, Flag, Link, Bell } from 'lucide-react';

const TaskModal = ({ isOpen, onClose, initialData = null, onSubmit, onDelete }) => {
    const [formData, setFormData] = useState({
        title: '',
        dueDate: '',
        priority: 'medium'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                dueDate: initialData.dueDate || '',
                priority: initialData.priority || 'medium'
            });
        } else {
            setFormData({
                title: '',
                dueDate: '',
                priority: 'medium'
            });
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const taskData = {
                title: formData.title,
                dueDate: formData.dueDate,
                priority: formData.priority,
                completed: initialData ? initialData.completed : false
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

            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">{isEditing ? 'Edit Task' : 'New Task'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Task Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Call Sarah about the contract"
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none"
                                autoFocus
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Due Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="date"
                                        name="dueDate"
                                        value={formData.dueDate}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none text-slate-600"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Priority</label>
                                <div className="relative">
                                    <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none text-slate-600 appearance-none"
                                    >
                                        <option value="low">Low Priority</option>
                                        <option value="medium">Medium Priority</option>
                                        <option value="high">High Priority</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button type="button" className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors">
                                <Link className="w-4 h-4" />
                                <span>Link Deal</span>
                            </button>
                            <button type="button" className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors">
                                <Bell className="w-4 h-4" />
                                <span>Set Reminder</span>
                            </button>
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-100 flex justify-between gap-3">
                        {isEditing ? (
                            <button
                                type="button"
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this task?')) {
                                        onDelete(initialData.id);
                                        onClose();
                                    }
                                }}
                                className="px-6 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-colors"
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
                                className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 rounded-xl font-bold text-white bg-primary hover:bg-blue-600 shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
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
