import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import api from '../api';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/login', { email, password });
            const { access_token, role, full_name, email: userEmail } = response.data;

            // Store Authentication Data
            localStorage.setItem('token', access_token);
            localStorage.setItem('user_email', userEmail);
            localStorage.setItem('user_role', role);
            localStorage.setItem('user_name', full_name || userEmail.split('@')[0]);

            // Role-Based Redirect Logic
            if (role === 'staff') {
                navigate('/dashboard/my-work');
            } else {
                navigate('/dashboard/projects');
            }
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError('Authentication failed. Please check your connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-md px-6 animate-fade-in">
                <div className="glass-card p-10 border-white/10 shadow-2xl">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-2xl mb-6 border border-primary/20 shadow-lg">
                            <span className="text-2xl font-black text-primary">I</span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
                        <p className="text-muted-foreground mt-2 font-medium">Internal Portal for ISTMO Department</p>
                    </div>

                    {error && (
                        <div className="bg-destructive/10 text-destructive-foreground p-4 rounded-xl mb-6 text-sm border border-destructive/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <Lock size={16} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-secondary/50 focus:bg-background focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-white placeholder:text-muted-foreground/50"
                                    placeholder="name@company.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-secondary/50 focus:bg-background focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-white placeholder:text-muted-foreground/50"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`premium-button w-full shadow-primary/20 flex items-center justify-center gap-2 group ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        <span>Verifying...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In to Dashboard</span>
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 pt-8 border-t border-border/50 text-center">
                        <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-[0.2em]">
                            Authorized Access Only &copy; {new Date().getFullYear()} ISTMO
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
