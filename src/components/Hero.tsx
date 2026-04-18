"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import CategoryTabs, { CATEGORIES, type CategoryId } from "./CategoryTabs";
import ResultsGrid from "./ResultsGrid";
import type { HotelResult } from "./SearchResultCard";
import type { ActivityResult } from "@/app/api/search-activities/route";
import type { EnhancedHotelResult } from "@/services/hotel-provider";
import HotelModal from "./HotelModal";
import { ArrowRight, Search } from "lucide-react";
import { motion } from "framer-motion";

// ─── Category headlines ───────────────────────────────────────────────────────
const HEADLINES: Record<string, { line1: string; line2: string; sub: string }> = {
  magic:       { line1: "Votre évasion", line2: "créée par l'IA", sub: "Décrivez l'escapade de vos rêves. WIGO assemble le vol, l'hôtel et l'activité parfaite en un clin d'œil." },
  hotels:      { line1: "L'hôtel parfait,", line2: "trouvé en 3 secondes", sub: "Décrivez votre envie, l'IA trouve le bon plan parmi 150 000 hébergements." },
  flights:     { line1: "Le vol idéal,", line2: "au meilleur prix", sub: "Comparez toutes les compagnies aériennes en temps réel avec Amadeus." },
  hiking:      { line1: "Les plus beaux sentiers", line2: "d'Europe vous attendent", sub: "Randonnées guidées par l'IA selon votre niveau et votre région." },
  events:      { line1: "Les événements", line2: "que vous ne manquerez pas", sub: "Festivals, marchés médiévaux, fêtes locales — tout ce qui se passe près de vous." },
  restaurants: { line1: "La meilleure table", line2: "est juste à côté", sub: "De la gastronomie étoilée aux adresses secrètes des locaux." },
  culture:     { line1: "Châteaux, musées", line2: "et trésors cachés", sub: "Le patrimoine européen comme vous ne l'avez jamais exploré." },
  attractions: { line1: "Des expériences", line2: "mémorables en famille", sub: "Parcs, aventures, découvertes — tout pour créer des souvenirs inoubliables." },
  nature:      { line1: "Forêts, fagnes", line2: "et espaces sauvages", sub: "Les plus beaux espaces naturels d'Europe, sélectionnés par notre IA." },
  markets:     { line1: "Brocantes, marchés", line2: "et pépites vintage", sub: "Les meilleurs vide-greniers et marchés artisanaux de la région." },
};

const LOADING_MSGS = [
  "Analyse de votre demande par l'IA…",
  "Recherche des meilleures options…",
  "Vérification des disponibilités…",
  "Calcul du meilleur rapport qualité/prix…",
];

const EASE_SPRING: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EASE_OUT_STRONG: [number, number, number, number] = [0.23, 1, 0.32, 1];

