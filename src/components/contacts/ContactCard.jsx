import React from 'react';
import { Phone, Mail, Building, Star, MoreHorizontal } from 'lucide-react';

const ContactCard = ({ contact }) => {
    return (
        <div className="glass-card p-5 rounded-2xl group relative hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            <div className="flex flex-col items-center text-center mb-4">
                <div className="relative mb-3">
                    <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                    />
                    <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${contact.status === 'online' ? 'bg-success' : 'bg-slate-300'
                        }`} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">{contact.name}</h3>
                <p className="text-sm text-slate-500 font-medium">{contact.role}</p>
                <div className="flex items-center gap-1 mt-1 text-warning">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < contact.rating ? 'fill-current' : 'text-slate-200'}`} />
                    ))}
                </div>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2 rounded-xl">
                    <Building className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{contact.company}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2 rounded-xl">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{contact.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2 rounded-xl">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{contact.phone}</span>
                </div>
            </div>

            <div className="flex gap-2 mt-auto">
                {contact.tags.map((tag, i) => (
                    <span key={i} className={`text-[10px] font-bold px-2 py-1 rounded-lg ${tag === 'VIP' ? 'bg-purple-100 text-purple-600' :
                            tag === 'New' ? 'bg-blue-100 text-blue-600' :
                                'bg-slate-100 text-slate-500'
                        }`}>
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default ContactCard;
