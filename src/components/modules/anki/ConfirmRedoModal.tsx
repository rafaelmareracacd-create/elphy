"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmRedoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function ConfirmRedoModal({ isOpen, onClose, onConfirm }: ConfirmRedoModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-[#1e1e1e] backdrop-blur-xl shadow-2xl w-full max-w-md rounded-3xl overflow-hidden border border-gray-100 dark:border-white/5"
                        >
                            {/* Header */}
                            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                        <RefreshCw size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-white tracking-tight">
                                        Refazer Revisões
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                <div className="flex items-start gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                                    <AlertTriangle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                    <p className="text-sm text-slate-300 leading-relaxed">
                                        Tem certeza que deseja <span className="font-bold text-emerald-400">refazer todas as revisões de hoje</span>?
                                        Isso permitirá revisar todos os cards novamente desde o início.
                                    </p>
                                </div>

                                <div className="space-y-2 text-sm text-slate-400 bg-white/5 p-4 rounded-xl border border-white/5">
                                    <p className="font-semibold text-white flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        O que acontecerá:
                                    </p>
                                    <ul className="space-y-1.5 ml-4 text-xs">
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-500 mt-0.5">✓</span>
                                            <span>Todos os cards estudados hoje voltarão para revisão</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-500 mt-0.5">✓</span>
                                            <span>Você poderá praticar quantas vezes quiser</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-500 mt-0.5">✓</span>
                                            <span>Seu progresso original será mantido</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex items-center gap-3">
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    className="flex-1 h-11 rounded-xl border-white/10 bg-transparent text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className="flex-1 h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Confirmar
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
