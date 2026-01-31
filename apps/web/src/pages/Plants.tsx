import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Plus, Flower2, Filter } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
    const [plants, setPlants] = useState<any[]>([]);
    const [grows, setGrows] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isTimelineView, setIsTimelineView] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            plant_type: 'PHOTOPERIOD',
            status: 'HEALTHY',
            phase: 'GERMINATION',
            start_date: new Date().toISOString().split('T')[0]
        }
    });

    const fetchData = async () => {
        try {
            const [plantsRes, growsRes] = await Promise.all([
                api.get('/plants'),
                api.get('/grows')
            ]);
            setPlants(plantsRes.data);
            setGrows(growsRes.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            await api.post('/plants', data);
            await fetchData();
            setIsModalOpen(false);
            reset();
        } catch (e) {
            console.error(e);
            alert('Failed to create plant');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">My Plants</h1>
                    <p className="text-slate-500">Track individual plant progress and health.</p>
                </div>
                <button
                    onClick={() => {
                        if (grows.length === 0) {
                            alert('Please create a Grow first!');
                            return;
                        }
                        setIsModalOpen(true);
                    }}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    <span>New Plant</span>
                </button>
            </div>

            {/* View Toggle */}
            <div className="flex justify-between items-center">
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${!isTimelineView ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setIsTimelineView(false)}
                    >
                        Grid View
                    </button>
                    <button
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${isTimelineView ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setIsTimelineView(true)}
                    >
                        Timeline
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-2 filters-scroll overflow-x-auto hide-scrollbar">
                    <button className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap">
                        <Filter size={14} />
                        <span>All Grows</span>
                    </button>
                    <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap">
                        Healthy
                    </button>
                    <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap">
                        Flowering
                    </button>
                </div>
            </div>

            {!isTimelineView ? (
                /* Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {plants.map((plant) => {
                        const age = plant.start_date ? Math.floor((new Date().getTime() - new Date(plant.start_date).getTime()) / (1000 * 60 * 60 * 24)) : 0;
                        // Dynamic Progress Calculation
                        const calculateProgress = () => {
                            if (plant.phase === 'FINISHED' || plant.phase === 'CURED') return 100;
                            if (plant.phase === 'DRYING') return 95;

                            // Autoflowers have a somewhat fixed lifecycle (approx 90-100 days)
                            if (plant.plant_type === 'AUTOFLOWER') {
                                return Math.min(100, Math.round((age / 90) * 100)); // Assumes 90 day cycle
                            }

                            // Photoperiods depend heavily on the phase
                            switch (plant.phase) {
                                case 'GERMINATION':
                                    // Assumes 2 weeks max for germination phase
                                    return Math.min(10, Math.round((age / 14) * 10));
                                case 'VEGETATIVE':
                                    // Assumes approx 2 months veg (very variable, but good baseline)
                                    // Starts at 10%, adds up to 40% more
                                    return Math.min(50, 10 + Math.round(((age - 14) / 60) * 40));
                                case 'FLOWERING':
                                    // Starts at 50%, adds up to 40% more over approx 9-10 weeks
                                    return Math.min(90, 50 + Math.round(((age - 74) / 70) * 40));
                                default:
                                    return 0;
                            }
                        };
                        const progress = Math.max(0, calculateProgress());

                        return (
                            <Link to={`/plants/${plant.id}`} key={plant.id} className="bg-white overflow-hidden rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 group flex flex-col hover:-translate-y-1 relative">
                                <div className="h-48 bg-gradient-to-br from-[#F2F7F3] to-[#E3EFE5] relative flex items-center justify-center overflow-hidden">
                                    {/* Background Decor */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/20 rounded-full blur-3xl translate-x-10 -translate-y-10 group-hover:bg-green-300/30 transition-colors" />

                                    <Flower2 className="text-green-800/20 w-24 h-24 absolute bottom-0 right-0 transform translate-x-4 translate-y-4 rotate-12 group-hover:scale-110 transition-transform duration-500" />

                                    <Flower2 className="text-green-600 w-16 h-16 relative z-10 drop-shadow-sm" />

                                    <div className="absolute top-3 right-3 flex flex-col gap-1 items-end z-20">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm backdrop-blur-sm ${plant.status === 'HEALTHY' ? 'bg-green-50/90 text-green-700 border-green-200' :
                                            plant.status === 'SICK' ? 'bg-red-50/90 text-red-700 border-red-200' :
                                                'bg-yellow-50/90 text-yellow-700 border-yellow-200'
                                            }`}>
                                            {plant.status}
                                        </span>
                                    </div>

                                    <div className="absolute bottom-3 left-3 z-20">
                                        <span className="bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-lg text-slate-700 shadow-sm border border-slate-100 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                            {plant.phase}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-green-700 transition-colors">{plant.name}</h3>
                                    </div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs bg-slate-100/80 px-2 py-0.5 rounded-md text-slate-600 font-medium">
                                            {plant.plant_type.toLowerCase()}
                                        </span>
                                        <span className="text-xs text-slate-400">•</span>
                                        <span className="text-xs text-slate-500 font-medium truncate max-w-[120px]">
                                            {plant.strain || 'Unknown Strain'}
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
                                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Age</span>
                                            <span className="text-sm font-bold text-slate-700">{age} Days</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="text-right">
                                                <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">Grow</span>
                                                <span className="text-xs font-bold text-slate-700 truncate max-w-[80px] block">
                                                    {plant.grow?.name || 'Unassigned'}
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
                        {plants.sort((a, b) => new Date(b.start_date || 0).getTime() - new Date(a.start_date || 0).getTime()).map((plant) => (
                            <div key={plant.id} className="relative pl-16">
                                {/* Dot on timeline */}
                                <div className="absolute left-6 top-6 w-5 h-5 rounded-full border-4 border-white bg-green-500 shadow-md transform -translate-x-1/2 z-20"></div>

                                <div className="bg-slate-50 rounded-2xl p-6 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100 flex flex-col md:flex-row gap-6 items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{plant.start_date}</span>
                                            <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                            <span className="text-xs font-bold text-green-600 uppercase tracking-wider">{plant.phase}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-1">{plant.name}</h3>
                                        <p className="text-slate-600 mb-4">{plant.strain}</p>

                                        <div className="flex gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-slate-400">Type</span>
                                                <span className="font-medium text-slate-700">{plant.plant_type}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs text-slate-400">Status</span>
                                                <span className="font-medium text-slate-700">{plant.status}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Link to={`/plants/${plant.id}`} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-green-500 hover:text-green-600 transition-colors shadow-sm">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {plants.length === 0 && !loading && (
                <div className="text-center py-16 text-slate-500 bg-white rounded-xl border-2 border-dashed border-slate-200">
                    <Flower2 size={48} className="text-slate-300 mx-auto mb-4" />
                    <p className="font-medium">No plants found.</p>
                    <p className="text-sm text-slate-400 mt-1">Add plants to your grow to start tracking.</p>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Plant"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Select
                        label="Assign to Grow"
                        {...register('grow_id')}
                        error={errors.grow_id?.message}
                        options={[
                            { value: '', label: 'Select a grow...' },
                            ...grows.map(g => ({ value: g.id, label: g.name }))
                        ]}
                    />

                    <Input
                        label="Plant Name"
                        placeholder="e.g. Gorilla Glue #4"
                        {...register('name')}
                        error={errors.name?.message}
                    />

                    <Input
                        label="Strain"
                        placeholder="e.g. Indica Dominant"
                        {...register('strain')}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Type"
                            {...register('plant_type')}
                            options={[
                                { value: 'PHOTOPERIOD', label: 'Photoperiod' },
                                { value: 'AUTOFLOWER', label: 'Autoflower' },
                                { value: 'UNKNOWN', label: 'Unknown' }
                            ]}
                        />
                        <Select
                            label="Status"
                            {...register('status')}
                            options={[
                                { value: 'HEALTHY', label: 'Healthy' },
                                { value: 'ISSUES', label: 'Issues' },
                                { value: 'SICK', label: 'Sick' },
                                { value: 'HARVESTED', label: 'Harvested' },
                                { value: 'DEAD', label: 'Dead' }
                            ]}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Phase"
                            {...register('phase')}
                            options={[
                                { value: 'GERMINATION', label: 'Germination' },
                                { value: 'VEGETATIVE', label: 'Vegetation' },
                                { value: 'FLOWERING', label: 'Flowering' },
                                { value: 'DRYING', label: 'Drying' },
                                { value: 'CURED', label: 'Cured' }
                            ]}
                        />
                        <Input
                            type="date"
                            label="Start Date"
                            {...register('start_date')}
                        />
                    </div>

                    <div className="pt-2 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add Plant'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div >
    );
};
