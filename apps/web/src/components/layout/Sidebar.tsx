import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Flower2, Sprout, CalendarCheck, FileBarChart, Users, LogOut, Wrench, Settings, X, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import clsx from 'clsx';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const { pathname } = useLocation();
    const { user, logout } = useAuth();
    const { t, language, setLanguage } = useLanguage();

    const links = [
        { to: '/', key: 'dashboard', icon: LayoutDashboard },
        { to: '/grows', key: 'grows', icon: Sprout },
        { to: '/plants', key: 'plants', icon: Flower2 },
        { to: '/tasks', key: 'calendar', icon: CalendarCheck },
        { to: '/reports', key: 'reports', icon: FileBarChart },
        { to: '/tools', key: 'tools', icon: Wrench },
        { to: '/settings', key: 'settings', icon: Settings },
    ];

    if (user?.role === 'ADMIN') {
        links.push({ to: '/admin/users', key: 'users', icon: Users });
    }

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'de' : 'en');
    };

    return (
        <>
            <div className={clsx(
                "h-screen w-64 bg-white border-r border-slate-100 flex flex-col fixed left-0 top-0 z-40 transition-transform duration-300 md:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold font-sans tracking-tight flex items-center gap-2">
                        <span className="text-slate-900">Grow</span>
                        <span className="text-green-600">Log</span>
                    </h1>
                    <button onClick={onClose} className="md:hidden text-slate-500 hover:text-slate-700">
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.to || (link.to !== '/' && pathname.startsWith(link.to));
                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                onClick={() => onClose()}
                                className={clsx(
                                    "flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium",
                                    isActive
                                        ? "bg-[#1A2F2B] text-white shadow-lg shadow-green-900/10"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <Icon size={20} className={clsx(isActive ? "text-green-400" : "text-slate-400")} strokeWidth={isActive ? 2.5 : 2} />
                                <span>{t(link.key)}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto px-4 pb-4">
                    {/* Language Switcher */}
                    <button
                        onClick={toggleLanguage}
                        className="w-full flex items-center justify-between px-4 py-2 mb-4 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Globe size={16} />
                            <span className="text-sm font-medium">Language</span>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 bg-white border rounded shadow-sm">
                            {language.toUpperCase()}
                        </span>
                    </button>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-800 font-bold shrink-0">
                                {user?.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-slate-900 truncate">{user?.email?.split('@')[0] || 'User'}</p>
                                <button onClick={logout} className="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1 transition-colors">
                                    <LogOut size={12} /> {t('signout')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
