import { Search } from 'lucide-react';

export default function SearchInput() {
    return (
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
            </div>
            <input
                type="text"
                placeholder="Buscar no Elphy"
                className="
                    w-full py-3 pl-10 pr-4 
                    bg-white border border-gray-200 rounded-full 
                    text-gray-900 placeholder:text-gray-500 
                    focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500
                    transition-all duration-200 shadow-sm
                "
            />
        </div>
    );
}
