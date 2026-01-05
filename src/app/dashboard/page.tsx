'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { getGamificationStats } from '@/lib/actions/gamification'
import type { GamificationStats } from '@/lib/gamification/utils'
import { Search, Bell, Moon, Sun } from 'lucide-react'

// Components - New Design Integration
import MainFeed from '@/components/dashboard/home-test/MainFeed'
import RightSidebar from '@/components/dashboard/home-test/RightSidebar'
import { ThemeProvider, useTheme } from '@/components/dashboard/home-test/ThemeContext'

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

// Internal Header Component for Content Area
function ContentHeader({ activeTab, onTabChange, profile }: {
    activeTab: string,
    onTabChange: (tab: 'home' | 'foryou' | 'following') => void,
    profile: UserProfile | null
}) {
    const { theme, toggleTheme } = useTheme()

    return (
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-[#121212]/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 transition-colors duration-300">
            <div className="max-w-[1280px] mx-auto h-16 flex items-center justify-between lg:grid lg:grid-cols-12 lg:gap-8">

                {/* TABS */}
                {/* Aligned with the 8-column Main Feed */}
                <nav className="flex items-center h-full gap-6 lg:col-span-8 lg:justify-self-center">
                    {['home', 'foryou', 'following'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => onTabChange(tab as any)}
                            className="relative h-full px-2 flex items-center justify-center font-medium text-sm transition-colors"
                        >
                            <span className={`${activeTab === tab
                                ? 'text-gray-900 dark:text-white font-bold'
                                : 'text-gray-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400'
                                }`}>
                                {tab === 'home' ? 'Início' : tab === 'foryou' ? 'Para você' : 'Seguindo'}
                            </span>
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="activeTabIndicator"
                                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-emerald-500 rounded-t-full"
                                />
                            )}
                        </button>
                    ))}
                </nav>

                {/* VISUAL ACTIONS */}
                {/* Aligned with the 4-column Right Sidebar */}
                <div className="flex items-center gap-3 lg:col-span-4 lg:justify-self-end">
                    {/* Search Bar (Desktop) */}
                    <div className="hidden lg:flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 w-64 focus-within:ring-2 focus-within:ring-emerald-500/50 transition-all">
                        <Search size={16} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar no Elphy..."
                            className="bg-transparent border-none outline-none text-sm ml-2 w-full text-gray-700 dark:text-gray-200 placeholder-gray-400"
                        />
                    </div>

                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block" />

                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    <button className="relative p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <Bell size={20} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#121212]" />
                    </button>

                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block" />

                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-emerald-200 dark:shadow-none cursor-pointer hover:scale-105 transition-transform">
                        <span className="font-bold text-xs">
                            {profile?.full_name
                                ? profile.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
                                : 'U'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

function DashboardContent() {
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [stats, setStats] = useState<GamificationStats | null>(null)
    const [activeTab, setActiveTab] = useState<'home' | 'foryou' | 'following'>('home')

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
        return (
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#121212] flex items-center justify-center transition-colors">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="h-full bg-[#F8FAFC] dark:bg-[#121212] text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans flex flex-col overflow-hidden">

            {/* Local Sticky Header */}
            <ContentHeader activeTab={activeTab} onTabChange={setActiveTab} profile={profile} />

            <main className="flex-1 max-w-[1280px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-0 md:gap-6 lg:gap-8 overflow-hidden pt-6 px-0 md:px-4">
                {/* Center Feed */}
                <div className="col-span-1 lg:col-span-8 h-full overflow-y-auto custom-scrollbar pb-20">
                    <MainFeed userProfile={profile} />
                </div>

                {/* Right Widgets */}
                <div className="hidden lg:block lg:col-span-4 h-full overflow-hidden border-l border-gray-100 dark:border-gray-800 pl-6">
                    <RightSidebar className="pr-2" />
                </div>
            </main>
        </div>
    )
}

export default function DashboardPage() {
    return (
        <DashboardContent />
    )
}
