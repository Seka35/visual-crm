import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const data = [
    { name: 'Lead', value: 120 },
    { name: 'Qualified', value: 80 },
    { name: 'Proposal', value: 45 },
    { name: 'Negotiation', value: 20 },
    { name: 'Won', value: 12 },
];

// Colors matching the Revenue chart
const stageColors = {
    'Lead': '#8B5CF6',      // Purple
    'Qualified': '#3B82F6', // Blue
    'Proposal': '#10B981',  // Green
    'Negotiation': '#F59E0B', // Orange
    'Won': '#EF4444'        // Red
};

const PipelineChart = ({ data }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="glass-card p-6 rounded-2xl dark:bg-slate-900/50 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Pipeline Funnel</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    layout="vertical"
                    data={data}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 12, fontWeight: 500 }}
                        width={80}
                    />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{
                            backgroundColor: isDark ? '#1e293b' : '#fff',
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            color: isDark ? '#fff' : '#000'
                        }}
                        itemStyle={{
                            color: isDark ? '#fff' : '#000'
                        }}
                    />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={stageColors[entry.name] || '#94A3B8'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PipelineChart;
