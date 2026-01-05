import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, Trash2, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Post {
    id: string;
    content: string;
    image_url?: string;
    likes_count: number;
    comments_count: number;
    created_at: string;
    user_id: string;
    profiles: {
        full_name: string;
        avatar_url: string;
        role: string;
        level: number;
    };
    feed_likes: { user_id: string }[]; // Used to check if current user liked
}

interface PostCardProps {
    post: Post;
    currentUserId: string;
}

// Simple relative time helper to replace date-fns
const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'agora mesmo';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `há ${diffInMinutes} min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `há ${diffInHours} h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `há ${diffInDays} dias`;

    return date.toLocaleDateString('pt-BR');
};

export default function PostCard({ post, currentUserId }: PostCardProps) {
    const [isLiked, setIsLiked] = useState(post.feed_likes?.some(like => like.user_id === currentUserId));
    const [likesCount, setLikesCount] = useState(post.likes_count);
    const [showComments, setShowComments] = useState(false);

    // Comment state
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentsLoaded, setCommentsLoaded] = useState(false);

    const handleLike = async () => {
        // Optimistic update
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);

        try {
            if (newIsLiked) {
                await supabase.from('feed_likes').insert({ post_id: post.id, user_id: currentUserId });
            } else {
                await supabase.from('feed_likes').delete().match({ post_id: post.id, user_id: currentUserId });
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            // Revert on error
            setIsLiked(!newIsLiked);
            setLikesCount(prev => !newIsLiked ? prev + 1 : prev - 1);
        }
    };

    const loadComments = async () => {
        if (commentsLoaded) return;
        setCommentsLoading(true);
        try {
            const { data, error } = await supabase
                .from('feed_comments')
                .select('*, profiles(full_name, avatar_url)')
                .eq('post_id', post.id)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setComments(data || []);
            setCommentsLoaded(true);
        } catch (error) {
            console.error('Error loading comments:', error);
        } finally {
            setCommentsLoading(false);
        }
    };

    const handleCommentSubmit = async () => {
        if (!newComment.trim()) return;

        const tempId = Math.random().toString();
        const tempComment = {
            id: tempId,
            content: newComment,
            created_at: new Date().toISOString(),
            user_id: currentUserId,
            profiles: {
                full_name: 'Você', // Todo: Get actual user profile
                avatar_url: null
            },
            isTemp: true
        };

        setComments(prev => [...prev, tempComment]);
        setNewComment('');

        try {
            const { data, error } = await supabase
                .from('feed_comments')
                .insert({
                    post_id: post.id,
                    user_id: currentUserId,
                    content: tempComment.content
                })
                .select('*, profiles(full_name, avatar_url)')
                .single();

            if (error) throw error;

            setComments(prev => prev.map(c => c.id === tempId ? data : c));
        } catch (error) {
            console.error('Error submitting comment:', error);
            setComments(prev => prev.filter(c => c.id !== tempId));
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#121212] border-b border-gray-100 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors duration-200"
        >
            <div className="p-4 flex gap-4">
                {/* Avatar Column */}
                <div className="shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden ring-1 ring-gray-200 dark:ring-white/10 cursor-pointer hover:opacity-90">
                        {post.profiles.avatar_url ? (
                            <img src={post.profiles.avatar_url} alt={post.profiles.full_name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                                <User size={20} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <h3 className="font-bold text-gray-900 dark:text-white text-[15px] truncate hover:underline cursor-pointer">
                                {post.profiles.full_name}
                            </h3>
                            <span className="text-gray-500 dark:text-gray-400 text-sm truncate">@{post.profiles.role || 'estudante'}</span>
                            <span className="text-gray-400 dark:text-gray-600 text-sm">·</span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm hover:underline cursor-pointer">
                                {formatRelativeTime(post.created_at)}
                            </span>
                        </div>
                        <button className="text-gray-400 hover:text-emerald-500 p-1 rounded-full hover:bg-emerald-50 transition-colors group">
                            <MoreHorizontal size={18} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="mb-3">
                        <p className="text-gray-900 dark:text-white text-[15px] leading-relaxed whitespace-pre-wrap">{post.content}</p>
                        {post.image_url && (
                            <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/5 shadow-sm max-h-[500px]">
                                <img src={post.image_url} alt="Post content" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between max-w-md pr-4">
                        <button
                            onClick={() => {
                                setShowComments(!showComments);
                                if (!showComments) loadComments();
                            }}
                            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 group transition-colors"
                        >
                            <div className="p-2 rounded-full group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10">
                                <MessageCircle size={18} />
                            </div>
                            <span className="text-sm group-hover:text-emerald-500 dark:group-hover:text-emerald-400">{post.comments_count > 0 && post.comments_count}</span>
                        </button>

                        <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 group transition-colors">
                            <div className="p-2 rounded-full group-hover:bg-green-50 dark:group-hover:bg-green-500/10">
                                <Share2 size={18} className="rotate-90" />
                            </div>
                        </button>

                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 group transition-colors ${isLiked ? 'text-rose-500' : 'text-gray-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400'}`}
                        >
                            <div className="p-2 rounded-full group-hover:bg-rose-50 dark:group-hover:bg-rose-500/10">
                                <Heart size={18} className={isLiked ? 'fill-current' : ''} />
                            </div>
                            <span className="text-sm group-hover:text-rose-500 dark:group-hover:text-rose-400">{likesCount > 0 && likesCount}</span>
                        </button>

                        <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 group transition-colors">
                            <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10">
                                <Share2 size={18} />
                            </div>
                        </button>
                    </div>

                    {/* Comments Section (Inline) */}
                    <AnimatePresence>
                        {showComments && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5"
                            >
                                <div className="space-y-4">
                                    {/* Comment Input */}
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/5 shrink-0" />
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
                                                placeholder="Postar sua resposta"
                                                className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-600 text-[15px] pt-2"
                                            />
                                            <div className="flex justify-end mt-2">
                                                <button
                                                    onClick={handleCommentSubmit}
                                                    disabled={!newComment.trim()}
                                                    className="px-4 py-1.5 bg-emerald-500 text-white text-sm font-bold rounded-full disabled:opacity-50 hover:bg-emerald-600 transition-colors"
                                                >
                                                    Responder
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Comments List */}
                                    {commentsLoading && <div className="text-center py-4 text-emerald-500">Carregando...</div>}

                                    {comments.map((comment) => (
                                        <div key={comment.id} className={`flex gap-3 ${comment.isTemp ? 'opacity-50' : ''}`}>
                                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 ring-1 ring-gray-200 dark:ring-white/10 shrink-0 overflow-hidden">
                                                {comment.profiles?.avatar_url ? (
                                                    <img src={comment.profiles.avatar_url} className="w-full h-full object-cover" />
                                                ) : <div className="w-full h-full bg-gray-200 dark:bg-white/5" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900 dark:text-white text-sm">{comment.profiles?.full_name}</span>
                                                    <span className="text-gray-500 dark:text-gray-400 text-sm">@{comment.profiles?.role || 'user'}</span>
                                                    <span className="text-gray-500 dark:text-gray-400 text-sm">·</span>
                                                    <span className="text-gray-500 dark:text-gray-400 text-sm">{formatRelativeTime(comment.created_at)}</span>
                                                </div>
                                                <p className="text-gray-800 dark:text-gray-200 text-sm mt-0.5">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
