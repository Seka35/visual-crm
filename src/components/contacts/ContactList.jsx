import React from 'react';
import { MoreHorizontal, Star } from 'lucide-react';

const ContactList = ({ contacts }) => {
    return (
        <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Company</th>
                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Rating</th>
                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tags</th>
                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {contacts.map((contact) => (
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
                                <div className="flex text-warning">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-3 h-3 ${i < contact.rating ? 'fill-current' : 'text-slate-200'}`} />
                                    ))}
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="flex gap-2">
                                    {contact.tags.map((tag, i) => (
                                        <span key={i} className={`text-[10px] font-bold px-2 py-1 rounded-lg ${tag === 'VIP' ? 'bg-purple-100 text-purple-600' :
                                                tag === 'New' ? 'bg-blue-100 text-blue-600' :
                                                    'bg-slate-100 text-slate-500'
                                            }`}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </td>
                            <td className="p-4 text-right">
                                <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ContactList;
