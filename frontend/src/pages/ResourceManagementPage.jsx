import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import {
    Activity, TrendingUp, ShieldAlert, CheckCircle, AlertTriangle, Layers,
    PieChart, DollarSign, Users, Target, FileText, ChevronRight, Briefcase,
    AlertOctagon, ArrowUpRight, Search, Plus, Filter, UserPlus, X, Zap, Move, Edit2, Award, Mail, Phone, MapPin, Calendar, Clock, ArrowRight, Trash2, Check
} from 'lucide-react';
import ResourceManagementModal from '../components/ResourceManagementModal';
import api from '../api';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

// DnD Kit Imports
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Sortable Item Component ---
const SortableStaffCard = ({ staff, isSelected, onClick, children }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: staff.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            {/* Drag Handle - Only visible on hover */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-2 right-2 p-1.5 bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-20"
                title="Drag to move"
            >
                <Move size={14} />
            </div>
            <div onClick={onClick}>
                {children}
            </div>
        </div>
    );
};

const ResourceManagementPage = () => {
    const location = useLocation();
    // --- State ---
    const initialData = { name: '', role: '', grade: '', email: '', mobile: '', staffNo: '', ext: '', assigned_projects: [] };
    const [staffList, setStaffList] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true); // Keep loading for projects

    // --- Persist Staff List ---
    useEffect(() => {
        const saved = localStorage.getItem('dept_staff_list_clean');
        if (saved) setStaffList(JSON.parse(saved));
    }, []);

    useEffect(() => {
        if (staffList.length > 0) {
            localStorage.setItem('dept_staff_list_clean', JSON.stringify(staffList));
        }
    }, [staffList]);

    // Fetch Projects
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await api.get('/api/projects');
                setProjects(response.data);
            } catch (error) {
                console.error("Failed to load projects", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    // Reset view if navigation state requests it
    useEffect(() => {
        if (location.state?.reset) {
            setIsAdding(false);
            setSelectedStaff(null);
            setSearchTerm(""); // Optional: clear filter too
        }
    }, [location.state]);

    // --- DnD Sensors ---
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), // Require 8px movement before drag starts (prevents accidental clicks)
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setStaffList((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // --- Auto-Sort Logic (On Demand) ---
    const handleSortByRole = () => {
        const getRolePriority = (role) => {
            const r = (role || '').toLowerCase();
            if (r.includes('manager') || r.includes('head')) return 1;
            if (r.includes('lead')) return 2;
            if (r.includes('senior')) return 3;
            if (r.includes('executive')) return 4;
            if (r.includes('officer') || r.includes('admin')) return 5;
            return 99;
        };

        const sorted = [...staffList].sort((a, b) => {
            const pA = getRolePriority(a.role);
            const pB = getRolePriority(b.role);
            if (pA !== pB) return pA - pB;
            return a.name.localeCompare(b.name);
        });
        setStaffList(sorted);
    };

    // --- Computed Metrics ---
    const metrics = useMemo(() => {
        const total = staffList.length;
        const assignedCount = staffList.filter(s => (s.assigned_projects || []).length > 0).length;
        const utilization = total > 0 ? ((assignedCount / total) * 100).toFixed(0) : 0;

        // Count by Role Family
        const roles = {};
        staffList.forEach(s => {
            const role = s.role || 'Unassigned';
            roles[role] = (roles[role] || 0) + 1;
        });
        const roleData = Object.keys(roles).map(key => ({ name: key, value: roles[key] }));

        return { total, assignedCount, utilization, roleData };
    }, [staffList]);

    // --- Handlers ---
    const handleSave = (staffData) => {
        if (staffData.id) {
            setStaffList(staffList.map(s => s.id === staffData.id ? staffData : s));
        } else {
            setStaffList([...staffList, { ...staffData, id: Date.now() }]);
        }
        setIsAdding(false);
        setSelectedStaff(null);
    };

    const handleDelete = (id) => {
        if (window.confirm("Confirm deletion?")) {
            setStaffList(staffList.filter(s => s.id !== id));
            if (selectedStaff?.id === id) setSelectedStaff(null);
        }
    };

    // --- Components ---
    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50/50 text-slate-800 p-8 space-y-8 animate-in fade-in duration-500 font-sans">
                {/* 1. Header & Hero Metrics */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
                    {/* Subtle aesthetic accent */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-2.5 bg-slate-900 rounded-lg shadow-sm">
                                <Users className="text-white" size={20} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Talent Distribution</h1>
                            </div>
                        </div>
                        <p className="text-slate-500 max-w-xl text-sm leading-relaxed">
                            Overview of department resources and allocation efficiency.
                        </p>
                    </div>

                    {/* Hero Stats */}
                    <div className="flex gap-6 relative z-10">
                        <div className="text-right px-6 border-r border-gray-100 last:border-0">
                            <div className="text-3xl font-bold text-slate-900 mb-0.5">{metrics.total}</div>
                            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Headcount</div>
                        </div>
                        <div className="text-right px-6">
                            <div className="text-3xl font-bold text-emerald-600 mb-0.5">{metrics.utilization}%</div>
                            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Utilization Rate</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* 2. Main List Area (Left - 8 cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Toolbar */}
                        <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm sticky top-4 z-20">
                            <div className="relative flex-1 max-w-sm ml-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-slate-700 focus:ring-1 focus:ring-slate-400 focus:border-slate-400 outline-none transition-all placeholder:text-gray-400"
                                    placeholder="Filter resources..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 mr-2">
                                <button
                                    onClick={handleSortByRole}
                                    className="flex items-center gap-2 bg-white hover:bg-gray-50 text-slate-600 border border-gray-200 px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm"
                                >
                                    <Layers size={16} className="text-slate-400" /> Sort
                                </button>
                                <button
                                    onClick={() => { setSelectedStaff(null); setIsAdding(true); }}
                                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg text-xs font-semibold shadow-md shadow-slate-200 transition-all border border-transparent"
                                >
                                    <UserPlus size={16} /> New Resource
                                </button>
                            </div>
                        </div>

                        {/* Staff Cards Grid (Sortable) */}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={staffList.map(s => s.id)}
                                strategy={rectSortingStrategy}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {staffList.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map(staff => (
                                        <SortableStaffCard
                                            key={staff.id}
                                            staff={staff}
                                            onClick={() => { setIsAdding(false); setSelectedStaff(staff); }}
                                            isSelected={selectedStaff?.id === staff.id}
                                        >
                                            <div
                                                className={`group bg-white rounded-xl border p-5 cursor-pointer transition-all duration-200 hover:shadow-lg relative overflow-hidden h-full ${selectedStaff?.id === staff.id
                                                    ? 'border-slate-500 ring-1 ring-slate-500 shadow-md'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                {/* Decorative background accent */}
                                                <div className="absolute top-0 left-0 w-full h-[3px] bg-slate-800 group-hover:h-[4px] transition-all"></div>

                                                <div className="flex justify-between items-start mb-5 pt-2 relative z-10">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-lg border border-slate-200 group-hover:border-slate-300 transition-colors">
                                                                {staff.name.charAt(0)}
                                                            </div>
                                                            {staff.grade && (
                                                                <div className="absolute -bottom-1 -right-1 bg-white px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-600 shadow-sm border border-slate-200">
                                                                    {staff.grade}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-slate-800 leading-tight text-base group-hover:text-slate-900 transition-colors mb-0.5">{staff.name}</h3>
                                                            <p className="text-xs text-slate-500 font-medium tracking-normal">{staff.role}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {(() => {
                                                        // 1. Get Coordinator Projects (Purple)
                                                        const coordProjs = projects
                                                            .filter(p => p.project_manager === staff.name)
                                                            .map(p => ({
                                                                name: p.name,
                                                                type: 'coord',
                                                                status: p.status
                                                            }));

                                                        // 2. Get Manual Assignments (Blue) - Lookup Status
                                                        const manualProjs = (staff.assigned_projects || [])
                                                            .map(name => {
                                                                const found = projects.find(p => p.name === name);
                                                                return {
                                                                    name,
                                                                    type: 'manual',
                                                                    status: found ? found.status : 'Unknown'
                                                                };
                                                            });

                                                        // 3. Merge & Deduplicate
                                                        const all = [...coordProjs];
                                                        manualProjs.forEach(m => {
                                                            if (!all.some(c => c.name === m.name)) {
                                                                all.push(m);
                                                            }
                                                        });

                                                        if (all.length === 0) {
                                                            return <span className="text-[11px] text-slate-400 italic">No active assignments</span>;
                                                        }

                                                        // Sort by status: Not Started > In Progress > Completed
                                                        const statusPriority = { 'Not Started': 1, 'In Progress': 2, 'Delayed': 3, 'Running': 4, 'Completed': 9 };
                                                        all.sort((a, b) => (statusPriority[a.status] || 5) - (statusPriority[b.status] || 5));

                                                        return (
                                                            <>
                                                                {all.slice(0, 3).map((p, i) => {
                                                                    const isCompleted = p.status === 'Completed';
                                                                    const isNotStarted = p.status === 'Not Started';

                                                                    let styles = 'bg-blue-50 text-blue-700 border-blue-100'; // Default In Progress
                                                                    if (isCompleted) styles = 'bg-slate-50 text-slate-400 border-slate-100 line-through decoration-slate-300';
                                                                    if (isNotStarted) styles = 'bg-amber-50 text-amber-700 border-amber-100 opacity-80 dashed-border';

                                                                    return (
                                                                        <span
                                                                            key={i}
                                                                            className={`text-[10px] px-2 py-1 rounded font-semibold border truncate max-w-[150px] flex items-center gap-1.5 transition-all ${styles}`}
                                                                            title={`${p.name} (${p.status})`}
                                                                        >
                                                                            {/* Icon Indicator */}
                                                                            {isCompleted ? (
                                                                                <CheckCircle size={10} className="text-slate-300 shrink-0" />
                                                                            ) : isNotStarted ? (
                                                                                <Clock size={10} className="text-amber-500 shrink-0" />
                                                                            ) : (
                                                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 animate-pulse"></span>
                                                                            )}
                                                                            {p.name}
                                                                        </span>
                                                                    );
                                                                })}
                                                                {all.length > 3 && (
                                                                    <span className="text-[10px] text-slate-400 font-medium self-center px-1">
                                                                        +{all.length - 3}
                                                                    </span>
                                                                )}
                                                            </>
                                                        );
                                                    })()}
                                                </div>

                                                <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-100 pt-3 mt-auto">
                                                    <span className="flex items-center gap-1"><Users size={12} /> {staff.staffNo}</span>
                                                    <span className="flex items-center gap-1"><Briefcase size={12} /> {staff.email}</span>
                                                </div>
                                            </div>
                                        </SortableStaffCard>
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div >

                    {/* 3. Sidebar (Right - 4 cols) - Contextual */}
                    < div className="lg:col-span-4 space-y-6" >
                        {/* A) Edit/Add Form Panel -- ONLY Shows if Adding or Selected */}
                        {
                            (isAdding || selectedStaff) ? (
                                <div className="bg-white rounded-2xl border border-indigo-100 shadow-xl overflow-hidden sticky top-6 animate-in slide-in-from-right-4">
                                    <div className="bg-indigo-50/50 p-4 border-b border-indigo-100 flex justify-between items-center">
                                        <h2 className="font-bold text-indigo-900 flex items-center gap-2">
                                            {isAdding ? <UserPlus size={18} /> : <Edit2 size={18} />}
                                            {isAdding ? 'New Staff Member' : 'Edit Profile'}
                                        </h2>
                                        <button onClick={() => { setIsAdding(false); setSelectedStaff(null); }} className="text-slate-400 hover:text-slate-600">
                                            <X size={18} />
                                        </button>
                                    </div>

                                    <StaffForm
                                        initialData={isAdding ? {} : selectedStaff}
                                        onSave={handleSave}
                                        onDelete={handleDelete}
                                        projects={projects}
                                        isEditing={!isAdding}
                                    />
                                </div>
                            ) : (
                                /* B) Infographic Stats Panel -- Shows when nothing selected */
                                <div className="space-y-6 sticky top-6">
                                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                            <TrendingUp size={18} className="text-emerald-500" /> Role Distribution
                                        </h3>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RechartsPieChart>
                                                    <Pie
                                                        data={metrics.roleData}
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {metrics.roleData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </RechartsPieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="space-y-2 mt-4">
                                            {metrics.roleData.map((d, i) => (
                                                <div key={i} className="flex justify-between items-center text-xs">
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                                                        {d.name}
                                                    </span>
                                                    <span className="font-bold text-slate-700">{d.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                                        <Award className="mb-4 text-white/80" size={32} />
                                        <h3 className="text-xl font-bold mb-2">Team Efficiency</h3>
                                        <p className="text-sm text-indigo-100 mb-4">
                                            Your team is currently operating at <b className="text-white">{metrics.utilization}% allocation</b> capacity.
                                        </p>
                                        <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                                            <div className="h-full bg-white/90" style={{ width: `${metrics.utilization}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                    </div >
                </div >
            </div >
        </DashboardLayout >
    );
};

// --- Sub-Component: Form ---
const StaffForm = ({ initialData, onSave, onDelete, projects, isEditing }) => {
    const [formData, setFormData] = useState({
        name: '', role: '', grade: '', email: '', mobile: '', staffNo: '', ext: '', assigned_projects: [],
        ...initialData
    });

    useEffect(() => {
        setFormData({ name: '', role: '', grade: '', email: '', mobile: '', staffNo: '', ext: '', assigned_projects: [], ...initialData });
    }, [initialData]);

    // Filter projects based on user request
    const relevantProjects = projects.filter(p => !['Cancelled', 'Deleted'].includes(p.status));
    const activeItems = relevantProjects.filter(p => ['Running', 'Delayed', 'Upcoming', 'Not Started', 'In Progress'].includes(p.status));
    const completedItems = relevantProjects.filter(p => p.status === 'Completed');

    const toggleProject = (pName) => {
        const current = formData.assigned_projects || [];
        if (current.includes(pName)) {
            setFormData({ ...formData, assigned_projects: current.filter(c => c !== pName) });
        } else {
            setFormData({ ...formData, assigned_projects: [...current, pName] });
        }
    };

    return (
        <div className="p-6 space-y-4">
            <div className="space-y-3">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                    <input className="w-full border-b border-slate-200 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Staff Name" autoFocus />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Role</label>
                        <input className="w-full border-b border-slate-200 py-2 text-sm text-slate-700 focus:outline-none focus:border-indigo-500"
                            value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} placeholder="Position" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Grade</label>
                        <input className="w-full border-b border-slate-200 py-2 text-sm text-slate-700 focus:outline-none focus:border-indigo-500"
                            value={formData.grade} onChange={e => setFormData({ ...formData, grade: e.target.value })} placeholder="e.g. CS9" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Staff No</label>
                        <input className="w-full border-b border-slate-200 py-2 text-sm text-slate-700 focus:outline-none focus:border-indigo-500"
                            value={formData.staffNo} onChange={e => setFormData({ ...formData, staffNo: e.target.value })} placeholder="####" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Ext</label>
                        <input className="w-full border-b border-slate-200 py-2 text-sm text-slate-700 focus:outline-none focus:border-indigo-500"
                            value={formData.ext} onChange={e => setFormData({ ...formData, ext: e.target.value })} placeholder="####" />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Contact</label>
                    <div className="grid grid-cols-1 gap-2 mt-1">
                        <input className="w-full bg-slate-50 rounded px-3 py-2 text-xs border border-slate-200 focus:outline-none focus:border-indigo-300"
                            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="Email Address" />
                        <input className="w-full bg-slate-50 rounded px-3 py-2 text-xs border border-slate-200 focus:outline-none focus:border-indigo-300"
                            value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} placeholder="Mobile Number" />
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col gap-4">
                    {/* Active Projects */}
                    <div>
                        <label className="text-xs font-bold text-indigo-600 uppercase mb-2 block">Active Assignments</label>
                        <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                            {activeItems.length === 0 && <p className="text-xs text-slate-400 italic">No active projects available.</p>}
                            {activeItems.map(p => (
                                <label key={p.id} className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition-all">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${(formData.assigned_projects || []).includes(p.name) ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                                        {(formData.assigned_projects || []).includes(p.name) && <Check size={10} className="text-white" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-slate-700 leading-tight">{p.name}</div>
                                        <div className="text-[10px] text-slate-400">{p.code} • {p.status}</div>
                                    </div>
                                    <input type="checkbox" className="hidden" checked={(formData.assigned_projects || []).includes(p.name)} onChange={() => toggleProject(p.name)} />
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Completed Projects */}
                    {completedItems.length > 0 && (
                        <div>
                            <label className="text-xs font-bold text-emerald-600 uppercase mb-2 block flex items-center gap-2"><CheckCircle size={12} /> Completed History</label>
                            <div className="space-y-2 max-h-24 overflow-y-auto custom-scrollbar pr-2 opacity-80">
                                {completedItems.map(p => (
                                    <label key={p.id} className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition-all">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${(formData.assigned_projects || []).includes(p.name) ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-slate-300'}`}>
                                            {(formData.assigned_projects || []).includes(p.name) && <Check size={10} className="text-white" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs font-bold text-slate-700 line-through decoration-slate-300">{p.name}</div>
                                            <div className="text-[10px] text-slate-400">{p.code} • Completed</div>
                                        </div>
                                        <input type="checkbox" className="hidden" checked={(formData.assigned_projects || []).includes(p.name)} onChange={() => toggleProject(p.name)} />
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-4 flex items-center gap-3">
                {isEditing && (
                    <button onClick={() => onDelete(formData.id)} className="px-4 py-2 border border-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 hover:border-red-200 transition-colors">
                        Remove
                    </button>
                )}
                <button onClick={() => onSave(formData)} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default ResourceManagementPage;
