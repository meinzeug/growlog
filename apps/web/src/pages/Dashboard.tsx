import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Search, Bell } from 'lucide-react';
import { DashboardRightPanel } from '../components/dashboard/DashboardRightPanel';
import { PlantGrowthChart } from '../components/dashboard/PlantGrowthChart';
import { RecordMetricModal } from '../components/plant/RecordMetricModal';

export const Dashboard = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [stats, setStats] = useState({ total: 0, active: 0, healthy: 0, waste: 0 });
    const [chartData, setChartData] = useState<any[]>([]);

    // Plant Switcher State
    const [plants, setPlants] = useState<any[]>([]);
    const [selectedPlant, setSelectedPlant] = useState<any | null>(null);
    const [isMetricModalOpen, setIsMetricModalOpen] = useState(false);

    const navigate = useNavigate();

    // Fetch Overview Stats
    const fetchOverview = async () => {
        try {
            const res = await api.get('/overview');
            if (res.data) {
                setStats(res.data.stats || { total: 0, active: 0, healthy: 0, waste: 0 });
                setChartData(res.data.chartData || []);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchOverview();
    }, []);

    // Fetch Plants and default selection
    const fetchPlants = async () => {
        try {
            const res = await api.get('/plants');
            const plantList = res.data;
            setPlants(plantList);
            // Default selection if none selected yet
            if (plantList.length > 0 && !selectedPlant) {
                setSelectedPlant(plantList[0]);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchPlants();
    }, []);

    // Fetch Metrics for Selected Plant
    useEffect(() => {
        const fetchPlantMetrics = async () => {
            if (!selectedPlant) return;
            try {
                // Fetch latest metrics. We can use the existing list endpoint which returns all, or if we need just one, we slice.
                // Assuming /plants/:id/metrics exists
                const res = await api.get(`/plants/${selectedPlant.id}/metrics`);
                const metrics = res.data;
                if (metrics && metrics.length > 0) {
                    // Get the most recent one (assuming sorted or we sort)
                    // Usually typically sorted by date desc or asc. Let's assume user just posted one, it's there.
                    // We sort by date desc just to be sure
                    const sorted = metrics.sort((a: any, b: any) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
                    const latest = sorted[0];

                    setSelectedPlant((prev: any) => ({
                        ...prev,
                        latest_record: latest
                    }));
                }
            } catch (e) {
                console.error("Error fetching metrics for plant", e);
            }
        };

        // Only fetch if we don't have it or need refresh. For now, simple fetch on select.
        // Also if we just saved, we might trigger this.
        if (selectedPlant) {
            fetchPlantMetrics();
        }
    }, [selectedPlant?.id, isMetricModalOpen]); // Re-fetch when modal closes (metrics updated)

    const handleSelectPlant = (plant: any) => {
        setSelectedPlant(plant);
    };

    const handleRecordData = (plant: any) => {
        if (plant) {
            setSelectedPlant(plant); // Ensure correct plant is selected
            setIsMetricModalOpen(true);
        }
    };

    const handleViewDetails = (plant: any) => {
        if (plant) {
            navigate(`/plants/${plant.id}`);
        }
    };

    const handleMetricSuccess = () => {
        // Refresh everything
        fetchOverview();
    };

    return (
        <div className="min-h-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">

                {/* Left Section - Main Content */}
                <div className="lg:col-span-8 space-y-8 flex flex-col">

                    {/* Header */}
                    <header className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 font-sans">
                                {t('hello')} {user?.email.split('@')[0] || 'Grower'}
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="p-3 bg-white rounded-full shadow-sm text-slate-400 hover:text-green-600 transition-colors">
                                <Search size={20} />
                            </button>
                            <button className="p-3 bg-white rounded-full shadow-sm text-slate-400 hover:text-green-600 transition-colors relative">
                                <Bell size={20} />
                                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                            </button>
                        </div>
                    </header>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* Total Plant - Active State Style */}
                        <div className="bg-[#F2F7F3] p-6 rounded-3xl border-2 border-green-500 flex flex-col justify-between h-40 relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-sm font-medium text-slate-600 mb-2">{t('total_plants')}</p>
                                <h3 className="text-4xl font-bold text-slate-900">{stats.total}</h3>
                            </div>
                            {/* Decorative subtle highlight */}
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-green-200/50 rounded-full blur-2xl"></div>
                        </div>

                        {/* Active Plants */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm flex flex-col justify-between h-40 hover:shadow-md transition-shadow">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-2">{t('active_plants')}</p>
                                <h3 className="text-4xl font-bold text-slate-900">{stats.active}</h3>
                            </div>
                        </div>

                        {/* Healthy Plants */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm flex flex-col justify-between h-40 hover:shadow-md transition-shadow">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-2">{t('healthy_plants')}</p>
                                <h3 className="text-4xl font-bold text-slate-900">{stats.healthy}</h3>
                            </div>
                        </div>

                        {/* Waste Plant */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm flex flex-col justify-between h-40 hover:shadow-md transition-shadow">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-2">{t('with_issues')}</p>
                                <h3 className="text-4xl font-bold text-slate-900">{stats.waste}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-50 flex-1 min-h-[400px]">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-slate-900">{t('growth_chart')}</h2>
                            <div className="flex gap-2 bg-slate-50 p-1 rounded-lg">
                                <button className="px-4 py-1.5 text-xs font-semibold bg-white text-slate-900 shadow-sm rounded-md">{t('week')}</button>
                            </div>
                        </div>

                        <div className="h-[300px] w-full relative pl-6">
                            <PlantGrowthChart data={chartData} />
                        </div>
                    </div>
                </div>

                {/* Right Section - Visual Panel */}
                <div className="lg:col-span-4 h-full">
                    <DashboardRightPanel
                        plants={plants}
                        selectedPlant={selectedPlant}
                        onSelectPlant={handleSelectPlant}
                        onRecordData={handleRecordData}
                        onViewDetails={handleViewDetails}
                    />
                </div>
            </div>

            {/* Modals */}
            <RecordMetricModal
                isOpen={isMetricModalOpen}
                onClose={() => setIsMetricModalOpen(false)}
                onSuccess={handleMetricSuccess}
                plant={selectedPlant}
            />
        </div>
    );
};
