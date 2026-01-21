import React, { useState, useEffect } from 'react';
import api from '../api';

const NewProjectModal = ({ isOpen, onClose, onSuccess, editMode = false, projectData = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        project_code: '',
        start_date: '',
        end_date: '',
        planned_cost: '',
        status: 'Not Started',
        description: '',
        objective: '',
        priority: 'Medium',
        risk_level: 'Low',
        department: '',
        tags: '',
        is_archived: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [staffList, setStaffList] = useState([]);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const response = await api.get('/api/users');
                if (response.data) {
                    setStaffList(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch staff via API", error);
                const savedStaff = localStorage.getItem('dept_staff_list');
                if (savedStaff) {
                    setStaffList(JSON.parse(savedStaff));
                }
            }
        };
        fetchStaff();
    }, []);

    // Pre-fill form when editing
    useEffect(() => {
        if (editMode && projectData) {
            setFormData({
                name: projectData.name || '',
                project_code: projectData.project_code || '',
                project_manager: projectData.project_manager || '',
                assigned_to_email: projectData.assigned_to_email || '',
                start_date: projectData.start_date || '',
                end_date: projectData.end_date || '',
                planned_cost: projectData.planned_cost?.toString() || '',
                status: projectData.status || 'Not Started',
                description: projectData.description || '',
                objective: projectData.objective || '',
                priority: projectData.priority || 'Medium',
                risk_level: projectData.risk_level || 'Low',
                department: projectData.department || '',
                tags: projectData.tags || '',
                is_archived: projectData.is_archived || 0
            });
        } else {
            // Reset form when creating new project
            setFormData({
                name: '',
                project_code: '',
                project_manager: '',
                assigned_to_email: '',
                start_date: '',
                end_date: '',
                planned_cost: '',
                status: 'Not Started',
                description: '',
                objective: '',
                priority: 'Medium',
                risk_level: 'Low',
                department: '',
                tags: '',
                is_archived: 0
            });
        }
        setError('');
    }, [editMode, projectData, isOpen]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation: End date cannot be before start date
        if (formData.start_date && formData.end_date && new Date(formData.end_date) < new Date(formData.start_date)) {
            setError('End date cannot be earlier than start date');
            setLoading(false);
            return;
        }

        try {
            // Convert planned_cost to number
            const projectPayload = {
                ...formData,
                planned_cost: parseFloat(formData.planned_cost),
                actual_cost: editMode ? projectData.actual_cost : 0.0
            };

            if (editMode && projectData) {
                // Update existing project
                await api.put(`/api/projects/${projectData.id}`, projectPayload);
            } else {
                // Create new project
                await api.post('/api/projects', projectPayload);
            }

            // Reset form
            setFormData({
                name: '',
                project_code: '',
                project_manager: '',
                start_date: '',
                end_date: '',
                planned_cost: '',
                status: 'Not Started',
                description: '',
                objective: '',
                priority: 'Medium',
                risk_level: 'Low',
                department: '',
                tags: '',
                is_archived: 0
            });

            // Notify parent and close
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error saving project:', err);
            setError(err.response?.data?.detail || 'Failed to save project');
        } finally {
            setLoading(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {editMode ? 'Edit Project' : 'New Project'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
                    >
                        ×
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Project Code
                        </label>
                        <input
                            type="text"
                            name="project_code"
                            value={formData.project_code}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 font-bold"
                            placeholder="e.g. PRJ-2026-001"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Project Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 font-bold"
                            placeholder="Enter project name"
                            required
                        />
                    </div>



                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Start Date
                        </label>
                        <input
                            type="date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 font-bold"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            End Date
                        </label>
                        <input
                            type="date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleChange}
                            min={formData.start_date} // Validation: End date cannot be before start date
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 font-bold"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Planned Budget
                        </label>
                        <input
                            type="number"
                            name="planned_cost"
                            value={formData.planned_cost}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 font-bold"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Status
                        </label>
                        <select
                            name="status"
                            value={formData.status || 'Not Started'}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 font-bold"
                        >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Delayed">Delayed</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Project Lead / Assigned To
                        </label>
                        <select
                            name="assigned_to"
                            value={formData.assigned_to_email || ''}
                            onChange={(e) => {
                                const selectedUser = staffList.find(u => u.email === e.target.value);
                                setFormData({
                                    ...formData,
                                    assigned_to_email: e.target.value,
                                    project_manager: selectedUser ? selectedUser.full_name : ''
                                });
                            }}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 font-bold"
                        >
                            <option value="">-- Assign to Team Member --</option>
                            {staffList.map(user => (
                                <option key={user.id} value={user.email}>
                                    {user.full_name} {user.role === 'admin' ? '(Admin)' : ''}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-500 mt-1">
                            Use this field to assign the project. It will appear in the staff's "My Work" portal.
                        </p>
                    </div>

                    {/* DISABLED: Backend Schema Rollback
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Department
                        </label>
                        <input
                            type="text"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="e.g. IT Department"
                        />
                    </div>
                    */}

                    {/* DISABLED: Backend Schema Rollback
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Priority Level
                            </label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Risk Level
                            </label>
                            <select
                                name="risk_level"
                                value={formData.risk_level}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                    </div>
                    */}

                    {/* DISABLED: Backend Schema Rollback
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Project Objective
                        </label>
                        <textarea
                            name="objective"
                            value={formData.objective}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="What is the main goal of this project?"
                            rows="3"
                        />
                    </div>
                    */}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Remarks (Description)
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 font-medium"
                            placeholder="Optional project remarks..."
                            rows="2"
                        />
                    </div>

                    {/* DISABLED: Backend Schema Rollback
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Tags (Comma separated)
                        </label>
                        <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="e.g. tech, internal, urgent"
                        />
                    </div>
                    */}

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (editMode ? 'Updating...' : 'Creating...') : (editMode ? 'Update Project' : 'Create Project')}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default NewProjectModal;
