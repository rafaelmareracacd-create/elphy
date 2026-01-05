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
    Upload,
    Settings,
    MessageSquare,
    ChevronDown,
    LogOut,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Rocket,
    Zap,
} from "lucide-react"
import { useState } from "react"

const routes = [
    {
        label: "Feed",
        icon: LayoutDashboard,
        href: "/dashboard",
    },


    {
        label: "Plano de Estudos",
        icon: Calendar,
        href: "/dashboard/planner",
    },
    {
        label: "Estudar",
        icon: BookOpen,
        href: "/dashboard/questions",
    },
    {
        label: "Minhas Revisões",
        icon: RefreshCw,
        href: "/dashboard/anki",
    },
    {
        label: "Planos Pro",
        icon: Rocket,
        href: "/dashboard/pro",
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

interface SidebarProps {
    isCollapsed?: boolean;
    onToggle?: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
    const pathname = usePathname()
    const [devOpen, setDevOpen] = useState(true)

    return (
        <div className={cn(
            "flex flex-col h-full bg-white dark:bg-[#121212] border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out",
            isCollapsed ? "w-20" : "w-64"
        )}>
            {/* Logo/Brand & Toggle */}
            <div className={cn(
                "pt-6 pb-6 transition-all duration-300 flex items-center justify-between",
                isCollapsed ? "px-0 justify-center" : "px-6"
            )}>
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                        <Image
                            src="/Ilustração%20Elphy.png"
                            alt="Elphy"
                            width={38}
                            height={38}
                            className="object-contain"
                        />
                    </div>
                    {!isCollapsed && (
                        <motion.h1
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight"
                        >
                            Elphy
                        </motion.h1>
                    )}
                </Link>

                {!isCollapsed && (
                    <button
                        onClick={onToggle}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
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
                                    isCollapsed ? "justify-center px-0 mx-auto w-12" : "px-4",
                                    isActive
                                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                                )}
                            >
                                {/* Active indicator */}
                                {isActive && !isCollapsed && (
                                    <motion.div
                                        layoutId="activeTabIndicator"
                                        className="absolute left-0 top-1/2 -mt-4 w-1 h-8 bg-emerald-500 rounded-r-full"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}

                                <route.icon className={cn(
                                    "w-5 h-5 transition-colors flex-shrink-0 relative z-10",
                                    isActive ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-500",
                                    isActive && "stroke-[2.5]"
                                )} />

                                {!isCollapsed && (
                                    <span className={cn(
                                        "text-sm font-medium transition-colors",
                                        isActive ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-gray-600 dark:text-gray-400"
                                    )}>
                                        {route.label}
                                    </span>
                                )}
                            </Link>
                        </motion.div>
                    )
                })}

                {/* Notifications & Settings (Moved from Topbar) */}
                <div className="py-2"></div>



                <div className={cn(
                    "pt-4 mt-4 border-t border-gray-100 dark:border-gray-800",
                    isCollapsed ? "flex flex-col items-center" : ""
                )}>
                    <button
                        onClick={() => !isCollapsed && setDevOpen(!devOpen)}
                        className={cn(
                            "w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hover:text-gray-600 dark:hover:text-gray-300 transition-colors",
                            isCollapsed ? "justify-center px-0" : ""
                        )}
                    >
                        <span className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            {!isCollapsed && "Ferramentas"}
                        </span>
                        {!isCollapsed && (
                            <ChevronDown className={cn(
                                "w-4 h-4 transition-transform",
                                devOpen ? "rotate-180" : ""
                            )} />
                        )}
                    </button>

                    {devOpen && !isCollapsed && (
                        <div className="mt-1 space-y-1">
                            {devRoutes.map((route) => (
                                <Link
                                    key={route.href}
                                    href={route.href}
                                    className={cn(
                                        "relative flex items-center gap-3 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg",
                                        pathname === route.href && "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 font-medium"
                                    )}
                                >
                                    <route.icon className="w-4 h-4" />
                                    <span>{route.label}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </nav>

            {/* Collapsed Toggle (When collapsed) */}
            {isCollapsed && (
                <div className="px-2 py-4 flex justify-center">
                    <button
                        onClick={onToggle}
                        className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}

            {/* User Profile - Footer */}
            <div className={cn(
                "p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20",
                isCollapsed ? "px-2" : "px-4"
            )}>
                <div className={cn(
                    "flex items-center gap-3",
                    isCollapsed ? "justify-center" : ""
                )}>
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-emerald-200 dark:shadow-none">
                        <span className="font-bold text-sm">RM</span>
                    </div>

                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">Rafael M.</p>
                            <Link
                                href="/dashboard/pro"
                                className="group/pro flex items-center gap-1.5 transition-colors"
                            >
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold truncate">Upgrade para Pro</p>
                                <Zap size={10} className="text-emerald-500 fill-emerald-500 animate-pulse" />
                            </Link>
                        </div>
                    )}

                    {!isCollapsed && (
                        <button
                            onClick={async () => {
                                const { supabase } = await import('@/lib/supabase')
                                await supabase.auth.signOut()
                                window.location.href = '/login'
                            }}
                            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm text-gray-400 hover:text-red-500 transition-all"
                            title="Sair"
                        >
                            <LogOut size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
