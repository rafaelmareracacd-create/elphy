"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Pause, Play, Timer, Info, TrendingUp, Target, Flame, CheckCircle, AlertCircle, Lightbulb, RotateCcw, Edit3 } from "lucide-react";
import { useStudyData } from "@/hooks/useStudyData";

export default function PlannerNetHours() {
    const { subjects, heatmap, totalHours, totalPomodoros, loading, addSession, updateSubject } = useStudyData();
    const [activeTimers, setActiveTimers] = useState<Record<string, number>>({});
    const [runningTimers, setRunningTimers] = useState<Record<string, boolean>>({});
    const [openPopover, setOpenPopover] = useState<string | null>(null);
    const [resetConfirm, setResetConfirm] = useState<string | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Manual Entry State
    const [manualHours, setManualHours] = useState("");
    const [manualMinutes, setManualMinutes] = useState("");
    const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTimers((prev) => {
                const updated = { ...prev };
                Object.keys(runningTimers).forEach((id) => {
                    if (runningTimers[id]) {
                        updated[id] = (updated[id] || 0) + 1;
                    }
                });
                return updated;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [runningTimers]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setOpenPopover(null);
                setResetConfirm(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleTimer = (subjectId: string) => {
        const newRunningTimers: Record<string, boolean> = {};
        subjects.forEach((s) => {
            newRunningTimers[s.id] = s.id === subjectId ? !runningTimers[subjectId] : false;
        });
        setRunningTimers(newRunningTimers);
        setOpenPopover(null);
    };

    const resetTimer = (subjectId: string) => {
        setActiveTimers((prev) => ({ ...prev, [subjectId]: 0 }));
        setRunningTimers((prev) => ({ ...prev, [subjectId]: false }));
        setResetConfirm(null);
        setOpenPopover(null);
    };

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatMinutes = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        return `${mins}min`;
    };

    const getHeatmapColor = (hours: number) => {
        if (hours === 0) return 'bg-gray-100 dark:bg-gray-700/50';
        if (hours < 2) return 'bg-emerald-200 dark:bg-emerald-900/40';
        if (hours < 4) return 'bg-emerald-400 dark:bg-emerald-600';
        return 'bg-emerald-600 dark:bg-emerald-500';
    };

    const totalHoursStudied = totalHours;
    const totalGoalHours = subjects.reduce((acc, s) => acc + s.goalHours, 0);
    const mostStudiedSubject = subjects.reduce((max, s) => s.hoursStudied > max.hoursStudied ? s : max, subjects[0] || { name: 'Nenhuma' });
    const avgDailyHours = (totalHoursStudied / 30).toFixed(1);
    const todayHours = heatmap[heatmap.length - 1]?.hours || 0;
    const dailyGoal = 4;
    const daysToComplete = totalGoalHours > totalHoursStudied ? Math.ceil((totalGoalHours - totalHoursStudied) / 4) : 0;

    const saveSession = async (subjectId: string) => {
        const seconds = activeTimers[subjectId] || 0;
        if (seconds === 0) return;

        // Use hook to save data to Supabase
        await addSession(subjectId, seconds);

        // Reset timer
        resetTimer(subjectId);
    };



    // Manual Session Handler
    const handleAddManualSession = async (subjectId: string) => {
        const hrs = parseInt(manualHours) || 0;
        const mins = parseInt(manualMinutes) || 0;
        const totalSeconds = (hrs * 3600) + (mins * 60);

        if (totalSeconds > 0) {
            await addSession(subjectId, totalSeconds);
            setManualHours("");
            setManualMinutes("");
            setOpenPopover(null);
            setEditingSubjectId(null);
        }
    };

    return (
        <div className="flex flex-col min-h-full gap-6 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Horas Líquidas</h2>
                        <div className="group relative">
                            <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center cursor-help hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                <Info size={12} className="text-gray-500 dark:text-gray-400" />
                            </div>
                            <div className="absolute left-0 top-8 w-72 bg-gray-900 dark:bg-gray-800 text-white text-xs p-4 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                <p className="font-semibold mb-2">Tempo real de estudo</p>
                                <p className="text-gray-300 mb-3">Cronometragem focada, sem pausas ou distrações.</p>
                                <div className="space-y-1 text-[11px]">
                                    <p className="text-emerald-400">✓ Tempo ativo contabilizado</p>
                                    <p className="text-red-400">✗ Pausas excluídas</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Acompanhe seu progresso por matéria</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all text-sm font-semibold shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]">
                    <Plus size={16} strokeWidth={2.5} />
                    Nova Matéria
                </button>
            </div>

            {/* Insight Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 p-5">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
                        <Lightbulb size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">💡 Insight da Semana</h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            Mantendo <span className="font-semibold text-emerald-700 dark:text-emerald-400">4h/dia</span>, você bate todas as metas em <span className="font-semibold text-emerald-700 dark:text-emerald-400">{daysToComplete} dias</span>. Continue assim!
                        </p>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div>
                <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-4 px-1">Resumo Geral</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className={`rounded-2xl border p-5 transition-all ${todayHours >= dailyGoal
                        ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-500/20'
                        : 'bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-500/20'
                        }`}>
                        <div className="flex items-center gap-2 mb-3">
                            {todayHours >= dailyGoal ? (
                                <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-500" />
                            ) : (
                                <AlertCircle size={16} className="text-orange-600 dark:text-orange-500" />
                            )}
                            <span className={`text-xs font-bold uppercase tracking-wider ${todayHours >= dailyGoal ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'
                                }`}>
                                Meta Hoje
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{todayHours}h</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5">de {dailyGoal}h meta</p>
                    </div>

                    <div className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 rounded-2xl border border-gray-100/80 dark:border-gray-700/50 p-5 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">
                            <Timer size={14} />
                            Total
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalHoursStudied}h</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">de {totalGoalHours}h</p>
                    </div>

                    <div className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 rounded-2xl border border-gray-100/80 dark:border-gray-700/50 p-5 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">
                            <Target size={14} />
                            Principal
                        </div>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{mostStudiedSubject.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">{mostStudiedSubject.hoursStudied}h</p>
                    </div>

                    <div className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 rounded-2xl border border-gray-100/80 dark:border-gray-700/50 p-5 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">
                            <TrendingUp size={14} />
                            Média
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{avgDailyHours}h</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">por dia</p>
                    </div>

                    <div className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 rounded-2xl border border-gray-100/80 dark:border-gray-700/50 p-5 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">
                            <CheckCircle size={14} />
                            Pomodoros
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalPomodoros}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">concluídos</p>
                    </div>
                </div>
            </div>

            {/* Heatmap */}
            <div>
                <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-4 px-1">Histórico de Atividade</h3>
                <div className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 rounded-2xl border border-gray-100/80 dark:border-gray-700/50 p-6">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Últimas 2 Semanas</h3>
                    <div className="flex gap-2">
                        {heatmap.map((day) => (
                            <div key={day.date} className="group relative flex-1">
                                <div className={`h-12 rounded-lg ${getHeatmapColor(day.hours)} transition-all hover:ring-2 hover:ring-emerald-400 cursor-pointer`} />
                                <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs p-3 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 whitespace-nowrap">
                                    <p className="font-semibold mb-1">{new Date(day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
                                    <p className="text-emerald-400 font-bold">{day.hours}h estudadas</p>
                                    {day.subjects.length > 0 && (
                                        <div className="mt-2 space-y-0.5 text-[11px] text-gray-300">
                                            {day.subjects.map((s, i) => (
                                                <p key={i}>• {s}</p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-gray-400 dark:text-gray-500">Menos</span>
                        <div className="flex gap-2 items-center text-[10px] text-gray-400 dark:text-gray-500">
                            <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700/50 rounded"></div>
                            <span>0h</span>
                            <div className="w-4 h-4 bg-emerald-200 dark:bg-emerald-900/40 rounded"></div>
                            <span>1-2h</span>
                            <div className="w-4 h-4 bg-emerald-400 dark:bg-emerald-600 rounded"></div>
                            <span>3-4h</span>
                            <div className="w-4 h-4 bg-emerald-600 dark:bg-emerald-500 rounded"></div>
                            <span>5h+</span>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500">Mais</span>
                    </div>
                </div>
            </div>

            {/* Matérias Table */}
            <div>
                <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-4 px-1">Matérias em Progresso</h3>
                <div className="grid grid-cols-[2fr_1fr_1fr_1.5fr_260px] gap-6 px-6 py-3 mb-2">
                    <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em]">Matéria</div>
                    <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] text-center">Estudadas</div>
                    <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] text-center">Meta</div>
                    <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] text-center">Progresso</div>
                    <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] text-center">Ações</div>
                </div>

                <div className="space-y-3">
                    {subjects.map((subject) => {
                        const progress = Math.round((subject.hoursStudied / subject.goalHours) * 100);
                        const hoursRemaining = subject.goalHours - subject.hoursStudied;
                        const isRunning = runningTimers[subject.id];
                        const currentSeconds = activeTimers[subject.id] || 0;
                        const isLongSession = currentSeconds > 7200;

                        return (
                            <div
                                key={subject.id}
                                className={`grid grid-cols-[2fr_1fr_1fr_1.5fr_260px] gap-6 px-6 py-5 rounded-2xl transition-all items-center ${isRunning
                                    ? `${subject.colorLight} dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm`
                                    : 'bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 border border-gray-100/80 dark:border-gray-700/50 hover:shadow-sm'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl ${subject.color} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                                        {subject.name.substring(0, 1)}
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-900 dark:text-white text-sm">{subject.name}</span>
                                        {isRunning && (
                                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 animate-pulse">⏱️ Estudando agora</p>
                                        )}
                                    </div>
                                </div>

                                <div className="text-center">
                                    <span className="text-xl font-bold text-gray-900 dark:text-white">{subject.hoursStudied}h</span>
                                </div>

                                <div className="text-center">
                                    {editingSubjectId === `goal-${subject.id}` ? (
                                        <div className="flex items-center gap-1 justify-center">
                                            <input
                                                type="number"
                                                autoFocus
                                                defaultValue={subject.goalHours}
                                                className="w-12 px-1 py-0.5 text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-emerald-300 dark:border-emerald-600 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                onKeyDown={async (e) => {
                                                    if (e.key === 'Enter') {
                                                        const newGoal = parseInt((e.target as HTMLInputElement).value);
                                                        if (newGoal > 0) {
                                                            await updateSubject(subject.id, subject.name, subject.colorHex, newGoal);
                                                            setEditingSubjectId(null);
                                                        }
                                                    } else if (e.key === 'Escape') {
                                                        setEditingSubjectId(null);
                                                    }
                                                }}
                                                onBlur={() => setEditingSubjectId(null)}
                                            />
                                            <span className="text-xs text-gray-500 dark:text-gray-400">h</span>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => setEditingSubjectId(`goal-${subject.id}`)}
                                            className="group cursor-pointer flex items-center justify-center gap-1 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg py-1 transition-colors"
                                            title="Clique para editar meta"
                                        >
                                            <span className="text-lg font-semibold text-gray-500 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                {subject.goalHours}h
                                            </span>
                                            <Edit3 size={12} className="text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2.5">
                                    <div className="flex items-baseline justify-between">
                                        <span className={`text-sm font-bold ${subject.textColor}`}>{progress}%</span>
                                        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">faltam {hoursRemaining}h</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${subject.color} transition-all duration-500 rounded-full`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 relative">
                                    <button
                                        onClick={() => setOpenPopover(openPopover === subject.id ? null : subject.id)}
                                        className={`relative flex items-center gap-2 font-mono text-sm font-semibold px-3 py-2 rounded-xl border transition-all ${isRunning
                                            ? isLongSession
                                                ? 'bg-orange-50 border-orange-200 text-orange-700 animate-pulse'
                                                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                            : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                                            }`}
                                        title={isLongSession ? "Sessão longa - considere uma pausa" : ""}
                                    >
                                        <Timer size={13} className={isRunning ? (isLongSession ? 'text-orange-500' : 'text-emerald-500') : 'text-gray-400'} />
                                        <span className="text-xs">{formatTime(currentSeconds)}</span>
                                    </button>

                                    {/* Reset Button (only shows when time > 0) */}
                                    {currentSeconds > 0 && (
                                        <button
                                            onClick={() => {
                                                setResetConfirm(subject.id);
                                                setOpenPopover(subject.id);
                                            }}
                                            className="p-2.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                                            title="Resetar tempo"
                                        >
                                            <RotateCcw size={18} />
                                        </button>
                                    )}

                                    {/* Save Button (only shows when time > 0) */}
                                    {currentSeconds > 0 && (
                                        <button
                                            onClick={() => saveSession(subject.id)}
                                            className="p-2.5 rounded-xl text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:scale-105 transition-all shadow-sm"
                                            title="Salvar sessão e finalizar"
                                        >
                                            <CheckCircle size={18} strokeWidth={2.5} />
                                        </button>
                                    )}

                                    {openPopover === subject.id && (
                                        <div ref={popoverRef} className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 p-2">
                                            {resetConfirm === subject.id ? (
                                                <div className="p-3">
                                                    <p className="text-sm text-gray-900 dark:text-gray-100 font-semibold mb-1">Descartar sessão?</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                                        {formatMinutes(currentSeconds)} serão perdidos
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setResetConfirm(null)}
                                                            className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-600"
                                                        >
                                                            Cancelar
                                                        </button>
                                                        <button
                                                            onClick={() => resetTimer(subject.id)}
                                                            className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600"
                                                        >
                                                            Confirmar
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => toggleTimer(subject.id)}
                                                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg text-sm text-gray-700 dark:text-gray-300 font-medium transition-colors"
                                                    >
                                                        {isRunning ? <Pause size={14} /> : <Play size={14} />}
                                                        {isRunning ? 'Pausar' : 'Iniciar'}
                                                    </button>
                                                    <button
                                                        onClick={() => setResetConfirm(subject.id)}
                                                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg text-sm text-gray-700 dark:text-gray-300 font-medium transition-colors"
                                                    >
                                                        <RotateCcw size={14} />
                                                        Resetar sessão
                                                    </button>
                                                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                                                        {editingSubjectId === subject.id ? (
                                                            <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg animate-in fade-in zoom-in-95 duration-200">
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Adicionar Tempo Manual</p>
                                                                <div className="flex gap-2 mb-2">
                                                                    <div className="flex-1">
                                                                        <input
                                                                            type="number"
                                                                            placeholder="H"
                                                                            value={manualHours}
                                                                            onChange={(e) => setManualHours(e.target.value)}
                                                                            className="w-full px-2 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none text-center bg-white dark:bg-gray-800 dark:border-gray-600"
                                                                        />
                                                                    </div>
                                                                    <span className="text-gray-400 self-center">:</span>
                                                                    <div className="flex-1">
                                                                        <input
                                                                            type="number"
                                                                            placeholder="M"
                                                                            value={manualMinutes}
                                                                            onChange={(e) => setManualMinutes(e.target.value)}
                                                                            className="w-full px-2 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none text-center bg-white dark:bg-gray-800 dark:border-gray-600"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => setEditingSubjectId(null)}
                                                                        className="flex-1 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
                                                                    >
                                                                        Cancelar
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleAddManualSession(subject.id)}
                                                                        className="flex-1 py-1.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-md"
                                                                    >
                                                                        Salvar
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => {
                                                                    setEditingSubjectId(subject.id);
                                                                    setManualHours("");
                                                                    setManualMinutes("");
                                                                }}
                                                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg text-sm text-gray-700 dark:text-gray-300 font-medium transition-colors"
                                                            >
                                                                <Edit3 size={14} />
                                                                Editar / Adicionar
                                                            </button>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => toggleTimer(subject.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-xs font-bold shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${isRunning
                                            ? 'bg-orange-500 text-white hover:bg-orange-600'
                                            : 'bg-emerald-600 text-white hover:bg-emerald-500'
                                            }`}
                                    >
                                        {isRunning ? (
                                            <>
                                                <Pause size={14} strokeWidth={2.5} />
                                                Pausar
                                            </>
                                        ) : (
                                            <>
                                                <Play size={14} strokeWidth={2.5} />
                                                Iniciar
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>


        </div>
    );
}
