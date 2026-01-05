import { motion } from 'framer-motion';
import { Settings, Bell, User } from 'lucide-react';

interface HomeNavbarProps {
    activeTab: 'foryou' | 'following';
    onTabChange: (tab: 'foryou' | 'following') => void;
    userProfile: any;
}

export default function HomeNavbarTest({ activeTab, onTabChange, userProfile }: HomeNavbarProps) {
    return (
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100/50">
            {/* Top Toolbar */}
            <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Avatar (Mobile/Quick Access) */}
                    <div className="w-8 h-8 rounded-full bg-emerald-50 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center text-emerald-600 border border-emerald-100">
                        {userProfile?.avatar_url ? (
                            <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="font-bold text-sm">
                                {userProfile?.full_name?.charAt(0) || <User size={16} />}
                            </div>
                        )}
                    </div>

                    <span className="font-black text-xl text-gray-900 tracking-tight hidden sm:block">Início</span>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:bg-gray-100 hover:text-emerald-600 rounded-full transition-colors relative group">
                        <Bell size={20} className="group-hover:fill-emerald-100" />
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-emerald-500 rounded-full border border-white"></span>
                    </button>
                    <button className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors">
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            {/* Tabs - Pill Style (Segmented Control) */}
            <div className="px-4 pb-3">
                <div className="flex p-1 bg-gray-100/80 rounded-xl relative border border-gray-200/50">
                    <button
                        onClick={() => onTabChange('foryou')}
                        className={`relative z-10 flex-1 py-1.5 text-sm font-bold transition-colors duration-200 ${activeTab === 'foryou' ? 'text-gray-900' : 'text-gray-500'}`}
                    >
                        <span>Para você</span>
                        {activeTab === 'foryou' && (
                            <motion.div
                                layoutId="home-navbar-pill"
                                className="absolute inset-0 bg-white rounded-lg shadow-sm border border-gray-100 -z-10"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                            />
                        )}
                    </button>

                    <button
                        onClick={() => onTabChange('following')}
                        className={`relative z-10 flex-1 py-1.5 text-sm font-bold transition-colors duration-200 ${activeTab === 'following' ? 'text-gray-900' : 'text-gray-500'}`}
                    >
                        <span>Seguindo</span>
                        {activeTab === 'following' && (
                            <motion.div
                                layoutId="home-navbar-pill"
                                className="absolute inset-0 bg-white rounded-lg shadow-sm border border-gray-100 -z-10"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                            />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
