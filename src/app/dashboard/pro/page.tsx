'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Star, ShieldCheck, HelpCircle, ChevronDown, Rocket } from 'lucide-react'
import PricingComponent from '@/components/dashboard/pro/PricingComponent'

const faqs = [
    {
        q: "Como funciona o trial de 7 dias?",
        a: "Você terá acesso total a todas as ferramentas Pro imediatamente. Se cancelar antes dos 7 dias, nada será cobrado. Após esse período, a assinatura escolhida será ativada."
    },
    {
        q: "Posso cancelar minha assinatura quando quiser?",
        a: "Com certeza. Não temos fidelidade. Você pode cancelar com um clique nas configurações do seu perfil e continuará com acesso até o fim do período já pago."
    },
    {
        q: "Quais são as formas de pagamento?",
        a: "Aceitamos Pix, cartão de crédito e boleto através do Stripe, garantindo total segurança para seus dados."
    }
]

export default function ProPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#121212] transition-colors duration-300 pb-20">
            {/* Hero Section */}
            <section className="relative pt-20 pb-12 overflow-hidden">
                <div className="max-w-[1280px] mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6 border border-emerald-100 dark:border-emerald-800"
                    >
                        <Star size={14} fill="currentColor" />
                        Upgrade Disponível
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight mb-6"
                    >
                        Estude <span className="text-emerald-500">sem limites</span> <br /> com Elphy Pro
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                    >
                        Acesse IA exclusiva, analytics detalhados e ferramentas avançadas que
                        aceleram sua aprovação. Junte-se a milhares de estudantes de elite.
                    </motion.p>
                </div>

                {/* Decorative background elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 opacity-20 dark:opacity-10 pointer-events-none">
                    <div className="absolute top-20 left-1/4 w-64 h-64 bg-emerald-400 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-400 rounded-full blur-[140px]" />
                </div>
            </section>

            {/* Pricing Section */}
            <PricingComponent />

            {/* Trust Section */}
            <section className="py-16 max-w-5xl mx-auto px-4">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-gray-800">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center mb-4">
                            <ShieldCheck size={24} />
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">Segurança Total</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Pagamentos processados pelo Stripe, líder mundial em segurança.</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-gray-800">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center mb-4">
                            <Rocket size={24} fill="currentColor" />
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">Acesso Imediato</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Desbloqueie todas as ferramentas segundos após a confirmação.</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-gray-800">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-500 flex items-center justify-center mb-4">
                            <HelpCircle size={24} />
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">Suporte Prioritário</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Dúvidas? Nosso time Pro responde você em tempo recorde.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 max-w-3xl mx-auto px-4">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white text-center mb-12">Perguntas Frequentes</h2>
                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="p-6 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-gray-800">
                            <h5 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-between">
                                {faq.q}
                                <ChevronDown size={18} className="text-gray-400" />
                            </h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed italic">
                                {faq.a}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
