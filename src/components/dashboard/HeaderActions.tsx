'use client'

import React from 'react'
import { Bell, Moon, Sun, User } from 'lucide-react'
import { useTheme } from './home-test/ThemeContext'

interface HeaderActionsProps {
    userProfile?: any
}

export default function HeaderActions({ userProfile }: HeaderActionsProps) {
    const { theme, toggleTheme } = useTheme()

    return (
        <div className="flex items-center gap-1 sm:gap-2">
            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Alternar tema"
            >
                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#121212]" />
            </button>

            {/* Vertical Divider */}
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-1 hidden sm:block" />

            {/* Profile Avatar */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden ring-2 ring-white dark:ring-gray-800 cursor-pointer hover:ring-emerald-500 transition-all ml-1 flex items-center justify-center shrink-0">
                {userProfile?.avatar_url ? (
                    <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-300">
                        {userProfile?.full_name?.[0] || 'U'}
                    </div>
                )}
            </div>
        </div>
    )
}
