"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, BookOpen, FileText } from "lucide-react";

interface ManualEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        date: string;
        startTime: string;
        endTime: string;
        subjectId: string;
        notes?: string;
    }) => void;
    subjects: Array<{ id: string; title: string; color: string }>;
}

export default function ManualEntryModal({ isOpen, onClose, onSubmit, subjects }: ManualEntryModalProps) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [subjectId, setSubjectId] = useState('');
    const [notes, setNotes] = useState('');

    const calculateDuration = () => {
        const [sh, sm] = startTime.split(':').map(Number);
        const [eh, em] = endTime.split(':').map(Number);
        const start = sh * 60 + sm;
        const end = eh * 60 + em;
        const diff = end - start;

        if (diff <= 0) return 'Horário inválido';

        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;

        if (hours === 0) return `${minutes}min`;
        return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
    };

    const handleSubmit = () => {
        if (!subjectId || !date || !startTime || !endTime) return;

        onSubmit({
            date,
            startTime,
            endTime,
            subjectId,
            notes: notes || undefined
        });

        // Reset form
        setDate(new Date().toISOString().split('T')[0]);
        setStartTime('09:00');
        setEndTime('10:00');
        setSubjectId('');
        setNotes('');
    };

    const isValid = subjectId && date && startTime && endTime && calculateDuration() !== 'Horário inválido';

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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', bounce: 0.3 }}
                            className="bg-white/95 dark:bg-[#121212]/95 backdrop-blur-2xl rounded-[32px] p-8 max-w-lg w-full pointer-events-auto border border-gray-200/50 dark:border-white/5 relative overflow-hidden"
                            style={{
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            {/* Gradient decoration */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500" />

                            {/* Close button */}
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
                            >
                                <X size={20} className="text-gray-600 dark:text-gray-400" />
                            </motion.button>

                            {/* Header */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                                    Adicionar Sessão Manual
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Registre estudos feitos fora do app
                                </p>
                            </div>

                            {/* Form */}
                            <div className="space-y-5">
                                {/* Date */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        <Calendar className="inline mr-2" size={16} />
                                        Data
                                    </label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        max={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white dark:bg-white/5 backdrop-blur-sm text-sm font-semibold text-gray-900 dark:text-white transition-all"
                                    />
                                </div>

                                {/* Time Range */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            <Clock className="inline mr-2" size={16} />
                                            Início
                                        </label>
                                        <input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white dark:bg-white/5 backdrop-blur-sm text-sm font-semibold text-gray-900 dark:text-white transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            Fim
                                        </label>
                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white dark:bg-white/5 backdrop-blur-sm text-sm font-semibold text-gray-900 dark:text-white transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Duration display */}
                                <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 border border-emerald-100 dark:border-emerald-500/20">
                                    <p className="text-xs font-bold text-gray-600 dark:text-emerald-400/60">Duração</p>
                                    <p className="text-lg font-black text-emerald-700 dark:text-emerald-400">{calculateDuration()}</p>
                                </div>

                                {/* Subject */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        <BookOpen className="inline mr-2" size={16} />
                                        Matéria
                                    </label>
                                    <select
                                        value={subjectId}
                                        onChange={(e) => setSubjectId(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white dark:bg-[#1A1A1A] text-sm font-semibold text-gray-900 dark:text-white transition-all appearance-none"
                                    >
                                        <option value="" className="dark:bg-[#1A1A1A]">Selecione uma matéria</option>
                                        {subjects.map(subject => (
                                            <option key={subject.id} value={subject.id} className="dark:bg-[#1A1A1A]">
                                                {subject.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        <FileText className="inline mr-2" size={16} />
                                        Observações (opcional)
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Ex: Estudei no cursinho presencial..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white dark:bg-white/5 backdrop-blur-sm text-sm text-gray-900 dark:text-white transition-all resize-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 mt-8">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-400 font-bold text-sm transition-colors"
                                >
                                    Cancelar
                                </motion.button>
                                <motion.button
                                    whileHover={isValid ? { scale: 1.02 } : {}}
                                    whileTap={isValid ? { scale: 0.98 } : {}}
                                    onClick={handleSubmit}
                                    disabled={!isValid}
                                    className={`flex-1 px-4 py-3 rounded-xl text-white font-bold text-sm transition-all shadow-lg ${isValid
                                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/20'
                                        : 'bg-gray-300 dark:bg-white/5 text-gray-500 dark:text-gray-600 cursor-not-allowed shadow-none'
                                        }`}
                                >
                                    Adicionar Sessão
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
