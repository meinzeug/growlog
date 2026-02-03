import { useState, lazy, Suspense } from 'react';
import { Calculator, Calendar, Thermometer, Sun, Wind, Zap, Settings, Download } from 'lucide-react';
import clsx from 'clsx';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { Modal } from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Form';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

// Lazy Load Calculators (Code Splitting)
const NutrientCalculator = lazy(() => import('../components/tools/NutrientCalculator').then(module => ({ default: module.NutrientCalculator })));
const HarvestEstimator = lazy(() => import('../components/tools/HarvestEstimator').then(module => ({ default: module.HarvestEstimator })));
const VPDCalculator = lazy(() => import('../components/tools/VPDCalculator').then(module => ({ default: module.VPDCalculator })));
const DLICalculator = lazy(() => import('../components/tools/DLICalculator').then(module => ({ default: module.DLICalculator })));
const CO2Calculator = lazy(() => import('../components/tools/CO2Calculator').then(module => ({ default: module.CO2Calculator })));
const PotSizeCalculator = lazy(() => import('../components/tools/PotSizeCalculator').then(module => ({ default: module.PotSizeCalculator })));
const ElectricityCalculator = lazy(() => import('../components/tools/ElectricityCalculator').then(module => ({ default: module.ElectricityCalculator })));

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
                    <h3 className="font-semibold text-sm text-slate-900 mb-3">{t('phase_timelines') || 'Phase Timelines (Days)'}</h3>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <Input
                            label={t('germination')}
                            type="number"
                            value={localSettings.phaseDurations?.germination ?? 14}
                            onChange={e => setLocalSettings({ ...localSettings, phaseDurations: { ...localSettings.phaseDurations, germination: Number(e.target.value) } })}
                        />
                        <Input
                            label={t('vegetative')}
                            type="number"
                            value={localSettings.phaseDurations?.vegetative ?? 60}
                            onChange={e => setLocalSettings({ ...localSettings, phaseDurations: { ...localSettings.phaseDurations, vegetative: Number(e.target.value) } })}
                        />
                        <Input
                            label={t('flowering')}
                            type="number"
                            value={localSettings.phaseDurations?.flowering ?? 70}
                            onChange={e => setLocalSettings({ ...localSettings, phaseDurations: { ...localSettings.phaseDurations, flowering: Number(e.target.value) } })}
                        />
                        <Input
                            label={t('autoflower')}
                            type="number"
                            value={localSettings.phaseDurations?.autoflower ?? 90}
                            onChange={e => setLocalSettings({ ...localSettings, phaseDurations: { ...localSettings.phaseDurations, autoflower: Number(e.target.value) } })}
                        />
                    </div>

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
                        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mt-4"
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

            <div className="min-h-[400px]">
                <Suspense fallback={<LoadingSpinner message={t('loading') || 'Loading tool...'} />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeTab === 'nutrients' && <NutrientCalculator />}
                        {activeTab === 'harvest' && <HarvestEstimator />}
                        {activeTab === 'vpd' && <VPDCalculator />}
                        {activeTab === 'dli' && <DLICalculator />}
                        {activeTab === 'co2' && <CO2Calculator />}
                        {activeTab === 'potsize' && <PotSizeCalculator />}
                        {activeTab === 'electric' && <ElectricityCalculator />}
                    </div>
                </Suspense>
            </div>

            <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
    );
};

