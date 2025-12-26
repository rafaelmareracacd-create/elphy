"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Calendar,
    Library,
    GraduationCap,
    Sparkles,
    BrainCircuit,
    PenTool,
    LogOut,
    User
} from "lucide-react"

const routes = [
    {
        label: "Overview",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-sky-500",
    },
    {
        label: "Planner",
        icon: Calendar,
        href: "/dashboard/planner",
        color: "text-violet-500",
    },
    {
        label: "Materials",
        icon: Library,
        href: "/dashboard/materials",
        color: "text-pink-700",
    },
    {
        label: "Questions",
        icon: GraduationCap,
        href: "/dashboard/questions",
        color: "text-orange-700",
    },
    {
        label: "Ingestão Manual",
        icon: PenTool,
        href: "/dashboard/ingestao",
        color: "text-blue-500",
    },
    {
        label: "Oracle",
        icon: Sparkles,
        href: "/dashboard/oracle",
        color: "text-emerald-500",
    },
    {
        label: "Anki",
        icon: BrainCircuit,
        href: "/dashboard/anki",
        color: "text-green-700",
    },
]

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                    <h1 className="text-2xl font-bold">
                        Study42
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* User Profile Section */}
            <div className="px-3 py-2 border-t border-white/10">
                <div className="p-3 rounded-xl bg-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-white">Rafael Marera</p>
                            <p className="text-xs text-zinc-400">Diplomata</p>
                        </div>
                    </div>
                    <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-sm text-zinc-400 hover:text-white">
                        <LogOut className="w-4 h-4" />
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    )
}
