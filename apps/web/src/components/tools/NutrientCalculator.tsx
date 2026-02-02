import { useState, useEffect } from 'react';
import { Droplets } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useSettings } from '../../context/SettingsContext';

export const NutrientCalculator = () => {
    const { t } = useLanguage();
    const { settings } = useSettings();

    // Load defaults from local storage or settings
    const [waterAmount, setWaterAmount] = useState(() => {
        const saved = localStorage.getItem('calc_nutrients_water');
        return saved ? Number(saved) : settings.defaultWaterAmount;
    });
    const [baseNutrient, setBaseNutrient] = useState(() => {
        const saved = localStorage.getItem('calc_nutrients_base');
        return saved ? Number(saved) : 2;
    });
    const [additive, setAdditive] = useState(() => {
        const saved = localStorage.getItem('calc_nutrients_additive');
        return saved ? Number(saved) : 1;
    });

    // Persist changes
    useEffect(() => {
        localStorage.setItem('calc_nutrients_water', String(waterAmount));
    }, [waterAmount]);

    useEffect(() => {
        localStorage.setItem('calc_nutrients_base', String(baseNutrient));
    }, [baseNutrient]);

    useEffect(() => {
        localStorage.setItem('calc_nutrients_additive', String(additive));
    }, [additive]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Droplets className="text-blue-500" />
                {t('nutrient_calc')}
            </h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('water_vol')}</label>
                    <input
                        type="number"
                        value={waterAmount}
                        onChange={(e) => setWaterAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <p className="text-xs text-slate-400 mt-1">{t('liters_hint') || 'Volume of water in Liters'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('base_nutrient')}</label>
                        <input
                            type="number"
                            value={baseNutrient}
                            onChange={(e) => setBaseNutrient(Number(e.target.value))}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        />
                        <p className="text-xs text-slate-400 mt-1">ml/L</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('additive')}</label>
                        <input
                            type="number"
                            value={additive}
                            onChange={(e) => setAdditive(Number(e.target.value))}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        <p className="text-xs text-slate-400 mt-1">ml/L</p>
                    </div>
                </div>

                <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-medium text-slate-800 mb-2">{t('required_amounts')}</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>{t('base_nutrient').split('(')[0]}:</span>
                            <span className="font-bold">{(waterAmount * baseNutrient).toFixed(1)} ml</span>
                        </div>
                        <div className="flex justify-between">
                            <span>{t('additive').split('(')[0]}:</span>
                            <span className="font-bold">{(waterAmount * additive).toFixed(1)} ml</span>
                        </div>
                        <div className="pt-2 border-t border-slate-200 flex justify-between font-semibold">
                            <span>{t('total_solution')}</span>
                            <span>~{waterAmount.toFixed(1)} L</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
