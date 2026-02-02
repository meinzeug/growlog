import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { ArrowLeft, Camera, FileText, Calendar as CalendarIcon, Activity, Ruler, Pencil, Save, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { PlantPhotos } from '../components/plant/PlantPhotos';
import { PlantLogs } from '../components/plant/PlantLogs';
import { PlantMetrics } from '../components/plant/PlantMetrics';
import { PlantTasks } from '../components/plant/PlantTasks';
import { AddLogModal } from '../components/plant/AddLogModal';
import { Modal } from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Form';
import { SliderControl } from '../components/ui/SliderControl';
import { useForm } from 'react-hook-form';
import { useLanguage } from '../context/LanguageContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const PLANT_PHASES = ['GERMINATION', 'VEGETATIVE', 'FLOWERING', 'DRYING', 'CURED', 'FINISHED'];
const HEALTH_ISSUES = ['PESTS', 'MOLD', 'NUTRIENT_BURN', 'DEFICIENCY', 'ROOT_ROT', 'HEAT_STRESS'];

export const PlantDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [plant, setPlant] = useState<any>(null);
    const [latestMetric, setLatestMetric] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'photos' | 'metrics' | 'tasks'>('overview');

    // Modals
    const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
    const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [logModalType, setLogModalType] = useState('NOTE');

    const [submittingPhase, setSubmittingPhase] = useState(false);
    const [savingHealth, setSavingHealth] = useState(false);
    const [savingVitals, setSavingVitals] = useState(false);

    const { register: registerPhase, handleSubmit: handleSubmitPhase, reset: resetPhase } = useForm({
        defaultValues: {
            phase: 'VEGETATIVE',
            phase_started_at: new Date().toISOString().split('T')[0]
        }
    });

    const { register: registerVitals, handleSubmit: handleSubmitVitals, setValue: setVitalsValue, watch: watchVitals, reset: resetVitals } = useForm({
        defaultValues: {
            height_cm: 0,
            node_count: 0,
            phenotype: '',
            breeder: ''
        }
    });

    const fetchPlant = async () => {
        try {
            const [plantRes, metricsRes] = await Promise.all([
                api.get(`/plants/${id}`),
                api.get(`/plants/${id}/metrics`)
            ]);

            setPlant(plantRes.data);

            if (metricsRes.data && metricsRes.data.length > 0) {
                // Assuming metrics are sorted by recorded_at ascending by default or we sort
                const sorted = metricsRes.data.sort((a: any, b: any) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
                setLatestMetric(sorted[sorted.length - 1]);
            }

            resetPhase({
                phase: plantRes.data.phase,
                phase_started_at: plantRes.data.phase_started_at ? plantRes.data.phase_started_at.split('T')[0] : plantRes.data.start_date.split('T')[0]
            });

            // Init Vitals Form
            const currentHeight = metricsRes.data && metricsRes.data.length > 0 ? metricsRes.data[metricsRes.data.length - 1].height_cm || 0 : 0;
            const currentNodes = metricsRes.data && metricsRes.data.length > 0 ? metricsRes.data[metricsRes.data.length - 1].node_count || 0 : 0;

            resetVitals({
                height_cm: currentHeight,
                node_count: currentNodes,
                phenotype: plantRes.data.phenotype || '',
                breeder: plantRes.data.breeder || ''
            });

        } catch (e) {
            console.error(e);
            navigate('/plants');
        } finally {
            setLoading(false);
        }
    };

    const updateHealth = async (newStatus: string, newIssues: string[]) => {
        setSavingHealth(true);
        // Optimistic update
        const prevPlant = { ...plant };
        setPlant({ ...plant, status: newStatus, health_issues: newIssues });

        try {
            await api.patch(`/plants/${id}`, {
                status: newStatus,
                health_issues: newIssues
            });
        } catch (e) {
            console.error(e);
            // Revert
            setPlant(prevPlant);
            alert('Failed to update health');
        } finally {
            setSavingHealth(false);
        }
    };

    const toggleIssue = (issue: string) => {
        let issues = plant.health_issues || [];
        if (issues.includes(issue)) {
            issues = issues.filter((i: string) => i !== issue);
        } else {
            issues = [...issues, issue];
        }

        // Auto-update status logic
        let status = plant.status;
        if (issues.length > 0 && status === 'HEALTHY') {
            status = 'ISSUES';
        } else if (issues.length === 0 && (status === 'ISSUES' || status === 'SICK')) {
            status = 'HEALTHY';
        }

        updateHealth(status, issues);
    };

    const onChangePhase = async (data: any) => {
        setSubmittingPhase(true);
        try {
            await api.post(`/plants/${id}/phase`, {
                phase: data.phase,
                phase_started_at: new Date(data.phase_started_at).toISOString()
            });
            await fetchPlant();
            setIsPhaseModalOpen(false);
        } catch (e) {
            console.error(e);
            alert(t('failed_update_phase'));
        } finally {
            setSubmittingPhase(false);
        }
    };

    const onSaveVitals = async (data: any) => {
        setSavingVitals(true);
        try {
            // 1. Update Metrics (Height, Nodes) - Only if changed or we want a log
            // We'll create a new metric for "Vital Update"
            await api.post(`/plants/${id}/metrics`, {
                height_cm: data.height_cm,
                node_count: data.node_count,
                recorded_at: new Date().toISOString()
            });

            // 2. Update Plant Info (Phenotype, Breeder)
            await api.patch(`/plants/${id}`, {
                phenotype: data.phenotype,
                breeder: data.breeder
            });

            await fetchPlant();
            setIsVitalsModalOpen(false);
        } catch (e) {
            console.error(e);
            alert('Failed to save vitals');
        } finally {
            setSavingVitals(false);
        }
    };

    useEffect(() => {
        if (id) fetchPlant();
    }, [id]);

    if (loading) return <LoadingSpinner className="py-20" />;
    if (!plant) return null;

    const age = Math.floor((new Date().getTime() - new Date(plant.start_date).getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
                <button onClick={() => navigate('/plants')} className="p-2 hover:bg-slate-100 rounded-full transition-colors mt-1">
                    <ArrowLeft size={24} className="text-slate-600" />
                </button>
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-bold text-slate-900">{plant.name}</h1>
                        <span className={clsx(
                            "text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wide",
                            plant.status === 'HEALTHY' ? "bg-green-100 text-green-700" :
                                plant.status === 'SICK' ? "bg-red-100 text-red-700" :
                                    "bg-yellow-100 text-yellow-700"
                        )}>
                            {t(plant.status.toLowerCase()) || plant.status}
                        </span>
                        <span className="text-sm px-3 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                            {t(plant.phase.toLowerCase()) || plant.phase}
                        </span>
                        <button onClick={() => setIsPhaseModalOpen(true)} className="text-sm text-green-600 font-medium hover:text-green-700 underline">
                            {t('change_phase')}
                        </button>
                    </div>
                    <p className="text-slate-500 mt-1">
                        {plant.strain} • {t('started')} {format(new Date(plant.start_date), 'MMM d, yyyy')} • {t(plant.plant_type.toLowerCase()) || plant.plant_type}
                    </p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-slate-200 flex overflow-x-auto gap-6">
                {[
                    { id: 'overview', label: t('overview'), icon: Activity },
                    { id: 'photos', label: t('photos'), icon: Camera },
                    { id: 'logs', label: t('grow_logs'), icon: FileText },
                    { id: 'metrics', label: t('metrics'), icon: Ruler },
                    { id: 'tasks', label: t('tasks_title'), icon: CalendarIcon },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={clsx(
                            "flex items-center gap-2 pb-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap",
                            activeTab === tab.id
                                ? "border-green-600 text-green-700"
                                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                        )}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
                        {/* Column 1: Core Stats */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 section-overview flex flex-col gap-6">
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                        <Activity size={18} className="text-green-500" />
                                        {t('vital_stats')}
                                    </h3>
                                    <button
                                        onClick={() => setIsVitalsModalOpen(true)}
                                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-green-600 transition-colors"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                        <span className="text-sm text-slate-500">{t('age')}</span>
                                        <span className="font-bold text-slate-800">
                                            {age} {t('days')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                        <span className="text-sm text-slate-500">{t('height')}</span>
                                        <span className="font-bold text-slate-800">
                                            {latestMetric?.height_cm ? `${latestMetric.height_cm} cm` : '--'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                        <span className="text-sm text-slate-500">{t('nodes')}</span>
                                        <span className="font-bold text-slate-800">
                                            {latestMetric?.node_count ? `${latestMetric.node_count} ${t('pairs')}` : '--'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                        <span className="text-sm text-slate-500">{t('phenotype')}</span>
                                        <span className="font-bold text-slate-800 truncate max-w-[150px]">
                                            {plant.phenotype || '--'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Activity size={18} className="text-red-500" />
                                    {t('health_check')}
                                    {savingHealth && <LoadingSpinner size="sm" />}
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {/* Status Toggles */}
                                    {HEALTH_ISSUES.map(issue => {
                                        const isActive = plant.health_issues?.includes(issue);
                                        return (
                                            <button
                                                key={issue}
                                                onClick={() => toggleIssue(issue)}
                                                className={clsx(
                                                    "flex items-center gap-2 p-2 rounded-lg border transition-all text-left",
                                                    isActive
                                                        ? "bg-red-50 border-red-200 text-red-700"
                                                        : "bg-slate-50 border-transparent hover:border-slate-200 text-slate-600"
                                                )}
                                            >
                                                <div className={clsx(
                                                    "w-4 h-4 rounded-full border flex items-center justify-center",
                                                    isActive ? "border-red-500 bg-red-500" : "border-slate-300 bg-white"
                                                )}>
                                                    {isActive && <Check size={10} className="text-white" />}
                                                </div>
                                                <span className="text-xs font-medium">{t(issue.toLowerCase()) || issue}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Genetics & Info */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6">
                            <div>
                                <h3 className="font-bold text-slate-800 mb-4">{t('genetics_profile')}</h3>
                                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl mb-4">
                                    <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-1">{t('breeder')}</p>
                                    <p className="text-lg font-bold text-slate-900">{plant.breeder || '--'}</p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-slate-500">{t('indica')}</span>
                                            <span className="text-slate-500">{t('sativa')}</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
                                            {/* Mock genetics bar for now, until we add genetics fields */}
                                            <div className="h-full bg-purple-500 w-[50%]"></div>
                                            <div className="h-full bg-yellow-400 w-[50%]"></div>
                                        </div>
                                        <div className="flex justify-between text-xs mt-1 font-medium">
                                            <span className="text-purple-600">--</span>
                                            <span className="text-yellow-600">--</span>
                                        </div>
                                    </div>

                                    {/* Additional info */}
                                    <div className="grid grid-cols-2 gap-4 pt-4">
                                        <div>
                                            <span className="block text-xs text-slate-400 uppercase">{t('mother')}</span>
                                            <span className="font-medium text-sm text-slate-700">None</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-slate-400 uppercase">{t('clones_taken')}</span>
                                            <span className="font-medium text-sm text-slate-700">0</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-800 mb-4">{t('nutrient_schedule')}</h3>
                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                                    <div className="bg-white p-2 rounded-lg shadow-sm">
                                        <span className="text-xs font-bold text-green-600">{t('last_fed')}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">--</p>
                                        <p className="text-xs text-slate-500">{t('log_watering_feeding')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Column 3: Harvest Projections */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6">
                            <div>
                                <h3 className="font-bold text-slate-800 mb-4">{t('harvest_tracker')}</h3>
                                <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                                    <span className="block text-3xl font-bold text-slate-900 mb-1">
                                        {/* Simple estimate based on phase */}
                                        {plant.phase === 'FLOWERING' ? '~45' : '--'}
                                    </span>
                                    <span className="text-sm text-slate-500 font-medium">{t('est_days_remaining')}</span>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">{t('flowering_start')}</span>
                                        <span className="font-medium text-slate-900">
                                            {plant.phase === 'FLOWERING' && plant.phase_started_at ? format(new Date(plant.phase_started_at), 'MMM d') : '--'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">{t('est_yield')}</span>
                                        <span className="font-medium text-slate-900">{plant.estimated_yield_grams ? `~${plant.estimated_yield_grams}g` : '--'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto">
                                <button
                                    onClick={() => {
                                        setLogModalType('WATER');
                                        setIsLogModalOpen(true);
                                    }}
                                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors shadow-sm mb-3">
                                    {t('log_watering_feeding')}
                                </button>
                                <button
                                    onClick={() => {
                                        setLogModalType('NOTE');
                                        setIsLogModalOpen(true);
                                    }}
                                    className="w-full py-3 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 font-bold rounded-xl transition-colors">
                                    {t('add_log_entry')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'photos' && <PlantPhotos plantId={id!} />}
                {activeTab === 'logs' && <PlantLogs plantId={id!} plant={plant} />}
                {activeTab === 'metrics' && <PlantMetrics plantId={id!} />}
                {activeTab === 'tasks' && <PlantTasks plantId={id!} />}
            </div>

            {/* Phase Modal */}
            <Modal isOpen={isPhaseModalOpen} onClose={() => setIsPhaseModalOpen(false)} title={t('update_growth_phase')}>
                <form onSubmit={handleSubmitPhase(onChangePhase)} className="space-y-4">
                    <Select
                        label={t('new_phase')}
                        {...registerPhase('phase')}
                        options={PLANT_PHASES.map(p => ({ value: p, label: t(p.toLowerCase()) || p }))}
                    />
                    <Input
                        type="date"
                        label={t('start_date')}
                        {...registerPhase('phase_started_at')}
                    />
                    <div className="pt-2 flex justify-end space-x-3">
                        <button type="button" onClick={() => setIsPhaseModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">{t('cancel')}</button>
                        <button type="submit" disabled={submittingPhase} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                            {submittingPhase ? t('updating') : t('update_growth_phase')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Vitals Modal */}
            <Modal isOpen={isVitalsModalOpen} onClose={() => setIsVitalsModalOpen(false)} title={t('edit') + ' ' + t('vital_stats')}>
                <form onSubmit={handleSubmitVitals(onSaveVitals)} className="space-y-6">
                    <div>
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">{t('growth_metrics')}</h4>
                        <SliderControl
                            label={t('height')}
                            value={watchVitals('height_cm')}
                            onChange={(v) => setVitalsValue('height_cm', v)}
                            min={0}
                            max={300}
                            step={0.5}
                            unit="cm"
                            icon={Ruler}
                            colorClass="bg-green-600"
                        />
                        <div className="h-4" />
                        <SliderControl
                            label={t('nodes')}
                            value={watchVitals('node_count')}
                            onChange={(v) => setVitalsValue('node_count', v)}
                            min={0}
                            max={50}
                            step={1}
                            unit={t('pairs')}
                            icon={Activity}
                            colorClass="bg-teal-500"
                        />
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">{t('genetics_profile')}</h4>
                        <Input
                            label={t('phenotype')}
                            {...registerVitals('phenotype')}
                            placeholder="#4 (Keeper)"
                        />
                        <div className="h-4" />
                        <Input
                            label={t('breeder')}
                            {...registerVitals('breeder')}
                            placeholder="e.g. Barney's Farm"
                        />
                    </div>

                    <div className="pt-2 flex justify-end space-x-3">
                        <button type="button" onClick={() => setIsVitalsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">{t('cancel')}</button>
                        <button type="submit" disabled={savingVitals} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2">
                            {savingVitals ? <LoadingSpinner size="sm" /> : <Save size={18} />}
                            <span>{t('save')}</span>
                        </button>
                    </div>
                </form>
            </Modal>

            {plant && (
                <AddLogModal
                    isOpen={isLogModalOpen}
                    onClose={() => setIsLogModalOpen(false)}
                    plantId={plant.id}
                    initialType={logModalType}
                    onSuccess={() => {
                        fetchPlant();
                    }}
                />
            )}
        </div>
    );
};
