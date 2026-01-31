import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Plus, Trash2, Sprout, Thermometer, Droplets, Calendar, Home, Sun, Activity, Wind } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import clsx from 'clsx';

// Shared types (ideally import from @growlog/shared)

const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    location_type: z.enum(['INDOOR', 'OUTDOOR']),
    notes: z.string().optional()
});

type FormData = z.infer<typeof schema>;

export const Grows = () => {
    const [grows, setGrows] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            location_type: 'INDOOR'
        }
    });

    const fetchGrows = async () => {
        try {
            const res = await api.get('/grows');
            setGrows(res.data);
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
            await api.post('/grows', data);
            await fetchGrows();
            setIsModalOpen(false);
            reset();
        } catch (e) {
            console.error(e);
            alert('Failed to create grow');
        } finally {
            setLoading(false);
        }
    };

    const deleteGrow = async (id: string) => {
        if (!confirm('Are you sure? This will delete all plants in this grow.')) return;
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
                    <h1 className="text-3xl font-bold text-slate-900">My Grows</h1>
                    <p className="text-slate-500">Manage your growing spaces and projects.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    <span>New Grow</span>
                </button>
            </div>

            {/* Dashboard Headers */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-28">
                    <div className="flex justify-between items-start">
                        <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">Total Plants</span>
                        <Sprout size={18} className="text-green-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900">{grows.reduce((acc, g) => acc + (g.plants?.length || 0), 0)}</span>
                        <span className="text-xs text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded-md">+4 this week</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-28">
                    <div className="flex justify-between items-start">
                        <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">Avg Temp</span>
                        <Thermometer size={18} className="text-orange-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900">24°C</span>
                        <span className="text-xs text-slate-400">Daytime</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-28">
                    <div className="flex justify-between items-start">
                        <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">Avg Humidity</span>
                        <Droplets size={18} className="text-blue-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900">55%</span>
                        <span className="text-xs text-slate-400">RH</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-28">
                    <div className="flex justify-between items-start">
                        <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">Harvest Est.</span>
                        <Calendar size={18} className="text-purple-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900">12 Days</span>
                        <span className="text-xs text-slate-400">Next Crop</span>
                    </div>
                </div>
            </div>

            {/* Grows List */}
            <div className="space-y-6">
                {grows.map((grow) => {
                    const plantCount = grow.plants?.length || 0;

                    // Real Yield Estimation (Sum of plant estimates)
                    const estimatedYield = grow.plants?.reduce((sum: number, p: any) => sum + (p.estimated_yield_grams || 0), 0) || 0;

                    // Real Progress based on Plant Phases
                    const phaseWeights: Record<string, number> = {
                        'GERMINATION': 10,
                        'VEGETATIVE': 40,
                        'FLOWERING': 70,
                        'DRYING': 90,
                        'CURED': 95,
                        'FINISHED': 100
                    };
                    const totalPhaseScore = grow.plants?.reduce((sum: number, p: any) => sum + (phaseWeights[p.phase] || 0), 0) || 0;
                    const progress = plantCount > 0 ? totalPhaseScore / plantCount : 0;

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
                                                    <span>{grow.location_type}</span>
                                                    <span>•</span>
                                                    <span>Started {new Date(grow.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                deleteGrow(grow.id);
                                            }}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                            title="Delete Grow"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <span className="block text-xs text-slate-500 uppercase font-bold mb-1">Plants</span>
                                            <span className="text-lg font-bold text-slate-800">{plantCount}</span>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <span className="block text-xs text-slate-500 uppercase font-bold mb-1">Est. Yield</span>
                                            <span className="text-lg font-bold text-slate-800">{estimatedYield > 0 ? `~${estimatedYield}g` : '-'}</span>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <span className="block text-xs text-slate-500 uppercase font-bold mb-1">Stage</span>
                                            <span className="text-lg font-bold text-slate-800">
                                                {progress < 20 ? 'Early' : progress < 60 ? 'Veg' : 'Flower'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Timeline Progress */}
                                    <div className="mb-2">
                                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                                            <span className={progress < 25 ? 'text-green-600' : ''}>Germination</span>
                                            <span className={progress >= 25 && progress < 50 ? 'text-green-600' : ''}>Veg</span>
                                            <span className={progress >= 50 && progress < 90 ? 'text-green-600' : ''}>Flower</span>
                                            <span className={progress >= 90 ? 'text-green-600' : ''}>Harvest</span>
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
                                        Environment (Target)
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
                                        <div className="mb-6 text-sm text-slate-400 italic">No environment configured.</div>
                                    )}

                                    <div className="mt-auto space-y-2">
                                        <button className="w-full py-2 bg-blue-50 text-blue-600 font-bold text-sm rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                                            <Droplets size={16} />
                                            <span>Log Watering</span>
                                        </button>
                                        <Link to={`/grows/${grow.id}`} className="w-full py-2 border border-slate-200 text-slate-600 font-bold text-sm rounded-lg hover:border-green-500 hover:text-green-600 transition-colors flex items-center justify-center gap-2">
                                            View Details
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
                        <p className="font-medium">No grows found yet.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-2 text-green-600 hover:underline"
                        >
                            Create your first grow
                        </button>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Grow"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Grow Name"
                        placeholder="e.g. Winter Run 2024"
                        {...register('name')}
                        error={errors.name?.message}
                    />

                    <Select
                        label="Location"
                        {...register('location_type')}
                        options={[
                            { value: 'INDOOR', label: 'Indoor' },
                            { value: 'OUTDOOR', label: 'Outdoor' }
                        ]}
                    />

                    <div className="w-full">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
                        <textarea
                            {...register('notes')}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all h-24 resize-none"
                            placeholder="Tent size, equipment details..."
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
                            {loading ? 'Creating...' : 'Create Grow'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
