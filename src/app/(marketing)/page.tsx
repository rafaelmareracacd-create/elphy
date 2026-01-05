'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Target, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function MarketingPage() {
    return (
        <div className="relative flex flex-col min-h-screen overflow-hidden bg-gray-50">
            {/* Background Pattern (Same as Login) */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[500px] w-[500px] rounded-full bg-emerald-400 opacity-20 blur-[100px]"></div>
                <div className="absolute right-0 bottom-0 -z-10 h-[500px] w-[500px] rounded-full bg-teal-400 opacity-20 blur-[100px]"></div>
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-gray-200/50 bg-white/80 backdrop-blur-xl shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-gray-900 text-xl tracking-tight">Elphy</span>
                </div>
                <nav className="flex gap-4 items-center">
                    <Link href="/login" aria-label="Entrar na sua conta">
                        <Button variant="ghost" className="text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 font-medium">
                            Entrar
                        </Button>
                    </Link>
                    <Link href="/login?signup=true" aria-label="Criar uma nova conta">
                        <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 rounded-xl">
                            Começar Agora
                        </Button>
                    </Link>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="flex-1 relative z-10 flex flex-col items-center justify-center text-center px-6 py-20 lg:py-32 max-w-5xl mx-auto">
                <section className="flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-8"
                    >
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
                            Domine seus Estudos com <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">
                                Previsão via IA
                            </span>
                        </h1>

                        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            O Elphy usa inteligência artificial avançada para prever tendências de exames, organizar seus materiais e otimizar seu cronograma. Como um elefante, nunca esqueça o que aprendeu.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex flex-col sm:flex-row gap-4 mt-10 justify-center items-center"
                    >
                        <Link href="/login?signup=true">
                            <Button size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-xl shadow-emerald-500/20 rounded-2xl gap-2 transition-transform hover:scale-105">
                                Acessar Plataforma <ArrowRight className="w-5 h-5" />
                            </Button>
                        </Link>
                        <a href="#features" aria-label="Conheça nossos recursos">
                            <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2 border-gray-200 text-gray-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 rounded-2xl bg-white/50 backdrop-blur-sm">
                                Saiba Mais
                            </Button>
                        </a>
                    </motion.div>
                </section>

                {/* Feature Grid */}
                <section id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full text-left">
                    <h2 className="sr-only">Nossos Recursos</h2>
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="p-8 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6">
                            <Target className="w-7 h-7 text-emerald-600" aria-hidden="true" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-3 text-xl">Planejador Inteligente</h3>
                        <p className="text-gray-500 leading-relaxed">Cronograma adaptativo baseado no seu desempenho e tempo disponível.</p>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        className="p-8 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
                            <TrendingUp className="w-7 h-7 text-blue-600" aria-hidden="true" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-3 text-xl">Previsões Oráculo</h3>
                        <p className="text-gray-500 leading-relaxed">Análise de IA sobre tendências de banca e tópicos de alto rendimento.</p>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        className="p-8 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mb-6">
                            <Brain className="w-7 h-7 text-purple-600" aria-hidden="true" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-3 text-xl">Repetição Espaçada</h3>
                        <p className="text-gray-500 leading-relaxed">Revisões estilo Anki otimizadas para retenção de longo prazo.</p>
                    </motion.div>
                </section>

                {/* Elephant Memory Section */}
                <section className="mt-16 w-full flex justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="p-8 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-3xl max-w-3xl shadow-2xl relative overflow-hidden"
                    >
                        {/* Decorative circles */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -ml-32 -mb-32"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-left">
                            <div className="shrink-0 w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                                <span className="text-5xl" role="img" aria-label="Elefante">🐘</span>
                            </div>
                            <div>
                                <h2 className="font-bold text-white text-2xl mb-2">Nunca Esqueça o que Importa</h2>
                                <p className="text-emerald-50 leading-relaxed">
                                    Assim como os elefantes têm uma memória incrível que dura a vida toda, o Elphy garante que seu conhecimento permaneça. Nossa repetição espaçada por IA se adapta ao seu padrão de aprendizado.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </section>
            </main>

            <footer className="py-8 text-center text-sm text-gray-500 border-t border-gray-200 bg-white">
                <p>© 2025 Elphy EdTech. Todos os direitos reservados.</p>
            </footer>
        </div>
    );
}
