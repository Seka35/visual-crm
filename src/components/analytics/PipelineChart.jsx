import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
    { name: 'Lead', value: 120 },
    { name: 'Qualified', value: 80 },
    { name: 'Proposal', value: 45 },
    { name: 'Negotiation', value: 20 },
    { name: 'Won', value: 12 },
];

const colors = ['#94A3B8', '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981'];

const PipelineChart = ({ data }) => {
    return (
        <div className="glass-card p-6 rounded-2xl h-[400px]">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Pipeline Funnel</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    layout="vertical"
                    data={data}
                    margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
                >
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
                        width={80}
                    />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PipelineChart;
