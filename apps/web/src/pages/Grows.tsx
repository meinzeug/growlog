import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Plus } from 'lucide-react';

export const Grows = () => {
    const [grows, setGrows] = useState<any[]>([]);

    useEffect(() => {
        api.get('/grows').then(res => setGrows(res.data)).catch(console.error);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">My Grows</h1>
                <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                    <Plus size={20} />
                    <span>New Grow</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {grows.map((grow) => (
                    <div key={grow.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{grow.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-slate-500 mb-4">
                            <span className="bg-slate-100 px-2 py-1 rounded text-xs font-semibold">{grow.location_type}</span>
                            <span>• {grow.plants?.length || 0} Plants</span>
                        </div>
                        <p className="text-slate-600 text-sm line-clamp-2">{grow.notes || 'No notes'}</p>
                    </div>
                ))}
                {grows.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                        No grows found. Create one to get started!
                    </div>
                )}
            </div>
        </div>
    );
};
