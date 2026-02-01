import { Sun, Thermometer, Droplets, ChevronLeft, ChevronRight, Sprout, ArrowRight, Plus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface DashboardRightPanelProps {
    plants: any[];
    selectedPlant: any | null;
    onSelectPlant: (plant: any) => void;
    onRecordData: (plant: any) => void;
    onViewDetails: (plant: any) => void;
}

export const DashboardRightPanel = ({ plants, selectedPlant, onSelectPlant, onRecordData, onViewDetails }: DashboardRightPanelProps) => {
    const { t } = useLanguage();

    // Helper to get latest metrics
    const getLatestMetric = (key: string, defaultVal = 0) => {
        if (!selectedPlant) return defaultVal;

        // Try to find in environment first (if backend provides it)
        if (selectedPlant.environment && selectedPlant.environment[key]) {
            return selectedPlant.environment[key];
        }

        // Otherwise look in metrics array if present (assuming fetching plants includes metrics)
        // Or just use the prop passed down if we enhance the backend later.
        // For now, let's assume the parent might pass enriched plant objects or we rely on what's available.
        // Check for latest metrics recorded on the plant
        if (selectedPlant.latest_record) {
            if (key === 'temperature') return selectedPlant.latest_record.temperature_c || defaultVal;
            if (key === 'humidity') return selectedPlant.latest_record.humidity_pct || defaultVal;

            if (key === 'light') return selectedPlant.latest_record.light_ppfd || defaultVal;
        }

        return defaultVal;
    };

    const temp = getLatestMetric('temperature', 0);
    const humidity = getLatestMetric('humidity', 0);
    const light = getLatestMetric('light', 0);

    const handlePrev = () => {
        if (!plants.length) return;
        const idx = plants.findIndex(p => p.id === selectedPlant?.id);
        const newIdx = idx <= 0 ? plants.length - 1 : idx - 1;
        onSelectPlant(plants[newIdx]);
    };

    const handleNext = () => {
        if (!plants.length) return;
        const idx = plants.findIndex(p => p.id === selectedPlant?.id);
        const newIdx = idx >= plants.length - 1 ? 0 : idx + 1;
        onSelectPlant(plants[newIdx]);
    };

    if (plants.length === 0) {
        return (
            <div className="flex flex-col h-full min-h-[500px] lg:min-h-[600px] relative rounded-[3rem] overflow-hidden bg-[#E8F1EA] items-center justify-center p-8 text-center">
                <Sprout size={48} className="text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium">{t('no_plants')}</p>
                <p className="text-sm text-slate-400">{t('add_plant_hint')}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full min-h-[500px] lg:min-h-[600px] relative rounded-[3rem] overflow-hidden bg-[#E8F1EA]">

            {/* Plant Switcher Header */}
            <div className="absolute top-6 left-0 w-full z-40 flex justify-between items-center px-8">
                <button
                    onClick={handlePrev}
                    className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm text-slate-600 hover:bg-white hover:text-green-600 transition-all"
                >
                    <ChevronLeft size={20} />
                </button>

                <div className="flex flex-col items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{t('current_plant')}</span>
                    <h3 className="font-bold text-slate-900 text-lg truncate max-w-[150px]">{selectedPlant?.name}</h3>
                </div>

                <button
                    onClick={handleNext}
                    className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm text-slate-600 hover:bg-white hover:text-green-600 transition-all"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Background Image / Plant */}
            <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
                <div className="w-full h-[60%] bg-[#E8F3EE] absolute top-0 left-0">
                    {/* Subtle grid pattern for technical feel */}
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)', backgroundSize: '20px 20px' }}>
                    </div>
                </div>

                {/* Dark curved bottom section */}
                <div className="absolute bottom-0 left-0 w-full h-[65%] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-t-[3rem] z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]" />

                {/* Plant Image - Centered and floating above the curve */}
                <div className="absolute top-24 left-1/2 -translate-x-1/2 w-48 h-64 z-10 transition-all duration-500 ease-in-out group">
                    <div className="absolute inset-0 bg-green-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-60"></div>
                    {selectedPlant?.image_url ? (
                        <img
                            key={selectedPlant?.id} // Force re-render for animation on change
                            src={selectedPlant.image_url}
                            alt={selectedPlant?.name || "Plant"}
                            className="w-full h-full object-cover rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-500 relative border-4 border-white/10"
                        />
                    ) : (
                        <div key={selectedPlant?.id} className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl shadow-2xl flex flex-col items-center justify-center border-4 border-white/10 animate-in fade-in zoom-in duration-500 relative backdrop-blur-md">
                            <Sprout size={64} className="text-green-400 mb-2 drop-shadow-lg" />
                            <span className="text-sm font-medium text-slate-400">{t('no_image')}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="relative z-20 h-full flex flex-col p-6 pt-64">
                {/* Sensor Cards Container - Overlapping the bottom curve */}
                <div className="mt-auto space-y-4 relative z-20">

                    {/* Action Buttons Row */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <button
                            onClick={() => onViewDetails(selectedPlant)}
                            className="bg-white/10 hover:bg-white/20 text-white py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all font-medium text-sm backdrop-blur-md border border-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <span>{t('details')}</span>
                            <ArrowRight size={16} />
                        </button>
                        <button
                            onClick={() => onRecordData(selectedPlant)}
                            className="bg-green-500 hover:bg-green-400 text-white py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all font-medium text-sm shadow-lg shadow-green-500/20 hover:shadow-green-500/40 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Plus size={16} strokeWidth={2.5} />
                            <span>{t('record')}</span>
                        </button>
                    </div>

                    {/* Sensor Grid */}
                    <div className="grid grid-cols-1 gap-3">
                        {/* Light Card */}
                        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 flex items-center justify-between backdrop-blur-sm group hover:bg-slate-800/80 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-yellow-500/10 rounded-xl text-yellow-500 group-hover:bg-yellow-500/20 transition-colors">
                                    <Sun size={20} className="stroke-[2]" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">{t('light')}</span>
                                    <span className="font-bold text-lg text-white">{Math.round(light)} <span className="text-xs font-normal text-slate-500">PPFD</span></span>
                                </div>
                            </div>
                            <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]" style={{ width: `${Math.min(light / 10, 100)}%` }}></div>
                            </div>
                        </div>

                        {/* Temperature Card */}
                        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 flex items-center justify-between backdrop-blur-sm group hover:bg-slate-800/80 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-500 group-hover:bg-orange-500/20 transition-colors">
                                    <Thermometer size={20} className="stroke-[2]" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">{t('temperature')}</span>
                                    <span className="font-bold text-lg text-white">{temp}°C</span>
                                </div>
                            </div>
                            <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" style={{ width: `${Math.min((temp / 40) * 100, 100)}%` }}></div>
                            </div>
                        </div>

                        {/* Humidity Card */}
                        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 flex items-center justify-between backdrop-blur-sm group hover:bg-slate-800/80 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                                    <Droplets size={20} className="stroke-[2]" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">{t('humidity')}</span>
                                    <span className="font-bold text-lg text-white">{humidity}%</span>
                                </div>
                            </div>
                            <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${Math.min(humidity, 100)}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
