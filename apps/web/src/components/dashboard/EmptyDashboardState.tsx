import { useNavigate } from 'react-router-dom';
import { Plus, Sprout } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const EmptyDashboardState = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-[2rem] border border-dashed border-slate-200 text-center col-span-2">
            <div className="bg-green-50 p-6 rounded-full mb-6">
                <Sprout size={48} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('welcome_growlog') || 'Welcome to GrowLog'}</h2>
            <p className="text-slate-500 max-w-md mb-8">
                {t('dashboard_empty_hint') || 'You haven\'t added any plants yet. Start your journey by creating your first grow or adding a plant.'}
            </p>
            <div className="flex gap-4">
                <button
                    onClick={() => navigate('/plants')}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-green-600/20 hover:shadow-green-600/30 hover:-translate-y-1"
                >
                    <Plus size={20} />
                    {t('add_plant') || 'Add First Plant'}
                </button>
            </div>
        </div>
    );
};
