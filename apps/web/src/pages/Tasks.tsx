import { useState, useEffect } from 'react';
import api from '../lib/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { Moon, Sun, CheckCircle2, Circle, Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { Modal } from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Form';
import { useForm } from 'react-hook-form';
import { useLanguage } from '../context/LanguageContext';
import { getMoonPhase, type MoonData } from '../lib/moon';
import { useSettings } from '../context/SettingsContext';

interface Task {
    id: string;
    title: string;
    status: 'OPEN' | 'DONE';
    due_at: string;
    type?: string;
    priority?: string;
    repeat_rule?: string;
    notify_before_minutes?: number;
}

export const Tasks = () => {
    const { t, dateLocale } = useLanguage();
    const { settings } = useSettings();
    const [currentDate, setCurrentDate] = useState(new Date()); // For calendar navigation
    const [selectedDate, setSelectedDate] = useState(new Date()); // For detail view
    const [moonData, setMoonData] = useState<MoonData | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'calendar' | 'kanban'>('calendar');

    const { register, handleSubmit, reset } = useForm();

    const fetchTasks = async () => {
        try {
            const res = await api.get('/tasks');
            setTasks(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        const fetchMoon = async () => {
            const data = await getMoonPhase(selectedDate);
            setMoonData(data);
        };
        fetchMoon();
    }, [selectedDate]);

    const toggleTask = async (id: string, currentStatus: string) => {
        try {
            if (currentStatus === 'DONE') return; // already done
            await api.post(`/tasks/${id}/complete`);
            fetchTasks(); // Refresh to show updated status
        } catch (e) {
            console.error(e);
        }
    };

    const onSubmit = async (data: Partial<Task>) => {
        setLoading(true);
        try {
            await api.post('/tasks', {
                ...data,
                notify_before_minutes: data.notify_before_minutes ? Number(data.notify_before_minutes) : undefined,
                due_at: data.due_at ? new Date(data.due_at).toISOString() : new Date().toISOString()
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

    const getDefaultTaskTime = () => {
        const now = new Date();
        const currentHour = now.getHours();
        const targetDate = new Date(now);
        targetDate.setMinutes(0);
        targetDate.setSeconds(0);
        targetDate.setMilliseconds(0);

        if (currentHour < 9) {
            targetDate.setHours(9);
        } else if (currentHour >= 17) {
            targetDate.setDate(targetDate.getDate() + 1);
            targetDate.setHours(9);
        } else {
            targetDate.setHours(currentHour + 1);
        }
        // Format for datetime-local input: "yyyy-MM-ddThh:mm"
        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        const day = String(targetDate.getDate()).padStart(2, '0');
        const hours = String(targetDate.getHours()).padStart(2, '0');
        const minutes = String(targetDate.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
    });

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    return (
        <div className="space-y-6 h-full pb-20">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">{t('tasks_title')}</h1>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        className={clsx("px-4 py-1.5 rounded-md text-sm font-medium transition-all", viewMode === 'calendar' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700')}
                        onClick={() => setViewMode('calendar')}
                    >
                        {t('calendar_view')}
                    </button>
                    <button
                        className={clsx("px-4 py-1.5 rounded-md text-sm font-medium transition-all", viewMode === 'kanban' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700')}
                        onClick={() => setViewMode('kanban')}
                    >
                        {t('board_view')}
                    </button>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus size={20} />
                    <span>{t('new_task')}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <h2 className="text-xl font-bold text-slate-800">
                                {format(currentDate, 'MMMM yyyy', { locale: dateLocale })}
                            </h2>
                            <div className="flex items-center space-x-1">
                                <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-full"><ChevronLeft size={20} /></button>
                                <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-full"><ChevronRight size={20} /></button>
                            </div>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <div key={day} className="bg-slate-50 p-2 text-center text-xs font-semibold text-slate-500">
                                {day}
                            </div>
                        ))}
                        {daysInMonth.map((day) => {
                            const dayTasks = getTasksForDay(day);
                            const isSelected = isSameDay(day, selectedDate);
                            const isTodayDate = isToday(day);

                            return (
                                <div
                                    key={day.toISOString()}
                                    onClick={() => setSelectedDate(day)}
                                    className={clsx(
                                        "bg-white min-h-[100px] p-2 cursor-pointer transition-colors relative hover:bg-slate-50/80",
                                        isSelected && "ring-2 ring-inset ring-green-500"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={clsx(
                                            "w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium",
                                            isTodayDate ? "bg-green-600 text-white" : "text-slate-700"
                                        )}>
                                            {format(day, 'd')}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        {dayTasks.slice(0, 3).map(task => (
                                            <div
                                                key={task.id}
                                                className={clsx(
                                                    "text-[10px] px-1.5 py-0.5 rounded truncate border",
                                                    task.status === 'DONE' ? "bg-slate-100 text-slate-400 border-transparent line-through" : "bg-green-50 text-green-700 border-green-100"
                                                )}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleTask(task.id, task.status);
                                                }}
                                            >
                                                {task.title}
                                            </div>
                                        ))}
                                        {dayTasks.length > 3 && (
                                            <div className="text-[10px] text-slate-400 pl-1">
                                                +{dayTasks.length - 3} more
                                            </div>
                                        )}
                                    </div>
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
                            {moonData ? (
                                <>
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-white/90">{t('moon_phase')}</h3>
                                            <p className="text-sm text-green-400 font-medium">{t(`moon_${moonData.phase}`) || moonData.phase}</p>
                                        </div>
                                        <Moon size={32} className="text-green-300" />
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-xs text-slate-400 uppercase tracking-wider">{t('planters_tip')}</span>
                                            <p className="font-medium text-white/80 leading-snug mt-1">
                                                {t(moonData.recommendationKey)}
                                            </p>
                                        </div>

                                        <div className="pt-4 border-t border-white/10 flex items-center gap-4 text-xs text-white/60">
                                            <div className="flex items-center gap-1.5">
                                                <Sun size={14} />
                                                <span>{(moonData.illumination * 100).toFixed(0)}% {t('illumination') || 'Illum'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Moon size={14} />
                                                <span>{moonData.age.toFixed(1)} {t('days') || 'days'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8 text-slate-500">{t('loading')}</div>
                            )}
                        </div>

                        {/* Decorative BG */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                    </div>

                    {/* Upcoming Tasks Widget */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">{t('upcoming')}</h3>
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
                                <p>{t('all_caught_up')}</p>
                            </div>
                        )}

                        <button onClick={() => setIsModalOpen(true)} className="w-full mt-4 py-3 text-sm font-bold text-green-700 bg-green-50 hover:bg-green-100 rounded-xl transition-colors">
                            {t('add_task')}
                        </button>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={t('new_task')}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label={t('task_title')}
                        placeholder={t('task_title_placeholder')}
                        {...register('title', { required: true })}
                    />

                    <Input
                        type="datetime-local"
                        label={t('due_date')}
                        {...register('due_at', { required: true })}
                        defaultValue={getDefaultTaskTime()}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('frequency')}</label>
                            <Select
                                options={[
                                    { value: '', label: t('one_time') },
                                    { value: 'DAILY', label: t('daily') },
                                    { value: 'EVERY_3_DAYS', label: t('every_3_days') },
                                    { value: 'WEEKLY', label: t('weekly') },
                                    { value: 'MONTHLY', label: t('monthly') }
                                ]}
                                {...register('repeat_rule')}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('priority')}</label>
                            <Select
                                options={[
                                    { value: 'MEDIUM', label: t('priority_normal') },
                                    { value: 'HIGH', label: t('priority_high') },
                                    { value: 'LOW', label: t('priority_low') }
                                ]}
                                {...register('priority')}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center mt-6">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    {...register('notify')}
                                    defaultChecked={settings.defaultReminderTime > 0}
                                    className="w-4 h-4 text-green-600 rounded border-slate-300 focus:ring-green-500"
                                />
                                <span className="text-sm font-medium text-slate-700">{t('notify_me') || 'Notify Me'}</span>
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('reminder_time') || 'Remind Before (min)'}</label>
                            <input
                                type="number"
                                {...register('notify_before_minutes')}
                                defaultValue={settings.defaultReminderTime || 15}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
                        >
                            {loading ? t('creating') : t('add_task')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
