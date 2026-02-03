import React, { createContext, useContext, useState, useEffect } from 'react';
import { type PhaseDurations, DEFAULT_PHASE_DURATIONS } from '../lib/plantUtils';

interface Settings {
    defaultWaterAmount: number;
    currency: string;
    kwhCost: number;
    themeMode: 'light' | 'dark';
    // New Preferences
    defaultPlantType: 'PHOTOPERIOD' | 'AUTOFLOWER';
    defaultGrowLocation: 'INDOOR' | 'OUTDOOR';
    defaultReminderTime: number;
    emailAlerts: boolean;
    temperatureUnit: 'C' | 'F';
    phaseDurations: PhaseDurations;
}

const DEFAULT_SETTINGS: Settings = {
    defaultWaterAmount: 1,
    currency: '$',
    kwhCost: 0.12,
    themeMode: 'light',
    defaultPlantType: 'PHOTOPERIOD',
    defaultGrowLocation: 'INDOOR',
    defaultReminderTime: 15,
    emailAlerts: true,
    temperatureUnit: 'C',
    phaseDurations: DEFAULT_PHASE_DURATIONS
};

interface SettingsContextType {
    settings: Settings;
    updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
    isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

import api from '../lib/api';
import { useAuth } from './AuthContext';

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [settings, setSettings] = useState<Settings>(() => {
        const saved = localStorage.getItem('growlog_settings');
        return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    });

    // Fetch from API on mount/login
    useEffect(() => {
        if (!user) return;

        const fetchPreferences = async () => {
            try {
                const res = await api.get('/profile/preferences');
                if (res.data && Object.keys(res.data).length > 0) {
                    setSettings(prev => {
                        const merged = { ...prev, ...res.data };
                        localStorage.setItem('growlog_settings', JSON.stringify(merged));
                        return merged;
                    });
                }
            } catch (e) {
                console.error("Failed to load user preferences", e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPreferences();
    }, [user]);

    // Apply theme
    useEffect(() => {
        if (settings.themeMode === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [settings.themeMode]);

    const updateSettings = async (newSettings: Partial<Settings>) => {
        // Optimistic update
        setSettings(prev => {
            const next = { ...prev, ...newSettings };
            localStorage.setItem('growlog_settings', JSON.stringify(next));
            return next;
        });

        // Sync with API
        if (user) {
            try {
                // Determine full settings state to send, or just patch?
                // API replaces 'preferences' json blob, so we should send the merged state or just the updates if the backend merges.
                // Our backend controller does: data: { preferences } which replaces the whole object usually in Prisma unless deep merge logic exists.
                // Prisma JSON update replaces the value by default unless you use specialized Json methods.
                // Safest to send the FULL merged settings object to ensure consistency.

                // However, we want to act on 'newSettings'.
                // Let's rely on state. But state update is async. 
                // So calculate 'next' here.
                const current = { ...settings, ...newSettings };
                await api.patch('/profile/preferences', { preferences: current });
            } catch (e) {
                console.error("Failed to sync settings", e);
                // Revert? For now, keep local override as it's better UX
            }
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettings must be used within a SettingsProvider');
    return context;
};
