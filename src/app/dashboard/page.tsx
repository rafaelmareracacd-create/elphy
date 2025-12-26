'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import StatsCard from '@/components/dashboard/StatsCard'
import MemoryRetentionChart from '@/components/dashboard/MemoryRetentionChart'
import { BookOpen, Target, Clock, Zap } from 'lucide-react'

export default function DashboardPage() {
    const [totalQuestions, setTotalQuestions] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadStats()
    }, [])

    const loadStats = async () => {
        try {
            const { count, error } = await supabase
                .from('questions')
                .select('*', { count: 'exact', head: true })

            if (error) throw error
            setTotalQuestions(count || 0)
        } catch (error) {
            console.error('Error loading stats:', error)
        } finally {
            setLoading(false)
        }
    }

    // Get current hour for greeting
    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

    // Calculate mock accuracy (will be real when we have review sessions)
    const accuracy = totalQuestions > 0 ? 76 : 0

    return (
        <>
            {/* Premium Fonts */}
            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      `}</style>

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 p-8">
                {/* Welcome Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-['Inter'] font-bold text-gray-900 dark:text-white mb-2">
                                {greeting}, Rafael! 👋
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 font-['Inter']">
                                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Quick Stats - Small Cards */}
                    <StatsCard
                        title="Cartões para Hoje"
                        value={loading ? '...' : totalQuestions}
                        icon={BookOpen}
                        color="blue"
                        trend={{ value: '+8', isPositive: true }}
                    />

                    <StatsCard
                        title="Precisão de Acertos"
                        value={loading ? '...' : `${accuracy}%`}
                        icon={Target}
                        color="green"
                        trend={{ value: '+4%', isPositive: true }}
                    />

                    <StatsCard
                        title="Sequência de Estudos"
                        value="12 dias"
                        icon={Zap}
                        color="orange"
                        trend={{ value: '+2', isPositive: true }}
                    />

                    <StatsCard
                        title="Tempo Médio"
                        value="4.2s"
                        icon={Clock}
                        color="purple"
                        trend={{ value: '-0.8s', isPositive: true }}
                    />

                    {/* Memory Retention Chart - Large Card spanning 2 columns */}
                    <div className="md:col-span-2 lg:col-span-3">
                        <MemoryRetentionChart />
                    </div>

                    {/* Recently Studied Topics */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:row-span-2 group relative"
                    >
                        {/* Glow */}
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />

                        {/* Card */}
                        <div className="relative backdrop-blur-xl bg-white/80 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl p-6 shadow-lg dark:shadow-2xl h-full">
                            <h3 className="text-lg font-['Inter'] font-bold text-gray-900 dark:text-white mb-4">
                                Tópicos Recentes
                            </h3>

                            <div className="space-y-3">
                                {[
                                    { topic: 'História do Brasil', count: 15, color: 'bg-blue-500' },
                                    { topic: 'Política Internacional', count: 12, color: 'bg-purple-500' },
                                    { topic: 'Geografia', count: 8, color: 'bg-green-500' },
                                    { topic: 'Economia', count: 10, color: 'bg-orange-500' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${item.color}`} />
                                            <span className="text-sm font-['Inter'] font-medium text-gray-700 dark:text-gray-300">
                                                {item.topic}
                                            </span>
                                        </div>
                                        <span className="text-xs font-['Inter'] font-semibold text-gray-500 dark:text-gray-500">
                                            {item.count} questões
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="md:col-span-2 group relative"
                    >
                        {/* Glow */}
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />

                        {/* Card */}
                        <div className="relative backdrop-blur-xl bg-white/80 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl p-6 shadow-lg dark:shadow-2xl">
                            <h3 className="text-lg font-['Inter'] font-bold text-gray-900 dark:text-white mb-4">
                                Ações Rápidas
                            </h3>

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Iniciar Revisão', href: '/dashboard/anki', gradient: 'from-blue-500 to-cyan-500' },
                                    { label: 'Banco de Questões', href: '/dashboard/questions', gradient: 'from-purple-500 to-pink-500' },
                                    { label: 'Oracle IA', href: '/dashboard/oracle', gradient: 'from-green-500 to-emerald-500' },
                                    { label: 'Ingestão Manual', href: '/dashboard/ingestao', gradient: 'from-orange-500 to-amber-500' },
                                ].map((action, i) => (
                                    <a
                                        key={i}
                                        href={action.href}
                                        className={`group/btn relative p-4 rounded-2xl bg-gradient-to-br ${action.gradient} text-white font-['Inter'] font-semibold text-sm text-center hover:scale-105 transition-transform duration-300 shadow-lg`}
                                    >
                                        <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                        <span className="relative">{action.label}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    )
}
