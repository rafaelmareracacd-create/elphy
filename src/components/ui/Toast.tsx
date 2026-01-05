"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { useEffect } from "react";

interface ToastProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
    type?: 'success' | 'error';
}

export default function Toast({ message, isVisible, onClose, duration = 3000, type = 'success' }: ToastProps) {
    const isError = type === 'error';
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]"
                >
                    <div className={`
                        bg-white/80 backdrop-blur-xl border px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 min-w-[300px]
                        ${isError ? 'border-red-100/50 shadow-red-500/5' : 'border-emerald-100/50 shadow-emerald-500/5'}
                    `}>
                        <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center shrink-0
                            ${isError ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}
                        `}>
                            {isError ? <X size={18} /> : <CheckCircle2 size={18} />}
                        </div>
                        <span className="text-sm font-semibold text-gray-800 flex-1">{message}</span>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
