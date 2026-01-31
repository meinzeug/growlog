import { createContext, useContext, useState, type ReactNode } from 'react';
import { translations } from '../lib/translations';
import type { LanguageType } from '../lib/translations';

type LanguageContextType = {
    language: LanguageType;
    setLanguage: (lang: LanguageType) => void;
    t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<LanguageType>('en');

    const t = (key: string) => {
        const value = translations[language][key as keyof typeof translations['en']];
        return value || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
    return context;
};
