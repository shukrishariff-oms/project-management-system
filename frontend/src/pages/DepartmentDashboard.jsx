import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Activity, TrendingUp, ShieldAlert, CheckCircle, AlertTriangle, Layers,
    PieChart, DollarSign, Users, Target, FileText, ChevronRight, Briefcase,
    AlertOctagon, ArrowUpRight, Minus, Zap, Pencil, Save, X
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import FinancialModal from '../components/FinancialModal';
import api from '../api';

const DepartmentDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFinancialModalOpen, setIsFinancialModalOpen] = useState(false);
    const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);

    // Staff List State (Lifted from Modal)
    const [staffList, setStaffList] = useState(() => {
        const saved = localStorage.getItem('dept_staff_list_clean');
        if (saved) return JSON.parse(saved);
        return [];
    });

    // Save Staff to Local Storage
    useEffect(() => {
        localStorage.setItem('dept_staff_list_clean', JSON.stringify(staffList));
    }, [staffList]);

    // Department Identity State
    const [deptProfile, setDeptProfile] = useState(() => {
        const saved = localStorage.getItem('dept_identity_profile_clean');
        if (saved) return JSON.parse(saved);
        return {
            name: "Department Name",
            hod: "Head of Department",
            mandate: "Department mandate and mission statement goes here.",
        };
    });
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [tempProfile, setTempProfile] = useState(deptProfile);

    // Save Profile to Local Storage
    useEffect(() => {
        localStorage.setItem('dept_identity_profile_clean', JSON.stringify(deptProfile));
    }, [deptProfile]);

    // Reset view if navigation state requests it
    useEffect(() => {
        if (location.state?.reset) {
            setIsEditingProfile(false);
            setTempProfile(deptProfile); // Reset temp changes
        }
    }, [location.state]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await api.get('/api/projects');
                setProjects(response.data);
            } catch (error) {
                console.error("Failed to fetch projects", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    const handleSaveProfile = () => {
        setDeptProfile(tempProfile);
        setIsEditingProfile(false);
    };

    const handleCancelEdit = () => {
        setTempProfile(deptProfile);
        setIsEditingProfile(false);
    };

    // Executive Metrics Engine
    const executiveData = useMemo(() => {
        const activeProjects = projects.filter(p => !['Not Started', 'Completed'].includes(p.status));
        const criticalCount = activeProjects.filter(p => Object.values(p.health || {}).includes('Critical')).length;
        const delayedCount = activeProjects.filter(p => p.status === 'Delayed').length;

        // CAPEX Financials
        let totalBudget = 0;
        let totalPaid = 0;
        activeProjects.forEach(p => {
            const corePayments = (p.payments || []).filter(pay => !((pay.category || '').includes('Support')));
            totalBudget += corePayments.reduce((s, pay) => s + (pay.planned_amount || 0), 0);
            totalPaid += corePayments.filter(pay => pay.status === 'Paid').reduce((s, pay) => s + (pay.paid_amount || 0), 0);
        });

        const utilization = totalBudget > 0 ? (totalPaid / totalBudget) * 100 : 0;

        // OPEX Financials (From FinancialPage localStorage)
        const opexLedger = JSON.parse(localStorage.getItem('opex_ledger_data') || '[]');
        let totalOpexForecast = 0;
        let totalOpexActual = 0;

        opexLedger.forEach(item => {
            totalOpexForecast += Number(item.approve || 0);
            const txKey = `opex_tx_${item.code}`;
            const transactions = JSON.parse(localStorage.getItem(txKey) || '[]');
            const itemActual = transactions.reduce((sum, tx) => {
                return tx.type === 'Debit' ? sum + Number(tx.amount || 0) : sum - Number(tx.amount || 0);
            }, 0);
            totalOpexActual += itemActual;
        });

        const opexVariance = totalOpexForecast > 0 ? ((totalOpexActual - totalOpexForecast) / totalOpexForecast) * 100 : 0;
        const opexStatus = opexVariance > 5 ? 'Overspend' : opexVariance > 0 ? 'Watching' : 'Stable';

        // Signals Logic
        return {
            serviceLoad: activeProjects.length > 8 ? 'High' : activeProjects.length > 4 ? 'Moderate' : 'Low',
            capacityStatus: activeProjects.length > 10 || criticalCount > 3 ? 'High Load' : 'Balanced',
            financeControl: utilization > 90 ? 'Critical' : utilization > 75 ? 'Watch' : 'Controlled',
            governanceReadiness: criticalCount > 0 ? 'Needs Action' : 'Ready',
            resourceStatus: activeProjects.length > 5 ? 'Strained' : 'Optimal',

            // Raw for Attention Panel
            criticalCount,
            delayedCount,
            utilization,
            activeCount: activeProjects.length,

            // OPEX Results
            opexVariance,
            opexStatus,
            hasOpexData: opexLedger.length > 0
        };
    }, [projects]);

    const StatusChip = ({ status }) => {
        let color = 'bg-slate-100 text-slate-500 border-slate-200';
        const s = status.toLowerCase();

        if (['ready', 'controlled', 'balanced', 'low', 'optimal', 'good'].includes(s))
            color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (['moderate', 'watch', 'high load'].includes(s))
            color = 'bg-amber-50 text-amber-700 border-amber-200';
        if (['critical', 'high', 'needs action', 'at risk'].includes(s))
            color = 'bg-rose-50 text-rose-700 border-rose-200';

        return (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${color}`}>
                {status}
            </span>
        );
    };

    const SignalCard = ({ title, status, icon: Icon, onClick, className }) => (
        <div
            onClick={onClick}
            className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-32 hover:border-slate-300 transition-colors ${onClick ? 'cursor-pointer hover:shadow-md' : ''} ${className}`}
        >
            <div className="flex justify-between items-start">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</div>
                <StatusChip status={status} />
            </div>
            <div className="flex items-end gap-3 opacity-80">
                <Icon size={24} className="text-slate-700" />
            </div>
        </div>
    );

    const formatCurrency = (val) => {
        if (val === undefined || val === null) return '-';
        return new Intl.NumberFormat('en-MY', {
            style: 'currency',
            currency: 'MYR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val).replace('MYR', 'RM');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Initializing Executive View...</div>;

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-in fade-in duration-500 pb-20 p-6 min-h-screen bg-slate-50/50">

                {/* A) DEPARTMENT IDENTITY CARD */}
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col md:flex-row justify-between items-center relative overflow-hidden group">
                    <div className="relative z-10 w-full max-w-4xl">
                        {!isEditingProfile ? (
                            <>
                                <div className="flex items-center gap-3 mb-2">
                                    <Briefcase size={22} className="text-indigo-600" />
                                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{deptProfile.name}</h2>
                                    <button
                                        onClick={() => { setTempProfile(deptProfile); setIsEditingProfile(true); }}
                                        className="text-slate-300 hover:text-indigo-600 transition-colors ml-2"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                                    <span className="flex items-center gap-2 font-medium"><Users size={16} className="text-slate-400" /> HOD: <b className="text-slate-700">{deptProfile.hod}</b></span>
                                </div>
                                <div className="relative pl-4 border-l-4 border-indigo-500 py-1">
                                    <p className="text-lg italic text-slate-600 font-light leading-relaxed">
                                        "{deptProfile.mandate}"
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200 animate-in fade-in max-w-2xl">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Department Name</label>
                                    <input
                                        className="w-full text-lg font-bold text-slate-900 border-b border-slate-300 bg-transparent focus:outline-none focus:border-indigo-500 py-1"
                                        value={tempProfile.name}
                                        onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Head of Department</label>
                                    <input
                                        className="w-full text-sm font-bold text-slate-900 border-b border-slate-300 bg-transparent focus:outline-none focus:border-indigo-500 py-1"
                                        value={tempProfile.hod}
                                        onChange={(e) => setTempProfile({ ...tempProfile, hod: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Mandate / Mission</label>
                                    <textarea
                                        className="w-full text-sm italic font-medium text-slate-900 border border-slate-300 rounded p-3 focus:outline-none focus:border-indigo-500 bg-white"
                                        value={tempProfile.mandate}
                                        onChange={(e) => setTempProfile({ ...tempProfile, mandate: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                                <div className="flex gap-3 justify-end pt-2">
                                    <button onClick={handleCancelEdit} className="text-xs font-bold text-slate-500 hover:text-slate-700 px-4 py-2">Cancel</button>
                                    <button onClick={handleSaveProfile} className="bg-indigo-600 text-white text-xs font-bold px-5 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-sm">
                                        <Save size={14} /> Save Changes
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Background Detail */}
                    <div className="hidden md:block">
                        <Briefcase size={240} className="text-slate-100/50 -rotate-12 transform hover:scale-105 transition-transform duration-700" />
                    </div>
                </div>

                {/* RESOURCE BAR */}
                <div className="bg-[#1e1e2e] rounded-2xl border border-indigo-900/30 p-0 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
                    <div className="flex flex-col md:flex-row relative">
                        {/* Left Title Panel */}
                        <div className="md:w-1/4 p-6 bg-[#252538] relative overflow-hidden flex flex-col justify-center border-b md:border-b-0 md:border-r border-indigo-500/10">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Users size={100} />
                            </div>
                            <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1 opacity-70">Resource & Capacity</div>
                            <div className="flex items-center gap-3 relative z-10">
                                <h3 className="text-2xl font-bold text-white tracking-tight">Talent Pool</h3>
                                <span className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/20`}>
                                    Optimal
                                </span>
                            </div>
                        </div>

                        {/* Middle Metrics */}
                        <div className="flex-1 p-6 flex flex-col md:flex-row items-center justify-center gap-12 bg-gradient-to-r from-[#1e1e2e] to-[#252538]">
                            <div className="w-full max-w-xs">
                                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-2">
                                    <span>Team Utilization</span>
                                    <span className="text-slate-100 bg-slate-700 px-1.5 rounded">Optimal Range</span>
                                </div>
                                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 w-[85%] shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                </div>
                                <div className="text-right text-[10px] font-bold text-indigo-400 mt-1">85% Loaded</div>
                            </div>

                            <div className="flex items-center gap-4 border-l border-slate-700/50 pl-8">
                                <div className="p-3 bg-slate-700/30 rounded-full">
                                    <Users size={20} className="text-white" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase">Headcount</div>
                                    <div className="text-lg font-bold text-white tracking-tight">{staffList.length} Active Members</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Action */}
                        <div className="p-6 flex items-center justify-center bg-[#252538] border-t md:border-t-0 md:border-l border-indigo-500/10">
                            <button
                                onClick={() => navigate('/dashboard/resources')}
                                className="bg-white text-[#1e1e2e] hover:bg-indigo-50 px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-lg hover:shadow-indigo-500/20 flex items-center gap-2 group/btn"
                            >
                                MANAGE RESOURCES <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* FINANCIAL BAR */}
                <div className="bg-[#0f172a] rounded-2xl border border-emerald-900/30 p-0 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
                    <div className="flex flex-col md:flex-row relative">
                        {/* Left Title Panel */}
                        <div className="md:w-1/4 p-6 bg-[#162036] relative overflow-hidden flex flex-col justify-center border-b md:border-b-0 md:border-r border-emerald-500/10">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <DollarSign size={100} />
                            </div>
                            <div className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest mb-1 opacity-70">Financial Control</div>
                            <div className="flex items-center gap-3 relative z-10">
                                <h3 className="text-2xl font-bold text-white tracking-tight">Consolidated Outlook</h3>
                                <StatusChip status={executiveData.financeControl} />
                            </div>
                        </div>

                        {/* Middle Metrics */}
                        <div className="flex-1 p-6 flex flex-col md:flex-row items-center justify-center gap-12 bg-gradient-to-r from-[#0f172a] to-[#162036]">
                            <div className="w-full max-w-xs">
                                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-2">
                                    <span>CAPEX (Projects)</span>
                                    <span className="text-slate-100 bg-slate-700 px-1.5 rounded">Within Allocation</span>
                                </div>
                                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r shadow-lg transition-all duration-1000`}
                                        style={{
                                            width: `${Math.min(executiveData.utilization, 100)}%`,
                                            backgroundImage: executiveData.utilization > 90
                                                ? 'linear-gradient(to right, #ef4444, #f87171)'
                                                : executiveData.utilization > 75
                                                    ? 'linear-gradient(to right, #f59e0b, #fbbf24)'
                                                    : 'linear-gradient(to right, #6366f1, #a855f7)'
                                        }}
                                    ></div>
                                </div>
                                <div className="text-right text-[10px] font-bold text-slate-400 mt-1">{executiveData.utilization.toFixed(1)}% Utilized</div>
                            </div>

                            <div className="flex items-center gap-4 border-l border-slate-700/50 pl-8">
                                <div className="p-3 bg-slate-700/30 rounded-full">
                                    <TrendingUp size={20} className="text-emerald-400" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase">
                                        OPEX (Admin) <span className={`text-white px-1 rounded ml-1 ${executiveData.opexStatus === 'Overspend' ? 'bg-rose-500' :
                                            executiveData.opexStatus === 'Watching' ? 'bg-amber-500' : 'bg-slate-700'
                                            }`}>{executiveData.opexStatus}</span>
                                    </div>
                                    <div className={`text-lg font-bold tracking-tight flex items-center gap-1 ${executiveData.opexVariance > 5 ? 'text-rose-400' :
                                        executiveData.opexVariance > 0 ? 'text-amber-400' : 'text-emerald-400'
                                        }`}>
                                        Tracking {executiveData.opexVariance > 0 ? '+' : ''}{executiveData.opexVariance.toFixed(1)}% vs Forecast
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Action */}
                        <div className="p-6 flex items-center justify-center bg-[#162036] border-t md:border-t-0 md:border-l border-emerald-500/10">
                            <button
                                onClick={() => navigate('/dashboard/financials')}
                                className="bg-white text-[#0f172a] hover:bg-emerald-50 px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center gap-2 group/btn"
                            >
                                VIEW FINANCIAL DETAILS <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                <FinancialModal isOpen={isFinancialModalOpen} onClose={() => setIsFinancialModalOpen(false)} formatCurrency={formatCurrency} />
            </div>
        </DashboardLayout>
    );
};

export default DepartmentDashboard;
