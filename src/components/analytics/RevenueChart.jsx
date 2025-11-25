import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const RevenueChart = ({ data }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Define colors for each deal stage
    const stageColors = {
        lead: '#8B5CF6',      // Purple
        qualified: '#3B82F6', // Blue
        proposal: '#10B981',  // Green
        negotiation: '#F59E0B', // Orange
        won: '#EF4444'        // Red
    };

    return (
        <div className="glass-card p-6 rounded-2xl dark:bg-slate-900/50 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Revenue Overview by Deal Stage</h3>
            <ResponsiveContainer width="100%" height={350}>
                <LineChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#E2E8F0'} />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94A3B8', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94A3B8', fontSize: 12 }}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: isDark ? '#1e293b' : '#fff',
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            color: isDark ? '#fff' : '#000'
                        }}
                        formatter={(value) => [`$${value}`, '']}
                    />
                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="line"
                        formatter={(value) => {
                            const labels = {
                                lead: 'Lead',
                                qualified: 'Qualified',
                                proposal: 'Proposal',
                                negotiation: 'Negotiation',
                                won: 'Won'
                            };
                            return <span style={{ color: isDark ? '#e2e8f0' : '#475569', fontWeight: 600 }}>{labels[value] || value}</span>;
                        }}
                    />

                    {/* Line for each deal stage */}
                    <Line
                        type="monotone"
                        dataKey="lead"
                        stroke={stageColors.lead}
                        strokeWidth={2.5}
                        dot={{ fill: stageColors.lead, r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="qualified"
                        stroke={stageColors.qualified}
                        strokeWidth={2.5}
                        dot={{ fill: stageColors.qualified, r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="proposal"
                        stroke={stageColors.proposal}
                        strokeWidth={2.5}
                        dot={{ fill: stageColors.proposal, r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="negotiation"
                        stroke={stageColors.negotiation}
                        strokeWidth={2.5}
                        dot={{ fill: stageColors.negotiation, r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="won"
                        stroke={stageColors.won}
                        strokeWidth={2.5}
                        dot={{ fill: stageColors.won, r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RevenueChart;
