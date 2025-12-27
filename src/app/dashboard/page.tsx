'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import { Clock, Plus, Flame, Target, BookOpen, TrendingUp, Search } from 'lucide-react'
import XPBar from '@/components/gamification/XPBar'
import StreakFlame from '@/components/gamification/StreakFlame'
import { getGamificationStats } from '@/lib/actions/gamification'
import type { GamificationStats } from '@/lib/gamification/utils'

// Mock data for review history
const reviewHistoryData = [
    { date: '01/12', reviews: 15 },
    { date: '03/12', reviews: 22 },
    { date: '05/12', reviews: 18 },
    { date: '07/12', reviews: 28 },
    { date: '09/12', reviews: 32 },
    { date: '11/12', reviews: 25 },
    { date: '13/12', reviews: 35 },
    { date: '15/12', reviews: 40 },
    { date: '17/12', reviews: 38 },
    { date: '19/12', reviews: 45 },
]

// Central Circular Progress Component for Daily Goal
function CircularProgress({ value, label }: { value: number; label: string }) {
    const circumference = 2 * Math.PI * 100
    const offset = circumference - (value / 100) * circumference

    return (
        <div className="relative w-72 h-72 flex items-center justify-center">
            {/* Subtle emerald glow */}
            <div className="absolute inset-0 rounded-full bg-emerald-100/50 blur-2xl" />

            {/* SVG Circle */}
            <svg className="w-full h-full transform -rotate-90 relative z-10">
                {/* Background circle */}
                <circle
                    cx="144"
                    cy="144"
                    r="100"
                    stroke="#E5E7EB"
                    strokeWidth="16"
                    fill="none"
                />
                {/* Progress circle with emerald gradient */}
                <defs>
                    <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                </defs>
                <motion.circle
                    cx="144"
                    cy="144"
                    r="100"
                    stroke="url(#emeraldGradient)"
                    strokeWidth="16"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    style={{
                        filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.3))'
                    }}
                />
            </svg>

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" as const }}
                    className="text-6xl font-bold text-gray-900"
                >
                    {value}%
                </motion.span>
                <span className="text-sm text-gray-500 mt-2">{label}</span>
            </div>
        </div>
    )
}

