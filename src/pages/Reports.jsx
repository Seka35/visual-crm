import React from 'react';
import { Download, Calendar } from 'lucide-react';
import RevenueChart from '../components/analytics/RevenueChart';
import PipelineChart from '../components/analytics/PipelineChart';
import { useCRM } from '../context/CRMContext';

const Reports = () => {
    const { deals } = useCRM();

    // Calculate Pipeline Data
    const pipelineData = [
        { name: 'Lead', value: deals.lead?.items?.length || 0 },
        { name: 'Qualified', value: deals.qualified?.items?.length || 0 },
        { name: 'Proposal', value: deals.proposal?.items?.length || 0 },
        { name: 'Negotiation', value: deals.negotiation?.items?.length || 0 },
        { name: 'Won', value: deals.won?.items?.length || 0 },
    ];

    // Calculate Revenue Data by Stage (Aggregated by month and stage)
    const allDeals = [
        ...(deals.lead?.items || []).map(d => ({ ...d, stage: 'lead' })),
        ...(deals.qualified?.items || []).map(d => ({ ...d, stage: 'qualified' })),
        ...(deals.proposal?.items || []).map(d => ({ ...d, stage: 'proposal' })),
        ...(deals.negotiation?.items || []).map(d => ({ ...d, stage: 'negotiation' })),
        ...(deals.won?.items || []).map(d => ({ ...d, stage: 'won' }))
    ];

    // Initialize months with 0 value for each stage
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueByMonthAndStage = months.reduce((acc, month) => {
        acc[month] = {
            lead: 0,
            qualified: 0,
            proposal: 0,
            negotiation: 0,
            won: 0
        };
        return acc;
    }, {});

    // Aggregate revenue by month and stage
    allDeals.forEach(deal => {
        if (!deal.date) return;
        try {
            const date = new Date(deal.date);
            if (!isNaN(date.getTime())) {
                const monthIndex = date.getMonth();
                const monthName = months[monthIndex];
                const amount = parseFloat(deal.amount?.replace(/[^0-9.-]+/g, "") || 0);
                revenueByMonthAndStage[monthName][deal.stage] += amount;
            }
        } catch (e) {
            console.error("Error parsing date for deal:", deal);
        }
    });

    const revenueData = months.map(month => ({
        name: month,
        lead: revenueByMonthAndStage[month].lead,
        qualified: revenueByMonthAndStage[month].qualified,
        proposal: revenueByMonthAndStage[month].proposal,
        negotiation: revenueByMonthAndStage[month].negotiation,
        won: revenueByMonthAndStage[month].won
    }));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-6xl font-bold font-gta text-slate-800 dark:text-white mb-4">Reports & Analytics</h2>
                    <p className="text-slate-500 dark:text-slate-400">Track your performance and growth</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full sm:w-auto">
                        <Calendar className="w-4 h-4" />
                        <span>This Month</span>
                    </button>
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
                <div className="lg:col-span-2">
                    <PipelineChart data={pipelineData} />
                </div>
            </div>
        </div>
    );
};

export default Reports;
