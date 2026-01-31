import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import api from '../lib/api';
import { Loader2 } from 'lucide-react';

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6'];

export const Reports = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app, I'd fetch aggregated data from a special endpoint
        // For now, I'll fetch raw plants and aggregate client-side to be fast
        const loadData = async () => {
            try {
                const plantsRes = await api.get('/plants');
                const tasksRes = await api.get('/tasks');

                setData({
                    plants: plantsRes.data,
                    tasks: tasksRes.data
                });
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-green-600" size={32} /></div>;

    // Aggregations
    const plants = data?.plants || [];

    // Status Distribution
    const statusCounts = plants.reduce((acc: any, p: any) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
    }, {});

    const statusData = Object.keys(statusCounts).map(key => ({
        name: key,
        value: statusCounts[key]
    }));

    // Phase Distribution
    const phaseCounts = plants.reduce((acc: any, p: any) => {
        acc[p.phase] = (acc[p.phase] || 0) + 1;
        return acc;
    }, {});

    const phaseData = Object.keys(phaseCounts).map(key => ({
        name: key,
        value: phaseCounts[key]
    }));

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
                <p className="text-slate-500">Analytics and insights for your garden.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Plant Status Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Plant Health Status</h3>
                    <div className="h-[300px]">
                        {statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400">No data available</div>
                        )}
                    </div>
                </div>

                {/* Plant Phases Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Plants by Phase</h3>
                    <div className="h-[300px]">
                        {phaseData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={phaseData}>
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: '#f1f5f9' }} />
                                    <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400">No data available</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
