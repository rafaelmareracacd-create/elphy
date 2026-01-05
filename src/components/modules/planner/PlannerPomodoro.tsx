"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play, Pause, RotateCcw, SkipForward, Settings, Coffee,
    BookOpen, CheckCircle, Timer, ChevronDown, Volume2, VolumeX
} from "lucide-react";
import { useStudyData } from "@/hooks/useStudyData";
import { supabase } from "@/lib/supabase";

type TimerMode = "work" | "break" | "longBreak";

interface PomodoroSettings {
    workDuration: number; // minutes
    breakDuration: number;
    longBreakDuration: number;
    cyclesBeforeLongBreak: number;
    autoStartBreaks: boolean;
    autoStartWork: boolean;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    cyclesBeforeLongBreak: 4,
    autoStartBreaks: false,
    autoStartWork: false,
};

export default function PlannerPomodoro() {
    const { subjects, addSession } = useStudyData();

    // Timer State
    const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
    const [mode, setMode] = useState<TimerMode>("work");
    const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.workDuration * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [completedCycles, setCompletedCycles] = useState(0);

    // Subject Selection
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
    const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

    // Settings Modal
    const [showSettings, setShowSettings] = useState(false);

    // Sound
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Session tracking
    const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

    const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

    // Load settings from Supabase
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from("pomodoro_settings")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

        if (error) {
            console.error("Error loading pomodoro settings:", error);
            return;
        }

        if (data) {
            setSettings({
                workDuration: data.work_duration_minutes,
                breakDuration: data.break_duration_minutes,
                longBreakDuration: data.long_break_duration_minutes,
                cyclesBeforeLongBreak: data.cycles_before_long_break,
                autoStartBreaks: data.auto_start_breaks,
                autoStartWork: data.auto_start_work,
            });
            setTimeLeft(data.work_duration_minutes * 60);
        }
    };

    const saveSettings = async (newSettings: PomodoroSettings) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
            .from("pomodoro_settings")
            .upsert({
                user_id: user.id,
                work_duration_minutes: newSettings.workDuration,
                break_duration_minutes: newSettings.breakDuration,
                long_break_duration_minutes: newSettings.longBreakDuration,
                cycles_before_long_break: newSettings.cyclesBeforeLongBreak,
                auto_start_breaks: newSettings.autoStartBreaks,
                auto_start_work: newSettings.autoStartWork,
            }, { onConflict: "user_id" });

        setSettings(newSettings);
        setShowSettings(false);

        // Reset timer with new duration if in work mode
        if (mode === "work" && !isRunning) {
            setTimeLeft(newSettings.workDuration * 60);
        }
    };

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleTimerComplete();
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning, timeLeft]);

    const handleTimerComplete = useCallback(async () => {
        // Play sound
        if (soundEnabled) {
            const audio = new Audio("/sounds/bell.mp3");
            audio.play().catch(() => { });
        }

        if (mode === "work") {
            // Save session
            if (selectedSubjectId && sessionStartTime) {
                const duration = settings.workDuration * 60;
                await addSession(selectedSubjectId, duration, 'pomodoro');
            }

            const newCycles = completedCycles + 1;
            setCompletedCycles(newCycles);

            // Determine next mode
            if (newCycles % settings.cyclesBeforeLongBreak === 0) {
                setMode("longBreak");
                setTimeLeft(settings.longBreakDuration * 60);
            } else {
                setMode("break");
                setTimeLeft(settings.breakDuration * 60);
            }

            if (settings.autoStartBreaks) {
                setIsRunning(true);
            } else {
                setIsRunning(false);
            }
        } else {
            // Break finished
            setMode("work");
            setTimeLeft(settings.workDuration * 60);

            if (settings.autoStartWork) {
                setIsRunning(true);
                setSessionStartTime(Date.now());
            } else {
                setIsRunning(false);
            }
        }
    }, [mode, completedCycles, settings, selectedSubjectId, sessionStartTime, soundEnabled, addSession]);

    const toggleTimer = () => {
        if (!isRunning) {
            setSessionStartTime(Date.now());
        }
        setIsRunning(!isRunning);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setSessionStartTime(null);
        setTimeLeft(
            mode === "work"
                ? settings.workDuration * 60
                : mode === "break"
                    ? settings.breakDuration * 60
                    : settings.longBreakDuration * 60
        );
    };

    const skipToNext = () => {
        setIsRunning(false);
        if (mode === "work") {
            const newCycles = completedCycles + 1;
            setCompletedCycles(newCycles);
            if (newCycles % settings.cyclesBeforeLongBreak === 0) {
                setMode("longBreak");
                setTimeLeft(settings.longBreakDuration * 60);
            } else {
                setMode("break");
                setTimeLeft(settings.breakDuration * 60);
            }
        } else {
            setMode("work");
            setTimeLeft(settings.workDuration * 60);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const getProgress = () => {
        const total = mode === "work"
            ? settings.workDuration * 60
            : mode === "break"
                ? settings.breakDuration * 60
                : settings.longBreakDuration * 60;
        return ((total - timeLeft) / total) * 100;
    };

    const getModeColor = () => {
        switch (mode) {
            case "work": return "emerald";
            case "break": return "blue";
            case "longBreak": return "purple";
        }
    };

    const getModeLabel = () => {
        switch (mode) {
            case "work": return "Foco";
            case "break": return "Pausa Curta";
            case "longBreak": return "Pausa Longa";
        }
    };

    const color = getModeColor();

    return (
        <div className="flex flex-col items-center justify-start min-h-full gap-6 p-0 transition-colors duration-300">
            {/* Header */}
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Pomodoro Timer</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="p-2.5 rounded-xl text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                        title={soundEnabled ? "Desativar som" : "Ativar som"}
                    >
                        {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>
                    <button
                        onClick={() => setShowSettings(true)}
                        className="p-2.5 rounded-xl text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                        title="Configurações"
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            {/* Mode Indicator */}
            <motion.div
                layout
                className={`flex items-center gap-2 px-5 py-2 rounded-full border transition-all duration-300 ${mode === "work"
                    ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 shadow-sm shadow-emerald-500/5"
                    : mode === "break"
                        ? "bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 shadow-sm shadow-blue-500/5"
                        : "bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20 text-purple-700 dark:text-purple-400 shadow-sm shadow-purple-500/5"
                    }`}
            >
                {mode === "work" ? <BookOpen size={16} /> : <Coffee size={16} />}
                <span className="text-xs font-extrabold uppercase tracking-wider">{getModeLabel()}</span>
            </motion.div>

            {/* Timer Circle */}
            <div className="relative group">
                {/* Glow Effect */}
                <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 dark:opacity-25 transition-colors duration-500 bg-${color}-500`} />

                <svg className="w-72 h-72 transform -rotate-90 relative z-10">
                    {/* Background Circle */}
                    <circle
                        cx="144"
                        cy="144"
                        r="135"
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="none"
                        className="text-gray-100 dark:text-slate-800/50"
                    />
                    {/* Progress Circle */}
                    <motion.circle
                        cx="144"
                        cy="144"
                        r="135"
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="none"
                        strokeLinecap="round"
                        className={
                            mode === 'work' ? 'text-emerald-500' :
                                mode === 'break' ? 'text-blue-500' : 'text-purple-500'
                        }
                        strokeDasharray={2 * Math.PI * 135}
                        strokeDashoffset={2 * Math.PI * 135 * (1 - getProgress() / 100)}
                        transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                    />
                </svg>

                {/* Timer Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                    <motion.span
                        className="text-6xl font-black text-gray-900 dark:text-white tabular-nums tracking-tight transition-colors"
                        key={timeLeft}
                        initial={{ scale: 1.05, opacity: 0.8 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        {formatTime(timeLeft)}
                    </motion.span>
                    {selectedSubject && (
                        <motion.span
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-gray-500 dark:text-slate-400 mt-2 font-semibold px-3 py-0.5 rounded-full bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50"
                        >
                            {selectedSubject.name}
                        </motion.span>
                    )}
                </div>
            </div>

            {/* Subject Selector */}
            <div className="relative w-64">
                <button
                    onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
                    className="w-full flex items-center justify-between gap-2 px-5 py-3.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl hover:border-gray-300 dark:hover:border-slate-700 transition-all shadow-sm hover:shadow-md dark:shadow-none"
                    id="subject-selector"
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        {selectedSubject ? (
                            <>
                                <div className={`w-3.5 h-3.5 rounded-full shrink-0 shadow-sm ${selectedSubject.color}`} />
                                <span className="font-bold text-gray-800 dark:text-slate-200 truncate">{selectedSubject.name}</span>
                            </>
                        ) : (
                            <>
                                <BookOpen size={18} className="text-gray-400 dark:text-slate-500" />
                                <span className="text-gray-500 dark:text-slate-400 font-medium">Selecionar Matéria</span>
                            </>
                        )}
                    </div>
                    <ChevronDown size={18} className={`text-gray-400 dark:text-slate-500 transition-transform duration-300 ${showSubjectDropdown ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {showSubjectDropdown && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-full mb-3 left-0 right-0 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden ring-1 ring-black/5 dark:ring-white/5"
                        >
                            <div className="max-h-64 overflow-y-auto p-2 custom-scrollbar">
                                {subjects.map(subject => (
                                    <button
                                        key={subject.id}
                                        onClick={() => {
                                            setSelectedSubjectId(subject.id);
                                            setShowSubjectDropdown(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${selectedSubjectId === subject.id
                                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold"
                                            : "hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400 font-medium"
                                            }`}
                                    >
                                        <div className={`w-3.5 h-3.5 rounded-full shadow-sm shrink-0 ${subject.color}`} />
                                        <span className="truncate">{subject.name}</span>
                                    </button>
                                ))}
                                {subjects.length === 0 && (
                                    <p className="p-4 text-center text-sm text-gray-400 dark:text-slate-500 font-medium italic">
                                        Nenhuma matéria encontrada.
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6">
                <button
                    onClick={resetTimer}
                    className="p-4 rounded-2xl text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all active:scale-90"
                    title="Resetar"
                >
                    <RotateCcw size={28} />
                </button>

                <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleTimer}
                    className={`flex items-center gap-4 px-10 py-5 rounded-[24px] font-black text-xl shadow-xl transition-all ${isRunning
                        ? "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20"
                        : mode === 'work'
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20"
                            : mode === 'break'
                                ? "bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20"
                                : "bg-purple-500 hover:bg-purple-600 text-white shadow-purple-500/20"
                        }`}
                >
                    {isRunning ? (
                        <>
                            <Pause size={28} className="fill-current" />
                            Pausar
                        </>
                    ) : (
                        <>
                            <Play size={28} className="fill-current" />
                            Iniciar
                        </>
                    )}
                </motion.button>

                <button
                    onClick={skipToNext}
                    className="p-4 rounded-2xl text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all active:scale-90"
                    title="Pular"
                >
                    <SkipForward size={28} />
                </button>
            </div>

            {/* Cycle Counter */}
            <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3">
                    {Array.from({ length: settings.cyclesBeforeLongBreak }).map((_, i) => (
                        <motion.div
                            key={i}
                            initial={false}
                            animate={{
                                scale: i < (completedCycles % settings.cyclesBeforeLongBreak) ? 1.1 : 1,
                                opacity: i < (completedCycles % settings.cyclesBeforeLongBreak) ? 1 : 0.3
                            }}
                            className={`w-5 h-5 rounded-full transition-all border-2 ${i < (completedCycles % settings.cyclesBeforeLongBreak)
                                ? "bg-emerald-500 border-emerald-400 shadow-sm shadow-emerald-500/30"
                                : "bg-gray-200 dark:bg-slate-800 border-transparent"
                                }`}
                        />
                    ))}
                </div>
                <div className="flex items-center gap-3 text-sm font-bold tracking-tight">
                    <span className="text-gray-400 dark:text-slate-500">
                        {completedCycles % settings.cyclesBeforeLongBreak}/{settings.cyclesBeforeLongBreak} CICLOS
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-slate-700" />
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle size={16} /> {completedCycles} COMPLETOS
                    </span>
                </div>
            </div>

            {/* Settings Modal */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-all"
                        onClick={() => setShowSettings(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[32px] p-8 w-full max-w-md shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500/20 dark:bg-emerald-500/10" />

                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8">Ajustes do Timer</h3>

                            <div className="space-y-6">
                                {/* Duration Settings */}
                                <div className="grid grid-cols-3 gap-6">
                                    {[
                                        { label: 'FOCO', key: 'workDuration', color: 'emerald' },
                                        { label: 'CURTA', key: 'breakDuration', color: 'blue' },
                                        { label: 'LONGA', key: 'longBreakDuration', color: 'purple' }
                                    ].map(item => (
                                        <div key={item.key}>
                                            <label className={`text-[10px] font-black text-${item.color}-600 dark:text-${item.color}-400 uppercase tracking-widest block mb-1.5`}>
                                                {item.label} (MIN)
                                            </label>
                                            <input
                                                type="number"
                                                value={settings[item.key as keyof PomodoroSettings] as number}
                                                onChange={e => setSettings({ ...settings, [item.key]: Number(e.target.value) })}
                                                className="w-full px-3 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl text-center font-black text-xl text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                                min={1}
                                                max={120}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Cycles */}
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest block mb-1.5">
                                        CICLOS PARA PAUSA LONGA
                                    </label>
                                    <input
                                        type="number"
                                        value={settings.cyclesBeforeLongBreak}
                                        onChange={e => setSettings({ ...settings, cyclesBeforeLongBreak: Number(e.target.value) })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl text-center font-black text-xl text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                        min={1}
                                        max={10}
                                    />
                                </div>

                                {/* Auto-start toggles */}
                                <div className="space-y-3 pt-2">
                                    {[
                                        { label: 'Auto-iniciar pausas', key: 'autoStartBreaks' },
                                        { label: 'Auto-iniciar foco', key: 'autoStartWork' }
                                    ].map(item => (
                                        <label key={item.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-slate-700">
                                            <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{item.label}</span>
                                            <div className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={settings[item.key as keyof PomodoroSettings] as boolean}
                                                    onChange={e => setSettings({ ...settings, [item.key]: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="flex-1 py-4 px-6 border border-gray-200 dark:border-slate-700 rounded-2xl font-bold text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all active:scale-95"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => saveSettings(settings)}
                                    className="flex-1 py-4 px-6 bg-emerald-500 text-white rounded-2xl font-black hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                                >
                                    Salvar Ajustes
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

}
