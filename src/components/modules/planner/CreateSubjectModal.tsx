"use client";

import { useState, useEffect } from "react";
import { X, Palette, Clock, Grid } from "lucide-react";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TimePicker from "@/components/ui/TimePicker";

interface SubjectData {
    title: string;
    color: string;
    goalHours: number;
    icon?: string;
    startTime?: string;
}

interface CreateSubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: SubjectData) => void;
    initialData?: SubjectData;
}

const COLORS = [
    { label: "Vermelho", value: "bg-red-500" },
    { label: "Laranja", value: "bg-orange-500" },
    { label: "Âmbar", value: "bg-amber-500" },
    { label: "Amarelo", value: "bg-yellow-500" },
    { label: "Lima", value: "bg-lime-500" },
    { label: "Verde", value: "bg-green-500" },
    { label: "Esmeralda", value: "bg-emerald-500" },
    { label: "Teal", value: "bg-teal-500" },
    { label: "Ciano", value: "bg-cyan-500" },
    { label: "Céu", value: "bg-sky-500" },
    { label: "Azul", value: "bg-blue-500" },
    { label: "Indigo", value: "bg-indigo-500" },
    { label: "Violeta", value: "bg-violet-500" },
    { label: "Roxo", value: "bg-purple-500" },
    { label: "Fúcsia", value: "bg-fuchsia-500" },
    { label: "Rosa", value: "bg-pink-500" },
    { label: "Rose", value: "bg-rose-500" },
];

const ICONS = [
    "Book", "Calculator", "FlaskConical", "Globe", "Languages", "Laptop",
    "Palette", "Music", "Dna", "Microscope", "Atom", "Brain", "History",
    "Scale", "Briefcase", "Code", "Database", "Cpu"
];

export default function CreateSubjectModal({ isOpen, onClose, onSubmit, initialData }: CreateSubjectModalProps) {
    const [title, setTitle] = useState("");
    const [color, setColor] = useState(COLORS[6].value); // Default Emerald
    const [goalHours, setGoalHours] = useState(20);
    const [icon, setIcon] = useState("Book");
    const [startTime, setStartTime] = useState("");

    // Effect to reset or populate form when modal opens or initialData changes
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title);
                setColor(initialData.color);
                setGoalHours(initialData.goalHours || 20);
                setIcon(initialData.icon || "Book");
                setStartTime(initialData.startTime || "");
            } else {
                setTitle("");
                setColor(COLORS[6].value);
                setGoalHours(20);
                setIcon("Book");
                setStartTime("");
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        onSubmit({ title, color, goalHours: Number(goalHours), icon, startTime });
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
                            className="bg-white dark:bg-[#121212] rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border border-gray-100 dark:border-white/5"
                        >
                            <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                                    {initialData ? "Editar Matéria" : "Nova Matéria"}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-3 space-y-3">
                                {/* Title Input */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Nome da Matéria
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Ex: Matemática, História..."
                                        className="w-full h-10 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 font-medium text-gray-900 dark:text-white"
                                        autoFocus
                                    />
                                </div>

                                {/* Icon Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Grid className="w-4 h-4 text-purple-500" />
                                        Ícone
                                    </label>
                                    <div className="max-h-[80px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10 p-1.5 border border-gray-100 dark:border-white/5 rounded-xl bg-gray-50/50 dark:bg-white/[0.02]">
                                        <div className="grid grid-cols-7 gap-1.5">
                                            {ICONS.map((iconName) => {
                                                const Icon = (Icons as any)[iconName];
                                                return (
                                                    <button
                                                        key={iconName}
                                                        type="button"
                                                        onClick={() => setIcon(iconName)}
                                                        className={`
                                                            w-7 h-7 rounded-lg flex items-center justify-center transition-all
                                                            ${icon === iconName
                                                                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-105"
                                                                : "bg-white dark:bg-white/5 text-gray-400 dark:text-gray-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                                                            }
                                                        `}
                                                        title={iconName}
                                                    >
                                                        {Icon && <Icon className="w-5 h-5" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Goal Hours & Start Time Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Goal Hours Input */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Meta (Horas)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={goalHours}
                                                onChange={(e) => setGoalHours(Number(e.target.value))}
                                                min="1"
                                                className="w-full h-10 pl-3 pr-8 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 font-medium text-center text-gray-900 dark:text-white"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500 font-medium">
                                                h
                                            </span>
                                        </div>
                                    </div>

                                    {/* Start Time Input - NEW */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-blue-500" />
                                            Início
                                        </label>
                                        <TimePicker
                                            value={startTime}
                                            onChange={setStartTime}
                                        />
                                    </div>
                                </div>

                                {/* Color Selection */}
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Palette className="w-4 h-4 text-pink-500" />
                                        Cor
                                    </label>
                                    <div className="max-h-[60px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-white/10 p-1.5">
                                        <div className="grid grid-cols-8 gap-2">
                                            {COLORS.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => setColor(opt.value)}
                                                    className={`
                                                            w-6 h-6 rounded-full transition-all relative shrink-0
                                                            ${color === opt.value ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "hover:scale-110"}
                                                        ${opt.value}
                                                    `}
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
