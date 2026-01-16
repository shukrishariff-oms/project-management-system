import React from 'react';
import { Link } from 'react-router-dom';

const FeatureCard = ({ title, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-slate-200">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-600">Comprehensive tools to manage and optimized your {title.toLowerCase()}.</p>
    </div>
);

const LandingPage = () => {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-slate-50">
            {/* Hero Section */}
            <header className="bg-slate-900 text-white py-20 px-4 text-center">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl font-extrabold mb-6 tracking-tight">Elevate Your Project Portfolio</h1>
                    <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                        Track health, finance, and risks with our all-in-one Project Portfolio Management solution.
                    </p>
                    <Link
                        to="/login"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors text-lg"
                    >
                        Get Started
                    </Link>
                </div>
            </header>

            {/* Feature Grid */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard title="Project Health" icon="❤️" />
                    <FeatureCard title="Portfolio Financing" icon="💰" />
                    <FeatureCard title="Resource Overview" icon="👥" />
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-auto bg-slate-800 text-slate-400 py-8 text-center">
                <p>&copy; 2026 Project Management System. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
