export const SkeletonCard = () => (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg flex flex-col justify-between h-44 animate-pulse">
        <div className="space-y-3">
            <div className="h-4 w-24 bg-slate-200 rounded"></div>
            <div className="h-8 w-16 bg-slate-200 rounded"></div>
        </div>
        <div className="h-10 w-10 bg-slate-200 rounded-full self-end"></div>
    </div>
);

export const SkeletonChart = () => (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-50 flex-1 min-h-[400px] animate-pulse">
        <div className="flex justify-between mb-8">
            <div className="h-6 w-32 bg-slate-200 rounded"></div>
            <div className="h-8 w-16 bg-slate-200 rounded"></div>
        </div>
        <div className="h-[300px] bg-slate-200 rounded-xl w-full"></div>
    </div>
);

export const SkeletonPanel = () => (
    <div className="bg-white h-full rounded-2xl shadow-sm border border-slate-100 p-6 animate-pulse space-y-6">
        <div className="h-64 bg-slate-200 rounded-xl w-full"></div>
        <div className="space-y-4">
            <div className="h-6 w-3/4 bg-slate-200 rounded"></div>
            <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
            <div className="h-20 bg-slate-200 rounded-lg w-full"></div>
        </div>
    </div>
);
