'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    trend?: {
        value: string
        isPositive: boolean
    }
    color?: string
}

export default function StatsCard({ title, value, icon: Icon, trend, color = 'blue' }: StatsCardProps) {
    const colorClasses = {
        blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/20',
        green: 'from-green-500/20 to-emerald-500/20 border-green-500/20',
        purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/20',
        orange: 'from-orange-500/20 to-amber-500/20 border-orange-500/20',
    }

    const iconColorClasses = {
        blue: 'text-blue-400',
        green: 'text-green-400',
        purple: 'text-purple-400',
        orange: 'text-orange-400',
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`relative group cursor-pointer`}
        >
            {/* Glow effect */}
            <div className={`absolute -inset-0.5 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300`} />

            {/* Card */}
            <div className={`relative backdrop-blur-xl bg-white/80 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl p-6 shadow-lg dark:shadow-2xl`}>
                {/* Icon */}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${iconColorClasses[color as keyof typeof iconColorClasses]}`} />
                </div>

                {/* Title */}
                <p className="text-sm font-['Inter'] font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {title}
                </p>

                {/* Value */}
                <div className="flex items-end justify-between">
                    <h3 className="text-3xl font-['Inter'] font-bold text-gray-900 dark:text-white">
                        {value}
                    </h3>

                    {/* Trend */}
                    {trend && (
                        <span className={`text-xs font-['Inter'] font-semibold ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {trend.isPositive ? '↑' : '↓'} {trend.value}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
