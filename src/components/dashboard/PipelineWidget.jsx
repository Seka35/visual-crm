import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PipelineStage = ({ label, count, amount, color, percentage }) => (
    <div className="flex-1 min-w-[120px] group">
        <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{count} deals</span>
        </div>

        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
            <div
                className={`h-full rounded-full transition-all duration-500`}
                style={{ width: `${percentage}%`, backgroundColor: color }}
            />
        </div>

        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{amount}</p>
    </div>
);

const PipelineWidget = ({ deals = {} }) => {
    const navigate = useNavigate();

    // Calculate total deals for percentage calculation
    const allDeals = Object.values(deals).flatMap(stage => stage.items || []);
    const totalDeals = allDeals.length;

    const calculateStageData = (stageName, color) => {
        const stageDeals = deals[stageName]?.items || [];
        const count = stageDeals.length;
        const amount = stageDeals.reduce((acc, deal) => {
            return acc + parseInt(deal.amount?.replace(/[^0-9]/g, "") || 0);
        }, 0);

        // Calculate percentage based on actual deal count
        const percentage = totalDeals > 0 ? (count / totalDeals) * 100 : 0;

        return {
            label: stageName.charAt(0).toUpperCase() + stageName.slice(1),
            count,
            amount: `$${amount >= 1000 ? (amount / 1000).toFixed(1) + 'k' : amount}`,
            color,
            percentage: Math.max(percentage, count > 0 ? 5 : 0) // Minimum 5% if there are deals
        };
    };

    // Colors matching the Revenue chart
    const stages = [
        calculateStageData('lead', '#8B5CF6'),      // Purple
        calculateStageData('qualified', '#3B82F6'), // Blue
        calculateStageData('proposal', '#10B981'),  // Green
        calculateStageData('negotiation', '#F59E0B'), // Orange
        calculateStageData('won', '#EF4444'),       // Red
    ];

    return (
        <div className="glass-card p-6 rounded-2xl cursor-pointer hover:-translate-y-1 transition-transform duration-300" onClick={() => navigate('/reports')}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Deals Pipeline</h3>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="w-5 h-5 text-slate-400" />
                </button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                {stages.map((stage, index) => (
                    <PipelineStage key={index} {...stage} />
                ))}
            </div>
        </div>
    );
};

export default PipelineWidget;
