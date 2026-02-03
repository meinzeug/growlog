import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Plus, Trash2, Pencil, Sprout, Thermometer, Droplets, Calendar, Home, Sun, Activity, Wind } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import clsx from 'clsx';
import { useLanguage } from '../context/LanguageContext';
import { calculatePlantProgress, PHASE_THRESHOLDS, calculateYieldEstimate, formatYield } from '../lib/plantUtils';
import { useSettings } from '../context/SettingsContext';

// Shared types (ideally import from @growlog/shared)

const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    location_type: z.enum(['INDOOR', 'OUTDOOR']),
    notes: z.string().optional()
});

type FormData = z.infer<typeof schema>;

export const Grows = () => {
    const { t } = useLanguage();
    const { settings } = useSettings();
    const [grows, setGrows] = useState<any[]>([]);

    // Global Yield Calculation
    const totalYield = grows.reduce((acc, grow) =>
        acc + (grow.plants?.reduce((sum: number, p: any) => sum + calculateYieldEstimate(p), 0) || 0)
        , 0);

    const [envStats, setEnvStats] = useState<{ temperature: number; humidity: number; co2?: number } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingGrow, setEditingGrow] = useState<any>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            location_type: settings.defaultGrowLocation || 'INDOOR'
        }
    });

    const fetchGrows = async () => {
        try {
            const [growsRes, overviewRes] = await Promise.all([
                api.get('/grows'),
                api.get('/overview')
            ]);
            setGrows(growsRes.data);
            if (overviewRes.data?.environment) {
                setEnvStats(overviewRes.data.environment);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchGrows();
    }, []);

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            if (editingGrow) {
                await api.put(`/grows/${editingGrow.id}`, data);
            } else {
                await api.post('/grows', data);
            }
            await fetchGrows();
            setIsModalOpen(false);
            setEditingGrow(null);
            reset();
        } catch (e) {
            console.error(e);
            alert('Failed to create grow');
        } finally {
            setLoading(false);
        }
    };

    const editGrow = (grow: any) => {
        setEditingGrow(grow);
        reset({
            name: grow.name,
            location_type: grow.location_type || 'INDOOR',
            notes: grow.notes || ''
        });
        setIsModalOpen(true);
    };

    const deleteGrow = async (id: string) => {
        if (!confirm(t('delete_confirm'))) return;
        try {
            await api.delete(`/grows/${id}`);
            fetchGrows();
        } catch (e) {
            console.error(e);
            alert('Failed to delete grow');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{t('my_grows')}</h1>
                    <p className="text-slate-500">{t('grows_subtitle')}</p>
                </div>
                <button
                    onClick={() => {
                        setEditingGrow(null);
                        reset({
                            name: '',
                            location_type: settings.defaultGrowLocation || 'INDOOR',
                            notes: ''
                        });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    <span>{t('new_grow')}</span>
                </button>
            </div>

            {/* Dashboard Headers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-28">
                    <div className="flex justify-between items-start">
                        <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">{t('total_plants')}</span>
                        <Sprout size={18} className="text-green-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900">{grows.reduce((acc, g) => acc + (g.plants?.length || 0), 0)}</span>
                        {(() => {
                            const now = Date.now();
                            const oneWeek = 7 * 24 * 60 * 60 * 1000;
                            const totalWeeks = grows.reduce((acc, g) => acc + (now - new Date(g.created_at).getTime()) / oneWeek, 0);
                            const avgWeeks = grows.length > 0 ? Math.round(totalWeeks / grows.length) : 0;

                            return (
                                <span className={clsx("text-xs font-bold px-1.5 py-0.5 rounded-md",
                                    avgWeeks < 8 ? "text-green-600 bg-green-50" :
                                        avgWeeks < 16 ? "text-yellow-600 bg-yellow-50" :
                                            "text-orange-600 bg-orange-50"
                                )}>
                                    {avgWeeks} {t('weeks')} (avg)
                                </span>
                            );
                        })()}
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-28">
                    <div className="flex justify-between items-start">
                        <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">{t('temperature')} (Avg)</span>
                        <Thermometer size={18} className="text-orange-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900">{envStats?.temperature ?? '--'}°C</span>
                        <span className="text-xs text-slate-400">{t('daytime')}</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-28">
                    <div className="flex justify-between items-start">
                        <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">{t('humidity')} (Avg)</span>
                        <Droplets size={18} className="text-blue-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900">{envStats?.humidity ?? '--'}%</span>
                        <span className="text-xs text-slate-400">RH</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-28">
                    <div className="flex justify-between items-start">
                        <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">CO2 (Avg)</span>
                        <Wind size={18} className="text-slate-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900">{envStats?.co2 ?? '--'}</span>
                        <span className="text-xs text-slate-400">ppm</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-28">
                    <div className="flex justify-between items-start">
                        <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">{t('est_yield')}</span>
                        <Calendar size={18} className="text-purple-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900">{totalYield > 0 ? `~${formatYield(totalYield)}` : '--'}</span>
                        <span className="text-xs text-slate-400">{t('total_potential')}</span>
                    </div>
                </div>
            </div>

            {/* Grows List */}
            <div className="space-y-6">
                {grows.map((grow) => {
                    const plantCount = grow.plants?.length || 0;

                    // Real Yield Estimation (Sum of plant estimates)
                    const estimatedYield = grow.plants?.reduce((sum: number, p: any) => sum + (p.estimated_yield_grams || 0), 0) || 0;

                    // Real Progress based on Plant Phases using utility
                    const totalProgress = grow.plants?.reduce((sum: number, p: any) =>
                        sum + calculatePlantProgress(p.phase, p.plant_type, p.start_date || p.created_at, settings.phaseDurations), 0) || 0;

                    const progress = plantCount > 0 ? totalProgress / plantCount : 0;

                    const primaryEnv = grow.environments?.[0];

                    const updateEnv = async (field: string, val: string) => {
                        if (!primaryEnv) return;
                        try {
                            await api.patch(`/environments/${primaryEnv.id}`, { [field]: parseFloat(val) });
                        } catch (e) { console.error(e); }
                    };

                    return (
                        <div key={grow.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
                            <div className="flex flex-col lg:flex-row gap-8">

                                {/* Left Section: Info & Main Stats */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={clsx(
                                                "w-12 h-12 rounded-xl flex items-center justify-center",
                                                grow.location_type === 'INDOOR' ? "bg-purple-50 text-purple-600" : "bg-orange-50 text-orange-600"
                                            )}>
                                                {grow.location_type === 'INDOOR' ? <Home size={24} /> : <Sun size={24} />}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900">{grow.name}</h3>
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    <span>{grow.location_type === 'INDOOR' ? t('indoor') : t('outdoor')}</span>
                                                    <span>•</span>
                                                    <span>{t('started')} {new Date(grow.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    editGrow(grow);
                                                }}
                                                className="p-2 text-slate-300 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                                title={t('edit')}
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    deleteGrow(grow.id);
                                                }}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                title={t('delete')}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <span className="block text-xs text-slate-500 uppercase font-bold mb-1">{t('plants')}</span>
                                            <span className="text-lg font-bold text-slate-800">{plantCount}</span>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <span className="block text-xs text-slate-500 uppercase font-bold mb-1">{t('est_yield')}</span>
                                            <span className="text-lg font-bold text-slate-800">{estimatedYield > 0 ? `~${estimatedYield}g` : '-'}</span>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <span className="block text-xs text-slate-500 uppercase font-bold mb-1">{t('stage')}</span>
                                            <span className="text-lg font-bold text-slate-800">
                                                {progress < PHASE_THRESHOLDS.GERMINATION ? t('germination') :
                                                    progress < PHASE_THRESHOLDS.VEGETATIVE ? t('veg') :
                                                        progress < PHASE_THRESHOLDS.FLOWERING ? t('flower') : t('harvest')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Timeline Progress */}
                                    <div className="mb-2">
                                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                                            <span className={progress < PHASE_THRESHOLDS.GERMINATION ? 'text-green-600' : ''}>{t('germination')}</span>
                                            <span className={progress >= PHASE_THRESHOLDS.GERMINATION && progress < PHASE_THRESHOLDS.VEGETATIVE ? 'text-green-600' : ''}>{t('veg')}</span>
                                            <span className={progress >= PHASE_THRESHOLDS.VEGETATIVE && progress < PHASE_THRESHOLDS.FLOWERING ? 'text-green-600' : ''}>{t('flower')}</span>
                                            <span className={progress >= PHASE_THRESHOLDS.FLOWERING ? 'text-green-600' : ''}>{t('harvest')}</span>
                                        </div>
                                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative">
                                            <div className="absolute top-0 bottom-0 left-0 bg-green-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section: Environment & Tools */}
                                <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-8 flex flex-col">
                                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <Activity size={16} className="text-slate-400" />
                                        {t('env_target')}
                                    </h4>

                                    {primaryEnv ? (
                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Thermometer size={16} className="text-slate-400" />
                                                    <span>Temp</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="number"
                                                        defaultValue={primaryEnv.temperature_target || ''}
                                                        onBlur={(e) => updateEnv('temperature_target', e.target.value)}
                                                        className="w-12 text-right font-bold text-slate-900 border-b border-slate-200 outline-none focus:border-green-500 bg-transparent text-sm"
                                                    />
                                                    <span className="text-xs text-slate-400">°C</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Droplets size={16} className="text-slate-400" />
                                                    <span>Humidity</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="number"
                                                        defaultValue={primaryEnv.humidity_target || ''}
                                                        onBlur={(e) => updateEnv('humidity_target', e.target.value)}
                                                        className="w-12 text-right font-bold text-slate-900 border-b border-slate-200 outline-none focus:border-green-500 bg-transparent text-sm"
                                                    />
                                                    <span className="text-xs text-slate-400">%</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Wind size={16} className="text-slate-400" />
                                                    <span>CO2</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="number"
                                                        defaultValue={primaryEnv.co2_target || ''}
                                                        placeholder="-"
                                                        onBlur={(e) => updateEnv('co2_target', e.target.value)}
                                                        className="w-12 text-right font-bold text-slate-900 border-b border-slate-200 outline-none focus:border-green-500 bg-transparent text-sm"
                                                    />
                                                    <span className="text-xs text-slate-400">ppm</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mb-6 text-sm text-slate-400 italic">{t('no_environment_configured')}</div>
                                    )}

                                    <div className="mt-auto space-y-2">
                                        <button className="w-full py-2 bg-blue-50 text-blue-600 font-bold text-sm rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                                            <Droplets size={16} />
                                            <span>{t('log_watering')}</span>
                                        </button>
                                        <Link to={`/grows/${grow.id}`} className="w-full py-2 border border-slate-200 text-slate-600 font-bold text-sm rounded-lg hover:border-green-500 hover:text-green-600 transition-colors flex items-center justify-center gap-2">
                                            {t('view_details')}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}

                {grows.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-500 bg-white rounded-xl border-2 border-dashed border-slate-200">
                        <Sprout size={48} className="text-slate-300 mb-4" />
                        <p className="font-medium">{t('no_grows')}</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-2 text-green-600 hover:underline"
                        >
                            {t('create_first_grow')}
                        </button>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingGrow(null);
                    reset();
                }}
                title={editingGrow ? t('edit') + ' ' + t('grows').slice(0, -1) : t('create_grow')}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label={t('grow_name')}
                        placeholder={t('grow_name_placeholder')}
                        {...register('name')}
                        error={errors.name?.message}
                    />

                    <Select
                        label={t('location')}
                        {...register('location_type')}
                        options={[
                            { value: 'INDOOR', label: t('indoor') },
                            { value: 'OUTDOOR', label: t('outdoor') }
                        ]}
                    />

                    <div className="w-full">
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('notes_optional')}</label>
                        <textarea
                            {...register('notes')}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all h-24 resize-none"
                            placeholder={t('grow_description_placeholder')}
                        />
                    </div>

                    <div className="pt-2 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            {loading ? t('saving') : (editingGrow ? t('save') : t('create_grow'))}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
