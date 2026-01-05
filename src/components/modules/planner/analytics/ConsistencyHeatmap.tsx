"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { TrendingUp, Calendar as CalendarIcon, Info } from "lucide-react";

interface DayData {
    date: string;
    hours: number;
}

interface ConsistencyHeatmapProps {
    data: DayData[];
    onDayClick?: (date: string) => void;
}

// Get last 91 days (13 full weeks)
const getLast91Days = (): string[] => {
    const days: string[] = [];
    const today = new Date();

    // Find the most recent Sunday to align the grid
    const startOffset = today.getDay();
    const totalDays = 91 + startOffset;

    for (let i = totalDays - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        days.push(date.toISOString().split('T')[0]);
    }

    return days;
};

// Convert hours to color intensity with emerald palette
const getHeatColor = (hours: number): string => {
    if (hours === 0) return 'bg-gray-50';
    if (hours < 2) return 'bg-emerald-100';
    if (hours < 4) return 'bg-emerald-300';
    if (hours < 6) return 'bg-emerald-500';
    return 'bg-emerald-700';
};

const getHeatColorHover = (hours: number): string => {
    if (hours === 0) return 'hover:bg-gray-200';
    if (hours < 2) return 'hover:bg-emerald-200';
    if (hours < 4) return 'hover:bg-emerald-400';
    if (hours < 6) return 'hover:bg-emerald-600';
    return 'hover:bg-emerald-800';
};

export default function ConsistencyHeatmap({ data, onDayClick }: ConsistencyHeatmapProps) {
    const [hoveredDay, setHoveredDay] = useState<string | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    const { weeks, dataMap } = useMemo(() => {
        const days = getLast91Days();
        const map = new Map(data.map(d => [d.date, d.hours]));

        // Group by weeks
        const weeksArray: string[][] = [];
        for (let i = 0; i < days.length; i += 7) {
            weeksArray.push(days.slice(i, i + 7));
        }

        return { weeks: weeksArray, dataMap: map };
    }, [data]);

    const handleDayHover = (date: string, e: React.MouseEvent) => {
        setHoveredDay(date);
        setTooltipPos({ x: e.clientX, y: e.clientY });
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
    };

    const formatHours = (hours: number) => {
        const h = Math.floor(hours);
        const m = Math.floor((hours % 1) * 60);
        if (h === 0) return `${m}min`;
        return m > 0 ? `${h}h ${m}min` : `${h}h`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] h-full flex flex-col"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <TrendingUp className="text-blue-500" size={28} strokeWidth={2.5} />
                    <div>
                        <h3 className="font-black text-gray-800 text-base">Consistência</h3>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Últimos 13 Ciclos Semanais</p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ativo</span>
                </div>
            </div>

            {/* Heatmap Grid Container */}
            <div className="flex-1 flex flex-col justify-center">
                <div className="overflow-hidden">
                    <div className="flex gap-1.5 justify-center">
                        {weeks.slice(-13).map((week, weekIdx) => (
                            <div key={weekIdx} className="flex flex-col gap-1.5">
                                {week.map((date, dayIdx) => {
                                    const hours = dataMap.get(date) || 0;
                                    const colorClass = getHeatColor(hours);
                                    const hoverClass = getHeatColorHover(hours);

                                    return (
                                        <motion.button
                                            key={date}
                                            whileHover={{ scale: 1.25, zIndex: 10 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => onDayClick?.(date)}
                                            onMouseEnter={(e) => handleDayHover(date, e)}
                                            onMouseLeave={() => setHoveredDay(null)}
                                            className={`w-[14px] h-[14px] rounded-[4px] ${colorClass} ${hoverClass} transition-colors cursor-pointer border border-gray-100/50`}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Day Labels - Bottom */}
                <div className="flex gap-1.5 justify-center mt-3 ml-0">
                    {/* Placeholder matching week width for alignment */}
                    <div className="flex gap-1.5">
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].slice(0, 1).map((_, i) => (
                            <div key={i} className="w-[14px] text-[8px] font-black text-gray-300 text-center uppercase">Dom</div>
                        ))}
                        <div className="flex-1" />
                        <div className="w-[14px] text-[8px] font-black text-gray-300 text-center uppercase">Sab</div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-50">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Intensidade</span>
                    <div className="flex items-center gap-1">
                        {[0, 1, 3, 5, 7].map((hours, idx) => (
                            <div
                                key={idx}
                                className={`w-2.5 h-2.5 rounded-[3px] ${getHeatColor(hours)} border border-gray-100`}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-1.5 text-gray-300">
                    <Info size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Baseado em Horas Líquidas</span>
                </div>
            </div>

            {/* Tooltip */}
            {hoveredDay && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="fixed z-[100] px-4 py-2.5 rounded-2xl bg-gray-900/95 backdrop-blur-md text-white shadow-2xl border border-white/10 pointer-events-none"
                    style={{
                        left: tooltipPos.x + 15,
                        top: tooltipPos.y - 60,
                    }}
                >
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{formatDate(hoveredDay)}</div>
                    <div className="text-sm font-black text-white flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getHeatColor(dataMap.get(hoveredDay) || 0)}`} />
                        {formatHours(dataMap.get(hoveredDay) || 0)}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
