import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    DollarSign, TrendingUp, Layers, ChevronRight, ArrowLeft,
    FileText, Plus, Edit2, Save, X, Briefcase, Minus
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api';

const FinancialPage = () => {
    const [viewMode, setViewMode] = useState('selection'); // 'selection', 'capex', 'opex'
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const location = useLocation();

    // Reset view if navigation state requests it
    useEffect(() => {
        if (location.state?.reset) {
            setViewMode('selection');
        }
    }, [location.state]);

    // Fetch projects for CAPEX view
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

    const formatCurrency = (val) => {
        if (val === undefined || val === null) return '-';
        return new Intl.NumberFormat('en-MY', {
            style: 'currency',
            currency: 'MYR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val).replace('MYR', 'RM');
    };

    // --- SELECTION VIEW ---
    if (viewMode === 'selection') {
        return (
            <DashboardLayout>
                <div className="min-h-[80vh] flex flex-col justify-center animate-in fade-in duration-500">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-4 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm mb-6">
                            {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(year => (
                                <button
                                    key={year}
                                    onClick={() => setSelectedYear(year)}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${selectedYear === year
                                        ? 'bg-slate-800 text-white shadow-md'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                        }`}
                                >
                                    FY {year}
                                </button>
                            ))}
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">Department Financials ({selectedYear})</h1>
                        <p className="text-slate-500">Select a financial ledger to manage for the fiscal year</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
                        {/* CAPEX CARD */}
                        <div
                            onClick={() => setViewMode('capex')}
                            className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl hover:shadow-2xl hover:border-indigo-200 transition-all cursor-pointer group relative overflow-hidden"
                        >
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100 group-hover:scale-110 transition-transform">
                                    <Briefcase size={32} className="text-indigo-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">CAPEX</h2>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Project Development Budget</p>
                                <p className="text-slate-600 text-sm mb-6">
                                    Track project-specific capital expenditure, utilization rates, and variance analysis across the portfolio.
                                </p>
                                <div className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
                                    Access Ledger <ChevronRight size={16} />
                                </div>
                            </div>
                            <div className="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Layers size={200} />
                            </div>
                        </div>

                        {/* OPEX CARD */}
                        <div
                            onClick={() => setViewMode('opex')}
                            className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl hover:shadow-2xl hover:border-emerald-200 transition-all cursor-pointer group relative overflow-hidden"
                        >
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100 group-hover:scale-110 transition-transform">
                                    <DollarSign size={32} className="text-emerald-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">OPEX</h2>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Department Admin & Operations</p>
                                <p className="text-slate-600 text-sm mb-6">
                                    Manage recurring administrative costs, training funds, software licensing, and operational overheads.
                                </p>
                                <div className="inline-flex items-center gap-2 text-emerald-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
                                    Access Ledger <ChevronRight size={16} />
                                </div>
                            </div>
                            <div className="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity">
                                <TrendingUp size={200} />
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // --- CAPEX VIEW (Project Budget Table) ---
    if (viewMode === 'capex') {
        const filteredProjects = projects.filter(p => {
            if (!p.start_date) return false;
            return new Date(p.start_date).getFullYear() === selectedYear;
        });

        const capexTotal = filteredProjects.reduce((sum, p) => sum + (p.planned_cost || 0), 0);

        // Calculate Portfolio-Level Totals
        const totalCommitted = filteredProjects.reduce((sum, p) => sum + (p.payments || []).reduce((s, pay) => s + (pay.planned_amount || 0), 0), 0);
        const totalPaid = filteredProjects.reduce((sum, p) => sum + (p.payments || []).filter(pay => pay.status === 'Paid').reduce((s, pay) => s + (pay.paid_amount || 0), 0), 0);

        return (
            <DashboardLayout>
                <div className="max-w-7xl mx-auto animate-in slide-in-from-right duration-300">
                    <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => setViewMode('selection')} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                            <ArrowLeft size={20} className="text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                <Briefcase className="text-indigo-600" /> CAPEX Ledger {selectedYear}
                            </h1>
                            <p className="text-slate-500 text-sm">Project Capital Expenditure Tracking (FY {selectedYear})</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#3b4c78] text-white uppercase text-[10px] font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Project Name</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Budget Allocation</th>
                                    <th className="px-6 py-4 text-right">Committed</th>
                                    <th className="px-6 py-4 text-right">Actual Paid</th>
                                    <th className="px-6 py-4 text-right">Remaining</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredProjects.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-slate-400 italic">
                                            No CAPEX projects registered for FY {selectedYear}
                                        </td>
                                    </tr>
                                )}
                                {filteredProjects.map((p) => {
                                    const paid = (p.payments || []).filter(pay => pay.status === 'Paid').reduce((s, pay) => s + (pay.paid_amount || 0), 0);
                                    const committed = (p.payments || []).reduce((s, pay) => s + (pay.planned_amount || 0), 0);

                                    return (
                                        <tr key={p.id} className="hover:bg-indigo-50/10 hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-700">{p.name}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${p.status === 'Running' ? 'bg-emerald-100 text-emerald-700' :
                                                    p.status === 'Delayed' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-slate-700">{formatCurrency(p.planned_cost)}</td>
                                            <td className="px-6 py-4 text-right font-mono text-blue-600">{formatCurrency(committed)}</td>
                                            <td className="px-6 py-4 text-right font-mono text-emerald-600 font-bold">{formatCurrency(paid)}</td>
                                            <td className="px-6 py-4 text-right font-mono text-slate-500">{formatCurrency(p.planned_cost - paid)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="bg-[#3b4c78] text-white">
                                <tr>
                                    <td className="px-6 py-4 font-bold text-xs uppercase" colSpan="2">Total CAPEX Portfolio ({selectedYear})</td>
                                    <td className="px-6 py-4 text-right font-mono text-xs font-bold">{formatCurrency(capexTotal)}</td>
                                    <td className="px-6 py-4 text-right font-mono text-xs opacity-70">{formatCurrency(totalCommitted)}</td>
                                    <td className="px-6 py-4 text-right font-mono text-xs font-bold">{formatCurrency(totalPaid)}</td>
                                    <td className="px-6 py-4 text-right font-mono text-xs font-bold bg-white/10">{formatCurrency(capexTotal - totalPaid)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // --- OPEX VIEW (Admin Ledger) ---
    // Reusing the logic from the previous modal but inline
    if (viewMode === 'opex') {
        return (
            <DashboardLayout>
                <div className="max-w-7xl mx-auto animate-in slide-in-from-right duration-300">
                    <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => setViewMode('selection')} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                            <ArrowLeft size={20} className="text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                <DollarSign className="text-emerald-600" /> OPEX Ledger
                            </h1>
                            <p className="text-slate-500 text-sm">Department Admin & Operations Expenses</p>
                        </div>
                    </div>

                    {/* Reuse the AdminLedger Component Logic here or keep it simple */}
                    <AdminLedger formatCurrency={formatCurrency} year={selectedYear} />
                </div>
            </DashboardLayout>
        );
    }

    return null;
};

// Internal Sub-component for OPEX Ledger to keep state clean
const AdminLedger = ({ formatCurrency, year }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null); // For drill-down

    const [ledger, setLedger] = useState(() => {
        const saved = localStorage.getItem('opex_ledger_data');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('opex_ledger_data', JSON.stringify(ledger));
    }, [ledger]);

    // Calculate Actuals from saved transactions
    const [calculatedActuals, setCalculatedActuals] = useState({});

    // Refresh actuals when view changes or periodical check
    useEffect(() => {
        const calculateTotals = () => {
            const newActuals = {};
            ledger.forEach(item => {
                const txKey = `opex_tx_${item.code}`;
                const savedTx = localStorage.getItem(txKey);
                if (savedTx) {
                    const transactions = JSON.parse(savedTx);
                    const total = transactions.reduce((sum, tx) => {
                        return tx.type === 'Debit' ? sum + Number(tx.amount || 0) : sum - Number(tx.amount || 0);
                    }, 0);
                    // Only sum debits as usage? Or net usage? Usually Usage = Debits (expenses). 
                    // Let's assume Usage means Expenses (Debits). 
                    // If we use Net, then credits reduce the expense. 
                    // Let's match the CategoryDetailedLedger logic: Running Balance = Start - (Debit - Credit).
                    // So Actual Usage = Start Balance - Current Balance?
                    // Or simply Sum of Debits? 
                    // User asked for "Total Usage". Usage commonly means Expenses.
                    // Let's sum Debits - Credits (Net Expense).
                    newActuals[item.code] = total;
                }
            });
            setCalculatedActuals(newActuals);
        };

        calculateTotals();

        // Add listener for storage events to sync across tabs or components
        window.addEventListener('storage', calculateTotals);
        return () => window.removeEventListener('storage', calculateTotals);
    }, [ledger, selectedCategory]); // Re-run when ledger changes or we return from detail view (selectedCategory null)

    // ... grouping logic ...
    const groupedLedger = ledger.reduce((groups, item) => {
        const key = item.cat; // Group by Category Name
        if (!groups[key]) {
            groups[key] = {
                cat: item.cat,
                code: item.code, // Take code from first item
                items: []
            };
        }
        groups[key].items.push(item);
        return groups;
    }, {});

    const handleAddRowToGroup = (groupCat) => {
        const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
        setLedger([...ledger, {
            id: Date.now(),
            code: randomCode, // Unique code for new line
            cat: groupCat,
            name: 'New Allocation Item',
            plan: 0,
            approve: 0,
            actual: 0,
            status: 'Draft'
        }]);
        setIsEditing(true);
    };

    const handleAddFreshRow = () => {
        const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
        setLedger([...ledger, {
            id: Date.now(),
            code: randomCode,
            cat: 'New Category',
            name: 'New Item',
            plan: 0,
            approve: 0,
            actual: 0,
            status: 'Draft'
        }]);
        setIsEditing(true);
    };

    const handleUpdate = (id, field, value) => {
        setLedger(ledger.map(row =>
            row.id === id ? { ...row, [field]: value } : row
        ));
    };

    const handleUpdateGroup = (oldCat, field, value) => {
        setLedger(ledger.map(row => {
            if (row.cat === oldCat) {
                // If changing code, migrate localStorage data to new key
                if (field === 'code' && row.code !== value) {
                    const oldKey = `opex_tx_${row.code}`;
                    const newKey = `opex_tx_${value}`;
                    const existingData = localStorage.getItem(oldKey);
                    if (existingData) {
                        localStorage.setItem(newKey, existingData);
                        localStorage.removeItem(oldKey);
                    }
                }
                return { ...row, [field]: value };
            }
            return row;
        }));
    };

    const handleDeleteRow = (id) => {
        if (window.confirm('Are you sure you want to delete this allocation line?')) {
            const rowToDelete = ledger.find(r => r.id === id);
            if (rowToDelete) {
                // Remove associated transaction data
                localStorage.removeItem(`opex_tx_${rowToDelete.code}`);
            }
            setLedger(ledger.filter(row => row.id !== id));
        }
    };

    const totals = ledger.reduce((acc, row) => {
        const actualAmount = calculatedActuals[row.code] || 0;
        return {
            plan: acc.plan + Number(row.plan || 0),
            approve: acc.approve + Number(row.approve || 0),
            actual: acc.actual + actualAmount,
            balance: acc.balance + (Number(row.approve || 0) - actualAmount)
        };
    }, { plan: 0, approve: 0, actual: 0, balance: 0 });

    // If a category is selected, show the Detailed Transaction View
    if (selectedCategory) {
        return (
            <CategoryDetailedLedger
                item={selectedCategory} // Now passing a single Item, not a Group. Keeping prop name for now or refactoring component? Refactoring component better.
                // Let's change the prop in component below to 'item' and update here.
                onBack={() => setSelectedCategory(null)}
                formatCurrency={formatCurrency}
                year={year}
            />
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            {/* Header Controls */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-end bg-slate-50/50 gap-3">
                <div className="flex-1 text-xs text-slate-500 italic flex items-center">
                    * Admin: Click "Edit Ledger" to modify allocations.
                </div>
                {isEditing && (
                    <button
                        onClick={handleAddFreshRow}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 text-xs font-bold hover:bg-indigo-700 shadow-sm"
                    >
                        <Plus size={14} /> Add New Line
                    </button>
                )}
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-colors ${isEditing ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                    {isEditing ? <><Save size={14} /> Done Editing</> : <><Edit2 size={14} /> Edit Ledger</>}
                </button>
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 flex items-center gap-2">
                    <FileText size={14} /> Export
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-[#786c3b] text-white uppercase text-[10px] font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4 w-1/3">Budget & Expenses Tracking Summary</th>
                            <th className="px-6 py-4 text-right">Budget Plan</th>
                            <th className="px-6 py-4 text-right">Approve</th>
                            <th className="px-6 py-4 text-right">Actual</th>
                            <th className="px-6 py-4 text-right">Balance</th>
                            <th className="px-6 py-4 text-right">Status</th>
                            {isEditing && <th className="px-6 py-4 text-center">Action</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {Object.values(groupedLedger).map((group, index) => (
                            <React.Fragment key={index}>
                                {/* PARENT HEADER ROW - Clickable for Detail View */}
                                <tr className="bg-amber-50/50 border-b border-slate-200/50 hover:bg-amber-100/50 transition-colors cursor-pointer group">
                                    <td
                                        className="px-6 py-3 font-bold text-slate-800 text-xs flex items-center gap-2"
                                        onClick={() => setSelectedCategory(group)}
                                    >
                                        {isEditing ? (
                                            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                                <input
                                                    type="text"
                                                    value={group.cat}
                                                    onChange={(e) => handleUpdateGroup(group.cat, 'cat', e.target.value)}
                                                    className="font-bold text-slate-800 text-xs bg-white border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none w-48"
                                                    placeholder="Category Name"
                                                />
                                                <input
                                                    type="text"
                                                    value={group.code}
                                                    onChange={(e) => handleUpdateGroup(group.cat, 'code', e.target.value)}
                                                    className="text-slate-500 font-normal text-xs bg-white border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none w-24"
                                                    placeholder="Code"
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-2 h-2 rounded-full bg-amber-500 group-hover:scale-125 transition-transform"></div>
                                                <span className="group-hover:underline decoration-amber-500 underline-offset-2">{group.cat}</span>
                                                <span className="text-slate-400 font-normal no-underline">({group.code})</span>
                                            </>
                                        )}
                                        {isEditing && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddRowToGroup(group.cat);
                                                }}
                                                className="ml-2 p-1 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition-colors"
                                                title="Add Allocation Line"
                                            >
                                                <Plus size={12} />
                                            </button>
                                        )}
                                    </td>
                                    <td colSpan={isEditing ? 6 : 5} onClick={() => setSelectedCategory(group)}></td>
                                </tr>

                                {/* CHILD ITEMS */}
                                {group.items.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-3 pl-12 border-l-4 border-transparent hover:border-indigo-200">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={row.name}
                                                    onChange={(e) => handleUpdate(row.id, 'name', e.target.value)}
                                                    className="w-full text-[11px] border rounded p-1"
                                                    placeholder="Item Description"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-between">
                                                    <div className="text-[11px] text-slate-500">{row.name}</div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedCategory(row); // Pass the specific ROW item
                                                        }}
                                                        className="text-[10px] bg-white border border-slate-200 px-2 rounded cursor-pointer flex items-center gap-1 text-indigo-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        View Usage <ChevronRight size={10} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono text-slate-600 border-l border-dashed border-slate-100 bg-slate-50/50">
                                            {isEditing ? <input type="number" value={row.plan} onChange={(e) => handleUpdate(row.id, 'plan', e.target.value)} className="w-24 text-right border rounded p-1 text-xs" /> : <span className="text-xs">{formatCurrency(row.plan)}</span>}
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono text-slate-800 font-bold bg-[#fffdf5]">
                                            {isEditing ? <input type="number" value={row.approve} onChange={(e) => handleUpdate(row.id, 'approve', e.target.value)} className="w-24 text-right border rounded p-1 text-xs" /> : <span className="text-xs">{formatCurrency(row.approve)}</span>}
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono text-slate-600 bg-yellow-50">
                                            {/* Always show calculated actual, read-only */}
                                            <span className="text-xs">{(calculatedActuals[row.code] || 0) > 0 ? formatCurrency(calculatedActuals[row.code]) : '-'}</span>
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono font-bold text-emerald-700 bg-emerald-50/30 border-l border-emerald-100">
                                            <span className="text-xs">{formatCurrency(row.approve - (calculatedActuals[row.code] || 0))}</span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            {isEditing ? <input type="text" value={row.status} onChange={(e) => handleUpdate(row.id, 'status', e.target.value)} className="w-full text-[10px] border rounded p-1" /> : (
                                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded inline-block whitespace-nowrap">
                                                    {row.status}
                                                </span>
                                            )}
                                        </td>
                                        {isEditing && (
                                            <td className="px-6 py-3 text-center">
                                                <button
                                                    onClick={() => handleDeleteRow(row.id)}
                                                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete Line"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                    <tfoot className="bg-[#786c3b] text-white">
                        <tr>
                            <td className="px-6 py-4 font-bold text-xs uppercase">
                                Department Total ({year})
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-xs opacity-80">{formatCurrency(totals.plan)}</td>
                            <td className="px-6 py-4 text-right font-mono text-xs font-bold">{formatCurrency(totals.approve)}</td>
                            <td className="px-6 py-4 text-right font-mono text-xs font-bold">{formatCurrency(totals.actual)}</td>
                            <td className="px-6 py-4 text-right font-mono text-xs font-bold bg-white/10">{formatCurrency(totals.balance)}</td>
                            <td colSpan={isEditing ? 2 : 1}></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default FinancialPage;

// --- DETAILED TRANSACTION VIEW COMPONENT ---
const CategoryDetailedLedger = ({ item, onBack, formatCurrency, year }) => {
    // Mock Transaction Data based on Image
    const [transactions, setTransactions] = useState(() => {
        const key = `opex_tx_${item.code}`;
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        const key = `opex_tx_${item.code}`;
        localStorage.setItem(key, JSON.stringify(transactions));
    }, [transactions, item.code]);

    const [isAdding, setIsAdding] = useState(false);

    // Calculate opening balance from the item's approved budget
    const startBalance = Number(item.approve || 0);

    // Calculate running balances for transactions
    let runningBalance = startBalance;
    const calculatedTransactions = transactions.map(tx => {
        const amount = Number(tx.amount || 0);
        if (tx.type === 'Debit') {
            runningBalance -= amount;
        } else {
            runningBalance += amount;
        }
        return { ...tx, balance: runningBalance };
    });

    const currentBalance = runningBalance;

    const handleAddTransaction = () => {
        const newTx = {
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            po: '',
            item: '',
            desc: '',
            type: 'Debit',
            amount: '',
            balance: 0 // Placeholder, calculated properly in render
        };
        setTransactions([...transactions, newTx]);
    };

    const handleUpdateTx = (id, field, value) => {
        setTransactions(transactions.map(tx =>
            tx.id === id ? { ...tx, [field]: value } : tx
        ));
    };

    const handleDeleteTx = (id) => {
        setTransactions(transactions.filter(tx => tx.id !== id));
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-amber-50/30 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500">
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            {item.name || item.cat} <span className="text-slate-400 font-normal text-sm">({item.code})</span>
                        </h2>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold text-amber-600">Monthly Usage Log</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-slate-400 uppercase">Current Balance</div>
                    <div className={`text-xl font-mono font-bold ${currentBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(currentBalance)}
                    </div>
                </div>
            </div>

            {/* Transaction Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                    <thead className="bg-[#786c3b] text-white font-bold">
                        <tr>
                            <th className="px-4 py-2 w-24">Date</th>
                            <th className="px-4 py-2 w-24">Account</th>
                            <th className="px-4 py-2">PO/Ref</th>
                            <th className="px-4 py-2">Item</th>
                            <th className="px-4 py-2 w-1/3">Description</th>
                            <th className="px-4 py-2">Type</th>
                            <th className="px-4 py-2 text-right">Amount</th>
                            <th className="px-4 py-2 text-right">Running Balance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {/* Initial Balance Row */}
                        <tr className="bg-yellow-50 font-bold text-slate-700">
                            <td className="px-4 py-3">1/1/{year}</td>
                            <td className="px-4 py-3">{item.code}</td>
                            <td className="px-4 py-3">-</td>
                            <td className="px-4 py-3">Opening Balance</td>
                            <td className="px-4 py-3">Fiscal Year Allocation</td>
                            <td className="px-4 py-3">Credits</td>
                            <td className="px-4 py-3 text-right text-emerald-600"></td>
                            <td className="px-4 py-3 text-right">{formatCurrency(startBalance)}</td>
                        </tr>
                        {calculatedTransactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50 group">
                                <td className="px-4 py-3">
                                    <input
                                        type="text"
                                        value={tx.date}
                                        onChange={(e) => handleUpdateTx(tx.id, 'date', e.target.value)}
                                        className="w-full bg-transparent border-b border-dashed border-slate-200 focus:border-indigo-500 outline-none text-slate-600 text-[11px]"
                                    />
                                </td>
                                <td className="px-4 py-3 text-slate-400">{item.code}</td>
                                <td className="px-4 py-3">
                                    <input
                                        type="text"
                                        value={tx.po}
                                        onChange={(e) => handleUpdateTx(tx.id, 'po', e.target.value)}
                                        placeholder="PO#"
                                        className="w-full bg-transparent border-b border-dashed border-slate-200 focus:border-indigo-500 outline-none text-slate-600 text-[11px]"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="text"
                                        value={tx.item}
                                        onChange={(e) => handleUpdateTx(tx.id, 'item', e.target.value)}
                                        placeholder="Item Name"
                                        className="w-full bg-transparent border-b border-dashed border-slate-200 focus:border-indigo-500 outline-none font-medium text-slate-700 text-[11px]"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="text"
                                        value={tx.desc}
                                        onChange={(e) => handleUpdateTx(tx.id, 'desc', e.target.value)}
                                        placeholder="Description"
                                        className="w-full bg-transparent border-b border-dashed border-slate-200 focus:border-indigo-500 outline-none text-slate-600 text-[11px]"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <select
                                        value={tx.type}
                                        onChange={(e) => handleUpdateTx(tx.id, 'type', e.target.value)}
                                        className="bg-transparent border-none text-[10px] uppercase text-slate-500 focus:ring-0"
                                    >
                                        <option value="Debit">Debit</option>
                                        <option value="Credit">Credit</option>
                                    </select>
                                </td>
                                <td className="px-4 py-3 text-right font-mono text-slate-700">
                                    <input
                                        type="number"
                                        value={tx.amount}
                                        onChange={(e) => handleUpdateTx(tx.id, 'amount', e.target.value)}
                                        placeholder="0.00"
                                        className="w-full text-right bg-transparent border-b border-dashed border-slate-200 focus:border-indigo-500 outline-none"
                                    />
                                </td>
                                <td className={`px-4 py-3 text-right font-mono font-bold flex items-center justify-end gap-2 ${tx.balance < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                                    <span>{formatCurrency(tx.balance)}</span>
                                    <button
                                        onClick={() => handleDeleteTx(tx.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
                                    >
                                        <X size={12} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Quick Add Action */}
            <div className="p-4 bg-slate-50 border-t border-slate-200">
                <button
                    onClick={handleAddTransaction}
                    className="w-full py-3 bg-white border border-dashed border-slate-300 rounded-xl text-slate-400 text-xs font-bold hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                >
                    <Plus size={14} /> Add New Transaction Record
                </button>
            </div>
        </div>
    );
};
