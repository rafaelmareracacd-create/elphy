"use client";

import { useState } from "react";
import { X, Clock, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TaskData {
    id?: string;
    title: string;
    duration: number;
    color: string;
    startTime?: string;
}

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: TaskData) => void;
    initialDay?: string;
    usedColors?: string[];
    initialData?: TaskData | null;
}

const DURATIONS = [
    { label: "30m", value: 30 },
    { label: "45m", value: 45 },
    { label: "1h", value: 60 },
    { label: "1h30", value: 90 },
    { label: "2h", value: 120 },
    { label: "3h", value: 180 },
];

const COLORS = [
    { label: "Vermelho", value: "#ef4444" },
    { label: "Laranja", value: "#f97316" },
    { label: "Âmbar", value: "#f59e0b" },
    { label: "Amarelo", value: "#eab308" },
    { label: "Lima", value: "#84cc16" },
    { label: "Verde", value: "#22c55e" },
    { label: "Esmeralda", value: "#10b981" },
    { label: "Teal", value: "#14b8a6" },
    { label: "Ciano", value: "#06b6d4" },
    { label: "Céu", value: "#0ea5e9" },
    { label: "Azul", value: "#3b82f6" },
    { label: "Indigo", value: "#6366f1" },
    { label: "Violeta", value: "#8b5cf6" },
    { label: "Roxo", value: "#a855f7" },
    { label: "Fúcsia", value: "#d946ef" },
    { label: "Rosa", value: "#ec4899" },
    { label: "Rose", value: "#f43f5e" },
    { label: "Slate", value: "#64748b" },
    { label: "Gray", value: "#6b7280" },
    { label: "Zinc", value: "#71717a" },
    { label: "Neutral", value: "#737373" },
    { label: "Stone", value: "#78716c" },
];

