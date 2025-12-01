import React, { useState } from 'react';
import { Plus, Search, Filter, Folder } from 'lucide-react';
import TaskCard from '../components/tasks/TaskCard';
import TaskModal from '../components/tasks/TaskModal';
import { useCRM } from '../context/CRMContext';

const Tasks = () => {
    const { tasks, addTask, updateTask, deleteTask, folders } = useCRM();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all'); // all, high, medium, low
    const [selectedFolderId, setSelectedFolderId] = useState('all');

    const handleAddTask = async (taskData) => {
        await addTask(taskData);
        setIsModalOpen(false);
    };

    const handleUpdateTask = async (taskData) => {
        if (editingTask) {
            await updateTask(editingTask.id, taskData);
            setEditingTask(null);
            setIsModalOpen(false);
        }
    };

    const handleDeleteTask = async (taskId) => {
        await deleteTask(taskId);
        if (editingTask && editingTask.id === taskId) {
            setEditingTask(null);
            setIsModalOpen(false);
        }
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || task.priority === filter;
        const matchesFolder = selectedFolderId === 'all' || task.folderId === selectedFolderId;
        return matchesSearch && matchesFilter && matchesFolder;
    });

    const pendingTasks = filteredTasks.filter(t => !t.completed);
    const completedTasks = filteredTasks.filter(t => t.completed);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                        MISSIONS
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Manage your operations and objectives
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingTask(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    New Mission
                </button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search missions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="all">All Priorities</option>
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                    </select>

                    <select
                        value={selectedFolderId}
                        onChange={(e) => setSelectedFolderId(e.target.value)}
                        className="px-4 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="all">All Folders</option>
                        {folders.map(folder => (
                            <option key={folder.id} value={folder.id}>{folder.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Folder Tabs (Optional Visual Enhancement) */}
            {folders.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    <button
                        onClick={() => setSelectedFolderId('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${selectedFolderId === 'all' ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                    >
                        All
                    </button>
                    {folders.map(folder => (
                        <button
                            key={folder.id}
                            onClick={() => setSelectedFolderId(folder.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${selectedFolderId === folder.id ? 'text-white shadow-md' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                            style={selectedFolderId === folder.id ? { backgroundColor: folder.color } : {}}
                        >
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: folder.color }} />
                            {folder.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Task Lists */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Pending Tasks */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-warning" />
                        In Progress ({pendingTasks.length})
                    </h2>
                    <div className="space-y-3">
                        {pendingTasks.map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onClick={() => openEditModal(task)}
                            />
                        ))}
                        {pendingTasks.length === 0 && (
                            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                <p className="text-slate-400">No active missions found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Completed Tasks */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-success" />
                        Completed ({completedTasks.length})
                    </h2>
                    <div className="space-y-3 opacity-75">
                        {completedTasks.map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onClick={() => openEditModal(task)}
                            />
                        ))}
                        {completedTasks.length === 0 && (
                            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                <p className="text-slate-400">No completed missions yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingTask(null);
                }}
                initialData={editingTask}
                onSubmit={editingTask ? handleUpdateTask : handleAddTask}
                onDelete={handleDeleteTask}
            />
        </div>
    );
};

export default Tasks;
