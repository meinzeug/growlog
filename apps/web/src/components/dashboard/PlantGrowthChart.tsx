import { useLanguage } from '../../context/LanguageContext';

interface ChartData {
    label: string;
    height: number;
}

interface PlantGrowthChartProps {
    data?: ChartData[];
    /** Callback to execute when the empty state action button is clicked */
    onEmptyAction?: () => void;
}

/**
 * Visualizes plant growth over time (height vs weaks).
 * 
 * Features:
 * - Robust empty state with user call-to-action
 * - localized messages
 * - Interactive tooltips
 */
export const PlantGrowthChart = ({ data, onEmptyAction }: PlantGrowthChartProps) => {
    const { t } = useLanguage();
    // Check if we have valid data
    const hasData = data && data.length > 0;

    // Use fallback data for the "Ghost" chart background if no data
    const displayData = hasData ? data : [
        { label: 'Week 1', height: 20 },
        { label: 'Week 2', height: 35 },
        { label: 'Week 3', height: 50 },
        { label: 'Week 4', height: 75 },
        { label: 'Week 5', height: 90 },
    ];
    const maxVal = 100;

    return (
        <div className="w-full h-full flex flex-col relative">
            {!hasData && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-2xl border border-slate-100/50 transition-all">
                    <div className="bg-white p-4 rounded-full shadow-lg mb-3 animate-in zoom-in duration-300">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </div>
                    <h3 className="text-slate-900 font-bold text-sm mb-1">{t('no_growth_data')}</h3>
                    <p className="text-slate-500 text-xs text-center px-6 mb-4 max-w-[200px]">
                        {t('start_recording_hint')}
                    </p>
                    {onEmptyAction && (
                        <button
                            onClick={onEmptyAction}
                            className="text-xs font-bold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-lg transition-colors"
                        >
                            {t('record_metrics') || 'Record Metric'}
                        </button>
                    )}
                </div>
            )}

            <div className={`flex-1 flex items-end gap-3 sm:gap-6 justify-between px-2 pb-8 border-l border-b border-slate-100 relative ${!hasData ? 'opacity-30 blur-[1px]' : ''}`}>
                {/* Y Axis Grid Lines */}
                {[0, 25, 50, 75, 100].map((val) => (
                    <div key={val} className="absolute w-full h-[1px] bg-slate-50 left-0" style={{ bottom: `${val}%` }}>
                        <span className="absolute -left-8 -top-2 text-[10px] text-slate-300 font-medium w-6 text-right">{val}</span>
                    </div>
                ))}

                {displayData!.map((item, i) => (
                    <div key={item.label} className="relative flex-1 flex items-end justify-center h-full z-10 group">
                        {/* Only show interactive tooltips if we have data */}
                        {hasData && (
                            <>
                                <div className="absolute bottom-full mb-3 bg-slate-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 whitespace-nowrap z-20 pointer-events-none shadow-xl shadow-slate-900/20">
                                    {item.height} cm
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                                </div>
                                <div className="w-full h-full absolute flex items-end justify-center rounded-lg overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 -z-10"></div>
                            </>
                        )}

                        {/* Bar */}
                        <div
                            className={`w-3 sm:w-5 bg-gradient-to-t rounded-t-full relative ${hasData ? 'from-green-600 via-green-500 to-emerald-400 shadow-[0_0_15px_rgba(34,197,94,0.3)] group-hover:w-4 sm:group-hover:w-6 transition-all duration-700 ease-out' : 'from-slate-300 to-slate-200'}`}
                            style={{
                                height: `${Math.min((item.height || 0) / maxVal * 100, 100)}%`,
                                transitionDelay: `${i * 100}ms`
                            }}
                        >
                            {/* Inner Shine */}
                            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent"></div>
                        </div>

                        {/* X Axis Label */}
                        <div className={`absolute top-full mt-3 text-[10px] whitespace-nowrap transition-colors ${hasData ? 'text-slate-400 font-bold tracking-wider group-hover:text-green-600' : 'text-slate-300 font-medium'}`}>
                            {item.label}
                        </div>
                    </div>
                ))}
            </div>
            {/* Y Axis Label */}
            <div className={`-ml-6 mt-4 text-[10px] text-slate-400 transform -rotate-90 absolute left-0 top-1/2 ${!hasData ? 'opacity-30' : ''}`}>
                Height of plant (cm)
            </div>
        </div>
    );
};
