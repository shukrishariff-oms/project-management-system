import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import {
    Clock, CheckCircle, AlertCircle, Calendar, ArrowRight,
    Briefcase, LayoutGrid, List, MessageSquare
} from 'lucide-react';
import api from '../api';

const MyWorkPage = () => {
    const navigate = useNavigate();
    const [myProjects, setMyProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // Authenticated user from localStorage
    const currentUser = {
        name: localStorage.getItem('user_name') || "User",
        email: localStorage.getItem('user_email') || "user@example.com",
        id: "2916" // Keep mock ID for now
    };

    const fetchMyWork = async () => {
        try {
            const response = await api.get(`/api/my-projects?email=${currentUser.email}`);
            setMyProjects(response.data);
        } catch (error) {
            console.error("Failed to load my work", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyWork();

        // Auto-refresh: Poll every 5 seconds
        const interval = setInterval(fetchMyWork, 5000);

        // Refresh when window gets focus
        const handleFocus = () => fetchMyWork();
        window.addEventListener('focus', handleFocus);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', handleFocus);
        };
    }, [currentUser.email]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    // Calculate Dynamic Stats
    const stats = React.useMemo(() => {
        if (!myProjects || myProjects.length === 0) return { avgProgress: 0, done: 0, pending: 0 };
        const total = myProjects.reduce((sum, p) => sum + (p.progress_percentage || 0), 0);
        const avg = Math.round(total / myProjects.length);

        // Mock task counts for now unless we have a task relationship
        // But let's make them look logical based on projects
        return {
            avgProgress: avg,
            done: myProjects.length * 4, // Dynamic mock
            pending: myProjects.length * 2 // Dynamic mock
        };
    }, [myProjects]);

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">

                {/* 1. Greeting & Pulse Section - Infographic Style */}
                <div className="flex flex-col lg:flex-row gap-6 p-8 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 rounded-[2rem] text-white shadow-2xl shadow-indigo-200/50 relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

                    <div className="flex-1 relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-indigo-200 mb-4 backdrop-blur-md border border-white/5">
                            <Briefcase size={12} /> Personnel Portal
                        </div>
                        <h1 className="text-4xl font-extrabold mb-3 tracking-tight">
                            {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">{currentUser.name.split(' ')[0]}</span>
                        </h1>
                        <p className="text-indigo-100/70 text-lg max-w-lg leading-relaxed">
                            You currently oversee <span className="text-white font-bold border-b border-indigo-400/50">{myProjects.length} strategic projects</span>. Here is your operational pulse for today.
                        </p>
                    </div>

                    <div className="flex gap-4 relative z-10">
                        {/* Infographic Stats Widget */}
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex items-center gap-6 shadow-inner">
                            <div className="relative w-24 h-24">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="48" cy="48" r="40" className="fill-none stroke-white/10" strokeWidth="8" />
                                    <circle cx="48" cy="48" r="40" className="fill-none stroke-blue-400" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * (stats.avgProgress / 100))} strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-black leading-none">{stats.avgProgress}%</span>
                                    <span className="text-[8px] uppercase font-bold text-indigo-200">Total</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                                        <CheckCircle size={20} />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold leading-none">{stats.done}</div>
                                        <div className="text-[10px] uppercase font-bold text-slate-400">Tasks Done</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold leading-none">{stats.pending}</div>
                                        <div className="text-[10px] uppercase font-bold text-slate-400">Pending</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. My Projects - Modern Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
                                Active Engagements
                            </h2>
                            <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full">
                                View Portfolio <ArrowRight size={16} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {loading ? (
                                Array(2).fill(0).map((_, i) => (
                                    <div key={i} className="h-64 bg-slate-100 rounded-[2rem] animate-pulse"></div>
                                ))
                            ) : myProjects.length === 0 ? (
                                <div className="col-span-2 bg-slate-50/50 rounded-[2rem] p-12 text-center border-2 border-dashed border-slate-200">
                                    <Briefcase size={48} className="mx-auto text-slate-300 mb-4" />
                                    <p className="text-slate-500 font-medium">No active project assignments found.</p>
                                </div>
                            ) : (
                                myProjects.map(project => (
                                    <div key={project.id}
                                        className="group bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer relative overflow-hidden"
                                        onClick={() => navigate(`/projects/${project.id}`)}>

                                        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-200">
                                                <ArrowRight size={20} />
                                            </div>
                                        </div>

                                        <div className="flex flex-col h-full">
                                            <div className="mb-6">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${project.status === 'Running' ? 'bg-emerald-100 text-emerald-700' :
                                                        project.status === 'Delayed' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-slate-100 text-slate-600'
                                                        }`}>
                                                        {project.status}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-300">#{project.project_code}</span>
                                                </div>
                                                <h3 className="text-2xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">
                                                    {project.name}
                                                </h3>
                                            </div>

                                            <div className="mt-auto space-y-6">
                                                {/* Infographic Progress */}
                                                <div>
                                                    <div className="flex justify-between items-end mb-2">
                                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Milestone Progress</span>
                                                        <span className="text-xl font-black text-indigo-600 italic">{project.progress_percentage}%</span>
                                                    </div>
                                                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all duration-1000"
                                                            style={{ width: `${project.progress_percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <Calendar size={16} className="text-indigo-400" />
                                                        <span className="text-xs font-bold">
                                                            {new Date(project.end_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* 3. Action Items - Sidebar Style */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                            <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                            Priority Tasks
                        </h2>

                        <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-200/50 space-y-4">
                            {[
                                { id: 1, title: 'Upload Stage 1 Report', due: 'Today', priority: 'High', project: 'CMS Implementation', color: 'red' },
                                { id: 2, title: 'Verify budget variance', due: 'Tomorrow', priority: 'Med', project: 'HR Portal Upgrade', color: 'amber' },
                                { id: 3, title: 'Update timesheets', due: 'Fri, 17 Jan', priority: 'Low', project: 'Internal', color: 'emerald' }
                            ].map(task => (
                                <div key={task.id} className="bg-white p-5 rounded-2xl border border-white shadow-sm hover:shadow-xl transition-all duration-300 flex items-start gap-4">
                                    <div className={`mt-1.5 w-3 h-3 rounded-full shrink-0 ring-4 ring-${task.color}-50 bg-${task.color}-500 shadow-[0_0_10px_rgba(var(--${task.color}-500),0.4)]`}></div>
                                    <div className="flex-1">
                                        <div className="text-sm font-black text-slate-800 mb-1">{task.title}</div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                            <span className="px-1.5 py-0.5 bg-slate-100 rounded uppercase">{task.project}</span>
                                            <span>•</span>
                                            <span className="text-indigo-500">Due {task.due}</span>
                                        </div>
                                    </div>
                                    <button className="text-slate-300 hover:text-indigo-600 transition-colors">
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Infographic Tips Card */}
                        <div className="bg-indigo-600 rounded-[2rem] p-8 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                            <h4 className="text-lg font-black mb-2 relative z-10">Productivity Tip</h4>
                            <p className="text-indigo-100 text-xs leading-relaxed opacity-90 relative z-10">
                                Update your progress daily to keep the management informed and reduce meeting overhead.
                            </p>
                            <div className="mt-6 flex justify-end relative z-10">
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                                    <Briefcase size={20} className="text-indigo-200" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default MyWorkPage;
