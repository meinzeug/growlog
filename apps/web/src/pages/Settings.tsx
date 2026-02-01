import { useState, useEffect } from 'react';
import { Bell, User, Moon, Sun, Leaf } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

export const Settings = () => {
    const { user } = useAuth();
    const { settings, updateSettings, isLoading } = useSettings();
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    useEffect(() => {
        // Check current permission status
        if ('Notification' in window) {
            setNotificationsEnabled(Notification.permission === 'granted');
        }
    }, []);

    const requestNotificationPermission = async () => {
        if (!('Notification' in window)) {
            alert('This browser does not support desktop notification');
            return;
        }
        const permission = await Notification.requestPermission();
        setNotificationsEnabled(permission === 'granted');
    };

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500">Loading settings...</div>;
    }

    return (
        <div className="space-y-6 max-w-3xl">
            <header>
                <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
                <p className="text-slate-500 mt-2">Manage your account preferences and notification settings.</p>
            </header>

            {/* Account Settings */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg">
                        <User className="text-slate-600" size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">Account</h2>
                        <p className="text-sm text-slate-500">Update your personal information.</p>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={user?.email}
                            disabled
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                            {user?.role}
                        </span>
                    </div>
                </div>
            </section>

            {/* Notification Management */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Bell className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-800">Notifications</h2>
                            <p className="text-sm text-slate-500">Manage how you receive alerts.</p>
                        </div>
                    </div>
                    <button
                        onClick={requestNotificationPermission}
                        className={clsx(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                            notificationsEnabled
                                ? "bg-green-100 text-green-700 cursor-default"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                        )}
                        disabled={notificationsEnabled}
                    >
                        {notificationsEnabled ? 'Active' : 'Enable Push Notifications'}
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="font-medium text-slate-700">Default Reminder Time</label>
                            <p className="text-sm text-slate-500">How many minutes before a task to notify you.</p>
                        </div>
                        <select
                            value={settings.defaultReminderTime}
                            onChange={(e) => updateSettings({ defaultReminderTime: Number(e.target.value) })}
                            className="border border-slate-300 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={0}>At time of event</option>
                            <option value={15}>15 minutes before</option>
                            <option value={30}>30 minutes before</option>
                            <option value={60}>1 hour before</option>
                            <option value={1440}>1 day before</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <div>
                            <label className="font-medium text-slate-700">Email Summaries</label>
                            <p className="text-sm text-slate-500">Receive weekly grow reports via email.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.emailAlerts}
                                onChange={(e) => updateSettings({ emailAlerts: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            </section>

            {/* Smart Defaults */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                        <Leaf className="text-green-600" size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">Smart Defaults</h2>
                        <p className="text-sm text-slate-500">Pre-fill forms with your preferred settings.</p>
                    </div>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="font-medium text-slate-700">Preferred Plant Type</label>
                            <p className="text-sm text-slate-500">Default selection when creating new plants.</p>
                        </div>
                        <select
                            value={settings.defaultPlantType}
                            onChange={(e) => updateSettings({ defaultPlantType: e.target.value as any })}
                            className="border border-slate-300 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="PHOTOPERIOD">Photoperiod</option>
                            <option value="AUTOFLOWER">Autoflower</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <div>
                            <label className="font-medium text-slate-700">Default Grow Location</label>
                            <p className="text-sm text-slate-500">Default environment for new grows.</p>
                        </div>
                        <select
                            value={settings.defaultGrowLocation}
                            onChange={(e) => updateSettings({ defaultGrowLocation: e.target.value as any })}
                            className="border border-slate-300 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="INDOOR">Indoor</option>
                            <option value="OUTDOOR">Outdoor</option>
                        </select>
                    </div>
                </div>
            </section>


            {/* Interface Settings */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-amber-50 rounded-lg">
                        {settings.themeMode === 'dark' ? <Moon className="text-amber-600" size={24} /> : <Sun className="text-amber-600" size={24} />}
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">Appearance</h2>
                        <p className="text-sm text-slate-500">Customize the application look.</p>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="font-medium text-slate-700">Dark Mode</label>
                            <p className="text-sm text-slate-500">Switch between light and dark themes.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.themeMode === 'dark'}
                                onChange={(e) => updateSettings({ themeMode: e.target.checked ? 'dark' : 'light' })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-800"></div>
                        </label>
                    </div>
                </div>
            </section>
        </div>
    );
};
