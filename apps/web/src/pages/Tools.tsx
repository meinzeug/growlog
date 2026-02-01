import { useState } from 'react';
import { Calculator, Calendar, Droplets, Thermometer, Sun, Wind, Zap, Settings, Download } from 'lucide-react';
import clsx from 'clsx';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { Modal } from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Form';

const SettingsDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const { t } = useLanguage();
    const { settings, updateSettings } = useSettings();
    const [localSettings, setLocalSettings] = useState(settings);

    const handleSave = () => {
        updateSettings(localSettings);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('settings') || 'Settings'}>
            <div className="space-y-4">
                <Input
                    label={t('default_water_amount') || 'Default Water Amount (L)'}
                    type="number"
                    value={localSettings.defaultWaterAmount}
                    onChange={e => setLocalSettings({ ...localSettings, defaultWaterAmount: Number(e.target.value) })}
                />
                <Input
                    label={t('currency_symbol_pref') || 'Currency Symbol'}
                    type="text"
                    value={localSettings.currency}
                    onChange={e => setLocalSettings({ ...localSettings, currency: e.target.value })}
                />
                <Input
                    label={t('electricity_cost') || 'Electricity Cost (per kWh)'}
                    type="number"
                    step="0.01"
                    value={localSettings.kwhCost}
                    onChange={e => setLocalSettings({ ...localSettings, kwhCost: Number(e.target.value) })}
                />
                <Select
                    label={t('theme_mode') || 'Theme Mode'}
                    value={localSettings.themeMode}
                    onChange={e => setLocalSettings({ ...localSettings, themeMode: e.target.value as 'light' | 'dark' })}
                    options={[
                        { value: 'light', label: t('light_mode') || 'Light' },
                        { value: 'dark', label: t('dark_mode') || 'Dark' }
                    ]}
                />
                <div className="pt-2 border-t border-slate-100">
                    <button
                        onClick={() => {
                            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localSettings, null, 2));
                            const downloadAnchorNode = document.createElement('a');
                            downloadAnchorNode.setAttribute("href", dataStr);
                            downloadAnchorNode.setAttribute("download", "growlog_settings.json");
                            document.body.appendChild(downloadAnchorNode);
                            downloadAnchorNode.click();
                            downloadAnchorNode.remove();
                        }}
                        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
                    >
                        <Download size={16} />
                        {t('export_settings') || 'Export Settings'}
                    </button>
                </div>
                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium"
                    >
                        {t('save') || 'Save'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
// ... existing calculators ...

// ... inside Tools component ...
const NutrientCalculator = () => {
    const { t } = useLanguage();
    const { settings } = useSettings();
    const [waterAmount, setWaterAmount] = useState(settings.defaultWaterAmount);
    const [baseNutrient, setBaseNutrient] = useState(2);
    const [additive, setAdditive] = useState(1);

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

const HarvestEstimator = () => {
    const { t } = useLanguage();
    const [flowerStartDate, setFlowerStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [weeks, setWeeks] = useState(9);

    const getEstimatedDate = () => {
        const date = new Date(flowerStartDate);
        date.setDate(date.getDate() + (weeks * 7));
        return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Calendar className="text-orange-500" />
                {t('harvest_estimator')}
            </h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('flower_start_date')}</label>
                    <input
                        type="date"
                        value={flowerStartDate}
                        onChange={(e) => setFlowerStartDate(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('flower_time_weeks')}</label>
                    <input
                        type="number"
                        min="1"
                        max="24"
                        value={weeks}
                        onChange={(e) => setWeeks(Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                    <p className="text-xs text-slate-500 mt-1">{t('check_breeder')}</p>
                    <p className="text-xs text-slate-400">Typical range: 8-10 weeks</p>
                </div>

                <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-100">
                    <h4 className="font-medium text-orange-900 mb-1">{t('est_harvest')}</h4>
                    <p className="text-2xl font-bold text-orange-600">
                        {getEstimatedDate()}
                    </p>
                </div>
            </div>
        </div>
    );
};

const VPDCalculator = () => {
    const { t } = useLanguage();
    const [temp, setTemp] = useState(24);
    const [rh, setRh] = useState(60);
    const [offset, setOffset] = useState(-2);

    // SVP = 0.61078 * exp(17.27 * T / (T + 237.3))
    const calculateSVP = (T: number) => 0.61078 * Math.exp((17.27 * T) / (T + 237.3));

    const svp = calculateSVP(temp); // Air SVP
    const leafSvp = calculateSVP(temp + offset); // Leaf SVP
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('air_temp')} (°C)</label>
                    <input type="number" value={temp} onChange={e => setTemp(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('humidity_rh')} (%)</label>
                    <input type="number" value={rh} onChange={e => setRh(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('leaf_temp_offset')} (°C)</label>
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

const DLICalculator = () => {
    const { t } = useLanguage();
    const [ppfd, setPpfd] = useState(800);
    const [hours, setHours] = useState(12);

    const dli = (ppfd * hours * 3600) / 1000000;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Sun className="text-yellow-500" />
                {t('dli_calc')}
            </h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('ppfd')} (µmol/m²/s)</label>
                    <input type="number" value={ppfd} onChange={e => setPpfd(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('hours_on')} (h)</label>
                    <input type="number" value={hours} onChange={e => setHours(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" />
                </div>

                <div className="mt-4 p-4 bg-yellow-50 rounded-lg flex flex-col items-center justify-center text-center">
                    <h4 className="font-medium text-yellow-900 mb-1">{t('daily_light_integral')}</h4>
                    <p className="text-4xl font-bold text-yellow-600">
                        {dli.toFixed(1)} <span className="text-lg font-normal">{t('mol_m2_d')}</span>
                    </p>
                    <p className="text-xs text-yellow-800/60 mt-2">{t('dli_hint')}</p>
                </div>
            </div>
        </div>
    );
};

const CO2Calculator = () => {
    const { t } = useLanguage();
    const [width, setWidth] = useState(4);
    const [length, setLength] = useState(4);
    const [height, setHeight] = useState(7);
    const [targetPPM, setTargetPPM] = useState(1200);

    const volume = width * length * height;
    const required = (volume * (targetPPM - 400)) / 1000000; // Simplified

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
                    <input type="number" value={targetPPM} onChange={e => setTargetPPM(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg outline-none" />
                </div>
                <div className="mt-4 p-4 bg-slate-100 rounded-lg">
                    <h4 className="font-medium text-slate-800 mb-1">{t('room_vol')}: {volume} {t('cubic_feet')}</h4>
                    <p className="text-sm text-slate-600">{t('co2_required').replace('{amount}', required.toFixed(4))}</p>
                </div>
            </div>
        </div>
    );
};

const PotSizeCalculator = () => {
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

const ElectricityCalculator = () => {
    const { t } = useLanguage();
    const { settings } = useSettings();
    const [watts, setWatts] = useState(600);
    const [hours, setHours] = useState(12);
    const [cost, setCost] = useState(settings.kwhCost);

    const kwhPerDay = (watts * hours) / 1000;
    const dailyCost = kwhPerDay * cost;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Zap className="text-yellow-400" />
                {t('elec_cost_calc')}
            </h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('total_watts')} (W)</label>
                    <input type="number" value={watts} onChange={e => setWatts(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('hours_on')} (h/day)</label>
                    <input type="number" value={hours} onChange={e => setHours(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('cost_kwh')}</label>
                    <input type="number" value={cost} onChange={e => setCost(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg outline-none" />
                    <p className="text-xs text-slate-400 mt-1">Avg ~0.12 $/kWh</p>
                </div>
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg text-center">
                    <h4 className="font-medium text-yellow-900 mb-1">{t('monthly_cost')}</h4>
                    <p className="text-3xl font-bold text-yellow-600">{settings.currency}{(dailyCost * 30).toFixed(2)}</p>
                    <p className="text-xs text-yellow-800/60 mt-1">{t('daily_cost')}: {settings.currency}{(dailyCost).toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
};

export const Tools = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'nutrients' | 'harvest' | 'vpd' | 'dli' | 'co2' | 'electric' | 'potsize'>('nutrients');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const tabs = [
        { id: 'nutrients', label: t('nutrients'), icon: Calculator },
        { id: 'harvest', label: t('tool_harvest'), icon: Calendar },
        { id: 'vpd', label: 'VPD', icon: Thermometer },
        { id: 'dli', label: 'DLI', icon: Sun },
        { id: 'co2', label: t('co2'), icon: Wind },
        { id: 'potsize', label: t('pot_size') || 'Pot Size', icon: Settings },
        { id: 'electric', label: t('energy'), icon: Zap },
    ];

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">{t('tools_title')}</h1>
                    <p className="text-slate-500 mt-2">{t('tools_subtitle')}</p>
                </div>
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title={t('settings') || 'Settings'}
                >
                    <Settings size={24} />
                </button>
            </header>

            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200 hide-scrollbar">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={clsx(
                                "pb-3 px-4 font-medium transition-all relative flex items-center gap-2 whitespace-nowrap",
                                activeTab === tab.id ? "text-green-600" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-t-lg"
                            )}
                        >
                            <Icon size={18} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600" />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTab === 'nutrients' && <NutrientCalculator />}
                {activeTab === 'harvest' && <HarvestEstimator />}
                {activeTab === 'vpd' && <VPDCalculator />}
                {activeTab === 'dli' && <DLICalculator />}
                {activeTab === 'co2' && <CO2Calculator />}
                {activeTab === 'potsize' && <PotSizeCalculator />}
                {activeTab === 'electric' && <ElectricityCalculator />}
            </div>

            <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
    );
};
