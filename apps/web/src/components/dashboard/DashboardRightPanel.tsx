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
                <div className="w-full h-[60%] bg-gradient-to-b from-[#E8F3EE] to-[#E8F3EE] absolute top-0 left-0" />

                {/* Dark curved bottom section */}
                <div className="absolute bottom-0 left-0 w-full h-[55%] bg-[#1A2F2B] rounded-t-[3rem] z-10" />

                {/* Plant Image - Centered and floating above the curve */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-56 h-72 z-10 transition-all duration-500 ease-in-out">
                    {selectedPlant?.image_url ? (
                        <img
                            key={selectedPlant?.id} // Force re-render for animation on change
                            src={selectedPlant.image_url}
                            alt={selectedPlant?.name || "Plant"}
                            className="w-full h-full object-cover rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-500"
                        />
                    ) : (
                        <div key={selectedPlant?.id} className="w-full h-full bg-green-50 rounded-2xl shadow-2xl flex flex-col items-center justify-center border-4 border-white animate-in fade-in zoom-in duration-500">
                            <Sprout size={64} className="text-green-200 mb-2" />
                            <span className="text-sm font-medium text-green-800/50">{t('no_image')}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="relative z-20 h-full flex flex-col p-6 pt-64">
                {/* Sensor Cards Container - Overlapping the bottom curve */}
                <div className="mt-auto space-y-4 relative z-20">

                    {/* Action Buttons Row */}
                    <div className="grid grid-cols-2 gap-3 mb-2">
                        <button
                            onClick={() => onViewDetails(selectedPlant)}
                            className="bg-[#2A403B] hover:bg-[#3A504B] text-white/90 py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors font-medium text-sm backdrop-blur-sm border border-white/5"
                        >
                            <span>{t('details')}</span>
                            <ArrowRight size={16} />
                        </button>
                        <button
                            onClick={() => onRecordData(selectedPlant)}
                            className="bg-green-500 hover:bg-green-400 text-white py-3 rounded-2xl flex items-center justify-center gap-2 transition-colors font-medium text-sm shadow-lg shadow-green-900/20"
                        >
                            <Plus size={16} />
                            <span>{t('record')}</span>
                        </button>
                    </div>

                    {/* Light Card */}
                    <div className="bg-white p-5 rounded-[1.5rem] shadow-xl shadow-green-900/10 flex flex-col justify-center">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-slate-50 rounded-full text-slate-900">
                                    <Sun size={20} className="stroke-[1.5]" />
                                </div>
                                <span className="font-bold text-lg text-slate-800">{t('light')}</span>
                            </div>
                            <span className="font-bold text-lg text-slate-900">{Math.round(light)}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden w-full">
                            <div className="h-full bg-[#1A2F2B] rounded-full" style={{ width: `${Math.min(light, 100)}%` }}></div>
                        </div>
                    </div>

                    {/* Temperature Card */}
                    <div className="bg-white p-5 rounded-[1.5rem] shadow-xl shadow-green-900/10 flex flex-col justify-center">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-slate-50 rounded-full text-slate-900">
                                    <Thermometer size={20} className="stroke-[1.5]" />
                                </div>
                                <span className="font-bold text-lg text-slate-800">{t('temperature')}</span>
                            </div>
                            <span className="font-bold text-lg text-slate-900">{temp}°C</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden w-full">
                            <div className="h-full bg-[#1A2F2B] rounded-full" style={{ width: `${Math.min((temp / 40) * 100, 100)}%` }}></div>
                        </div>
                    </div>

                    {/* Humidity Card */}
                    <div className="bg-white p-5 rounded-[1.5rem] shadow-xl shadow-green-900/10 flex flex-col justify-center">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-slate-50 rounded-full text-slate-900">
                                    <Droplets size={20} className="stroke-[1.5]" />
                                </div>
                                <span className="font-bold text-lg text-slate-800">{t('humidity')}</span>
                            </div>
                            <span className="font-bold text-lg text-slate-900">{humidity}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden w-full">
                            <div className="h-full bg-[#1A2F2B] rounded-full" style={{ width: `${Math.min(humidity, 100)}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
