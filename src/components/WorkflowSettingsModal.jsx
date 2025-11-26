import React, { useState, useEffect } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { useCRM } from '../context/CRMContext';
import { X, Trash2, User, Shield, Copy, Check } from 'lucide-react';
import * as workflowService from '../services/workflowService';

const WorkflowSettingsModal = ({ isOpen, onClose, workflow }) => {
    const { currentWorkflow: activeWorkflow, deleteWorkflow, updateWorkflow } = useWorkflow();
    const { user } = useCRM();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [ntfyUrl, setNtfyUrl] = useState('');
    const [selectedResources, setSelectedResources] = useState([]);
    const [saving, setSaving] = useState(false);

    const targetWorkflow = workflow || activeWorkflow;

    useEffect(() => {
        if (isOpen && targetWorkflow) {
            loadMembers();
            setNtfyUrl(targetWorkflow.ntfy_url || '');
            setSelectedResources(targetWorkflow.shared_resources || []);
        }
    }, [isOpen, targetWorkflow]);

    const toggleResource = (resource) => {
        const id = resource.toLowerCase();
        if (selectedResources.includes(id)) {
            setSelectedResources(selectedResources.filter(r => r !== id));
        } else {
            setSelectedResources([...selectedResources, id]);
        }
    };

    const loadMembers = async () => {
        setLoading(true);
        const { data } = await workflowService.getWorkflowMembers(targetWorkflow.id);
        if (data) setMembers(data);
        setLoading(false);
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(targetWorkflow.share_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDelete = async () => {
        await deleteWorkflow(targetWorkflow.id);
        onClose();
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        const { error } = await updateWorkflow(targetWorkflow.id, {
            ntfy_url: ntfyUrl,
            shared_resources: selectedResources
        });
        setSaving(false);
        if (!error) {
            onClose();
            // Context update handles the refresh
        }
    };

    if (!isOpen || !targetWorkflow) return null;

    const isCreator = targetWorkflow.creator_id === user?.id;

    return (
        <>
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={onClose} />
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 z-50 animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white font-gta tracking-wide uppercase">{targetWorkflow.name}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Workflow Settings</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Share Code */}
                <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Share Code</p>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 font-mono text-lg font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                            {targetWorkflow.share_code}
                        </code>
                        <button
                            onClick={handleCopyCode}
                            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-primary hover:text-primary transition-colors"
                        >
                            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-slate-400 dark:text-slate-300" />}
                        </button>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Notifications (ntfy.sh)</p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={ntfyUrl}
                            onChange={(e) => setNtfyUrl(e.target.value)}
                            placeholder="ntfy.sh/topic"
                            className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-primary dark:text-white"
                        />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                        Enter your ntfy.sh topic URL to receive reminders for tasks and events in this workflow.
                    </p>
                </div>

                {/* Shared Resources Settings (Admin Only) */}
                {isCreator && (
                    <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Shared Resources</p>
                        <div className="flex flex-wrap gap-2">
                            {['Contacts', 'Deals', 'Tasks', 'Calendar', 'Debts'].map(resource => {
                                const id = resource.toLowerCase();
                                const isSelected = selectedResources.includes(id);
                                return (
                                    <button
                                        key={resource}
                                        onClick={() => toggleResource(resource)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${isSelected
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/50'
                                            }`}
                                    >
                                        {resource}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="w-full mb-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 uppercase tracking-wide"
                >
                    {saving ? 'Saving Changes...' : 'Save Changes'}
                </button>

                {/* Members List */}
                <div className="mb-6">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Members ({members.length})</p>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                            <p className="text-sm text-slate-400 text-center py-4">Loading members...</p>
                        ) : (
                            members.map(member => (
                                <div key={member.id} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 overflow-hidden">
                                            {member.users?.avatar_url ? (
                                                <img src={member.users.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-4 h-4" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                {member.users?.full_name || member.users?.email?.split('@')[0]}
                                                {member.user_id === user?.id && <span className="text-slate-400 ml-1">(You)</span>}
                                            </p>
                                            <p className="text-xs text-slate-400 capitalize">{member.role}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {member.role === 'admin' && <Shield className="w-4 h-4 text-primary" />}

                                        {/* Allow creator to remove members (but not themselves) */}
                                        {isCreator && member.user_id !== user?.id && (
                                            <button
                                                onClick={async () => {
                                                    if (confirm('Are you sure you want to remove this member?')) {
                                                        await workflowService.deleteWorkflowMember(member.id);
                                                        loadMembers();
                                                    }
                                                }}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                title="Remove Member"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Danger Zone */}
                {isCreator && (
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                        {!deleteConfirm ? (
                            <button
                                onClick={() => setDeleteConfirm(true)}
                                className="w-full flex items-center justify-center gap-2 py-2.5 text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl transition-colors font-medium font-gta tracking-wide text-lg"
                            >
                                <Trash2 className="w-5 h-5" />
                                DELETE WORKFLOW
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-sm text-center text-slate-600 dark:text-slate-300">Are you sure? This cannot be undone.</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setDeleteConfirm(false)}
                                        className="flex-1 py-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="flex-1 py-2 text-white bg-red-500 hover:bg-red-600 rounded-xl font-medium"
                                    >
                                        Confirm Delete
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default WorkflowSettingsModal;
