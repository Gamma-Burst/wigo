"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Bot, ChevronDown } from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

const SUGGESTED_QUESTIONS = [
    "Quel est le meilleur moment pour visiter les Ardennes ?",
    "Château médiéval insolite à moins de 2h de Bruxelles ?",
    "Rando facile avec vue panoramique en Belgique ?",
    "Brocante rare ce weekend près de Namur ?",
];

export default function AIChat() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Bonjour ! Je suis **WigoAI**, votre expert loisirs & voyage en Europe 🌍\n\nJe connais des endroits secrets, des bons plans rares et des conseils que vous ne trouverez nulle part ailleurs. Que puis-je faire pour vous ?",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [unread, setUnread] = useState(0);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            setUnread(0);
            setTimeout(() => inputRef.current?.focus(), 200);
        }
    }, [open, messages]);

    const sendMessage = async (text?: string) => {
        const content = text || input.trim();
        if (!content || loading) return;

        const userMsg: Message = { role: "user", content };
        const newMessages = [...messages, userMsg];

        setMessages(newMessages);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages }),
            });
            const data = await res.json();
            const assistantMsg: Message = { role: "assistant", content: data.reply };
            setMessages((prev) => [...prev, assistantMsg]);
            if (!open) setUnread((n) => n + 1);
        } catch {
            setMessages((prev) => [...prev, { role: "assistant", content: "Désolé, je rencontre un problème. Réessayez dans un instant ! 🙏" }]);
        } finally {
            setLoading(false);
        }
    };

    const formatMessage = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\n/g, "<br/>");
    };

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setOpen(true)}
                className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-gradient-to-br from-accent to-orange-600 text-white font-bold px-5 py-3.5 rounded-full shadow-2xl shadow-accent/40 hover:shadow-accent/60 hover:scale-105 active:scale-95 transition-all duration-200 ${open ? "hidden" : "flex"}`}
            >
                <Sparkles className="w-5 h-5" />
                <span className="text-sm">WigoAI</span>
                {unread > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center">
                        {unread}
                    </span>
                )}
            </button>

            {/* Chat panel */}
            {open && (
                <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[400px] h-[600px] sm:h-[560px] flex flex-col bg-white dark:bg-zinc-900 sm:rounded-3xl shadow-2xl border border-foreground/10 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-accent to-orange-600 text-white flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-black text-base leading-tight">WigoAI</div>
                                <div className="text-white/70 text-xs flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                                    Expert loisirs Europe
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition">
                            <ChevronDown className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-grow overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                {msg.role === "assistant" && (
                                    <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                                        <Sparkles className="w-3.5 h-3.5 text-accent" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                                            ? "bg-accent text-white rounded-br-sm"
                                            : "bg-foreground/5 text-foreground rounded-bl-sm border border-foreground/10"
                                        }`}
                                    dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                                />
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mr-2">
                                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                                </div>
                                <div className="bg-foreground/5 border border-foreground/10 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                                    {[0, 1, 2].map((i) => (
                                        <span key={i} className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Suggested questions (only at start) */}
                        {messages.length === 1 && !loading && (
                            <div className="space-y-2 pt-1">
                                <p className="text-xs text-foreground/40 text-center font-medium">Suggestions rapides</p>
                                {SUGGESTED_QUESTIONS.map((q) => (
                                    <button
                                        key={q}
                                        onClick={() => sendMessage(q)}
                                        className="w-full text-left text-xs bg-foreground/5 hover:bg-accent/10 hover:text-accent border border-foreground/10 hover:border-accent/30 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-foreground/70"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className="px-4 py-3 border-t border-foreground/10 flex-shrink-0">
                        <div className="flex items-center gap-2 bg-foreground/5 border border-foreground/10 rounded-2xl px-4 py-2.5 focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/20 transition">
                            <input
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                                placeholder="Posez votre question..."
                                disabled={loading}
                                className="flex-grow bg-transparent text-sm text-foreground placeholder-foreground/40 outline-none"
                            />
                            <button
                                onClick={() => sendMessage()}
                                disabled={!input.trim() || loading}
                                className="w-8 h-8 flex items-center justify-center bg-accent disabled:opacity-40 text-white rounded-full hover:bg-accent/90 transition flex-shrink-0"
                            >
                                <Send className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <p className="text-center text-xs text-foreground/30 mt-2">Propulsé par Gemini IA · WIGO</p>
                    </div>
                </div>
            )}

            {/* Backdrop on mobile */}
            {open && (
                <div className="fixed inset-0 bg-black/40 z-40 sm:hidden" onClick={() => setOpen(false)} />
            )}

            {/* Close button for panel (X in corner) */}
            {open && (
                <button onClick={() => setOpen(false)} className="hidden sm:flex fixed bottom-[590px] right-[420px] z-50 w-8 h-8 items-center justify-center bg-white dark:bg-zinc-800 rounded-full shadow-lg border border-foreground/10 hover:bg-foreground/5 transition">
                    <X className="w-4 h-4 text-foreground/60" />
                </button>
            )}
        </>
    );
}
