import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Plus, Droplets, Scissors, AlertCircle, Edit3 } from 'lucide-react';
import { format } from 'date-fns';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/Form';
import { useForm } from 'react-hook-form';

interface PlantLogsProps {
    plantId: string;
}

const LogTypeIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'WATER': return <Droplets size={16} className="text-blue-500" />;
        case 'NUTRIENT': return <Droplets size={16} className="text-purple-500" />;
        case 'PRUNE': return <Scissors size={16} className="text-orange-500" />;
        case 'ISSUE': return <AlertCircle size={16} className="text-red-500" />;
        case 'NOTE': default: return <Edit3 size={16} className="text-slate-500" />;
    }
};

export const PlantLogs = ({ plantId }: PlantLogsProps) => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            type: 'NOTE',
            title: '',
            content: '',
            logged_at: new Date().toISOString().split('T')[0]
        }
    });

    const fetchLogs = async () => {
        try {
            const res = await api.get(`/plants/${plantId}/logs`);
            setLogs(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [plantId]);

    const onSubmit = async (data: any) => {
        setSubmitting(true);
        try {
            await api.post(`/plants/${plantId}/logs`, {
                ...data,
                logged_at: new Date(data.logged_at).toISOString()
            });
            await fetchLogs();
            setIsModalOpen(false);
            reset();
        } catch (e) {
            console.error(e);
            alert('Failed to add log');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900">Grow Journal</h3>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                    <Plus size={16} />
                    <span>Add Entry</span>
                </button>
            </div>

            <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-8">
                {logs.map((log) => (
                    <div key={log.id} className="relative pl-8">
                        <div className="absolute -left-2.5 top-0 bg-white p-1 rounded-full border border-slate-200">
                            <LogTypeIcon type={log.type} />
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mr-2">{log.type}</span>
                                    <span className="text-xs text-slate-400">{format(new Date(log.logged_at), 'MMM d, yyyy')}</span>
                                </div>
                            </div>
                            {log.title && <h4 className="font-bold text-slate-900 mb-1">{log.title}</h4>}
                            <p className="text-slate-600 text-sm whitespace-pre-wrap">{log.content}</p>
                        </div>
                    </div>
                ))}
                {logs.length === 0 && !loading && (
                    <div className="pl-8 text-slate-400 text-sm py-4">
                        No logs recorded yet.
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Log Entry">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Type"
                            {...register('type')}
                            options={[
                                { value: 'NOTE', label: 'Note' },
                                { value: 'WATER', label: 'Watering' },
                                { value: 'NUTRIENT', label: 'Feeding' },
                                { value: 'PRUNE', label: 'Pruning/Training' },
                                { value: 'ISSUE', label: 'Issue/Pest' },
                                { value: 'PHASE_CHANGE', label: 'Phase Change' }
                            ]}
                        />
                        <Input
                            type="date"
                            label="Date"
                            {...register('logged_at')}
                        />
                    </div>

                    <Input
                        label="Title (Optional)"
                        placeholder="e.g. Topped the 5th node"
                        {...register('title')}
                    />

                    <div className="w-full">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Details</label>
                        <textarea
                            {...register('content')}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all h-32 resize-none"
                            placeholder="Record pH, ppm, observations..."
                        />
                    </div>

                    <div className="pt-2 flex justify-end space-x-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                        <button type="submit" disabled={submitting} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                            {submitting ? 'Saving...' : 'Save Entry'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
