import React from 'react';
import { Calendar, CheckCircle2, Circle, Clock, MoreVertical, Flag, Link, Folder } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

const TaskCard = ({ task, onClick }) => {
    const { toggleTask } = useCRM();

    const handleToggle = (e) => {
        e.stopPropagation();
        toggleTask(task.id);
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
            case 'medium': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
            case 'low': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
            default: return 'text-slate-500 bg-slate-50 dark:bg-slate-800';
        }
    };

    const isOverdue = new Date(task.dueDate) < new Date() && !task.completed;

    return (
        <div
            onClick={onClick}
            className={`group bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden ${task.completed ? 'opacity-75' : ''}`}
        >
            {/* Priority Stripe */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`} />

            <div className="flex items-start gap-4 pl-2">
                <button
                    onClick={handleToggle}
                    className={`mt-1 transition-colors ${task.completed ? 'text-success' : 'text-slate-300 hover:text-primary'}`}
                >
                    {task.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </button>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-bold text-slate-800 dark:text-white truncate ${task.completed ? 'line-through text-slate-500' : ''}`}>
                            {task.title}
                        </h3>
                        {task.folder && (
                            <span
                                className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white whitespace-nowrap"
                                style={{ backgroundColor: task.folder.color }}
                            >
                                {task.folder.name}
                            </span>
                        )}
                    </div>

                    {task.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                            {task.description}
                        </p>
                    )}

                    <div className="flex items-center gap-4 mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                        {task.dueDate && (
                            <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-500' : ''}`}>
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                        )}

                        {task.reminderTime && (
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{task.reminderTime}</span>
                            </div>
                        )}

                        {task.urls && task.urls.length > 0 && (
                            <div className="flex items-center gap-1.5 text-primary">
                                <Link className="w-3.5 h-3.5" />
                                <span>{task.urls.length} Link{task.urls.length > 1 ? 's' : ''}</span>
                            </div>
                        )}
                    </div>

                    {/* Contacts Avatars */}
                    {task.contacts && task.contacts.length > 0 && (
                        <div className="flex -space-x-2 mt-3">
                            {task.contacts.map((contact, i) => (
                                <div key={contact.id} className="relative group/avatar">
                                    {contact.avatar ? (
                                        <img
                                            src={contact.avatar}
                                            alt={contact.name}
                                            className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800"
                                        />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-bold">
                                            {contact.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
