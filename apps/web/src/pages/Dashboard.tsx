import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Sprout, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Dashboard = () => {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        // In a real app we'd trigger a fetch for dashboard stats
        // For now, let's just mock or fetch something simple
    }, []);

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500">Welcome back to your garden.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                            <Sprout size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Active Plants</p>
                            <h3 className="text-2xl font-bold text-slate-900">--</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Issues</p>
                            <h3 className="text-2xl font-bold text-slate-900">--</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Tasks Today</p>
                            <h3 className="text-2xl font-bold text-slate-900">--</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Placeholder for recent activity or charts */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-64 flex items-center justify-center text-slate-400">
                Recent Activity (Placeholder)
            </div>
        </div>
    );
};
