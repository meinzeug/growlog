import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { ArrowLeft, Plus, Thermometer, Droplets, Trash2, Sprout, Wind } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Form';
import { useForm } from 'react-hook-form';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { useLanguage } from '../context/LanguageContext';

export const GrowDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [grow, setGrow] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);

    // Environment Form
    const { register, handleSubmit, reset } = useForm();
    const [submitting, setSubmitting] = useState(false);

    const fetchGrow = async () => {
        try {
            const res = await api.get(`/grows/${id}`);
            setGrow(res.data);
        } catch (e) {
            console.error(e);
            navigate('/grows'); // Redirect if not found
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchGrow();
    }, [id]);

    const onDelete = async () => {
        if (!confirm(t('delete_confirm_grow'))) return;
        try {
            await api.delete(`/grows/${id}`);
            navigate('/grows');
        } catch (e) {
            console.error(e);
            alert(t('failed_delete_grow'));
        }
    };

    const onCreateEnvironment = async (data: any) => {
        setSubmitting(true);
        try {
            await api.post(`/grows/${id}/environments`, data);
            await fetchGrow();
            setIsEnvModalOpen(false);
            reset();
        } catch (e) {
            console.error(e);
            alert(t('failed_add_env'));
        } finally {
            setSubmitting(false);
        }
    };

    const deleteEnvironment = async (envId: string) => {
        if (!confirm(t('delete_env_confirm'))) return;
        try {
            await api.delete(`/environments/${envId}`);
            fetchGrow();
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="p-8">{t('loading_grow_details')}</div>;
    if (!grow) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/grows')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            {grow.name}
                            <span className={clsx(
                                "text-sm px-2 py-1 rounded-full uppercase tracking-wide font-bold",
                                grow.location_type === 'INDOOR' ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"
                            )}>
                                {t(grow.location_type.toLowerCase()) || grow.location_type}
                            </span>
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            {t('started_on')} {format(new Date(grow.created_at), 'MMMM d, yyyy')}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onDelete}
                    className="flex items-center space-x-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-red-100"
                >
                    <Trash2 size={18} />
                    <span>{t('delete_project')}</span>
                </button>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Environments & Notes */}
                <div className="space-y-8 lg:col-span-1">
                    {/* Environments */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Wind size={18} className="text-slate-400" />
                                {t('environments')}
                            </h3>
                            <button onClick={() => setIsEnvModalOpen(true)} className="p-1 hover:bg-green-100 text-green-600 rounded">
                                <Plus size={18} />
                            </button>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {grow.environments?.length > 0 ? (
                                grow.environments.map((env: any) => (
                                    <div key={env.id} className="p-4 hover:bg-slate-50 transition-colors group relative">
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => deleteEnvironment(env.id)} className="text-slate-400 hover:text-red-500">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <h4 className="font-bold text-slate-800 text-sm mb-2">{env.name}</h4>
                                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <span className="font-medium bg-slate-100 px-1.5 py-0.5 rounded">{t(env.medium.toLowerCase()) || env.medium}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="font-medium bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded">{env.light_schedule}</span>
                                            </div>
                                            {(env.temperature_target || env.humidity_target) && (
                                                <div className="col-span-2 flex gap-3 mt-1 text-slate-400">
                                                    {env.temperature_target && (
                                                        <span className="flex items-center gap-1"><Thermometer size={12} /> {env.temperature_target}°C</span>
                                                    )}
                                                    {env.humidity_target && (
                                                        <span className="flex items-center gap-1"><Droplets size={12} /> {env.humidity_target}%</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-6 text-center text-sm text-slate-400">
                                    {t('no_environments')}
                                    <br />
                                    <button onClick={() => setIsEnvModalOpen(true)} className="text-green-600 hover:underline mt-1">{t('add_tent_room')}</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                        <h3 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wider text-slate-400">{t('project_notes')}</h3>
                        <p className="text-slate-600 text-sm whitespace-pre-wrap">
                            {grow.notes || t('no_notes')}
                        </p>
                    </div>
                </div>

                {/* Right Column: Plants */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Sprout className="text-green-500" />
                            {t('plants_in_grow')}
                        </h2>
                        <Link
                            to="/plants"
                            className="text-sm font-medium text-green-600 hover:text-green-700 bg-green-50 px-3 py-1.5 rounded-lg transition-colors hover:bg-green-100"
                        >
                            + {t('add_plant')}
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {grow.plants?.length > 0 ? (
                            grow.plants.map((plant: any) => (
                                <Link
                                    to={`/plants/${plant.id}`} // Fixed Link
                                    key={plant.id}
                                    className="bg-white p-4 rounded-xl border border-slate-200 hover:border-green-300 hover:shadow-md transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-slate-900 group-hover:text-green-700 transition-colors">{plant.name}</h3>
                                        <span className={clsx(
                                            "text-xs font-bold px-2 py-0.5 rounded-full border",
                                            plant.status === 'HEALTHY' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                                        )}>
                                            {t(plant.status.toLowerCase()) || plant.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 mb-4">{plant.strain || 'Unknown Strain'}</p>

                                    <div className="flex gap-2 text-xs">
                                        <span className="px-2 py-1 bg-slate-50 rounded text-slate-600 border border-slate-100">
                                            {t(plant.phase.toLowerCase()) || plant.phase}
                                        </span>
                                        <span className="px-2 py-1 bg-slate-50 rounded text-slate-600 border border-slate-100">
                                            {t(plant.plant_type.toLowerCase()) || plant.plant_type}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
                                <Sprout size={32} className="mx-auto mb-2 opacity-50" />
                                <p>{t('no_plants_yet')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Environment Modal */}
            <Modal
                isOpen={isEnvModalOpen}
                onClose={() => setIsEnvModalOpen(false)}
                title={t('add_environment')}
            >
                <form onSubmit={handleSubmit(onCreateEnvironment)} className="space-y-4">
                    <Input
                        label={t('name_label')}
                        placeholder={t('tent_example')}
                        {...register('name', { required: true })}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label={t('medium')}
                            {...register('medium')}
                            options={[
                                { value: 'SOIL', label: t('soil') },
                                { value: 'COCO', label: t('coco') },
                                { value: 'HYDRO', label: t('hydro') },
                                { value: 'OTHER', label: t('other') }
                            ]}
                        />
                        <Input
                            label={t('light_schedule')}
                            placeholder={t('schedule_example')}
                            {...register('light_schedule')}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label={t('temp_target')}
                            type="number"
                            {...register('temperature_target')}
                        />
                        <Input
                            label={t('humidity_target')}
                            type="number"
                            {...register('humidity_target')}
                        />
                    </div>

                    <div className="pt-2 flex justify-end space-x-3">
                        <button type="button" onClick={() => setIsEnvModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">{t('cancel')}</button>
                        <button type="submit" disabled={submitting} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                            {submitting ? t('adding') : t('add_environment')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
