import { motion } from "framer-motion"
import { CheckCircle2, Circle, Settings2 } from "lucide-react"
import Link from "next/link"

interface ScheduleItem {
    id: string
    subject: string
    time?: string
    durationMinutes: number
    completed: boolean
    color?: string
}

interface MiniScheduleProps {
    items: ScheduleItem[]
}

export default function MiniSchedule({ items }: MiniScheduleProps) {
    return (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900">Cronograma de Hoje</h3>
                <Link
                    href="/dashboard/planner"
                    className="p-2 -mr-2 text-gray-400 hover:text-emerald-600 hover:bg-gray-50 rounded-xl transition-all"
                    title="Ajustar Dia"
                >
                    <Settings2 className="w-4 h-4" />
                </Link>
            </div>

            <div className="space-y-4">
                {items.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        Nada planejado para hoje.
                        <br />
                        <Link href="/dashboard/planner" className="text-emerald-600 font-semibold hover:underline">
                            Planejar agora
                        </Link>
                    </div>
                ) : (
                    items.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-4 group"
                        >
                            <div className="shrink-0 flex flex-col items-center gap-1">
                                <div className={`w-0.5 h-full bg-gray-100 ${i === 0 ? 'opacity-0' : ''}`} />
                                <button className={`
                                    w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                                    ${item.completed
                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                        : 'border-gray-300 text-transparent hover:border-emerald-400'
                                    }
                                `}>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                                <div className={`w-0.5 h-full bg-gray-100 ${i === items.length - 1 ? 'opacity-0' : ''}`} />
                            </div>

                            <div className={`p-3 rounded-xl flex-1 transition-all ${item.completed ? 'bg-gray-50 opacity-60' : 'bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-sm'}`}>
                                <h4 className={`font-semibold text-sm ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                    {item.subject}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-gray-400 font-medium">
                                        {item.time ? `${item.time} • ` : ''} {item.durationMinutes}min
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    )
}
