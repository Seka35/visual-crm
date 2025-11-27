import React, { useState, useEffect } from 'react';
import { X, User, Building, Mail, Phone, Tag, Upload, Camera } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useCRM } from '../../context/CRMContext';

const ContactModal = ({ isOpen, onClose, initialData = null, onSubmit, onDelete }) => {
    const { tasks, deals } = useCRM();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        company: '',
        role: '',
        email: '',
        phone: '',
        tags: '',
        avatar: null,
        taskIds: [],
        dealIds: []
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (initialData) {
            const [firstName, ...lastNameParts] = (initialData.name || '').split(' ');

            // Calculate initial associations from global context to ensure accuracy
            const associatedTaskIds = tasks
                .filter(t => t.contacts?.some(c => c.id === initialData.id))
                .map(t => t.id);

            const associatedDealIds = Object.values(deals)
                .flatMap(s => s.items)
                .filter(d => d.contacts?.some(c => c.id === initialData.id))
                .map(d => d.id);

            setFormData({
                firstName: firstName || '',
                lastName: lastNameParts.join(' ') || '',
                company: initialData.company || '',
                role: initialData.role || '',
                email: initialData.email || '',
                phone: initialData.phone || '',
                tags: initialData.tags?.join(', ') || '',
                avatar: initialData.avatar || null,
                taskIds: associatedTaskIds,
                dealIds: associatedDealIds
            });
            setPreviewUrl(initialData.avatar || null);
        } else {
            setFormData({
                firstName: '',
                lastName: '',
                company: '',
                role: '',
                email: '',
                phone: '',
                tags: '',
                avatar: null,
                taskIds: [],
                dealIds: []
            });
            setPreviewUrl(null);
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

    const toggleTask = (taskId) => {
        setFormData(prev => {
            const current = prev.taskIds || [];
            if (current.includes(taskId)) {
                return { ...prev, taskIds: current.filter(id => id !== taskId) };
            } else {
                return { ...prev, taskIds: [...current, taskId] };
            }
        });
    };

    const toggleDeal = (dealId) => {
        setFormData(prev => {
            const current = prev.dealIds || [];
            if (current.includes(dealId)) {
                return { ...prev, dealIds: current.filter(id => id !== dealId) };
            } else {
                return { ...prev, dealIds: [...current, dealId] };
            }
        });
    };

    const handleImageUpload = async (e) => {
        try {
            setUploading(true);
            const file = e.target.files[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('AVATAR')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('AVATAR')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, avatar: data.publicUrl }));
            setPreviewUrl(data.publicUrl);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image!');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const contactData = {
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                company: formData.company,
                role: formData.role,
                email: formData.email,
                phone: formData.phone,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                avatar: formData.avatar,
                taskIds: formData.taskIds,
                dealIds: formData.dealIds
            };
            await onSubmit(contactData);
        } catch (error) {
            console.error('Error saving contact:', error);
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

            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-20">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">{isEditing ? 'Edit Contact' : 'Add New Contact'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">
                        {/* Image Upload */}
                        <div className="flex justify-center">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-10 h-10 text-slate-300" />
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
                                    {uploading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Camera className="w-4 h-4" />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        disabled={uploading}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">First Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="John"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none text-slate-600 dark:text-white"
                                        autoFocus
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Doe"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none text-slate-600 dark:text-white"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Company & Role</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        placeholder="Company Inc."
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none text-slate-600 dark:text-white"
                                    />
                                </div>
                                <input
                                    type="text"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    placeholder="Job Title"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none text-slate-600 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Contact Info</label>
                                <div className="relative mb-3">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="john.doe@company.com"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none text-slate-600 dark:text-white"
                                    />
                                </div>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+1 (555) 000-0000"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none text-slate-600 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tags</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    placeholder="Add tags separated by comma..."
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none text-slate-600 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Associations Selectors */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Associate Tasks</label>
                                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {formData.taskIds?.map(id => {
                                            const task = tasks.find(t => t.id === id);
                                            if (!task) return null;
                                            return (
                                                <span key={id} className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm border border-slate-200 dark:border-slate-600">
                                                    <div className={`w-2 h-2 rounded-full ${task.completed ? 'bg-green-500' : 'bg-slate-300'}`} />
                                                    <span className="truncate max-w-[100px]">{task.title}</span>
                                                    <button type="button" onClick={() => toggleTask(id)} className="hover:text-red-500 ml-1">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            );
                                        })}
                                        {(!formData.taskIds || formData.taskIds.length === 0) && (
                                            <span className="text-slate-400 text-sm italic">No tasks selected</span>
                                        )}
                                    </div>
                                    <select
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                toggleTask(e.target.value);
                                                e.target.value = "";
                                            }
                                        }}
                                        className="w-full py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none text-slate-600 dark:text-white appearance-none px-3"
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Add a task...</option>
                                        {tasks.filter(t => !formData.taskIds?.includes(t.id)).map(task => (
                                            <option key={task.id} value={task.id}>
                                                {task.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Associate Deals</label>
                                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {formData.dealIds?.map(id => {
                                            const deal = Object.values(deals).flatMap(s => s.items).find(d => d.id === id);
                                            if (!deal) return null;
                                            return (
                                                <span key={id} className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm border border-slate-200 dark:border-slate-600">
                                                    <span className="truncate max-w-[100px]">{deal.title}</span>
                                                    <button type="button" onClick={() => toggleDeal(id)} className="hover:text-red-500 ml-1">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            );
                                        })}
                                        {(!formData.dealIds || formData.dealIds.length === 0) && (
                                            <span className="text-slate-400 text-sm italic">No deals selected</span>
                                        )}
                                    </div>
                                    <select
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                toggleDeal(e.target.value);
                                                e.target.value = "";
                                            }
                                        }}
                                        className="w-full py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none text-slate-600 dark:text-white appearance-none px-3"
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Add a deal...</option>
                                        {Object.values(deals).flatMap(s => s.items).filter(d => !formData.dealIds?.includes(d.id)).map(deal => (
                                            <option key={deal.id} value={deal.id}>
                                                {deal.title} ({deal.amount})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                                <h4 className="font-bold text-slate-800 dark:text-white mb-4">Associated Items</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h5 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            Tasks
                                        </h5>
                                        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                            {tasks.filter(t => t.contacts?.some(c => c.id === initialData.id)).length > 0 ? (
                                                tasks.filter(t => t.contacts?.some(c => c.id === initialData.id)).map(task => (
                                                    <div key={task.id} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                                        <div className={`w-2 h-2 rounded-full ${task.completed ? 'bg-green-500' : 'bg-slate-300'}`} />
                                                        <span className={`text-sm text-slate-700 dark:text-slate-200 truncate ${task.completed ? 'line-through opacity-50' : ''}`}>{task.title}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs text-slate-400 italic pl-2">No associated tasks</p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-purple-500" />
                                            Deals
                                        </h5>
                                        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                            {Object.values(deals).flatMap(s => s.items).filter(d => d.contacts?.some(c => c.id === initialData.id)).length > 0 ? (
                                                Object.values(deals).flatMap(s => s.items).filter(d => d.contacts?.some(c => c.id === initialData.id)).map(deal => (
                                                    <div key={deal.id} className="flex items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                                        <span className="text-sm text-slate-700 dark:text-slate-200 truncate font-medium">{deal.title}</span>
                                                        <span className="text-xs font-bold text-slate-500 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg shadow-sm">{deal.amount}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs text-slate-400 italic pl-2">No associated deals</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between gap-3 sticky bottom-0 bg-white dark:bg-slate-900 z-20">
                        {isEditing ? (
                            <button
                                type="button"
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this contact?')) {
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
                                disabled={loading || uploading}
                                className="px-6 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : (isEditing ? 'Save Changes' : 'Add Contact')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContactModal;
