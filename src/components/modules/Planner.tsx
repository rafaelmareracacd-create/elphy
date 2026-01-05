"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, LayoutGrid, BarChart2, Timer, Info } from "lucide-react";
import PlannerBoard from "./planner/PlannerBoard";
import PlannerMatters from "./planner/PlannerMatters";
import PlannerNetHours from "./planner/PlannerNetHours";
import PlannerPomodoro from "./planner/PlannerPomodoro";
import { useRouter } from "next/navigation";
import HeaderActions from "../dashboard/HeaderActions";

const NAV_ITEMS = [
    { label: "Matérias", icon: LayoutGrid, id: "board-2" },
    { label: "Cronograma", icon: Calendar, id: "board" },
    { label: "Pomodoro", icon: Timer, id: "stats" },
    { label: "Horas Líquidas", icon: Timer, id: "net-hours" },
];

export default function PlannerModule() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("board-2");

    return (
        <div className="flex flex-col min-h-full bg-[#F8FAFC] dark:bg-[#121212] rounded-[32px] transition-colors duration-300">
            {/* 1. Top Header (Minimalist & Harmonious) */}
            {/* 1. Top Header (Redesigned) */}
            {/* 1. Top Header (Redesigned - Anki Style) */}
            <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#1E1E1E]/80 backdrop-blur-xl flex items-center z-50 sticky top-0 overflow-hidden shrink-0 transition-colors duration-300">
                {/* 1.1 Central Alignment Layer (Anki Style) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <nav className="flex items-center gap-1 pointer-events-auto px-4">
                        {NAV_ITEMS.map((item) => {
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`
                                        flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap
                                        ${isActive
                                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        }
                                    `}
                                >
                                    <item.icon size={16} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex-1" />

                <div className="relative z-10 flex items-center gap-6 px-6 shrink-0 justify-end w-auto">
                    <HeaderActions />
                </div>
            </header>

            {/* 2. Content Area - All components stay mounted for instant switching */}
            <div className="flex-1 flex relative bg-gray-50/50 dark:bg-[#121212] transition-colors duration-300 overflow-hidden">
                <main className="flex-1 relative flex flex-col h-full overflow-y-auto w-full">
                    {/* Keep all components mounted, toggle visibility with CSS */}
                    <div className={`p-4 md:p-8 ${activeTab === "board" ? "block" : "hidden"}`}>
                        <PlannerBoard />
                    </div>
                    <div className={`p-4 md:p-8 ${activeTab === "board-2" ? "block" : "hidden"}`}>
                        <PlannerMatters />
                    </div>
                    <div className={`p-4 md:p-8 ${activeTab === "net-hours" ? "block" : "hidden"}`}>
                        <PlannerNetHours />
                    </div>
                    <div className={`p-4 md:p-8 ${activeTab === "stats" ? "block" : "hidden"}`}>
                        <PlannerPomodoro />
                    </div>
                </main>
            </div>
        </div>
    );
}
