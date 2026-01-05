import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Repeat2, MoreHorizontal, CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

// Helper for relative time (e.g. "2h", "5m")
function formatRelativeTime(date: Date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'agora';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
}

interface PostCardProps {
    post: any;
    currentUserId: string;
}

export default function PostCardTest({ post, currentUserId }: PostCardProps) {
    const [liked, setLiked] = useState(false); // TODO: actual logic
    const [likesCount, setLikesCount] = useState(post.likes_count || 0);

    const handleLike = () => {
        setLiked(!liked);
        setLikesCount((prev: number) => liked ? prev - 1 : prev + 1);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-gray-100 transition-all duration-300"
        >
            <div className="flex gap-4">
                {/* Avatar Column */}
                <div className="shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 ring-2 ring-white shadow-sm">
                        {post.profiles?.avatar_url ? (
                            <img src={post.profiles.avatar_url} alt={post.profiles.full_name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-gray-400 bg-gray-50">
                                {post.profiles?.full_name?.[0]}
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 leading-tight">
                            <span className="font-bold text-gray-900 text-[15px] hover:text-emerald-600 transition-colors cursor-pointer">
                                {post.profiles?.full_name}
                            </span>
                            <div className="flex items-center gap-1 text-gray-400 text-sm">
                                <span>@{post.profiles?.role?.toLowerCase().replace(/\s/g, '') || 'usuario'}</span>
                                <span>·</span>
                                <span>{formatRelativeTime(new Date(post.created_at))}</span>
                            </div>
                        </div>
                        <button className="text-gray-300 hover:text-emerald-500 transition-colors -mr-2 p-2 rounded-full hover:bg-emerald-50/50">
                            <MoreHorizontal size={18} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="text-[15px] text-gray-800 leading-relaxed whitespace-pre-wrap mb-3">
                        {post.content}
                    </div>

                    {/* Image Attachment (If Any) */}
                    {post.image_url && (
                        <div className="mt-3 mb-4 rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative group/image">
                            <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/5 transition-colors" />
                            <img src={post.image_url} alt="Post content" className="w-full h-auto max-h-[400px] object-cover" />
                        </div>
                    )}

                    {/* Actions Row */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 max-w-md">
                        <button className="group flex items-center gap-1.5 text-gray-400 hover:text-emerald-500 transition-colors">
                            <div className="p-2 rounded-full group-hover:bg-emerald-50/80 transition-colors">
                                <MessageCircle size={18} />
                            </div>
                            <span className="text-xs font-medium">{post.comments_count > 0 && post.comments_count}</span>
                        </button>

                        <button className="group flex items-center gap-1.5 text-gray-400 hover:text-blue-500 transition-colors">
                            <div className="p-2 rounded-full group-hover:bg-blue-50/80 transition-colors">
                                <Repeat2 size={18} />
                            </div>
                        </button>

                        <button
                            onClick={handleLike}
                            className={`group flex items-center gap-1.5 transition-colors ${liked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'}`}
                        >
                            <div className="p-2 rounded-full group-hover:bg-pink-50/80 transition-colors">
                                <Heart size={18} className={liked ? "fill-current" : ""} />
                            </div>
                            <span className="text-xs font-medium">{likesCount > 0 && likesCount}</span>
                        </button>

                        <button className="group flex items-center gap-1.5 text-gray-400 hover:text-emerald-500 transition-colors">
                            <div className="p-2 rounded-full group-hover:bg-emerald-50/80 transition-colors">
                                <Share2 size={18} />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
