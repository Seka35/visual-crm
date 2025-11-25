import React, { useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { Plus, Users, Copy, Check, ArrowRight, Share2, Settings } from 'lucide-react';
import WorkflowSettingsModal from './WorkflowSettingsModal';

const WorkflowManager = () => {
    const { workflows, createWorkflow, joinWorkflow, currentWorkflow, switchWorkflow } = useWorkflow();
    const [activeTab, setActiveTab] = useState('list'); // list, create, join
    const [newWorkflowName, setNewWorkflowName] = useState('');
    const [selectedResources, setSelectedResources] = useState(['contacts', 'deals', 'tasks', 'calendar']);
    const [joinCode, setJoinCode] = useState('');
    const [copiedId, setCopiedId] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [settingsWorkflow, setSettingsWorkflow] = useState(null);

    const toggleResource = (resource) => {
        const id = resource.toLowerCase();
        if (selectedResources.includes(id)) {
            setSelectedResources(selectedResources.filter(r => r !== id));
        } else {
            setSelectedResources([...selectedResources, id]);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError(null);
        if (!newWorkflowName.trim()) return;
        if (selectedResources.length === 0) {
            setError('Please select at least one shared resource');
            return;
        }

        const result = await createWorkflow(newWorkflowName, selectedResources);
        if (result) {
            setSuccess('Workflow created successfully!');
            setNewWorkflowName('');
            setSelectedResources(['contacts', 'deals', 'tasks', 'calendar']);
            setActiveTab('list');
            setTimeout(() => setSuccess(null), 3000);
        } else {
            setError('Failed to create workflow');
        }
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        if (!joinCode.trim()) return;

        const { error } = await joinWorkflow(joinCode);
        if (error) {
            setError(error.message);
        } else {
            setSuccess('Join request sent! Waiting for approval.');
            setJoinCode('');
            setTimeout(() => setSuccess(null), 3000);
        }
    };

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Share2 className="w-6 h-6 text-primary" />
                    Shared Workflows
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your shared workspaces and collaborate with your team.</p>
            </div>

            <div className="flex border-b border-slate-100 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('list')}
                    className={`flex-1 py-4 text-sm font-medium transition-colors relative ${activeTab === 'list' ? 'text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                >
                    My Workflows
                    {activeTab === 'list' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('create')}
                    className={`flex-1 py-4 text-sm font-medium transition-colors relative ${activeTab === 'create' ? 'text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                >
                    Create New
                    {activeTab === 'create' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('join')}
                    className={`flex-1 py-4 text-sm font-medium transition-colors relative ${activeTab === 'join' ? 'text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                >
                    Join Existing
                    {activeTab === 'join' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                    )}
                </button>
            </div>

            <div className="p-6">
                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-xl text-sm">
                        {success}
                    </div>
                )}

                {activeTab === 'list' && (
                    <div className="space-y-4">
                        <div
                            onClick={() => switchWorkflow(null)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${!currentWorkflow
                                ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white">Personal Workspace</h3>
                                    <p className="text-xs text-slate-500">Private to you</p>
                                </div>
                            </div>
                            {!currentWorkflow && (
                                <div className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full">
                                    Active
                                </div>
                            )}
                        </div>

                        {workflows.map(workflow => (
                            <div
                                key={workflow.id}
                                onClick={() => switchWorkflow(workflow)}
                                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${currentWorkflow?.id === workflow.id
                                    ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                        <Share2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-white">{workflow.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-xs text-slate-500">Code: </p>
                                            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono text-slate-600 dark:text-slate-300">
                                                {workflow.share_code}
                                            </code>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    copyToClipboard(workflow.share_code, workflow.id);
                                                }}
                                                className="text-slate-400 hover:text-primary transition-colors"
                                            >
                                                {copiedId === workflow.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSettingsWorkflow(workflow);
                                        }}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-primary transition-colors"
                                    >
                                        <Settings className="w-4 h-4" />
                                    </button>
                                    {currentWorkflow?.id === workflow.id && (
                                        <div className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full">
                                            Active
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'create' && (
                    <form onSubmit={handleCreate} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Workflow Name</label>
                            <input
                                type="text"
                                value={newWorkflowName}
                                onChange={(e) => setNewWorkflowName(e.target.value)}
                                placeholder="e.g., Sales Team A"
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                                required
                            />
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Shared Resources</h4>
                            <p className="text-xs text-slate-500 mb-3">Select what members can access:</p>
                            <div className="flex flex-wrap gap-2">
                                {['Contacts', 'Deals', 'Tasks', 'Calendar'].map(resource => {
                                    const id = resource.toLowerCase();
                                    const isSelected = selectedResources.includes(id);
                                    return (
                                        <button
                                            key={resource}
                                            type="button"
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
                        <button
                            type="submit"
                            className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Create Workflow
                        </button>
                    </form>
                )}

                {activeTab === 'join' && (
                    <form onSubmit={handleJoin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Workflow Code</label>
                            <input
                                type="text"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value)}
                                placeholder="Enter 6-character code"
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono uppercase dark:text-white"
                                maxLength={6}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowRight className="w-5 h-5" />
                            Send Join Request
                        </button>
                    </form>
                )}
            </div>

            {settingsWorkflow && (
                <WorkflowSettingsModal
                    isOpen={!!settingsWorkflow}
                    onClose={() => setSettingsWorkflow(null)}
                    workflow={settingsWorkflow}
                />
            )}
        </div>
    );
};

export default WorkflowManager;
