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
                "h-screen w-64 bg-slate-900 border-r border-slate-800/50 flex flex-col fixed left-0 top-0 z-[60] transition-transform duration-300 md:translate-x-0 shadow-2xl",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Logo Section */}
                <div className="p-8 flex justify-between items-center relative overflow-hidden">
                    {/* Decorative glow */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-500/10 to-transparent pointer-events-none" />

                    <h1 className="text-2xl font-bold font-sans tracking-tight flex items-center gap-2 relative z-10">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-green-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-green-900/20">
                            <Sprout size={18} fill="currentColor" className="text-white" />
                        </div>
                        <span className="text-white">Grow</span>
                        <span className="text-green-500">Log</span>
                    </h1>
                    <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.to || (link.to !== '/' && pathname.startsWith(link.to));
                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                onClick={() => onClose()}
                                className={clsx(
                                    "group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium relative overflow-hidden",
                                    isActive
                                        ? "text-white bg-gradient-to-r from-green-600/20 to-emerald-600/10 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-green-500 rounded-r-full shadow-[0_0_10px_#22c55e]" />
                                )}
                                <Icon
                                    size={20}
                                    className={clsx(
                                        "transition-transform duration-300 group-hover:scale-110",
                                        isActive ? "text-green-400" : "text-slate-500 group-hover:text-green-400"
                                    )}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                <span className="tracking-wide text-sm">{t(link.key)}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Section */}
                <div className="mt-auto px-4 pb-6 pt-4 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent">
                    {/* Language Switcher */}
                    <button
                        onClick={toggleLanguage}
                        className="w-full flex items-center justify-between px-4 py-2.5 mb-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl text-slate-400 transition-all border border-slate-700/50 hover:border-slate-600 group"
                    >
                        <div className="flex items-center gap-2.5">
                            <Globe size={16} className="text-slate-500 group-hover:text-green-400 transition-colors" />
                            <span className="text-xs font-medium uppercase tracking-wider">Language</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-700 text-slate-300 rounded border border-slate-600 shadow-sm group-hover:bg-slate-600 transition-colors">
                            {language.toUpperCase()}
                        </span>
                    </button>

                    {/* User Profile */}
                    <div className="p-3 bg-slate-800/40 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-500 to-emerald-300 flex items-center justify-center text-slate-900 font-bold shrink-0 shadow-lg shadow-green-900/20 ring-2 ring-slate-800">
                                {user?.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="overflow-hidden flex-1">
                                <p className="text-sm font-bold text-white truncate">{user?.email?.split('@')[0] || 'User'}</p>
                                <button onClick={logout} className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors mt-0.5">
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
