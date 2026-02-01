import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2 } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { DashboardRightPanel } from '../components/dashboard/DashboardRightPanel';
import { PlantGrowthChart } from '../components/dashboard/PlantGrowthChart';
import { RecordMetricModal } from '../components/plant/RecordMetricModal';

const DashboardSkeleton = () => (
    <div className="min-h-full animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            <div className="lg:col-span-8 space-y-8">
                <div className="h-10 w-64 bg-slate-200 rounded mb-8"></div>
                <div className="grid grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-44 rounded-[2rem] bg-slate-200"></div>
                    ))}
                </div>
                <div className="h-[400px] bg-slate-200 rounded-3xl"></div>
            </div>
            <div className="lg:col-span-4 h-full space-y-8">
                <div className="h-[600px] bg-slate-200 rounded-2xl"></div>
            </div>
        </div>
    </div>
);

/**
 * Main aggregator component for the user's grow operation.
 * 
 * Fetches and displays:
 * - Aggregate statistics (total plants, active, healthy, issues)
 * - visual growth charts
 * - Plant list for quick selection
 * 
 * Implements a consolidated data loading strategy `loadData` to prevent
 * waterfalls and ensure consistent state.
 */
export const Dashboard = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [stats, setStats] = useState({ total: 0, active: 0, healthy: 0, waste: 0 });
    const [chartData, setChartData] = useState<any[]>([]);

    // Plant Switcher State
    const [loading, setLoading] = useState(true);
    const [plants, setPlants] = useState<any[]>([]);
    const [selectedPlant, setSelectedPlant] = useState<any | null>(null);
    const [isMetricModalOpen, setIsMetricModalOpen] = useState(false);

    const navigate = useNavigate();

    // Fetch Data
    useEffect(() => {
        const loadData = async () => {
            try {
                const [overviewRes, plantsRes] = await Promise.all([
                    api.get('/overview').catch(() => ({ data: { stats: null, chartData: [] } })),
                    api.get('/plants').catch(() => ({ data: [] }))
                ]);

                if (overviewRes.data) {
                    setStats(overviewRes.data.stats || { total: 0, active: 0, healthy: 0, waste: 0 });
                    setChartData(overviewRes.data.chartData || []);
                }

                const plantList = plantsRes.data || [];
                setPlants(plantList);
                if (plantList.length > 0 && !selectedPlant) {
                    setSelectedPlant(plantList[0]);
                }
            } catch (e) {
                console.error("Dashboard data load failed", e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Fetch Metrics for Selected Plant
    useEffect(() => {
        const fetchPlantMetrics = async () => {
            if (!selectedPlant) return;
            try {
                const res = await api.get(`/plants/${selectedPlant.id}/metrics`);
                const metrics = res.data;
                if (metrics && metrics.length > 0) {
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

        if (selectedPlant) {
            fetchPlantMetrics();
        }
    }, [selectedPlant?.id, isMetricModalOpen]);

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

    const handleMetricSuccess = async () => {
        try {
            const res = await api.get('/overview');
            if (res.data) {
                setStats(res.data.stats || { total: 0, active: 0, healthy: 0, waste: 0 });
                setChartData(res.data.chartData || []);
            }
        } catch (e) { console.error(e); }
    };

    if (loading) return <DashboardSkeleton />;

    return (
        <div className="min-h-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">

                {/* Left Section - Main Content */}
                <div className="lg:col-span-8 space-y-8 flex flex-col">

                    {/* Header */}
                    <header className="flex items-center justify-between mb-2">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 font-sans">
                                {t('hello')} {user?.email.split('@')[0] || 'Grower'}
                            </h1>
                            <p className="text-slate-500 mt-1 text-sm">{t('welcome_back')}</p>
                        </div>
                        <button
                            onClick={() => {
                                const summary = `GrowLog Update:\nActive Plants: ${stats.active}\nHealthy: ${stats.healthy}\nIssues: ${stats.active - stats.healthy}\n\nTracked with GrowLog`;
                                navigator.clipboard.writeText(summary);
                                alert('Grow Summary copied to clipboard!');
                            }}
                            className="flex items-center gap-2 text-sm text-green-600 hover:text-green-800 font-medium px-4 py-2 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                        >
                            <Share2 size={18} />
                            {t('share') || 'Share Summary'}
                        </button>
                    </header>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* Total Plant - Primary Card */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-[2rem] shadow-xl shadow-slate-900/10 flex flex-col justify-between h-44 relative overflow-hidden group border border-slate-700/50">
                            <div className="relative z-10">
                                <p className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                    {t('total_plants')}
                                </p>
                                <h3 className="text-4xl font-bold text-white tracking-tight">{stats.total}</h3>
                            </div>
                            {/* Decorative elements */}
                            <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                            <div className="absolute left-0 bottom-0 w-24 h-24 bg-green-500/10 rounded-full -ml-8 -mb-8 blur-2xl group-hover:bg-green-500/20 transition-all duration-700"></div>
                        </div>

                        {/* Active Plants - Highlight Card */}
                        <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-6 rounded-[2rem] shadow-xl shadow-green-900/20 flex flex-col justify-between h-44 relative overflow-hidden group border border-green-500/20">
                            <div className="relative z-10">
                                <p className="text-sm font-medium text-green-100 mb-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                                    {t('active_plants')}
                                </p>
                                <h3 className="text-4xl font-bold text-white tracking-tight">{stats.active}</h3>
                            </div>
                            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
                            <div className="absolute top-1/2 right-4 transform -translate-y-1/2 opacity-20">
                                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white">
                                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                                    <path d="M2 12H22" />
                                    <path d="M12 2L12 22" />
                                </svg>
                            </div>
                        </div>

                        {/* Healthy Plants */}
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/50 flex flex-col justify-between h-44 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-sm font-medium text-slate-500 mb-2">{t('healthy_plants')}</p>
                                <h3 className="text-4xl font-bold text-slate-900 group-hover:text-green-600 transition-colors">{stats.healthy}</h3>
                            </div>
                            <div className="absolute right-4 bottom-4 w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                            </div>
                        </div>

                        {/* With Issues */}
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/50 flex flex-col justify-between h-44 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-sm font-medium text-slate-500 mb-2">{t('with_issues')}</p>
                                <h3 className="text-4xl font-bold text-slate-900 group-hover:text-amber-500 transition-colors">{stats.waste}</h3>
                            </div>
                            <div className="absolute right-4 bottom-4 w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
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
                            <PlantGrowthChart
                                data={chartData}
                                onEmptyAction={() => {
                                    if (plants.length > 0) setIsMetricModalOpen(true);
                                    else navigate('/plants');
                                }}
                            />
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
        </div >
    );
};
