import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import AIChat from './AIChat';
import MobileNav from './MobileNav';

const Layout = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Kept for header menu if needed, but Sidebar is hidden on mobile now
    const [isAIChatOpen, setIsAIChatOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <div className="min-h-screen bg-background flex transition-colors duration-300">
            {/* Desktop Sidebar - Hidden on Mobile */}
            <div className="hidden md:block">
                <Sidebar
                    isCollapsed={isSidebarCollapsed}
                    toggleCollapse={toggleSidebar}
                    isMobileOpen={false} // No longer needed for mobile as we use bottom nav
                    closeMobile={() => { }}
                />
            </div>

            <main
                className={`
                    flex-1 min-h-screen flex flex-col relative transition-all duration-300
                    ${isSidebarCollapsed ? 'ml-0 md:ml-20' : 'ml-0 md:ml-64'}
                    pb-20 md:pb-0 /* Add padding bottom for mobile nav */
                `}
            >
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none fixed" />
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent dark:from-slate-900/50 pointer-events-none" />

                <Header onMenuClick={toggleMobileMenu} />

                <div className="flex-1 px-4 sm:px-8 pb-8 relative z-10 overflow-x-hidden">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <MobileNav onOpenAI={() => setIsAIChatOpen(true)} />

            {/* AI Chat Component */}
            <AIChat isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />

            {/* Desktop AI Trigger (Floating Button) - Visible only on desktop when chat is closed */}
            {!isAIChatOpen && (
                <button
                    onClick={() => setIsAIChatOpen(true)}
                    className="hidden md:flex fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg shadow-blue-600/30 items-center justify-center text-white hover:scale-110 transition-transform z-50 group"
                >
                    <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
                </button>
            )}
        </div>
    );
};

export default Layout;
