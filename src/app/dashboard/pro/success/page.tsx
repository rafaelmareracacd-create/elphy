'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, PartyPopper, ArrowRight, Home } from 'lucide-react'
import Link from 'next/link'
import confetti from 'canvas-confetti'

export default function SuccessPage() {
    React.useEffect(() => {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10B981', '#34D399', '#059669']
        })
    }, [])

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#121212] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white dark:bg-[#1A1A1A] p-10 rounded-[40px] shadow-2xl border border-gray-100 dark:border-gray-800 text-center"
            >
                <div className="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center mx-auto mb-8 animate-bounce-subtle">
                    <CheckCircle2 size={48} />
                </div>

                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                    Bem-vindo ao Pro! <PartyPopper className="inline-block text-emerald-500" />
                </h1>

                <p className="text-gray-500 dark:text-gray-400 mb-10 leading-relaxed text-sm">
                    Sua conta foi atualizada com sucesso. Você acaba de desbloquear o acesso ilimitado e todas as ferramentas de IA exclusivas do Elphy.
                </p>

                <div className="space-y-3">
                    <Link
                        href="/dashboard"
                        className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-200 dark:shadow-none transition-all flex items-center justify-center gap-2 group"
                    >
                        Começar a Usar
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                        href="/dashboard"
                        className="w-full py-4 px-6 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                    >
                        <Home size={18} />
                        Voltar ao Início
                    </Link>
                </div>

                <div className="mt-10 pt-8 border-t border-gray-50 dark:border-gray-800">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                        Próximos passos
                    </p>
                    <div className="mt-4 flex justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400 px-2">
                        <span>Acessar IA</span>
                        <span>Ver Analytics</span>
                        <span>Personalizar Perfil</span>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
