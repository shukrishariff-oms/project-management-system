import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Clock, CheckSquare, MessageSquare, Send, Plus, Trash2 } from 'lucide-react';
import api from '../api';

const TaskDetailModal = ({ isOpen, onClose, task, projectMembers = [], onUpdate }) => {
    if (!isOpen || !task) return null;

    const [activeTab, setActiveTab] = useState('overview');
    const [formData, setFormData] = useState({ ...task });
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [subtasks, setSubtasks] = useState([]);
    const [newSubtaskName, setNewSubtaskName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setFormData({ ...task });
        fetchComments();
        // If task has subtasks loaded via nested API, set them. 
        // Otherwise we might need to fetch them. For now assume we might need to fetch or they are passed.
        // If the backend `get_nested_tasks` wasn't called for the main list, we might not have them.
        // Let's rely on onUpdate to refresh the parent view, but strictly we might want to fetch details here.
        if (task.subtasks) {
            setSubtasks(task.subtasks);
        }
    }, [task]);

    const fetchComments = async () => {
        // In a real app we'd have a GET /api/tasks/:id/comments endpoint. 
        // For now, if we loaded them via relation they might be in `task.comments`.
        // If we implemented the backend relation correctly, we should get them if we fetch the task detail.
        // But our main list might not fetch deep relations.
        // Let's assume we use the provided data for now, or fetch if needed.
        if (task.comments) {
            setComments(task.comments);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                ...formData,
                // Ensure dates are null if empty
                start_date: formData.start_date || null,
                end_date: formData.end_date || null,
                completion_date: formData.completion_date || null
            };

            const res = await api.put(`/api/projects/${task.project_id}/task/${task.id}`, payload);
            if (onUpdate) onUpdate(res.data);
            onClose();
        } catch (error) {
            console.error("Failed to update task", error);
            alert("Failed to update task");
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userName = user.full_name || user.email || 'Unknown';

            const res = await api.post(`/api/tasks/${task.id}/comments`, {
                content: newComment,
                user_name: userName
            });

            setComments([...comments, res.data]);
            setNewComment('');
        } catch (error) {
            console.error("Failed to add comment", error);
        }
    };

    const handleAddSubtask = async (e) => {
        e.preventDefault();
        if (!newSubtaskName.trim()) return;
        try {
            const payload = {
                task_name: newSubtaskName,
                project_id: task.project_id,
                parent_id: task.id,
                status: 'Not Started',
                start_date: null,
                end_date: null
            };
            const res = await api.post(`/api/projects/${task.project_id}/task`, payload);
            setSubtasks([...subtasks, res.data]);
            setNewSubtaskName('');
            if (onUpdate) onUpdate(); // Refresh parent to show changes
        } catch (error) {
            console.error("Failed to create subtask", error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-700';
            case 'In Progress': return 'bg-blue-100 text-blue-700';
            case 'Delayed': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getPriorityColor = (p) => {
        switch (p) {
            case 'High': return 'text-red-600 bg-red-50 border-red-200';
            case 'Medium': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'Low': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            default: return 'text-slate-600 bg-slate-50 border-slate-200';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                    <div className="flex-1 mr-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getStatusColor(formData.status)}`}>
                                {formData.status}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${getPriorityColor(formData.priority)}`}>
                                {formData.priority} Priority
                            </span>
                        </div>
                        <input
                            type="text"
                            value={formData.task_name}
                            onChange={(e) => setFormData({ ...formData, task_name: e.target.value })}
                            className="text-xl font-bold text-slate-800 bg-transparent border-none focus:ring-0 p-0 w-full placeholder:text-slate-400"
                            placeholder="Task Name"
                        />
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 px-6 bg-white">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Overview
                    </button>
                    {/* DISABLED: Backend schema rolled back. Re-enable when DB supports subtasks/comments.
                    <button
                        onClick={() => setActiveTab('subtasks')}
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'subtasks' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <CheckSquare size={16} /> Subtasks
                        {subtasks.length > 0 && <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-full">{subtasks.length}</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('comments')}
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'comments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <MessageSquare size={16} /> Comments
                        {comments.length > 0 && <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-full">{comments.length}</span>}
                    </button>
                    */}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-white">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-3 gap-8">
                            <div className="col-span-2 space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Description</label>
                                    <textarea
                                        value={formData.description || ''}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full text-sm text-slate-700 border border-slate-200 rounded-lg p-3 min-h-[120px] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
                                        placeholder="Add a more detailed description..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Start Date</label>
                                        <input
                                            type="date"
                                            value={formData.start_date || ''}
                                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                            className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Due Date</label>
                                        <input
                                            type="date"
                                            value={formData.end_date || ''}
                                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                            className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Info */}
                            <div className="space-y-6 bg-slate-50 p-4 rounded-xl h-fit border border-slate-100">
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
                                        <User size={14} /> Assignee
                                    </label>
                                    <select
                                        value={formData.assigned_to || ''}
                                        onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                                        className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-white focus:border-blue-500"
                                    >
                                        <option value="">Unassigned</option>
                                        {projectMembers.map((m, i) => (
                                            <option key={i} value={m.name}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-white focus:border-blue-500"
                                    >
                                        <option value="Not Started">Not Started</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Delayed">Delayed</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
                                        Priority
                                    </label>
                                    <div className="flex gap-2">
                                        {['Low', 'Medium', 'High'].map(p => (
                                            <button
                                                key={p}
                                                onClick={() => setFormData({ ...formData, priority: p })}
                                                className={`flex-1 text-xs py-1.5 rounded-md border transition-all ${formData.priority === p ? getPriorityColor(p) + ' ring-1 ring-offset-1' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
                                        % Completion
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="range"
                                            min="0" max="100"
                                            value={formData.completion_percentage || 0}
                                            onChange={(e) => setFormData({ ...formData, completion_percentage: parseInt(e.target.value) })}
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <span className="text-sm font-mono text-slate-600 w-10 text-right">{formData.completion_percentage}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'subtasks' && (
                        <div className="space-y-4">
                            <form onSubmit={handleAddSubtask} className="flex gap-2 mb-6">
                                <input
                                    type="text"
                                    value={newSubtaskName}
                                    onChange={(e) => setNewSubtaskName(e.target.value)}
                                    placeholder="Add a subtask..."
                                    className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                />
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center gap-2">
                                    <Plus size={16} /> Add
                                </button>
                            </form>

                            <div className="space-y-2">
                                {subtasks.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                                        No subtasks yet
                                    </div>
                                ) : (
                                    subtasks.map(st => (
                                        <div key={st.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 group hover:border-slate-300 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${st.status === 'Completed' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                                <span className={`text-sm ${st.status === 'Completed' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{st.task_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] px-2 py-0.5 rounded ${getStatusColor(st.status)}`}>{st.status}</span>
                                                {/* In future: Edit/Delete subtask buttons */}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'comments' && (
                        <div className="flex flex-col h-[500px]">
                            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                                {comments.length === 0 ? (
                                    <div className="text-center py-10 text-slate-400 italic">No comments yet. Start the conversation!</div>
                                ) : (
                                    comments.map((c, i) => (
                                        <div key={i} className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                                                {c.user_name?.charAt(0) || '?'}
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl border border-slate-100 text-sm max-w-[85%]">
                                                <div className="flex justify-between items-baseline gap-4 mb-1">
                                                    <span className="font-bold text-slate-700">{c.user_name}</span>
                                                    <span className="text-[10px] text-slate-400">{new Date(c.created_at).toLocaleString()}</span>
                                                </div>
                                                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{c.content}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <form onSubmit={handleAddComment} className="border-t border-slate-200 pt-4 bg-white sticky bottom-0">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Write a comment..."
                                        className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                    />
                                    <button type="submit" className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 transition-colors">
                                        <Send size={18} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-200 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all flex items-center gap-2"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailModal;
