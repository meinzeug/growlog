import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { clsx } from 'clsx';
import { FeedbackFab } from '../FeedbackFab';

export const AppShell = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Overlay */}
            <div
                className={clsx(
                    "fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 md:hidden",
                    isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsSidebarOpen(false)}
            />

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 ml-0 md:ml-64 transition-all duration-300 w-full flex flex-col min-h-screen">
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-20 flex items-center gap-3">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-slate-900 text-lg">GrowLog</span>
                </header>

                <div className="w-full mx-auto p-4 md:p-8 flex-1 overflow-y-auto">
                    <Outlet />
                </div>
            </main>
            <FeedbackFab />
        </div>
    );
};
