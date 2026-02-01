import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { ArrowLeft, Camera, FileText, Calendar as CalendarIcon, Activity, Ruler } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { PlantPhotos } from '../components/plant/PlantPhotos';
import { PlantLogs } from '../components/plant/PlantLogs';
import { PlantMetrics } from '../components/plant/PlantMetrics';
import { PlantTasks } from '../components/plant/PlantTasks';
import { AddLogModal } from '../components/plant/AddLogModal';
import { Modal } from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Form';
import { useForm } from 'react-hook-form';
import { useLanguage } from '../context/LanguageContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const PLANT_PHASES = ['GERMINATION', 'VEGETATIVE', 'FLOWERING', 'DRYING', 'CURED', 'FINISHED'];

export const PlantDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [plant, setPlant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'photos' | 'metrics' | 'tasks'>('overview');
    const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
    const [submittingPhase, setSubmittingPhase] = useState(false);

    // Log Modal State
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [logModalType, setLogModalType] = useState('NOTE');

    const { register: registerPhase, handleSubmit: handleSubmitPhase, reset: resetPhase } = useForm({
        defaultValues: {
            phase: 'VEGETATIVE', // Most common next phase
            phase_started_at: new Date().toISOString().split('T')[0] // Default to today
        }
    });

    const fetchPlant = async () => {
        try {
            const res = await api.get(`/plants/${id}`);
            setPlant(res.data);
            resetPhase({
                phase: res.data.phase,
                phase_started_at: res.data.phase_started_at ? res.data.phase_started_at.split('T')[0] : res.data.start_date.split('T')[0]
            });
        } catch (e) {
            console.error(e);
            navigate('/plants');
        } finally {
            setLoading(false);
        }
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

    useEffect(() => {
        if (id) fetchPlant();
    }, [id]);

    if (loading) return <LoadingSpinner className="py-20" />;
    if (!plant) return null;

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
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Activity size={18} className="text-green-500" />
                                    {t('vital_stats')}
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                        <span className="text-sm text-slate-500">{t('age')}</span>
                                        <span className="font-bold text-slate-800">
                                            {Math.floor((new Date().getTime() - new Date(plant.start_date).getTime()) / (1000 * 60 * 60 * 24))} {t('days')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                        <span className="text-sm text-slate-500">{t('height')}</span>
                                        <span className="font-bold text-slate-800">42 cm</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                        <span className="text-sm text-slate-500">{t('nodes')}</span>
                                        <span className="font-bold text-slate-800">8 {t('pairs')}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                        <span className="text-sm text-slate-500">{t('phenotype')}</span>
                                        <span className="font-bold text-slate-800">#4 (Keeper?)</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Activity size={18} className="text-red-500" />
                                    {t('health_check')}
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {['pests', 'mold', 'nutrient_burn', 'deficiency'].map(issue => (
                                        <div key={issue} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer">
                                            <div className="w-4 h-4 rounded-full border border-slate-300 bg-white"></div>
                                            <span className="text-xs font-medium text-slate-600">{t(issue) || issue}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Genetics & Info */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6">
                            <div>
                                <h3 className="font-bold text-slate-800 mb-4">{t('genetics_profile')}</h3>
                                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl mb-4">
                                    <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-1">{t('breeder')}</p>
                                    <p className="text-lg font-bold text-slate-900">Barney's Farm</p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-slate-500">{t('indica')}</span>
                                            <span className="text-slate-500">{t('sativa')}</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
                                            <div className="h-full bg-purple-500 w-[70%]"></div>
                                            <div className="h-full bg-yellow-400 w-[30%]"></div>
                                        </div>
                                        <div className="flex justify-between text-xs mt-1 font-medium">
                                            <span className="text-purple-600">70%</span>
                                            <span className="text-yellow-600">30%</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4">
                                        <div>
                                            <span className="block text-xs text-slate-400 uppercase">{t('mother')}</span>
                                            <span className="font-medium text-sm text-slate-700">None (Seed)</span>
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
                                        <p className="text-sm font-bold text-slate-900">2 {t('days')} Ago</p>
                                        <p className="text-xs text-slate-500">CalMag + Grow Big</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Column 3: Harvest Projections */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6">
                            <div>
                                <h3 className="font-bold text-slate-800 mb-4">{t('harvest_tracker')}</h3>
                                <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                                    <span className="block text-3xl font-bold text-slate-900 mb-1">45</span>
                                    <span className="text-sm text-slate-500 font-medium">{t('est_days_remaining')}</span>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">{t('flowering_start')}</span>
                                        <span className="font-medium text-slate-900">Jan 15, 2026</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">{t('est_harvest')}</span>
                                        <span className="font-medium text-slate-900">Mar 15, 2026</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">{t('est_yield')}</span>
                                        <span className="font-medium text-slate-900">~120g (Wet)</span>
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

                {activeTab === 'photos' && (
                    <PlantPhotos plantId={id!} />
                )}

                {activeTab === 'logs' && (
                    <PlantLogs plantId={id!} plant={plant} />
                )}

                {activeTab === 'metrics' && (
                    <PlantMetrics plantId={id!} />
                )}

                {activeTab === 'tasks' && (
                    <PlantTasks plantId={id!} />
                )}
            </div>

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

            {plant && (
                <AddLogModal
                    isOpen={isLogModalOpen}
                    onClose={() => setIsLogModalOpen(false)}
                    plantId={plant.id}
                    initialType={logModalType}
                    onSuccess={() => {
                        // refreshing plant details might update "last fed" stats if we implement them
                        fetchPlant();
                    }}
                />
            )}
        </div>
    );
};
