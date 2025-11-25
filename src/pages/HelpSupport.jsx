import React, { useState } from 'react';
import { HelpCircle, MessageSquare, Send, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { supabase } from '../lib/supabaseClient';

const HelpSupport = () => {
    const { user } = useCRM();
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [openFaq, setOpenFaq] = useState(null);

    const faqs = [
        {
            question: "How do I add a new contact?",
            answer: "Go to the Contacts page and click the 'Add Contact' button in the top right corner. Fill in the details and click Save."
        },
        {
            question: "Can I customize the deal stages?",
            answer: "Currently, deal stages are fixed to standard CRM stages (Lead, Qualified, Proposal, Negotiation, Won). Customization will be available in a future update."
        },
        {
            question: "How does the AI Assistant work?",
            answer: "The AI Assistant (Trevor) can help you manage your CRM data. You can ask him to add contacts, find deals, or check your schedule. Just click the orange chat button!"
        },
        {
            question: "Is my data secure?",
            answer: "Yes, all your data is encrypted and stored securely using Supabase. We use Row Level Security to ensure only you can access your data."
        }
    ];

    const handleSubmitTicket = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase
                .from('support_tickets')
                .insert([
                    {
                        user_id: user.id,
                        subject,
                        message,
                        status: 'open'
                    }
                ]);

            if (error) throw error;
            setStatus({ type: 'success', text: 'Ticket submitted successfully! We will get back to you soon.' });
            setSubject('');
            setMessage('');
        } catch (error) {
            setStatus({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto pb-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* FAQ Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold font-gta text-slate-800 dark:text-white tracking-wide">FAQ</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Common questions</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="glass-card rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full flex items-center justify-between p-4 text-left font-bold text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <span>{faq.question}</span>
                                    {openFaq === index ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                </button>
                                {openFaq === index && (
                                    <div className="p-4 pt-0 text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/50 mt-2">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Form */}
                <div className="glass-card p-6 rounded-2xl space-y-6 h-fit">
                    <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold font-gta text-slate-800 dark:text-white tracking-wide">Contact Support</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Send us a message</p>
                        </div>
                    </div>

                    {status && (
                        <div className={`p-4 rounded-xl text-lg ${status.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                            {status.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmitTicket} className="space-y-4">
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 mb-2 font-medium">Subject</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="What do you need help with?"
                                required
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-800 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 mb-2 font-medium">Message</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Describe your issue in detail..."
                                required
                                rows={5}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-800 dark:text-white resize-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-lg shadow-primary/20"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    <span>Submit Ticket</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default HelpSupport;
