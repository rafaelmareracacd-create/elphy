"use client"

import { Bell, Settings, User } from "lucide-react"
import { motion } from "framer-motion"

export default function TopNavbar() {
    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-200 shadow-sm"
        >
            {/* Content */}
            <div className="h-full px-6 flex items-center justify-between">
                {/* Left: Logo or Title */}
                <div className="flex items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Elphy</h2>
                </div>

                {/* Right: Icons + Profile */}
                <div className="flex items-center gap-3">
                    {/* Notification Icon */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all group"
                    >
                        <Bell className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
                        {/* Notification badge */}
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                            3
                        </span>
                    </motion.button>

                    {/* Settings Icon */}
                    <motion.button
                        whileHover={{ scale: 1.05, rotate: 90 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring" as const, stiffness: 300 }}
                        className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all group"
                    >
                        <Settings className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
                    </motion.button>

                    {/* User Profile */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-3 pl-3 pr-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all shadow-sm"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900">Rafael Marera</span>
                            <span className="text-[10px] text-gray-500">Diplomata</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.nav>
    )
}
