import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Briefcase, DollarSign, CheckSquare, X } from 'lucide-react';
import { useCRM } from '../context/CRMContext';

const CommandCenter = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const { contacts, deals, debts, tasks } = useCRM();

    // Toggle with Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Filter results
    const getResults = () => {
        if (!query) return [];

        const results = [];
        const lowerQuery = query.toLowerCase();

        // Contacts
        contacts.forEach(contact => {
            if (contact.name.toLowerCase().includes(lowerQuery) ||
                contact.email?.toLowerCase().includes(lowerQuery) ||
                contact.company?.toLowerCase().includes(lowerQuery)) {
                results.push({
                    type: 'contact',
                    id: contact.id,
                    title: contact.name,
                    subtitle: contact.role ? `${contact.role} at ${contact.company}` : contact.company,
                    icon: User,
                    path: '/contacts'
                });
            }
        });

        // Deals
        Object.values(deals).forEach(column => {
            column.items.forEach(deal => {
                if (deal.title.toLowerCase().includes(lowerQuery) ||
                    deal.company?.toLowerCase().includes(lowerQuery)) {
                    results.push({
                        type: 'deal',
                        id: deal.id,
                        title: deal.title,
                        subtitle: `${deal.amount} • ${column.title}`,
                        icon: Briefcase,
                        path: '/deals'
                    });
                }
            });
        });

        // Debts
        Object.values(debts).forEach(column => {
            column.items.forEach(debt => {
                if (debt.borrower_name?.toLowerCase().includes(lowerQuery) ||
                    debt.description?.toLowerCase().includes(lowerQuery)) {
                    results.push({
                        type: 'debt',
                        id: debt.id,
                        title: debt.borrower_name || 'Unknown Borrower',
                        subtitle: `${debt.amount_lent} • ${column.title}`,
                        icon: DollarSign,
                        path: '/debts'
                    });
                }
            });
        });

        // Tasks
        tasks.forEach(task => {
            if (task.title.toLowerCase().includes(lowerQuery) ||
                task.description?.toLowerCase().includes(lowerQuery)) {
                results.push({
                    type: 'task',
                    id: task.id,
                    title: task.title,
                    subtitle: task.dueDate,
                    icon: CheckSquare,
                    path: '/tasks'
                });
            }
        });

        return results.slice(0, 10); // Limit to 10 results
    };

    const results = getResults();

    // Handle selection
    const handleSelect = (result) => {
        if (!result) return;

        setIsOpen(false);
        // Navigate with query param to open the modal
        navigate(`${result.path}?openId=${result.id}`);
    };

    // Keyboard navigation
    const handleInputKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            handleSelect(results[selectedIndex]);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Search Input */}
                <div className="flex items-center px-4 py-4 border-b border-slate-700">
                    <Search className="w-5 h-5 text-slate-400 mr-3" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search contacts, deals, debts..."
                        className="flex-1 bg-transparent text-lg text-white placeholder-slate-500 focus:outline-none"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleInputKeyDown}
                    />
                    <div className="flex items-center gap-2">
                        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-slate-700 bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-slate-400 opacity-100">
                            <span className="text-xs">ESC</span>
                        </kbd>
                        <button onClick={() => setIsOpen(false)}>
                            <X className="w-5 h-5 text-slate-400 hover:text-white" />
                        </button>
                    </div>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {results.length === 0 ? (
                        <div className="py-12 text-center text-slate-500">
                            {query ? 'No results found.' : 'Type to search...'}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {results.map((result, index) => {
                                const Icon = result.icon;
                                return (
                                    <button
                                        key={`${result.type}-${result.id}`}
                                        onClick={() => handleSelect(result)}
                                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${index === selectedIndex
                                                ? 'bg-primary/20 text-white'
                                                : 'text-slate-300 hover:bg-slate-800'
                                            }`}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                    >
                                        <div className={`p-2 rounded-md ${index === selectedIndex ? 'bg-primary/20' : 'bg-slate-800'
                                            }`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-medium">{result.title}</div>
                                            <div className="text-sm text-slate-500">{result.subtitle}</div>
                                        </div>
                                        {index === selectedIndex && (
                                            <div className="ml-auto text-xs text-slate-400">
                                                Press Enter
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 text-xs text-slate-500 flex justify-between">
                    <span>Pro tip: Use arrow keys to navigate</span>
                    <span>Visual CRM v1.0</span>
                </div>
            </div>
        </div>
    );
};

export default CommandCenter;
