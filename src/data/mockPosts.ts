export interface Post {
    id: string
    user: {
        name: string
        handle: string
        avatar: string
        role: 'Student' | 'Tutor' | 'Expert'
        isPro: boolean
        level: number
    }
    content: string
    media?: {
        type: 'image' | 'poll' | 'link'
        url?: string
        pollOptions?: Array<{ id: string, label: string, votes: number, percentage: number }>
        linkData?: { title: string, desc: string, domain: string, image?: string }
    }
    stats: {
        likes: number
        comments: number
        shares: number
        views: string
    }
    createdAt: string
    isLiked: boolean
    isSaved: boolean
}

export const MOCK_POSTS: Post[] = [
    {
        id: '1',
        user: {
            name: 'Rafael Marera',
            handle: '@rafaelmar',
            avatar: '', // Fallback to initial
            role: 'Student',
            isPro: true,
            level: 12
        },
        content: 'Acabei de completar minha meta de 4 horas de estudo focadas em Álgebra Linear! 🚀 A técnica Pomodoro realmente faz diferença. Alguém mais estudando para o exame de amanhã?',
        stats: {
            likes: 42,
            comments: 8,
            shares: 2,
            views: '1.2K'
        },
        createdAt: '2h ago',
        isLiked: true,
        isSaved: false
    },
    {
        id: '2',
        user: {
            name: 'Prof. Carlos Silva',
            handle: '@carlosmath',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
            role: 'Expert',
            isPro: true,
            level: 45
        },
        content: 'Dica rápida de Matemática: Para multiplicar qualquer número de dois dígitos por 11, basta somar os dois dígitos e colocar o resultado no meio. Exemplo: 26 x 11. 2+6=8. Resultado: 286. 😉',
        media: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2670&auto=format&fit=crop'
        },
        stats: {
            likes: 1250,
            comments: 142,
            shares: 520,
            views: '45K'
        },
        createdAt: '4h ago',
        isLiked: false,
        isSaved: true
    },
    {
        id: '3',
        user: {
            name: 'Grupo de Estudos ENEM',
            handle: '@enem2026',
            avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Enem',
            role: 'Student',
            isPro: false,
            level: 5
        },
        content: 'Qual a sua maior dificuldade em Redação atualmente? Estamos preparando um material gratuito.',
        media: {
            type: 'poll',
            pollOptions: [
                { id: '1', label: 'Começar o texto (Introdução)', votes: 145, percentage: 15 },
                { id: '2', label: 'Argumentação e repertório', votes: 520, percentage: 55 },
                { id: '3', label: 'Proposta de intervenção', votes: 210, percentage: 22 },
                { id: '4', label: 'Gramática e coesão', votes: 75, percentage: 8 },
            ]
        },
        stats: {
            likes: 89,
            comments: 231,
            shares: 12,
            views: '5.6K'
        },
        createdAt: '6h ago',
        isLiked: false,
        isSaved: false
    },
    {
        id: '4',
        user: {
            name: 'Sara Tech',
            handle: '@saratech',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara',
            role: 'Student',
            isPro: false,
            level: 8
        },
        content: 'Encontrei esse artigo incrível sobre como o sono afeta a consolidação da memória. Leitura obrigatória para quem vira a noite estudando! 😴🚫',
        media: {
            type: 'link',
            url: '#',
            linkData: {
                title: 'The Science of Sleep and Memory Retention',
                desc: 'New research shows that sleeping less than 6 hours can reduce retention by 40%.',
                domain: 'science.daily.news',
                image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=2060&auto=format&fit=crop'
            }
        },
        stats: {
            likes: 210,
            comments: 45,
            shares: 88,
            views: '8.2K'
        },
        createdAt: '8h ago',
        isLiked: false,
        isSaved: true
    }
]
