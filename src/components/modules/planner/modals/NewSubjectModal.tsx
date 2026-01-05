"use client";

import { useState } from "react";
import { X, Clock, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface NewSubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { title: string; color: string; daily_goal_minutes: number }) => void;
}

const COLORS = [
    { name: "Red", class: "bg-[#E5554E]" }, { name: "Orange", class: "bg-[#E98244]" }, { name: "Amber", class: "bg-[#F2A745]" },
    { name: "Yellow", class: "bg-[#EBB440]" }, { name: "Lime", class: "bg-[#96C93D]" }, { name: "Green", class: "bg-[#69BE6B]" },
    { name: "Emerald", class: "bg-[#61B091]" }, { name: "Teal", class: "bg-[#63B2A5]" }, { name: "Cyan", class: "bg-[#6CB8D5]" },
    { name: "Sky", class: "bg-[#62ACE0]" }, { name: "Blue", class: "bg-[#5D96E4]" }, { name: "Indigo", class: "bg-[#6A7EE4]" },
    { name: "Violet", class: "bg-[#7F7AE3]" }, { name: "Purple", class: "bg-[#A770E3]" }, { name: "Fuchsia", class: "bg-[#D169E3]" },
    { name: "Pink", class: "bg-[#DE5C9D]" }, { name: "Rose", class: "bg-[#E15366]" }, { name: "Slate", class: "bg-[#6E7F91]" },
    { name: "Stone", class: "bg-[#7C8085]" }, { name: "Gray", class: "bg-[#6C6F74]" }, { name: "Neutral", class: "bg-[#75716C]" }
];

const PRESET_DURATIONS = [
    { label: "30m", minutes: 30 }, { label: "45m", minutes: 45 }, { label: "1h", minutes: 60 },
    { label: "1h30", minutes: 90 }, { label: "2h", minutes: 120 }, { label: "3h", minutes: 180 }
];

export default function NewSubjectModal({ isOpen, onClose, onSubmit }: NewSubjectModalProps) {
    const [title, setTitle] = useState("");
    const [selectedColor, setSelectedColor] = useState(COLORS[6].class); // Default Emerald
    const [durationHours, setDurationHours] = useState("1");
    const [durationMinutes, setDurationMinutes] = useState("00");

    const handlePresetSelect = (mins: number) => {
        setDurationHours(Math.floor(mins / 60).toString());
        setDurationMinutes((mins % 60).toString().padStart(2, '0'));
    };

    const handleCreate = () => {
        if (!title.trim()) return;
        const totalMinutes = parseInt(durationHours || "0") * 60 + parseInt(durationMinutes || "0");
        onSubmit({
            title,
            color: selectedColor,
            daily_goal_minutes: totalMinutes || 60
        });
        reset();
    };

    const reset = () => {
        setTitle("");
        setSelectedColor(COLORS[6].class);
        setDurationHours("1");
        setDurationMinutes("00");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-[440px] bg-white rounded-[28px] shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-50">
                            <h2 className="text-xl font-bold text-slate-800">Nova Matéria</h2>
                            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
                            {/* Subject Name */}
                            <div className="space-y-2.5">
                                <label className="text-[13px] font-bold text-slate-500 ml-1">Nome da Matéria / Tarefa</label>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Ex: Matemática, Revisão Anki..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-semibold placeholder:text-slate-300 outline-none focus:border-emerald-400 transition-all"
                                />
                            </div>

                            {/* Duration Goal */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-slate-500 ml-1">
                                    <Clock size={16} />
                                    <label className="text-[13px] font-bold">Duração Estimada (Meta Diária)</label>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    {PRESET_DURATIONS.map(preset => {
                                        const isSelected = (parseInt(durationHours) * 60 + parseInt(durationMinutes)) === preset.minutes;
                                        return (
                                            <button
                                                key={preset.label}
                                                onClick={() => handlePresetSelect(preset.minutes)}
                                                className={`py-3 rounded-xl border-2 text-[13px] font-bold transition-all ${isSelected ? 'border-emerald-400 bg-emerald-50 text-emerald-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                            >
                                                {preset.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex items-center justify-center gap-3 py-2">
                                    <div className="flex flex-col items-center gap-1.5 flex-1 max-w-[120px]">
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Horas</span>
                                        <input
                                            type="number"
                                            value={durationHours}
                                            onChange={(e) => setDurationHours(e.target.value)}
                                            className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-center font-bold text-slate-700 outline-none focus:border-emerald-400"
                                        />
                                    </div>
                                    <span className="text-xl font-bold text-slate-200 mt-5">:</span>
                                    <div className="flex flex-col items-center gap-1.5 flex-1 max-w-[120px]">
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Minutos</span>
                                        <input
                                            type="number"
                                            value={durationMinutes}
                                            onChange={(e) => setDurationMinutes(e.target.value)}
                                            className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-center font-bold text-slate-700 outline-none focus:border-emerald-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Color Picker */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-slate-500 ml-1">
                                    <Palette size={16} />
                                    <label className="text-[13px] font-bold">Cor de Identificação</label>
                                </div>

                                <div className="grid grid-cols-7 gap-3">
                                    {COLORS.map(color => (
                                        <button
                                            key={color.class}
                                            onClick={() => setSelectedColor(color.class)}
                                            className={`w-10 h-10 rounded-full ${color.class} flex items-center justify-center transition-all ${selectedColor === color.class ? 'ring-4 ring-slate-100 scale-110 shadow-lg' : 'hover:scale-105'}`}
                                        >
                                            {selectedColor === color.class && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 flex gap-3 border-t border-gray-50 bg-slate-50/30">
                            <button
                                onClick={onClose}
                                className="flex-1 py-4 text-slate-500 font-bold text-sm hover:bg-slate-100 transition-colors rounded-2xl"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={!title.trim()}
                                className="flex-1 py-4 bg-emerald-500/30 text-emerald-700 hover:bg-emerald-500/40 font-black text-sm transition-all rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Criar
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
