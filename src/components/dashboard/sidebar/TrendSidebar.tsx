import { MoreHorizontal } from 'lucide-react';

const trends = [
    { category: 'Educação', topic: 'ENEM 2026', posts: '52.1K posts' },
    { category: 'Matemática', topic: '#CálculoMental', posts: '12.4K posts' },
    { category: 'Em alta no Brasil', topic: 'Redação Nota 1000', posts: '8.3K posts' },
    { category: 'Tecnologia', topic: 'IA nos Estudos', posts: '4.5K posts' },
    { category: 'Concursos', topic: 'Edital Correios', posts: '150K posts' },
];

export default function TrendSidebar() {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden py-3 shadow-sm">
            <h2 className="font-black text-xl px-4 pb-3 text-gray-900">O que está acontecendo</h2>
            <div className="space-y-0">
                {trends.map((trend, index) => (
                    <div
                        key={index}
                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors relative"
                    >
                        <div className="flex justify-between items-start">
                            <span className="text-xs text-gray-500">{trend.category}</span>
                            <MoreHorizontal size={16} className="text-gray-400 hover:text-emerald-500" />
                        </div>
                        <p className="font-bold text-gray-900 text-[15px] pt-0.5">{trend.topic}</p>
                        <span className="text-xs text-gray-500">{trend.posts}</span>
                    </div>
                ))}
            </div>
            <div className="px-4 pt-3 cursor-pointer">
                <span className="text-emerald-500 text-sm hover:underline">Mostrar mais</span>
            </div>
        </div>
    );
}
