"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MessageSquare, Lightbulb, Brain, X, Send, Bot, ChevronRight, BookOpen, ArrowRight, Timer, Flame } from "lucide-react";
import { useState } from "react";
import { useStudyData } from "@/hooks/useStudyData";

interface PlannerAIProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PlannerAI({ isOpen, onClose }: PlannerAIProps) {
    const [message, setMessage] = useState("");
    const [optimizationSuggestion, setOptimizationSuggestion] = useState<string | null>(null);
    const [studyTechnique, setStudyTechnique] = useState<string | null>(null);
    const { totalPomodoros } = useStudyData();

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.aside
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 340, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="bg-gradient-to-b from-gray-50/80 to-white/50 backdrop-blur-xl border-l border-gray-100/50 h-full flex flex-col shrink-0 z-20 overflow-hidden"
                >
                    <div className="p-6 pb-2 pt-6 flex-1 flex flex-col overflow-hidden">
                        {/* Tutor Header - Exact Anki Style */}
                        <div className="flex items-center gap-4 mb-6 p-4 bg-white/70 rounded-2xl border border-gray-100/50 shadow-lg shadow-gray-100/50 shrink-0 relative group">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-200/50 flex items-center justify-center text-white shrink-0">
                                <Brain size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                                    Tutor IA
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                </h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Assistente Inteligente</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="absolute -top-2 -right-2 p-1.5 bg-white border border-gray-100 rounded-full text-gray-400 hover:text-gray-900 shadow-sm opacity-0 group-hover:opacity-100 transition-all active:scale-95"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">

                            {/* Optimization Section */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Lightbulb size={12} className="text-yellow-500" /> Sugestão de Otimização
                                </h4>

                                {optimizationSuggestion ? (
                                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-sm text-gray-600 leading-relaxed relative overflow-hidden group">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400 rounded-l-full" />
                                        <p>"{optimizationSuggestion}"</p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setOptimizationSuggestion("Percebi que você tem muitas tarefas pesadas na segunda. Que tal mover 'Odontologia' para quarta para equilibrar sua semana?")}
                                        className="w-full bg-white hover:bg-emerald-50/50 p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all duration-300 group text-left flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-emerald-100 text-gray-400 group-hover:text-emerald-600 flex items-center justify-center transition-colors">
                                                <Sparkles size={14} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-600 group-hover:text-emerald-800 transition-colors">Pedir uma dica</span>
                                        </div>
                                        <div className="w-6 h-6 rounded-full bg-gray-50 group-hover:bg-white flex items-center justify-center">
                                            <ChevronRight size={14} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
                                        </div>
                                    </button>
                                )}
                            </div>

                            {/* Strategy Section */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Brain size={12} className="text-purple-500" /> Técnica de Estudo
                                </h4>

                                {studyTechnique ? (
                                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-sm text-gray-600 leading-relaxed relative overflow-hidden group">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-400 rounded-l-full" />
                                        <p>{studyTechnique}</p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setStudyTechnique("Para a matéria de hoje, recomendo a técnica de 'Auto-explicação'. Tente explicar o conceito em voz alta após 25 minutos de estudo.")}
                                        className="w-full bg-white hover:bg-purple-50/50 p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-100 transition-all duration-300 group text-left flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-purple-100 text-gray-400 group-hover:text-purple-600 flex items-center justify-center transition-colors">
                                                <Sparkles size={14} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-600 group-hover:text-purple-800 transition-colors">Gerar Estratégia</span>
                                        </div>
                                        <div className="w-6 h-6 rounded-full bg-gray-50 group-hover:bg-white flex items-center justify-center">
                                            <ChevronRight size={14} className="text-gray-300 group-hover:text-purple-500 transition-colors" />
                                        </div>
                                    </button>
                                )}
                            </div>

                            {/* Resource Card */}
                            <div className="pt-2">
                                <div className="bg-white rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 border border-gray-100 transition-all duration-300 group">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <BookOpen size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Material de Apoio</div>
                                        <div className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">Planejamento 2024</div>
                                    </div>
                                    <ArrowRight size={16} className="text-gray-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>

                            {/* Planning Stats - Exact Anki Style */}
                            <div className="p-5 bg-gradient-to-br from-white via-white to-emerald-50/30 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/30 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Meta Semanal</span>
                                    <span className="text-sm font-bold text-gray-900 tabular-nums">3 de 10</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "30%" }}
                                            transition={{ duration: 0.5, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Timer size={14} />
                                        <span className="text-xs font-semibold tabular-nums">08:45</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                                        <Timer size={14} className="text-orange-500" />
                                        <span className="text-sm font-bold text-orange-600">{totalPomodoros}</span>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Chat Input - Refined Area */}
                        <div className="mt-4 pt-4 border-t border-gray-100/50">
                            <div className="relative group">
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Pergunte ao Tutor..."
                                    className="w-full bg-white/50 border border-gray-100 rounded-2xl py-3 px-4 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none shadow-sm"
                                    rows={2}
                                />
                                <button
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-md shadow-emerald-200 active:scale-90"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.aside>
            )}
        </AnimatePresence>
    );
}