export default function Dashboard() {
    const [activeDecks, setActiveDecks] = useState<any[]>([])
    const [gamificationStats, setGamificationStats] = useState<GamificationStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch decks
                const { data: decksData, error: decksError } = await supabase
                    .from('decks')
                    .select('id, name, cards_due, cards_total, last_reviewed')
                    .eq('is_active', true)
                    .limit(5)

                if (decksError) throw decksError
                if (decksData) {
                    setActiveDecks(decksData)
                }

                // Fetch gamification stats
                const stats = await getGamificationStats()
                if (stats) {
                    setGamificationStats(stats)
                }
            } catch (error) {
                console.error('Error loading dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring' as const, stiffness: 300, damping: 24 }
        }
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] p-8 pt-24">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-[1600px] mx-auto space-y-6"
            >
                {/* Search Bar - Prominent at top */}
                <motion.div
                    variants={itemVariants}
                    className="w-full max-w-2xl"
                >
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar decks..."
                            className="w-full pl-14 pr-6 py-4 bg-white border-2 border-gray-200 rounded-2xl text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all shadow-sm"
                        />
                    </div>
                </motion.div>

                {/* Gamification Row - XP Bar and Streak */}
                {gamificationStats && (
                    <div className="grid grid-cols-12 gap-6">
                        {/* XP Bar */}
                        <motion.div
                            variants={itemVariants}
                            className="col-span-12 lg:col-span-8"
                        >
                            <XPBar
                                currentXP={gamificationStats.totalXP}
                                level={gamificationStats.currentLevel}
                                xpToNext={gamificationStats.xpToNextLevel}
                                showAnimation={false}
                                variant="full"
                            />
                        </motion.div>

                        {/* Streak Flame */}
                        <motion.div
                            variants={itemVariants}
                            className="col-span-12 lg:col-span-4"
                        >
                            <StreakFlame
                                days={gamificationStats.dailyStreak}
                                isActive={gamificationStats.dailyStreak > 0}
                                isFrozen={false}
                                variant="full"
                            />
                        </motion.div>
                    </div>
                )}

                {/* Row 1: Hero Section */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Welcome Card */}
                    <motion.div
                        variants={itemVariants}
                        className="col-span-12 lg:col-span-4 bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                    >
                        <p className="text-sm text-gray-500 mb-1">{greeting}, Rafael! 👋</p>
                        <h1 className="text-2xl font-bold text-gray-900 mb-3">
                            Continue estudando
                        </h1>
                        <p className="text-sm text-gray-600 mb-4">
                            Você tem <span className="font-semibold text-emerald-600">12 reviews</span> pendentes
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl font-semibold text-white text-sm shadow-md hover:shadow-lg transition-all"
                        >
                            <BookOpen className="w-4 h-4" />
                            Iniciar Revisão
                        </motion.button>
                    </motion.div>

                    {/* Central Circular Progress */}
                    <motion.div
                        variants={itemVariants}
                        className="col-span-12 lg:col-span-4 bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex items-center justify-center"
                    >
                        <CircularProgress value={72} label="Meta diária" />
                    </motion.div>

                    {/* Quick Stats Summary */}
                    <motion.div
                        variants={itemVariants}
                        className="col-span-12 lg:col-span-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200 p-6"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                            <h3 className="font-semibold text-gray-900">Progresso</h3>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">Esta semana</p>
                                <p className="text-3xl font-bold text-emerald-600">124</p>
                                <p className="text-xs text-gray-500">cards revisados</p>
                            </div>
                            <div className="pt-3 border-t border-emerald-200">
                                <p className="text-sm text-gray-600">Taxa de acerto</p>
                                <p className="text-2xl font-bold text-gray-900">87%</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Row 2: Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Reviews a vencer', value: '12', icon: Clock, color: 'emerald', bgColor: 'emerald-50', textColor: 'emerald-600' },
                        { label: 'Novos cards', value: '8', icon: Plus, color: 'blue', bgColor: 'blue-50', textColor: 'blue-600' },
                        { label: 'Streak diário', value: '15 dias', icon: Flame, color: 'orange', bgColor: 'orange-50', textColor: 'orange-600' },
                        { label: 'Taxa de acerto', value: '87%', icon: Target, color: 'purple', bgColor: 'purple-50', textColor: 'purple-600' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            whileHover={{ y: -4, scale: 1.02 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 cursor-pointer transition-all"
                        >
                            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-${stat.bgColor} mb-3`}>
                                <stat.icon className={`w-5 h-5 text-${stat.textColor}`} />
                            </div>
                            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Row 3: Charts & Decks */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Review History Line Chart */}
                    <motion.div
                        variants={itemVariants}
                        className="col-span-12 lg:col-span-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                    >
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                            Histórico de Revisões
                        </h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={reviewHistoryData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#9CA3AF"
                                    style={{ fontSize: '12px' }}
                                    tickLine={false}
                                />
                                <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} tickLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#FFFFFF',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    }}
                                    labelStyle={{ color: '#111827', fontWeight: 600 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="reviews"
                                    stroke="#10B981"
                                    strokeWidth={3}
                                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, fill: '#059669' }}
                                    animationDuration={2000}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Active Decks */}
                    <motion.div
                        variants={itemVariants}
                        className="col-span-12 lg:col-span-4 bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                    >
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Decks Ativos</h3>
                        <div className="space-y-5">
                            {[
                                { name: 'História do Brasil', progress: 85, cards: 120, mastery: 85 },
                                { name: 'Política Internacional', progress: 72, cards: 95, mastery: 72 },
                                { name: 'Geografia', progress: 68, cards: 80, mastery: 68 },
                                { name: 'Direito', progress: 90, cards: 150, mastery: 90 },
                            ].map((deck, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + i * 0.1 }}
                                    whileHover={{ x: 4 }}
                                    className="space-y-2 cursor-pointer"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-gray-900">{deck.name}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-400">{deck.cards} cards</span>
                                            <span className="text-xs font-bold text-emerald-600">{deck.mastery}%</span>
                                        </div>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${deck.progress}%` }}
                                            transition={{ duration: 1.5, delay: 0.6 + i * 0.1, ease: 'easeOut' }}
                                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}
