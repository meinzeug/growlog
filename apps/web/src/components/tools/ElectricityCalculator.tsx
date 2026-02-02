import { useState } from 'react';
import { Zap } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useSettings } from '../../context/SettingsContext';

export const ElectricityCalculator = () => {
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
