'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface DrawerProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    side?: 'left' | 'right'
    children: React.ReactNode
}

export default function Drawer({
    isOpen,
    onClose,
    title,
    side = 'left',
    children
}: DrawerProps) {

    const variants = {
        open: { x: 0 },
        closed: { x: side === 'left' ? '-100%' : '100%' }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
                        aria-hidden="true"
                    />

                    {/* Drawer Content */}
                    <motion.div
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={variants}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={`fixed inset-y-0 ${side === 'left' ? 'left-0' : 'right-0'} w-3/4 max-w-sm bg-white dark:bg-[#1E1E1E] shadow-2xl z-[70] flex flex-col`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                            {title && <h2 className="text-lg font-bold text-gray-800 dark:text-white">{title}</h2>}
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <X size={20} className="text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
