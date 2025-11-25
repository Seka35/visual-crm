import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlignLeft, Type } from 'lucide-react';

const EventModal = ({ isOpen, onClose, initialData = null, onSubmit, onDelete }) => {
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '10:00',
        type: 'meeting',
        description: ''
    });
    const [loading, setLoading] = useState(false);

    // Helper to format date as YYYY-MM-DD in local time
    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                date: formatDate(initialData.date),
                time: initialData.time || '10:00',
                type: initialData.type || 'meeting',
                description: initialData.description || ''
            });
        } else {
            setFormData({
                title: '',
                date: formatDate(new Date()),
                time: '10:00',
                type: 'meeting',
                description: ''
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const isEditing = !!initialData && initialData.id; // Check if it has an ID to be considered editing an existing event

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
            const eventData = {
                title: formData.title,
                date: formData.date,
                time: formData.time,
                type: formData.type,
                description: formData.description
            };
            await onSubmit(eventData);
            onClose();
        } catch (error) {
            console.error('Error saving event:', error);
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
                    <h3 className="text-xl font-bold text-slate-800">{isEditing ? 'Edit Event' : 'New Event'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Event Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Team Weekly Sync"
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all outline-none text-slate-600"
                                autoFocus
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all outline-none text-slate-600"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Time</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="time"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all outline-none text-slate-600"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Type</label>
                            <div className="relative">
                                <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all outline-none text-slate-600 appearance-none"
                                >
                                    <option value="meeting">Meeting</option>
                                    <option value="call">Call</option>
                                    <option value="deadline">Deadline</option>
                                    <option value="personal">Personal</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                            <div className="relative">
                                <AlignLeft className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Add details..."
                                    rows="3"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all outline-none text-slate-600 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-100 flex justify-between gap-3">
                        {isEditing ? (
                            <button
                                type="button"
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this event?')) {
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
                                className="px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : (isEditing ? 'Save Changes' : 'Create Event')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EventModal;
