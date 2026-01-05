import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import CreatePost from './CreatePost';
import PostCard from './PostCard';
import { Loader2, TrendingUp } from 'lucide-react';

interface FeedProps {
    userProfile: any;
}

export default function Feed({ userProfile }: FeedProps) {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('posts')
                .select(`
                    *,
                    profiles:user_id (full_name, avatar_url, role, level),
                    feed_likes!left (user_id)
                `)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            setPosts(data || []);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();

        // Optional: Subscribe to realtime updates
        const channel = supabase
            .channel('public:posts')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
                // For now, simpler to just refetch or manually insert if we have the profile data
                // fetchPosts(); 
                // Creating a simplified optimistic post for realtime is tricky without the profile relation joined.
                // Safest to just fetch latest or add a toggle content.
                console.log('New post!', payload);
                fetchPosts();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-8 pb-20">
            {/* Feed Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                    Feed da Comunidade
                </h2>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    <TrendingUp size={14} />
                    <span>Em Alta</span>
                </div>
            </div>

            {/* Create Post Widget */}
            <CreatePost userProfile={userProfile} onPostCreated={fetchPosts} />

            {/* Posts List */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                {loading && posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Loader2 size={32} className="animate-spin mb-4 text-emerald-500" />
                        <p>Carregando atualizações...</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-12 bg-white/50 dark:bg-[#1A1A1A]/50 rounded-[32px] border border-gray-100 dark:border-white/5">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">Nenhum post ainda.</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm">Seja o primeiro a compartilhar!</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            currentUserId={userProfile?.id}
                        />
                    ))
                )}
            </motion.div>
        </div>
    );
}
