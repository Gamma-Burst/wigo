"use client";

import { useState, useEffect } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import CategoryTabs, { CATEGORIES, type CategoryId } from "./CategoryTabs";
import ResultsGrid from "./ResultsGrid";
import type { HotelResult } from "./SearchResultCard";
import type { ActivityResult } from "@/app/api/search-activities/route";

const CATEGORY_HEADLINES: Record<string, { line1: string; line2: string }> = {
    hotels: { line1: "Trouvez votre hôtel", line2: "idéal en Europe" },
    hiking: { line1: "Explorez les plus beaux", line2: "sentiers d'Europe" },
    events: { line1: "Les meilleurs événements", line2: "près de chez vous" },
    restaurants: { line1: "La bonne table vous", line2: "attend en Europe" },
    culture: { line1: "Châteaux, musées &", line2: "trésors du patrimoine" },
    attractions: { line1: "Parcs & attractions", line2: "pour toute la famille" },
    nature: { line1: "Réserves, forêts &", line2: "espaces naturels" },
    markets: { line1: "Brocantes, marchés &", line2: "vide-greniers" },
};

const LOADING_MESSAGES = [
    "Analyse de votre demande par notre IA...",
    "Recherche des meilleurs résultats...",
    "Vérification des disponibilités...",
    "Calcul du meilleur rapport qualité/prix...",
];

