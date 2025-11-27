import React from 'react';
import { MoreHorizontal, Star } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

const ContactList = ({ contacts }) => {
    const { tasks, deals } = useCRM();

    return (
        <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Company</th>
                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Associations</th>
                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Rating</th>
                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {contacts.map((contact) => {
                        const associatedTasks = tasks.filter(t => t.contacts?.some(c => c.id === contact.id));
                        const associatedDeals = Object.values(deals).flatMap(s => s.items).filter(d => d.contacts?.some(c => c.id === contact.id));

                        return (
                            <tr key={contact.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <img src={contact.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                        <div>
                                            <p className="font-bold text-slate-800">{contact.name}</p>
                                            <p className="text-xs text-slate-500">{contact.role}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-slate-600 font-medium">{contact.company}</td>
                                <td className="p-4 text-sm text-slate-500">{contact.email}</td>
                                <td className="p-4">
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
                                <td className="p-4">
                                    <div className="flex text-warning">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-3 h-3 ${i < contact.rating ? 'fill-current' : 'text-slate-200'}`} />
                                        ))}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <p className="text-sm text-slate-500 truncate max-w-[200px]">{contact.notes || '-'}</p>
                                </td>
                                <td className="p-4 text-right">
                                    <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default ContactList;
