import { UserPlus } from 'lucide-react';

const suggestions = [
    { name: 'Ana Silva', handle: '@anastudy', avatar: null, role: 'Vestibulanda' },
    { name: 'Professor Bruno', handle: '@probruno', avatar: null, role: 'Mentor' },
    { name: 'Carla Dias', handle: '@carlamed', avatar: null, role: 'Nutrição' },
];

export default function WhoToFollow() {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden py-3 mt-4 shadow-sm">
            <h2 className="font-black text-xl px-4 pb-3 text-gray-900">Quem seguir</h2>
            <div className="space-y-0">
                {suggestions.map((user, index) => (
                    <div
                        key={index}
                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors flex items-center gap-3"
                    >
                        {/* Avatar Mock */}
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 shrink-0">
                            {user.name[0]}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-[15px] truncate hover:underline">{user.name}</p>
                            <p className="text-sm text-gray-500 truncate">{user.handle}</p>
                        </div>

                        <button className="bg-black text-white px-4 py-1.5 rounded-full font-bold text-sm hover:bg-gray-800 transition-colors">
                            Seguir
                        </button>
                    </div>
                ))}
            </div>
            <div className="px-4 pt-3 cursor-pointer">
                <span className="text-emerald-500 text-sm hover:underline">Mostrar mais</span>
            </div>
        </div>
    );
}
