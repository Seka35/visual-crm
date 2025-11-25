import React, { useState, useEffect } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { useCRM } from '../context/CRMContext';
import { X, Trash2, User, Shield, Copy, Check } from 'lucide-react';
import * as workflowService from '../services/workflowService';

const WorkflowSettingsModal = ({ isOpen, onClose }) => {
    const { currentWorkflow, deleteWorkflow } = useWorkflow();
    const { user } = useCRM();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    useEffect(() => {
        if (isOpen && currentWorkflow) {
            loadMembers();
        }
    }, [isOpen, currentWorkflow]);

    const loadMembers = async () => {
        setLoading(true);
        const { data } = await workflowService.getWorkflowMembers(currentWorkflow.id);
        if (data) setMembers(data);
        setLoading(false);
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(currentWorkflow.share_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDelete = async () => {
        await deleteWorkflow(currentWorkflow.id);
        onClose();
    };

    if (!isOpen || !currentWorkflow) return null;

    const isCreator = currentWorkflow.creator_id === user?.id;

    return (
        <>
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={onClose} />
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{currentWorkflow.name}</h2>
                        <p className="text-sm text-slate-500">Workflow Settings</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Share Code */}
                <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Share Code</p>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 font-mono text-lg font-bold text-slate-700 bg-white px-3 py-2 rounded-lg border border-slate-200">
                            {currentWorkflow.share_code}
                        </code>
                        <button
                            onClick={handleCopyCode}
                            className="p-2.5 bg-white border border-slate-200 rounded-lg hover:border-primary hover:text-primary transition-colors"
                        >
                            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Members List */}
                <div className="mb-6">
                    <p className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wider">Members ({members.length})</p>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                        {loading ? (
                            <p className="text-sm text-slate-400 text-center py-4">Loading members...</p>
                        ) : (
                            members.map(member => (
                                <div key={member.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 overflow-hidden">
                                            {member.users?.avatar_url ? (
                                                <img src={member.users.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-4 h-4" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-700">
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
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
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
                    <div className="pt-6 border-t border-slate-100">
                        {!deleteConfirm ? (
                            <button
                                onClick={() => setDeleteConfirm(true)}
                                className="w-full flex items-center justify-center gap-2 py-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors font-medium"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Workflow
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-sm text-center text-slate-600">Are you sure? This cannot be undone.</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setDeleteConfirm(false)}
                                        className="flex-1 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium"
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
