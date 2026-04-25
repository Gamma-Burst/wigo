"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Plane,
  Clock,
  Luggage,
  Shield,
  ExternalLink,
} from "lucide-react";
import FlightSearchForm from "@/components/FlightSearchForm";
import FlightResultCard, { type FlightResult } from "@/components/FlightResultCard";

type SortKey = "price" | "duration" | "stops";

const AIRLINE_BOOKING_URLS: Record<string, string> = {
  TP: "https://www.flytap.com",
  AF: "https://www.airfrance.fr",
  BA: "https://www.britishairways.com",
  LH: "https://www.lufthansa.com",
  KL: "https://www.klm.fr",
  SN: "https://www.brusselsairlines.com",
  VY: "https://www.vueling.com",
  FR: "https://www.ryanair.com",
  U2: "https://www.easyjet.com",
  W6: "https://www.wizzair.com",
  EW: "https://www.eurowings.com",
  IB: "https://www.iberia.com",
  LX: "https://www.swiss.com",
  OS: "https://www.austrian.com",
  TK: "https://www.turkishairlines.com",
  EK: "https://www.emirates.com",
  QR: "https://www.qatarairways.com",
  DL: "https://www.delta.com",
  AA: "https://www.aa.com",
  UA: "https://www.united.com",
  AY: "https://www.finnair.com",
  EI: "https://www.aerlingus.com",
  SK: "https://www.flysas.com",
  AC: "https://www.aircanada.com",
};

function getAirlineUrl(code: string, origin: string, dest: string, date: string): string {
  const base = AIRLINE_BOOKING_URLS[code];
  if (base) return base;
  return `https://www.google.com/travel/flights?q=flights+${origin}+to+${dest}+on+${date}`;
}

