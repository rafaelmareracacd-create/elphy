import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Target, TrendingUp } from "lucide-react";

export default function MarketingPage() {
    return (
        <div className="relative flex flex-col min-h-screen">
            {/* Video Background */}
            <div className="fixed inset-0 w-full h-full overflow-hidden -z-10">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute top-0 left-0 w-full h-full object-cover"
                >
                    <source src="/video.mp4" type="video/mp4" />
                </video>
                {/* Dark overlay for readability */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
            </div>

            {/* Header */}
            <header className="px-6 py-4 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md p-1.5">
                        <Image
                            src="/logo.png"
                            alt="Elphy"
                            width={32}
                            height={32}
                            className="object-contain"
                        />
                    </div>
                    <span className="text-white">Elphy</span>
                </div>
                <nav className="flex gap-4">
                    <Link href="/login">
                        <Button variant="ghost" className="text-white/90 hover:text-white hover:bg-white/10">Login</Button>
                    </Link>
                    <Link href="/dashboard">
                        <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg">
                            Get Started
                        </Button>
                    </Link>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-8 max-w-4xl mx-auto">
                <div className="space-y-4">
                    <div className="inline-flex items-center rounded-full border border-emerald-300/50 bg-emerald-500/20 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-emerald-100">
                        Powered by Gemini 2.5 Flash
                    </div>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-2xl">
                        Master Your Studies with AI Prediction
                    </h1>
                    <p className="text-xl text-gray-100 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
                        Elphy uses advanced AI to predict exam trends, organize your materials, and optimize your schedule. Like an elephant, never forget what you've learned.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/dashboard">
                        <Button size="lg" className="gap-2 h-14 px-8 text-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-xl">
                            Enter Dashboard <ArrowRight className="w-5 h-5" />
                        </Button>
                    </Link>
                    <Link href="/#features">
                        <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm">
                            Learn More
                        </Button>
                    </Link>
                </div>

                {/* Feature Grid Preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full text-left">
                    <div className="p-6 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md shadow-xl hover:bg-white/10 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center mb-4">
                            <Target className="w-6 h-6 text-emerald-300" />
                        </div>
                        <h3 className="font-semibold text-white mb-2 text-lg">Smart Planner</h3>
                        <p className="text-sm text-gray-300">Adaptive scheduling based on your performance.</p>
                    </div>
                    <div className="p-6 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md shadow-xl hover:bg-white/10 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 backdrop-blur-sm flex items-center justify-center mb-4">
                            <TrendingUp className="w-6 h-6 text-blue-300" />
                        </div>
                        <h3 className="font-semibold text-white mb-2 text-lg">Oracle Predictions</h3>
                        <p className="text-sm text-gray-300">AI analysis of exam trends and high-yield topics.</p>
                    </div>
                    <div className="p-6 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md shadow-xl hover:bg-white/10 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 backdrop-blur-sm flex items-center justify-center mb-4">
                            <Brain className="w-6 h-6 text-purple-300" />
                        </div>
                        <h3 className="font-semibold text-white mb-2 text-lg">Spaced Repetition</h3>
                        <p className="text-sm text-gray-300">Anki-style reviews optimized for long-term retention.</p>
                    </div>
                </div>

                {/* Elephant Memory Statement */}
                <div className="mt-8 p-6 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border-2 border-emerald-400/30 backdrop-blur-md rounded-2xl max-w-2xl shadow-2xl">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-4xl">🐘</span>
                        <h3 className="font-bold text-white text-xl">Never Forget What Matters</h3>
                    </div>
                    <p className="text-gray-100 leading-relaxed">
                        Just like elephants have incredible memory that lasts a lifetime, Elphy ensures your knowledge sticks. Our AI-powered spaced repetition adapts to your learning pattern, making sure important concepts stay fresh in your mind.
                    </p>
                </div>
            </main>

            <footer className="py-6 text-center text-sm text-gray-300 border-t border-white/10 bg-black/20 backdrop-blur-md">
                © 2025 Elphy EdTech. All rights reserved.
            </footer>
        </div>
    );
}
