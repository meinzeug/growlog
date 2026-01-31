interface ChartData {
    label: string;
    height: number;
}

export const PlantGrowthChart = ({ data }: { data?: ChartData[] }) => {
    // Default fallback
    const chartData = data && data.length > 0 ? data : [
        { label: '1 WEEK', height: 0 },
        { label: '2 WEEK', height: 0 },
        { label: '3 WEEK', height: 0 },
        { label: '4 WEEK', height: 0 },
        { label: '5 WEEK', height: 0 },
    ];
    const maxVal = 100;

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex-1 flex items-end gap-2 sm:gap-4 justify-between px-2 pb-6 border-l border-slate-100 relative">
                {/* Y Axis Grid Lines optional */}
                {[0, 25, 50, 75, 100].map((val) => (
                    <div key={val} className="absolute w-full h-[1px] bg-slate-50 left-0" style={{ bottom: `${val}%` }} />
                ))}

                {chartData.map((item) => (
                    <div key={item.label} className="relative flex-1 flex items-end justify-center h-full z-10 group">
                        {/* Tooltip on Hover */}
                        <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                            Height: {item.height} cm
                        </div>

                        {/* Bar */}
                        <div
                            className="w-4 sm:w-6 bg-gradient-to-t from-green-600 to-green-400 rounded-t-sm transition-all duration-500 hover:opacity-90"
                            style={{ height: `${Math.min((item.height || 0) / maxVal * 100, 100)}%` }}
                        />

                        {/* X Axis Label */}
                        <div className="absolute top-full mt-2 text-[10px] text-slate-400 font-medium whitespace-nowrap">
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
