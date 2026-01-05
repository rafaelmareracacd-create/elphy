"use client"

import Sidebar from "@/components/dashboard/Sidebar";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { StudyProvider } from "@/context/StudyContext";
import { ThemeProvider } from "@/components/dashboard/home-test/ThemeContext";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <StudyProvider>
            <ThemeProvider>
                <div className="h-full relative bg-[#F8F9FA] dark:bg-[#0A0A0A] transition-colors duration-300">
                    {/* Mobile Header - Only visible on small screens */}
                    <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#121212] border-b border-gray-200 dark:border-gray-800 z-40 flex items-center justify-between px-4">
                        <div className="font-bold text-lg text-gray-900 dark:text-white">Elphy</div>
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>

                    {/* Mobile Sidebar Overlay */}
                    <AnimatePresence>
                        {sidebarOpen && (
                            <>
                                {/* Backdrop */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setSidebarOpen(false)}
                                    className="fixed inset-0 bg-black/50 z-50 md:hidden"
                                />

                                {/* Mobile Sidebar */}
                                <motion.div
                                    initial={{ x: "-100%" }}
                                    animate={{ x: 0 }}
                                    exit={{ x: "-100%" }}
                                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                    className="fixed inset-y-0 left-0 w-72 z-50 md:hidden"
                                >
                                    <div className="h-full relative">
                                        <Sidebar />
                                        {/* Close button */}
                                        <button
                                            onClick={() => setSidebarOpen(false)}
                                            className="absolute top-4 right-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    {/* Desktop Sidebar - Hidden on mobile */}
                    <div
                        className={cn(
                            "hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 z-50 transition-all duration-300 ease-in-out font-sans",
                            isSidebarCollapsed ? "md:w-20" : "md:w-64"
                        )}
                    >
                        <Sidebar
                            isCollapsed={isSidebarCollapsed}
                            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        />
                    </div>

                    {/* Main Content */}
                    <main
                        className={cn(
                            "pt-16 md:pt-0 transition-all duration-300 ease-in-out h-full overflow-y-auto",
                            isSidebarCollapsed ? "md:pl-20" : "md:pl-64"
                        )}
                    >
                        {children}
                    </main>
                </div>
            </ThemeProvider>
        </StudyProvider>
    );
}
