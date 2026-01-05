"use client";

import { usePathname, useRouter } from "next/navigation";
import { Plus, LayoutGrid, Layers, RefreshCw, BarChart2, Timer, ChevronRight, ChevronLeft, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import HeaderActions from "../../dashboard/HeaderActions";

interface AnkiNavbarProps {
    onOpenAddModal: () => void;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    elapsedTime?: number; // Optional as not all pages might track it
    isTimerPaused?: boolean;
    onTogglePause?: () => void;
    view?: 'study' | 'stats';
    onSetView?: (view: 'study' | 'stats') => void;
    showSidebarToggle?: boolean;
    onRedoReviews?: () => void;
}

const NAV_ITEMS = [
    { label: "Baralhos", icon: Layers, path: "/dashboard/decks" },
    { label: "Adicionar", icon: Plus, action: "add" },
    { label: "Painel", icon: LayoutGrid, path: "/dashboard/anki", view: 'study' },
    { label: "Estatísticas", icon: BarChart2, path: "/dashboard/anki", view: 'stats' },
    { label: "Refazer", icon: RefreshCw, action: "reload" },
];

export default function AnkiNavbar({
    onOpenAddModal,
    sidebarOpen,
    setSidebarOpen,
    elapsedTime = 0,
    isTimerPaused = false,
    onTogglePause,
    view,
    onSetView,
    showSidebarToggle = true,
    onRedoReviews
}: AnkiNavbarProps) {
    const router = useRouter();
    const pathname = usePathname();

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleNavigation = (item: typeof NAV_ITEMS[0]) => {
        if (item.action === "add") {
            onOpenAddModal();
        } else if (item.action === "reload") {
            if (onRedoReviews) {
                onRedoReviews();
            } else {
                window.location.reload();
            }
        } else if (item.path) {
            if (item.view && onSetView) {
                // If we are on the correct page, just switch view
                if (pathname === item.path) {
                    onSetView(item.view as 'study' | 'stats');
                } else {
                    // Navigate and maybe need query param to set view? 
                    // For simplicity, navigating to Anki defaults to study.
                    // If we want to link directly to stats we might need ?view=stats logic in Anki.tsx
                    // But for now let's just push.
                    router.push(item.path);
                }
            } else {
                router.push(item.path);
            }
        }
    };

    return (
        <header className="h-16 border-b border-gray-100 dark:border-white/5 bg-white dark:bg-slate-900/95 flex items-center z-50 sticky top-0 overflow-hidden shrink-0 transition-colors duration-300">
            {/* 1.1 Central Alignment Layer */}
            <div className="absolute inset-0 flex items-center justify-start pointer-events-none">
                <div className={`transition-all duration-300 flex justify-center ${sidebarOpen && showSidebarToggle ? 'w-[calc(100%-340px)]' : 'w-full'}`}>
                    <nav className="flex items-center gap-1 pointer-events-auto px-4">
                        {NAV_ITEMS.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => handleNavigation(item)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${(pathname === item.path && (!item.view || item.view === view))
                                    ? 'bg-emerald-600/10 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10'
                                    : 'text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                                    }`}
                            >
                                <item.icon size={18} className={(pathname === item.path && (!item.view || item.view === view)) ? "text-emerald-600 dark:text-emerald-400" : ""} />
                                <span className="hidden lg:inline">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            <div className="flex-1" />

            <div className={`relative z-10 flex items-center gap-4 px-6 shrink-0 justify-end transition-all duration-300 ${sidebarOpen && showSidebarToggle ? 'w-[340px]' : 'w-auto'}`}>
                {elapsedTime > 0 && (
                    <button
                        onClick={onTogglePause}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 group ${isTimerPaused
                            ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20 text-orange-600 dark:text-orange-400 shadow-sm'
                            : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                        title={isTimerPaused ? "Retomar Cronômetro" : "Pausar Cronômetro"}
                    >
                        {isTimerPaused ? (
                            <Play size={14} className="fill-current" />
                        ) : (
                            <Pause size={14} className="fill-current" />
                        )}
                        <span className={`text-xs font-mono font-bold tracking-wide ${isTimerPaused ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'}`}>
                            {formatTime(elapsedTime)}
                        </span>
                    </button>
                )}

                <HeaderActions />

                {showSidebarToggle && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    >
                        {sidebarOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </Button>
                )}
            </div>
        </header>
    );
}
