import React from 'react';
import { MoreHorizontal, Star } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

const ContactList = ({ contacts, onContactClick }) => {
    const { tasks, deals } = useCRM();

    return (
        <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                        <tr>
                            <th className="p-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Name</th>
                            <th className="p-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden md:table-cell">Company</th>
                            <th className="p-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden lg:table-cell">Email</th>
                            <th className="p-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden xl:table-cell">Associations</th>
                            <th className="p-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden sm:table-cell">Description</th>
                            <th className="p-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {contacts.map((contact) => {
                            const associatedTasks = tasks.filter(t => t.contacts?.some(c => c.id === contact.id));
                            const associatedDeals = Object.values(deals).flatMap(s => s.items).filter(d => d.contacts?.some(c => c.id === contact.id));

                            return (
                                <tr
                                    key={contact.id}
                                    onClick={() => onContactClick?.(contact)}
                                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <img src={contact.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-slate-100">{contact.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{contact.role}</p>
                                                {/* Show company on mobile when column is hidden */}
                                                <p className="text-xs text-slate-400 dark:text-slate-500 md:hidden mt-0.5">{contact.company}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300 font-medium hidden md:table-cell">{contact.company}</td>
                                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400 hidden lg:table-cell">{contact.email}</td>
                                    <td className="p-4 hidden xl:table-cell">
                                        <div className="flex flex-col gap-1.5 min-w-[180px]">
                                            {associatedDeals.length > 0 && (
                                                <div className="flex flex-col gap-1">
                                                    {associatedDeals.map(deal => (
                                                        <div key={deal.id} className="flex items-center justify-between gap-2 text-[11px] bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded border border-purple-100 dark:border-purple-800/50">
                                                            <div className="flex items-center gap-1.5 overflow-hidden">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                                                                <span className="truncate text-purple-700 dark:text-purple-300 font-medium">{deal.title}</span>
                                                            </div>
                                                            <span className="font-bold text-purple-600 dark:text-purple-400 whitespace-nowrap">{deal.amount}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {associatedTasks.length > 0 && (
                                                <div className="flex flex-col gap-1">
                                                    {associatedTasks.map(task => (
                                                        <div key={task.id} className="flex items-center gap-1.5 text-[11px] bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded border border-blue-100 dark:border-blue-800/50">
                                                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${task.completed ? 'bg-green-500' : 'bg-blue-500'}`} />
                                                            <span className={`truncate text-blue-700 dark:text-blue-300 font-medium ${task.completed ? 'line-through opacity-70' : ''}`}>{task.title}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {(!associatedDeals.length && !associatedTasks.length) && (
                                                <span className="text-xs text-slate-400">-</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 hidden sm:table-cell">
                                        <p className="text-sm text-slate-600 dark:text-slate-300 truncate max-w-[200px] italic">{contact.notes || '-'}</p>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ContactList;
