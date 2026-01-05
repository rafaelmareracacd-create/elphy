import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image as ImageIcon, Smile, X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CreatePostProps {
    userProfile: any;
    onPostCreated: () => void;
}

export default function CreatePost({ userProfile, onPostCreated }: CreatePostProps) {
    const [content, setContent] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null); // Placeholder for future image support

    const handleSubmit = async () => {
        if (!content.trim()) return;

        setIsLoading(true);
        try {
            const { error } = await supabase.from('posts').insert({
                user_id: userProfile.id,
                content: content.trim(),
                image_url: imageUrl
            });

            if (error) throw error;

            setContent('');
            setImageUrl(null);
            setIsFocused(false);
            onPostCreated();
        } catch (error) {
            console.error('Error creating post:', error);
            // TODO: Add toast notification
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            layout
            className={`
                bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 p-4 rounded-2xl shadow-sm
                ${isFocused ? 'ring-2 ring-emerald-500/10' : ''}
                transition-all duration-200
            `}
        >
            <div className="flex gap-4">
                {/* User Avatar */}
                <div className="shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/5 overflow-hidden">
                        {userProfile?.avatar_url ? (
                            <img src={userProfile.avatar_url} alt={userProfile.full_name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold">
                                {userProfile?.full_name?.charAt(0) || 'U'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Input Area */}
                <div className="flex-1 space-y-3">
                    <div className="relative pt-2">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => !content && setIsFocused(false)}
                            placeholder="O que está acontecendo?"
                            className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-600 resize-none text-[19px] min-h-[50px] max-h-[200px]"
                            style={{ scrollbarWidth: 'none' }}
                            rows={isFocused || content ? 3 : 1}
                        />
                    </div>

                    {imageUrl && (
                        <div className="relative rounded-2xl overflow-hidden mb-2">
                            {/* Image Preview would go here */}
                            <div className="bg-gray-100 dark:bg-white/5 h-40 w-full flex items-center justify-center text-gray-400 dark:text-gray-600">Image Preview</div>
                            <button onClick={() => setImageUrl(null)} className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"><X size={16} /></button>
                        </div>
                    )}

                    <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-3">
                        <div className="flex gap-1 text-emerald-500 dark:text-emerald-400">
                            <button
                                onClick={() => { }}
                                className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-full transition-colors"
                                title="Adicionar imagem"
                            >
                                <ImageIcon size={20} />
                            </button>
                            <button
                                className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-full transition-colors"
                                title="Adicionar emoji"
                            >
                                <Smile size={20} />
                            </button>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={!content.trim() || isLoading}
                            className={`
                                px-4 py-1.5 rounded-full font-bold text-[15px] flex items-center gap-2 transition-all
                                ${content.trim() && !isLoading
                                    ? 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95'
                                    : 'bg-emerald-200 dark:bg-emerald-500/10 text-white/80 dark:text-white/30 cursor-not-allowed'}
                            `}
                        >
                            {isLoading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <span>Postar</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
