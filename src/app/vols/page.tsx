"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, SlidersHorizontal, ArrowUpDown, X, Plane, Clock, Luggage, CreditCard, Shield } from "lucide-react";
import FlightSearchForm from "@/components/FlightSearchForm";
import FlightResultCard, { type FlightResult } from "@/components/FlightResultCard";

type SortKey = "price" | "duration" | "stops";

// ─── Flight Detail Drawer ─────────────────────────────────────────────────────
function FlightDetailDrawer({ flight, onClose }: { flight: FlightResult; onClose: () => void }) {
  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const cabinLabels: Record<string, string> = { ECONOMY: "Économique", PREMIUM_ECONOMY: "Premium Économique", BUSINESS: "Business", FIRST: "Première classe" };

  const [isBooking, setIsBooking] = useState(false);
  const [bookError, setBookError] = useState("");

  const handleBook = async () => {
    setIsBooking(true);
    setBookError("");
    try {
      const res = await fetch("/api/flights/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flightNumber: flight.flightNumber,
          airline: flight.airlineName,
          origin: flight.origin,
          destination: flight.destination,
          departureTime: flight.departureTime,
          returnTime: flight.returnFlight?.departureTime,
          price: flight.price,
          currency: flight.currency,
          cabin: flight.cabin,
          passengers: 1,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setBookError(data.error || "Erreur lors de la réservation");
        setIsBooking(false);
      }
    } catch {
      setBookError("Erreur de connexion. Réessayez.");
      setIsBooking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

      {/* Panel */}
      <div
        className="relative bg-white dark:bg-[#141412] w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl border border-foreground/[0.06]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-[#141412]/95 backdrop-blur-xl border-b border-foreground/[0.06] p-5 flex items-center justify-between z-10">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">Détails du vol</h2>
            <p className="text-xs text-foreground/40">{flight.flightNumber} · {flight.airlineName}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center transition-colors magnetic">
            <X className="w-5 h-5 text-foreground/60" />
          </button>
        </div>

        {/* Price banner */}
        <div className="bg-gradient-to-r from-accent to-accent/80 p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-black">{flight.price}€</div>
              <div className="text-white/70 text-sm">par personne · {cabinLabels[flight.cabin] || flight.cabin}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">{flight.origin} → {flight.destination}</div>
              <div className="text-white/60 text-xs">{flight.returnFlight ? "Aller-retour" : "Aller simple"}</div>
            </div>
          </div>
        </div>

        {/* Outbound itinerary */}
        <div className="p-5">
          <h3 className="text-sm font-bold text-foreground/60 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Plane className="w-4 h-4 text-accent" /> Vol aller — {formatDate(flight.departureTime)}
          </h3>

          <div className="flex items-start gap-4">
            {/* Timeline */}
            <div className="flex flex-col items-center gap-0 min-w-[20px]">
              <div className="w-3 h-3 rounded-full bg-accent border-2 border-white dark:border-[#141412] shadow" />
              <div className="w-0.5 flex-grow bg-accent/20 min-h-[60px]" />
              {flight.stops > 0 && (
                <>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white dark:border-[#141412] shadow" />
                  <div className="w-0.5 flex-grow bg-accent/20 min-h-[60px]" />
                </>
              )}
              <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#141412] shadow" />
            </div>

            <div className="flex-grow space-y-6">
              {/* Departure */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-foreground">{formatTime(flight.departureTime)}</span>
                  <span className="tag-pill">{flight.origin}</span>
                </div>
                <p className="text-xs text-foreground/40 mt-0.5">Départ</p>
              </div>

              {/* Stop info */}
              {flight.stops > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200/30 dark:border-amber-800/20 rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                    Escale à {flight.stopCities.join(", ") || "—"}
                  </p>
                </div>
              )}

              {/* Arrival */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-foreground">{formatTime(flight.arrivalTime)}</span>
                  <span className="tag-pill">{flight.destination}</span>
                </div>
                <p className="text-xs text-foreground/40 mt-0.5">Arrivée</p>
              </div>
            </div>

            {/* Duration side */}
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-foreground/60">
                <Clock className="w-4 h-4" /> {flight.duration}
              </div>
            </div>
          </div>

          {/* Return itinerary */}
          {flight.returnFlight && (
            <div className="mt-6 pt-6 border-t border-foreground/[0.06]">
              <h3 className="text-sm font-bold text-foreground/60 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Plane className="w-4 h-4 text-forest -scale-x-100" /> Vol retour — {formatDate(flight.returnFlight.departureTime)}
              </h3>
              <div className="flex items-center justify-between bg-foreground/[0.03] rounded-xl p-4">
                <div>
                  <span className="text-lg font-bold text-foreground">{formatTime(flight.returnFlight.departureTime)}</span>
                  <span className="text-foreground/40 text-sm ml-2">{flight.destination}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-foreground/50">
                  <Clock className="w-3.5 h-3.5" /> {flight.returnFlight.duration}
                </div>
                <div>
                  <span className="text-lg font-bold text-foreground">{formatTime(flight.returnFlight.arrivalTime)}</span>
                  <span className="text-foreground/40 text-sm ml-2">{flight.origin}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Details grid */}
        <div className="px-5 pb-5 grid grid-cols-2 gap-3">
          <div className="bg-foreground/[0.03] rounded-xl p-3">
            <Luggage className="w-4 h-4 text-accent mb-1.5" />
            <div className="text-xs font-bold text-foreground">Bagages</div>
            <div className="text-xs text-foreground/50">{flight.baggage}</div>
          </div>
          <div className="bg-foreground/[0.03] rounded-xl p-3">
            <Shield className="w-4 h-4 text-emerald-500 mb-1.5" />
            <div className="text-xs font-bold text-foreground">Annulation</div>
            <div className="text-xs text-foreground/50">Flexible sous conditions</div>
          </div>
        </div>

        {/* CTA */}
        <div className="sticky bottom-0 p-5 bg-white/95 dark:bg-[#141412]/95 backdrop-blur-xl border-t border-foreground/[0.06]">
          {bookError && (
            <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200/30 dark:border-red-800/20 rounded-xl">
              <p className="text-xs font-semibold text-red-600 dark:text-red-400">{bookError}</p>
            </div>
          )}
          <button
            onClick={handleBook}
            disabled={isBooking}
            className="w-full btn-accent py-4 rounded-xl text-base flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isBooking ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Redirection vers le paiement...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Réserver pour {flight.price}€
              </>
            )}
          </button>
          <p className="text-center text-xs text-foreground/30 mt-2">
            Paiement sécurisé via Stripe · Vous serez redirigé
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function VolsPage() {
  const [results, setResults] = useState<FlightResult[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMeta, setSearchMeta] = useState<{ origin: string; destination: string; departDate: string } | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("price");
  const [filterStops, setFilterStops] = useState<number | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<FlightResult | null>(null);

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
    setSelectedFlight(null);
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
      const parseDur = (d: string) => { const m = d.match(/(\d+)h(\d+)/); return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : 999; };
      return parseDur(a.duration) - parseDur(b.duration);
    }) : null;

  const minPrice = results?.length ? Math.min(...results.map(f => f.price)) : 0;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hero background */}
      <div className="absolute inset-0 noise-overlay">
        <div className="absolute inset-0 bg-gradient-to-br from-[#050508] via-[#0A1510] to-[#120808]" />
        <div className="orb orb-accent w-[600px] h-[500px] top-[10%] left-[20%]" />
        <div className="orb orb-forest w-[400px] h-[300px] bottom-[20%] right-[20%]" style={{ animationDelay: "-4s" }} />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="relative z-10 pt-24 pb-16 px-4">
        {/* Back + title */}
        <div className="max-w-5xl mx-auto mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Retour à l&apos;accueil
          </Link>
          <div className="text-center">
            <div className="inline-flex items-center gap-2.5 bg-white/[0.06] border border-white/[0.08] text-white/80 text-xs font-semibold px-5 py-2.5 rounded-full mb-6 backdrop-blur-xl glow-accent-subtle">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              Amadeus Production · Prix en temps réel
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold text-white leading-tight mb-3">
              Trouvez le vol <span className="gradient-text text-glow">parfait</span>
            </h1>
            <p className="text-white/45 text-lg max-w-xl mx-auto mb-10">
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
                <div className="space-y-4 stagger-children">
                  {sortedResults.map((flight) => (
                    <FlightResultCard
                      key={flight.id}
                      flight={flight}
                      isSelected={selectedFlight?.id === flight.id}
                      onSelect={() => setSelectedFlight(flight)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Flight detail drawer */}
      {selectedFlight && (
        <FlightDetailDrawer
          flight={selectedFlight}
          onClose={() => setSelectedFlight(null)}
        />
      )}
    </div>
  );
}