function FlightDetailDrawer({ flight, onClose }: { flight: FlightResult; onClose: () => void }) {
  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const fmtDateShort = (iso: string) => new Date(iso).toISOString().split("T")[0];
  const cabinLabel: Record<string, string> = {
    ECONOMY: "Economique",
    PREMIUM_ECONOMY: "Premium Eco",
    BUSINESS: "Business",
    FIRST: "Premiere",
  };

  const handleBookOnAirline = () => {
    const url = getAirlineUrl(flight.airline, flight.origin, flight.destination, fmtDateShort(flight.departureTime));
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" />
      <div
        className="premium-surface relative max-h-[90vh] w-full overflow-y-auto rounded-t-[28px] sm:max-w-lg sm:rounded-[28px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-foreground/[0.06] bg-card/95 p-5 backdrop-blur-xl">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">Details du vol</h2>
            <p className="text-xs text-foreground/40">
              {flight.flightNumber} · {flight.airlineName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/5 transition-colors hover:bg-foreground/10"
          >
            <X className="h-5 w-5 text-foreground/60" />
          </button>
        </div>

        <div className="bg-gradient-to-r from-accent to-accent/80 p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-black">{flight.price}€</div>
              <div className="text-sm text-white/70">par personne · {cabinLabel[flight.cabin] || flight.cabin}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">
                {flight.origin} → {flight.destination}
              </div>
              <div className="text-xs text-white/60">{flight.returnFlight ? "Aller-retour" : "Aller simple"}</div>
            </div>
          </div>
        </div>

        <div className="p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground/60">
            <Plane className="h-4 w-4 text-accent" /> Vol aller · {fmtDate(flight.departureTime)}
          </h3>
          <div className="flex items-start gap-4">
            <div className="flex min-w-[20px] flex-col items-center">
              <div className="h-3 w-3 rounded-full border-2 border-white bg-accent shadow dark:border-[#141412]" />
              <div className="min-h-[60px] w-0.5 flex-grow bg-accent/20" />
              {flight.stops > 0 && (
                <>
                  <div className="h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-400 shadow dark:border-[#141412]" />
                  <div className="min-h-[60px] w-0.5 flex-grow bg-accent/20" />
                </>
              )}
              <div className="h-3 w-3 rounded-full border-2 border-white bg-emerald-500 shadow dark:border-[#141412]" />
            </div>

            <div className="flex-grow space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-foreground">{fmtTime(flight.departureTime)}</span>
                  <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-xs font-semibold text-foreground/70">
                    {flight.origin}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-foreground/40">Depart</p>
              </div>

              {flight.stops > 0 && (
                <div className="rounded-xl border border-amber-200/30 bg-amber-50 px-4 py-3 dark:border-amber-800/20 dark:bg-amber-900/10">
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                    Escale a {flight.stopCities.join(", ") || "-"}
                  </p>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-foreground">{fmtTime(flight.arrivalTime)}</span>
                  <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-xs font-semibold text-foreground/70">
                    {flight.destination}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-foreground/40">Arrivee</p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-foreground/60">
                <Clock className="h-4 w-4" /> {flight.duration}
              </div>
            </div>
          </div>

          {flight.returnFlight && (
            <div className="mt-6 border-t border-foreground/[0.06] pt-6">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground/60">
                <Plane className="h-4 w-4 -scale-x-100 text-forest" /> Vol retour · {fmtDate(flight.returnFlight.departureTime)}
              </h3>
              <div className="flex items-center justify-between rounded-xl bg-foreground/[0.03] p-4">
                <div>
                  <span className="text-lg font-bold text-foreground">{fmtTime(flight.returnFlight.departureTime)}</span>
                  <span className="ml-2 text-sm text-foreground/40">{flight.destination}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-foreground/50">
                  <Clock className="h-3.5 w-3.5" /> {flight.returnFlight.duration}
                </div>
                <div>
                  <span className="text-lg font-bold text-foreground">{fmtTime(flight.returnFlight.arrivalTime)}</span>
                  <span className="ml-2 text-sm text-foreground/40">{flight.origin}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 px-5 pb-5">
          <div className="rounded-xl bg-foreground/[0.03] p-3">
            <Luggage className="mb-1.5 h-4 w-4 text-accent" />
            <div className="text-xs font-bold text-foreground">Bagages</div>
            <div className="text-xs text-foreground/50">{flight.baggage}</div>
          </div>
          <div className="rounded-xl bg-foreground/[0.03] p-3">
            <Shield className="mb-1.5 h-4 w-4 text-emerald-500" />
            <div className="text-xs font-bold text-foreground">Annulation</div>
            <div className="text-xs text-foreground/50">Flexible sous conditions</div>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-foreground/[0.06] bg-card/95 p-5 backdrop-blur-xl">
          <button onClick={handleBookOnAirline} className="btn-accent flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base">
            <ExternalLink className="h-5 w-5" />
            Reserver sur {flight.airlineName}
          </button>
          <p className="mt-2 text-center text-xs text-foreground/30">
            Vous serez redirige vers le site officiel de {flight.airlineName}
          </p>
        </div>
      </div>
    </div>
  );
}

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

  const sortedResults = results
    ? [...results]
        .filter((f) => filterStops === null || f.stops === filterStops)
        .sort((a, b) => {
          if (sortBy === "price") return a.price - b.price;
          if (sortBy === "stops") return a.stops - b.stops;
          const parseDur = (d: string) => {
            const m = d.match(/(\d+)h(\d+)/);
            return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : 999;
          };
          return parseDur(a.duration) - parseDur(b.duration);
        })
    : null;

  const minPrice = results?.length ? Math.min(...results.map((f) => f.price)) : 0;

  return (
    <div className="warm-section relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute left-[10%] top-[6%] h-[440px] w-[540px] rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute right-[8%] top-[18%] h-[360px] w-[360px] rounded-full bg-forest/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 h-[280px] w-[80%] -translate-x-1/2 bg-[radial-gradient(circle_at_center,rgba(232,101,42,0.08),transparent_62%)]" />
      </div>

      <div className="relative z-10 px-4 pb-16 pt-24">
        <div className="mx-auto mb-8 max-w-5xl">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-foreground/55 transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Retour a l&apos;accueil
          </Link>

          <div className="text-center">
            <div className="eyebrow mb-6">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              Amadeus Production · Prix en temps reel
            </div>
            <h1 className="mb-4 font-display text-4xl font-extrabold leading-[1.06] text-foreground md:text-6xl lg:text-[68px]">
              Le meilleur vol,
              <br />
              <span className="text-accent">sans bruit ni friction.</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-foreground-soft">
              WIGO trie les itineraires utiles, met en avant les vrais compromis et te renvoie vers la meilleure option
              au bon moment.
            </p>
          </div>

          <FlightSearchForm onSearch={handleSearch} isSearching={isSearching} />
        </div>
      </div>

      {(isSearching || results) && (
        <div className="relative z-10 min-h-[50vh]">
          <div className="mx-auto max-w-5xl px-4 py-10">
            {isSearching ? (
              <div className="mx-auto w-full max-w-3xl animate-fade-in space-y-4">
                <div className="mb-8 flex items-center justify-center gap-3">
                  <Sparkles className="h-5 w-5 animate-pulse text-accent" />
                  <p className="font-medium text-foreground/60">Recherche des meilleurs vols et itineraires en cours...</p>
                </div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="premium-surface w-full rounded-[26px] p-5">
                    <div className="mb-6 flex justify-between">
                      <div className="flex items-center gap-3">
                        <div className="skeleton h-9 w-9 rounded-xl" />
                        <div className="space-y-2">
                          <div className="skeleton h-4 w-24 rounded" />
                          <div className="skeleton h-3 w-16 rounded" />
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <div className="skeleton h-6 w-20 rounded" />
                        <div className="skeleton h-3 w-12 rounded" />
                      </div>
                    </div>
                    <div className="flex items-center gap-6 px-2">
                      <div className="skeleton h-8 w-12 rounded" />
                      <div className="flex flex-grow flex-col items-center gap-2">
                        <div className="skeleton h-3 w-16 rounded" />
                        <div className="skeleton h-0.5 w-full rounded" />
                      </div>
                      <div className="skeleton h-8 w-12 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : results && results.length === 0 ? (
              <div className="py-24 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-3xl">✈</div>
                <h2 className="mb-2 text-xl font-bold text-foreground">Aucun vol trouve</h2>
                <p className="text-foreground/50">Essaie d&apos;autres dates ou une destination differente.</p>
              </div>
            ) : sortedResults && (
              <>
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                      {sortedResults.length} vol{sortedResults.length > 1 ? "s" : ""}
                      <span className="ml-1 text-accent">
                        {searchMeta?.origin} → {searchMeta?.destination}
                      </span>
                    </h2>
                    {minPrice > 0 && (
                      <p className="mt-1 text-sm text-foreground/50">
                        A partir de <strong className="text-accent">{minPrice}€</strong>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[color:var(--surface-raised)] p-1">
                      <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-foreground/40" />
                      {(
                        [
                          ["price", "Prix"],
                          ["duration", "Duree"],
                          ["stops", "Escales"],
                        ] as [SortKey, string][]
                      ).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => setSortBy(key)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            sortBy === key ? "bg-card text-accent shadow" : "text-foreground/50"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[color:var(--surface-raised)] p-1">
                      <SlidersHorizontal className="ml-2 h-3.5 w-3.5 text-foreground/40" />
                      {(
                        [
                          [null, "Tous"],
                          [0, "Direct"],
                          [1, "1 esc."],
                        ] as [number | null, string][]
                      ).map(([val, label]) => (
                        <button
                          key={String(val)}
                          onClick={() => setFilterStops(val)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            filterStops === val ? "bg-card text-accent shadow" : "text-foreground/50"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
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

      {selectedFlight && <FlightDetailDrawer flight={selectedFlight} onClose={() => setSelectedFlight(null)} />}
    </div>
  );
}
