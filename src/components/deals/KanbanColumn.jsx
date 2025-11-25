import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { MoreHorizontal, Plus } from 'lucide-react';
import DealCard from './DealCard';
import { cn } from '../../lib/utils';

const KanbanColumn = ({ id, title, count, total, color, deals }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    });

    return (
        <div className="flex flex-col h-full w-full md:min-w-[300px] md:w-[300px]">
            <div className="flex justify-between items-center mb-4 px-1">
                <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", color)} />
                    <h3 className="font-bold text-slate-700 dark:text-slate-200">{title}</h3>
                    <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>
                </div>
                <div className="flex gap-1">
                    <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 transition-colors">
                        <Plus className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="mb-4 px-1">
                <div className="h-1 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={cn("h-full", color)} style={{ width: '100%' }} />
                </div>
                <p className="text-xs text-slate-400 font-medium mt-1 text-right">Total: {total}</p>
            </div>

            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl p-3 space-y-3 transition-colors",
                    isOver && "bg-primary/5 ring-2 ring-primary/20"
                )}
            >
                {deals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} onClick={() => onDealClick(deal)} />
                ))}
                {deals.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 text-sm font-medium">
                        Drop here
                    </div>
                )}
            </div>
        </div>
    );
};

export default KanbanColumn;
