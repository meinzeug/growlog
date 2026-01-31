import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Flower2, Sprout, CalendarCheck, FileBarChart, Users, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

export const Sidebar = () => {
    const { pathname } = useLocation();
    const { user, logout } = useAuth();

    const links = [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/grows', label: 'Grows', icon: Sprout },
        { to: '/plants', label: 'Plants', icon: Flower2 },
        { to: '/tasks', label: 'Calendar', icon: CalendarCheck },
        { to: '/reports', label: 'Reports', icon: FileBarChart },
    ];

    if (user?.role === 'ADMIN') {
        links.push({ to: '/admin/users', label: 'Users', icon: Users });
    }

    return (
        <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0">
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
                    GrowLog
                </h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.to || (link.to !== '/' && pathname.startsWith(link.to));
                    return (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={clsx(
                                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                                isActive ? "bg-green-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center justify-between px-4 py-2">
                    <div className="text-sm">
                        <p className="font-medium text-white">{user?.email.split('@')[0]}</p>
                        <p className="text-xs text-slate-500 capitalize">{user?.role.toLowerCase()}</p>
                    </div>
                    <button onClick={logout} className="text-slate-400 hover:text-white transition-colors">
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};
