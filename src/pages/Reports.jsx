import React, { useState, useMemo } from 'react';
import { Download, Calendar, ChevronDown } from 'lucide-react';
import RevenueChart from '../components/analytics/RevenueChart';
import PipelineChart from '../components/analytics/PipelineChart';
import DebtChart from '../components/analytics/DebtChart';
import { useCRM } from '../context/CRMContext';

const Reports = () => {
    const { deals, debts } = useCRM();
    const [timeRange, setTimeRange] = useState('year'); // 'year', 'month', 'week', 'today'
    const [isTimeMenuOpen, setIsTimeMenuOpen] = useState(false);

    const timeOptions = [
        { id: 'year', label: 'This Year' },
        { id: 'month', label: 'This Month' },
        { id: 'week', label: 'This Week' },
        { id: 'today', label: 'Today' },
    ];

    const currentLabel = timeOptions.find(opt => opt.id === timeRange)?.label;

    // Helper to check if a date falls within the selected range
    const filterByDate = (dateStr, range) => {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        const now = new Date();

        if (range === 'year') {
            return date.getFullYear() === now.getFullYear();
        } else if (range === 'month') {
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        } else if (range === 'week') {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(now.getDate() - 7);
            return date >= oneWeekAgo && date <= now;
        } else if (range === 'today') {
            return date.getDate() === now.getDate() &&
                date.getMonth() === now.getMonth() &&
                date.getFullYear() === now.getFullYear();
        }
        return false;
    };

    // Calculate Chart Data based on Time Range
    const { revenueData, debtData } = useMemo(() => {
        const now = new Date();
        let labels = [];
        let dataMap = {};

        // 1. Define Labels and Initialize Map based on Range
        if (timeRange === 'year') {
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            labels.forEach(l => dataMap[l] = {
                revenue: { lead: 0, qualified: 0, proposal: 0, negotiation: 0, won: 0 },
                debt: { lent: 0, partial: 0, repaid: 0 }
            });
        } else if (timeRange === 'month') {
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            for (let i = 1; i <= daysInMonth; i++) {
                const label = i.toString();
                labels.push(label);
                dataMap[label] = {
                    revenue: { lead: 0, qualified: 0, proposal: 0, negotiation: 0, won: 0 },
                    debt: { lent: 0, partial: 0, repaid: 0 }
                };
            }
        } else if (timeRange === 'week') {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            // Reorder to start from 7 days ago? Or just standard week? 
            // Let's do standard Mon-Sun or just last 7 days. 
            // Let's do standard week days for simplicity of labels
            labels = days;
            labels.forEach(l => dataMap[l] = {
                revenue: { lead: 0, qualified: 0, proposal: 0, negotiation: 0, won: 0 },
                debt: { lent: 0, partial: 0, repaid: 0 }
            });
        } else if (timeRange === 'today') {
            for (let i = 0; i < 24; i++) {
                const label = `${i.toString().padStart(2, '0')}:00`;
                labels.push(label);
                dataMap[label] = {
                    revenue: { lead: 0, qualified: 0, proposal: 0, negotiation: 0, won: 0 },
                    debt: { lent: 0, partial: 0, repaid: 0 }
                };
            }
        }

        // 2. Aggregate Revenue
        const allDeals = [
            ...(deals.lead?.items || []).map(d => ({ ...d, stage: 'lead' })),
            ...(deals.qualified?.items || []).map(d => ({ ...d, stage: 'qualified' })),
            ...(deals.proposal?.items || []).map(d => ({ ...d, stage: 'proposal' })),
            ...(deals.negotiation?.items || []).map(d => ({ ...d, stage: 'negotiation' })),
            ...(deals.won?.items || []).map(d => ({ ...d, stage: 'won' }))
        ];

        allDeals.forEach(deal => {
            if (!deal.date || !filterByDate(deal.date, timeRange)) return;

            const date = new Date(deal.date);
            let label = '';

            if (timeRange === 'year') {
                label = labels[date.getMonth()];
            } else if (timeRange === 'month') {
                label = date.getDate().toString();
            } else if (timeRange === 'week') {
                label = labels[date.getDay()]; // 0 is Sun
            } else if (timeRange === 'today') {
                label = `${date.getHours().toString().padStart(2, '0')}:00`;
            }

            if (dataMap[label]) {
                const amount = parseFloat(deal.amount?.replace(/[^0-9.-]+/g, "") || 0);
                dataMap[label].revenue[deal.stage] += amount;
            }
        });

        // 3. Aggregate Debt
        const allDebts = [
            ...(debts.lent?.items || []).map(d => ({ ...d, status: 'lent' })),
            ...(debts.partial?.items || []).map(d => ({ ...d, status: 'partial' })),
            ...(debts.repaid?.items || []).map(d => ({ ...d, status: 'repaid' }))
        ];

        allDebts.forEach(debt => {
            const dateStr = debt.date_lent || debt.created_at;
            if (!dateStr || !filterByDate(dateStr, timeRange)) return;

            const date = new Date(dateStr);
            let label = '';

            if (timeRange === 'year') {
                label = labels[date.getMonth()];
            } else if (timeRange === 'month') {
                label = date.getDate().toString();
            } else if (timeRange === 'week') {
                label = labels[date.getDay()];
            } else if (timeRange === 'today') {
                label = `${date.getHours().toString().padStart(2, '0')}:00`;
            }

            if (dataMap[label]) {
                const amount = parseFloat(debt.amount_lent?.replace(/[^0-9.-]+/g, "") || 0);
                if (debt.status === 'repaid') {
                    dataMap[label].debt.repaid += amount;
                } else if (debt.status === 'partial') {
                    dataMap[label].debt.partial += amount;
                } else {
                    dataMap[label].debt.lent += amount;
                }
            }
        });

        // 4. Format for Charts
        const finalRevenueData = labels.map(label => ({
            name: label,
            ...dataMap[label].revenue
        }));

        const finalDebtData = labels.map(label => ({
            name: label,
            ...dataMap[label].debt
        }));

        return { revenueData: finalRevenueData, debtData: finalDebtData };

    }, [deals, debts, timeRange]);


    // Calculate Pipeline Data (Filtered by current range? usually pipeline is snapshot, but let's filter by created/updated if possible. 
    // For now, let's keep pipeline as snapshot of CURRENT state, as it represents active deals in stages)
    const pipelineData = [
        { name: 'Lead', value: deals.lead?.items?.length || 0 },
        { name: 'Qualified', value: deals.qualified?.items?.length || 0 },
        { name: 'Proposal', value: deals.proposal?.items?.length || 0 },
        { name: 'Negotiation', value: deals.negotiation?.items?.length || 0 },
        { name: 'Won', value: deals.won?.items?.length || 0 },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-6xl font-bold font-gta text-slate-800 dark:text-white mb-4">THE LEDGER</h2>
                    <p className="text-slate-500 dark:text-slate-400">Check the numbers. Don't lie to yourself.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-auto">
                        <button
                            onClick={() => setIsTimeMenuOpen(!isTimeMenuOpen)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full sm:w-auto min-w-[140px]"
                        >
                            <Calendar className="w-4 h-4" />
                            <span>{currentLabel}</span>
                            <ChevronDown className="w-4 h-4 ml-auto sm:ml-2" />
                        </button>

                        {isTimeMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsTimeMenuOpen(false)} />
                                <div className="absolute right-0 top-full mt-2 w-full sm:w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 p-1 z-20 animate-in fade-in slide-in-from-top-2">
                                    {timeOptions.map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => {
                                                setTimeRange(option.id);
                                                setIsTimeMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${timeRange === option.id
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all w-full sm:w-auto">
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="lg:col-span-2">
                    <RevenueChart data={revenueData} />
                </div>
                <div className="lg:col-span-1">
                    <PipelineChart data={pipelineData} />
                </div>
                <div className="lg:col-span-1">
                    <DebtChart data={debtData} />
                </div>
            </div>
        </div>
    );
};

export default Reports;
