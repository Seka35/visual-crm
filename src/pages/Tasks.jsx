import React, { useState } from 'react';
import { Plus, Trophy, Flame, CheckCircle } from 'lucide-react';
import TaskCard from '../components/tasks/TaskCard';
import TaskModal from '../components/tasks/TaskModal';
import { useCRM } from '../context/CRMContext';

const Tasks = () => {
    const { tasks, toggleTask, addTask, updateTask, deleteTask } = useCRM();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

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
                    <h2 className="text-2xl font-bold text-slate-800">My Tasks</h2>
                    <p className="text-slate-500">Stay organized and productive</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 w-full md:w-auto"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Task</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-warning" />
                            To Do ({pendingTasks.length})
                        </h3>
                        <div className="space-y-3">
                            {pendingTasks.map(task => (
                                <div key={task.id}>
                                    <TaskCard task={task} onToggle={toggleTask} onEdit={handleEditTask} />
                                </div>
                            ))}
                            {pendingTasks.length === 0 && (
                                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-slate-400 font-medium">No pending tasks! 🎉</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {completedTasks.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 opacity-60">
                                <CheckCircle className="w-4 h-4" />
                                Completed ({completedTasks.length})
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

                <div className="space-y-6">
                    <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-warning/10 rounded-lg text-warning">
                                <Flame className="w-6 h-6 fill-current" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Productivity Streak</h3>
                                <p className="text-xs text-slate-500">You're on fire! 🔥</p>
                            </div>
                        </div>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-4xl font-bold text-slate-800">5</span>
                            <span className="text-sm font-medium text-slate-500 mb-1">days</span>
                        </div>
                        <p className="text-sm text-slate-600">Complete 3 more tasks to reach your daily goal.</p>
                    </div>

                    <div className="glass-card p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                <Trophy className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-slate-800">Achievements</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 opacity-100">
                                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-2xl">⚡️</div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">Speed Demon</p>
                                    <p className="text-xs text-slate-500">Closed 5 tasks in 1 hour</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 opacity-50 grayscale">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-2xl">🤝</div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">Deal Maker</p>
                                    <p className="text-xs text-slate-500">Close 10 deals this month</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
