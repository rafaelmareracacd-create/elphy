'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Search, Bell, Settings, Menu, Moon, Sun, Zap } from 'lucide-react'
import Link from 'next/link'
import { useTheme } from './ThemeContext'
import HeaderActions from '../HeaderActions'

interface HeaderProps {
    activeTab: string
    onTabChange: (tab: 'home' | 'foryou' | 'following') => void
    onOpenMobileMenu: () => void
    userProfile?: any
}

export default function Header({ activeTab, onTabChange, onOpenMobileMenu, userProfile }: HeaderProps) {
    const { theme, toggleTheme } = useTheme()

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-[#121212]/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-50 px-4 lg:px-0 transition-colors duration-300">
            <div className="max-w-[1280px] mx-auto h-full flex items-center justify-between lg:grid lg:grid-cols-12 lg:gap-8 relative lg:static">

                {/* LEFT: Logo & Mobile Menu */}
                <div className="flex items-center gap-4 lg:col-span-2">
                    <button
                        onClick={onOpenMobileMenu}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-2 cursor-pointer group">
                        {/* Elphy Logo Icon - Simplified Elephant */}
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none group-hover:scale-110 transition-transform">
                            <span className="text-white font-bold text-lg leading-none mb-0.5">E</span>
                        </div>
                        <span className="hidden sm:block font-bold text-xl text-gray-800 dark:text-white tracking-tight">Elphy</span>
                    </div>
                </div>

                {/* CENTER: Navigation Tabs (Desktop only) */}
                <nav className="hidden md:flex items-center h-full gap-8 absolute left-1/2 -translate-x-1/2 lg:static lg:transform-none lg:translate-x-0 lg:col-span-7 lg:col-start-3 lg:justify-self-center">
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

                {/* RIGHT: Search & Actions */}
                <div className="flex items-center gap-3 md:gap-4 lg:col-span-3 lg:col-start-10 lg:justify-end">
                    {/* Search Bar */}
                    <div className="hidden lg:flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 w-64 focus-within:ring-2 focus-within:ring-emerald-500/50 transition-all">
                        <Search size={16} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar no Elphy..."
                            className="bg-transparent border-none outline-none text-sm ml-2 w-full text-gray-700 dark:text-gray-200 placeholder-gray-400"
                        />
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                        {/* Pro Badge */}
                        <Link
                            href="/dashboard/pro"
                            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-200 dark:shadow-none mr-1"
                        >
                            <Zap size={12} fill="white" />
                            <span>Elphy Pro</span>
                        </Link>

                        <HeaderActions userProfile={userProfile} />
                    </div>
                </div>
            </div>
        </header>
    )
}