// ─── Main Hero ────────────────────────────────────────────────────────────────
export default function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryId>("magic");
  const [isSearching, setIsSearching] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);
  const [results, setResults] = useState<(HotelResult | ActivityResult)[] | null>(null);
  const [selectedHotelDetails, setSelectedHotelDetails] = useState<EnhancedHotelResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setIsSignedIn(!!user));
    
    // Restaurer la recherche précédente si elle existe
    try {
      const savedQuery = sessionStorage.getItem('wigo_search_query');
      const savedCategory = sessionStorage.getItem('wigo_search_category');
      const savedResults = sessionStorage.getItem('wigo_search_results');
      
      if (savedQuery) setQuery(savedQuery);
      if (savedCategory) setActiveCategory(savedCategory as CategoryId);
      if (savedResults) setResults(JSON.parse(savedResults));
    } catch (e) {
      console.error(e);
    }
  }, [supabase.auth]);

  // Sauvegarder la recherche pour ne pas la perdre lors de la connexion
  useEffect(() => {
    sessionStorage.setItem('wigo_search_query', query);
    sessionStorage.setItem('wigo_search_category', activeCategory);
    if (results) {
      sessionStorage.setItem('wigo_search_results', JSON.stringify(results));
    } else {
      sessionStorage.removeItem('wigo_search_results');
    }
  }, [query, activeCategory, results]);

  const currentCat = CATEGORIES.find((c) => c.id === activeCategory);
  const headline = HEADLINES[activeCategory] || HEADLINES.hotels;

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (isSearching) t = setInterval(() => setMsgIdx((p) => (p + 1) % LOADING_MSGS.length), 2000);
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
      if (activeCategory === "magic") {
        router.push("/package?q=" + encodeURIComponent(q));
        return;
      } else if (activeCategory === "hotels") {
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

  // ── Results view ──────────────────────────────────────────────────────────
  if (results || isSearching) {
    return (
      <div className="min-h-screen bg-background">
        {/* Sticky mini search */}
        <div className="sticky top-20 z-30 bg-background/90 backdrop-blur-xl border-b border-[var(--border)] py-3 px-4">
          <div className="max-w-4xl mx-auto space-y-3">
            <form onSubmit={(e) => handleSearch(e)} className="flex items-center gap-3">
              <div className="flex-grow flex items-center bg-foreground/[0.03] border border-[var(--border)] rounded-xl px-4 py-2.5 gap-3 focus-within:border-accent/40 focus-within:shadow-input-focus transition-all duration-200" style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
                <span className="text-lg flex-shrink-0">{currentCat?.emoji}</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-grow bg-transparent text-sm text-foreground placeholder-foreground/35 outline-none"
                  placeholder="Nouvelle recherche…"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="btn-accent px-5 py-2.5 rounded-xl text-sm disabled:opacity-50"
              >
                {isSearching ? "…" : "Chercher"}
              </button>
              <button
                type="button"
                onClick={() => { setResults(null); setQuery(""); }}
                className="text-sm text-foreground/40 hover:text-foreground border border-[var(--border)] px-4 py-2.5 rounded-xl transition-colors duration-200 active:scale-[0.97]"
              >
                ✕
              </button>
            </form>
            <CategoryTabs
              active={activeCategory}
              onChange={(id) => { setActiveCategory(id); handleSearch(null, query); }}
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {isSearching ? (
            <div className="text-center py-24">
              <div className="relative w-12 h-12 mx-auto mb-6">
                <div className="absolute inset-0 border-2 border-accent/15 rounded-full" />
                <div className="absolute inset-0 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <Search className="absolute inset-0 m-auto w-5 h-5 text-accent/60" />
              </div>
              <p className="text-foreground-soft text-sm font-medium">{LOADING_MSGS[msgIdx]}</p>
            </div>
          ) : (
            <>
              {results && (
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                    {currentCat?.emoji} {results.length} résultat{results.length > 1 ? "s" : ""}
                    <span className="text-accent ml-1 font-display italic">«&nbsp;{query}&nbsp;»</span>
                  </h2>
                  <span className="eyebrow">
                    IA Gemini
                  </span>
                </div>
              )}

              {visibleResults && (
                <ResultsGrid
                  results={visibleResults as HotelResult[]}
                  activityResults={activeCategory !== "hotels" ? visibleResults as ActivityResult[] : undefined}
                  isActivityMode={activeCategory !== "hotels"}
                  onBookHotel={(hotel) => setSelectedHotelDetails(hotel as EnhancedHotelResult)}
                />
              )}

              {/* Auth gate */}
              {hasHiddenResults && (
                <div className="relative mt-6">
                  <div className="blur-sm pointer-events-none select-none opacity-50 space-y-3">
                    {results!.slice(2).map((_, i) => (
                      <div key={i} className="bg-card border border-[var(--border)] rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-32 h-24 skeleton rounded-xl flex-shrink-0" />
                        <div className="flex-grow space-y-2">
                          <div className="h-5 skeleton rounded w-3/4" />
                          <div className="h-4 skeleton rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-background via-background/70 to-transparent rounded-2xl">
                    <div className="bg-card border border-[var(--border)] rounded-2xl p-8 shadow-card-hover text-center max-w-sm mx-auto animate-scale-in">
                      <div className="w-12 h-12 bg-accent-subtle rounded-xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-xl">🔓</span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2 font-display">
                        +{results!.length - 2} résultats masqués
                      </h3>
                      <p className="text-foreground-soft text-sm mb-6 max-w-[45ch] mx-auto">
                        Créez votre compte gratuit pour accéder à tous les résultats, sauvegarder vos favoris et utiliser l&apos;IA complète.
                      </p>
                      <Link href={`/signup?redirect_url=${encodeURIComponent(window.location.pathname + window.location.search)}`}>
                        <button className="w-full btn-accent py-3 px-6 rounded-xl mb-3 text-sm">
                          Créer mon compte gratuit
                        </button>
                      </Link>
                      <div className="flex items-center justify-center gap-4 text-xs text-foreground/35">
                        <span>✓ Gratuit</span><span>·</span><span>✓ Sans CB</span><span>·</span><span>✓ 30 sec</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <HotelModal 
          isOpen={!!selectedHotelDetails} 
          hotel={selectedHotelDetails} 
          onClose={() => setSelectedHotelDetails(null)} 
        />
      </div>
    );
  }

  // ── Hero view — Editorial Luxury ─────────────────────────────────────────
  return (
    <div className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Background — warm editorial gradient, no particles */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-background" />
        {/* Subtle warm radial glow */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 40%, oklch(0.85 0.04 38 / 0.3), transparent)'
          }}
        />
        {/* Secondary tinted radial */}
        <div 
          className="absolute inset-0 opacity-25"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 75% 60%, oklch(0.8 0.03 160 / 0.2), transparent)'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center pt-12 pb-8">
        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_SPRING }}
        >
          <span className="eyebrow mb-8 inline-flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
            </span>
            Propulsé par Gemini AI · Amadeus · 150 000+ options
          </span>
        </motion.div>

        {/* Headline — Variable Serif, solid color */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: EASE_OUT_STRONG }}
          key={headline.line1}
        >
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-bold text-foreground leading-[1.08] tracking-tight mb-5 mt-6">
            {headline.line1}
            <br />
            <span className="text-accent">{headline.line2}</span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: EASE_OUT_STRONG }}
          className="text-foreground-soft text-base sm:text-lg max-w-[55ch] mx-auto mb-10 leading-relaxed"
        >
          {headline.sub}
        </motion.p>

        {/* Category tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease: EASE_SPRING }}
          className="w-full mb-7 relative z-20"
        >
          <CategoryTabs
            active={activeCategory}
            onChange={(id) => { if (id === "flights") { router.push("/vols"); return; } setActiveCategory(id); setResults(null); }}
          />
        </motion.div>

        {/* Search bar — clean, no glassmorphism */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45, ease: EASE_SPRING }}
          className="w-full max-w-2xl mx-auto relative z-30"
        >
          <form
            onSubmit={(e) => handleSearch(e)}
            className="relative flex items-center bg-card border border-[var(--border-strong)] rounded-2xl p-2 shadow-card-rest transition-all duration-300 focus-within:border-accent/30 focus-within:shadow-input-focus"
            style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
          >
            <div className="flex items-center flex-grow px-4 gap-3">
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-accent/40 border-t-accent rounded-full animate-spin flex-shrink-0" />
              ) : (
                <Search className="w-5 h-5 text-foreground/30 flex-shrink-0" />
              )}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isSearching}
                placeholder={currentCat?.placeholder || "Demandez-moi n'importe quoi…"}
                className="w-full bg-transparent text-foreground placeholder-foreground/35 text-base py-3.5 flex-grow outline-none font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="btn-accent flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 active:scale-[0.97] transition-transform duration-150"
            >
              <span className="hidden sm:inline">Rechercher</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-2 justify-center mt-5">
            {CATEGORIES.slice(0, 4).map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.55 + i * 0.05, ease: EASE_SPRING }}
                onClick={() => {
                  setActiveCategory(cat.id);
                  handleSearch(null, cat.placeholder);
                }}
                className="text-xs text-foreground/40 hover:text-foreground/70 border border-[var(--border)] hover:border-[var(--border-strong)] px-3 py-1.5 rounded-full transition-all duration-200 hover:bg-foreground/[0.03] active:scale-[0.97]"
                style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
              >
                {cat.emoji} {cat.placeholder.slice(0, 28)}…
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Stats — clean editorial, no emoji */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 mt-16"
        >
          {[
            ["150 000+", "Hébergements"],
            ["500+", "Compagnies"],
            ["50 000+", "Activités"],
            ["IA", "Gemini 2.0"],
          ].map(([val, label], i) => (
            <motion.div 
              key={label} 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.75 + i * 0.05, ease: EASE_SPRING }}
              className="text-center"
            >
              <div className="font-display text-xl sm:text-2xl font-bold text-foreground">
                {val}
              </div>
              <div className="text-xs text-foreground/30 mt-1 font-medium tracking-wide uppercase">{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator — refined */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="w-px h-8 bg-gradient-to-b from-foreground/15 to-transparent mx-auto" />
      </motion.div>
    </div>
  );
}
