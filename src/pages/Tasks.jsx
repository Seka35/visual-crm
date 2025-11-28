import React, { useState } from 'react';
import { Plus, CheckCircle } from 'lucide-react';
import TaskCard from '../components/tasks/TaskCard';
import TaskModal from '../components/tasks/TaskModal';
import { useCRM } from '../context/CRMContext';

import { useSearchParams } from 'react-router-dom';

const Tasks = () => {
    const { tasks, toggleTask, addTask, updateTask, deleteTask } = useCRM();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();

    // Check for openId query param or create action
    React.useEffect(() => {
        const openId = searchParams.get('openId');
        const action = searchParams.get('action');

        if (openId && tasks.length > 0) {
            const taskToOpen = tasks.find(t => t.id === openId);
            if (taskToOpen) {
                handleEditTask(taskToOpen);
                setSearchParams({}, { replace: true });
            }
        } else if (action === 'create_task') {
            setIsModalOpen(true);
            setEditingTask(null);
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, tasks, setSearchParams]);

    const handleEditTask = (task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
    };

    const pendingTasks = tasks.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-6xl font-bold font-gta text-slate-800 dark:text-white mb-4">MISSIONS</h2>
                    <p className="text-slate-500 dark:text-slate-400">Get it done. No excuses.</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95 w-full md:w-auto"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Mission</span>
                </button>
            </div>

            <div className="space-y-8">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-warning" />
                        Active Missions ({pendingTasks.length})
                    </h3>
                    <div className="space-y-3">
                        {pendingTasks.map(task => (
                            <div key={task.id}>
                                <TaskCard task={task} onToggle={toggleTask} onEdit={handleEditTask} />
                            </div>
                        ))}
                        {pendingTasks.length === 0 && (
                            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                <p className="text-slate-400 font-medium">No active missions! 🎉</p>
                            </div>
                        )}
                    </div>
                </div>

                {completedTasks.length > 0 && (
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 opacity-60">
                            <CheckCircle className="w-4 h-4" />
                            Mission Accomplished ({completedTasks.length})
                        </h3>
                        <div className="space-y-3">
                            {completedTasks.map(task => (
                                <div key={task.id}>
                                    <TaskCard task={task} onToggle={toggleTask} onEdit={handleEditTask} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <TaskModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                initialData={editingTask}
                onSubmit={async (taskData) => {
                    if (editingTask) {
                        await updateTask(editingTask.id, taskData);
                    } else {
                        await addTask(taskData);
                    }
                }}
                onDelete={deleteTask}
            />
        </div>
    );
};

export default Tasks;
