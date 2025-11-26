import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PipelineStage = ({ label, count, amount, color, percentage, secondaryAmount, secondaryLabel }) => (
    <div className="flex-1 min-w-[120px] group">
        <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{count} debts</span>
        </div>

        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
            <div
                className={`h-full rounded-full transition-all duration-500`}
                style={{ width: `${percentage}%`, backgroundColor: color }}
            />
        </div>

        <div className="flex flex-col">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{amount}</p>
            {secondaryAmount && (
                <p className="text-xs font-medium text-red-500 mt-1">
                    {secondaryLabel}: {secondaryAmount}
                </p>
            )}
        </div>
    </div>
);

const DebtPipelineWidget = ({ debts = {} }) => {
    const navigate = useNavigate();

    // Calculate total debts for percentage calculation
    const allDebts = Object.values(debts).flatMap(stage => stage.items || []);
    const totalDebts = allDebts.length;

    // Calculate global outstanding debt
    const totalLent = allDebts.reduce((acc, debt) => acc + (parseFloat(debt.amount_lent?.replace(/[^0-9.-]+/g, '') || 0)), 0);
    const totalRepaid = allDebts.reduce((acc, debt) => acc + (parseFloat(debt.amount_repaid?.replace(/[^0-9.-]+/g, '') || 0)), 0);
    const outstanding = totalLent - totalRepaid;
    const formattedOutstanding = `$${outstanding >= 1000 ? (outstanding / 1000).toFixed(1) + 'k' : outstanding}`;

    const calculateStageData = (stageName, label, color, isLast = false) => {
        const stageDebts = debts[stageName]?.items || [];
        const count = stageDebts.length;

        const amount = stageDebts.reduce((acc, debt) => {
            const val = parseFloat(debt.amount_lent?.replace(/[^0-9.-]+/g, '') || 0);
            return acc + val;
        }, 0);

        const percentage = totalDebts > 0 ? (count / totalDebts) * 100 : 0;

        const data = {
            label,
            count,
            amount: `$${amount >= 1000 ? (amount / 1000).toFixed(1) + 'k' : amount}`,
            color,
            percentage: Math.max(percentage, count > 0 ? 5 : 0)
        };

        if (isLast) {
            data.secondaryAmount = formattedOutstanding;
            data.secondaryLabel = 'REMAINING';
        }

        return data;
    };

    const stages = [
        calculateStageData('lent', 'MONEY LENT', '#EF4444'),       // Red
        calculateStageData('partial', 'PARTIALLY REPAID', '#F59E0B'), // Yellow
        calculateStageData('repaid', 'FULLY REPAID', '#10B981', true),   // Green
    ];

    return (
        <div className="glass-card p-6 rounded-2xl cursor-pointer hover:-translate-y-1 transition-transform duration-300" onClick={() => navigate('/debts')}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Debts Pipeline</h3>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="w-5 h-5 text-slate-400" />
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 overflow-x-auto pb-2 no-scrollbar">
                {stages.map((stage, index) => (
                    <PipelineStage key={index} {...stage} />
                ))}
            </div>
        </div>
    );
};

export default DebtPipelineWidget;
