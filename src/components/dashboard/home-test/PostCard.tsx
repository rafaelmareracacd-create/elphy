'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, CheckCircle2, BarChart2 } from 'lucide-react'
import type { Post } from '@/data/mockPosts'

export default function PostCard({ post }: { post: Post }) {
    const [isLiked, setIsLiked] = useState(post.isLiked)
    const [likeCount, setLikeCount] = useState(post.stats.likes)

    const handleLike = () => {
        if (isLiked) {
            setLikeCount(prev => prev - 1)
            setIsLiked(false)
        } else {
            setLikeCount(prev => prev + 1)
            setIsLiked(true)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden ring-1 ring-gray-100 dark:ring-gray-800">
                            {post.user.avatar ? (
                                <img src={post.user.avatar} alt={post.user.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 dark:text-gray-400">
                                    {post.user.name[0]}
                                </div>
                            )}
                        </div>
                        {post.user.isPro && (
                            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white dark:border-[#1E1E1E]" title="Pro Member">
                                <CheckCircle2 size={10} />
                            </div>
                        )}
                    </div>

                    {/* Meta */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-gray-900 dark:text-gray-100 text-[15px]">{post.user.name}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{post.user.handle}</span>
                            <span className="text-gray-300 dark:text-gray-600 text-[10px]">•</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 hover:underline cursor-pointer">{post.createdAt}</span>
                        </div>
                        {post.user.role === 'Expert' && (
                            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-1.5 py-0.5 rounded w-fit mt-0.5">
                                Expert
                            </span>
                        )}
                    </div>
                </div>

                <button className="text-gray-300 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-300 p-1">
                    <MoreHorizontal size={18} />
                </button>
            </div>

            {/* Content */}
            <div className="pl-0 sm:pl-[52px] space-y-3">
                <p className="text-gray-800 dark:text-gray-200 text-[15px] leading-relaxed whitespace-pre-wrap">
                    {post.content}
                </p>

                {/* Media Attachments */}
                {post.media?.type === 'image' && post.media.url && (
                    <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 mt-2">
                        <img src={post.media.url} alt="Post content" className="w-full h-auto max-h-[400px] object-cover" />
                    </div>
                )}

                {post.media?.type === 'poll' && post.media.pollOptions && (
                    <div className="space-y-2 mt-2">
                        {post.media.pollOptions.map((option) => (
                            <div key={option.id} className="relative h-10 rounded-lg border border-emerald-100/50 dark:border-emerald-500/10 bg-gray-50 dark:bg-gray-800/50 overflow-hidden cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
                                <div
                                    className="absolute inset-y-0 left-0 bg-emerald-100 dark:bg-emerald-500/20 z-0 transition-all duration-1000 ease-out"
                                    style={{ width: `${option.percentage}%` }}
                                />
                                <div className="absolute inset-0 flex items-center justify-between px-4 z-10">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{option.label}</span>
                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{option.percentage}%</span>
                                </div>
                            </div>
                        ))}
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 pl-1">
                            950 votos • 2 dias restantes
                        </div>
                    </div>
                )}

                {post.media?.type === 'link' && post.media.linkData && (
                    <div className="flex flex-col sm:flex-row rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer mt-2">
                        {post.media.linkData.image ? (
                            <div className="h-40 sm:h-auto sm:w-40 flex-shrink-0 overflow-hidden">
                                <img
                                    src={post.media.linkData.image}
                                    alt={post.media.linkData.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="h-32 sm:h-auto sm:w-32 bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                        )}
                        <div className="p-3">
                            <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 line-clamp-1">{post.media.linkData.title}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{post.media.linkData.desc}</p>
                            <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400">
                                <span className="uppercase">{post.media.linkData.domain}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-50 dark:border-gray-800/50">
                    <div className="flex items-center gap-6">
                        {/* Like */}
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-1.5 text-sm transition-colors group ${isLiked ? 'text-pink-500' : 'text-gray-500 dark:text-gray-400 hover:text-pink-500'
                                }`}
                        >
                            <div className="relative p-1.5 rounded-full group-hover:bg-pink-50 dark:group-hover:bg-pink-500/10 transition-colors">
                                <motion.div
                                    animate={isLiked ? { scale: [1, 1.4, 1] } : {}}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                                </motion.div>
                            </div>
                            <span className="font-medium">{likeCount}</span>
                        </button>

                        {/* Comment */}
                        <button className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors group">
                            <div className="p-1.5 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-colors">
                                <MessageCircle size={18} />
                            </div>
                            <span className="font-medium">{post.stats.comments}</span>
                        </button>

                        {/* Share */}
                        <button className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-500 transition-colors group">
                            <div className="p-1.5 rounded-full group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 transition-colors">
                                <Share2 size={18} />
                            </div>
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-emerald-500 transition-colors">
                            <BarChart2 size={14} />
                            <span className="hidden sm:inline">{post.stats.views}</span>
                        </button>
                        <button className="text-gray-400 dark:text-gray-500 hover:text-emerald-500 transition-colors">
                            <Bookmark size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
