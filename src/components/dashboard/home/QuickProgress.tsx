import { Clock, Calendar, Timer } from "lucide-react"
import { motion } from "framer-motion"

interface QuickProgressProps {
    todayMinutes: number
    weekMinutes: number
    pomodoroCount: number
}

// Helper to format minutes to "1h 20m"
const formatTime = (totalMinutes: number) => {
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60
    if (h === 0) return `${m}min`
    if (m === 0) return `${h}h`
    return `${h}h ${m}m`
}

export default function QuickProgress({ todayMinutes, weekMinutes, pomodoroCount }: QuickProgressProps) {
    const METRICS = [
        {
            label: "Hoje",
            value: formatTime(todayMinutes),
            icon: Clock,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            target: "4h" // Mock target for now
        },
        {
            label: "Semana",
            value: formatTime(weekMinutes),
            icon: Calendar,
            color: "text-blue-600",
            bg: "bg-blue-50",
            target: "20h"
        },
        {
            label: "Pomodoros",
            value: `${pomodoroCount}`,
            icon: Timer,
            color: "text-orange-500",
            bg: "bg-orange-50",
            target: "10"
        }
    ]

    return (
        <div className="grid grid-cols-3 gap-4">
            {METRICS.map((metric, i) => (
                <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-gray-100 shadow-sm text-center"
                >
                    <div className={`p-2 rounded-full mb-2 ${metric.bg}`}>
                        <metric.icon className={`w-5 h-5 ${metric.color}`} />
                    </div>
                    <span className="text-xl font-bold text-gray-900">{metric.value}</span>
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{metric.label}</span>
                </motion.div>
            ))}
        </div>
    )
}
