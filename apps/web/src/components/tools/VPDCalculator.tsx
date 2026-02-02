import { useState } from 'react';
import { Thermometer } from 'lucide-react';
import { clsx } from 'clsx';
import { useLanguage } from '../../context/LanguageContext';
import { useSettings } from '../../context/SettingsContext';

export const VPDCalculator = () => {
    const { t } = useLanguage();
    const { settings } = useSettings();
    const isMetric = settings.temperatureUnit === 'C';
    const [temp, setTemp] = useState(isMetric ? 24 : 75);
    const [rh, setRh] = useState(60);
    const [offset, setOffset] = useState(isMetric ? -2 : -4);

    // SVP = 0.61078 * exp(17.27 * T / (T + 237.3))
    // T must be in Celsius
    const calculateSVP = (T: number) => 0.61078 * Math.exp((17.27 * T) / (T + 237.3));

    const toCelsius = (v: number) => isMetric ? v : (v - 32) * 5 / 9;

    const tempC = toCelsius(temp);
    const offsetC = isMetric ? offset : (offset * 5 / 9);

    const svp = calculateSVP(tempC); // Air SVP
    const leafSvp = calculateSVP(tempC + offsetC); // Leaf SVP
    const vpd = leafSvp - (svp * (rh / 100));

    // Color code VPD
    let color = 'text-slate-900';
    if (vpd < 0.4) color = 'text-blue-600'; // Too low
    else if (vpd >= 0.4 && vpd <= 0.8) color = 'text-blue-500'; // Prop/Early Veg
    else if (vpd > 0.8 && vpd <= 1.2) color = 'text-green-500'; // Veg
    else if (vpd > 1.2 && vpd <= 1.6) color = 'text-orange-500'; // Flower
    else color = 'text-red-500'; // Too high

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Thermometer className="text-red-500" />
                {t('vpd_calc')}
            </h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('air_temp')} ({isMetric ? '°C' : '°F'})</label>
                    <input type="number" value={temp} onChange={e => setTemp(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('humidity_rh')} (%)</label>
                    <input type="number" value={rh} onChange={e => setRh(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('leaf_temp_offset')} ({isMetric ? '°C' : '°F'})</label>
                    <input type="number" value={offset} onChange={e => setOffset(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 outline-none" />
                    <p className="text-xs text-slate-400 mt-1">{t('leaf_offset_hint')}</p>
                </div>

                <div className="mt-4 p-4 bg-slate-50 rounded-lg flex flex-col items-center justify-center text-center">
                    <h4 className="font-medium text-slate-500 mb-1">{t('vp_deficit')}</h4>
                    <p className={clsx("text-4xl font-bold", color)}>
                        {vpd.toFixed(2)} kPa
                    </p>
                    <p className="text-xs text-slate-400 mt-2">{t('vpd_hint')}</p>
                </div>
            </div>
        </div>
    );
};
