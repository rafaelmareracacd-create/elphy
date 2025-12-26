'use client'

import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'

// Mock data for 7-day retention
const data = [
    { day: 'Dom', retention: 65 },
    { day: 'Seg', retention: 72 },
    { day: 'Ter', retention: 68 },
    { day: 'Qua', retention: 78 },
    { day: 'Qui', retention: 85 },
    { day: 'Sex', retention: 82 },
    { day: 'Sáb', retention: 88 },
]

export default function MemoryRetentionChart() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group relative"
        >
            {/* Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />

            {/* Card */}
            <div className="relative backdrop-blur-xl bg-white/80 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl p-6 shadow-lg dark:shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-['Inter'] font-bold text-gray-900 dark:text-white mb-1">
                            Retenção de Memória
                        </h3>
                        <p className="text-sm font-['Inter'] text-gray-600 dark:text-gray-400">
                            Últimos 7 dias
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-['Inter'] font-semibold text-green-500">
                            +12%
                        </span>
                    </div>
                </div>

                {/* Chart */}
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.1)" />
                        <XAxis
                            dataKey="day"
                            stroke="#9CA3AF"
                            style={{ fontSize: '12px', fontFamily: 'Inter' }}
                        />
                        <YAxis
                            stroke="#9CA3AF"
                            style={{ fontSize: '12px', fontFamily: 'Inter' }}
                            tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                backdropFilter: 'blur(12px)',
                                fontFamily: 'Inter',
                            }}
                            labelStyle={{ color: '#F3F4F6', fontWeight: 'bold' }}
                            itemStyle={{ color: '#3B82F6' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="retention"
                            stroke="#3B82F6"
                            strokeWidth={3}
                            fill="url(#colorRetention)"
                        />
                    </AreaChart>
                </ResponsiveContainer>

                {/* Footer note */}
                <p className="text-xs font-['Inter'] text-gray-500 dark:text-gray-500 mt-4 text-center">
                    Baseado no algoritmo de repetição espaçada adaptativo
                </p>
            </div>
        </motion.div>
    )
}
