import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';
import { clsx } from 'clsx';
import { FeedbackFab } from '../FeedbackFab';

import { Header } from './Header';

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
                <Header onMenuClick={() => setIsSidebarOpen(true)} />

                <div className="w-full mx-auto p-4 md:p-8 flex-1 overflow-y-auto">
                    <Outlet />
                </div>
            </main>
            <FeedbackFab />
        </div>
    );
};
