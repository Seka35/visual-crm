import React from 'react';
import { Calendar, Flag, CheckCircle, Circle, Pencil } from 'lucide-react';
import { cn } from '../../lib/utils';

const TaskCard = ({ task, onToggle, onEdit }) => {
    return (
        <div className={cn(
            "glass-card p-4 rounded-xl flex items-center gap-4 group transition-all duration-300",
            task.completed && "opacity-60 bg-slate-50"
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
                    "font-bold text-slate-800 mb-1 transition-all",
                    task.completed && "line-through text-slate-400"
                )}>
                    {task.title}
                </h4>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{task.date}</span>
                    </div>
                    {task.project && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                            {task.project}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3">
                {task.priority === 'high' && (
                    <div className="flex items-center gap-1 text-xs font-bold text-danger bg-danger/10 px-2 py-1 rounded-lg">
                        <Flag className="w-3.5 h-3.5 fill-current" />
                        <span>High</span>
                    </div>
                )}
                {task.priority === 'medium' && (
                    <div className="flex items-center gap-1 text-xs font-bold text-warning bg-warning/10 px-2 py-1 rounded-lg">
                        <Flag className="w-3.5 h-3.5 fill-current" />
                        <span>Med</span>
                    </div>
                )}

                <button
                    onClick={() => onEdit(task)}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
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
