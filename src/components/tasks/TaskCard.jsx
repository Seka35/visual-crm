import React from 'react';
import { Calendar, Flag, CheckCircle, Circle, Pencil } from 'lucide-react';
import { cn } from '../../lib/utils';

const TaskCard = ({ task, onToggle, onEdit }) => {
    return (
        <div className={cn(
            "glass-card p-4 rounded-xl flex items-center gap-4 group transition-all duration-300 dark:bg-slate-900/50 dark:border-slate-800",
            task.completed && "opacity-60 bg-slate-50 dark:bg-slate-800/50"
        )}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle(task.id);
                }}
                className="text-slate-300 hover:text-primary transition-colors"
            >
                {task.completed ? (
                    <CheckCircle className="w-6 h-6 text-success" />
                ) : (
                    <Circle className="w-6 h-6" />
                )}
            </button>

            <div className="flex-1">
                <h4 className={cn(
                    "font-bold text-slate-800 dark:text-white mb-1 transition-all",
                    task.completed && "line-through text-slate-400 dark:text-slate-500"
                )}>
                    {task.title}
                </h4>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                            {task.dueDate
                                ? new Date(task.dueDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: new Date(task.dueDate).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                                })
                                : 'No date'}
                            {task.reminderTime && (
                                <span className="ml-1 opacity-70">
                                    • {task.reminderTime.slice(0, 5)}
                                </span>
                            )}
                        </span>
                    </div>
                    {task.project && (
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-medium">
                            {task.project}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3">
                {task.priority === 'high' && (
                    <div className="flex items-center gap-1 text-xs font-bold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/20 px-2 py-1 rounded-lg">
                        <Flag className="w-3.5 h-3.5 fill-current" />
                        <span>High</span>
                    </div>
                )}
                {task.priority === 'medium' && (
                    <div className="flex items-center gap-1 text-xs font-bold text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/20 px-2 py-1 rounded-lg">
                        <Flag className="w-3.5 h-3.5 fill-current" />
                        <span>Medium</span>
                    </div>
                )}
                {task.priority === 'low' && (
                    <div className="flex items-center gap-1 text-xs font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-500/20 px-2 py-1 rounded-lg">
                        <Flag className="w-3.5 h-3.5 fill-current" />
                        <span>Low</span>
                    </div>
                )}

                <button
                    onClick={() => onEdit(task)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                >
                    <Pencil className="w-4 h-4" />
                </button>

                <img
                    src={task.assigneeAvatar}
                    alt=""
                    className="w-8 h-8 rounded-full border-2 border-white"
                />
            </div>
        </div>
    );
};

export default TaskCard;
