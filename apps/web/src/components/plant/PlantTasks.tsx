
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { CheckCircle, Circle, Clock, Plus, Calendar, Trash2 } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/Form';
import { useForm } from 'react-hook-form';
import clsx from 'clsx';

interface PlantTasksProps {
    plantId: string;
}

export const PlantTasks = ({ plantId }: PlantTasksProps) => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            title: '',
            due_at: new Date().toISOString().split('T')[0],
            // time: '09:00', // could add time later
            repeat_rule: '',
            notify: false
        }
    });

    const fetchTasks = async () => {
        try {
            const res = await api.get(`/tasks?plantId=${plantId}`);
            setTasks(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [plantId]);

    const onSubmit = async (data: any) => {
        setSubmitting(true);
        try {
            // Combine date and default time for simplicity
            const dueAt = new Date(`${data.due_at}T09:00:00`).toISOString();

            await api.post('/tasks', {
                plant_id: plantId,
                title: data.title,
                due_at: dueAt,
                repeat_rule: data.repeat_rule || undefined,
                notify: !!data.notify
            });
            await fetchTasks();
            setIsModalOpen(false);
            reset();
        } catch (e) {
            console.error(e);
            alert('Failed to create task');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleTask = async (taskId: string, status: string) => {
        if (status === 'DONE') return; // already done
        try {
            await api.post(`/tasks/${taskId}/complete`);
            fetchTasks(); // refresh to show update
        } catch (e) {
            console.error(e);
        }
    };

    const deleteTask = async (taskId: string) => {
        if (!confirm('Delete this task?')) return;
        try {
            await api.delete(`/tasks/${taskId}`);
            setTasks(prev => prev.filter(t => t.id !== taskId));
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="text-center py-8 text-slate-400">Loading tasks...</div>;

    const openTasks = tasks.filter(t => t.status === 'OPEN');
    const completedTasks = tasks.filter(t => t.status !== 'OPEN');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
                <h3 className="font-bold text-slate-900">Task List</h3>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                    <Plus size={16} />
                    <span>Add Task</span>
                </button>
            </div>

            <div className="space-y-3">
                {openTasks.length === 0 && completedTasks.length === 0 && (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="font-medium text-slate-600">No tasks planned.</p>
                        <p className="text-sm text-slate-400 mt-1">Stay organized by scheduling watering and feeding.</p>
                    </div>
                )}

                {openTasks.map(task => (
                    <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => toggleTask(task.id, task.status)}
                                className="text-slate-300 hover:text-green-500 transition-colors"
                            >
                                <Circle size={24} />
                            </button>
                            <div>
                                <h4 className="font-medium text-slate-900">{task.title}</h4>
                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                    <span className={clsx("flex items-center gap-1",
                                        isPast(new Date(task.due_at)) && !isToday(new Date(task.due_at)) ? "text-red-500 font-medium" :
                                            isToday(new Date(task.due_at)) ? "text-orange-500 font-medium" : ""
                                    )}>
                                        <Clock size={12} />
                                        {isToday(new Date(task.due_at)) ? 'Today' : format(new Date(task.due_at), 'MMM d')}
                                    </span>
                                    {task.repeat_rule && (
                                        <span className="bg-slate-100 px-1.5 py-0.5 rounded">Repeats</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button onClick={() => deleteTask(task.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}

                {completedTasks.length > 0 && (
                    <div className="pt-4 border-t border-slate-100">
                        <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Completed</h4>
                        <div className="space-y-2 opacity-60">
                            {completedTasks.map(task => (
                                <div key={task.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50">
                                    <CheckCircle size={20} className="text-green-500" />
                                    <span className="text-slate-600 text-sm line-through">{task.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Task">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Task Title"
                        placeholder="e.g. Water and Feed"
                        {...register('title', { required: true })}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            type="date"
                            label="Due Date"
                            {...register('due_at')}
                        />
                        <Select
                            label="Repeat"
                            {...register('repeat_rule')}
                            options={[
                                { value: '', label: 'One-time' },
                                { value: 'daily', label: 'Every Day' },
                                { value: 'weekly', label: 'Every Week' },
                                { value: '2days', label: 'Every 2 Days' },
                                { value: '3days', label: 'Every 3 Days' }
                            ]}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="notify"
                            {...register('notify')}
                            className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                        />
                        <label htmlFor="notify" className="text-sm text-slate-700">Enable reminders</label>
                    </div>

                    <div className="pt-2 flex justify-end space-x-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                        <button type="submit" disabled={submitting} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                            {submitting ? 'Creating...' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
