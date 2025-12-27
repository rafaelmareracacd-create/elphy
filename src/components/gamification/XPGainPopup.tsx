// XP Gain Popup Component with FIRE theme 🔥
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Flame, Zap } from "lucide-react";

interface XPGainPopupProps {
    amount: number;
    x?: number;
    y?: number;
    reason?: string;
    onComplete?: () => void;
}

export default function XPGainPopup({
    amount,
    x = 50,
    y = 50,
    reason,
    onComplete
}: XPGainPopupProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            onComplete?.();
        }, 2000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 0, scale: 0.5 }}
                    animate={{ opacity: 1, y: -80, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.3 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="fixed pointer-events-none z-50"
                    style={{ left: `${x}%`, top: `${y}%` }}
                >
                    {/* Outer glow - pulsing fire effect */}
                    <motion.div
                        animate={{
                            scale: [1, 1.4, 1],
                            opacity: [0.7, 0.3, 0.7],
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute -inset-4 bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 blur-2xl rounded-full"
                    />

                    {/* Main bubble with fire gradient */}
                    <div className="relative px-5 py-3 bg-gradient-to-br from-orange-500 via-red-600 to-yellow-500 rounded-full shadow-2xl border-2 border-yellow-300">
                        {/* Inner shimmer */}
                        <motion.div
                            animate={{
                                opacity: [0.3, 0.7, 0.3],
                            }}
                            transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute inset-0 bg-gradient-to-t from-transparent via-yellow-300/40 to-transparent rounded-full"
                        />

                        <div className="relative flex items-center gap-2">
                            {/* Flame icon with bounce */}
                            <motion.div
                                animate={{
                                    y: [-2, 2, -2],
                                    rotate: [-5, 5, -5],
                                }}
                                transition={{
                                    duration: 0.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <Flame className="w-6 h-6 text-yellow-100 fill-yellow-100" />
                            </motion.div>

                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-white drop-shadow-lg">
                                    +{amount} XP
                                </span>
                                {reason && (
                                    <span className="text-xs text-yellow-100 font-semibold">
                                        {reason}
                                    </span>
                                )}
                            </div>

                            {/* Zap icon with pulse */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.3, 1],
                                    rotate: [0, 15, 0],
                                }}
                                transition={{
                                    duration: 0.4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <Zap className="w-5 h-5 text-yellow-200 fill-yellow-200" />
                            </motion.div>
                        </div>
                    </div>

                    {/* Fire particles */}
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 1, scale: 0 }}
                            animate={{
                                opacity: [1, 0],
                                scale: [0, 1.5],
                                x: [0, (i % 2 === 0 ? 1 : -1) * (15 + i * 8)],
                                y: [0, -25 - i * 4],
                            }}
                            transition={{
                                duration: 0.8 + i * 0.1,
                                ease: "easeOut",
                                delay: i * 0.08
                            }}
                            className="absolute top-1/2 left-1/2 w-2 h-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full"
                            style={{
                                boxShadow: '0 0 8px rgba(251, 191, 36, 0.8)'
                            }}
                        />
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Hook to trigger XP gain animations
export function useXPGainAnimation() {
    const [gains, setGains] = useState<Array<{ id: string } & XPGainPopupProps>>([]);

    const triggerXPGain = (props: Omit<XPGainPopupProps, 'onComplete'>) => {
        const id = Math.random().toString(36);
        setGains(prev => [...prev, { ...props, id }]);
    };

    const handleComplete = (id: string) => {
        setGains(prev => prev.filter(g => g.id !== id));
    };

    const XPGainAnimations = () => (
        <>
            {gains.map(({ id, ...props }) => (
                <XPGainPopup
                    key={id}
                    {...props}
                    onComplete={() => handleComplete(id)}
                />
            ))}
        </>
    );

    return { triggerXPGain, XPGainAnimations };
}
