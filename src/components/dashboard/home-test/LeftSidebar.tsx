'use client'

import React from 'react'
import { Home, Calendar, BookOpen, Repeat, MessageCircle, Settings, Users, Trophy } from 'lucide-react'

interface LeftSidebarProps {
    className?: string
}

export default function LeftSidebar({ className }: LeftSidebarProps) {
    const navItems = [
        { icon: Home, label: 'Início', active: true },
        { icon: Calendar, label: 'Planejador', active: false },
        { icon: BookOpen, label: 'Questões', active: false },
        { icon: Repeat, label: 'Revisões', active: false },
    ]

    const engagementItems = [
        { icon: Users, label: 'Grupos de Estudo', color: 'text-pink-500' },
        { icon: Trophy, label: 'Conquistas', color: 'text-amber-500' },
    ]

    const toolItems = [
        { icon: MessageCircle, label: 'Comentários' },
        { icon: Settings, label: 'Configuração' },
    ]

    return (
        <aside className={`${className} flex flex-col h-full overflow-y-auto px-4 py-4 scrollbar-hide`}>
            {/* Main Nav */}
            <nav className="space-y-1 mb-8">
                {navItems.map((item) => (
                    <button
                        key={item.label}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-full font-medium transition-all duration-200 text-[15px]
                            ${item.active
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                    >
                        <item.icon size={22} className={item.active ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
                        {item.label}
                    </button>
                ))}
            </nav>

            {/* Engagement */}
            <div className="mb-4 px-4">
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Comunidade</h3>
            </div>
            <nav className="space-y-1 mb-8">
                {engagementItems.map((item) => (
                    <button
                        key={item.label}
                        className="w-full flex items-center gap-4 px-4 py-2.5 rounded-full font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-[15px]"
                    >
                        <div className={`p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 ${item.color}`}>
                            <item.icon size={18} />
                        </div>
                        {item.label}
                    </button>
                ))}
            </nav>

            {/* Tools */}
            <div className="mb-4 px-4">
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Ferramentas</h3>
            </div>
            <nav className="space-y-1">
                {toolItems.map((item) => (
                    <button
                        key={item.label}
                        className="w-full flex items-center gap-4 px-4 py-2.5 rounded-full font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-[15px]"
                    >
                        <item.icon size={20} className="text-gray-500 dark:text-gray-400" />
                        {item.label}
                    </button>
                ))}
            </nav>

            {/* Footer */}
            <div className="mt-auto pt-8 pb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl text-white shadow-lg shadow-emerald-500/20">
                    <p className="text-xs font-medium opacity-90 mb-1">Seu nível</p>
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-lg">Nível 12</span>
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white border border-white/20">Pro</span>
                    </div>
                    <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden">
                        <div className="w-[70%] h-full bg-white rounded-full" />
                    </div>
                </div>
            </div>
        </aside>
    )
}
