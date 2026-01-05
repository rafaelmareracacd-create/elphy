import { motion } from 'framer-motion';
import { Settings, Bell, User } from 'lucide-react';

interface HomeNavbarProps {
    activeTab: 'foryou' | 'following';
    onTabChange: (tab: 'foryou' | 'following') => void;
    userProfile: any;
}

export default function HomeNavbar({ activeTab, onTabChange, userProfile }: HomeNavbarProps) {
    return (
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            {/* Top Toolbar */}
            <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Avatar (Mobile/Quick Access) */}
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                        {userProfile?.avatar_url ? (
                            <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                                <User size={16} />
                            </div>
                        )}
                    </div>

                    <span className="font-bold text-xl text-gray-900 tracking-tight hidden sm:block">Início</span>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-emerald-500 rounded-full border border-white"></span>
                    </button>
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center justify-around">
                <button
                    onClick={() => onTabChange('foryou')}
                    className="relative flex-1 py-3 text-sm font-bold hover:bg-gray-50 transition-colors"
                >
                    <span className={activeTab === 'foryou' ? 'text-black' : 'text-gray-500'}>
                        Para você
                    </span>
                    {activeTab === 'foryou' && (
                        <motion.div
                            layoutId="home-navbar-indicator"
                            className="absolute bottom-0 left-0 right-0 h-[3px] bg-emerald-500 rounded-full w-14 mx-auto"
                        />
                    )}
                </button>

                <button
                    onClick={() => onTabChange('following')}
                    className="relative flex-1 py-3 text-sm font-bold hover:bg-gray-50 transition-colors"
                >
                    <span className={activeTab === 'following' ? 'text-black' : 'text-gray-500'}>
                        Seguindo
                    </span>
                    {activeTab === 'following' && (
                        <motion.div
                            layoutId="home-navbar-indicator"
                            className="absolute bottom-0 left-0 right-0 h-[3px] bg-emerald-500 rounded-full w-14 mx-auto"
                        />
                    )}
                </button>
            </div>
        </div>
    );
}
