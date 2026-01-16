import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutGrid, ChevronDown, ChevronRight, Search, Plus,
    Folder, Users, DollarSign, Layers, PieChart, Briefcase,
    Settings, LogOut, User
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, to, isActive, hasSubmenu, isOpen, onClick }) => (
    <div
        onClick={onClick}
        className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors mb-1 group ${isActive
            ? 'bg-blue-600/10 text-blue-400'
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
    >
        <div className="flex items-center gap-3">
            <Icon size={18} className={isActive ? 'text-blue-500' : 'group-hover:text-slate-300'} />
            <span className="text-sm font-medium">{label}</span>
        </div>
        {hasSubmenu && (
            isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
        )}
    </div>
);

const SidebarGroup = ({ label }) => (
    <div className="px-3 mt-6 mb-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
        {label}
    </div>
);

const DashboardLayout = ({ children, headerActions }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isProjectsOpen, setIsProjectsOpen] = useState(true);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans selection:bg-blue-100 selection:text-blue-700">

            {/* SIDEBAR NAVIGATION */}
            <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col z-50">

                {/* Brand Header */}
                <div className="p-5 flex items-center gap-3 border-b border-slate-800/50">
                    <div className="bg-blue-600 p-1.5 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <LayoutGrid size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-sm tracking-tight leading-none">ISTMO Department</h1>
                        <span className="text-[10px] text-slate-500 font-medium">Enterprise Workspace</span>
                    </div>
                    <ChevronDown size={14} className="text-slate-500 ml-auto" />
                </div>

                {/* Search Bar */}
                <div className="px-4 py-4">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-md py-1.5 pl-9 pr-3 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-slate-600 transition-colors"
                        />
                    </div>
                </div>

                {/* Scrollable Navigation */}
                <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">

                    <SidebarItem
                        icon={Briefcase}
                        label="My work"
                        to="/dashboard/my-work"
                        isActive={location.pathname === '/dashboard/my-work'}
                        onClick={() => navigate('/dashboard/my-work')}
                    />

                    {localStorage.getItem('user_role') === 'admin' && (
                        <>
                            <SidebarGroup label="Main Views" />

                            {/* Projects Link */}
                            <SidebarItem
                                icon={Layers}
                                label="Projects"
                                to="/dashboard/projects"
                                isActive={location.pathname === '/dashboard/projects'}
                                onClick={() => navigate('/dashboard/projects')}
                            />

                            {/* Departments Group */}
                            <SidebarItem
                                icon={PieChart}
                                label="Departments"
                                hasSubmenu
                                isOpen={isProjectsOpen}
                                onClick={() => setIsProjectsOpen(!isProjectsOpen)}
                            />

                            {isProjectsOpen && (
                                <div className="pl-4 space-y-0.5 mb-2 animate-in slide-in-from-left-2 duration-200">
                                    <SidebarItem
                                        icon={LayoutGrid}
                                        label="Overview"
                                        to="/dashboard/departments"
                                        isActive={location.pathname === '/dashboard/departments'}
                                        onClick={() => navigate('/dashboard/departments', { state: { reset: Date.now() } })}
                                    />
                                    <SidebarItem
                                        icon={Users}
                                        label="Resources"
                                        to="/dashboard/resources"
                                        isActive={location.pathname === '/dashboard/resources'}
                                        onClick={() => navigate('/dashboard/resources', { state: { reset: Date.now() } })}
                                    />
                                    <SidebarItem
                                        icon={DollarSign}
                                        label="Financials"
                                        to="/dashboard/financials"
                                        isActive={location.pathname === '/dashboard/financials'}
                                        onClick={() => navigate('/dashboard/financials', { state: { reset: Date.now() } })}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer / User Profile */}
                <div className="p-4 border-t border-slate-800 bg-[#0b1120]">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer transition-colors group relative">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white border border-slate-700">
                            {(localStorage.getItem('user_name') || 'US').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="text-xs font-bold text-slate-200 truncate">
                                {localStorage.getItem('user_name') || 'User'}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate group-hover:text-slate-400">
                                {localStorage.getItem('user_role') === 'admin' ? 'Admin Workspace' : 'Staff Workspace'}
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); handleLogout(); }}
                            className="bg-slate-800 p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
                            title="Logout"
                        >
                            <LogOut size={14} />
                        </button>
                    </div>
                </div>

            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 ml-64 min-h-screen bg-white transition-all duration-300 relative">
                {/* Optional Topbar for specific page actions if needed, or rely on page content */}
                <div className="max-w-[1600px] mx-auto p-8 space-y-6">
                    {headerActions && (
                        <div className="flex justify-end">
                            {headerActions}
                        </div>
                    )}
                    {children}
                </div>
            </main>

        </div>
    );
};

export default DashboardLayout;
