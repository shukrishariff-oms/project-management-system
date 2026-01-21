import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
    LayoutGrid,
    Briefcase,
    Layers,
    PieChart,
    Users,
    DollarSign,
    LogOut,
    Menu,
    X,
    FolderOpen,
    Settings,
    ChevronDown,
    ChevronRight,
    Search,
    Plus,
    Folder,
    User
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, to, isActive, hasSubmenu, isOpen, onClick }) => (
    <div
        onClick={onClick}
        className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 mb-1 group ${isActive
            ? 'bg-primary/20 text-primary shadow-sm'
            : 'text-muted-foreground hover:bg-white/5 hover:text-white'
            } `}
    >
        <div className="flex items-center gap-3">
            <Icon size={18} className={isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary transition-colors'} />
            <span className="text-sm font-semibold tracking-tight">{label}</span>
        </div>
        {hasSubmenu && (
            <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} `}>
                <ChevronDown size={14} className="opacity-50" />
            </div>
        )}
    </div>
);

const SidebarGroup = ({ label }) => (
    <div className="px-3 mt-8 mb-3 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
        {label}
    </div>
);

const DashboardLayout = ({ children, headerActions }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isProjectsOpen, setIsProjectsOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <div className="min-h-screen bg-[#030711] flex font-['Plus_Jakarta_Sans'] selection:bg-primary/20 relative">

            {/* Background Orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
            </div>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 nav-blur flex items-center justify-between px-6 z-[40]">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20">I</div>
                    <span className="text-white font-bold tracking-tighter">ISTMO DEPARTMENT</span>
                </div>
                <button
                    onClick={toggleMobileMenu}
                    className="p-2 text-muted-foreground hover:text-white transition-colors"
                >
                    <Menu size={24} />
                </button>
            </header>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[45] lg:hidden animate-in fade-in duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* SIDEBAR NAVIGATION */}
            <aside className={`
                fixed left-0 top-0 h-screen w-64 glass-card border-none rounded-none border-r border-white/5 flex flex-col z-[50]
                transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>

                {/* Brand Header */}
                <div className="p-6 flex items-center gap-3 border-b border-white/5">
                    <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                        <LayoutGrid size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-sm tracking-tight leading-none uppercase">ISTMO Department</h1>
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Internal Workspace</span>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="lg:hidden ml-auto p-1 text-muted-foreground hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="px-4 py-6">
                    <div className="relative group">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search everything..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                        />
                    </div>
                </div>

                {/* Scrollable Navigation */}
                <div className="flex-1 overflow-y-auto px-3 custom-scrollbar">
                    <SidebarItem
                        icon={Briefcase}
                        label="My work"
                        to="/dashboard/my-work"
                        isActive={location.pathname === '/dashboard/my-work'}
                        onClick={() => navigate('/dashboard/my-work')}
                    />

                    {localStorage.getItem('user_role') === 'admin' && (
                        <>
                            <SidebarGroup label="Project Ecosystem" />

                            <SidebarItem
                                icon={Layers}
                                label="All Projects"
                                to="/dashboard/projects"
                                isActive={location.pathname === '/dashboard/projects'}
                                onClick={() => navigate('/dashboard/projects')}
                            />

                            <SidebarItem
                                icon={DollarSign}
                                label="Financials"
                                to="/dashboard/financials"
                                isActive={location.pathname === '/dashboard/financials'}
                                onClick={() => navigate('/dashboard/financials')}
                            />


                            <SidebarItem
                                icon={PieChart}
                                label="Departments"
                                hasSubmenu
                                isOpen={isProjectsOpen}
                                onClick={() => setIsProjectsOpen(!isProjectsOpen)}
                            />

                            {isProjectsOpen && (
                                <div className="pl-4 space-y-1 mb-2 animate-in slide-in-from-left-2 duration-300">
                                    <SidebarItem
                                        icon={Users}
                                        label="Resources"
                                        to="/dashboard/resources"
                                        isActive={location.pathname === '/dashboard/resources'}
                                        onClick={() => navigate('/dashboard/resources', { state: { reset: Date.now() } })}
                                    />
                                </div>
                            )}
                        </>
                    )}

                </div>

                {/* Footer / User Profile */}
                <div className="p-4 border-t border-white/5 bg-white/5">
                    <div className="flex items-center gap-2 p-2 rounded-xl transition-all group relative border border-transparent">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-xs font-black text-white shadow-lg border border-white/20 shrink-0">
                            {(localStorage.getItem('user_name') || 'US').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="text-sm font-bold text-white truncate">
                                {localStorage.getItem('user_name') || 'User'}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider truncate">
                                {localStorage.getItem('user_role') === 'admin' ? 'Administrator' : 'Team Member'}
                            </div>
                        </div>

                        {/* Settings Button */}
                        <button
                            onClick={() => navigate('/dashboard/settings')}
                            className={`p-2 rounded-lg transition-all shadow-sm ${location.pathname === '/dashboard/settings' ? 'bg-primary text-white' : 'bg-white/10 text-muted-foreground hover:text-white hover:bg-white/20'}`}
                            title="Settings"
                        >
                            <Settings size={16} />
                        </button>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="bg-white/10 p-2 rounded-lg text-muted-foreground hover:text-destructive-foreground hover:bg-destructive/80 transition-all shadow-sm"
                            title="Logout"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 lg:ml-64 min-h-screen transition-all duration-300 relative pt-16 lg:pt-0">
                <div className="max-w-[1600px] mx-auto p-8 space-y-8 animate-fade-in">
                    {headerActions && (
                        <div className="flex justify-end mb-6">
                            <div className="flex gap-3 glass-card p-2 border-white/5">
                                {headerActions}
                            </div>
                        </div>
                    )}
                    {children ? children : <Outlet />}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
