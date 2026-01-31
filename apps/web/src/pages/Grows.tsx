import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Plus, Trash2, Sprout } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import clsx from 'clsx';

// Shared types (ideally import from @growlog/shared)
const GrowLocationType = {
    INDOOR: 'INDOOR',
    OUTDOOR: 'OUTDOOR'
} as const;

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {grows.map((grow) => (
                    <div key={grow.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => deleteGrow(grow.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                title="Delete Grow"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                                <Sprout size={24} />
                            </div>
                            <span className={clsx(
                                "text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider",
                                grow.location_type === 'INDOOR' ? "bg-purple-50 text-purple-600" : "bg-orange-50 text-orange-600"
                            )}>
                                {grow.location_type}
                            </span>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 mb-2">{grow.name}</h3>

                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Plants</span>
                                <span className="font-medium text-slate-900">{grow.plants?.length || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Created</span>
                                <span className="font-medium text-slate-900">
                                    {new Date(grow.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        {grow.notes && (
                            <p className="text-slate-500 text-sm line-clamp-2 border-t border-slate-50 pt-3">
                                {grow.notes}
                            </p>
                        )}
                    </div>
                ))}
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
