"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import CategoryTabs, { CATEGORIES, type CategoryId } from "./CategoryTabs";
import ResultsGrid from "./ResultsGrid";
import type { HotelResult } from "./SearchResultCard";
import type { ActivityResult } from "@/app/api/search-activities/route";
import { Search, Sparkles, ArrowRight } from "lucide-react";

// ─── Category headlines ───────────────────────────────────────────────────────
const HEADLINES: Record<string, { line1: string; line2: string; sub: string }> = {
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
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryId>("hotels");
  const [isSearching, setIsSearching] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);
  const [results, setResults] = useState<(HotelResult | ActivityResult)[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
                      <SignInButton mode="modal">
                        <button className="w-full btn-accent py-3.5 px-6 rounded-xl mb-3 text-sm">
                          🚀 Créer mon compte gratuit
                        </button>
                      </SignInButton>
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
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0F1E17] to-[#1A0A05]" />
        {/* Accent glow */}
        <div className="absolute top-1/4 left-1/3 w-[700px] h-[500px] bg-accent/15 rounded-full blur-[120px] -translate-x-1/2" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[400px] bg-forest/20 rounded-full blur-[100px]" />
        <div className="absolute top-3/4 left-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[80px]" />
      </div>

      {/* Particles */}
      <ParticleCanvas />

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 text-center pt-20 pb-12">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 text-white/80 text-xs font-semibold px-4 py-2 rounded-full mb-8 animate-slide-up backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Propulsé par Gemini AI · Amadeus · 150 000+ options en Europe
        </div>

        {/* Headline */}
        <div className="animate-slide-up delay-100">
          <h1 className="font-display text-5xl md:text-7xl lg:text-[82px] font-extrabold text-white leading-[1.05] tracking-tight mb-4">
            {headline.line1}
            <br />
            <span className="gradient-text">{headline.line2}</span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-white/55 text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-slide-up delay-200 leading-relaxed">
          {headline.sub}
        </p>

        {/* Category tabs */}
        <div className="w-full mb-6 animate-slide-up delay-200">
          <CategoryTabs
            active={activeCategory}
            onChange={(id) => { if (id === "flights") { router.push("/vols"); return; } setActiveCategory(id); setResults(null); }}
          />
        </div>

        {/* Search bar */}
        <div className="w-full max-w-3xl mx-auto animate-slide-up delay-300">
          <form
            onSubmit={(e) => handleSearch(e)}
            className="relative flex items-center bg-white/10 backdrop-blur-2xl border border-white/18 rounded-2xl p-2 shadow-2xl shadow-black/30"
          >
            <div className="flex items-center flex-grow px-3 gap-3">
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin flex-shrink-0" />
              ) : (
                <Search className="w-5 h-5 text-white/40 flex-shrink-0" />
              )}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isSearching}
                placeholder={currentCat?.placeholder || "Décrivez votre envie..."}
                className="w-full bg-transparent text-white placeholder-white/35 text-base md:text-lg py-3 outline-none caret-accent"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="btn-accent flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              <span>{currentCat?.emoji}</span>
              <span className="hidden sm:inline">Explorer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

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
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-16 animate-slide-up delay-400">
          {[
            ["150 000+", "Hébergements"],
            ["500+", "Compagnies aériennes"],
            ["50 000+", "Activités"],
            ["IA", "Gemini 2.0"],
          ].map(([val, label]) => (
            <div key={label} className="text-center">
              <div className="font-display text-2xl font-bold text-white">{val}</div>
              <div className="text-xs text-white/40 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent mx-auto" />
      </div>
    </div>
  );
}
