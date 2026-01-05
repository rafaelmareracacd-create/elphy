import { motion } from "framer-motion"
import { Play, CheckCircle2, Lightbulb, ArrowRight } from "lucide-react"

interface FocusCardProps {
    status: 'has_goal' | 'suggestion' | 'completed'
    subjectName?: string
    goalTimeMinutes?: number
    progressMinutes?: number
    onAction: () => void
}

export default function FocusCard({
    status,
    subjectName,
    goalTimeMinutes = 0,
    progressMinutes = 0,
    onAction
}: FocusCardProps) {
    const progressPercentage = Math.min(100, Math.round((progressMinutes / (goalTimeMinutes || 1)) * 100))

    // CONTENT MAPPING
    const content = {
        has_goal: {
            icon: <Play className="w-6 h-6 ml-1 text-emerald-600" />,
            title: "Seu foco agora",
            subtitle: `${progressMinutes}min de ${goalTimeMinutes}min concluídos`,
            description: `Você planejou estudar ${subjectName} hoje.`,
            buttonText: "Iniciar Estudo",
            colorClass: "from-emerald-600 to-teal-700",
            lightColorClass: "text-emerald-100"
        },
        suggestion: {
            icon: <ArrowRight className="w-6 h-6 text-indigo-600" />,
            title: "Sugestão de Estudo",
            subtitle: "Baseado no seu progresso a longo prazo",
            description: `${subjectName} precisa de atenção. Que tal 30 min?`,
            buttonText: "Aceitar Desafio",
            colorClass: "from-indigo-600 to-violet-700",
            lightColorClass: "text-indigo-100"
        },
        completed: {
            icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
            title: "Meta Diária Batida!",
            subtitle: "Você é incrível. 🔥",
            description: "Descanse ou adiante o conteúdo de amanhã.",
            buttonText: "Ver Cronograma Completo",
            colorClass: "from-gray-800 to-gray-900 border-gray-700",
            lightColorClass: "text-gray-400"
        }
    }

    const current = content[status]

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`
                relative overflow-hidden rounded-3xl p-6 md:p-8 text-white shadow-xl
                bg-gradient-to-br ${current.colorClass}
            `}
        >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold opacity-90 uppercase tracking-wide">
                        {status === 'suggestion' && <Lightbulb className="w-4 h-4 text-yellow-300" />}
                        {current.title}
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                        {status === 'completed' ? 'Missão Cumprida' : subjectName}
                    </h2>

                    <p className={`text-lg opacity-80 max-w-lg ${current.lightColorClass}`}>
                        {current.description}
                    </p>

                    {/* Progress Bar (Only for active goals) */}
                    {status === 'has_goal' && (
                        <div className="w-full max-w-xs h-2 bg-black/20 rounded-full mt-4 overflow-hidden backdrop-blur-sm">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-white/90 rounded-full"
                            />
                        </div>
                    )}
                </div>

                <div className="mt-4 md:mt-0">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onAction}
                        className="flex items-center gap-3 px-8 py-4 bg-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all text-gray-900"
                    >
                        {current.icon}
                        <span>{current.buttonText}</span>
                    </motion.button>
                </div>
            </div>
        </motion.div>
    )
}
