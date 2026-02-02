import { useState } from 'react';
import { Sun } from 'lucide-react';
import { clsx } from 'clsx';
import { useLanguage } from '../../context/LanguageContext';
import { Select } from '../../components/ui/Form';

export const DLICalculator = () => {
    const { t } = useLanguage();
    const [ppfd, setPpfd] = useState(800);
    const [hours, setHours] = useState(12);
    const [phase, setPhase] = useState<'seedling' | 'veg' | 'flower'>('veg');

    const dli = (ppfd * hours * 3600) / 1000000;

    // Recommendations
    const ranges = {
        seedling: { min: 10, max: 20, target: '10-20' },
        veg: { min: 20, max: 40, target: '25-40' },
        flower: { min: 35, max: 60, target: '40-60' }
    };

    const currentRange = ranges[phase];
    let statusColor = 'text-yellow-600';
    let statusBg = 'bg-yellow-50';

    if (dli < currentRange.min) {
        statusColor = 'text-blue-600';
        statusBg = 'bg-blue-50';
    } else if (dli > currentRange.max) {
        statusColor = 'text-red-600';
        statusBg = 'bg-red-50';
    } else {
        statusColor = 'text-green-600';
        statusBg = 'bg-green-50';
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Sun className="text-yellow-500" />
                {t('dli_calc')}
            </h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('p_stage') || 'Growth Stage'}</label>
                    <Select
                        options={[
                            { value: 'seedling', label: t('germination') || 'Seedling' },
                            { value: 'veg', label: t('veg') || 'Vegetative' },
                            { value: 'flower', label: t('flower') || 'Flowering' }
                        ]}
                        value={phase}
                        onChange={(e) => setPhase(e.target.value as any)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('ppfd')} (µmol/m²/s)</label>
                    <input type="number" value={ppfd} onChange={e => setPpfd(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('hours_on')} (h)</label>
                    <input type="number" value={hours} onChange={e => setHours(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" />
                </div>

                <div className={clsx("mt-4 p-4 rounded-lg flex flex-col items-center justify-center text-center transition-colors", statusBg)}>
                    <h4 className={clsx("font-medium mb-1", statusColor)}>{t('daily_light_integral')}</h4>
                    <p className={clsx("text-4xl font-bold", statusColor)}>
                        {dli.toFixed(1)} <span className="text-lg font-normal">{t('mol_m2_d')}</span>
                    </p>
                    <p className={clsx("text-xs mt-2 opacity-80", statusColor)}>
                        {t('target_for')} {phase}: {currentRange.target}
                    </p>
                </div>
            </div>
        </div>
    );
};
