'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { MessageSquare, Send, User, Trash2, Loader2 } from 'lucide-react'

// Helper for time ago
function formatTimeAgo(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'agora mesmo'
    if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)} min`
    if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)} h`
    if (diffInSeconds < 2592000) return `há ${Math.floor(diffInSeconds / 86400)} dias`
    return date.toLocaleDateString('pt-BR')
}

interface Comment {
    id: string
    content: string
    created_at: string
    user_id: string
    // Ideally we would join with profile data here, but for now we'll use placeholder
}

interface CommentsSectionProps {
    questionId: string
    isOpen: boolean
}

export function CommentsSection({ questionId, isOpen }: CommentsSectionProps) {
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    useEffect(() => {
        // Initial check
        supabase.auth.getUser().then(({ data }) => {
            setUserId(data.user?.id || null)
        })

        // Listen for changes (login/logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserId(session?.user?.id || null)
        })

        return () => subscription.unsubscribe()
    }, [])

    useEffect(() => {
        if (isOpen && questionId) {
            fetchComments()
        }
    }, [isOpen, questionId])

    const fetchComments = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('question_id', questionId)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setComments(data as Comment[])
        }
        setLoading(false)
    }

    const handleSubmit = async () => {
        if (!newComment.trim() || !userId) return

        setSubmitting(true)
        const { error } = await supabase
            .from('comments')
            .insert({
                question_id: questionId,
                user_id: userId,
                content: newComment.trim()
            })

        if (!error) {
            setNewComment('')
            fetchComments() // Refresh list
        }
        setSubmitting(false)
    }

    const handleDelete = async (commentId: string) => {
        if (!userId) return
        setDeletingId(commentId)

        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId)

        if (!error) {
            setComments(comments.filter(c => c.id !== commentId))
        }
        setDeletingId(null)
    }

    if (!isOpen) return null

    return (
        <div className="border-t bg-gray-50/50 p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Comentários ({comments.length})
            </h3>

            {/* List */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                    <div className="text-center py-4 text-xs text-gray-400">Carregando...</div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-6 text-sm text-gray-500 bg-white rounded border border-dashed border-gray-200">
                        Nenhum comentário ainda. Seja o primeiro!
                    </div>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="flex gap-3 text-sm bg-white p-3 rounded-lg border border-gray-100 shadow-sm group">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 text-emerald-700" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-gray-900">Usuário</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400">
                                            {formatTimeAgo(comment.created_at)}
                                        </span>
                                        {userId === comment.user_id && (
                                            <button
                                                onClick={() => handleDelete(comment.id)}
                                                disabled={deletingId === comment.id}
                                                className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Excluir comentário"
                                            >
                                                {deletingId === comment.id ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input */}
            <div className="flex gap-2 relative">
                {!userId && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg border border-gray-200">
                        <a href="/login" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
                            Faça login para comentar
                        </a>
                    </div>
                )}
                <textarea
                    placeholder="Adicione um comentário..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex min-h-[40px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    rows={1}
                    disabled={!userId}
                />
                <Button
                    size="icon"
                    className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white w-10 h-10"
                    disabled={!newComment.trim() || submitting || !userId}
                    onClick={handleSubmit}
                >
                    <Send className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}
