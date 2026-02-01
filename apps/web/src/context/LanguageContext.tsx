import { createContext, useContext, useState, type ReactNode } from 'react';
import { translations } from '../lib/translations';
import type { LanguageType } from '../lib/translations';
import { enUS, de } from 'date-fns/locale';
import type { Locale } from 'date-fns';

type LanguageContextType = {
    language: LanguageType;
    setLanguage: (lang: LanguageType) => void;
    t: (key: string) => string;
    dateLocale: Locale;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<LanguageType>('en');

    const t = (key: string) => {
        // @ts-ignore
        const value = translations[language][key];
        return value || key;
    };

    const dateLocale = language === 'de' ? de : enUS;

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, dateLocale }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
    return context;
};
