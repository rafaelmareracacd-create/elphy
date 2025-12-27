// Coin Display Component - Shows Elphy Coins
"use client";

import { motion } from "framer-motion";
import { Coins } from "lucide-react";

interface CoinDisplayProps {
    coins: number;
    variant?: 'compact' | 'full';
    showAnimation?: boolean;
}

export default function CoinDisplay({
    coins,
    variant = 'compact',
    showAnimation = false
}: CoinDisplayProps) {
    if (variant === 'compact') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-xl shadow-md"
            >
                <Coins className="w-5 h-5 text-white" />
                <span className="text-white font-bold text-lg">
                    {coins.toLocaleString()}
                </span>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
        >
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
                    <Coins className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Elphy Coins</p>
                    <motion.p
                        key={coins}
                        initial={showAnimation ? { scale: 1.2, color: '#F59E0B' } : {}}
                        animate={{ scale: 1, color: '#111827' }}
                        transition={{ duration: 0.3 }}
                        className="text-2xl font-bold text-gray-900"
                    >
                        {coins.toLocaleString()}
                    </motion.p>
                </div>
            </div>
        </motion.div>
    );
}

// Floating coin animation quando ganha moedas
export function CoinGainAnimation({
    amount,
    onComplete
}: {
    amount: number;
    onComplete?: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -60, scale: 1.2 }}
            transition={{ duration: 1.5 }}
            onAnimationComplete={onComplete}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
        >
            <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-xl shadow-2xl">
                <Coins className="w-6 h-6 text-white" />
                <span className="text-white font-bold text-xl">
                    +{amount} EC
                </span>
            </div>
        </motion.div>
    );
}
