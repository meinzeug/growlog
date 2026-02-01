import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useLanguage } from '../../context/LanguageContext';

interface LoadingSpinnerProps {
    message?: string;
    className?: string;
    size?: number;
    fullScreen?: boolean;
}

export const LoadingSpinner = ({ message, className, size = 32, fullScreen = false }: LoadingSpinnerProps) => {
    const { t } = useLanguage();

    const Content = () => (
        <div className={clsx("flex flex-col items-center justify-center text-slate-500", className)}>
            <Loader2 className="animate-spin text-green-600 mb-3" size={size} />
            <p className="text-sm font-medium animate-pulse">{message || t('loading')}</p>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                <Content />
            </div>
        );
    }

    return <Content />;
};
