import React, { useState } from 'react';
import { X, Plus, User, Trash2, Zap, Phone, Mail, Hash, Award, Pencil } from 'lucide-react';

const ResourceManagementModal = ({ isOpen, onClose, staffList, setStaffList, projects = [] }) => {
    // State for Add/Edit Form
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newStaff, setNewStaff] = useState({ name: '', role: '', grade: '', email: '', mobile: '', staffNo: '', ext: '', assigned_projects: [] });

    const handleSaveStaff = () => {
        if (!newStaff.name || !newStaff.role) return;

        // Ensure assigned_projects is an array
        const staffToSave = {
            ...newStaff,
            assigned_projects: Array.isArray(newStaff.assigned_projects) ? newStaff.assigned_projects : []
        };

        if (editingId) {
            // Update existing
            setStaffList(staffList.map(staff => staff.id === editingId ? { ...staffToSave, id: editingId } : staff));
            setEditingId(null);
        } else {
            // Create new
            setStaffList([...staffList, { ...staffToSave, id: Date.now() }]);
        }

        setNewStaff({ name: '', role: '', grade: '', email: '', mobile: '', staffNo: '', ext: '', assigned_projects: [] });
        setIsAdding(false);
    };

    const handleEdit = (staff) => {
        setNewStaff({
            ...staff,
            assigned_projects: staff.assigned_projects || []
        });
        setEditingId(staff.id);
        setIsAdding(true);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setNewStaff({ name: '', role: '', grade: '', email: '', mobile: '', staffNo: '', ext: '', assigned_projects: [] });
    };

    const toggleProjectAssignment = (projectName) => {
        const currentProjects = newStaff.assigned_projects || [];
        if (currentProjects.includes(projectName)) {
            setNewStaff({ ...newStaff, assigned_projects: currentProjects.filter(p => p !== projectName) });
        } else {
            setNewStaff({ ...newStaff, assigned_projects: [...currentProjects, projectName] });
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Remove this staff member?')) {
            setStaffList(staffList.filter(s => s.id !== id));
        }
    };

    if (!isOpen) return null;

    // Filter only running projects for assignment to keep list clean, or show all? Let's show all active.
    const activeProjects = projects.filter(p => p.status !== 'Completed' && p.status !== 'Not Started');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Zap className="text-amber-500" size={20} /> Resource Control
                        </h2>
                        <p className="text-xs text-slate-500">Manage Department Staff List</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Headcount: <span className="text-indigo-600">{staffList.length}</span></div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-auto flex-1">
                    {/* Add/Edit Staff Section */}
                    {isAdding ? (
                        <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100 mb-6 animate-in slide-in-from-top-2">
                            <h3 className="text-sm font-bold text-indigo-700 mb-4 pb-2 border-b border-indigo-200">{editingId ? 'Edit Staff Member' : 'Add New Staff Member'}</h3>

                            <div className="grid grid-cols-12 gap-6">
                                {/* Left Checkbox: Personal Details */}
                                <div className="col-span-8 grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Name</label>
                                        <input
                                            className="w-full text-sm border rounded-lg p-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                                            placeholder="Full Name"
                                            value={newStaff.name}
                                            onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Position</label>
                                        <input
                                            className="w-full text-sm border rounded-lg p-2 focus:ring-2 focus:ring-indigo-200 outline-none"
                                            placeholder="Role / Position"
                                            value={newStaff.role}
                                            onChange={e => setNewStaff({ ...newStaff, role: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Grade</label>
                                        <input
                                            className="w-full text-sm border rounded-lg p-2 focus:ring-2 focus:ring-indigo-200 outline-none"
                                            placeholder="e.g. CS9-2"
                                            value={newStaff.grade}
                                            onChange={e => setNewStaff({ ...newStaff, grade: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Email</label>
                                        <input
                                            className="w-full text-sm border rounded-lg p-2 focus:ring-2 focus:ring-indigo-200 outline-none"
                                            placeholder="email@ijn.com.my"
                                            value={newStaff.email}
                                            onChange={e => setNewStaff({ ...newStaff, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Mobile</label>
                                        <input
                                            className="w-full text-sm border rounded-lg p-2 focus:ring-2 focus:ring-indigo-200 outline-none"
                                            placeholder="Mobile"
                                            value={newStaff.mobile}
                                            onChange={e => setNewStaff({ ...newStaff, mobile: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Staff No</label>
                                        <input
                                            className="w-full text-sm border rounded-lg p-2 focus:ring-2 focus:ring-indigo-200 outline-none"
                                            placeholder="####"
                                            value={newStaff.staffNo}
                                            onChange={e => setNewStaff({ ...newStaff, staffNo: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Extension</label>
                                        <input
                                            className="w-full text-sm border rounded-lg p-2 focus:ring-2 focus:ring-indigo-200 outline-none"
                                            placeholder="Ext"
                                            value={newStaff.ext}
                                            onChange={e => setNewStaff({ ...newStaff, ext: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Right Checkbox: Project Assignment */}
                                <div className="col-span-4 bg-white rounded-lg border border-slate-200 p-4">
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Assign Projects</label>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                        {activeProjects.length > 0 ? activeProjects.map(p => (
                                            <label key={p.id} className="flex items-start gap-2 text-xs cursor-pointer hover:bg-slate-50 p-1.5 rounded transition-colors">
                                                <input
                                                    type="checkbox"
                                                    className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                    checked={(newStaff.assigned_projects || []).includes(p.name)}
                                                    onChange={() => toggleProjectAssignment(p.name)}
                                                />
                                                <span className="text-slate-700 leading-tight">{p.name}</span>
                                            </label>
                                        )) : (
                                            <div className="text-xs text-slate-400 italic p-2 text-center">No active projects available to assign.</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-6 pt-4 border-t border-indigo-200/50 justify-end">
                                <button onClick={handleCancel} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-50">Cancel</button>
                                <button onClick={handleSaveStaff} className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">{editingId ? 'Update Staff' : 'Save Staff'}</button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full py-3 mb-6 border border-dashed border-slate-300 rounded-xl text-slate-500 text-sm font-bold hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus size={16} /> Add New Staff
                        </button>
                    )}

                    {/* Staff List Table */}
                    <div className="overflow-hidden border border-slate-200 rounded-xl shadow-sm">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 w-20">Staff No</th>
                                    <th className="px-4 py-3 w-48">Name</th>
                                    <th className="px-4 py-3 w-40">Position</th>
                                    <th className="px-4 py-3">Assigned Projects</th>
                                    <th className="px-4 py-3 w-32">Contact</th>
                                    <th className="px-4 py-3 w-16 text-right">Ext</th>
                                    <th className="px-4 py-3 w-20 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {staffList.map((staff) => (
                                    <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-4 py-3 font-mono text-slate-500">{staff.staffNo}</td>
                                        <td className="px-4 py-3 font-bold text-slate-800">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 flex-shrink-0">
                                                    <User size={12} />
                                                </div>
                                                <div>
                                                    <div>{staff.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-normal">{staff.grade}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">{staff.role}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {staff.assigned_projects && staff.assigned_projects.length > 0 ? (
                                                    staff.assigned_projects.map((proj, idx) => (
                                                        <span key={idx} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] font-medium truncate max-w-[150px]">
                                                            {proj}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-slate-400 italic text-[10px]">No assignments</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-1.5 text-slate-600">
                                                    <Mail size={10} className="text-slate-400" /> {staff.email}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-500">
                                                    <Phone size={10} className="text-slate-400" /> {staff.mobile}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-slate-600">{staff.ext}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(staff)} className="text-slate-400 hover:text-indigo-600 transition-colors" title="Edit">
                                                    <Pencil size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(staff.id)} className="text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResourceManagementModal;
