import { motion } from 'framer-motion'
import { MoreHorizontal, ArrowRight, Sparkles, TrendingUp, Instagram, Youtube, Twitter, Music2 } from 'lucide-react'

export default function RightSidebar({ className }: { className?: string }) {

    // Simulate analytics
    const handleTrendClick = (topic: string) => {
        console.log(`[Analytics] Clicked Trend: ${topic}`)
    }

    const handleFollowClick = (user: string) => {
        console.log(`[Analytics] Followed User: ${user}`)
    }

    return (
        <aside className={`${className} space-y-6 py-4 h-full overflow-y-auto custom-scrollbar`}>

            {/* SEARCH (Mobile/Tablet optional view if header search is hidden, but keeping clean for now) */}

            {/* TRENDING */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                    <TrendingUp size={18} className="text-emerald-500" />
                    <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">O que está acontecendo</h2>
                </div>

                <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                    {[
                        { topic: 'ENEM 2026', posts: '52.1K posts', category: 'Educação' },
                        { topic: 'Matemática Mental', posts: '12.4K posts', category: 'Técnicas' },
                        { topic: 'Redação Nota 1000', posts: '8.3K posts', category: 'Português' },
                        { topic: 'Física Quântica', posts: '5.1K posts', category: 'Ciência' },
                    ].map((item) => (
                        <div
                            key={item.topic}
                            onClick={() => handleTrendClick(item.topic)}
                            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors relative group"
                        >
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-0.5">{item.category}</span>
                                <button className="text-gray-300 dark:text-gray-600 hover:text-emerald-500 dark:hover:text-emerald-500 p-1 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal size={16} />
                                </button>
                            </div>
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-[15px]">{item.topic}</h3>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{item.posts}</p>
                        </div>
                    ))}
                </div>

                <button className="w-full p-3 text-sm text-emerald-500 dark:text-emerald-400 font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors text-left pl-4">
                    Mostrar mais
                </button>
            </div>

            {/* SUGGESTIONS */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
                <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4">Quem seguir</h2>
                <div className="space-y-4">
                    {[
                        { name: 'Ana Silva', handle: '@anastudy', desc: 'Estudante de Medicina' },
                        { name: 'Prof. Carlos', handle: '@carlosmath', desc: 'Matemática Descomplicada' },
                        { name: 'Sofia Tech', handle: '@sofiadev', desc: 'Dicas de Programação' },
                    ].map((user) => (
                        <div key={user.handle} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-300">
                                    {user.name[0]}
                                </div>
                                <div className="leading-tight">
                                    <p className="font-bold text-sm text-gray-900 dark:text-gray-100 hover:underline cursor-pointer">{user.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.handle}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleFollowClick(user.handle)}
                                className="bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-bold px-3 py-1.5 rounded-full hover:opacity-80 transition-opacity"
                            >
                                Seguir
                            </button>
                        </div>
                    ))}
                </div>
                <button className="mt-4 text-xs text-emerald-500 dark:text-emerald-400 font-medium hover:underline flex items-center gap-1">
                    Ver mais recomendações <ArrowRight size={12} />
                </button>
            </div>

            {/* SOCIAL MEDIA LINKS - HIGH IMPACT POLISH */}
            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-gray-100 dark:border-slate-800 shadow-xl overflow-hidden relative group/card sticky top-4">
                <div className="p-5 relative z-10">
                    <div className="flex flex-col gap-1 mb-6">
                        <h2 className="font-extrabold text-lg text-gray-950 dark:text-white leading-tight tracking-tight">
                            Siga Elphy nas redes!
                        </h2>
                        <p className="text-[13px] text-gray-600 dark:text-slate-400 leading-relaxed">
                            Dicas rápidas e motivação de estudos!
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        {[
                            { name: 'Instagram', handle: '@elphy.study', followers: '50K', icon: Instagram, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-500/10', glow: 'shadow-[0_0_20px_rgba(236,72,153,0.3)]', iconBg: 'bg-gradient-to-tr from-pink-500/10 via-red-500/10 to-yellow-500/10' },
                            { name: 'TikTok', handle: '@elphy.app', followers: '25K', icon: Music2, color: 'text-gray-950 dark:text-white', bg: 'bg-gray-50 dark:bg-slate-800/50', glow: 'shadow-[0_0_20px_rgba(255,255,255,0.2)]', iconBg: 'bg-gray-100 dark:bg-slate-700/50' },
                            { name: 'YouTube', handle: 'Elphy Oficial', followers: '10K', icon: Youtube, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]', iconBg: 'bg-red-500/5' },
                            { name: 'X / Twitter', handle: '@elphyapp', followers: '5K', icon: Twitter, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-500/10', glow: 'shadow-[0_0_20px_rgba(14,165,233,0.3)]', iconBg: 'bg-sky-500/5' },
                        ].map((platform) => (
                            <motion.a
                                key={platform.name}
                                href="#"
                                whileHover={{ scale: 1.05, y: -4 }}
                                className="flex flex-col p-4 rounded-[24px] bg-gray-50/50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-all group/item hover:shadow-2xl hover:shadow-emerald-500/10"
                            >
                                <div className={`w-14 h-14 ${platform.iconBg} rounded-2xl flex items-center justify-center mb-4 group-hover/item:${platform.glow} transition-all duration-300 ring-1 ring-black/5 dark:ring-white/5`}>
                                    <platform.icon size={28} className={platform.color} />
                                </div>

                                <span className="text-[13px] font-bold text-gray-900 dark:text-white mb-0.5">{platform.handle}</span>
                                <span className="text-[11px] text-gray-500 dark:text-slate-500 font-medium mb-3">{platform.followers} seguidores</span>

                                <div className="mt-auto flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 group-hover/item:translate-x-1 transition-transform">
                                    Siga agora <ArrowRight size={12} className="group-hover/item:scale-110 transition-transform" />
                                </div>
                            </motion.a>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0.6 }}
                        whileHover={{ opacity: 1 }}
                        className="mt-8 pt-4 border-t border-gray-100 dark:border-slate-800 text-center"
                    >
                        <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-500 flex items-center justify-center gap-1 cursor-pointer">
                            Não perca as dicas que ajudaram milhares de aprovados! 🚀
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* FOOTER */}
            <div className="px-4 pb-10 text-[11px] text-gray-400 dark:text-slate-600 flex flex-wrap gap-x-4 gap-y-2 leading-relaxed justify-center text-center font-medium">
                <span className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer">Termos</span>
                <span className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer">Privacidade</span>
                <span className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer">Acessibilidade</span>
                <div className="w-full mt-2 text-[10px] text-gray-300 dark:text-slate-800">© 2026 Elphy Inc. • Feito com 💚 para estudantes</div>
            </div>
        </aside>
    )
}
