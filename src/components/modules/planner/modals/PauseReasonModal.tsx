"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Coffee, Phone, Utensils, AlertCircle, Clock } from "lucide-react";

interface PauseReasonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (type: 'planned' | 'distraction', notes?: string) => void;
}

const QUICK_REASONS = {
    planned: [
        { icon: Coffee, label: "Café/Água", color: "from-amber-500 to-orange-500" },
        { icon: Utensils, label: "Lanche", color: "from-emerald-500 to-teal-500" },
        { icon: Clock, label: "Pausa Programada", color: "from-blue-500 to-indigo-500" },
    ],
    distraction: [
        { icon: Phone, label: "Celular", color: "from-red-500 to-rose-500" },
        { icon: AlertCircle, label: "Rede Social", color: "from-purple-500 to-pink-500" },
        { icon: AlertCircle, label: "Outro", color: "from-gray-500 to-gray-600" },
    ]
};

export default function PauseReasonModal({ isOpen, onClose, onSubmit }: PauseReasonModalProps) {
    const [selectedType, setSelectedType] = useState<'planned' | 'distraction' | null>(null);
    const [notes, setNotes] = useState("");
    const [selectedQuickReason, setSelectedQuickReason] = useState<string>("");

    const handleSubmit = () => {
        if (!selectedType) return;
        const finalNotes = selectedQuickReason || notes;
        onSubmit(selectedType, finalNotes || undefined);
        // Reset state
        setSelectedType(null);
        setNotes("");
        setSelectedQuickReason("");
    };

    const handleQuickReasonClick = (reason: string) => {
        setSelectedQuickReason(reason);
        setNotes(reason);
    };

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
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', bounce: 0.3 }}
                            className="bg-white/95 backdrop-blur-2xl rounded-[32px] p-8 max-w-md w-full pointer-events-auto border border-gray-200/50 relative overflow-hidden"
                            style={{
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 0 rgba(255, 255, 255, 0.8)'
                            }}
                        >
                            {/* Gradient decoration */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500" />

                            {/* Close button */}
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            >
                                <X size={20} className="text-gray-600" />
                            </motion.button>

                            {/* Header */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-black text-gray-900 mb-2">
                                    Por que pausou?
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Isso nos ajuda a identificar ladrões de tempo
                                </p>
                            </div>

                            {/* Type Selection */}
                            {!selectedType ? (
                                <div className="space-y-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02, x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedType('planned')}
                                        className="w-full p-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-left relative overflow-hidden group"
                                        style={{
                                            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                                <Coffee size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-lg">Pausa Planejada</h3>
                                                <p className="text-sm text-white/80">Descanso necessário</p>
                                            </div>
                                        </div>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.02, x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedType('distraction')}
                                        className="w-full p-6 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white text-left relative overflow-hidden group"
                                        style={{
                                            boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)'
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                                <AlertCircle size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-lg">Distração</h3>
                                                <p className="text-sm text-white/80">Algo me desviou</p>
                                            </div>
                                        </div>
                                    </motion.button>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    {/* Quick reasons */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-3">
                                            Motivo rápido:
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {QUICK_REASONS[selectedType].map((reason, idx) => {
                                                const Icon = reason.icon;
                                                const isSelected = selectedQuickReason === reason.label;
                                                return (
                                                    <motion.button
                                                        key={idx}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleQuickReasonClick(reason.label)}
                                                        className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${isSelected
                                                                ? `bg-gradient-to-br ${reason.color} text-white shadow-lg`
                                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                                            }`}
                                                    >
                                                        <Icon size={20} strokeWidth={2.5} />
                                                        <span className="text-[10px] font-bold text-center leading-tight">
                                                            {reason.label}
                                                        </span>
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Notes textarea */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Observações (opcional):
                                        </label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Adicione detalhes se quiser..."
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white/60 backdrop-blur-sm text-sm resize-none"
                                            rows={3}
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelectedType(null)}
                                            className="flex-1 px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition-colors"
                                        >
                                            Voltar
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleSubmit}
                                            className={`flex-1 px-4 py-3 rounded-xl text-white font-bold text-sm bg-gradient-to-r ${selectedType === 'planned'
                                                    ? 'from-emerald-500 to-teal-600'
                                                    : 'from-red-500 to-rose-600'
                                                }`}
                                            style={{
                                                boxShadow: selectedType === 'planned'
                                                    ? '0 10px 25px rgba(16, 185, 129, 0.3)'
                                                    : '0 10px 25px rgba(239, 68, 68, 0.3)'
                                            }}
                                        >
                                            Confirmar
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
