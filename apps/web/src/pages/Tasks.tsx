import { useState, useEffect } from 'react';
import api from '../lib/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, Circle } from 'lucide-react';
import { clsx } from 'clsx';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Form';
import { useForm } from 'react-hook-form';

export const Tasks = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [tasks, setTasks] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Calendar & Tasks</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                    <Plus size={20} />
                    <span>New Task</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <button onClick={() => setCurrentDate(curr => new Date(curr.getFullYear(), curr.getMonth() - 1, 1))} className="p-2 hover:bg-slate-50 rounded-full">
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className="text-lg font-bold text-slate-900">
                        {format(currentDate, 'MMMM yyyy')}
                    </h2>
                    <button onClick={() => setCurrentDate(curr => new Date(curr.getFullYear(), curr.getMonth() + 1, 1))} className="p-2 hover:bg-slate-50 rounded-full">
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Grid Header */}
                <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grid Body */}
                <div className="grid grid-cols-7 min-h-[500px]">
                    {paddingDays.map((_, i) => (
                        <div key={`pad-${i}`} className="border-b border-r border-slate-50 bg-slate-50/30" />
                    ))}
                    {days.map(day => {
                        const dayTasks = getTasksForDay(day);
                        return (
                            <div
                                key={day.toISOString()}
                                className={clsx(
                                    "border-b border-r border-slate-50 p-2 min-h-[100px] hover:bg-slate-50/50 transition-colors group relative",
                                    isToday(day) && "bg-blue-50/30"
                                )}
                            >
                                <span className={clsx(
                                    "text-sm font-medium inline-block w-7 h-7 flex items-center justify-center rounded-full mb-2",
                                    isToday(day) ? "bg-blue-600 text-white" : "text-slate-700"
                                )}>
                                    {format(day, 'd')}
                                </span>

                                <div className="space-y-1">
                                    {dayTasks.map(task => (
                                        <div
                                            key={task.id}
                                            onClick={() => toggleTask(task.id, task.status)}
                                            className={clsx(
                                                "text-xs px-2 py-1 rounded cursor-pointer flex items-center space-x-1 truncate transition-all",
                                                task.status === 'DONE'
                                                    ? "bg-green-100 text-green-700 line-through opacity-70"
                                                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                            )}
                                        >
                                            {task.status === 'DONE' ? <CheckCircle2 size={10} /> : <Circle size={10} />}
                                            <span className="truncate">{task.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

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
        </div>
    );
};
