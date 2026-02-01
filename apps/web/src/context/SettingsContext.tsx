import React, { createContext, useContext, useState, useEffect } from 'react';

interface Settings {
    defaultWaterAmount: number;
    currency: string;
    kwhCost: number;
    themeMode: 'light' | 'dark';
}

const DEFAULT_SETTINGS: Settings = {
    defaultWaterAmount: 1,
    currency: '$',
    kwhCost: 0.12,
    themeMode: 'light'
};

interface SettingsContextType {
    settings: Settings;
    updateSettings: (newSettings: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [settings, setSettings] = useState<Settings>(() => {
        const saved = localStorage.getItem('growlog_settings');
        return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    });

    useEffect(() => {
        localStorage.setItem('growlog_settings', JSON.stringify(settings));

        // Apply theme
        if (settings.themeMode === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [settings]);

    const updateSettings = (newSettings: Partial<Settings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettings must be used within a SettingsProvider');
    return context;
};
