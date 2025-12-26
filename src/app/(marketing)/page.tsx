import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export default function MarketingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Header */}
            <header className="px-6 py-4 flex items-center justify-between border-b">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <div className="bg-primary text-primary-foreground p-1 rounded-lg">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    Study42
                </div>
                <nav className="flex gap-4">
                    <Link href="/login">
                        <Button variant="ghost">Login</Button>
                    </Link>
                    <Link href="/dashboard">
                        <Button>Get Started</Button>
                    </Link>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-8 max-w-4xl mx-auto">
                <div className="space-y-4">
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                        Powered by Gemini 1.5 Pro
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                        Master Your Studies with AI Prediction
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Study42 uses advanced AI to predict exam trends, organize your materials, and optimize your schedule. Stop guessing, start knowing.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/dashboard">
                        <Button size="lg" className="gap-2 h-12 px-8 text-lg">
                            Enter Dashboard <ArrowRight className="w-5 h-5" />
                        </Button>
                    </Link>
                    <Link href="/#features">
                        <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
                            Learn More
                        </Button>
                    </Link>
                </div>

                {/* Feature Grid Preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full text-left">
                    <div className="p-6 border rounded-xl bg-card shadow-sm">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">🎯 Smart Planner</h3>
                        <p className="text-sm text-muted-foreground">Adaptive scheduling based on your performance.</p>
                    </div>
                    <div className="p-6 border rounded-xl bg-card shadow-sm">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">🔮 Oracle Predictions</h3>
                        <p className="text-sm text-muted-foreground">AI analysis of exam trends and high-yield topics.</p>
                    </div>
                    <div className="p-6 border rounded-xl bg-card shadow-sm">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">🧠 Anki Integration</h3>
                        <p className="text-sm text-muted-foreground">Seamless flashcard syncing for spaced repetition.</p>
                    </div>
                </div>
            </main>

            <footer className="py-6 text-center text-sm text-muted-foreground border-t">
                © 2025 Study42 EdTech. All rights reserved.
            </footer>
        </div>
    );
}
