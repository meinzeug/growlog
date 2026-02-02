import { useState } from 'react';
import { Wind } from 'lucide-react';
import { clsx } from 'clsx';
import { useLanguage } from '../../context/LanguageContext';

export const CO2Calculator = () => {
    const { t } = useLanguage();
    const [width, setWidth] = useState(4);
    const [length, setLength] = useState(4);
    const [height, setHeight] = useState(7);
    const [targetPPM, setTargetPPM] = useState(1200);

    const volume = width * length * height;
    const required = (volume * (targetPPM - 400)) / 1000000; // Simplified

    const isDangerous = targetPPM > 5000;
    const isHigh = targetPPM > 2000;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Wind className="text-slate-400" />
                {t('co2_calc')}
            </h3>
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                        <label className="block text-xs font-medium text-slate-700 mb-1">{t('width_ft')}</label>
                        <input type="number" value={width} onChange={e => setWidth(Number(e.target.value))} className="w-full px-2 py-2 border rounded outline-none" />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-medium text-slate-700 mb-1">{t('length_ft')}</label>
                        <input type="number" value={length} onChange={e => setLength(Number(e.target.value))} className="w-full px-2 py-2 border rounded outline-none" />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-medium text-slate-700 mb-1">{t('height_ft')}</label>
                        <input type="number" value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full px-2 py-2 border rounded outline-none" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('target_ppm')}</label>
                    <input
                        type="number"
                        value={targetPPM}
                        onChange={e => setTargetPPM(Number(e.target.value))}
                        className={clsx(
                            "w-full px-3 py-2 border rounded-lg outline-none focus:ring-2",
                            isDangerous ? "border-red-500 text-red-600 focus:ring-red-500" :
                                isHigh ? "border-yellow-500 text-yellow-600 focus:ring-yellow-500" :
                                    "border-slate-300 focus:ring-green-500"
                        )}
                    />
                    {isDangerous && (
                        <p className="text-xs text-red-600 font-bold mt-1 flex items-center gap-1">
                            ⚠️ {t('danger_co2_level') || 'DANGER: CO2 levels > 5000 PPM are dangerous!'}
                        </p>
                    )}
                </div>
                <div className="mt-4 p-4 bg-slate-100 rounded-lg">
                    <h4 className="font-medium text-slate-800 mb-1">{t('room_vol')}: {volume} {t('cubic_feet')}</h4>
                    <p className="text-sm text-slate-600">{t('co2_required').replace('{amount}', required.toFixed(4))}</p>
                </div>
            </div>
        </div>
    );
};
