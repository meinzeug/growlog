import { useNavigate } from 'react-router-dom';
import { Rocket, ArrowLeft, Construction } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ComingSoonProps {
    featureName?: string;
}

export const ComingSoon = ({ featureName }: ComingSoonProps) => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
            <div className="bg-white p-4 rounded-full shadow-sm mb-6 relative">
                <Construction size={48} className="text-orange-400" />
                <Rocket size={24} className="text-green-500 absolute -bottom-2 -right-2 animate-bounce" />
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-2">
                {featureName ? `🚧 ${featureName} - ${t('coming_soon')}` : t('coming_soon')}
            </h2>

            <p className="text-slate-500 max-w-md mb-8">
                {t('feature_under_development')}
            </p>

            <div className="flex gap-4">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                    <ArrowLeft size={18} />
                    {t('back_to_dashboard')}
                </button>

                <button
                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all shadow-sm hover:shadow active:scale-95"
                    onClick={() => alert('Thanks for your interest! Also coming soon.')}
                >
                    <Rocket size={18} />
                    {t('notify_me')}
                </button>
            </div>
        </div>
    );
};
