import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Plus, Flower2, Filter, Search, Pencil, Trash2 } from 'lucide-react'; // Added Search, Pencil, Trash2
import { Modal } from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '../context/LanguageContext';
import { calculatePlantProgress } from '../lib/plantUtils';
import { useSettings } from '../context/SettingsContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner'; // Added LoadingSpinner

const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    grow_id: z.string().min(1, 'Grow is required'),
    strain: z.string().optional(),
    plant_type: z.enum(['PHOTOPERIOD', 'AUTOFLOWER', 'UNKNOWN']),
    status: z.enum(['HEALTHY', 'ISSUES', 'SICK', 'HARVESTED', 'DEAD']),
    phase: z.enum(['GERMINATION', 'VEGETATIVE', 'FLOWERING', 'DRYING', 'CURED', 'FINISHED']).optional(),
    start_date: z.string().optional(), // Date string YYYY-MM-DD
});

type FormData = z.infer<typeof schema>;

export const Plants = () => {
    const { t } = useLanguage();
    const { settings } = useSettings();
    const [plants, setPlants] = useState<any[]>([]);
    const [grows, setGrows] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true); // Initial loading state
    const [submitting, setSubmitting] = useState(false);
    const [isTimelineView, setIsTimelineView] = useState(false);
    const [editingPlant, setEditingPlant] = useState<any>(null);

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPhase, setFilterPhase] = useState('ALL');

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            plant_type: settings.defaultPlantType || 'PHOTOPERIOD',
            status: 'HEALTHY',
            phase: 'GERMINATION',
            start_date: new Date().toISOString().split('T')[0]
        }
    });

    const applyTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const template = templates.find(t => t.id === e.target.value);
        if (template) {
            setValue('name', template.name);
            setValue('strain', template.strain);
            setValue('plant_type', template.plant_type as any);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [plantsRes, growsRes, templatesRes] = await Promise.all([
                api.get('/plants'),
                api.get('/grows'),
                api.get('/templates/plants')
            ]);
            setPlants(plantsRes.data);
            setGrows(growsRes.data);
            setTemplates(templatesRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const deletePlant = async (id: string) => {
        if (!confirm(t('delete_confirm'))) return;
        try {
            await api.delete(`/plants/${id}`);
            await fetchData();
        } catch (e) {
            console.error(e);
            alert('Failed to delete plant');
        }
    };

    const editPlant = (plant: any) => {
        setEditingPlant(plant);
        reset({
            name: plant.name,
            grow_id: plant.grow_id || '',
            strain: plant.strain || '',
            plant_type: plant.plant_type as any,
            status: plant.status as any,
            phase: plant.phase as any,
            start_date: plant.start_date ? plant.start_date.split('T')[0] : ''
        });
        setIsModalOpen(true);
    };

    const onSubmit = async (data: FormData) => {
        setSubmitting(true);
        try {
            if (editingPlant) {
                await api.put(`/plants/${editingPlant.id}`, data);
            } else {
                await api.post('/plants', data);
            }
            await fetchData();
            setIsModalOpen(false);
            setEditingPlant(null);
            reset();
        } catch (e) {
            console.error(e);
            alert('Failed to create plant');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredPlants = plants.filter(plant => {
        const matchesSearch = plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (plant.strain || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPhase = filterPhase === 'ALL' ? true :
            filterPhase === 'VEG' ? ['GERMINATION', 'VEGETATIVE'].includes(plant.phase) :
                filterPhase === 'FLOWER' ? ['FLOWERING', 'DRYING', 'CURED'].includes(plant.phase) : true;
        return matchesSearch && matchesPhase;
    });

    if (loading) return <LoadingSpinner message={t('loading_plants')} />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{t('plants')}</h1>
                    <p className="text-slate-500">{t('track_progress')}</p>
                </div>
                <button
                    onClick={() => {
                        if (grows.length === 0) {
                            alert(t('create_first_grow'));
                            return;
                        }
                        setEditingPlant(null);
                        reset({
                            plant_type: settings.defaultPlantType || 'PHOTOPERIOD',
                            status: 'HEALTHY',
                            phase: 'GERMINATION',
                            start_date: new Date().toISOString().split('T')[0],
                            grow_id: '',
                            name: '',
                            strain: ''
                        });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    <span>{t('new')} {t('plants').slice(0, -1)}</span>
                </button>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${!isTimelineView ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setIsTimelineView(false)}
                    >
                        {t('grid_view')}
                    </button>
                    <button
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${isTimelineView ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setIsTimelineView(true)}
                    >
                        {t('timeline_view')}
                    </button>
                </div>

                <div className="flex-1 w-full md:max-w-md relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder={t('search_plants')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-green-500/50 outline-none transition-all"
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-2 filters-scroll overflow-x-auto hide-scrollbar w-full md:w-auto">
                    <button
                        onClick={() => setFilterPhase('ALL')}
                        className={`flex items-center space-x-2 px-3 py-1.5 border rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filterPhase === 'ALL' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                        <Filter size={14} />
                        <span>{t('all')}</span>
                    </button>
                    <button
                        onClick={() => setFilterPhase('VEG')}
                        className={`px-3 py-1.5 border rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filterPhase === 'VEG' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                        {t('veg')}
                    </button>
                    <button
                        onClick={() => setFilterPhase('FLOWER')}
                        className={`px-3 py-1.5 border rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filterPhase === 'FLOWER' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                        {t('flower')}
                    </button>
                </div>
            </div>

            {!isTimelineView ? (
                /* Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredPlants.map((plant) => {
                        const age = plant.start_date ? Math.floor((new Date().getTime() - new Date(plant.start_date).getTime()) / (1000 * 60 * 60 * 24)) : 0;
                        // Dynamic Progress Calculation
                        const progress = Math.max(0, calculatePlantProgress(plant.phase, plant.plant_type, plant.start_date, settings.phaseDurations));

                        return (
                            <Link to={`/plants/${plant.id}`} key={plant.id} className="bg-white overflow-hidden rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 group flex flex-col hover:-translate-y-1 relative">
                                <div className="h-48 bg-gradient-to-br from-[#F2F7F3] to-[#E3EFE5] relative flex items-center justify-center overflow-hidden">
                                    {/* Background Decor */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/20 rounded-full blur-3xl translate-x-10 -translate-y-10 group-hover:bg-green-300/30 transition-colors" />

                                    <Flower2 className="text-green-800/20 w-24 h-24 absolute bottom-0 right-0 transform translate-x-4 translate-y-4 rotate-12 group-hover:scale-110 transition-transform duration-500" />

                                    <Flower2 className="text-green-600 w-16 h-16 relative z-10 drop-shadow-sm" />

                                    <div className="absolute top-3 left-3 flex gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                editPlant(plant);
                                            }}
                                            className="p-1.5 bg-white/90 rounded-lg text-slate-500 hover:text-green-600 shadow-sm border border-slate-100"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                deletePlant(plant.id);
                                            }}
                                            className="p-1.5 bg-white/90 rounded-lg text-slate-500 hover:text-red-500 shadow-sm border border-slate-100"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    <div className="absolute top-3 right-3 flex flex-col gap-1 items-end z-20">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm backdrop-blur-sm ${plant.status === 'HEALTHY' ? 'bg-green-50/90 text-green-700 border-green-200' :
                                            plant.status === 'SICK' ? 'bg-red-50/90 text-red-700 border-red-200' :
                                                'bg-yellow-50/90 text-yellow-700 border-yellow-200'
                                            }`}>
                                            {t(plant.status.toLowerCase()) || plant.status}
                                        </span>
                                    </div>

                                    <div className="absolute bottom-3 left-3 z-20">
                                        <span className="bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-lg text-slate-700 shadow-sm border border-slate-100 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                            {t(plant.phase?.toLowerCase() || 'germination') || plant.phase}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-green-700 transition-colors">{plant.name}</h3>
                                    </div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs bg-slate-100/80 px-2 py-0.5 rounded-md text-slate-600 font-medium">
                                            {t(plant.plant_type.toLowerCase()) || plant.plant_type}
                                        </span>
                                        <span className="text-xs text-slate-400">•</span>
                                        <span className="text-xs text-slate-500 font-medium truncate max-w-[120px]">
                                            {plant.strain || t('unknown_type')}
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-2 mb-4">
                                        <div className="flex justify-between text-xs mb-1.5">
                                            <span className="text-slate-500 font-medium">Progress</span>
                                            <span className="text-slate-900 font-bold">{progress}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{t('age')}</span>
                                            <span className="text-sm font-bold text-slate-700">{age} {t('days')}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="text-right">
                                                <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">{t('grows').slice(0, -1)}</span>
                                                <span className="text-xs font-bold text-slate-700 truncate max-w-[80px] block">
                                                    {plant.grow?.name || t('unassigned')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                /* Timeline View */
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 min-h-[500px] relative overflow-hidden">
                    <div className="absolute top-0 left-8 bottom-0 w-1 bg-slate-100" />
                    <div className="space-y-12 relative z-10">
                        {filteredPlants.sort((a, b) => new Date(b.start_date || 0).getTime() - new Date(a.start_date || 0).getTime()).map((plant) => (
                            <div key={plant.id} className="relative pl-16">
                                {/* Dot on timeline */}
                                <div className="absolute left-6 top-6 w-5 h-5 rounded-full border-4 border-white bg-green-500 shadow-md transform -translate-x-1/2 z-20"></div>

                                <div className="bg-slate-50 rounded-2xl p-6 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100 flex flex-col md:flex-row gap-6 items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{plant.start_date}</span>
                                            <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                            <span className="text-xs font-bold text-green-600 uppercase tracking-wider">{t(plant.phase?.toLowerCase() || 'germination')}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-1">{plant.name}</h3>
                                        <p className="text-slate-600 mb-4">{plant.strain}</p>

                                        <div className="flex gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-slate-400">{t('type')}</span>
                                                <span className="font-medium text-slate-700">{t(plant.plant_type.toLowerCase())}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs text-slate-400">{t('status')}</span>
                                                <span className="font-medium text-slate-700">{t(plant.status.toLowerCase())}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => editPlant(plant)}
                                            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-green-600 hover:border-green-500 transition-colors shadow-sm"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => deletePlant(plant.id)}
                                            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-red-500 hover:border-red-500 transition-colors shadow-sm"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <Link to={`/plants/${plant.id}`} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-green-500 hover:text-green-600 transition-colors shadow-sm">
                                            {t('view_details')}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {plants.length === 0 && !loading && (
                <div className="text-center py-16 text-slate-500 bg-white rounded-xl border-2 border-dashed border-slate-200">
                    <Flower2 size={48} className="text-slate-300 mx-auto mb-4" />
                    <p className="font-medium">{t('no_plants')}</p>
                    <p className="text-sm text-slate-400 mt-1">{t('no_plants_desc')}</p>

                    <button
                        onClick={() => {
                            if (grows.length === 0) {
                                alert(t('create_first_grow'));
                                return;
                            }
                            setEditingPlant(null);
                            reset({
                                plant_type: settings.defaultPlantType || 'PHOTOPERIOD',
                                status: 'HEALTHY',
                                phase: 'GERMINATION',
                                start_date: new Date().toISOString().split('T')[0],
                                grow_id: '',
                                name: '',
                                strain: ''
                            });
                            setIsModalOpen(true);
                        }}
                        className="mt-4 inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                    >
                        <Plus size={18} />
                        <span>{t('add_plant')}</span>
                    </button>
                </div>
            )}

            {plants.length > 0 && filteredPlants.length === 0 && !loading && (
                <div className="text-center py-16 text-slate-500">
                    <Search size={48} className="text-slate-300 mx-auto mb-4" />
                    <p className="font-medium">{t('no_results') || 'No plants found matching your search'}</p>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingPlant(null);
                    reset();
                }}
                title={editingPlant ? t('edit') + ' ' + t('plants').slice(0, -1) : t('add_plant')}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg mb-4">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                            {t('quick_template') || 'Quick Fill Template'}
                        </label>
                        <select
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-green-500"
                            onChange={applyTemplate}
                            defaultValue=""
                        >
                            <option value="" disabled>{t('select_template') || 'Select a template...'}</option>
                            {templates.map(tmp => (
                                <option key={tmp.id} value={tmp.id}>{tmp.name}</option>
                            ))}
                        </select>
                    </div>

                    <Select
                        label={t('assign_grow')}
                        {...register('grow_id')}
                        error={errors.grow_id?.message}
                        options={[
                            { value: '', label: t('select_grow') },
                            ...grows.map(g => ({ value: g.id, label: g.name }))
                        ]}
                    />

                    <Input
                        label={t('plant_name')}
                        placeholder={t('plant_name_placeholder')}
                        {...register('name')}
                        error={errors.name?.message}
                    />

                    <Input
                        label={t('strain')}
                        placeholder={t('strain_placeholder')}
                        {...register('strain')}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label={t('type')}
                            {...register('plant_type')}
                            options={[
                                { value: 'PHOTOPERIOD', label: t('photoperiod') },
                                { value: 'AUTOFLOWER', label: t('autoflower') },
                                { value: 'UNKNOWN', label: t('unknown_type') }
                            ]}
                        />
                        <Select
                            label={t('status')}
                            {...register('status')}
                            options={[
                                { value: 'HEALTHY', label: t('healthy') },
                                { value: 'ISSUES', label: t('issues') },
                                { value: 'SICK', label: t('sick') },
                                { value: 'HARVESTED', label: t('harvested') },
                                { value: 'DEAD', label: t('dead') }
                            ]}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label={t('stage')}
                            {...register('phase')}
                            options={[
                                { value: 'GERMINATION', label: t('germination') },
                                { value: 'VEGETATIVE', label: t('veg') },
                                { value: 'FLOWERING', label: t('flower') },
                                { value: 'DRYING', label: t('drying') },
                                { value: 'CURED', label: t('cured') }
                            ]}
                        />
                        <Input
                            type="date"
                            label={t('started')}
                            {...register('start_date')}
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
                            disabled={submitting}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            {submitting ? t('saving') : (editingPlant ? t('save') : t('add_plant'))}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
