import React, { useState } from 'react';
import { DollarSign, Minus, Plus, FileText, TrendingUp, Edit2, Save, X } from 'lucide-react';

const FinancialModal = ({ isOpen, onClose, formatCurrency }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [ledger, setLedger] = useState([
        { id: 1, code: '5002008', cat: 'Kitchen Supp', name: 'Kitchen Supp./Food', plan: 6000, approve: 6000, actual: 0, status: 'ok (Monitor)' },
        { id: 2, code: '5002014', cat: 'OFF SUPP', name: 'Office Supplies', plan: 3500, approve: 3500, actual: 0, status: 'ok (Monitor)' },
        { id: 3, code: '6001202', cat: 'Training', name: 'Healthcare conference', plan: 650000, approve: 130000, actual: 0, status: 'To HCOD (Ignore)' },
        { id: 4, code: '6001202-B', cat: 'Training', name: 'Team Building', plan: 33000, approve: 19500, actual: 0, status: 'To HCOD (Ignore)' },
        { id: 5, code: '6011010', cat: 'Off Func', name: 'Training/Project Workshop', plan: 150000, approve: 400000, actual: 0, status: 'Ignore' },
        { id: 6, code: '6011003', cat: 'Off Ref', name: 'External refreshment supplier', plan: 48000, approve: 48000, actual: 9060, status: 'ok (Monitor)' },
        { id: 7, code: '6003016', cat: 'FeeSoftware', name: 'Fee Software', plan: 310000, approve: 310000, actual: 68850, status: 'ok (Monitor)' }
    ]);

    const handleAddRow = () => {
        setLedger([...ledger, {
            id: Date.now(),
            code: 'NEW-001',
            cat: 'New Category',
            name: 'New Item Description',
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

    const totals = ledger.reduce((acc, row) => ({
        plan: acc.plan + Number(row.plan || 0),
        approve: acc.approve + Number(row.approve || 0),
        actual: acc.actual + Number(row.actual || 0),
        balance: acc.balance + (Number(row.approve || 0) - Number(row.actual || 0))
    }), { plan: 0, approve: 0, actual: 0, balance: 0 });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <DollarSign size={20} className="text-emerald-600" />
                            Department Budget & Expenses Tracking
                        </h2>
                        <p className="text-xs text-slate-500">FY 2025/2026 Admin & OPEX Ledger</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`p-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-colors ${isEditing ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-100 text-slate-600'}`}
                        >
                            {isEditing ? <><Save size={16} /> Done</> : <><Edit2 size={16} /> Edit Mode</>}
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                            <Minus size={20} className="rotate-45" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6 bg-slate-50">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#786c3b] text-white uppercase text-[10px] font-bold tracking-wider">
                                <tr>
                                    <th className="px-4 py-3">Budget & Expenses Tracking Summary</th>
                                    <th className="px-4 py-3 text-right">Budget Plan</th>
                                    <th className="px-4 py-3 text-right">Approve</th>
                                    <th className="px-4 py-3 text-right">Actual</th>
                                    <th className="px-4 py-3 text-right">Balance</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {ledger.map((row) => (
                                    <tr key={row.id} className="hover:bg-amber-50/30 transition-colors group">
                                        <td className="px-4 py-3">
                                            {isEditing ? (
                                                <div className="space-y-1">
                                                    <input type="text" value={row.cat} onChange={(e) => handleUpdate(row.id, 'cat', e.target.value)} className="w-full text-xs font-bold border rounded p-1" />
                                                    <input type="text" value={row.name} onChange={(e) => handleUpdate(row.id, 'name', e.target.value)} className="w-full text-[10px] border rounded p-1" />
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="font-bold text-slate-700 text-xs">{row.cat}<span className="text-slate-400 font-normal ml-1">({row.code})</span></div>
                                                    <div className="text-[10px] text-slate-500">{row.name}</div>
                                                </>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-slate-600 border-l border-dashed border-slate-100 bg-slate-50/50">
                                            {isEditing ? <input type="number" value={row.plan} onChange={(e) => handleUpdate(row.id, 'plan', e.target.value)} className="w-20 text-right border rounded p-1" /> : formatCurrency(row.plan)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-slate-800 font-bold bg-[#fffdf5]">
                                            {isEditing ? <input type="number" value={row.approve} onChange={(e) => handleUpdate(row.id, 'approve', e.target.value)} className="w-20 text-right border rounded p-1" /> : formatCurrency(row.approve)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-slate-600 bg-yellow-50">
                                            {isEditing ? <input type="number" value={row.actual} onChange={(e) => handleUpdate(row.id, 'actual', e.target.value)} className="w-20 text-right border rounded p-1 bg-yellow-50" /> : (row.actual > 0 ? formatCurrency(row.actual) : '-')}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700 bg-emerald-50/30 border-l border-emerald-100">
                                            {formatCurrency(row.approve - row.actual)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {isEditing ? <input type="text" value={row.status} onChange={(e) => handleUpdate(row.id, 'status', e.target.value)} className="w-full text-xs border rounded p-1" /> : (
                                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded inline-block whitespace-nowrap">
                                                    {row.status}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-[#786c3b] text-white">
                                <tr>
                                    <td className="px-4 py-3 font-bold text-xs uppercase flex items-center gap-2">
                                        ISTMO Expenses 2025 (Total)
                                        {isEditing && <button onClick={handleAddRow} className="ml-2 hover:bg-white/20 p-1 rounded"><Plus size={14} /></button>}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono text-xs opacity-80">{formatCurrency(totals.plan)}</td>
                                    <td className="px-4 py-3 text-right font-mono text-xs font-bold">{formatCurrency(totals.approve)}</td>
                                    <td className="px-4 py-3 text-right font-mono text-xs font-bold">{formatCurrency(totals.actual)}</td>
                                    <td className="px-4 py-3 text-right font-mono text-xs font-bold bg-white/10">{formatCurrency(totals.balance)}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialModal;
