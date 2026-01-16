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
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [staffList, setStaffList] = useState([]);

    useEffect(() => {
        const savedStaff = localStorage.getItem('dept_staff_list');
        if (savedStaff) {
            setStaffList(JSON.parse(savedStaff));
        }
    }, []);

    // Pre-fill form when editing
    useEffect(() => {
        if (editMode && projectData) {
            setFormData({
                name: projectData.name || '',
                project_code: projectData.project_code || '',
                project_manager: projectData.project_manager || '',
                start_date: projectData.start_date || '',
                end_date: projectData.end_date || '',
                planned_cost: projectData.planned_cost?.toString() || '',
                status: projectData.status || 'Not Started',
                description: projectData.description || '',
            });
        } else {
            // Reset form when creating new project
            setFormData({
                name: '',
                project_code: '',
                project_manager: '',
                start_date: '',
                end_date: '',
                planned_cost: '',
                status: 'Not Started',
                description: '',
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
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Delayed">Delayed</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Remarks (Description)
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="Optional project remarks or description..."
                            rows="3"
                        />
                    </div>

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
