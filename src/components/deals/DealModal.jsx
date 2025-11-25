import React, { useState, useEffect } from 'react';
import { X, DollarSign, Building, Calendar, BarChart } from 'lucide-react';

const DealModal = ({ isOpen, onClose, initialData = null, onSubmit, onDelete }) => {
    const [formData, setFormData] = useState({
        title: '',
        value: '',
        date: '',
        client: '',
        stage: 'lead'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                value: initialData.amount?.replace(/[^0-9]/g, '') || '',
                date: initialData.date || '',
                client: initialData.clientName || '',
                stage: initialData.stage || 'lead' // Ensure stage is mapped correctly if needed
            });
        } else {
            setFormData({
                title: '',
                value: '',
                date: new Date().toISOString().split('T')[0],
                client: '',
                stage: 'lead'
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
            const dealData = {
                title: formData.title,
                amount: `$${formData.value}`,
                date: formData.date,
                clientName: formData.client,
                status: formData.stage
            };
            await onSubmit(dealData);
            onClose();
        } catch (error) {
            console.error('Error saving deal:', error);
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
                    <h3 className="text-xl font-bold text-slate-800">{isEditing ? 'Edit Deal' : 'New Deal'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Deal Name</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Enterprise License Agreement"
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all outline-none text-slate-600"
                                autoFocus
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Value</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="number"
                                        name="value"
                                        value={formData.value}
                                        onChange={handleChange}
                                        placeholder="10,000"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all outline-none text-slate-600"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Close Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all outline-none text-slate-600"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Client</label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    name="client"
                                    value={formData.client}
                                    onChange={handleChange}
                                    placeholder="Search client..."
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all outline-none text-slate-600"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Stage</label>
                            <div className="relative">
                                <BarChart className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <select
                                    name="stage"
                                    value={formData.stage}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all outline-none text-slate-600 appearance-none"
                                >
                                    <option value="lead">Lead</option>
                                    <option value="qualified">Qualified</option>
                                    <option value="proposal">Proposal</option>
                                    <option value="negotiation">Negotiation</option>
                                    <option value="won">Won</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-100 flex justify-between gap-3">
                        {isEditing ? (
                            <button
                                type="button"
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this deal?')) {
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
                                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : (isEditing ? 'Save Changes' : 'Create Deal')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DealModal;
