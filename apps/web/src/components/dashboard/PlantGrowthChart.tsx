import { useLanguage } from '../../context/LanguageContext';
import { EmptyChartState } from '../ui/EmptyChartState';

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

    if (!hasData) {
        return (
            <EmptyChartState
                title={t('no_growth_data')}
                message={t('start_recording_hint')}
                onAction={onEmptyAction}
                actionLabel={t('record_metrics') || 'Record Metric'}
            />
        );
    }

    const maxVal = Math.max(100, ...(data?.map(d => d.height) || [100])) * 1.1;

    return (
        <div className="w-full h-full flex flex-col relative">
            <div className="flex-1 flex items-end gap-3 sm:gap-6 justify-between px-2 pb-8 border-l border-b border-slate-100 relative">
                {/* Y Axis Grid Lines */}
                {[0, 25, 50, 75, 100].map((percentage) => (
                    <div key={percentage} className="absolute w-full h-[1px] bg-slate-50 left-0" style={{ bottom: `${percentage}%` }}>
                        <span className="absolute -left-8 -top-2 text-[10px] text-slate-300 font-medium w-6 text-right">
                            {Math.round(maxVal * (percentage / 100))}
                        </span>
                    </div>
                ))}

                {data!.map((item, i) => (
                    <div key={item.label} className="relative flex-1 flex items-end justify-center h-full z-10 group">
                        <div className="absolute bottom-full mb-3 bg-slate-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 whitespace-nowrap z-20 pointer-events-none shadow-xl shadow-slate-900/20">
                            {item.height} cm
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                        </div>
                        <div className="w-full h-full absolute flex items-end justify-center rounded-lg overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 -z-10"></div>

                        {/* Bar */}
                        <div
                            className="w-3 sm:w-5 bg-gradient-to-t rounded-t-full relative from-green-600 via-green-500 to-emerald-400 shadow-[0_0_15px_rgba(34,197,94,0.3)] group-hover:w-4 sm:group-hover:w-6 transition-all duration-700 ease-out"
                            style={{
                                height: `${Math.min((item.height || 0) / maxVal * 100, 100)}%`,
                                transitionDelay: `${i * 100}ms`
                            }}
                        >
                            {/* Inner Shine */}
                            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent"></div>
                        </div>

                        {/* X Axis Label */}
                        <div className="absolute top-full mt-3 text-[10px] whitespace-nowrap transition-colors text-slate-400 font-bold tracking-wider group-hover:text-green-600">
                            {item.label}
                        </div>
                    </div>
                ))}
            </div>
            {/* Y Axis Label */}
            <div className="-ml-6 mt-4 text-[10px] text-slate-400 transform -rotate-90 absolute left-0 top-1/2">
                Height of plant (cm)
            </div>
        </div>
    );
};
