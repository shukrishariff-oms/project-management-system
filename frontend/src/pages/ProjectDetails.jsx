import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { downloadTaskTemplate, downloadPaymentTemplate, parseExcelFile } from '../utils/excelUtils';
import {
    ArrowLeft,
    Plus,
    Pencil,
    ArrowUpDown,
    CheckCircle,
    Clock,
    AlertCircle,
    X,
    Filter,
    Calendar,
    DollarSign,
    Download,
    Upload,

    Trash2,
    ChevronDown,
    ChevronRight,
    FileText
} from 'lucide-react';
import api from '../api';
import NewProjectModal from '../components/NewProjectModal';
import TaskDetailModal from '../components/TaskDetailModal';
import KanbanBoard from '../components/KanbanBoard';
import TaskTimeline from '../components/TaskTimeline';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('payments');
    const [progress, setProgress] = useState(0);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Modal states
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showMatterModal, setShowMatterModal] = useState(false);
    const [editingMatter, setEditingMatter] = useState(null);
    const [selectedTasks, setSelectedTasks] = useState(new Set());
    const [selectedPayments, setSelectedPayments] = useState(new Set());

    // Task Selection Logic
    const toggleSelectAll = () => {
        if (selectedTasks.size === (project.tasks?.length || 0)) {
            setSelectedTasks(new Set());
        } else {
            setSelectedTasks(new Set(project.tasks.map(t => t.id)));
        }
    };

    const toggleSelect = (id) => {
        const newSelected = new Set(selectedTasks);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedTasks(newSelected);
    };

    // Payment Selection Logic
    const toggleSelectAllPayments = () => {
        // Flatten all payments being shown
        if (selectedPayments.size === (filteredPayments.length || 0)) {
            setSelectedPayments(new Set());
        } else {
            setSelectedPayments(new Set(filteredPayments.map(p => p.id)));
        }
    };

    const toggleSelectPayment = (id) => {
        const newSelected = new Set(selectedPayments);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedPayments(newSelected);
    };

    const handleBulkDeleteTasks = () => {
        setDeleteConfirmation({ type: 'bulk-tasks' });
    };

    const handleBulkDeletePayments = () => {
        setDeleteConfirmation({ type: 'bulk-payments' });
    };
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'kanban' | 'timeline'
    const [selectedTask, setSelectedTask] = useState(null);
    const [editingPayment, setEditingPayment] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null); // { type: 'payment' | 'task', id: number }
    const [showEditProjectModal, setShowEditProjectModal] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState({});

    const toggleCategory = (category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    // Form states
    const [paymentForm, setPaymentForm] = useState({
        category: 'Project Implementation',
        deliverable: '',
        phase: '',
        plan_date: '',
        planned_amount: '',
        paid_amount: '0',
        status: 'Not Paid',
        remark: '',
        payment_date: '',
        po_number: '',
        invoice_number: '',
        supporting_document: ''
    });

    const [matterForm, setMatterForm] = useState({
        issue_description: '',
        level: 'MANCOM',
        action_updates: '',
        pic: '',
        target_date: '',
        status: 'Open',
        date_closed: '',
        date_raised: new Date().toISOString().split('T')[0],
        remarks: ''
    });

    const [taskForm, setTaskForm] = useState({
        task_name: '',
        start_date: '',
        end_date: '',
        duration: '',
        completion_percentage: 0,
        status: 'Not Started',
        completion_date: '',
        parent_id: null
    });

    const handleImportTasks = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const data = await parseExcelFile(file);
            console.log("Importing tasks:", data);

            // Loop and create tasks
            for (const item of data) {
                const newTask = {
                    task_name: item['Task Name'] || 'New Task',
                    start_date: item['Start Date (YYYY-MM-DD)'] || new Date().toISOString().split('T')[0],
                    end_date: item['End Date (YYYY-MM-DD)'] || new Date().toISOString().split('T')[0],
                    status: item['Status'] || 'Not Started',
                    completion_percentage: item['Completion %'] || 0,
                    assigned_to: item['Assigned To'] || '',
                    duration: '',
                    completion_date: null,
                    parent_id: null
                };

                await api.post(`/api/projects/${id}/tasks`, newTask);
            }

            fetchProjectDetails();
            alert("Tasks imported successfully!");
        } catch (error) {
            console.error("Error importing tasks:", error);
            alert("Failed to import tasks. Please check the template format.");
        }
        e.target.value = null; // Reset input
    };

    const handleImportPayments = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const data = await parseExcelFile(file);
            console.log("Importing payments:", data);

            for (const item of data) {
                const newPayment = {
                    deliverable: item['Payment Item/Deliverable'] || 'New Deliverable',
                    phase: item['Phase'] || 'TBD',
                    planned_amount: parseFloat(item['Planned Amount']) || 0,
                    plan_date: item['Plan Date (YYYY-MM-DD)'] || new Date().toISOString().split('T')[0],
                    category: item['Category'] || 'Other',
                    po_number: '',
                    invoice_number: '',
                    status: 'Not Paid',
                    actual_amount: 0,
                    actual_payment_date: null,
                    supporting_document: ''
                };

                await api.post(`/api/projects/${id}/payments`, newPayment);
            }

            fetchProjectDetails();
            alert("Payments imported successfully!");
        } catch (error) {
            console.error("Error importing payments:", error);
            alert("Failed to import payments. Please check the template format.");
        }
        e.target.value = null;
    };

    const fetchProjectDetails = async () => {
        try {
            const response = await api.get(`/api/projects/${id}/details`);
            const data = response.data;
            setProject(data);

            // --- Sync Team from Resource Management (LocalStorage) ---
            const savedStaff = localStorage.getItem('dept_staff_list_clean');
            if (savedStaff && data) {
                const staffList = JSON.parse(savedStaff);
                // Find all staff who have this project in their assigned_projects
                const assignedMembers = staffList.filter(s =>
                    (s.assigned_projects || []).includes(data.name)
                );

                if (assignedMembers.length > 0) {
                    // Transform to simple array or keep objects if needed
                    // Currently backend might send 'team' as specific structure, we override/append
                    // Let's assume 'team' is just a display string or array.
                    // We will attach a new property 'computed_team_members' to use for display
                    data.computed_team_members = assignedMembers;
                    // Also update the display string if it exists
                    data.team = assignedMembers.length + ' Members'; // update count
                }
            }
            setProject(data);

            // Use manual percentage as primary progress (calculated by backend)
            setProgress(data.progress_percentage || 0);
        } catch (error) {
            console.error('Error fetching project details:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateProgress = (tasks) => {
        if (!tasks || tasks.length === 0) {
            setProgress(0);
            return;
        }
        const completed = tasks.filter(t => t.status === 'Completed').length;
        setProgress(Math.round((completed / tasks.length) * 100));
    };

    // Calculate contract metrics
    const calculateMetrics = () => {
        if (!project || !project.payments) return {
            totalContract: 0, totalPaid: 0, balance: 0,
            supportContract: 0, supportPaid: 0, supportBalance: 0
        };

        const supportPayments = project.payments.filter(p => (p.category || '').includes('Support') || (p.category || '').includes('Maintenance'));
        const projectPayments = project.payments.filter(p => !((p.category || '').includes('Support') || (p.category || '').includes('Maintenance')));

        // Project Implementation Sums
        const totalContract = projectPayments.reduce((sum, p) => sum + (p.planned_amount || 0), 0);
        const totalPaid = projectPayments
            .filter(p => p.status === 'Paid')
            .reduce((sum, p) => sum + (p.paid_amount || 0), 0);
        const balance = totalContract - totalPaid;

        // Support & Maintenance Sums
        const supportContract = supportPayments.reduce((sum, p) => sum + (p.planned_amount || 0), 0);
        const supportPaid = supportPayments
            .filter(p => p.status === 'Paid')
            .reduce((sum, p) => sum + (p.paid_amount || 0), 0);
        const supportBalance = supportContract - supportPaid;

        return { totalContract, totalPaid, balance, supportContract, supportPaid, supportBalance };
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const [filterPhase, setFilterPhase] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');

    // Sort payments
    const sortedPayments = React.useMemo(() => {
        if (!project || !project.payments) return [];
        let sortablePayments = [...project.payments];
        if (sortConfig.key !== null) {
            sortablePayments.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle nulls
                if (aValue === null) return 1;
                if (bValue === null) return -1;

                // Handle dates
                if (sortConfig.key.includes('date')) {
                    aValue = new Date(aValue);
                    bValue = new Date(bValue);
                }

                // Handle numbers
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    // default comparison works
                } else if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortablePayments;
    }, [project, sortConfig]);

    // Filtered Payments Logic
    const filteredPayments = React.useMemo(() => {
        return sortedPayments.filter(p => {
            // Phase Filter
            if (filterPhase !== 'All' && p.phase !== filterPhase) return false;

            // Status Filter
            if (filterStatus !== 'All') {
                const isOverdue = p.status !== 'Paid' && new Date(p.plan_date) < new Date();

                if (filterStatus === 'Overdue') {
                    if (!isOverdue) return false;
                } else if (filterStatus === 'Paid') {
                    if (p.status !== 'Paid') return false;
                } else if (filterStatus === 'Not Paid') {
                    if (p.status === 'Paid') return false;
                }
            }
            return true;
        });
    }, [sortedPayments, filterPhase, filterStatus]);

    // Derive available phases from data
    const availablePhases = React.useMemo(() => {
        if (!project || !project.payments) return [];
        const phases = new Set(project.payments.map(p => p.phase).filter(Boolean));
        return Array.from(phases).sort();
    }, [project]);

    useEffect(() => {
        fetchProjectDetails();

        // Auto-refresh: Poll every 5 seconds
        const interval = setInterval(fetchProjectDetails, 5000);

        // Refresh when window gets focus
        const handleFocus = () => fetchProjectDetails();
        window.addEventListener('focus', handleFocus);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', handleFocus);
        };
    }, [id]);

    const handleAddPayment = async (e) => {
        e.preventDefault();
        try {
            const plannedAmount = parseFloat(paymentForm.planned_amount);
            const isPaid = paymentForm.status === 'Paid';

            const paymentData = {
                ...paymentForm,
                planned_amount: plannedAmount,
                paid_amount: isPaid ? plannedAmount : 0, // Auto-set paid amount
                payment_date: paymentForm.payment_date || null,
                remark: paymentForm.remark || null,
                po_number: paymentForm.po_number || null,
                invoice_number: paymentForm.invoice_number || null,
                supporting_document: paymentForm.supporting_document || null
            };

            if (editingPayment) {
                await api.put(`/api/payments/${editingPayment.id}`, paymentData);
            } else {
                await api.post(`/api/projects/${id}/payment`, paymentData);
            }

            setShowPaymentModal(false);
            setEditingPayment(null);
            resetPaymentForm();
            fetchProjectDetails();
        } catch (error) {
            console.error('Error saving payment:', error);
        }
    };

    const handleEditPayment = (payment) => {
        setEditingPayment(payment);
        setPaymentForm({
            deliverable: payment.deliverable,
            phase: payment.phase,
            plan_date: payment.plan_date,
            planned_amount: payment.planned_amount.toString(),
            paid_amount: payment.paid_amount.toString(),
            status: payment.status,
            remark: payment.remark || '',
            payment_date: payment.payment_date || '',
            po_number: payment.po_number || '',
            invoice_number: payment.invoice_number || '',
            supporting_document: payment.supporting_document || ''
        });
        setShowPaymentModal(true);
    };

    const resetPaymentForm = () => {
        setPaymentForm({
            deliverable: '',
            phase: '',
            plan_date: '',
            planned_amount: '',
            paid_amount: '0',
            status: 'Not Paid',
            remark: '',
            payment_date: '',
            po_number: '',
            invoice_number: '',
            supporting_document: ''
        });
    };

    const handleAddMatter = async (e) => {
        e.preventDefault();
        try {
            const matterData = {
                ...matterForm,
                // Ensure dates are either valid strings or null
                target_date: matterForm.target_date || null,
                date_closed: matterForm.date_closed || null,
                remarks: matterForm.remarks || null,
                action_updates: matterForm.action_updates || null,
                pic: matterForm.pic || null
            };

            if (editingMatter) {
                await api.put(`/api/matters/${editingMatter.id}`, matterData);
            } else {
                await api.post(`/api/projects/${id}/matter`, matterData);
            }

            setShowMatterModal(false);
            setEditingMatter(null);
            resetMatterForm();
            fetchProjectDetails();
        } catch (error) {
            console.error('Error saving matter:', error);
        }
    };

    const handleEditMatter = (matter) => {
        setEditingMatter(matter);
        setMatterForm({
            issue_description: matter.issue_description,
            level: matter.level || 'MANCOM',
            action_updates: matter.action_updates || '',
            pic: matter.pic || '',
            target_date: matter.target_date || '',
            status: matter.status || 'Open',
            date_closed: matter.date_closed || '',
            date_raised: matter.date_raised,
            remarks: matter.remarks || ''
        });
        setShowMatterModal(true);
    };

    const resetMatterForm = () => {
        setMatterForm({
            issue_description: '',
            level: 'MANCOM',
            action_updates: '',
            pic: '',
            target_date: '',
            status: 'Open',
            date_closed: '',
            date_raised: new Date().toISOString().split('T')[0],
            remarks: ''
        });
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...taskForm,
                // Sanitize dates: Convert empty strings to null for backend validation
                start_date: taskForm.start_date || null,
                end_date: taskForm.end_date || null,
                completion_date: taskForm.completion_date || null
            };

            if (editingTask) {
                await api.put(`/api/projects/${id}/task/${editingTask.id}`, payload);
            } else {
                await api.post(`/api/projects/${id}/task`, payload);
            }

            setShowTaskModal(false);
            setEditingTask(null);
            resetTaskForm();
            fetchProjectDetails();
        } catch (error) {
            console.error('Error saving task:', error);
        }
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setTaskForm({
            task_name: task.task_name,
            start_date: task.start_date || '',
            end_date: task.end_date || '',
            duration: task.duration || '',
            completion_percentage: task.completion_percentage || 0,
            status: task.status || 'Not Started',
            completion_date: task.completion_date || ''
        });
        setShowTaskModal(true);
    };

    const resetTaskForm = () => {
        setTaskForm({
            task_name: '',
            start_date: '',
            end_date: '',
            duration: '',
            completion_percentage: 0,
            status: 'Not Started',
            completion_date: '',
            parent_id: null
        });
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setShowTaskDetailModal(true);
    };

    const handleToggleTask = async (task) => {
        try {
            const newStatus = task.status === 'Completed' ? 'In Progress' : 'Completed';
            await api.put(`/api/projects/${id}/task/${task.id}`, {
                ...task,
                status: newStatus
            });
            fetchProjectDetails();
        } catch (error) {
            console.error('Error toggling task:', error);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-MY', {
            style: 'currency',
            currency: 'MYR'
        }).format(amount);
    };

    // Format date string to dd/mm/yyyy
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getTaskStatus = (task) => {
        switch (task.status) {
            case 'Completed':
                return { label: 'Completed', color: 'bg-green-100 text-green-700' };
            case 'Delayed':
                return { label: 'Delayed', color: 'bg-red-100 text-red-700' };
            case 'In Progress':
                return { label: 'In Progress', color: 'bg-blue-100 text-blue-700' };
            case 'Not Started':
            default:
                if (task.start_date) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const startDate = new Date(task.start_date);
                    // Compare timestamps to be safe
                    if (today.getTime() > startDate.getTime()) {
                        return { label: 'Delayed', color: 'bg-red-100 text-red-700' };
                    }
                }
                return { label: 'Not Started', color: 'bg-slate-100 text-slate-700' };
        }
    };

    const getLevelColor = (level) => {
        switch (level) {
            case 'BOD':
                return 'bg-purple-600';
            case 'MANCOM':
                return 'bg-blue-600';
            case 'TBC':
                return 'bg-orange-500';
            default:
                return 'bg-gray-500';
        }
    };

    const handleDeletePayment = (paymentId) => {
        setDeleteConfirmation({ type: 'payment', id: paymentId });
    };

    const confirmDelete = async () => {
        if (!deleteConfirmation) return;

        if (deleteConfirmation.type === 'payment') {
            try {
                await api.delete(`/api/projects/${id}/payments/${deleteConfirmation.id}`);
                fetchProjectDetails();
                setDeleteConfirmation(null);
            } catch (error) {
                console.error('Error deleting payment:', error);
                alert('Failed to delete payment');
            }
        } else if (deleteConfirmation.type === 'project') {
            try {
                await api.delete(`/api/projects/${id}`);
                // Redirect to dashboard
                alert('Project deleted successfully');
                const role = localStorage.getItem('user_role');
                navigate(role === 'staff' ? '/dashboard/my-work' : '/dashboard');
            } catch (error) {
                console.error('Error deleting project:', error);
                alert('Failed to delete project');
            }
        } else if (deleteConfirmation.type === 'bulk-tasks') {
            try {
                // Delete tasks sequentially
                for (const taskId of selectedTasks) {
                    await api.delete(`/api/projects/${id}/task/${taskId}`);
                }
                setSelectedTasks(new Set());
                fetchProjectDetails();
                setDeleteConfirmation(null);
            } catch (error) {
                console.error('Error deleting tasks:', error);
                alert('Failed to delete some tasks');
            }
        } else if (deleteConfirmation.type === 'bulk-payments') {
            try {
                for (const payId of selectedPayments) {
                    await api.delete(`/api/projects/${id}/payments/${payId}`);
                }
                setSelectedPayments(new Set());
                fetchProjectDetails();
                setDeleteConfirmation(null);
            } catch (error) {
                console.error('Error deleting payments:', error);
                alert('Failed to delete some payments');
            }
        }
    };

    const handleDownloadTemplate = () => {
        // Trigger download
        window.open('http://localhost:8000/api/payments/template', '_blank');
    };

    const handleImportClick = () => {
        document.getElementById('import-file-input').click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post(`/api/projects/${id}/payments/import`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            fetchProjectDetails();
            event.target.value = ''; // Reset input
        } catch (error) {
            console.error('Error importing file:', error);
            alert('Failed to import file. Please check usage.');
        }
    };

    if (loading) return <div>Loading...</div>;

    if (!project) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <div className="text-slate-800 text-xl mb-4">Project not found</div>
                <button
                    onClick={() => {
                        const role = localStorage.getItem('user_role');
                        navigate(role === 'staff' ? '/dashboard/my-work' : '/dashboard');
                    }}
                    className="text-blue-600 hover:text-blue-700 bg-transparent border-none cursor-pointer"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    const metrics = calculateMetrics();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* 1. COMPACT SMART HEADER */}
            <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-30">
                <div className="px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                const role = localStorage.getItem('user_role');
                                navigate(role === 'staff' ? '/dashboard/my-work' : '/dashboard');
                            }}
                            className="text-slate-400 hover:text-slate-800 transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="h-6 w-px bg-slate-200"></div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800 leading-none">{project.name}</h1>
                            {project.status}
                        </div>
                        {project.project_manager && (
                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                <span className="font-bold text-slate-400">Coordinator:</span>
                                <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100 font-medium">
                                    {project.project_manager}
                                </span>
                            </div>
                        )}
                        {/* Team Display */}
                        {(project.computed_team_members && project.computed_team_members.length > 0) && (
                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 ml-4 border-l border-slate-200 pl-4">
                                <span className="font-bold text-slate-400">Team:</span>
                                <div className="flex -space-x-1.5 hover:space-x-0.5 transition-all">
                                    {project.computed_team_members.slice(0, 5).map((member, i) => (
                                        <div
                                            key={i}
                                            className="h-6 w-6 rounded-full ring-2 ring-white flex items-center justify-center text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-100 cursor-help transition-transform hover:scale-110 z-0 hover:z-10"
                                            title={member.name}
                                        >
                                            {member.name.charAt(0)}
                                        </div>
                                    ))}
                                    {project.computed_team_members.length > 5 && (
                                        <div className="h-6 w-6 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500 border border-slate-200 z-0">
                                            +{project.computed_team_members.length - 5}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setShowEditProjectModal(true)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Project Details"
                    >
                        <Pencil size={18} />
                    </button>
                    <button
                        onClick={() => setDeleteConfirmation({ type: 'project', id: project.id })}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Project"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>

                {/* Integrated Progress & Actions */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-xs font-bold text-slate-700">{progress}%</div>
                            <div className="text-[10px] text-slate-400 uppercase">Progress</div>
                        </div>
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-slate-200"></div>
                    <div className="flex gap-2">
                        {/* Tabs as Toggle Buttons */}
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button
                                onClick={() => setActiveTab('tasks')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'tasks' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Tasks
                            </button>
                            <button
                                onClick={() => setActiveTab('payments')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'payments' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Payment Schedule
                            </button>
                            <button
                                onClick={() => setActiveTab('matters')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'matters' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Matters
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* 2. METRICS STRIP (Replacing Large Cards) */}
            {
                activeTab === 'payments' && (
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center gap-8 text-sm">
                        <div className="flex gap-8 border-r border-slate-300 pr-8">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Project Value</span>
                                <span className="font-bold text-slate-800">{formatCurrency(metrics.totalContract)}</span>
                            </div>
                            <div className="w-px h-8 bg-slate-200"></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Paid</span>
                                <span className="font-bold text-emerald-600">{formatCurrency(metrics.totalPaid)}</span>
                            </div>
                            <div className="w-px h-8 bg-slate-200"></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Balance</span>
                                <span className="font-bold text-orange-600">{formatCurrency(metrics.balance)}</span>
                            </div>
                        </div>

                        {/* Support Metrics (Only show if there are support payments) */}
                        {metrics.supportContract > 0 && (
                            <div className="flex gap-8">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Support Contract</span>
                                    <span className="font-bold text-slate-800">{formatCurrency(metrics.supportContract)}</span>
                                </div>
                                <div className="w-px h-8 bg-slate-200"></div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Support Balance</span>
                                    <span className="font-bold text-blue-600">{formatCurrency(metrics.supportBalance)}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex-1"></div>
                        <div className="flex gap-2">
                            <button onClick={downloadPaymentTemplate} className="text-xs font-bold text-slate-600 hover:bg-slate-200 px-3 py-1.5 rounded flex items-center gap-1 transition-colors"><Download size={14} /> Template</button>
                            <label className="text-xs font-bold text-slate-600 hover:bg-slate-200 px-3 py-1.5 rounded flex items-center gap-1 transition-colors cursor-pointer">
                                <Upload size={14} /> Import
                                <input type="file" accept=".xlsx" className="hidden" onChange={handleImportPayments} />
                            </label>
                            <button onClick={() => { setEditingPayment(null); resetPaymentForm(); setShowPaymentModal(true); }} className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded shadow-sm flex items-center gap-1 transition-colors"><Plus size={14} /> Add Payment</button>
                        </div>
                    </div>
                )
            }


            {/* 3. SCROLLABLE CONTENT AREA */}
            < main className="flex-1 overflow-auto bg-slate-50 p-6" >

                {/* PAYMENT SCHEDULE TABLE (Smart Grid) */}
                {
                    activeTab === 'payments' && (
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                            {/* Filter Toolbar */}
                            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Filter size={16} className="text-slate-400" />
                                    <span className="text-xs font-bold text-slate-500 uppercase">Filters:</span>
                                </div>
                                <select
                                    className="text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    value={filterPhase}
                                    onChange={(e) => setFilterPhase(e.target.value)}
                                >
                                    <option value="All">All Phases</option>
                                    {availablePhases.map(phase => (
                                        <option key={phase} value={phase}>{phase}</option>
                                    ))}
                                </select>
                                <select
                                    className="text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Paid">Paid Only</option>
                                    <option value="Not Paid">Not Paid</option>
                                    <option value="Overdue">Overdue Only</option>
                                </select>
                                {(filterPhase !== 'All' || filterStatus !== 'All') && (
                                    <button
                                        onClick={() => { setFilterPhase('All'); setFilterStatus('All'); }}
                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                                <div className="flex-1"></div>
                                {selectedPayments.size > 0 && (
                                    <button
                                        onClick={handleBulkDeletePayments}
                                        className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors animate-in fade-in zoom-in duration-200"
                                    >
                                        <Trash2 size={14} />
                                        Delete ({selectedPayments.size})
                                    </button>
                                )}
                            </div>

                            {project.payments && project.payments.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-400 uppercase bg-slate-50 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                                            <tr>
                                                <th className="px-4 py-2 text-center w-12">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPayments.size === filteredPayments.length && filteredPayments.length > 0}
                                                        onChange={toggleSelectAllPayments}
                                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                    />
                                                </th>
                                                <th className="px-4 py-2 font-bold w-12">#</th>
                                                <th className="px-4 py-2 font-bold min-w-[300px]">Deliverable</th>
                                                <th className="px-4 py-2 font-bold">Phase</th>
                                                <th className="px-4 py-2 font-bold cursor-pointer hover:text-blue-600" onClick={() => handleSort('plan_date')}>Plan Date</th>
                                                <th className="px-4 py-2 font-bold text-center">Docs</th>
                                                <th className="px-4 py-2 font-bold text-right cursor-pointer hover:text-blue-600" onClick={() => handleSort('planned_amount')}>Amount</th>
                                                <th className="px-4 py-2 font-bold text-center">Status</th>
                                                <th className="px-4 py-2 font-bold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {Object.entries(filteredPayments.reduce((groups, payment) => {
                                                const cat = payment.category || 'Other';
                                                if (!groups[cat]) groups[cat] = [];
                                                groups[cat].push(payment);
                                                return groups;
                                            }, {})).map(([category, categoryPayments]) => {
                                                const isExpanded = expandedCategories[category];
                                                const totalAmount = categoryPayments.reduce((sum, p) => sum + (p.planned_amount || 0), 0);

                                                return (
                                                    <React.Fragment key={category}>
                                                        <tr
                                                            className="bg-slate-50 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                                                            onClick={() => toggleCategory(category)}
                                                        >
                                                            <td colSpan="9" className="px-4 py-3">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                                                                            <ChevronRight size={16} />
                                                                        </div>
                                                                        <div className="font-bold text-slate-700 text-sm uppercase tracking-wide">
                                                                            {category}
                                                                            <span className="ml-3 text-xs text-slate-400 font-normal lowercase">({categoryPayments.length} items)</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-sm font-mono font-bold text-slate-700 pr-32">
                                                                        {formatCurrency(totalAmount)}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        {isExpanded && categoryPayments.map((payment, index) => {
                                                            const isOverdue = payment.status !== 'Paid' && new Date(payment.plan_date) < new Date();
                                                            return (
                                                                <tr key={payment.id} className={`transition-colors group border-b border-slate-50 ${isOverdue ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-slate-50'}`}>
                                                                    <td className="px-4 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedPayments.has(payment.id)}
                                                                            onChange={() => toggleSelectPayment(payment.id)}
                                                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                                        />
                                                                    </td>
                                                                    <td className="px-4 py-2 text-slate-400 font-mono text-xs pl-12">{index + 1}</td>
                                                                    <td className="px-4 py-2 font-medium text-slate-800">
                                                                        {payment.deliverable}
                                                                        {payment.remark && <div className="text-[10px] text-slate-400 mt-0.5">{payment.remark}</div>}
                                                                        {isOverdue && <div className="text-[10px] text-red-600 font-bold mt-0.5 animate-pulse">OVERDUE</div>}
                                                                    </td>
                                                                    <td className="px-4 py-2 text-slate-500 whitespace-nowrap">{payment.phase}</td>
                                                                    <td className={`px-4 py-2 font-mono text-xs whitespace-nowrap ${isOverdue ? 'text-red-600 font-bold' : 'text-slate-600'}`}>{formatDate(payment.plan_date)}</td>
                                                                    <td className="px-4 py-2 text-center">
                                                                        {payment.supporting_document ? (
                                                                            <div className="group relative inline-block">
                                                                                <FileText size={16} className="text-blue-500 cursor-help" />
                                                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-[10px] p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                                                                                    {payment.supporting_document}
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-slate-300">-</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-4 py-2 text-slate-800 font-mono text-xs text-right font-medium whitespace-nowrap">{formatCurrency(payment.planned_amount)}</td>
                                                                    <td className="px-4 py-2 text-center">
                                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${payment.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                                            isOverdue ? 'bg-red-100 text-red-700 border border-red-200 shadow-sm' :
                                                                                'bg-slate-100 text-slate-600 border border-slate-200'
                                                                            }`}>
                                                                            {payment.status === 'Paid' && <CheckCircle size={10} className="mr-1" />}
                                                                            {payment.status === 'Paid' ? 'Paid' : isOverdue ? 'NOT PAID' : payment.status}
                                                                        </span>
                                                                    </td>

                                                                    <td className="px-4 py-2 text-right">
                                                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <button onClick={(e) => { e.stopPropagation(); handleEditPayment(payment); }} className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Pencil size={14} /></button>
                                                                            <button onClick={(e) => { e.stopPropagation(); handleDeletePayment(payment.id); }} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-12 text-center text-slate-400">
                                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><DollarSign size={24} /></div>
                                    <h3 className="text-slate-800 font-medium">No Payments Yet</h3>
                                    <p className="text-sm mt-1">Start by adding items to the contract ledger.</p>
                                </div>
                            )}
                        </div>
                    )
                }
                {/* MATTERS TAB (Smart Grid) */}
                {
                    activeTab === 'matters' && (
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Matters Arising</h2>
                                <button
                                    onClick={() => { setEditingMatter(null); resetMatterForm(); setShowMatterModal(true); }}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors shadow-sm"
                                >
                                    <Plus size={14} />
                                    Report Matter
                                </button>
                            </div>
                            {project.matters && project.matters.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-400 uppercase bg-slate-50 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                                            <tr>
                                                <th className="px-4 py-2 font-bold w-24">Date</th>
                                                <th className="px-4 py-2 font-bold min-w-[250px]">Matter</th>
                                                <th className="px-4 py-2 font-bold text-center w-24">Level</th>
                                                <th className="px-4 py-2 font-bold min-w-[300px]">Action / Updates</th>
                                                <th className="px-4 py-2 font-bold w-24">PIC</th>
                                                <th className="px-4 py-2 font-bold text-center w-24">Target</th>
                                                <th className="px-4 py-2 font-bold text-center w-24">Status</th>
                                                <th className="px-4 py-2 font-bold text-center w-16">Edit</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {project.matters.map((matter) => (
                                                <tr key={matter.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-2 text-slate-500 font-mono text-xs whitespace-nowrap">{formatDate(matter.date_raised)}</td>
                                                    <td className="px-4 py-2 font-medium text-slate-800 text-xs">{matter.issue_description}</td>
                                                    <td className="px-4 py-2 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${getLevelColor(matter.level || matter.severity)}`}>
                                                            {matter.level || matter.severity || 'Medium'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 text-slate-600 text-xs">{matter.action_updates || '-'}</td>
                                                    <td className="px-4 py-2 text-slate-600 text-xs">{matter.pic || '-'}</td>
                                                    <td className="px-4 py-2 text-center text-slate-500 text-xs whitespace-nowrap">{formatDate(matter.target_date)}</td>
                                                    <td className="px-4 py-2 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${matter.status === 'Completed' || matter.status === 'Closed'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {matter.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 text-center">
                                                        <button onClick={() => handleEditMatter(matter)} className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Pencil size={14} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-12 text-center text-slate-400">
                                    <p className="text-sm">No matters raised yet.</p>
                                </div>
                            )}
                        </div>
                    )
                }

                {/* TASKS TAB (Smart Grid) */}
                {
                    activeTab === 'tasks' && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Project Schedule</h2>
                                <div className="flex gap-2">
                                    {selectedTasks.size > 0 && (
                                        <button
                                            onClick={handleBulkDeleteTasks}
                                            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors animate-in fade-in zoom-in duration-200"
                                        >
                                            <Trash2 size={14} />
                                            Delete ({selectedTasks.size})
                                        </button>
                                    )}
                                    <button
                                        onClick={downloadTaskTemplate}
                                        className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                        title="Download Excel Template"
                                    >
                                        <Download size={14} />
                                        Template
                                    </button>
                                    <label className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer" title="Import from Excel">
                                        <Upload size={14} />
                                        Import
                                        <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImportTasks} />
                                    </label>
                                    <button
                                        onClick={() => { setEditingTask(null); resetTaskForm(); setShowTaskModal(true); }}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                                    >
                                        <Plus size={14} />
                                        Add Task
                                    </button>
                                </div>
                            </div>

                            {/* View Switcher */}
                            <div className="px-4 py-2 bg-white border-b border-slate-200 flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400 uppercase mr-2">View:</span>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
                                >
                                    List
                                </button>
                                <button
                                    onClick={() => setViewMode('kanban')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'kanban' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
                                >
                                    Kanban
                                </button>
                                <button
                                    onClick={() => setViewMode('timeline')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'timeline' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
                                >
                                    Timeline
                                </button>
                            </div>

                            {viewMode === 'list' && (
                                project.tasks && project.tasks.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-slate-400 uppercase bg-slate-50 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                                                <tr>
                                                    <th className="px-4 py-3 text-center w-12">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedTasks.size === project.tasks.length && project.tasks.length > 0}
                                                            onChange={toggleSelectAll}
                                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                        />
                                                    </th>
                                                    <th className="px-4 py-3 font-bold w-12 text-center">#</th>
                                                    <th className="px-4 py-3 font-bold text-center w-24">Status</th>
                                                    <th className="px-4 py-3 font-bold min-w-[200px]">Task Name</th>
                                                    <th className="px-4 py-3 font-bold text-center w-28">Start</th>
                                                    <th className="px-4 py-3 font-bold text-center w-28">Finish</th>
                                                    <th className="px-4 py-3 font-bold text-center w-28">Completed</th>
                                                    <th className="px-4 py-3 font-bold text-center w-16">Edit</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {(() => {
                                                    const taskMap = {};
                                                    project.tasks.forEach(t => { taskMap[t.id] = { ...t, children: [] }; });
                                                    const roots = [];
                                                    project.tasks.forEach(t => {
                                                        if (t.parent_id && taskMap[t.parent_id]) {
                                                            taskMap[t.parent_id].children.push(taskMap[t.id]);
                                                        } else {
                                                            roots.push(taskMap[t.id]);
                                                        }
                                                    });

                                                    const flattened = [];
                                                    const walk = (node, level = 0) => {
                                                        flattened.push({ ...node, level });
                                                        node.children.forEach(c => walk(c, level + 1));
                                                    };
                                                    roots.forEach(r => walk(r));

                                                    return flattened.map((task, index) => {
                                                        const status = getTaskStatus(task);
                                                        const isSelected = selectedTasks.has(task.id);
                                                        return (
                                                            <tr key={task.id}
                                                                onClick={() => handleTaskClick(task)}
                                                                className={`transition-colors cursor-pointer ${isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-slate-50'}`}>
                                                                <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isSelected}
                                                                        onChange={() => toggleSelect(task.id)}
                                                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-3 text-center text-slate-400 text-xs font-mono">{index + 1}</td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${status.color}`}>
                                                                        {status.label}
                                                                    </span>
                                                                </td>
                                                                <td className={`px-4 py-3 font-medium text-xs ${task.status === 'Completed' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                                                    <div className="flex items-center">
                                                                        {task.level > 0 && <div className="flex mr-2">{Array.from({ length: task.level }).map((_, i) => <div key={i} className="w-4 h-px bg-slate-200 mr-2 self-center" />)}<ChevronRight size={10} className="text-slate-300 mr-1" /></div>}
                                                                        {task.task_name}
                                                                    </div>
                                                                    {task.subtasks && task.subtasks.length > 0 && (
                                                                        <span className="ml-2 text-[10px] bg-slate-100 px-1.5 rounded text-slate-500 border border-slate-200">
                                                                            {task.subtasks.filter(t => t.status === 'Completed').length}/{task.subtasks.length}
                                                                        </span>
                                                                    )}
                                                                    {task.assigned_to && (
                                                                        <div className="flex items-center gap-1 mt-1">
                                                                            <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[8px] font-bold">
                                                                                {task.assigned_to.charAt(0)}
                                                                            </div>
                                                                            <span className="text-[10px] text-slate-500">{task.assigned_to}</span>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-center text-slate-500 font-mono text-xs whitespace-nowrap">{formatDate(task.start_date)}</td>
                                                                <td className="px-4 py-3 text-center text-slate-500 font-mono text-xs whitespace-nowrap">{formatDate(task.end_date)}</td>
                                                                <td className="px-4 py-3 text-center text-slate-500 font-mono text-xs whitespace-nowrap">{task.completion_date ? formatDate(task.completion_date) : '-'}</td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <button onClick={(e) => { e.stopPropagation(); handleEditTask(task); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    });
                                                })()}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-12 text-center text-slate-400">
                                        <p className="text-sm">No tasks scheduled yet.</p>
                                    </div>
                                )
                            )}

                            {viewMode === 'kanban' && (
                                <div className="p-6 bg-slate-100 overflow-x-auto min-h-[600px]">
                                    <KanbanBoard
                                        tasks={project.tasks}
                                        onTaskUpdate={fetchProjectDetails}
                                        onTaskClick={handleTaskClick}
                                    />
                                </div>
                            )}

                            {viewMode === 'timeline' && (
                                <div className="p-6 bg-slate-100 overflow-x-auto min-h-[600px]">
                                    <TaskTimeline
                                        tasks={project.tasks}
                                        onTaskClick={handleTaskClick}
                                    />
                                </div>
                            )}
                        </div>
                    )
                }
            </main >

            {
                showPaymentModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => {
                        setShowPaymentModal(false);
                        setEditingPayment(null);
                        resetPaymentForm();
                    }}>
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
                            <h2 className="text-2xl font-bold text-slate-800 mb-6">
                                {editingPayment ? 'Edit Payment' : 'Add Payment'}
                            </h2>
                            <form onSubmit={handleAddPayment} className="space-y-4">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="category"
                                                value="Project Implementation"
                                                checked={paymentForm.category === 'Project Implementation'}
                                                onChange={(e) => setPaymentForm({ ...paymentForm, category: e.target.value })}
                                                className="text-blue-600"
                                            />
                                            <span className="text-sm text-slate-700">Project Implementation</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="category"
                                                value="Support & Maintenance"
                                                checked={paymentForm.category === 'Support & Maintenance'}
                                                onChange={(e) => setPaymentForm({ ...paymentForm, category: e.target.value })}
                                                className="text-blue-600"
                                            />
                                            <span className="text-sm text-slate-700">Support & Maintenance</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="category"
                                                value="Other"
                                                checked={paymentForm.category === 'Other'}
                                                onChange={(e) => setPaymentForm({ ...paymentForm, category: e.target.value })}
                                                className="text-blue-600"
                                            />
                                            <span className="text-sm text-slate-700">Other</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Deliverable</label>
                                        <input
                                            type="text"
                                            value={paymentForm.deliverable}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, deliverable: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Phase</label>
                                        <input
                                            type="text"
                                            value={paymentForm.phase}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, phase: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Plan Date</label>
                                        <input
                                            type="date"
                                            value={paymentForm.plan_date}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, plan_date: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Amount (RM)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={paymentForm.planned_amount}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, planned_amount: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mt-2 mb-4 text-xs text-slate-500 italic">
                                    * Paid Amount will be auto-set based on Status.
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                                        <select
                                            value={paymentForm.status}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        >
                                            <option value="Not Paid">Not Paid</option>
                                            <option value="Paid">Paid</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Payment Date (Optional)</label>
                                        <input
                                            type="date"
                                            value={paymentForm.payment_date}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Remark (Optional)</label>
                                    <textarea
                                        value={paymentForm.remark}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, remark: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        rows="2"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">PO Number (Optional)</label>
                                        <input
                                            type="text"
                                            value={paymentForm.po_number}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, po_number: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Invoice Number (Optional)</label>
                                        <input
                                            type="text"
                                            value={paymentForm.invoice_number}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, invoice_number: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Supporting Documents</label>
                                    <textarea
                                        value={paymentForm.supporting_document}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, supporting_document: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="Enter document names or URLs (one per line)..."
                                        rows="3"
                                    />
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPaymentModal(false);
                                            setEditingPayment(null);
                                            resetPaymentForm();
                                        }}
                                        className="flex-1 px-4 py-3 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                    >
                                        {editingPayment ? 'Update Payment' : 'Add Payment'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div >
                )
            }

            {/* Matter Modal */}
            {
                showMatterModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowMatterModal(false)}>
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
                            <h2 className="text-2xl font-bold text-slate-800 mb-6">
                                {editingMatter ? 'Edit Matter' : 'Report Matter'}
                            </h2>
                            <form onSubmit={handleAddMatter} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Date Raised</label>
                                        <input
                                            type="date"
                                            value={matterForm.date_raised}
                                            onChange={(e) => setMatterForm({ ...matterForm, date_raised: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Level</label>
                                        <select
                                            value={matterForm.level}
                                            onChange={(e) => setMatterForm({ ...matterForm, level: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        >
                                            <option value="MANCOM">MANCOM (Management Committee)</option>
                                            <option value="TBC">TBC (Tender Board Committee)</option>
                                            <option value="BOD">BOD (Board of Directors)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Matter Arising (Description)</label>
                                    <textarea
                                        value={matterForm.issue_description}
                                        onChange={(e) => setMatterForm({ ...matterForm, issue_description: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        rows="3"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Action Required / Updated</label>
                                    <textarea
                                        value={matterForm.action_updates}
                                        onChange={(e) => setMatterForm({ ...matterForm, action_updates: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        rows="4"
                                        placeholder="Log actions and updates here..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Person In Charge (PIC)</label>
                                        <input
                                            type="text"
                                            value={matterForm.pic}
                                            onChange={(e) => setMatterForm({ ...matterForm, pic: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Target Date</label>
                                        <input
                                            type="date"
                                            value={matterForm.target_date}
                                            onChange={(e) => setMatterForm({ ...matterForm, target_date: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                                        <select
                                            value={matterForm.status}
                                            onChange={(e) => setMatterForm({ ...matterForm, status: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        >
                                            <option value="Open">Open</option>
                                            <option value="Closed">Closed</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Date Closed</label>
                                        <input
                                            type="date"
                                            value={matterForm.date_closed}
                                            onChange={(e) => setMatterForm({ ...matterForm, date_closed: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            disabled={matterForm.status === 'Open'}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Remarks</label>
                                    <input
                                        type="text"
                                        value={matterForm.remarks}
                                        onChange={(e) => setMatterForm({ ...matterForm, remarks: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowMatterModal(false);
                                            setEditingMatter(null);
                                            resetMatterForm();
                                        }}
                                        className="flex-1 px-4 py-3 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                    >
                                        {editingMatter ? 'Update Matter' : 'Report Matter'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Task Detail Modal */}
            <TaskDetailModal
                isOpen={showTaskDetailModal}
                onClose={() => setShowTaskDetailModal(false)}
                task={selectedTask}
                projectMembers={project ? project.computed_team_members : []}
                onUpdate={() => {
                    fetchProjectDetails();
                    setShowTaskDetailModal(false);
                }}
            />

            {/* Task Modal */}
            {
                showTaskModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowTaskModal(false)}>
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
                            <h2 className="text-2xl font-bold text-slate-800 mb-6">Add Task</h2>
                            <form onSubmit={handleAddTask} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Task Name</label>
                                    <input
                                        type="text"
                                        value={taskForm.task_name}
                                        onChange={(e) => setTaskForm({ ...taskForm, task_name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                                        <input
                                            type="date"
                                            value={taskForm.start_date}
                                            onChange={(e) => {
                                                const newStartDate = e.target.value;
                                                // If new start date is after current end date, clear end date
                                                let newEndDate = taskForm.end_date;
                                                if (newEndDate && newEndDate < newStartDate) {
                                                    newEndDate = '';
                                                }
                                                setTaskForm({ ...taskForm, start_date: newStartDate, end_date: newEndDate });
                                            }}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">End Date (Finish)</label>
                                        <input
                                            type="date"
                                            value={taskForm.end_date}
                                            min={taskForm.start_date} // Validation: Cannot be earlier than Start Date
                                            onChange={(e) => setTaskForm({ ...taskForm, end_date: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                </div>


                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                                        <select
                                            value={taskForm.status}
                                            onChange={(e) => {
                                                const newStatus = e.target.value;
                                                setTaskForm({
                                                    ...taskForm,
                                                    status: newStatus,
                                                    // Auto-set completion date if Completed and not set
                                                    completion_date: newStatus === 'Completed' && !taskForm.completion_date
                                                        ? new Date().toISOString().split('T')[0]
                                                        : taskForm.completion_date
                                                });
                                            }}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        >
                                            <option value="Not Started">Not Started</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Delayed">Delayed</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </div>
                                    {taskForm.status === 'Completed' && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Completed Date</label>
                                            <input
                                                type="date"
                                                value={taskForm.completion_date}
                                                onChange={(e) => setTaskForm({ ...taskForm, completion_date: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                required
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-slate-700 mb-2 font-bold flex items-center gap-2">
                                        <ChevronRight size={14} className="text-blue-500" />
                                        Parent Task (Optional)
                                    </label>
                                    <select
                                        value={taskForm.parent_id || ''}
                                        onChange={(e) => setTaskForm({ ...taskForm, parent_id: e.target.value ? parseInt(e.target.value) : null })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                    >
                                        <option value="">None (Primary Task)</option>
                                        {project?.tasks?.filter(t => !editingTask || t.id !== editingTask.id).map(t => (
                                            <option key={t.id} value={t.id}>{t.task_name}</option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-[10px] text-slate-400">Select a parent task to create a sub-task relationship.</p>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowTaskModal(false);
                                            setEditingTask(null);
                                            resetTaskForm();
                                        }}
                                        className="flex-1 px-4 py-3 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                    >
                                        {editingTask ? 'Update Task' : 'Add Task'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
            {/* Delete Confirmation Modal */}
            {
                deleteConfirmation && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <div className="flex items-center gap-4 mb-4 text-red-600">
                                <AlertCircle size={32} />
                                <h3 className="text-xl font-bold">Confirm Deletion</h3>
                            </div>
                            <p className="text-slate-600 mb-6">
                                {deleteConfirmation.type === 'bulk-tasks'
                                    ? `Are you sure you want to delete these ${selectedTasks.size} tasks?`
                                    : deleteConfirmation.type === 'bulk-payments'
                                        ? `Are you sure you want to delete these ${selectedPayments.size} payments?`
                                        : `Are you sure you want to delete this ${deleteConfirmation.type}?`
                                } This action cannot be undone.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setDeleteConfirmation(null)}
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Edit Project Modal */}
            <NewProjectModal
                isOpen={showEditProjectModal}
                onClose={() => setShowEditProjectModal(false)}
                onSuccess={fetchProjectDetails}
                editMode={true}
                projectData={project}
            />
        </div >
    );
};

export default ProjectDetails;
