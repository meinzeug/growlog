import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Plus, Flower2 } from 'lucide-react';

export const Plants = () => {
    const [plants, setPlants] = useState<any[]>([]);

    useEffect(() => {
        api.get('/plants').then(res => setPlants(res.data)).catch(console.error);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Plants</h1>
                <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                    <Plus size={20} />
                    <span>New Plant</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {plants.map((plant) => (
                    <div key={plant.id} className="bg-white overflow-hidden rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                        <div className="h-40 bg-slate-100 relative flex items-center justify-center">
                            <Flower2 className="text-slate-300 w-16 h-16" />
                            {/* Photo would go here */}
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-lg text-slate-900">{plant.name}</h3>
                            <p className="text-sm text-green-600 font-medium mb-2">{plant.strain}</p>

                            <div className="flex flex-wrap gap-2 text-xs">
                                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-100">
                                    {plant.phase}
                                </span>
                                <span className="bg-slate-50 text-slate-600 px-2 py-1 rounded-full border border-slate-100">
                                    {plant.status}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
                {plants.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                        No plants found. Add some to your grow!
                    </div>
                )}
            </div>
        </div>
    );
};
