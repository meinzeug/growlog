import { useState, useEffect } from 'react';
import api from '../lib/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, Circle, Moon, Sun } from 'lucide-react';
import { clsx } from 'clsx';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Form';
import { useForm } from 'react-hook-form';

export const Tasks = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [tasks, setTasks] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'calendar' | 'kanban'>('calendar');

    const { register, handleSubmit, reset } = useForm();

    const days = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
    });

    // Calculate padding days for grid alignment
    const startDay = startOfMonth(currentDate).getDay(); // 0 is Sunday
    const paddingDays = Array(startDay === 0 ? 6 : startDay - 1).fill(null); // Adjust for Monday start

    const fetchTasks = async () => {
        try {
            const res = await api.get('/tasks', {
                params: {
                    from: startOfMonth(currentDate).toISOString(),
                    to: endOfMonth(currentDate).toISOString()
                }
            });
            setTasks(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [currentDate]);

    const toggleTask = async (id: string, currentStatus: string) => {
        try {
            if (currentStatus === 'DONE') return; // already done
            await api.post(`/tasks/${id}/complete`);
            fetchTasks();
        } catch (e) {
            console.error(e);
        }
    };

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            await api.post('/tasks', {
                ...data,
                due_at: new Date(data.due_at).toISOString()
            });
            fetchTasks();
            setIsModalOpen(false);
            reset();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const getTasksForDay = (day: Date) => {
        return tasks.filter(task => isSameDay(new Date(task.due_at), day));
    };

    // Moon Phase Calculation
    const getMoonData = (date: Date) => {
        const synodic = 29.53058867;
        const knownNewMoon = new Date('2000-01-06T18:14:00').getTime();
        const diff = date.getTime() - knownNewMoon;
        const days = diff / (1000 * 60 * 60 * 24);
        const cycle = days % synodic;
        const age = cycle < 0 ? cycle + synodic : cycle;

        let phase = '';
        let icon = Moon;
        let recommendation = '';

        if (age < 1.8) { phase = 'New Moon'; recommendation = 'Good for planting above-ground crops.'; }
        else if (age < 7.4) { phase = 'Waxing Crescent'; recommendation = 'Focus on leaf growth.'; }
        else if (age < 9.2) { phase = 'First Quarter'; recommendation = 'Good time for fertilization.'; }
        else if (age < 14.8) { phase = 'Waxing Gibbous'; recommendation = 'Approaching full energy.'; }
        else if (age < 16.6) { phase = 'Full Moon'; recommendation = 'Highest sap flow. Avoid pruning.'; }
        else if (age < 22.1) { phase = 'Waning Gibbous'; recommendation = 'Focus on root development.'; }
        else if (age < 24.0) { phase = 'Last Quarter'; recommendation = 'Weeding and soil prep.'; }
        else { phase = 'Waning Crescent'; recommendation = 'Rest period for plants.'; }

        return { age, phase, recommendation, icon };
    };

    const moonData = getMoonData(new Date());

    return (
        <div className="space-y-6 h-full">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Calendar</h1>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'calendar' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setViewMode('calendar')}
                    >
                        Calendar
                    </button>
                    <button
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'kanban' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setViewMode('kanban')}
                    >
                        Board
                    </button>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus size={20} />
                    <span>New Task</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 hide-scrollbar">
                {['All', 'Feeding', 'Environment', 'Training', 'Maintenance', 'IPM'].map(filter => (
                    <button key={filter} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-green-500 hover:text-green-600 whitespace-nowrap">
                        {filter}
                    </button>
                ))}
            </div>

            {viewMode === 'kanban' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-hidden">
                    {/* Todo Column */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-700">To Do</h3>
                            <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full font-bold">3</span>
                        </div>
                        <div className="space-y-3 flex-1 overflow-y-auto">
                            <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 cursor-move hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">Feeding</span>
                                    <span className="text-[10px] text-slate-400">Today</span>
                                </div>
                                <h4 className="font-bold text-slate-900 text-sm mb-1">Nutrient Mix A</h4>
                                <p className="text-xs text-slate-500">2.5L Water + CalMag</p>
                            </div>
                            <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 cursor-move hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded">Environment</span>
                                    <span className="text-[10px] text-red-400 font-bold">Overdue</span>
                                </div>
                                <h4 className="font-bold text-slate-900 text-sm mb-1">Check pH Pen</h4>
                                <p className="text-xs text-slate-500">Calibration needed</p>
                            </div>
                        </div>
                    </div>

                    {/* In Progress */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-700">In Progress</h3>
                            <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full font-bold">1</span>
                        </div>
                        <div className="space-y-3 flex-1 overflow-y-auto">
                            <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 cursor-move hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold bg-green-50 text-green-600 px-1.5 py-0.5 rounded">Training</span>
                                    <span className="text-[10px] text-slate-400">Now</span>
                                </div>
                                <h4 className="font-bold text-slate-900 text-sm mb-1">LST - Plant #4</h4>
                                <p className="text-xs text-slate-500">Tie down main stem</p>
                            </div>
                        </div>
                    </div>

                    {/* Done */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-700">Done</h3>
                            <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full font-bold">12</span>
                        </div>
                        <div className="space-y-3 flex-1 overflow-y-auto opacity-60">
                            <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 cursor-default">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Cleaning</span>
                                    <span className="text-[10px] text-slate-400">Yesterday</span>
                                </div>
                                <h4 className="font-bold text-slate-900 text-sm mb-1 line-through">Clean Res</h4>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // Existing Calendar Grid wrapper (fragment start)
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Main Calendar Area - 8 Columns */}
                    <div className="lg:col-span-8 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <button onClick={() => setCurrentDate(curr => new Date(curr.getFullYear(), curr.getMonth() - 1, 1))} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                                <ChevronLeft size={24} className="text-slate-600" />
                            </button>
                            <h2 className="text-xl font-bold text-slate-900">
                                {format(currentDate, 'MMMM yyyy')}
                            </h2>
                            <button onClick={() => setCurrentDate(curr => new Date(curr.getFullYear(), curr.getMonth() + 1, 1))} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                                <ChevronRight size={24} className="text-slate-600" />
                            </button>
                        </div>

                        {/* Grid Header */}
                        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                <div key={day} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Grid Body */}
                        <div className="grid grid-cols-7 min-h-[600px] bg-white">
                            {paddingDays.map((_, i) => (
                                <div key={`pad-${i}`} className="border-b border-r border-slate-50 bg-slate-50/20" />
                            ))}
                            {days.map(day => {
                                const dayTasks = getTasksForDay(day);
                                const isTodayDate = isToday(day);
                                return (
                                    <div
                                        key={day.toISOString()}
                                        className={clsx(
                                            "border-b border-r border-slate-50 p-2 min-h-[120px] transition-colors relative group",
                                            isTodayDate ? "bg-green-50/30" : "hover:bg-slate-50"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={clsx(
                                                "text-sm font-semibold inline-block w-7 h-7 flex items-center justify-center rounded-full",
                                                isTodayDate ? "bg-green-600 text-white" : "text-slate-400 group-hover:text-slate-600"
                                            )}>
                                                {format(day, 'd')}
                                            </span>
                                        </div>

                                        <div className="space-y-1.5">
                                            {dayTasks.map(task => (
                                                <div
                                                    key={task.id}
                                                    onClick={() => toggleTask(task.id, task.status)}
                                                    className={clsx(
                                                        "text-[10px] px-2 py-1.5 rounded-md cursor-pointer flex items-center space-x-1.5 truncate transition-all border",
                                                        task.status === 'DONE'
                                                            ? "bg-slate-100 text-slate-400 border-transparent line-through decoration-slate-400"
                                                            : "bg-white text-slate-700 border-slate-100 hover:border-green-200 hover:shadow-sm"
                                                    )}
                                                >
                                                    <div className={clsx("w-1.5 h-1.5 rounded-full shrink-0", task.type === 'FEED' ? 'bg-blue-400' : 'bg-green-400')} />
                                                    <span className="truncate font-medium">{task.title}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Add task shortcut on hover? */}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Sidebar - Widgets */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Moon Phase Widget */}
                        <div className="bg-[#1A2F2B] text-white p-6 rounded-3xl relative overflow-hidden shadow-lg">
                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-white/90">Moon Phase</h3>
                                        <p className="text-sm text-green-400 font-medium">{moonData.phase}</p>
                                    </div>
                                    <Moon size={32} className="text-green-300" />
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <span className="text-xs text-slate-400 uppercase tracking-wider">Planter's Tip</span>
                                        <p className="font-medium text-white/80 leading-snug mt-1">
                                            {moonData.recommendation}
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-white/10 flex items-center gap-4 text-xs text-white/60">
                                        <div className="flex items-center gap-1.5">
                                            <Sun size={14} />
                                            <span>Sunrise 06:42</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Moon size={14} />
                                            <span>Sunset 20:15</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Background Decor */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                        </div>

                        {/* Upcoming Tasks Widget */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Upcoming</h3>

                            {tasks.filter(t => t.status !== 'DONE').length > 0 ? (
                                <div className="space-y-3">
                                    {tasks.filter(t => t.status !== 'DONE').slice(0, 5).map(task => (
                                        <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                            <div className="bg-white p-2 rounded-lg shadow-sm text-green-600">
                                                <Circle size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-700 truncate">{task.title}</p>
                                                <p className="text-xs text-slate-400">
                                                    {format(new Date(task.due_at), 'MMM d, h:mm a')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-400 text-sm">
                                    <CheckCircle2 size={32} className="mx-auto mb-2 opacity-50" />
                                    <p>All caught up!</p>
                                </div>
                            )}

                            <button onClick={() => setIsModalOpen(true)} className="w-full mt-4 py-3 text-sm font-bold text-green-700 bg-green-50 hover:bg-green-100 rounded-xl transition-colors">
                                Add New Task
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reuse existing modal logic */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Task"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Task Title"
                        placeholder="e.g. Water Plants"
                        {...register('title', { required: true })}
                    />

                    <Input
                        type="datetime-local"
                        label="Due Date"
                        {...register('due_at', { required: true })}
                        defaultValue={new Date().toISOString().slice(0, 16)}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                            <select
                                {...register('repeat_rule')}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="">One-time</option>
                                <option value="DAILY">Daily</option>
                                <option value="EVERY_3_DAYS">Every 3 Days</option>
                                <option value="WEEKLY">Weekly</option>
                                <option value="MONTHLY">Monthly</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                            <select
                                {...register('priority')}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="MEDIUM">Normal</option>
                                <option value="HIGH">High</option>
                                <option value="LOW">Low</option>
                            </select>
                        </div>
                    </div>

                    {/* Could add Type selector here later */}

                    <div className="pt-2 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
                        >
                            {loading ? 'Adding...' : 'Add Task'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div >
    );
};
