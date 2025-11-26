import React, { useState, useMemo } from 'react';
import { Download, Calendar, ChevronDown } from 'lucide-react';
import RevenueChart from '../components/analytics/RevenueChart';
import PipelineChart from '../components/analytics/PipelineChart';
import DebtChart from '../components/analytics/DebtChart';
import { useCRM } from '../context/CRMContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
                label = labels[date.getDay()];
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

    const pipelineData = [
        { name: 'Lead', value: deals.lead?.items?.length || 0 },
        { name: 'Qualified', value: deals.qualified?.items?.length || 0 },
        { name: 'Proposal', value: deals.proposal?.items?.length || 0 },
        { name: 'Negotiation', value: deals.negotiation?.items?.length || 0 },
        { name: 'Won', value: deals.won?.items?.length || 0 },
    ];

    const generatePDF = () => {
        try {
            const doc = new jsPDF();
            const date = new Date().toLocaleDateString();
            const title = `Ledger Report - ${currentLabel}`;

            // Add Title
            doc.setFontSize(20);
            doc.text(title, 14, 22);
            doc.setFontSize(10);
            doc.text(`Generated on: ${date}`, 14, 30);

            // Filter Data based on Time Range
            const filteredDeals = [
                ...(deals.lead?.items || []).map(d => ({ ...d, stage: 'Lead' })),
                ...(deals.qualified?.items || []).map(d => ({ ...d, stage: 'Qualified' })),
                ...(deals.proposal?.items || []).map(d => ({ ...d, stage: 'Proposal' })),
                ...(deals.negotiation?.items || []).map(d => ({ ...d, stage: 'Negotiation' })),
                ...(deals.won?.items || []).map(d => ({ ...d, stage: 'Won' }))
            ].filter(d => d.date && filterByDate(d.date, timeRange));

            const filteredDebts = [
                ...(debts.lent?.items || []).map(d => ({ ...d, status: 'Lent' })),
                ...(debts.partial?.items || []).map(d => ({ ...d, status: 'Partial' })),
                ...(debts.repaid?.items || []).map(d => ({ ...d, status: 'Repaid' }))
            ].filter(d => {
                const dateStr = d.date_lent || d.created_at;
                return dateStr && filterByDate(dateStr, timeRange);
            });

            // Helper to safely parse amount
            const parseAmount = (val) => {
                if (typeof val === 'number') return val;
                if (!val) return 0;
                return parseFloat(String(val).replace(/[^0-9.-]+/g, "") || 0);
            };

            // Calculate Totals
            const totalRevenue = filteredDeals.reduce((acc, d) => acc + parseAmount(d.amount), 0);
            const totalDebtLent = filteredDebts.reduce((acc, d) => acc + parseAmount(d.amount_lent), 0);
            const totalDebtRepaid = filteredDebts.reduce((acc, d) => acc + parseAmount(d.amount_repaid), 0);
            const totalDebtOutstanding = totalDebtLent - totalDebtRepaid;

            // Calculate Deal Stage Totals
            const dealStageTotals = filteredDeals.reduce((acc, d) => {
                const stage = d.stage || 'Unknown';
                acc[stage] = (acc[stage] || 0) + parseAmount(d.amount);
                return acc;
            }, {});

            // Summary Section
            doc.setFontSize(14);
            doc.text("Summary", 14, 45);
            doc.setFontSize(10);

            // Row 1: High Level
            doc.text(`Total Revenue: $${totalRevenue.toLocaleString()}`, 14, 55);
            doc.text(`Active Deals: ${filteredDeals.length}`, 80, 55);

            // Row 2: Debt High Level
            doc.text(`Total Lent: $${totalDebtLent.toLocaleString()}`, 14, 62);
            doc.text(`Total Repaid: $${totalDebtRepaid.toLocaleString()}`, 80, 62);
            doc.text(`Outstanding: $${totalDebtOutstanding.toLocaleString()}`, 140, 62);

            // Deal Stage Breakdown
            doc.setFontSize(12);
            doc.text("Deal Breakdown by Stage", 14, 75);

            const stages = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won'];

            autoTable(doc, {
                startY: 78,
                head: [['Stage', 'Total Amount']],
                body: stages.map(stage => [stage, `$${(dealStageTotals[stage] || 0).toLocaleString()}`]),
                theme: 'plain',
                styles: { fontSize: 9, cellPadding: 1, minCellHeight: 5 },
                columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 }, 1: { cellWidth: 40 } },
                margin: { left: 14 }
            });

            // Deals Table
            if (filteredDeals.length > 0) {
                const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) || 90;
                doc.setFontSize(14);
                doc.text("Deals Detail", 14, finalY + 15);
                autoTable(doc, {
                    startY: finalY + 20,
                    head: [['Date', 'Deal Name', 'Stage', 'Amount']],
                    body: filteredDeals.map(d => [
                        new Date(d.date).toLocaleDateString(),
                        d.title || d.content,
                        d.stage,
                        typeof d.amount === 'number' ? `$${d.amount}` : d.amount
                    ]),
                    theme: 'grid',
                    headStyles: { fillColor: [66, 66, 66] },
                    foot: [['', '', 'Total', `$${totalRevenue.toLocaleString()}`]],
                    footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
                });
            }

            // Debts Table
            if (filteredDebts.length > 0) {
                const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) || 80;
                doc.setFontSize(14);
                doc.text("Debts Detail", 14, finalY + 15);
                autoTable(doc, {
                    startY: finalY + 20,
                    head: [['Date', 'Borrower', 'Status', 'Lent', 'Repaid']],
                    body: filteredDebts.map(d => [
                        new Date(d.date_lent || d.created_at).toLocaleDateString(),
                        d.borrower_name,
                        d.status,
                        `$${d.amount_lent}`,
                        `$${d.amount_repaid || 0}`
                    ]),
                    theme: 'grid',
                    headStyles: { fillColor: [220, 53, 69] }, // Red for debts
                    foot: [['', '', 'Total', `$${totalDebtLent.toLocaleString()}`, `$${totalDebtRepaid.toLocaleString()}`]],
                    footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
                });
            }

            doc.save(`ledger_report_${timeRange}_${date.replace(/\//g, '-')}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF. Check console for details.");
        }
    };

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

                    <button
                        onClick={generatePDF}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all w-full sm:w-auto"
                    >
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
