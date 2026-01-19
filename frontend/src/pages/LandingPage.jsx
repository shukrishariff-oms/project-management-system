import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, ShieldCheck, TrendingUp, Users, ArrowRight } from 'lucide-react';

const FeatureCard = ({ title, icon: Icon, description }) => (
    <div className="glass-card p-8 group hover:scale-[1.02] transition-all duration-300">
        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-colors">
            <Icon className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
);

const LandingPage = () => {
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 nav-blur px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20">I</div>
                        <span className="text-xl font-bold tracking-tighter text-white">ISTMO</span>
                    </div>
                    <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">
                        Sign In
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="max-w-5xl mx-auto text-center relative z-10 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        NEW VERSION 2.0 LIVE
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tighter leading-[1.1]">
                        Elevate Your <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Project Portfolio</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                        Track health, finance, and risks with our all-in-one Project Portfolio Management solution designed for high-performance teams.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/login" className="premium-button flex items-center gap-2">
                            Get Started Free <ArrowRight className="w-4 h-4" />
                        </Link>
                        <button className="px-6 py-2.5 rounded-lg border border-border hover:bg-secondary transition-colors font-medium">
                            Book a Demo
                        </button>
                    </div>
                </div>

                {/* Abstract Background Element */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
            </header>

            {/* Feature Grid */}
            <section className="py-24 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4 tracking-tight">Everything you need to deliver</h2>
                        <p className="text-muted-foreground">Strategic visibility across your entire portfolio.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            title="Project Health"
                            icon={ShieldCheck}
                            description="Real-time monitoring of project status, risks, and health indicators."
                        />
                        <FeatureCard
                            title="Portfolio Financing"
                            icon={TrendingUp}
                            description="Deep insights into budget allocation, spending, and financial performance."
                        />
                        <FeatureCard
                            title="Resource Overview"
                            icon={Users}
                            description="Optimize team allocation and track resource availability across all tracks."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-auto border-t border-border/50 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-primary/20 rounded-md flex items-center justify-center font-bold text-primary text-xs">I</div>
                        <span className="text-sm font-bold tracking-tighter text-white">ISTMO</span>
                    </div>
                    <p className="text-sm text-muted-foreground">&copy; 2026 ISTMO Management. Built for Excellence.</p>
                    <div className="flex gap-6">
                        <a href="#" className="text-xs text-muted-foreground hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="text-xs text-muted-foreground hover:text-white transition-colors">Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