export default function Hero() {
    const { isSignedIn } = useUser();
    const [query, setQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<CategoryId>("hotels");
    const [isSearching, setIsSearching] = useState(false);
    const [msgIdx, setMsgIdx] = useState(0);
    const [results, setResults] = useState<(HotelResult | ActivityResult)[] | null>(null);

    const currentCat = CATEGORIES.find(c => c.id === activeCategory);

    useEffect(() => {
        let t: NodeJS.Timeout;
        if (isSearching) t = setInterval(() => setMsgIdx(p => (p + 1) % LOADING_MESSAGES.length), 2000);
        return () => clearInterval(t);
    }, [isSearching]);

    const handleSearch = async (e: React.FormEvent | null, overrideQuery?: string) => {
        if (e) e.preventDefault();
        const q = overrideQuery || query;
        if (!q.trim()) return;
        if (overrideQuery) setQuery(overrideQuery);

        setIsSearching(true);
        setResults(null);
        setMsgIdx(0);

        try {
            if (activeCategory === "hotels") {
                const res = await fetch("/api/search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query: q }),
                });
                const data = await res.json();
                if (data.results) setResults(data.results);
            } else {
                const res = await fetch("/api/search-activities", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query: q, category: activeCategory }),
                });
                const data = await res.json();
                if (data.results) setResults(data.results);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    const visibleResults = isSignedIn ? results : results?.slice(0, 2);
    const hasHiddenResults = !isSignedIn && results && results.length > 2;

    return (
        <div className="relative overflow-hidden">
            {/* ===== HERO SECTION ===== */}
            {!results && (
                <div className="relative min-h-screen flex flex-col items-center justify-center text-center px-4">
                    {/* Background */}
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800" />
                        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px] -translate-y-1/2" />
                        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-forest/20 rounded-full blur-[100px] translate-y-1/2" />
                    </div>

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 text-accent text-sm font-semibold px-4 py-2 rounded-full mb-8">
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        IA Loisirs & Voyage — Europe
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] tracking-tight mb-4">
                        {CATEGORY_HEADLINES[activeCategory]?.line1 || "Explorez l'Europe"}
                        <br />
                        <span className="bg-gradient-to-r from-accent via-orange-400 to-amber-400 bg-clip-text text-transparent">
                            {CATEGORY_HEADLINES[activeCategory]?.line2 || "à votre façon"}
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-8">
                        Hôtels, randonnées, châteaux, brocantes, événements... Décrivez votre envie, notre IA trouve le bon plan.
                    </p>

                    {/* Category Tabs */}
                    <div className="w-full max-w-3xl mb-6">
                        <CategoryTabs active={activeCategory} onChange={(id) => { setActiveCategory(id); setResults(null); }} />
                    </div>

                    {/* Search bar */}
                    <div className="w-full max-w-3xl mx-auto">
                        <form onSubmit={(e) => handleSearch(e)}
                            className="flex flex-col md:flex-row items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 shadow-2xl shadow-black/40 gap-2">
                            <div className="flex items-center flex-grow w-full px-4 gap-3">
                                <svg className={`w-5 h-5 flex-shrink-0 ${isSearching ? "text-accent animate-spin" : "text-white/50"}`}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {isSearching
                                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />}
                                </svg>
                                <input
                                    type="text"
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    disabled={isSearching}
                                    placeholder={currentCat?.placeholder || "Décrivez votre envie..."}
                                    className="w-full bg-transparent text-white placeholder-white/40 text-base md:text-lg py-3 outline-none border-none focus:ring-0"
                                />
                            </div>
                            <button type="submit" disabled={isSearching || !query.trim()}
                                className="w-full md:w-auto bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-bold text-base px-8 py-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg flex-shrink-0">
                                {isSearching ? "Recherche..." : `${currentCat?.emoji} Explorer`}
                            </button>
                        </form>

                        {/* Quick suggestions */}
                        <div className="flex flex-wrap gap-2 justify-center mt-4">
                            {[currentCat?.placeholder || "", ...(CATEGORIES.filter(c => c.id !== activeCategory).slice(0, 3).map(c => c.placeholder))].filter(Boolean).slice(0, 4).map((s, i) => (
                                <button key={i} onClick={() => handleSearch(null, s)}
                                    className="text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-full transition-all duration-200 hover:bg-white/10">
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats bar */}
                    <div className="flex flex-wrap gap-8 justify-center mt-16">
                        {[["150 000+", "Hôtels"], ["50 000+", "Activités"], ["8", "Catégories"], ["24/7", "Support IA"]].map(([val, label]) => (
                            <div key={label} className="text-center">
                                <div className="text-2xl font-black text-white">{val}</div>
                                <div className="text-sm text-white/50">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ===== RESULTS SECTION ===== */}
            {(results || isSearching) && (
                <div className="min-h-screen bg-background">
                    {/* Mini search bar */}
                    <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-lg border-b border-foreground/10 py-3 px-4">
                        <div className="max-w-4xl mx-auto space-y-3">
                            <form onSubmit={(e) => handleSearch(e)} className="flex items-center gap-3">
                                <div className="flex-grow flex items-center bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-2.5 gap-3">
                                    <span>{currentCat?.emoji}</span>
                                    <input value={query} onChange={e => setQuery(e.target.value)}
                                        className="flex-grow bg-transparent text-sm text-foreground outline-none"
                                        placeholder="Nouvelle recherche..." />
                                </div>
                                <button type="submit" disabled={isSearching}
                                    className="bg-accent text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-accent/90 transition disabled:opacity-50">
                                    {isSearching ? "..." : "Chercher"}
                                </button>
                                <button type="button" onClick={() => { setResults(null); setQuery(""); }}
                                    className="text-sm text-foreground/50 hover:text-foreground border border-foreground/10 px-4 py-2.5 rounded-xl transition">
                                    ✕
                                </button>
                            </form>
                            <CategoryTabs active={activeCategory} onChange={(id) => { setActiveCategory(id); handleSearch(null, query); }} />
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 py-8">
                        {isSearching ? (
                            <div className="text-center py-20">
                                <div className="w-14 h-14 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-foreground/60 font-medium">{LOADING_MESSAGES[msgIdx]}</p>
                            </div>
                        ) : (
                            <>
                                {results && (
                                    <div className="mb-6 flex items-center justify-between">
                                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                                            {currentCat?.emoji} {results.length} résultat{results.length > 1 ? "s" : ""} — <span className="text-accent ml-1">&quot;{query}&quot;</span>
                                        </h2>
                                        <span className="text-xs text-foreground/40 bg-foreground/5 px-3 py-1.5 rounded-full">Résultats IA</span>
                                    </div>
                                )}

                                {visibleResults && (
                                    <ResultsGrid
                                        results={visibleResults as HotelResult[]}
                                        activityResults={activeCategory !== "hotels" ? visibleResults as ActivityResult[] : undefined}
                                        isActivityMode={activeCategory !== "hotels"}
                                    />
                                )}

                                {/* ===== AUTH GATE ===== */}
                                {hasHiddenResults && (
                                    <div className="relative mt-6">
                                        <div className="blur-sm pointer-events-none select-none opacity-60">
                                            {results!.slice(2).map((_, i) => (
                                                <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl p-5 mb-4 border border-foreground/10 flex items-center gap-4">
                                                    <div className="w-32 h-24 bg-foreground/10 rounded-xl flex-shrink-0" />
                                                    <div className="flex-grow space-y-2">
                                                        <div className="h-5 bg-foreground/10 rounded w-3/4" />
                                                        <div className="h-4 bg-foreground/10 rounded w-1/2" />
                                                    </div>
                                                    <div className="h-8 w-24 bg-foreground/10 rounded-xl flex-shrink-0" />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-background via-background/80 to-transparent rounded-2xl">
                                            <div className="bg-white dark:bg-zinc-900 border border-foreground/10 rounded-3xl p-8 shadow-2xl text-center max-w-sm mx-auto">
                                                <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                    <span className="text-3xl">🔓</span>
                                                </div>
                                                <h3 className="text-xl font-black text-foreground mb-2">+{results!.length - 2} résultats masqués</h3>
                                                <p className="text-foreground/60 text-sm mb-6">Créez votre compte gratuit pour tout voir, sauvegarder vos favoris et profiter de l&apos;IA complète.</p>
                                                <SignInButton mode="modal">
                                                    <button className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3.5 px-6 rounded-xl transition-all hover:scale-105 shadow-lg shadow-accent/30 mb-3">
                                                        🚀 Créer mon compte gratuit
                                                    </button>
                                                </SignInButton>
                                                <div className="flex items-center justify-center gap-4 text-xs text-foreground/40">
                                                    <span>✓ Gratuit</span><span>✓ Sans CB</span><span>✓ 30 sec</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
