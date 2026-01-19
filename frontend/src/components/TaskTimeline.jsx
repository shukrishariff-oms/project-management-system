import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TaskTimeline = ({ tasks, onTaskClick }) => {
    // 1. Calculate Timeline Range
    const { minDate, maxDate, totalDays } = useMemo(() => {
        if (!tasks || tasks.length === 0) {
            const now = new Date();
            return { minDate: now, maxDate: now, totalDays: 1 };
        }

        let min = new Date();
        let max = new Date();
        let hasValidDates = false;

        tasks.forEach(t => {
            if (t.start_date) {
                const s = new Date(t.start_date);
                if (!hasValidDates || s < min) min = s;
                hasValidDates = true;
            }
            if (t.end_date) {
                const e = new Date(t.end_date);
                if (!hasValidDates || e > max) max = e;
                hasValidDates = true;
            }
        });

        // Add padding (buffer)
        min.setDate(min.getDate() - 7);
        max.setDate(max.getDate() + 14);

        const diffTime = Math.abs(max - min);
        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return { minDate: min, maxDate: max, totalDays };
    }, [tasks]);

    // 2. Constants for rendering
    const DAY_WIDTH = 40; // width per day in pixels
    const HEADER_HEIGHT = 50;
    const ROW_HEIGHT = 48;

    // 3. Helper to get position
    const getPosition = (dateStr) => {
        if (!dateStr) return 0;
        const date = new Date(dateStr);
        const diff = Math.ceil((date - minDate) / (1000 * 60 * 60 * 24));
        return diff * DAY_WIDTH;
    };

    const getDurationWidth = (start, end) => {
        if (!start || !end) return DAY_WIDTH; // Default width
        const s = new Date(start);
        const e = new Date(end);
        const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
        return Math.max(diff, 1) * DAY_WIDTH;
    };

    // 4. Generate Calendar Header
    const calendarDays = useMemo(() => {
        const days = [];
        for (let i = 0; i < totalDays; i++) {
            const d = new Date(minDate);
            d.setDate(d.getDate() + i);
            days.push(d);
        }
        return days;
    }, [minDate, totalDays]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-500 hover:bg-green-600';
            case 'In Progress': return 'bg-blue-500 hover:bg-blue-600';
            case 'Delayed': return 'bg-red-500 hover:bg-red-600';
            default: return 'bg-slate-400 hover:bg-slate-500';
        }
    };

    if (!tasks || tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-lg border border-slate-200 border-dashed text-slate-400">
                <p>No scheduled tasks to display.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wide">Project Timeline</h3>
                <div className="text-xs text-slate-500">
                    Showing {minDate.toLocaleDateString()} - {maxDate.toLocaleDateString()}
                </div>
            </div>

            <div className="overflow-auto flex-1 relative">
                <div
                    className="relative min-w-full"
                    style={{ width: `${totalDays * DAY_WIDTH + 250}px` }} // +250 for sidebar text
                >
                    {/* Header Row */}
                    <div className="flex sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm" style={{ height: HEADER_HEIGHT }}>
                        <div className="min-w-[250px] sticky left-0 z-30 bg-white border-r border-slate-200 flex items-center px-4 font-bold text-slate-600 text-sm">
                            Task Name
                        </div>
                        <div className="flex">
                            {calendarDays.map((date, i) => (
                                <div
                                    key={i}
                                    className={`flex-shrink-0 border-r border-slate-100 flex flex-col justify-center items-center text-[10px] text-slate-500 ${date.getDate() === 1 ? 'bg-slate-50 font-bold' : ''}`}
                                    style={{ width: DAY_WIDTH }}
                                >
                                    <span>{date.getDate()}</span>
                                    {date.getDate() === 1 && <span className="text-[9px] uppercase">{date.toLocaleDateString(undefined, { month: 'short' })}</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Task Rows */}
                    <div>
                        {tasks.map((task, index) => {
                            const left = getPosition(task.start_date);
                            const width = getDurationWidth(task.start_date, task.end_date);

                            return (
                                <div key={task.id} className="flex border-b border-slate-50 hover:bg-slate-50 transition-colors" style={{ height: ROW_HEIGHT }}>
                                    {/* Sticky Sidebar */}
                                    <div className="min-w-[250px] sticky left-0 z-10 bg-white border-r border-slate-200 flex items-center px-4 text-sm font-medium text-slate-700 truncate group">
                                        <span className="truncate w-full cursor-pointer hover:text-blue-600" onClick={() => onTaskClick(task)}>
                                            {task.task_name}
                                        </span>
                                    </div>

                                    {/* Timeline Bar */}
                                    <div className="flex-1 relative bg-slate-50/20">
                                        {/* Grid Lines Background */}
                                        <div className="absolute inset-0 flex pointer-events-none">
                                            {calendarDays.map((_, i) => (
                                                <div key={i} className="border-r border-slate-100 flex-shrink-0 h-full" style={{ width: DAY_WIDTH }}></div>
                                            ))}
                                        </div>

                                        {/* Task Bar */}
                                        {task.start_date && (
                                            <div
                                                onClick={() => onTaskClick(task)}
                                                className={`absolute top-2.5 h-7 rounded-md cursor-pointer shadow-sm flex items-center px-2 text-white text-xs truncate transition-all opacity-80 hover:opacity-100 z-10 ${getStatusColor(task.status)}`}
                                                style={{
                                                    left: `${left}px`,
                                                    width: `${width}px`
                                                }}
                                                title={`${task.task_name} (${task.start_date} - ${task.end_date})`}
                                            >
                                                {width > 60 && task.task_name}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskTimeline;
