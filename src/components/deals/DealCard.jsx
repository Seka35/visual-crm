import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Calendar, MoreHorizontal, Bell } from 'lucide-react';
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
                <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-slate-800 dark:text-white">{deal.amount}</p>
                    {deal.payment_type && (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${deal.payment_type === 'monthly' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' :
                                deal.payment_type === 'yearly' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300' :
                                    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                            {deal.payment_type === 'one-time' ? 'One-time' : deal.payment_type === 'monthly' ? 'Monthly' : 'Yearly'}
                        </span>
                    )}
                </div>
                {deal.amount_paid > 0 && (
                    <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400">Paid</span>
                            <span className="font-medium text-green-600 dark:text-green-400">${deal.amount_paid}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400">Remaining</span>
                            <span className="font-medium text-orange-600 dark:text-orange-400">
                                ${(parseFloat(deal.amount?.replace(/[^0-9.-]+/g, '') || 0) - deal.amount_paid).toFixed(2)}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {deal.notes && (
                <div className="mb-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic">
                        {deal.notes}
                    </p>
                </div>
            )}



            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{deal.date}</span>
                    </div>
                    {deal.reminder_date && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-500 font-medium bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                            <Bell className="w-3 h-3" />
                            <span>{deal.reminder_date} {deal.reminder_time?.slice(0, 5)}</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {deal.contacts && deal.contacts.length > 0 && (
                        <div className="flex -space-x-2">
                            {deal.contacts.slice(0, 3).map((contact) => (
                                <img
                                    key={contact.id}
                                    src={contact.avatar}
                                    alt={contact.name}
                                    title={contact.name}
                                    className="w-5 h-5 rounded-full border-2 border-white dark:border-slate-800 object-cover"
                                />
                            ))}
                            {deal.contacts.length > 3 && (
                                <div className="w-5 h-5 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-500">
                                    +{deal.contacts.length - 3}
                                </div>
                            )}
                        </div>
                    )}
                    <img
                        src={deal.ownerAvatar}
                        alt="Owner"
                        className="w-6 h-6 rounded-full border-2 border-white"
                    />
                </div>
            </div>
        </div>
    );
};

export default DealCard;
