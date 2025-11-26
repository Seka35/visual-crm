import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const DebtChart = ({ data }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const colors = {
        lent: '#EF4444',    // Red
        partial: '#F59E0B', // Yellow
        repaid: '#10B981'   // Green
    };

    return (
        <div className="glass-card p-6 rounded-2xl dark:bg-slate-900/50 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Debt Distribution</h3>
            <ResponsiveContainer width="100%" height={350}>
                <BarChart
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
                        cursor={{ fill: isDark ? '#334155' : '#F1F5F9', opacity: 0.4 }}
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
                        formatter={(value) => {
                            const labels = {
                                lent: 'Money Lent',
                                partial: 'Partially Repaid',
                                repaid: 'Fully Repaid'
                            };
                            return <span style={{ color: isDark ? '#e2e8f0' : '#475569', fontWeight: 600 }}>{labels[value] || value}</span>;
                        }}
                    />
                    <Bar dataKey="lent" name="lent" fill={colors.lent} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="partial" name="partial" fill={colors.partial} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="repaid" name="repaid" fill={colors.repaid} radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DebtChart;
