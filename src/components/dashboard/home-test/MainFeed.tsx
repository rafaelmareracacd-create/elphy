'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, Loader2 } from 'lucide-react'
import CreatePostWidget from './CreatePostWidget'
import PostCard from './PostCard'
import { MOCK_POSTS, type Post } from '@/data/mockPosts'

interface MainFeedProps {
    userProfile?: any
}

export default function MainFeed({ userProfile }: MainFeedProps) {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Simulate initial data fetch
        const timer = setTimeout(() => {
            setPosts(MOCK_POSTS)
            setLoading(false)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    }

    return (
        <div className="max-w-[640px] mx-auto">
            {/* Feed Header */}
            <div className="flex items-center justify-between mb-6 px-2 sm:px-0">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20">
                        <Sparkles size={18} className="text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Feed da Comunidade
                    </h2>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800 shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <TrendingUp size={14} className="text-emerald-500" />
                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Em Alta</span>
                </div>
            </div>

            {/* Create Post */}
            <div className="mb-8">
                <CreatePostWidget userProfile={userProfile} />
            </div>

            {/* Posts List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Loader2 size={32} className="animate-spin mb-4 text-emerald-500" />
                    <p className="text-sm font-medium">Carregando feed...</p>
                </div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </motion.div>
            )}
        </div>
    )
}
