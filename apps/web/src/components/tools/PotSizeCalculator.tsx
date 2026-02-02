import { useState } from 'react';
import { Settings } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Select } from '../../components/ui/Form';

export const PotSizeCalculator = () => {
    const { t } = useLanguage();
    const [weeks, setWeeks] = useState(12);
    const [style, setStyle] = useState('soil');

    // Rule of thumb: Auto/Coco needs less, Soil/Photo needs more
    // Soil: ~4L (1 gal) per month of life
    // Coco: ~2L (0.5 gal) per month of life
    const volumeLiters = (weeks / 4) * (style === 'soil' ? 3.8 : 2.5);
    const volumeGallons = volumeLiters / 3.8;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Settings className="text-amber-700" />
                {t('pot_size_calc') || 'Pot Size Calculator'}
            </h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('grow_cycle_weeks') || 'Total Weeks'}</label>
                    <input type="number" value={weeks} onChange={e => setWeeks(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('medium') || 'Medium'}</label>
                    <Select
                        options={[
                            { value: 'soil', label: 'Soil/Organic' },
                            { value: 'coco', label: 'Coco/Hydro' }
                        ]}
                        value={style}
                        onChange={e => setStyle(e.target.value)}
                    />
                </div>
                <div className="mt-4 p-4 bg-amber-50 rounded-lg text-center">
                    <h4 className="font-medium text-amber-900 mb-1">{t('rec_pot_size') || 'Recommended Size'}</h4>
                    <p className="text-3xl font-bold text-amber-600">{volumeLiters.toFixed(1)} L</p>
                    <p className="text-sm text-amber-800/60">~{volumeGallons.toFixed(1)} Gallons</p>
                </div>
            </div>
        </div>
    );
};
