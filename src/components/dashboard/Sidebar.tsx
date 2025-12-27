"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
    LayoutDashboard,
    BookOpen,
    RefreshCw,
    Library,
    BarChart3,
    Plus,
    Upload,
    Settings,
    MessageSquare,
    ChevronDown,
} from "lucide-react"
import { useState } from "react"

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
    },
    {
        label: "Questions",
        icon: BookOpen,
        href: "/dashboard/questions",
    },
    {
        label: "Reviews",
        icon: RefreshCw,
        href: "/dashboard/anki",
    },
    {
        label: "Decks",
        icon: Library,
        href: "/dashboard/planner",
    },
    {
        label: "Analytics",
        icon: BarChart3,
        href: "/dashboard/analytics",
    },
]

const devRoutes = [
    {
        label: "Comentários",
        icon: MessageSquare,
        href: "/dashboard/admin/comentarios",
    },
    {
        label: "Ingestão",
        icon: Upload,
        href: "/dashboard/ingestao",
    },
]

export default function Sidebar() {
    const pathname = usePathname()
    const [devOpen, setDevOpen] = useState(true)

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
            {/* Logo/Brand */}
            <div className="px-6 pt-6 pb-8">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all p-1.5">
                        <Image
                            src="/logo.png"
                            alt="Elphy"
                            width={32}
                            height={32}
                            className="object-contain"
                        />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">
                        Elphy
                    </h1>
                </Link>
            </div>

            {/* Navigation - Clean & Minimalist */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                {routes.map((route, i) => {
                    const isActive = pathname === route.href
                    return (
                        <motion.div
                            key={route.href}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Link
                                href={route.href}
                                className={cn(
                                    "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                                    isActive
                                        ? "bg-emerald-50 text-emerald-600"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                {/* Active indicator */}
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full" />
                                )}

                                <route.icon className={cn(
                                    "w-5 h-5 transition-colors flex-shrink-0",
                                    isActive
                                        ? "text-emerald-600"
                                        : "text-gray-500"
                                )} />

                                <span className={cn(
                                    "text-sm font-medium transition-colors",
                                    isActive ? "text-emerald-600" : "text-gray-600"
                                )}>
                                    {route.label}
                                </span>
                            </Link>
                        </motion.div>
                    )
                })}

                {/* Dev Tools Section */}
                <div className="pt-4 mt-4 border-t border-gray-100">
                    <button
                        onClick={() => setDevOpen(!devOpen)}
                        className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors"
                    >
                        <span className="flex items-center gap-2">
                            <Settings className="w-3.5 h-3.5" />
                            Dev Tools
                        </span>
                        <ChevronDown className={cn(
                            "w-4 h-4 transition-transform",
                            devOpen ? "rotate-180" : ""
                        )} />
                    </button>

                    {devOpen && (
                        <div className="mt-1 space-y-1">
                            {devRoutes.map((route) => {
                                const isActive = pathname === route.href
                                return (
                                    <Link
                                        key={route.href}
                                        href={route.href}
                                        className={cn(
                                            "relative flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm",
                                            isActive
                                                ? "bg-purple-50 text-purple-600"
                                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                        )}
                                    >
                                        {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-purple-500 rounded-r-full" />
                                        )}
                                        <route.icon className={cn(
                                            "w-4 h-4",
                                            isActive ? "text-purple-600" : "text-gray-400"
                                        )} />
                                        <span>{route.label}</span>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </div>
            </nav>

            {/* Bottom Section - New Deck Button */}
            <div className="p-4 border-t border-gray-200">
                <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full relative group"
                >
                    {/* Button content */}
                    <div className="relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-md hover:shadow-lg transition-all">
                        <Plus className="w-5 h-5" />
                        <span>Novo Deck</span>
                    </div>
                </motion.button>

                {/* Study Stats Summary */}
                <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-2">Hoje</p>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-lg font-bold text-gray-900">24</p>
                            <p className="text-xs text-gray-500">Revisadas</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-emerald-600">12</p>
                            <p className="text-xs text-gray-500">Restantes</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
