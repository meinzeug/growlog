
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { CheckCircle, Circle, Clock, Plus, Calendar, Trash2, Loader2 } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/Form';
import { useForm } from 'react-hook-form';
import clsx from 'clsx';
import { useLanguage } from '../../context/LanguageContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface PlantTasksProps {
    plantId: string;
}

export const PlantTasks = ({ plantId }: PlantTasksProps) => {
    const [processing, setProcessing] = useState<Set<string>>(new Set());
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { t, dateLocale } = useLanguage();

    const { register, handleSubmit, reset, watch, setValue } = useForm({
        defaultValues: {
            title: '',
            due_at: new Date().toISOString().split('T')[0],
            due_time: '09:00',
            repeat_rule: '',
            notify: false
        }
    });

    // Smart Defaults
    const watchedTitle = watch('title');
    useEffect(() => {
        if (!watchedTitle) return;
        const lower = watchedTitle.toLowerCase();

        if (lower.includes('water')) {
            setValue('repeat_rule', '3days', { shouldValidate: true });
        } else if (lower.includes('feed') || lower.includes('nutrient')) {
            setValue('repeat_rule', 'weekly', { shouldValidate: true });
        } else if (lower.includes('daily') || lower.includes('check') || lower.includes('inspect')) {
            setValue('repeat_rule', 'daily', { shouldValidate: true });
        }
    }, [watchedTitle, setValue]);

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
            const dueAt = new Date(`${data.due_at}T${data.due_time || '09:00'}:00`).toISOString();
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
            alert(t('failed_create_task'));
        } finally {
            setSubmitting(false);
        }
    };

    const toggleTask = async (taskId: string, status: string) => {
        if (status === 'DONE' || processing.has(taskId)) return;

        // Optimistic / Loading State
        setProcessing(prev => new Set(prev).add(taskId));

        try {
            await api.post(`/tasks/${taskId}/complete`);
            await fetchTasks();
        } catch (e) {
            console.error(e);
        } finally {
            setProcessing(prev => {
                const next = new Set(prev);
                next.delete(taskId);
                return next;
            });
        }
    };

    const deleteTask = async (taskId: string) => {
        if (!confirm(t('delete_task_confirm'))) return;
        try {
            await api.delete(`/tasks/${taskId}`);
            setTasks(prev => prev.filter(t => t.id !== taskId));
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="py-12"><LoadingSpinner /></div>;

    const openTasks = tasks.filter(t => t.status === 'OPEN');
    const completedTasks = tasks.filter(t => t.status !== 'OPEN');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
                <h3 className="font-bold text-slate-900">{t('task_list')}</h3>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                    <Plus size={16} />
                    <span>{t('add_task')}</span>
                </button>
            </div>

            <div className="space-y-3">
                {openTasks.length === 0 && completedTasks.length === 0 && (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="font-medium text-slate-600">{t('no_tasks_planned')}</p>
                        <p className="text-sm text-slate-400 mt-1">{t('task_hint')}</p>
                    </div>
                )}

                {openTasks.map(task => (
                    <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => toggleTask(task.id, task.status)}
                                disabled={processing.has(task.id)}
                                className={clsx(
                                    "transition-colors",
                                    processing.has(task.id) ? "text-slate-300 cursor-not-allowed" : "text-slate-300 hover:text-green-500"
                                )}
                            >
                                {processing.has(task.id) ? (
                                    <Loader2 size={24} className="animate-spin text-green-500" />
                                ) : (
                                    <Circle size={24} />
                                )}
                            </button>
                            <div>
                                <h4 className="font-medium text-slate-900">{task.title}</h4>
                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                    <span className={clsx("flex items-center gap-1",
                                        isPast(new Date(task.due_at)) && !isToday(new Date(task.due_at)) ? "text-red-500 font-medium" :
                                            isToday(new Date(task.due_at)) ? "text-orange-500 font-medium" : ""
                                    )}>
                                        <Clock size={12} />
                                        {isToday(new Date(task.due_at)) ? (t('today') || 'Today') : format(new Date(task.due_at), 'MMM d', { locale: dateLocale })}
                                    </span>
                                    {task.repeat_rule && (
                                        <span className="bg-slate-100 px-1.5 py-0.5 rounded">{t('repeats')}</span>
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
                        <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">{t('completed')}</h4>
                        <div className="space-y-2 opacity-60">
                            {completedTasks.map(task => (
                                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                                    <div className="flex items-center gap-4">
                                        <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                                        <div>
                                            <span className="text-slate-600 text-sm line-through font-medium block">{task.title}</span>
                                            <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                                <Clock size={10} />
                                                {format(new Date(task.updated_at), 'MMM d, HH:mm', { locale: dateLocale })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('new_task')}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label={t('task_title')}
                        placeholder={t('task_placeholder')}
                        {...register('title', { required: true })}
                    />

                    <div className="grid grid-cols-3 gap-4">
                        <Input
                            type="date"
                            label={t('due_date')}
                            {...register('due_at')}
                        />
                        <Input
                            type="time"
                            label={t('time')}
                            {...register('due_time')}
                        />
                        <Select
                            label={t('frequency') || 'Repeat'}
                            {...register('repeat_rule')}
                            options={[
                                { value: '', label: t('one_time') },
                                { value: 'daily', label: t('daily') },
                                { value: 'weekly', label: t('weekly') },
                                { value: '2days', label: t('every_2_days') },
                                { value: '3days', label: t('every_3_days') }
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
                        <label htmlFor="notify" className="text-sm text-slate-700">{t('enable_reminders')}</label>
                    </div>

                    <div className="pt-2 flex justify-end space-x-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">{t('cancel')}</button>
                        <button type="submit" disabled={submitting} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                            {submitting ? t('creating') : t('create_task')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
