'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles, Rocket, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const tiers = [
    {
        name: 'Free',
        price: 'R$ 0',
        description: 'O essencial para começar seus estudos.',
        features: [
            'Posts e interações limitadas',
            'Ferramentas básicas de estudo',
            'Comunidade aberta',
            'Suporte via comunidade'
        ],
        cta: 'Plano Atual',
        featured: false,
        href: '#',
        period: ""
    },
    {
        name: 'Pro',
        price: { monthly: 'R$ 19,90', annual: 'R$ 9,90' },
        period: { monthly: '/mês', annual: '/mês no plano anual' },
        description: 'Tudo o que você precisa para ser aprovado.',
        features: [
            'IA Avançada (Resumos e Questões)',
            'Interações ilimitadas no Feed',
            'Analytics de progresso detalhado',
            'Badges e conquistas exclusivas',
            'Prioridade suporte e feed',
            'Experiência sem anúncios'
        ],
        cta: 'Experimente 7 dias grátis',
        featured: true,
        hrefs: {
            monthly: 'https://buy.stripe.com/test_aFadRb0tg0ge3oWat557W00',
            annual: 'https://buy.stripe.com/test_9B628tgse4wu7Fcbx957W01'
        }
    }
]

export default function PricingComponent() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual')

    return (
        <section className="py-12 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Toggle Billing */}
                <div className="flex justify-center mb-12">
                    <div className="relative flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl w-fit">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={cn(
                                "relative py-2 px-6 text-sm font-semibold rounded-xl transition-all",
                                billingCycle === 'monthly' ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-500"
                            )}
                        >
                            Mensal
                        </button>
                        <button
                            onClick={() => setBillingCycle('annual')}
                            className={cn(
                                "relative py-2 px-6 text-sm font-semibold rounded-xl transition-all",
                                billingCycle === 'annual' ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-500"
                            )}
                        >
                            Anual
                            <span className="absolute -top-3 -right-3 px-2 py-0.5 bg-emerald-500 text-[10px] text-white rounded-full font-bold">
                                -50%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8 items-stretch">
                    {tiers.map((tier) => (
                        <motion.div
                            key={tier.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "relative p-8 rounded-[32px] border transition-all duration-300",
                                tier.featured
                                    ? "bg-white dark:bg-[#1A1A1A] border-emerald-500 shadow-xl shadow-emerald-100 dark:shadow-none ring-1 ring-emerald-500"
                                    : "bg-white/50 dark:bg-[#1A1A1A]/50 border-gray-200 dark:border-gray-800"
                            )}
                        >
                            {tier.featured && (
                                <div className="absolute top-0 right-8 -translate-y-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-emerald-200 dark:shadow-none">
                                    <Sparkles size={12} />
                                    Mais Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{tier.name}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{tier.description}</p>
                            </div>

                            <div className="mb-8 flex items-baseline gap-1">
                                <span className="text-4xl font-black text-gray-900 dark:text-white">
                                    {typeof tier.price === 'string' ? tier.price : tier.price[billingCycle]}
                                </span>
                                <span className="text-gray-500 text-sm">
                                    {typeof tier.period === 'string' ? tier.period : tier.period[billingCycle]}
                                </span>
                            </div>

                            <ul className="space-y-4 mb-10">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 group">
                                        <div className={cn(
                                            "mt-0.5 p-0.5 rounded-full",
                                            tier.featured ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                                        )}>
                                            <Check size={14} className="stroke-[3]" />
                                        </div>
                                        <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                disabled={!tier.featured}
                                onClick={() => {
                                    if (tier.featured && tier.hrefs) {
                                        window.open(tier.hrefs[billingCycle], '_blank');
                                    }
                                }}
                                className={cn(
                                    "w-full py-4 px-6 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                                    tier.featured
                                        ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-none hover:scale-[1.02] active:scale-[0.98]"
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                                )}
                            >
                                {tier.featured && <Zap size={16} fill="white" />}
                                {tier.cta}
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Guarantee Info */}
                <div className="mt-12 text-center text-gray-400 dark:text-gray-500 text-xs font-medium flex items-center justify-center gap-2">
                    <Rocket size={14} className="text-emerald-500" />
                    Satisfação garantida ou seu dinheiro de volta em até 30 dias.
                </div>
            </div>
        </section>
    )
}
