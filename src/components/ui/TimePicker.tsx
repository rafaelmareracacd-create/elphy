"use client";

import { useState, useRef, useEffect } from "react";
import { Clock, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TimePickerProps {
    value: string;
    onChange: (time: string) => void;
    className?: string;
}

export default function TimePicker({ value, onChange, className = "" }: TimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse current value
    const [hours, minutes] = value ? value.split(":").map(Number) : [null, null];

    const hoursList = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
    const minutesList = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, "0")); // 5-minute intervals for easier selection

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleHourSelect = (h: string) => {
        const m = minutes !== null ? minutes.toString().padStart(2, "0") : "00";
        onChange(`${h}:${m}`);
    };

    const handleMinuteSelect = (m: string) => {
        const h = hours !== null ? hours.toString().padStart(2, "0") : "09"; // Default to 09 if no hour selected
        onChange(`${h}:${m}`);
        // Optionally close on minute select if you want
        // setIsOpen(false); 
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-white/10
                    focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 
                    outline-none transition-all font-medium text-center text-gray-600 dark:text-gray-400
                    flex items-center justify-center gap-2 bg-white dark:bg-white/5
                    ${isOpen ? "ring-4 ring-emerald-500/10 border-emerald-500" : "hover:bg-gray-50 dark:hover:bg-white/[0.08]"}
                `}
            >
                <Clock className={`w-4 h-4 ${value ? "text-emerald-500" : "text-gray-400 dark:text-gray-600"}`} />
                <span className={value ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-600"}>
                    {value || "--:--"}
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/5 z-50 overflow-hidden flex flex-col"
                    >
                        <div className="flex h-[200px] divide-x divide-gray-100 dark:divide-white/5">
                            {/* Hours Column */}
                            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10 p-1">
                                <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 text-center py-2 sticky top-0 bg-white dark:bg-[#1A1A1A] z-10">
                                    HORA
                                </div>
                                <div className="space-y-0.5">
                                    {hoursList.map((h) => (
                                        <button
                                            key={h}
                                            type="button"
                                            onClick={() => handleHourSelect(h)}
                                            className={`
                                                w-full py-1.5 rounded-lg text-sm font-medium transition-colors
                                                ${hours?.toString().padStart(2, "0") === h
                                                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                                                }
                                            `}
                                        >
                                            {h}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Minutes Column */}
                            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10 p-1">
                                <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 text-center py-2 sticky top-0 bg-white dark:bg-[#1A1A1A] z-10">
                                    MIN
                                </div>
                                <div className="space-y-0.5">
                                    {minutesList.map((m) => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => handleMinuteSelect(m)}
                                            className={`
                                                w-full py-1.5 rounded-lg text-sm font-medium transition-colors
                                                ${minutes?.toString().padStart(2, "0") === m
                                                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                                                }
                                            `}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-2 border-t border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="w-full py-2 rounded-xl text-xs font-bold text-emerald-500 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                            >
                                PRONTO
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
