import { motion } from "framer-motion"
import { Sparkles, TrendingUp, Target } from "lucide-react"

interface MotivationalFeedbackProps {
    type: 'streak' | 'improvement' | 'encouragement'
    message: string
}

export default function MotivationalFeedback({ type, message }: MotivationalFeedbackProps) {
    const icons = {
        streak: <Sparkles className="w-4 h-4 text-orange-500" />,
        improvement: <TrendingUp className="w-4 h-4 text-emerald-500" />,
        encouragement: <Target className="w-4 h-4 text-blue-500" />
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 p-3 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 text-sm font-medium text-gray-600 max-w-md mx-auto"
        >
            {icons[type]}
            <span>{message}</span>
        </motion.div>
    )
}
