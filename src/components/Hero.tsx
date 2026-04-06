"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import CategoryTabs, { CATEGORIES, type CategoryId } from "./CategoryTabs";
import ResultsGrid from "./ResultsGrid";
import type { HotelResult } from "./SearchResultCard";
import type { ActivityResult } from "@/app/api/search-activities/route";
import { Sparkles, ArrowRight } from "lucide-react";
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
  "Analyse de votre demande par l'IA...",
  "Recherche des meilleures options...",
  "Vérification des disponibilités...",
  "Calcul du meilleur rapport qualité/prix...",
];

// ─── Animated background canvas ──────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      r: number; a: number; da: number;
    }> = [];

    function resize() {
      if (!canvas) return;
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * 2000, y: Math.random() * 1200,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.2,
        r: Math.random() * 1.5 + 0.3,
        a: Math.random(), da: Math.random() * 0.005 + 0.002,
      });
    }

    let raf = 0;
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        p.a = 0.2 + Math.sin(Date.now() * p.da) * 0.15;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.a * 0.6})`;
        ctx.fill();
      });

      // Connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${0.06 * (1 - d / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}

// ─── Main Hero ────────────────────────────────────────────────────────────────
export default function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryId>("magic");
  const [isSearching, setIsSearching] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);
  const [results, setResults] = useState<(HotelResult | ActivityResult)[] | null>(null);
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
        return; // Navigation handled by next/navigation
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
        <div className="sticky top-16 z-30 bg-background/90 backdrop-blur-xl border-b border-black/8 py-3 px-4">
          <div className="max-w-4xl mx-auto space-y-3">
            <form onSubmit={(e) => handleSearch(e)} className="flex items-center gap-3">
              <div className="flex-grow flex items-center bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-2.5 gap-3 focus-within:border-accent/40 transition-colors">
                <span className="text-lg flex-shrink-0">{currentCat?.emoji}</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-grow bg-transparent text-sm text-foreground placeholder-foreground/40 outline-none"
                  placeholder="Nouvelle recherche..."
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="btn-accent px-5 py-2.5 rounded-xl text-sm disabled:opacity-50"
              >
                {isSearching ? "..." : "Chercher"}
              </button>
              <button
                type="button"
                onClick={() => { setResults(null); setQuery(""); }}
                className="text-sm text-foreground/50 hover:text-foreground border border-foreground/10 px-4 py-2.5 rounded-xl transition"
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
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-accent/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-accent" />
              </div>
              <p className="text-foreground/60 font-medium animate-pulse">{LOADING_MSGS[msgIdx]}</p>
            </div>
          ) : (
            <>
              {results && (
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2 font-display">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse flex-shrink-0" />
                    {currentCat?.emoji} {results.length} résultat{results.length > 1 ? "s" : ""}
                    <span className="text-accent ml-1">«&nbsp;{query}&nbsp;»</span>
                  </h2>
                  <span className="text-xs text-foreground/40 bg-foreground/5 px-3 py-1.5 rounded-full">
                    IA Gemini
                  </span>
                </div>
              )}

              {visibleResults && (
                <ResultsGrid
                  results={visibleResults as HotelResult[]}
                  activityResults={activeCategory !== "hotels" ? visibleResults as ActivityResult[] : undefined}
                  isActivityMode={activeCategory !== "hotels"}
                />
              )}

              {/* Auth gate */}
              {hasHiddenResults && (
                <div className="relative mt-6">
                  <div className="blur-sm pointer-events-none select-none opacity-50 space-y-3">
                    {results!.slice(2).map((_, i) => (
                      <div key={i} className="bg-card border border-foreground/8 rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-32 h-24 skeleton rounded-xl flex-shrink-0" />
                        <div className="flex-grow space-y-2">
                          <div className="h-5 skeleton rounded w-3/4" />
                          <div className="h-4 skeleton rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-background via-background/70 to-transparent rounded-2xl">
                    <div className="bg-card border border-foreground/10 rounded-3xl p-8 shadow-2xl text-center max-w-sm mx-auto animate-scale-in">
                      <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🔓</span>
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2 font-display">
                        +{results!.length - 2} résultats masqués
                      </h3>
                      <p className="text-foreground/60 text-sm mb-6">
                        Créez votre compte gratuit pour accéder à tous les résultats, sauvegarder vos favoris et utiliser l&apos;IA complète.
                      </p>
                      <Link href={`/signup?redirect_url=${encodeURIComponent(window.location.pathname + window.location.search)}`}>
                        <button className="w-full btn-accent py-3.5 px-6 rounded-xl mb-3 text-sm">
                          🚀 Créer mon compte gratuit
                        </button>
                      </Link>
                      <div className="flex items-center justify-center gap-4 text-xs text-foreground/40">
                        <span>✓ Gratuit</span><span>·</span><span>✓ Sans CB</span><span>·</span><span>✓ 30 sec</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Hero view ─────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 noise-overlay">
        <div className="absolute inset-0 bg-gradient-to-br from-[#050508] via-[#0A1510] to-[#120808]" />
        {/* Animated 3D orbs */}
        <div className="orb orb-accent w-[600px] h-[500px] top-[10%] left-[20%]" style={{ animationDelay: '0s' }} />
        <div className="orb orb-forest w-[500px] h-[400px] bottom-[15%] right-[15%]" style={{ animationDelay: '-4s' }} />
        <div className="orb orb-accent w-[300px] h-[300px] top-[60%] left-[10%]" style={{ animationDelay: '-8s', opacity: 0.2 }} />
        <div className="orb orb-gold w-[200px] h-[200px] top-[20%] right-[25%]" style={{ animationDelay: '-6s', opacity: 0.15 }} />
        {/* Orbital ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/[0.03]">
          <div className="animate-orbit">
            <div className="w-2 h-2 rounded-full bg-accent/50 blur-[2px]" />
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-white/[0.02]">
          <div className="animate-orbit" style={{ animationDuration: '30s', animationDirection: 'reverse' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-forest-light/40 blur-[1px]" />
          </div>
        </div>
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* Particles */}
      <ParticleCanvas />

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 text-center pt-20 pb-12">
        {/* Badge */}
        <div className="inline-flex items-center gap-2.5 bg-white/[0.06] border border-white/[0.08] text-white/80 text-xs font-semibold px-5 py-2.5 rounded-full mb-8 animate-slide-up backdrop-blur-xl glow-accent-subtle">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
          </span>
          Propulsé par Gemini AI · Amadeus Production · 150 000+ options
        </div>

        {/* Headline */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          key={headline.line1}
        >
          <h1 className="font-display text-5xl md:text-7xl lg:text-[82px] font-extrabold text-white leading-[1.05] tracking-tight mb-4 drop-shadow-2xl">
            {headline.line1}
            <br />
            <span className="gradient-text text-glow">{headline.line2}</span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light"
        >
          {headline.sub}
        </motion.p>

        {/* Category tabs */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full mb-8 relative z-20"
        >
          <CategoryTabs
            active={activeCategory}
            onChange={(id) => { if (id === "flights") { router.push("/vols"); return; } setActiveCategory(id); setResults(null); }}
          />
        </motion.div>

        {/* Magic Search bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full max-w-3xl mx-auto relative z-30"
        >
          <motion.form
            onSubmit={(e) => handleSearch(e)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative flex items-center bg-white/[0.04] backdrop-blur-2xl border border-white/[0.1] rounded-2xl p-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 focus-within:border-accent/40 focus-within:shadow-[0_0_60px_-15px_rgba(232,101,42,0.4)] focus-within:bg-white/[0.08] overflow-hidden group"
          >
            {/* Shimmer effect inside search bar */}
            <div className="absolute inset-0 -translate-x-[150%] animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent pointer-events-none group-hover:translate-x-[150%] transition-transform duration-1000" />
            
            <div className="flex items-center flex-grow px-4 gap-4 relative z-10">
              {isSearching ? (
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin flex-shrink-0 drop-shadow-glow" />
              ) : (
                <Sparkles className="w-6 h-6 text-accent/80 flex-shrink-0 animate-pulse" />
              )}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isSearching}
                placeholder={currentCat?.placeholder || "Demandez-moi n'importe quoi..."}
                className="w-full bg-transparent text-white placeholder-white/40 text-lg md:text-xl py-4 flex-grow outline-none caret-accent font-medium tracking-wide"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="relative overflow-hidden btn-accent flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 transition-all hover:shadow-[0_0_20px_rgba(232,101,42,0.5)] group/btn"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 hidden sm:inline text-white">Créer la magie</span>
              <ArrowRight className="w-5 h-5 relative z-10 text-white group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </motion.form>

          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {CATEGORIES.slice(0, 5).map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  handleSearch(null, cat.placeholder);
                }}
                className="text-xs text-white/45 hover:text-white/80 border border-white/10 hover:border-white/25 px-3 py-1.5 rounded-full transition-all backdrop-blur-sm hover:bg-white/8"
              >
                {cat.emoji} {cat.placeholder.slice(0, 30)}...
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-10 mt-16 delay-400"
        >
          {[
            ["150 000+", "Hébergements", "🏨"],
            ["500+", "Compagnies aériennes", "✈️"],
            ["50 000+", "Activités", "🎯"],
            ["IA", "Gemini 2.0", "🧠"],
          ].map(([val, label, emoji]) => (
            <motion.div key={label} className="text-center group cursor-default">
              <div className="font-display text-2xl font-bold text-white group-hover:text-accent transition-colors duration-300">
                <span className="mr-1.5 opacity-60">{emoji}</span>{val}
              </div>
              <div className="text-xs text-white/35 mt-1 group-hover:text-white/50 transition-colors">{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent mx-auto" />
      </div>
    </div>
  );
}
