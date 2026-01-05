'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Image, AlignLeft, Smile, Link as LinkIcon, X } from 'lucide-react'

interface CreatePostProps {
    userProfile?: any
}

export default function CreatePostWidget({ userProfile }: CreatePostProps) {
    const [content, setContent] = useState('')
    const [isFocused, setIsFocused] = useState(false)

    // Mock States for "Simulation"
    const [isPosting, setIsPosting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    const MAX_CHARS = 280
    const charCount = content.length
    const progress = (charCount / MAX_CHARS) * 100
    const isOverLimit = charCount > MAX_CHARS

    const handlePost = async () => {
        if (!content.trim() || isOverLimit) return

        setIsPosting(true)
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsPosting(false)
        setShowSuccess(true)
        setContent('')

        setTimeout(() => setShowSuccess(false), 3000)
    }

    return (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden transition-all">
            {/* Success Feedback Overlay */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 bg-emerald-50/95 dark:bg-emerald-900/90 flex items-center justify-center flex-col gap-2"
                    >
                        <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                            <span className="text-2xl">🎉</span>
                        </div>
                        <p className="font-bold text-emerald-800 dark:text-emerald-100">Postado com sucesso!</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden ring-2 ring-transparent group-focus-within:ring-emerald-500 transition-all">
                        {userProfile?.avatar_url ? (
                            <img src={userProfile.avatar_url} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 dark:text-gray-400">
                                {userProfile?.full_name?.[0] || 'R'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Input Area */}
                <div className="flex-1">
                    <div className="relative">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => !content && setIsFocused(false)}
                            placeholder="O que você aprendeu hoje? Compartilhe com a comunidade!"
                            className="w-full min-h-[60px] max-h-[200px] bg-transparent border-none outline-none text-gray-800 dark:text-gray-200 text-[15px] placeholder-gray-400 resize-none py-2"
                            style={{ height: 'auto', minHeight: isFocused ? '100px' : '60px' }}
                        />
                        {/* Character Counter Ring (Twitter style) */}
                        {isFocused && (
                            <div className="absolute bottom-2 right-2">
                                <div className="relative w-6 h-6 flex items-center justify-center">
                                    <svg className="transform -rotate-90 w-full h-full">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-gray-200 dark:text-gray-700" />
                                        <circle
                                            cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="transparent"
                                            className={`${isOverLimit ? 'text-red-500' : progress > 80 ? 'text-amber-500' : 'text-emerald-500'} transition-all duration-300`}
                                            strokeDasharray={2 * Math.PI * 10}
                                            strokeDashoffset={2 * Math.PI * 10 * (1 - Math.min(progress, 100) / 100)}
                                        />
                                    </svg>
                                    <span className={`text-[8px] font-bold absolute ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>
                                        {MAX_CHARS - charCount <= 20 ? MAX_CHARS - charCount : ''}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Media Preview Area (Mock) */}

                    {/* Toolbar & Action */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-800">
                        <div className="flex items-center gap-1 -ml-2">
                            <ActionIconButton icon={Image} color="text-emerald-500" />
                            <ActionIconButton icon={AlignLeft} color="text-blue-500" />
                            <ActionIconButton icon={Smile} color="text-amber-500" />
                            <ActionIconButton icon={LinkIcon} color="text-gray-400" />
                        </div>

                        <div className="flex items-center gap-3">
                            {!isOverLimit && charCount > 0 && (
                                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 opacity-0 animate-in fade-in zoom-in duration-300">
                                    +12 XP
                                </span>
                            )}
                            <button
                                onClick={handlePost}
                                disabled={!content.trim() || isOverLimit || isPosting}
                                className={`px-5 py-2 rounded-full font-bold text-sm transition-all shadow-sm
                                    ${!content.trim() || isOverLimit
                                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                        : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30 hover:shadow-emerald-500/40 transform hover:-translate-y-0.5'
                                    }
                                `}
                            >
                                {isPosting ? 'Postando...' : 'Postar'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ActionIconButton({ icon: Icon, color }: { icon: any, color: string }) {
    return (
        <button className={`p-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${color}`}>
            <Icon size={20} />
        </button>
    )
}
