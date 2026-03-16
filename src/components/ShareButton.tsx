"use client";

import { useState } from "react";
import { Share2, X, Copy, Check } from "lucide-react";

interface ShareModalProps {
    title: string;
    location: string;
    url: string;
}

const PLATFORMS = [
    {
        id: "facebook",
        label: "Facebook",
        color: "bg-[#1877F2] hover:bg-[#166FE5]",
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
        ),
        getUrl: (url: string, text: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
        action: "open",
    },
    {
        id: "instagram",
        label: "Instagram",
        color: "bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:opacity-90",
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
        ),
        getUrl: (_url: string, text: string) => `${text}`,
        action: "copy",
    },
    {
        id: "tiktok",
        label: "TikTok",
        color: "bg-black hover:bg-zinc-800",
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.28 6.28 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.23 8.23 0 004.84 1.56V6.79a4.85 4.85 0 01-1.07-.1z" />
            </svg>
        ),
        getUrl: (_url: string, text: string) => `${text}`,
        action: "copy",
    },
    {
        id: "youtube",
        label: "YouTube",
        color: "bg-[#FF0000] hover:bg-[#CC0000]",
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
        ),
        getUrl: (_url: string, text: string) => `${text}`,
        action: "copy",
    },
];

export function ShareButton({ title, location, url }: ShareModalProps) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    const caption = `✨ Découverte du jour : ${title}\n📍 ${location}\n\n🌍 Trouvé sur WIGO — la plateforme IA de voyage en Europe\n👉 ${url}\n\n#Voyage #Europe #WIGO #${location.split(",")[0].replace(/\s+/g, "")} #Belgique`;

    const handleShare = async (platform: typeof PLATFORMS[0]) => {
        if (platform.action === "open") {
            window.open(platform.getUrl(url, caption), "_blank", "width=600,height=400");
        } else {
            // Copy caption to clipboard for Instagram/TikTok/YouTube
            try {
                await navigator.clipboard.writeText(platform.getUrl(url, caption));
                setCopied(platform.id);
                setTimeout(() => setCopied(null), 2000);
            } catch {
                // fallback
                const ta = document.createElement("textarea");
                ta.value = caption;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand("copy");
                document.body.removeChild(ta);
                setCopied(platform.id);
                setTimeout(() => setCopied(null), 2000);
            }
        }
    };

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(url).catch(() => { });
        setCopied("link");
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-1.5 text-xs font-semibold text-foreground/50 hover:text-foreground transition-colors py-1 px-2 rounded-lg hover:bg-foreground/5"
                title="Partager"
            >
                <Share2 className="w-3.5 h-3.5" />
                Partager
            </button>

            {open && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

                    {/* Dropdown */}
                    <div className="absolute bottom-8 right-0 z-50 w-72 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-foreground/10 p-4 animate-in slide-in-from-bottom-2 duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="font-bold text-sm text-foreground">Partager</p>
                                <p className="text-xs text-foreground/40 truncate max-w-[180px]">{title}</p>
                            </div>
                            <button onClick={() => setOpen(false)} className="p-1 hover:bg-foreground/5 rounded-full">
                                <X className="w-4 h-4 text-foreground/40" />
                            </button>
                        </div>

                        {/* Platform buttons */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            {PLATFORMS.map(platform => (
                                <button
                                    key={platform.id}
                                    onClick={() => handleShare(platform)}
                                    className={`flex items-center gap-2 ${platform.color} text-white text-sm font-semibold px-3 py-2.5 rounded-xl transition-all active:scale-95`}
                                >
                                    {copied === platform.id ? (
                                        <Check className="w-4 h-4" />
                                    ) : platform.icon}
                                    <span className="text-xs">
                                        {copied === platform.id
                                            ? platform.action === "copy" ? "Copié !" : "Ouvert"
                                            : platform.action === "copy" ? `Copier pour ${platform.label}` : platform.label}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Copy link */}
                        <button
                            onClick={handleCopyLink}
                            className="w-full flex items-center justify-center gap-2 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-foreground/70 text-xs font-semibold px-4 py-2.5 rounded-xl transition"
                        >
                            {copied === "link" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            {copied === "link" ? "Lien copié !" : "Copier le lien"}
                        </button>

                        <p className="text-center text-xs text-foreground/30 mt-2.5">
                            💬 Un beau texte prêt à coller est copié pour Instagram et TikTok
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}

// Standalone share icon for use in headers
export function ShareIconButton({ title, location, url }: ShareModalProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const text = `✨ ${title} — ${location}\n🌍 Trouvé sur WIGO\n👉 ${url}`;
        if (navigator.share) {
            await navigator.share({ title, text, url }).catch(() => { });
        } else {
            await navigator.clipboard.writeText(url).catch(() => { });
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <button onClick={handleShare} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white text-sm font-semibold px-4 py-2 rounded-full transition">
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? "Copié !" : "Partager"}
        </button>
    );
}
