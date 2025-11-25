import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Calendar, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

const DealCard = ({ deal, onClick }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: deal.id,
        data: deal,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={onClick}
            className={cn(
                "bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 group relative hover:shadow-md transition-all cursor-grab active:cursor-grabbing",
                isDragging && "opacity-50 rotate-3 scale-105 z-50"
            )}
        >
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick();
                    }}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>

            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-1">
                    <img src={deal.clientLogo} alt="" className="w-full h-full object-contain" />
                </div>
                <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">{deal.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{deal.clientName}</p>
                </div>
            </div>

            <div className="mb-3">
                <p className="text-lg font-bold text-slate-800 dark:text-white">{deal.amount}</p>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Probability</span>
                    <span className="font-medium">{deal.probability}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={cn(
                            "h-full rounded-full transition-all duration-500",
                            deal.probability > 75 ? "bg-success" :
                                deal.probability > 40 ? "bg-primary" :
                                    "bg-warning"
                        )}
                        style={{ width: `${deal.probability}%` }}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{deal.date}</span>
                </div>
                <img
                    src={deal.ownerAvatar}
                    alt="Owner"
                    className="w-6 h-6 rounded-full border-2 border-white"
                />
            </div>
        </div>
    );
};

export default DealCard;
