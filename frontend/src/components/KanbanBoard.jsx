import React, { useState } from 'react';
import { DndContext, DragOverlay, useDraggable, useDroppable, closestCorners } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, Plus, Clock, User } from 'lucide-react';
import api from '../api';

const KanbanBoard = ({ tasks, onTaskUpdate, onTaskClick }) => {
    // Group tasks by status
    const columns = ['Not Started', 'In Progress', 'Completed', 'Delayed'];

    // Helper to get items for a column
    const getTasksByStatus = (status) => tasks.filter(task => task.status === status);

    const [activeId, setActiveId] = useState(null);

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id; // This could be a container (status) or another task

        // Find the task object
        const task = tasks.find(t => t.id === activeId);
        if (!task) return;

        // Determine new status
        let newStatus = task.status;

        // If dropped on a container (column)
        if (columns.includes(overId)) {
            newStatus = overId;
        } else {
            // If dropped on another task, find that task's status
            const overTask = tasks.find(t => t.id === overId);
            if (overTask) {
                newStatus = overTask.status;
            }
        }

        if (newStatus !== task.status) {
            // Optimistic update locally? 
            // Ideally we call parent to update, but to prevent jumpiness we might want local state.
            // For now, let's just trigger the API and parent update.
            try {
                await api.put(`/api/projects/${task.project_id}/task/${task.id}`, {
                    ...task,
                    status: newStatus
                });
                onTaskUpdate(); // Refresh data
            } catch (error) {
                console.error("Failed to move task", error);
            }
        }
    };

    return (
        <DndContext
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-6 overflow-x-auto pb-4 h-full min-h-[500px]">
                {columns.map(status => (
                    <DroppableColumn
                        key={status}
                        status={status}
                        tasks={getTasksByStatus(status)}
                        onTaskClick={onTaskClick}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeId ? (
                    <TaskCard task={tasks.find(t => t.id === activeId)} isOverlay />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

const DroppableColumn = ({ status, tasks, onTaskClick }) => {
    const { setNodeRef } = useDroppable({
        id: status,
    });

    const getStatusColor = (s) => {
        switch (s) {
            case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Delayed': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div ref={setNodeRef} className="flex-1 min-w-[280px] bg-slate-50/50 rounded-xl flex flex-col h-full border border-slate-100">
            {/* Header */}
            <div className={`p-3 rounded-t-xl border-b flex justify-between items-center ${getStatusColor(status)} bg-opacity-30`}>
                <h3 className="font-bold text-sm uppercase tracking-wide">{status}</h3>
                <span className="bg-white/50 px-2 py-0.5 rounded text-xs font-bold">{tasks.length}</span>
            </div>

            {/* Content */}
            <div className="p-3 flex-1 space-y-3 overflow-y-auto">
                {tasks.map(task => (
                    <DraggableTask key={task.id} task={task} onClick={() => onTaskClick(task)} />
                ))}
                {tasks.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-300 text-xs">
                        Drop here
                    </div>
                )}
            </div>
        </div>
    );
};

const DraggableTask = ({ task, onClick }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={onClick}
            className={`bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group ${isDragging ? 'opacity-50' : 'opacity-100'}`}
        >
            <TaskCard task={task} />
        </div>
    );
};

// Separated Card for Overlay re-use
const TaskCard = ({ task, isOverlay }) => {
    const getPriorityColor = (p) => {
        switch (p) {
            case 'High': return 'bg-red-50 text-red-600 border-red-100';
            case 'Medium': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'Low': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    return (
        <div className={`space-y-3 ${isOverlay ? 'bg-white p-4 rounded-lg shadow-xl ring-2 ring-blue-500 rotate-2 cursor-grabbing' : ''}`}>
            <div className="flex justify-between items-start">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                    {task.priority || 'Normal'}
                </span>
                {isOverlay ? null : (
                    <button className="text-slate-300 hover:text-slate-500">
                        <MoreHorizontal size={14} />
                    </button>
                )}
            </div>

            <h4 className="font-bold text-slate-700 text-sm leading-snug">{task.task_name}</h4>

            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                <div className="flex items-center gap-1 text-slate-400 text-xs">
                    {task.assigned_to ? (
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[9px] font-bold" title={task.assigned_to}>
                            {task.assigned_to.charAt(0)}
                        </div>
                    ) : (
                        <User size={14} />
                    )}
                </div>
                {task.end_date && (
                    <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                        <Clock size={12} />
                        {new Date(task.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default KanbanBoard;
