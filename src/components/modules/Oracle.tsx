"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askOracle } from "@/app/actions/oracle-actions";
import { cn } from "@/lib/utils";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
};

export default function OracleModule() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "Greetings, Traveler. I am The Oracle. How may I assist your intellectual journey today?"
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await askOracle(userMsg.content);
            const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: response };
            setMessages((prev) => [...prev, aiMsg]);
        } catch (error) {
            console.error(error);
            // Error handling is implicitly handled by the server action returning an error message if needed
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] border rounded-lg shadow-2xl bg-slate-950 overflow-hidden relative">
            {/* Header */}
            <div className="p-4 border-b border-primary/20 bg-slate-900/50 flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                    <Bot className="w-5 h-5 text-primary animate-pulse" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        The Oracle <span className="text-xs font-normal text-muted-foreground border border-white/10 px-2 py-0.5 rounded-full">Beta v1.0</span>
                    </h2>
                    <p className="text-xs text-muted-foreground">Neural Link Active</p>
                </div>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className={cn(
                                "flex w-full",
                                msg.role === "user" ? "justify-end" : "justify-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "max-w-[80%] p-3 rounded-2xl shadow-sm text-sm leading-relaxed",
                                    msg.role === "user"
                                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                                        : "bg-slate-800/80 text-slate-100 border border-white/5 rounded-tl-sm backdrop-blur-sm"
                                )}
                            >
                                {msg.role === "assistant" && (
                                    <div className="flex items-center gap-2 mb-1 text-xs text-primary/80 font-mono opacity-70">
                                        <Sparkles className="w-3 h-3" /> Oracle Insight
                                    </div>
                                )}
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start w-full"
                    >
                        <div className="bg-slate-800/50 p-3 rounded-2xl rounded-tl-sm text-xs text-muted-foreground flex items-center gap-2">
                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-900/50 border-t border-white/5">
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask the Oracle..."
                        className="bg-slate-950 border-white/10 text-white focus-visible:ring-primary/50 placeholder:text-slate-500"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.5)] transition-all"
                    >
                        <Send className="w-4 h-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </div>
        </div>
    );
}
