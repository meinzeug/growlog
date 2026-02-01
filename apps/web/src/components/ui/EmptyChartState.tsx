import { TrendingUp, Plus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface EmptyChartStateProps {
    title?: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: React.ReactNode;
}

export const EmptyChartState = ({
    title,
    message,
    actionLabel,
    onAction,
    icon
}: EmptyChartStateProps) => {
    const { t } = useLanguage();

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100 min-h-[200px]">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4 border border-slate-100">
                {icon || <TrendingUp size={24} className="text-slate-300" />}
            </div>

            <h3 className="text-slate-900 font-bold text-sm mb-1">
                {title || t('no_data_available') || 'No Data Available'}
            </h3>

            <p className="text-slate-500 text-xs max-w-[200px] mb-4 leading-relaxed">
                {message || t('no_data_hint') || 'Start tracking metrics to see trends here.'}
            </p>

            {onAction && (
                <button
                    onClick={onAction}
                    className="flex items-center gap-2 text-xs font-bold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus size={14} />
                    {actionLabel || t('add_new') || 'Add New'}
                </button>
            )}
        </div>
    );
};
