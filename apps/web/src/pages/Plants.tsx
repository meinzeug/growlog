import { useState, useEffect } from 'react';
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

            {/* Filters (Mock UI for now, logic can be added easily) */}
            <div className="flex gap-2 pb-2 overflow-x-auto">
                <button className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                    <Filter size={14} />
                    <span>All Grows</span>
                </button>
                <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                    Healthy
                </button>
                <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                    Flowering
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {plants.map((plant) => (
                    <div key={plant.id} className="bg-white overflow-hidden rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group flex flex-col">
                        <div className="h-40 bg-gradient-to-br from-green-50 to-emerald-100 relative flex items-center justify-center">
                            <Flower2 className="text-green-300 w-16 h-16" />
                            <div className="absolute top-2 right-2 flex gap-1">
                                <span className="bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded text-slate-600 shadow-sm">
                                    {plant.phase}
                                </span>
                            </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{plant.name}</h3>
                            </div>
                            <p className="text-sm text-slate-500 font-medium mb-3">{plant.strain || 'Unknown Strain'}</p>

                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
                                <span className="text-xs text-slate-400">
                                    {plant.grow?.name || 'Unassigned'}
                                </span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${plant.status === 'HEALTHY' ? 'bg-green-50 text-green-600 border-green-100' :
                                        plant.status === 'SICK' ? 'bg-red-50 text-red-600 border-red-100' :
                                            'bg-yellow-50 text-yellow-600 border-yellow-100'
                                    }`}>
                                    {plant.status}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {plants.length === 0 && (
                    <div className="col-span-full text-center py-16 text-slate-500 bg-white rounded-xl border-2 border-dashed border-slate-200">
                        <Flower2 size={48} className="text-slate-300 mx-auto mb-4" />
                        <p className="font-medium">No plants found.</p>
                        <p className="text-sm text-slate-400 mt-1">Add plants to your grow to start tracking.</p>
                    </div>
                )}
            </div>

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
        </div>
    );
};
