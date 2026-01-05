'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, X, Check, Lock } from 'lucide-react'
import Link from 'next/link'

interface ProGateProps {
    isOpen: boolean;
    onClose: () => void;
    featureName?: string;
    benefits?: string[];
}

export default function ProGate({ isOpen, onClose, featureName = "esta ferramenta", benefits = [] }: ProGateProps) {
    const defaultBenefits = [
        "IA Avançada (Resumos e Questões)",
        "Interações ilimitadas no Feed",
        "Analytics de progresso detalhado",
        "Badges e conquistas exclusivas"
    ]

    const displayBenefits = benefits.length > 0 ? benefits : defaultBenefits

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-white dark:bg-[#1A1A1A] rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        {/* Content */}
                        <div className="p-8 sm:p-10">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-3xl bg-emerald-500 text-white flex items-center justify-center mb-6 shadow-xl shadow-emerald-200 dark:shadow-none animate-bounce-subtle">
                                    <Lock size={32} />
                                </div>

                                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                                    Desbloqueie o Pro
                                </h2>

                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed max-w-sm">
                                    Parece que você atingiu um limite. Assine o **Elphy Pro** para usar {featureName} e muito mais sem restrições.
                                </p>

                                <div className="w-full space-y-3 mb-10 text-left bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                                    {displayBenefits.map((benefit, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-0.5 rounded-full text-emerald-600">
                                                <Check size={12} className="stroke-[3]" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{benefit}</span>
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    href="/dashboard/pro"
                                    className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-200 dark:shadow-none transition-all flex items-center justify-center gap-2 group hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Zap size={18} fill="white" />
                                    Ver Planos Pro
                                </Link>

                                <button
                                    onClick={onClose}
                                    className="mt-4 text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                >
                                    Talvez mais tarde
                                </button>
                            </div>
                        </div>

                        {/* Bottom Footer Decor */}
                        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
