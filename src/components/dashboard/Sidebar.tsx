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
    BrainCircuit
} from "lucide-react"
import StudyStatus from "./StudyStatus"

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
            <div className="px-3">
                <StudyStatus />
            </div>
        </div>
    )
}
