import { useState, useEffect } from 'react';
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
                <Select
                    label={t('temp_unit') || 'Temperature Unit'}
                    value={localSettings.temperatureUnit}
                    onChange={e => setLocalSettings({ ...localSettings, temperatureUnit: e.target.value as 'C' | 'F' })}
                    options={[
                        { value: 'C', label: 'Celsius (°C)' },
                        { value: 'F', label: 'Fahrenheit (°F)' }
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

const DLICalculator = () => {
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

const CO2Calculator = () => {
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
    const [devices, setDevices] = useState<{ id: string; name: string; watts: number; hours: number }[]>([
        { id: '1', name: t('grow_light') || 'Grow Light', watts: 600, hours: 12 }
    ]);
    const [newDevice, setNewDevice] = useState({ name: '', watts: 0, hours: 24 });
    const [cost, setCost] = useState(settings.kwhCost);

    const addDevice = () => {
        if (!newDevice.name || newDevice.watts <= 0) return;
        setDevices([...devices, { ...newDevice, id: Math.random().toString(36).substr(2, 9) }]);
        setNewDevice({ name: '', watts: 0, hours: 24 });
    };

    const removeDevice = (id: string) => {
        setDevices(devices.filter(d => d.id !== id));
    };

    const totalKwhPerDay = devices.reduce((sum, d) => sum + ((d.watts * d.hours) / 1000), 0);
    const dailyCost = totalKwhPerDay * cost;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full flex flex-col">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Zap className="text-yellow-400" />
                {t('elec_cost_calc')}
            </h3>

            <div className="flex-1 space-y-4">
                {/* Cost Setting */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('cost_kwh')}</label>
                    <input type="number" value={cost} onChange={e => setCost(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg outline-none" />
                </div>

                {/* Device List */}
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {devices.map(device => (
                        <div key={device.id} className="flex justify-between items-center bg-slate-50 p-2 rounded text-sm group">
                            <div>
                                <div className="font-medium text-slate-700">{device.name}</div>
                                <div className="text-xs text-slate-500">{device.watts}W × {device.hours}h</div>
                            </div>
                            <button onClick={() => removeDevice(device.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Zap size={14} className="rotate-45" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Add Device Form */}
                <div className="grid grid-cols-5 gap-2 pt-2 border-t border-slate-100">
                    <input
                        placeholder={t('device_name') || "Device"}
                        value={newDevice.name}
                        onChange={e => setNewDevice({ ...newDevice, name: e.target.value })}
                        className="col-span-2 px-2 py-1 text-sm border rounded"
                    />
                    <input
                        placeholder="W"
                        type="number"
                        value={newDevice.watts || ''}
                        onChange={e => setNewDevice({ ...newDevice, watts: Number(e.target.value) })}
                        className="col-span-1 px-2 py-1 text-sm border rounded"
                    />
                    <input
                        placeholder="Hr"
                        type="number"
                        value={newDevice.hours}
                        onChange={e => setNewDevice({ ...newDevice, hours: Number(e.target.value) })}
                        className="col-span-1 px-2 py-1 text-sm border rounded"
                    />
                    <button
                        onClick={addDevice}
                        disabled={!newDevice.name || !newDevice.watts}
                        className="col-span-1 bg-slate-800 text-white rounded text-xs font-bold hover:bg-slate-700 disabled:opacity-50"
                    >
                        +
                    </button>
                </div>

                <div className="mt-auto p-4 bg-yellow-50 rounded-lg text-center">
                    <h4 className="font-medium text-yellow-900 mb-1">{t('monthly_cost')}</h4>
                    <p className="text-3xl font-bold text-yellow-600">{settings.currency}{(dailyCost * 30).toFixed(2)}</p>
                    <p className="text-xs text-yellow-800/60 mt-1">
                        {t('daily_cost')}: {settings.currency}{(dailyCost).toFixed(2)} • {totalKwhPerDay.toFixed(1)} kWh/day
                    </p>
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
