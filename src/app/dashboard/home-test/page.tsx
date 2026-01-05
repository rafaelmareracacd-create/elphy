'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { getGamificationStats } from '@/lib/actions/gamification'
import type { GamificationStats } from '@/lib/gamification/utils'

// Components
import { ThemeProvider } from '@/components/dashboard/home-test/ThemeContext'
import Header from '@/components/dashboard/home-test/Header'
import LeftSidebar from '@/components/dashboard/home-test/LeftSidebar'
import RightSidebar from '@/components/dashboard/home-test/RightSidebar'
import Drawer from '@/components/dashboard/home-test/shared/Drawer'
import MainFeed from '@/components/dashboard/home-test/MainFeed'

// Types
interface UserProfile {
    full_name: string;
    role: string;
    xp_points: number;
    level: number;
    is_premium: boolean;
    avatar_url?: string;
    id: string;
}

// Inner Component to use ThemeContext
function HomeTestContent() {
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [stats, setStats] = useState<GamificationStats | null>(null)
    const [activeTab, setActiveTab] = useState<'home' | 'foryou' | 'following'>('home')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        async function loadData() {
            try {
                // 1. User & Profile
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single()
                    setProfile(profileData)
                }
                // 2. Gamification Stats (Streak)
                const gamification = await getGamificationStats()
                setStats(gamification)
            } catch (error) {
                console.error("Failed to load dashboard data", error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    if (loading) {
        return <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#121212] flex items-center justify-center transition-colors">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
    }

    return (
        <div className="fixed inset-0 z-50 bg-[#F8FAFC] dark:bg-[#121212] overflow-hidden text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">

            {/* Header */}
            <Header
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onOpenMobileMenu={() => setMobileMenuOpen(true)}
                userProfile={profile}
            />

            {/* Mobile Drawer */}
            <Drawer isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} side="left" title="Menu">
                <LeftSidebar className="h-full" />
            </Drawer>

            {/* Main Grid Layout */}
            <main className="max-w-[1280px] mx-auto h-full pt-16 grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-6 lg:gap-8 overflow-hidden">

                {/* LEFT COLUMN (Desktop Sidebar) */}
                <div className="hidden lg:block lg:col-span-2 h-full sticky top-16 border-r border-gray-100 dark:border-gray-800">
                    <LeftSidebar />
                </div>

                {/* CENTER COLUMN (Feed) */}
                <div className="col-span-1 md:col-span-12 lg:col-span-7 h-full overflow-y-auto custom-scrollbar pt-4 pb-20 px-0 md:px-4">
                    {/* Temporary placeholder for MainFeed until Phase 2 */}
                    <div className="mb-6 px-4">
                        <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-500/20 flex items-start gap-4">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                            </div>
                            <div>
                                <h2 className="font-bold text-emerald-700 dark:text-emerald-400 mb-1 text-sm">Novo Modo Escuro!</h2>
                                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Experimente o novo tema clicando no ícone de lua no topo. Seus olhos agradecem durante os estudos noturnos. 🌙
                                </p>
                            </div>
                        </div>
                    </div>
                    <MainFeed userProfile={profile} />
                </div>

                {/* RIGHT COLUMN (Trends/Widgets) */}
                <div className="hidden lg:block lg:col-span-3 h-full sticky top-16 border-l border-gray-100 dark:border-gray-800">
                    <RightSidebar />
                </div>

            </main>
        </div>
    )
}

export default function DashboardPage() {
    return (
        <ThemeProvider>
            <HomeTestContent />
        </ThemeProvider>
    )
}
