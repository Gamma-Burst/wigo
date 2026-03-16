"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin, Clock, Calendar, Star, Tag, ExternalLink, Sparkles, Mountain, Utensils, Info } from "lucide-react";

interface AIEnrichment {
    highlight: string;
    tips: string[];
    nearby: { name: string; type: string; distance: string }[];
}

const CATEGORY_EMOJIS: Record<string, string> = {
    hiking: "🥾", events: "🎪", restaurants: "🍽", culture: "🏰",
    attractions: "🎠", nature: "🌿", markets: "🛍", hotels: "🏨"
};

function ActivityDetailContent() {
    const searchParams = useSearchParams();
    const name = searchParams.get("name") || "";
    const category = searchParams.get("category") || "nature";
    const description = searchParams.get("description") || "";
    const address = searchParams.get("address") || "";
    const price = searchParams.get("price") || "";
    const img = searchParams.get("img") || "";
    const tags = searchParams.get("tags")?.split(",").filter(Boolean) || [];
    const openingHours = searchParams.get("openingHours") || "";
    const date = searchParams.get("date") || "";
    const duration = searchParams.get("duration") || "";
    const difficulty = searchParams.get("difficulty") || "";
    const ratingStr = searchParams.get("rating") || "4.3";
    const rating = parseFloat(ratingStr);

    const [aiData, setAiData] = useState<AIEnrichment | null>(null);
    const [loadingAI, setLoadingAI] = useState(true);

    useEffect(() => {
        async function enrichActivity() {
            try {
                const res = await fetch("/api/hotel-details", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ hotelName: name, location: address || "Belgique", category }),
                });
                const json = await res.json();
                setAiData({
                    highlight: json.whyWeRecommend || description,
                    tips: [json.gearTip, ...(json.radar?.hikes?.map((h: { name: string }) => h.name) || [])].filter(Boolean).slice(0, 4),
                    nearby: json.radar?.foodSpots?.slice(0, 3).map((s: { name: string; description: string }) => ({ name: s.name, type: "Lieu", distance: "à proximité" })) || [],
                });
            } catch {
                setAiData({
                    highlight: description,
                    tips: ["Réservez à l'avance en haute saison", "Vérifiez les horaires avant de partir", "Emportez de l'eau et de bonnes chaussures"],
                    nearby: [],
                });
            } finally {
                setLoadingAI(false);
            }
        }
        if (name) enrichActivity();
        else setLoadingAI(false);
    }, [name, address, category, description]);

    const mapQuery = encodeURIComponent(`${name} ${address}`);

    return (
        <main className="min-h-screen bg-background pb-24">
            {/* Hero */}
            <div className="relative h-[55vh] min-h-[400px] w-full">
                {img ? (
                    <Image src={img} alt={name} fill className="object-cover" priority />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-forest/40 to-accent/20 flex items-center justify-center text-8xl">
                        {CATEGORY_EMOJIS[category] || "🌍"}
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

                {/* Nav */}
                <div className="absolute top-0 w-full px-6 pt-6 z-10 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 bg-white/15 hover:bg-white/30 text-white px-4 py-2.5 rounded-full backdrop-blur-md border border-white/20 transition font-medium text-sm shadow-lg">
                        <ArrowLeft className="w-4 h-4" /> Retour
                    </Link>
                    <Image src="/logo-icon.png" alt="WIGO" width={44} height={44} className="w-11 h-11 object-contain drop-shadow" />
                </div>

                {/* Hero content */}
                <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 z-10">
                    <div className="max-w-5xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-accent text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4 shadow">
                            {CATEGORY_EMOJIS[category] || "🌍"} {category.charAt(0).toUpperCase() + category.slice(1)}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-2xl leading-tight mb-3">{name}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-white/80">
                            {address && <span className="flex items-center gap-1.5 text-sm"><MapPin className="w-4 h-4" />{address}</span>}
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`w-4 h-4 ${s <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-white/30"}`} />)}
                                <span className="ml-1 text-sm font-semibold">{rating.toFixed(1)}</span>
                            </div>
                            <span className="text-xl font-black text-accent">{price}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="max-w-5xl mx-auto px-6 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left: Main */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Meta chips */}
                        <div className="flex flex-wrap gap-3">
                            {openingHours && (
                                <div className="flex items-center gap-2 bg-foreground/5 border border-foreground/10 px-4 py-2.5 rounded-xl text-sm font-medium">
                                    <Clock className="w-4 h-4 text-accent" /> {openingHours}
                                </div>
                            )}
                            {date && (
                                <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 px-4 py-2.5 rounded-xl text-sm font-medium text-accent">
                                    <Calendar className="w-4 h-4" /> {date}
                                </div>
                            )}
                            {duration && (
                                <div className="flex items-center gap-2 bg-foreground/5 border border-foreground/10 px-4 py-2.5 rounded-xl text-sm font-medium">
                                    <Clock className="w-4 h-4 text-accent" /> {duration}
                                </div>
                            )}
                            {difficulty && (
                                <div className={`px-4 py-2.5 rounded-xl text-sm font-bold border ${difficulty === "Facile" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                                    difficulty === "Intermédiaire" ? "bg-amber-100 text-amber-800 border-amber-200" :
                                        "bg-red-100 text-red-800 border-red-200"
                                    }`}>
                                    <Mountain className="w-4 h-4 inline mr-1" />{difficulty}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="bg-white dark:bg-zinc-900 border border-foreground/10 rounded-2xl p-6">
                            <h2 className="font-bold text-lg text-foreground mb-3 flex items-center gap-2">
                                <Info className="w-5 h-5 text-accent" /> À propos
                            </h2>
                            <p className="text-foreground/70 leading-relaxed">{description}</p>
                        </div>

                        {/* AI Highlight */}
                        <div className="bg-gradient-to-br from-accent/10 to-forest/10 border border-accent/20 rounded-2xl p-6">
                            <h2 className="font-bold text-lg text-foreground mb-3 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-accent" /> Pourquoi WIGO recommande
                            </h2>
                            {loadingAI ? (
                                <div className="space-y-2">
                                    {[80, 60, 70].map((w, i) => <div key={i} className={`h-4 bg-foreground/10 rounded animate-pulse`} style={{ width: `${w}%` }} />)}
                                </div>
                            ) : (
                                <p className="text-foreground/70 leading-relaxed">{aiData?.highlight || description}</p>
                            )}
                        </div>

                        {/* Tips */}
                        {aiData?.tips && aiData.tips.length > 0 && (
                            <div className="bg-white dark:bg-zinc-900 border border-foreground/10 rounded-2xl p-6">
                                <h2 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                                    <Utensils className="w-5 h-5 text-accent" /> Conseils pratiques
                                </h2>
                                <ul className="space-y-3">
                                    {aiData.tips.map((tip, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-foreground/70">
                                            <span className="w-6 h-6 rounded-full bg-accent/10 text-accent font-bold flex items-center justify-center flex-shrink-0 text-xs">{i + 1}</span>
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Tags */}
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {tags.map(tag => (
                                    <span key={tag} className="flex items-center gap-1.5 text-sm bg-foreground/5 border border-foreground/10 text-foreground/70 px-3 py-1.5 rounded-full">
                                        <Tag className="w-3.5 h-3.5" /> {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Sidebar */}
                    <div className="space-y-5">
                        {/* Map */}
                        <div className="rounded-2xl overflow-hidden border border-foreground/10 shadow-sm">
                            <iframe
                                title="Carte"
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=2.5,49.5,6.5,51.5&layer=mapnik&marker=50.4,4.5`}
                                className="w-full h-48"
                                style={{ border: 0 }}
                            />
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-3 bg-white dark:bg-zinc-900 text-foreground/70 hover:text-accent text-sm font-medium transition border-t border-foreground/10"
                            >
                                Voir sur Google Maps <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>

                        {/* CTA Box */}
                        <div className="bg-gradient-to-br from-accent to-orange-600 rounded-2xl p-6 text-white text-center shadow-xl shadow-accent/30">
                            <div className="text-3xl font-black mb-1">{price}</div>
                            <p className="text-white/80 text-sm mb-4">par personne</p>
                            <a
                                href={`https://www.getyourguide.fr/s/?q=${encodeURIComponent(name + " " + address)}&partner_id=WIGO`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full block bg-white text-accent font-black py-3.5 rounded-xl hover:bg-white/90 transition text-sm shadow-lg mb-3"
                            >
                                🎫 Réserver via GetYourGuide
                            </a>
                            <p className="text-white/60 text-xs">Disponibilités vérifiées en temps réel</p>
                        </div>

                        {/* Share */}
                        <button
                            onClick={() => navigator.clipboard.writeText(window.location.href)}
                            className="w-full border border-foreground/20 text-foreground/70 hover:text-foreground py-3 rounded-xl text-sm font-medium transition"
                        >
                            📤 Partager cet endroit
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function ActivityPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" /></div>}>
            <ActivityDetailContent />
        </Suspense>
    );
}
