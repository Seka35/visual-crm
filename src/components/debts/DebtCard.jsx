import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, DollarSign, Clock, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const DebtCard = ({ debt, deal, onClick }) => {
    const item = debt || deal;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: item.id,
        data: {
            type: 'Debt',
            debt: item
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-slate-800/50 p-4 rounded-xl border-2 border-primary/50 h-[200px] w-full opacity-50"
            />
        );
    }

    // Format dates
    const dateLent = new Date(item.date_lent).toLocaleDateString();
    const reminderDate = item.reminder_date ? new Date(item.reminder_date).toLocaleDateString() : null;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onClick(item)}
            className="group bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing relative overflow-hidden"
        >
            {/* Status Indicator Strip */}
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1",
                item.status === 'lent' && "bg-red-700",
                item.status === 'partial' && "bg-yellow-600",
                item.status === 'repaid' && "bg-emerald-700"
            )} />

            <div className="pl-3">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white font-gta tracking-wide text-lg">
                            {item.borrower_name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {item.description || 'No description'}
                        </p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-primary">
                            <Edit className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
                        <div className="flex items-center gap-2 text-red-700">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-bold font-mono">{item.amount_lent}</span>
                        </div>
                        <div className="text-xs text-slate-400">LENT</div>
                    </div>

                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
                        <div className="flex items-center gap-2 text-emerald-700">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-bold font-mono">{item.amount_repaid}</span>
                        </div>
                        <div className="text-xs text-slate-400">PAID</div>
                    </div>

                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{dateLent}</span>
                        </div>
                        {item.reminder_date && (
                            <div className="flex items-center gap-1.5 text-xs text-yellow-600 font-medium bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-md">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>{new Date(item.reminder_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DebtCard;
