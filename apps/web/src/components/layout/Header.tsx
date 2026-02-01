import { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, LogOut, Settings, X, Menu, Check, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';

interface HeaderProps {
    onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
    const { user, logout, loading: authLoading } = useAuth();
    const { t } = useLanguage();
    const { notifications, unreadCount, markAllAsRead, removeNotification } = useNotifications();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Close dropdowns on click outside
    const profileRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle size={16} className="text-green-500" />;
            case 'warning': return <AlertTriangle size={16} className="text-orange-500" />;
            case 'error': return <XCircle size={16} className="text-red-500" />;
            default: return <Info size={16} className="text-blue-500" />;
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/60 px-4 md:px-8 py-3 flex items-center justify-between transition-all duration-200 gap-4">
            {/* Mobile Menu Button */}
            <button
                onClick={onMenuClick}
                className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg shrink-0"
            >
                <Menu size={24} />
            </button>

            {/* Search Bar - Live Search */}
            <div className={`relative transition-all duration-300 ${isSearchFocused ? 'w-full md:w-96' : 'w-full md:w-64'}`}>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className={clsx("transition-colors", isSearchFocused ? "text-green-500" : "text-slate-400")} />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        placeholder={t('search_placeholder')}
                        className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 sm:text-sm shadow-sm"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Search Results Dropdown */}
                {searchQuery.length > 0 && (
                    <div className="absolute top-full mt-2 w-full bg-white/90 backdrop-blur-xl rounded-xl shadow-lg border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                        <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            {t('search_results')}
                        </div>
                        <div className="px-4 py-3 text-sm text-slate-500 text-center italic">
                            {t('no_results')} "{searchQuery}"
                        </div>
                    </div>
                )}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 md:gap-4 pl-4">

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors group"
                    >
                        <Bell size={20} className="group-hover:text-slate-700 transition-colors" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white ring-1 ring-white animate-pulse"></span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {isNotificationsOpen && (
                        <div className="absolute right-0 mt-3 w-80 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right ring-1 ring-slate-900/5">
                            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button onClick={markAllAsRead} className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                                        <Check size={12} /> Mark all read
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[320px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="py-8 text-center">
                                        <Bell size={32} className="mx-auto text-slate-200 mb-2" />
                                        <p className="text-sm text-slate-500">No notifications yet</p>
                                    </div>
                                ) : (
                                    notifications.map(n => (
                                        <div
                                            key={n.id}
                                            className={clsx(
                                                "p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors relative group",
                                                !n.read && "bg-blue-50/40"
                                            )}
                                        >
                                            <div className="flex gap-3">
                                                <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={clsx("text-sm font-medium text-slate-900", !n.read && "font-semibold")}>
                                                        {n.title}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                                                    <p className="text-[10px] text-slate-400 mt-1.5">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all absolute top-2 right-2"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 p-1 pl-2 pr-1 rounded-full border border-slate-200 hover:border-green-200 hover:shadow-md hover:shadow-green-100/50 transition-all bg-white group focus:ring-2 focus:ring-green-500/20 outline-none"
                    >
                        <div className="hidden md:flex flex-col items-end mr-1 text-right">
                            {authLoading ? (
                                <div className="h-4 w-20 bg-slate-200 rounded animate-pulse mb-1"></div>
                            ) : (
                                <span className="text-xs font-bold text-slate-700 group-hover:text-green-700 transition-colors">
                                    {user?.email ? user.email.split('@')[0] : t('grower')}
                                </span>
                            )}
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full mt-0.5 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">Pro Member</span>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 ring-2 ring-white shadow-sm flex items-center justify-center text-white font-bold text-sm relative overflow-hidden group-hover:scale-105 transition-transform">
                            {/* Simple Avatar Placeholder or Initials */}
                            {(user?.email?.[0] || 'G').toUpperCase()}
                        </div>
                    </button>

                    {/* Premium Dropdown Menu */}
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-3 w-64 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/60 py-2 animate-in fade-in zoom-in-95 duration-100 origin-top-right ring-1 ring-slate-900/5 z-50">
                            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/30">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                        {(user?.email?.[0] || 'G').toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate">{user?.email ? user.email.split('@')[0] : t('grower')}</p>
                                        <p className="text-xs text-slate-500 truncate">{user?.email || t('email_placeholder')}</p>
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-center bg-green-50 text-green-700 py-1 rounded-md font-medium border border-green-100">
                                    Pro Membership Active
                                </div>
                            </div>

                            <div className="p-2 space-y-1">
                                <button onClick={() => { navigate('/settings'); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 rounded-xl transition-all group">
                                    <div className="p-1.5 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-white group-hover:text-green-600 group-hover:shadow-sm transition-all">
                                        <User size={16} />
                                    </div>
                                    <span className="font-medium">{t('profile')}</span>
                                </button>
                                <button onClick={() => { navigate('/settings'); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 rounded-xl transition-all group">
                                    <div className="p-1.5 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-white group-hover:text-green-600 group-hover:shadow-sm transition-all">
                                        <Settings size={16} />
                                    </div>
                                    <span className="font-medium">{t('settings')}</span>
                                </button>
                            </div>

                            <div className="border-t border-slate-100 p-2 mt-1">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
                                >
                                    <LogOut size={16} />
                                    {t('logout')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
