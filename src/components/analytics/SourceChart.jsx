import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const data = [
    { name: 'Organic Search', value: 400 },
    { name: 'Social Media', value: 300 },
    { name: 'Direct', value: 300 },
    { name: 'Referral', value: 200 },
];

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'];

const SourceChart = () => {
    return (
        <div className="glass-card p-6 rounded-2xl h-[400px]">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Lead Sources</h3>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SourceChart;