export default function CreateTaskModal({ isOpen, onClose, onSubmit, initialDay, usedColors = [], initialData }: CreateTaskModalProps) {
    // State initialization moved to useEffect or lazy init? 
    // Effect is safer for modal reuse
    const [title, setTitle] = useState("");
    const [duration, setDuration] = useState(60);
    const [color, setColor] = useState(COLORS[1].value);
    const [startTime, setStartTime] = useState("");
    const [showHourPicker, setShowHourPicker] = useState(false);
    const [showMinutePicker, setShowMinutePicker] = useState(false);

    // Sync state on open
    const [prevIsOpen, setPrevIsOpen] = useState(false);
    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen);
        if (isOpen) {
            if (initialData) {
                // Edit Mode
                setTitle(initialData.title);
                setDuration(initialData.duration);
                setColor(initialData.color);
                setStartTime(initialData.startTime || "");
            } else {
                // Create Mode
                setTitle("");
                setDuration(60);

                // Suggest a color that hasn't been used yet
                const availableColor = COLORS.find(c => !usedColors.includes(c.value));
                setColor(availableColor ? availableColor.value : COLORS[Math.floor(Math.random() * COLORS.length)].value);

                setStartTime("");
            }

        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        onSubmit({ title, duration, color, startTime });
        setTitle("");
        setDuration(60);
        setColor(COLORS[1].value);
        setStartTime("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-[#121212] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-gray-100 dark:border-white/5"
                        >
                            <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                                    {initialData ? "Editar Tarefa" : "Nova Tarefa"}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                                {/* Title Input */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Nome da Matéria / Tarefa
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Ex: Matemática, Revisão Anki..."
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 font-medium text-gray-900 dark:text-white"
                                        autoFocus
                                    />
                                </div>

                                {/* Start Time Input (Optional) */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Horário de Início (Opcional)
                                    </label>
                                    <div className="flex gap-2">
                                        {/* Hour Selector */}
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={2}
                                                placeholder="HH"
                                                value={startTime ? startTime.split(':')[0] : ''}
                                                onFocus={() => setShowHourPicker(true)}
                                                onBlur={() => setTimeout(() => setShowHourPicker(false), 200)}
                                                onChange={(e) => {
                                                    let val = e.target.value.replace(/\D/g, '');
                                                    if (parseInt(val) > 23) val = '23';
                                                    const h = startTime ? startTime.split(':')[1] : '00';
                                                    setStartTime(`${val}:${h}`);
                                                }}
                                                className="w-full h-11 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-center z-10 relative text-gray-900 dark:text-white"
                                            />

                                            <AnimatePresence>
                                                {showHourPicker && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        transition={{ duration: 0.15, ease: "easeOut" }}
                                                        className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#1A1A1A] rounded-xl shadow-2xl border border-gray-100 dark:border-white/5 max-h-48 overflow-y-auto z-50 py-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10 scrollbar-track-transparent"
                                                    >
                                                        {Array.from({ length: 24 }).map((_, i) => {
                                                            const h = i.toString().padStart(2, '0');
                                                            return (
                                                                <div
                                                                    key={h}
                                                                    onMouseDown={(e) => {
                                                                        e.preventDefault();
                                                                        const m = startTime ? startTime.split(':')[1] : '00';
                                                                        setStartTime(`${h}:${m}`);
                                                                        setShowHourPicker(false);
                                                                    }}
                                                                    className="px-2 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 cursor-pointer text-center text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                                                                >
                                                                    {h}
                                                                </div>
                                                            );
                                                        })}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <span className="self-center font-bold text-gray-400">:</span>

                                        {/* Minute Selector */}
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={2}
                                                placeholder="MM"
                                                value={startTime ? startTime.split(':')[1] : ''}
                                                onFocus={() => setShowMinutePicker(true)}
                                                onBlur={() => setTimeout(() => setShowMinutePicker(false), 200)}
                                                onChange={(e) => {
                                                    let val = e.target.value.replace(/\D/g, '');
                                                    if (parseInt(val) > 59) val = '59';
                                                    const h = startTime ? startTime.split(':')[0] : '08';
                                                    setStartTime(`${h}:${val}`);
                                                }}
                                                className="w-full h-11 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-center z-10 relative text-gray-900 dark:text-white"
                                            />

                                            <AnimatePresence>
                                                {showMinutePicker && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        transition={{ duration: 0.15, ease: "easeOut" }}
                                                        className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#1A1A1A] rounded-xl shadow-2xl border border-gray-100 dark:border-white/5 max-h-48 overflow-y-auto z-50 py-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10 scrollbar-track-transparent"
                                                    >
                                                        {Array.from({ length: 12 }).map((_, i) => {
                                                            const m = (i * 5).toString().padStart(2, '0');
                                                            return (
                                                                <div
                                                                    key={m}
                                                                    onMouseDown={(e) => {
                                                                        e.preventDefault();
                                                                        const h = startTime ? startTime.split(':')[0] : '08';
                                                                        setStartTime(`${h}:${m}`);
                                                                        setShowMinutePicker(false);
                                                                    }}
                                                                    className="px-2 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 cursor-pointer text-center text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                                                                >
                                                                    {m}
                                                                </div>
                                                            );
                                                        })}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                    {startTime && startTime.length === 5 && (
                                        <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-gray-400 dark:text-gray-500 pl-1">
                                            <div className="w-1 h-1 rounded-full bg-emerald-400" />
                                            <span>
                                                Término previsto: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{(() => {
                                                    const [h, m] = startTime.split(':').map(Number);
                                                    if (isNaN(h) || isNaN(m)) return '--:--';
                                                    const totalMinutes = h * 60 + m + duration;
                                                    const endH = Math.floor(totalMinutes / 60) % 24;
                                                    const endM = totalMinutes % 60;
                                                    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
                                                })()}</span>
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Duration Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-emerald-500" />
                                        Duração Estimada
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {DURATIONS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setDuration(opt.value)}
                                                className={`
                                                    py-2 px-3 rounded-lg text-xs font-semibold transition-all border
                                                    ${duration === opt.value
                                                        ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-sm"
                                                        : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/[0.08]"
                                                    }
                                                `}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Manual Duration Input */}
                                    <div className="flex gap-2 items-center mt-2 pt-2 border-t border-gray-50 dark:border-white/5">
                                        <div className="flex-1 relative">
                                            <label className="text-[9px] font-bold text-gray-400 dark:text-gray-500 absolute -top-1.5 left-2 bg-white dark:bg-[#121212] px-1">HORAS</label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={Math.floor(duration / 60).toString()}
                                                onChange={(e) => {
                                                    let h = parseInt(e.target.value.replace(/\D/g, '') || '0');
                                                    if (h > 9) h = 9; // Cap at 9h for sanity? or 23? Let's say reasonable study block max 8h
                                                    const m = duration % 60;
                                                    setDuration(h * 60 + m);
                                                }}
                                                className="w-full h-10 px-4 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-center text-sm text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <span className="font-bold text-gray-300">:</span>
                                        <div className="flex-1 relative">
                                            <label className="text-[9px] font-bold text-gray-400 dark:text-gray-500 absolute -top-1.5 left-2 bg-white dark:bg-[#121212] px-1">MINUTOS</label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={2}
                                                value={(duration % 60).toString().padStart(2, '0')}
                                                onChange={(e) => {
                                                    let m = parseInt(e.target.value.replace(/\D/g, '') || '0');
                                                    const h = Math.floor(duration / 60);
                                                    setDuration(h * 60 + m);
                                                }}
                                                className="w-full h-10 px-4 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-center text-sm text-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Color Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Palette className="w-4 h-4 text-purple-500" />
                                        Cor de Identificação
                                    </label>
                                    <div className="max-h-[100px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10 p-2">
                                        <div className="grid grid-cols-7 gap-2">
                                            {COLORS.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => setColor(opt.value)}
                                                    className={`
                                                        w-7 h-7 rounded-full transition-all relative
                                                        ${color === opt.value ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "hover:scale-110"}
                                                    `}
                                                    style={{ backgroundColor: opt.value }}
                                                    title={opt.label}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="pt-3 flex items-center gap-3 border-t border-gray-50 dark:border-white/5">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 py-2 rounded-xl font-semibold text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!title.trim()}
                                        className="flex-1 py-2 rounded-xl font-bold text-sm text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        {initialData ? "Salvar" : "Criar"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
