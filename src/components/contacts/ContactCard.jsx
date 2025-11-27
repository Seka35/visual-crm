import React from 'react';
import { Phone, Mail, Building, Star, MoreHorizontal } from 'lucide-react';
import crewImage from '../../assets/crew.webp';
import { useCRM } from '../../context/CRMContext';

const ContactCard = ({ contact }) => {
    const { tasks, deals } = useCRM();

    // Calculate associations from global state to ensure consistency with Modal
    const associatedTasks = tasks.filter(t => t.contacts?.some(c => c.id === contact.id));
    const associatedDeals = Object.values(deals).flatMap(s => s.items).filter(d => d.contacts?.some(c => c.id === contact.id));

    return (
        <div className="glass-card p-5 rounded-2xl group relative hover:-translate-y-1 transition-all duration-300 dark:bg-slate-900/50 dark:border-slate-800">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            <div className="flex flex-col items-center text-center mb-4">
                <div className="relative mb-3">
                    <img
                        src={contact.avatar || crewImage}
                        alt={contact.name}
                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md bg-slate-100"
                    />
                    <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${contact.status === 'online' ? 'bg-success' : 'bg-slate-300'
                        }`} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{contact.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{contact.role}</p>
                <div className="flex items-center gap-1 mt-1 text-warning">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < contact.rating ? 'fill-current' : 'text-slate-200'}`} />
                    ))}
                </div>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
                    <Building className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{contact.company}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{contact.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{contact.phone}</span>
                </div>
            </div>

            <div className="space-y-3 mb-4 w-full">
                {associatedDeals.length > 0 && (
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deals</p>
                        <div className="space-y-1">
                            {associatedDeals.map(deal => (
                                <div key={deal.id} className="flex justify-between items-center text-xs bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg border border-purple-100 dark:border-purple-800/50">
                                    <span className="font-medium text-purple-700 dark:text-purple-300 truncate mr-2">{deal.title}</span>
                                    <span className="font-bold text-purple-600 dark:text-purple-400 whitespace-nowrap">{deal.amount}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {associatedTasks.length > 0 && (
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tasks</p>
                        <div className="space-y-1">
                            {associatedTasks.map(task => (
                                <div key={task.id} className="flex items-center gap-2 text-xs bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-100 dark:border-blue-800/50">
                                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${task.completed ? 'bg-green-500' : 'bg-blue-500'}`} />
                                    <span className={`font-medium text-blue-700 dark:text-blue-300 truncate ${task.completed ? 'line-through opacity-70' : ''}`}>{task.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-2 mt-auto">
                {contact.tags.map((tag, i) => (
                    <span key={i} className={`text-[10px] font-bold px-2 py-1 rounded-lg ${tag === 'VIP' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300' :
                        tag === 'New' ? 'bg-primary/10 text-primary' :
                            'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default ContactCard;
