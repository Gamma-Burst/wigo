"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import FlightSearchForm from "@/components/FlightSearchForm";
import FlightResultCard, { type FlightResult } from "@/components/FlightResultCard";

type SortKey = "price" | "duration" | "stops";

export default function VolsPage() {
  const [results, setResults] = useState<FlightResult[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMeta, setSearchMeta] = useState<{ origin: string; destination: string; departDate: string } | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("price");
  const [filterStops, setFilterStops] = useState<number | null>(null);

  const handleSearch = async (params: {
    origin: string;
    destination: string;
    departDate: string;
    returnDate?: string;
    adults: number;
    cabin: string;
  }) => {
    setIsSearching(true);
    setResults(null);
    setSearchMeta({ origin: params.origin, destination: params.destination, departDate: params.departDate });

    try {
      const res = await fetch("/api/flights/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data.results) setResults(data.results);
      else setResults([]);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Sort & filter
  const sortedResults = results ? [...results]
    .filter(f => filterStops === null || f.stops === filterStops)
    .sort((a, b) => {
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "stops") return a.stops - b.stops;
      // duration: parse "5h30" format
      const parseDur = (d: string) => { const m = d.match(/(\d+)h(\d+)/); return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : 999; };
      return parseDur(a.duration) - parseDur(b.duration);
    }) : null;

  const minPrice = results?.length ? Math.min(...results.map(f => f.price)) : 0;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hero background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0F1E17] to-[#1A0A05]" />
        <div className="absolute top-1/4 left-1/3 w-[700px] h-[500px] bg-accent/15 rounded-full blur-[120px] -translate-x-1/2" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[400px] bg-forest/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 pt-24 pb-16 px-4">
        {/* Back + title */}
        <div className="max-w-5xl mx-auto mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Retour à l&apos;accueil
          </Link>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 text-white/80 text-xs font-semibold px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Amadeus Production · Prix en temps réel
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold text-white leading-tight mb-3">
              Trouvez le vol <span className="gradient-text">parfait</span>
            </h1>
            <p className="text-white/50 text-lg max-w-xl mx-auto mb-10">
              Comparez les prix de toutes les compagnies aériennes en un instant.
            </p>
          </div>

          {/* Search form */}
          <FlightSearchForm onSearch={handleSearch} isSearching={isSearching} />
        </div>
      </div>

      {/* Results */}
      {(isSearching || results) && (
        <div className="relative z-10 bg-background min-h-[50vh]">
          <div className="max-w-5xl mx-auto px-4 py-10">
            {isSearching ? (
              <div className="text-center py-24">
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-accent/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-accent" />
                </div>
                <p className="text-foreground/60 font-medium animate-pulse">Recherche des meilleurs vols en cours...</p>
              </div>
            ) : results && results.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-6xl mb-4">✈️</div>
                <h2 className="text-xl font-bold text-foreground mb-2">Aucun vol trouvé</h2>
                <p className="text-foreground/50">Essayez d&apos;autres dates ou une destination différente.</p>
              </div>
            ) : sortedResults && (
              <>
                {/* Results header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      ✈️ {sortedResults.length} vol{sortedResults.length > 1 ? "s" : ""}
                      <span className="text-accent ml-1">{searchMeta?.origin} → {searchMeta?.destination}</span>
                    </h2>
                    {minPrice > 0 && (
                      <p className="text-sm text-foreground/50 mt-1">À partir de <strong className="text-accent">{minPrice}€</strong></p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Sort */}
                    <div className="flex items-center gap-1 bg-foreground/5 rounded-xl p-1">
                      <ArrowUpDown className="w-3.5 h-3.5 text-foreground/40 ml-2" />
                      {([["price", "Prix"], ["duration", "Durée"], ["stops", "Escales"]] as [SortKey, string][]).map(([key, label]) => (
                        <button key={key} onClick={() => setSortBy(key)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${sortBy === key ? "bg-white dark:bg-white/10 shadow text-accent" : "text-foreground/50"}`}>
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* Filter stops */}
                    <div className="flex items-center gap-1 bg-foreground/5 rounded-xl p-1">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-foreground/40 ml-2" />
                      {([[null, "Tous"], [0, "Direct"], [1, "1 esc."]] as [number | null, string][]).map(([val, label]) => (
                        <button key={String(val)} onClick={() => setFilterStops(val)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStops === val ? "bg-white dark:bg-white/10 shadow text-accent" : "text-foreground/50"}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Flight cards */}
                <div className="space-y-4">
                  {sortedResults.map((flight) => (
                    <FlightResultCard key={flight.id} flight={flight} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
