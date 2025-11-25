import React from 'react';
import { MoreHorizontal } from 'lucide-react';

const PipelineStage = ({ label, count, amount, color, percentage }) => (
    <div className="flex-1 min-w-[120px] group">
        <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-slate-600">{label}</span>
            <span className="text-xs text-slate-400 font-medium">{count} deals</span>
        </div>

        <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
            <div
                className={`h-full rounded-full ${color} opacity-80 group-hover:opacity-100 transition-all duration-500`}
                style={{ width: `${percentage}%` }}
            />
        </div>

        <p className="text-sm font-bold text-slate-700">{amount}</p>
    </div>
);

const PipelineWidget = ({ deals = {} }) => {
    const calculateStageData = (stageName, color, percentage) => {
        const stageDeals = deals[stageName]?.items || [];
        const count = stageDeals.length;
        const amount = stageDeals.reduce((acc, deal) => {
            return acc + parseFloat(deal.amount?.replace(/[^0-9.-]+/g, "") || 0);
        }, 0);

        return {
            label: stageName.charAt(0).toUpperCase() + stageName.slice(1),
            count,
            amount: `$${amount >= 1000 ? (amount / 1000).toFixed(1) + 'k' : amount}`,
            color,
            percentage
        };
    };

    const stages = [
        calculateStageData('lead', 'bg-slate-400', 100),
        calculateStageData('qualified', 'bg-primary', 75),
        calculateStageData('proposal', 'bg-secondary', 50),
        calculateStageData('negotiation', 'bg-warning', 30),
        calculateStageData('won', 'bg-success', 15),
    ];

    return (
        <div className="glass-card p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Deals Pipeline</h3>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-slate-400" />
                </button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2">
                {stages.map((stage, index) => (
                    <PipelineStage key={index} {...stage} />
                ))}
            </div>
        </div>
    );
};

export default PipelineWidget;
