import React, { useState, useEffect } from 'react';
import api from '../api';
import DashboardLayout from '../components/DashboardLayout';
import { User, Shield, Key, Save, Trash2, Plus, AlertCircle, CheckCircle } from 'lucide-react';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [userRole, setUserRole] = useState('staff');
    const [currentUserEmail, setCurrentUserEmail] = useState('');

    useEffect(() => {
        const role = localStorage.getItem('user_role');
        const email = localStorage.getItem('user_email');
        setUserRole(role || 'staff');
        setCurrentUserEmail(email || '');
    }, []);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
                    <p className="text-slate-500">Manage your profile and system preferences.</p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="flex border-b border-slate-200">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'profile' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                        >
                            <User size={18} />
                            My Profile
                        </button>
                        {userRole === 'admin' && (
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'users' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                            >
                                <Shield size={18} />
                                User Management
                            </button>
                        )}
                        <button
                            onClick={() => setActiveTab('system')}
                            className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'system' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                        >
                            <AlertCircle size={18} />
                            System Info
                        </button>
                    </div>

                    <div className="p-6 min-h-[400px]">
                        {activeTab === 'profile' && <ProfileSettings />}
                        {activeTab === 'users' && userRole === 'admin' && <UserManagement currentUserEmail={currentUserEmail} />}
                        {activeTab === 'system' && <SystemInfo />}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

const ProfileSettings = () => {
    const [passData, setPassData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => setPassData({ ...passData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passData.new_password !== passData.confirm_password) {
            setMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }

        if (passData.new_password.length < 5) {
            setMessage({ type: 'error', text: 'Password must be at least 5 characters.' });
            return;
        }

        setLoading(true);
        try {
            await api.put('/api/users/me/password', {
                old_password: passData.old_password,
                new_password: passData.new_password
            });
            setMessage({ type: 'success', text: 'Password updated successfully.' });
            setPassData({ old_password: '', new_password: '', confirm_password: '' });
        } catch (error) {
            console.error('Pass update error:', error);
            setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to update password.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Key size={20} className="text-blue-600" />
                Change Password
            </h3>

            {message.text && (
                <div className={`p-3 rounded-lg text-sm mb-4 flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                    <input
                        type="password"
                        name="old_password"
                        value={passData.old_password}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                    <input
                        type="password"
                        name="new_password"
                        value={passData.new_password}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                    <input
                        type="password"
                        name="confirm_password"
                        value={passData.confirm_password}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className={`mt-2 flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Updating...' : 'Update Password'}
                </button>
            </form>
        </div>
    );
};

const UserManagement = ({ currentUserEmail }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    // Form for new user
    const [newUser, setNewUser] = useState({
        email: '',
        full_name: '',
        password: '',
        role: 'staff'
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/users');
            setUsers(res.data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id, email) => {
        if (!window.confirm(`Are you sure you want to delete user ${email}?`)) return;

        try {
            await api.delete(`/api/users/${id}`);
            fetchUsers();
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete user.');
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users', newUser);
            setShowAddModal(false);
            setNewUser({ email: '', full_name: '', password: '', role: 'staff' });
            fetchUsers();
            alert('User created successfully.');
        } catch (error) {
            console.error('Create failed:', error);
            alert(error.response?.data?.detail || 'Failed to create user');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">User Management</h3>
                    <p className="text-sm text-slate-500">Manage system access and roles.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
                >
                    <Plus size={16} />
                    Add User
                </button>
            </div>

            {loading ? (
                <div className="text-center py-8 text-slate-400">Loading users...</div>
            ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3">Full Name</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-3 font-medium text-slate-800">{u.full_name || '-'}</td>
                                    <td className="px-6 py-3 text-slate-600">{u.email}</td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <button
                                            onClick={() => handleDelete(u.id, u.email)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                            title="Delete User"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Add New User</h3>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Full Name</label>
                                <input type="text" required value={newUser.full_name} onChange={e => setNewUser({ ...newUser, full_name: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 font-medium" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Email</label>
                                <input type="email" required value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 font-medium" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Password</label>
                                <input type="password" required value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 font-medium" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Role</label>
                                <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 font-medium">
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-bold text-sm">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-sm">Create User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const SystemInfo = () => (
    <div className="max-w-2xl">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="text-slate-400" />
            System Information
        </h3>
        <div className="bg-slate-50 rounded-lg border border-slate-200 p-6 space-y-4">
            <div className="grid grid-cols-3 gap-4 pb-4 border-b border-slate-200">
                <span className="text-sm font-bold text-slate-500">App Name</span>
                <span className="col-span-2 text-sm font-medium text-slate-800">Project Management System (PMS)</span>
            </div>
            <div className="grid grid-cols-3 gap-4 pb-4 border-b border-slate-200">
                <span className="text-sm font-bold text-slate-500">Version</span>
                <span className="col-span-2 text-sm font-medium text-slate-800">v1.2.0 (Stable Production)</span>
            </div>
            <div className="grid grid-cols-3 gap-4 pb-4 border-b border-slate-200">
                <span className="text-sm font-bold text-slate-500">Environment</span>
                <span className="col-span-2 text-sm font-medium text-slate-800">Production</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <span className="text-sm font-bold text-slate-500">Developer</span>
                <span className="col-span-2 text-sm font-medium text-slate-800">Shukri Shariff</span>
            </div>
        </div>
        <div className="mt-6 p-4 bg-white border border-slate-100 rounded-lg shadow-sm">
            <p className="text-xs text-slate-400 leading-relaxed">
                © 2026 ISTMO Department. All rights reserved. <br />
                System ID: a5c2105b-2eab-4b74-956e-d2f5a48e7f97
            </p>
        </div>
    </div>
);

export default SettingsPage;
