import { motion } from "framer-motion"
import { Timer } from "lucide-react"

interface WelcomeHeaderProps {
    userName: string
    pomodoroCount: number
}

export default function WelcomeHeader({ userName, pomodoroCount }: WelcomeHeaderProps) {
    const today = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    })

    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between"
        >
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {greeting}, <span className="text-emerald-600 dark:text-emerald-400">{userName}</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 capitalize">{today}</p>
            </div>

            {/* Subtle, simplified pomodoro indicator */}
            <div className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full 
                ${pomodoroCount > 0 ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400' : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500'}
            `}>
                <Timer className={`w-4 h-4 ${pomodoroCount > 0 ? 'text-orange-500' : ''}`} />
                <span className="font-bold text-sm">{pomodoroCount}</span>
            </div>
        </motion.div>
    )
}
