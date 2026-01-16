import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import {
    LayoutGrid, DollarSign, AlertTriangle, CheckCircle, Briefcase, TrendingUp, Search, Filter, X, RefreshCw,
    Clock, AlertOctagon, ShieldAlert, FileText, ChevronRight, ChevronDown, Activity, Users, Target, BarChart2, AlertCircle, LightbulbIcon, Calendar
} from 'lucide-react';
import {
    ResponsiveContainer, Tooltip as RechartsTooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';
import api from '../api';
import NewProjectModal from '../components/NewProjectModal';

// --- Components ---



const KPICard = ({ title, value, subtext, trend, icon: Icon, color, isAlert, onClick, isActive, progress }) => {
    // Smart Text Sizing Logic
    const getValueSize = (val) => {
        const str = String(val);
        if (str.length > 15) return 'text-lg';
        if (str.length > 10) return 'text-xl';
        return 'text-2xl';
    };

    return (
        <div
            onClick={onClick}
            className={`
                relative overflow-hidden rounded-2xl p-5 transition-all duration-300 group
                ${isActive ? 'ring-2 ring-indigo-500 ring-offset-2 scale-[1.02] shadow-xl' : 'hover:scale-[1.02] hover:shadow-xl shadow-sm'}
                ${isAlert ? 'bg-red-50 border border-red-100' : 'bg-white border border-slate-100'}
                cursor-pointer
            `}
        >
            {/* Background Decor */}
            <div className={`absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500`}>
                <Icon size={120} />
            </div>

            <div className="flex justify-between items-start relative z-10">
                <div className="w-full">
                    <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${isAlert ? 'text-red-600' : 'text-slate-400'}`}>
                        {title}
                    </h3>
                    <div className={`font-bold text-slate-800 ${getValueSize(value)} tracking-tight`}>
                        {value}
                    </div>

                    {/* Progress Bar Visual */}
                    {progress !== undefined && (
                        <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 mb-1 overflow-hidden">
                            <div className={`h-full rounded-full ${color.includes('red') ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                        </div>
                    )}

                    {subtext && <p className={`text-xs mt-1 font-medium ${isAlert ? 'text-red-500' : 'text-slate-400'}`}>{subtext}</p>}

                    {trend && (
                        <div className={`flex items-center gap-1 text-xs font-bold mt-2 ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            <TrendingUp size={14} /> {Math.abs(trend)}% vs last month
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const HealthBadge = ({ status }) => {
    let color = 'bg-slate-100 text-slate-600';
    if (status === 'Good') color = 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (status === 'At Risk') color = 'bg-amber-100 text-amber-700 border-amber-200';
    if (status === 'Critical') color = 'bg-rose-100 text-rose-700 border-rose-200';

    return (
        <span className={`px-2 py-1 rounded-md text-xs font-bold border ${color} block text-center w-full`}>
            {status || 'N/A'}
        </span>
    );
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedSections, setExpandedSections] = useState({});

    const toggleSection = (key) => {
        setExpandedSections(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Staff List for Assignments
    const [staffList, setStaffList] = useState([]);
    useEffect(() => {
        const saved = localStorage.getItem('dept_staff_list_clean');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) setStaffList(parsed);
            } catch (e) {
                console.error("Failed to parse staff list", e);
                setStaffList([]);
            }
        }
    }, []);

    const getAssignedStaff = (project) => {
        if (!staffList || !Array.isArray(staffList)) return [];
        const assigned = staffList.filter(s => s && (s.assigned_projects || []).includes(project.name));
        // Also include coordinator if not already in list
        if (project.project_manager) {
            const coordinator = staffList.find(s => s && s.name === project.project_manager);
            if (coordinator && !assigned.some(s => s.id === coordinator.id)) {
                assigned.unshift(coordinator); // Add coordinator to front
            }
        }
        return assigned;
    };

    // New: Active Filter State
    // Format: {type: 'category' | 'status' | 'health', value: string } | null
    // Format: {type: 'category' | 'status' | 'health', value: string } | null
    const [activeFilter, setActiveFilter] = useState(null);

    // --- Data Fetching ---
    const fetchProjects = async () => {
        try {
            const response = await api.get('/api/projects');
            setProjects(response.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    // --- Executive Logic & Metrics ---

    // Filter Projects
    const preProjects = useMemo(() => projects.filter(p => p.status === 'Not Started'), [projects]);
    const runningProjects = useMemo(() => projects.filter(p => !['Not Started', 'Completed'].includes(p.status)), [projects]);
    const completedProjects = useMemo(() => projects.filter(p => p.status === 'Completed'), [projects]);

    // Helper for Overdue Check
    const checkOverdue = (p) => {
        const corePayments = (p.payments || []).filter(pay => !((pay.category || '').includes('Support') || (pay.category || '').includes('Maintenance')));
        return corePayments.some(pay => pay.status !== 'Paid' && new Date(pay.plan_date) < new Date());
    };

    const metrics = useMemo(() => {
        const activeData = [...preProjects, ...runningProjects, ...completedProjects];

        if (!activeData.length) return {
            total: 0, totalBudget: 0, criticalCount: 0, atRiskCount: 0, onTrackCount: 0, forecastOverrun: 0, delayedCount: 0,
            activeCount: 0, completedCount: 0, preCount: 0
        };

        const total = activeData.length;

        // Calculate Total Budget and Total Paid
        let totalBudget = 0;
        let totalPaid = 0;
        let totalOverdueAmount = 0;
        let overdueCount = 0;

        activeData.forEach(p => {
            // Calculate Total Budget and Total Paid from strictly PROJECT payments (Excluding Support)
            const corePayments = (p.payments || []).filter(pay => !((pay.category || '').includes('Support') || (pay.category || '').includes('Maintenance')));

            if (corePayments.length > 0) {
                totalBudget += corePayments.reduce((pSum, pay) => pSum + (pay.planned_amount || 0), 0);

                totalPaid += corePayments
                    .filter(pay => pay.status === 'Paid')
                    .reduce((pSum, pay) => pSum + (pay.paid_amount || 0), 0);

                // Calculate Overdue
                const projectOverdue = corePayments.filter(pay => pay.status !== 'Paid' && new Date(pay.plan_date) < new Date());
                if (projectOverdue.length > 0) {
                    overdueCount += projectOverdue.length;
                    totalOverdueAmount += projectOverdue.reduce((pSum, pay) => pSum + (pay.planned_amount || 0), 0);
                }
            }
        });

        const criticalProjects = runningProjects.filter(p =>
            Object.values(p.health || {}).some(status => status === 'Critical')
        );
        const atRiskProjects = runningProjects.filter(p =>
            !criticalProjects.includes(p) &&
            Object.values(p.health || {}).some(status => status === 'At Risk')
        );
        const onTrackProjects = runningProjects.filter(p =>
            !criticalProjects.includes(p) && !atRiskProjects.includes(p)
        );

        const delayedProjects = runningProjects.filter(p => p.status === 'Delayed');

        return {
            total,
            totalBudget,
            totalPaid,
            totalOverdueAmount,
            overdueCount,
            criticalCount: criticalProjects.length,
            atRiskCount: atRiskProjects.length,
            onTrackCount: onTrackProjects.length,
            delayedCount: delayedProjects.length,
            activeCount: runningProjects.length,
            completedCount: completedProjects.length,
            preCount: preProjects.length
        };
    }, [projects, preProjects, runningProjects, completedProjects]); // Removed metrics from dependency if it was there by mistake, this is the memo body
    // Safeguard metrics calculation
    const metricsSafe = useMemo(() => {
        try {
            return metrics;
        } catch (e) {
            console.error("Error calculating metrics", e);
            return {
                total: 0, totalBudget: 0, totalPaid: 0, totalOverdueAmount: 0, overdueCount: 0,
                criticalCount: 0, atRiskCount: 0, onTrackCount: 0, delayedCount: 0,
                activeCount: 0, completedCount: 0, preCount: 0
            };
        }
    }, [metrics]);

    // Sorting & Filtering Logic
    const sortedProjects = useMemo(() => {
        // Base List: Default to Running Projects
        let baseList = [...runningProjects];

        // Apply Click Filters
        if (activeFilter) {
            if (activeFilter.type === 'lifecycle') {
                if (activeFilter.value === 'Pre-Project') baseList = [...preProjects];
                if (activeFilter.value === 'Closed') baseList = [...completedProjects];
                if (activeFilter.value === 'Started') baseList = [...runningProjects];
                if (activeFilter.value === 'Total') baseList = [...projects]; // Show ALL
            }
            if (activeFilter.type === 'status') {
                if (activeFilter.value === 'Delayed') baseList = runningProjects.filter(p => p.status === 'Delayed');
                if (activeFilter.value === 'OverduePayments') {
                    baseList = projects.filter(p => checkOverdue(p));
                }
            }
            // Add other filter types here later if needed
        }

        const getScore = (p) => {
            const h = p.health || {};
            const statuses = [h.schedule_status, h.budget_status, h.risk_status, h.scope_status, h.resource_status];
            let score = 0;
            statuses.forEach(s => {
                if (s === 'Critical') score += 10;
                else if (s === 'At Risk') score += 5;
                else if (s === 'Good') score += 1;
            });
            return score;
        };
        return baseList.sort((a, b) => getScore(b) - getScore(a));
    }, [runningProjects, preProjects, completedProjects, projects, activeFilter]);


    // Risk Radar Logic (Top Risks)
    const topRisks = useMemo(() => {
        const allRisks = [];
        runningProjects.forEach(p => {
            (p.matters || []).forEach(m => {
                if (m.status === 'Open' && m.level === 'High') {
                    allRisks.push({ ...m, projectName: p.name });
                }
            });
        });
        return allRisks.slice(0, 5); // Take top 5
    }, [runningProjects]);

    // Aggregate all overdue payments for the detailed list view
    const allOverduePayments = useMemo(() => {
        const overdue = [];
        projects.forEach(p => {
            const corePayments = (p.payments || []).filter(pay => !((pay.category || '').includes('Support') || (pay.category || '').includes('Maintenance')));
            corePayments.forEach(pay => {
                if (pay.status !== 'Paid' && new Date(pay.plan_date) < new Date()) {
                    overdue.push({
                        ...pay,
                        projectName: p.name,
                        projectId: p.id
                    });
                }
            });
        });
        return overdue.sort((a, b) => new Date(a.plan_date) - new Date(b.plan_date));
    }, [projects]);

    // Monthly Lookahead Logic (Grouped by Project)
    const monthlyData = useMemo(() => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // Start and End of Current Month
        const startOfMonth = new Date(currentYear, currentMonth, 1);
        const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

        const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);
        const nextMonth = nextMonthDate.getMonth();
        const nextMonthYear = nextMonthDate.getFullYear();

        const thisMonthGroups = {};
        const nextMonthGroups = {};

        runningProjects.forEach(p => {
            (p.tasks || []).forEach(t => {
                const startDate = t.start_date ? new Date(t.start_date) : new Date();
                const endDate = t.end_date ? new Date(t.end_date) : new Date();

                // Logic: Task overlaps with this month
                const overlapsThisMonth = (startDate <= endOfMonth) && (endDate >= startOfMonth);

                // OR specific operational statuses
                const isActive = t.status === 'In Progress' || t.status === 'Delayed';
                const isCompletedThisMonth = t.status === 'Completed' && (endDate.getMonth() === currentMonth && endDate.getFullYear() === currentYear);

                if (overlapsThisMonth || (isActive && !t.end_date) || isCompletedThisMonth) {
                    if (!thisMonthGroups[p.name]) thisMonthGroups[p.name] = [];
                    thisMonthGroups[p.name].push({
                        ...t,
                        displayDate: t.end_date || new Date(),
                        isOverdue: t.status === 'Delayed'
                    });
                }

                // Next Month Logic: Starts in Next Month
                if (
                    t.status === 'Not Started' &&
                    (startDate.getMonth() === nextMonth && startDate.getFullYear() === nextMonthYear)
                ) {
                    if (!nextMonthGroups[p.name]) nextMonthGroups[p.name] = [];
                    nextMonthGroups[p.name].push({
                        ...t,
                        displayDate: t.start_date
                    });
                }
            });
        });

        // Convert Groups to Array
        const sortedThisMonth = Object.keys(thisMonthGroups).map(project => ({
            project,
            tasks: thisMonthGroups[project].sort((a, b) => new Date(a.displayDate) - new Date(b.displayDate))
        })).sort((a, b) => a.project.localeCompare(b.project));

        const sortedNextMonth = Object.keys(nextMonthGroups).map(project => ({
            project,
            tasks: nextMonthGroups[project].sort((a, b) => new Date(a.displayDate) - new Date(b.displayDate))
        })).sort((a, b) => a.project.localeCompare(b.project));

        return {
            thisMonth: sortedThisMonth,
            nextMonth: sortedNextMonth,
            currentMonthName: today.toLocaleString('default', { month: 'long', year: 'numeric' }),
            nextMonthName: nextMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })
        };
    }, [runningProjects]);

    // Safety wrapper for monthlyData to prevent render crashes
    const monthlyDataSafe = useMemo(() => {
        try {
            return monthlyData;
        } catch (e) {
            console.error("Error calculating monthly data", e);
            return { thisMonth: [], nextMonth: [], currentMonthName: '', nextMonthName: '' };
        }
    }, [monthlyData]);

    // Executive Helpers
    const formatCompactNumber = (num) => {
        return new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(num);
    };

    const formatCompactCurrency = (val) => {
        if (val >= 1000000) return `RM ${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `RM ${(val / 1000).toFixed(0)}k`;
        return `RM ${val}`;
    };

    const formatCurrency = (val) => {
        if (val === undefined || val === null || isNaN(val)) return 'RM 0.00';
        return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 2 }).format(val);
    };

    const formatDate = (d) => {
        if (!d) return 'N/A';
        const date = new Date(d);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    };

    // Auto-Generated Executive Summary
    const executiveSummary = useMemo(() => {
        const issues = metrics.criticalCount + metrics.overdueCount;
        if (issues === 0) return "All strategic initiatives are progressing on schedule. Portfolio health is optimal with no material risks identified.";
        if (issues <= 2) return "Portfolio generally healthy. Minor variances detected in 1-2 workstreams; mitigation plans are in effect.";
        return "Attention Required: Multiple streams reporting deviation. Immediate remediation recommended for critical path items.";
    }, [metrics]);

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-10"><p className="text-slate-500">Loading Executive Dashboard...</p></div>;

    const projectActions = (
        <button onClick={() => setIsModalOpen(true)} className="text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-200 px-5 py-2.5 rounded-xl transition-all hover:-translate-y-0.5">+ New Project</button>
    );

    return (
        <DashboardLayout headerActions={projectActions}>
            {/* Main Project Content */}
            <div className="space-y-6 animate-in fade-in duration-500 min-h-screen pb-20">

                {/* 1. PORTFOLIO TOP SNAPSHOT */}
                <section>
                    <div className="flex items-end mb-4 justify-between">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            Portfolio Health Snapshot
                        </h2>
                        {activeFilter && (
                            <button
                                onClick={() => setActiveFilter(null)}
                                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full transition-colors"
                            >
                                <RefreshCw size={12} /> Reset Filter
                            </button>
                        )}
                    </div>
                    {/* Changed xl:grid-cols-8 to xl:grid-cols-4 to force 2 rows on large screens */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                        {/* ROW 1: Project Counts by Lifecycle */}
                        <KPICard
                            title="Total Projects"
                            value={metrics.total}
                            icon={Briefcase}
                            color="bg-gradient-to-br from-blue-500 to-blue-600"
                            isActive={activeFilter?.type === 'lifecycle' && activeFilter?.value === 'Total'}
                            onClick={() => setActiveFilter({ type: 'lifecycle', value: 'Total' })}
                        />
                        <KPICard
                            title="Pre-Project"
                            value={metrics.preCount}
                            icon={FileText}
                            color="bg-gradient-to-br from-slate-500 to-slate-600"
                            isActive={activeFilter?.type === 'lifecycle' && activeFilter?.value === 'Pre-Project'}
                            onClick={() => setActiveFilter({ type: 'lifecycle', value: 'Pre-Project' })}
                        />
                        <KPICard
                            title="Started"
                            value={metrics.activeCount}
                            icon={LayoutGrid}
                            color="bg-gradient-to-br from-emerald-500 to-emerald-600"
                            isActive={activeFilter?.type === 'lifecycle' && activeFilter?.value === 'Started'}
                            onClick={() => setActiveFilter({ type: 'lifecycle', value: 'Started' })}
                        />
                        <KPICard
                            title="Closed"
                            value={metrics.completedCount}
                            icon={CheckCircle}
                            color="bg-gradient-to-br from-slate-400 to-slate-500"
                            isActive={activeFilter?.type === 'lifecycle' && activeFilter?.value === 'Closed'}
                            onClick={() => setActiveFilter({ type: 'lifecycle', value: 'Closed' })}
                        />

                        {/* ROW 2: Financials & Health Risks */}
                        <KPICard
                            title="Total Budget"
                            value={formatCompactCurrency(metrics.totalBudget)}
                            icon={DollarSign}
                            color="bg-gradient-to-br from-slate-800 to-slate-900"
                            progress={100}
                        />
                        <KPICard
                            title="Total Paid"
                            value={formatCompactCurrency(metrics.totalPaid)}
                            icon={CheckCircle}
                            color="bg-gradient-to-br from-slate-600 to-slate-700"
                            progress={(metrics.totalPaid / metrics.totalBudget) * 100}
                            subtext={`${((metrics.totalPaid / metrics.totalBudget) * 100).toFixed(0)}% Utilisation`}
                        />
                        <KPICard
                            title="Overdue Payments"
                            value={metrics.overdueCount > 0 ? `${metrics.overdueCount} Items` : "None"}
                            subtext={metrics.overdueCount > 0 ? `${formatCompactCurrency(metrics.totalOverdueAmount)} exposure` : "On Schedule"}
                            icon={AlertCircle}
                            color={metrics.overdueCount > 0 ? "bg-gradient-to-br from-red-500 to-rose-600 animate-pulse" : "bg-slate-400"}
                            isAlert={metrics.overdueCount > 0}
                            isActive={activeFilter?.type === 'status' && activeFilter?.value === 'OverduePayments'}
                            onClick={() => setActiveFilter({ type: 'status', value: 'OverduePayments' })}
                        />
                    </div>
                </section>

                {/* OVERDUE EXPLODED VIEW (Keep as conditional overlay) */}
                {activeFilter?.type === 'status' && activeFilter?.value === 'OverduePayments' && (
                    <section className="animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="bg-red-50 rounded-xl shadow-sm border border-red-100 overflow-hidden mb-6">
                            <div className="px-6 py-4 border-b border-red-100 flex justify-between items-center">
                                <h3 className="font-bold text-red-800 flex items-center gap-2">
                                    <AlertCircle size={18} /> Overdue Payments Ledger
                                </h3>
                                <button onClick={() => setActiveFilter(null)} className="text-xs font-bold text-red-600 hover:text-red-800 hover:bg-red-100 px-2 py-1 rounded transition-colors">
                                    Close View
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-red-500 uppercase bg-red-50/50 border-b border-red-100">
                                        <tr>
                                            <th className="px-6 py-3 font-bold">Project</th>
                                            <th className="px-6 py-3 font-bold">Deliverable</th>
                                            <th className="px-6 py-3 font-bold">Due Date</th>
                                            <th className="px-6 py-3 font-bold text-right">Amount</th>
                                            <th className="px-6 py-3 font-bold text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-red-100 bg-white">
                                        {allOverduePayments.map((pay, i) => (
                                            <tr key={i} className="hover:bg-red-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-800">
                                                    <Link to={`/projects/${pay.projectId}`} className="hover:text-blue-600 hover:underline">
                                                        {pay.projectName}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">{pay.deliverable}</td>
                                                <td className="px-6 py-4 font-mono text-red-600 font-bold">{formatDate(pay.plan_date)}</td>
                                                <td className="px-6 py-4 font-mono text-right font-bold text-slate-700">{formatCurrency(pay.planned_amount)}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-red-100 text-red-700 border border-red-200">
                                                        Overdue
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                )}

                {/* 2. MAIN BODY - TWO COLUMN STRUCTURE */}
                <div className="grid grid-cols-12 gap-6 items-start">
                    {/* LEFT COLUMN (75% Width) */}
                    <div className="col-span-12 xl:col-span-9 flex flex-col gap-6">
                        {/* Project Health Matrix */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Activity size={18} className="text-indigo-600" /> Project Health Matrix
                                </h3>
                                <div className="flex gap-2 text-xs font-medium text-slate-500">
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Healthy</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span>At Risk</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span>Critical</span>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-400 uppercase bg-white border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold w-1/3">Project Name</th>
                                            <th className="px-2 py-4 text-center font-semibold">Team</th>
                                            <th className="px-2 py-4 text-center font-semibold">Schedule</th>
                                            <th className="px-2 py-4 text-center font-semibold">Payment</th>
                                            <th className="px-2 py-4 text-center font-semibold">Overall</th>
                                            <th className="px-6 py-4 text-right font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {sortedProjects.slice(0, 8).map((p) => (
                                            <tr key={p.id} className="hover:bg-slate-50 group transition-colors">
                                                <td className="px-6 py-5 font-medium text-slate-800">
                                                    <Link to={`/projects/${p.id}`} className="hover:text-blue-600 hover:underline decoration-blue-300 underline-offset-4">
                                                        {p.name}
                                                    </Link>
                                                    <div className="text-xs text-slate-400 mt-1 truncate max-w-[300px]">{p.description}</div>
                                                </td>
                                                <td className="px-2 py-5">
                                                    <div className="flex -space-x-2 overflow-hidden justify-center pl-1">
                                                        {getAssignedStaff(p).length > 0 ? getAssignedStaff(p).slice(0, 3).map((staff, i) => (
                                                            <div key={i} className="relative group/avatar cursor-pointer" title={`${staff.name} (${staff.role})`}>
                                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white ring-1 ring-slate-100 ${p.project_manager === (staff.name || '') ? 'bg-purple-600' : 'bg-indigo-500'
                                                                    }`}>
                                                                    {(staff.name || '?').charAt(0)}
                                                                </div>
                                                            </div>
                                                        )) : (
                                                            <span className="text-slate-300">-</span>
                                                        )}
                                                        {getAssignedStaff(p).length > 3 && (
                                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500 border-2 border-white">
                                                                +{getAssignedStaff(p).length - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-2 py-5"><HealthBadge status={p.health?.schedule_status} /></td>
                                                <td className="px-2 py-5"><HealthBadge status={checkOverdue(p) ? 'Critical' : (p.health?.budget_status || 'Good')} /></td>
                                                <td className="px-2 py-5">
                                                    <div className="flex justify-center">
                                                        {Object.values(p.health || {}).includes('Critical') ?
                                                            <span className="w-3 h-3 rounded-full bg-rose-600 ring-4 ring-rose-100 animate-pulse"></span> :
                                                            Object.values(p.health || {}).includes('At Risk') ?
                                                                <span className="w-3 h-3 rounded-full bg-amber-500"></span> :
                                                                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                                                        }
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                                        {p.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN (25% Width - Fixed Sidebar) */}
                    <div className="col-span-12 xl:col-span-3">
                        {/* Monthly Task Lookahead */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Clock size={16} className="text-blue-600" /> Monthly Task Lookahead
                            </h3>

                            {/* This Month */}
                            <div className="mb-4">
                                <div className="bg-blue-900 text-white px-3 py-2 rounded-t-lg text-xs font-bold flex justify-between items-center">
                                    <span>{monthlyDataSafe.currentMonthName}</span>
                                    <span className="opacity-80">Current</span>
                                </div>
                                <div className="border border-slate-200 border-t-0 rounded-b-lg overflow-hidden bg-white max-h-[300px] overflow-y-auto">
                                    {monthlyDataSafe.thisMonth.length > 0 ? monthlyDataSafe.thisMonth.map((group, idx) => (
                                        <div key={idx} className="border-b border-slate-100 last:border-0 p-2">
                                            <div className="text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> {group.project}
                                            </div>
                                            {group.tasks.slice(0, 3).map((t, i) => (
                                                <div key={i} className="pl-3 py-1 text-xs border-l-2 border-indigo-100 hover:border-indigo-500">
                                                    <div className="font-medium text-slate-700 truncate">{t.task_name}</div>
                                                    <div className="text-[10px] text-slate-400">{formatDate(t.displayDate)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )) : (
                                        <div className="p-4 text-center text-xs text-slate-400">No active tasks.</div>
                                    )}
                                </div>
                            </div>

                            {/* Next Month */}
                            <div>
                                <div className="bg-slate-800 text-white px-3 py-2 rounded-t-lg text-xs font-bold flex justify-between items-center">
                                    <span>{monthlyDataSafe.nextMonthName}</span>
                                    <span className="opacity-80">Upcoming</span>
                                </div>
                                <div className="border border-slate-200 border-t-0 rounded-b-lg overflow-hidden bg-white max-h-[200px] overflow-y-auto">
                                    {monthlyDataSafe.nextMonth.length > 0 ? monthlyDataSafe.nextMonth.map((group, idx) => (
                                        <div key={idx} className="border-b border-slate-100 last:border-0 p-2">
                                            <div className="text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div> {group.project}
                                            </div>
                                            {group.tasks.slice(0, 2).map((t, i) => (
                                                <div key={i} className="pl-3 py-1 text-xs border-l-2 border-slate-100 hover:border-slate-500">
                                                    <div className="font-medium text-slate-600 truncate">{t.task_name}</div>
                                                    <div className="text-[10px] text-slate-400">{formatDate(t.displayDate)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )) : (
                                        <div className="p-4 text-center text-xs text-slate-400">No tasks scheduled.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. BOTTOM ROW - PRE-PROJECT & COMPLETED ARCHIVE (Side-by-side) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    {/* Pre-Project Pipeline */}
                    {preProjects.length > 0 && (
                        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
                            <div className="px-6 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                                <Clock size={16} className="text-slate-400" />
                                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    Pre-Project Pipeline (Upcoming)
                                </h2>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {preProjects.map(p => (
                                    <div key={p.id} className="grid grid-cols-12 gap-4 items-center px-6 py-3 hover:bg-slate-50 transition-colors group cursor-pointer">
                                        <div className="col-span-4">
                                            <Link to={`/projects/${p.id}`} className="font-bold text-slate-700 text-sm hover:text-indigo-600 block truncate" title={p.name}>
                                                {p.name}
                                            </Link>
                                        </div>
                                        <div className="col-span-2">
                                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${p.status === 'Not Started' ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                {p.status}
                                            </span>
                                        </div>
                                        {/* Team Avatars Column */}
                                        <div className="col-span-3">
                                            <div className="flex -space-x-1.5 overflow-hidden">
                                                {getAssignedStaff(p).length > 0 ? getAssignedStaff(p).slice(0, 3).map((staff, i) => (
                                                    <div key={i} className="relative group/avatar cursor-pointer" title={`${staff.name} (${staff.role})`}>
                                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2 border-white ring-1 ring-slate-100 ${p.project_manager === (staff.name || '') ? 'bg-purple-600' : 'bg-indigo-500'
                                                            }`}>
                                                            {(staff.name || '?').charAt(0)}
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <span className="text-slate-300 text-[10px] italic">Not assigned</span>
                                                )}
                                                {getAssignedStaff(p).length > 3 && (
                                                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500 border-2 border-white">
                                                        +{getAssignedStaff(p).length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-span-3 text-right font-mono font-bold text-slate-700 text-xs truncate">
                                            Est. {formatCompactCurrency(p.planned_cost)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* PROJECT ARCHIVE (Completed Projects) */}
                    {completedProjects.length > 0 && (
                        <section className="h-full flex flex-col">
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden opacity-80 hover:opacity-100 transition-opacity flex-grow">
                                <div className="px-6 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                                    <CheckCircle size={16} className="text-emerald-500" />
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                        Completed Projects Archive
                                    </h3>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {completedProjects.slice(0, 5).map((p) => (
                                        <div key={p.id} className="grid grid-cols-12 gap-4 items-center px-6 py-3 hover:bg-slate-50 transition-colors group cursor-pointer">
                                            <div className="col-span-6">
                                                <Link to={`/projects/${p.id}`} className="font-bold text-slate-700 text-sm hover:text-blue-600 block truncate">
                                                    {p.name}
                                                </Link>
                                            </div>
                                            <div className="col-span-6 text-right font-mono font-bold text-slate-600 text-xs">
                                                {formatCompactCurrency(p.actual_cost || p.planned_cost)}
                                            </div>
                                        </div>
                                    ))}
                                    {completedProjects.length > 5 && (
                                        <div className="px-6 py-2 text-[10px] text-center text-slate-400 bg-slate-50/50">
                                            + {completedProjects.length - 5} more projects in archive
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </div >

            <NewProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchProjects}
            />
        </DashboardLayout >
    );
};

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-10 bg-red-50 text-red-900 min-h-screen">
                    <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
                    <details className="whitespace-pre-wrap font-mono text-sm bg-white p-4 rounded border border-red-200">
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

const DashboardWithBoundary = () => (
    <ErrorBoundary>
        <Dashboard />
    </ErrorBoundary>
);

export default DashboardWithBoundary;
