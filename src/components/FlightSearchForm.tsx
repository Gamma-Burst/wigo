"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Plane, ArrowRightLeft, Calendar, Users, Search, ChevronDown } from "lucide-react";

interface LocationSuggestion {
  iataCode: string;
  name: string;
  cityName: string;
  countryName: string;
  type: "airport" | "city";
}

interface FlightSearchFormProps {
  onSearch: (params: {
    origin: string;
    destination: string;
    departDate: string;
    returnDate?: string;
    adults: number;
    cabin: string;
  }) => void;
  isSearching?: boolean;
}

export default function FlightSearchForm({ onSearch, isSearching }: FlightSearchFormProps) {
  const [origin, setOrigin] = useState("");
  const [originCode, setOriginCode] = useState("");
  const [destination, setDestination] = useState("");
  const [destinationCode, setDestinationCode] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [cabin, setCabin] = useState("ECONOMY");
  const [isRoundTrip, setIsRoundTrip] = useState(true);
  const [originSuggestions, setOriginSuggestions] = useState<LocationSuggestion[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<LocationSuggestion[]>([]);
  const [showOriginDrop, setShowOriginDrop] = useState(false);
  const [showDestDrop, setShowDestDrop] = useState(false);
  const [showPassengers, setShowPassengers] = useState(false);

  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);
  const passRef = useRef<HTMLDivElement>(null);

  // Default dates
  useEffect(() => {
    const today = new Date();
    const dep = new Date(today);
    dep.setDate(dep.getDate() + 14);
    const ret = new Date(dep);
    ret.setDate(ret.getDate() + 7);
    setDepartDate(dep.toISOString().split("T")[0]);
    setReturnDate(ret.toISOString().split("T")[0]);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (originRef.current && !originRef.current.contains(e.target as Node)) setShowOriginDrop(false);
      if (destRef.current && !destRef.current.contains(e.target as Node)) setShowDestDrop(false);
      if (passRef.current && !passRef.current.contains(e.target as Node)) setShowPassengers(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchLocations = useCallback(async (keyword: string, setter: (s: LocationSuggestion[]) => void) => {
    if (keyword.length < 2) { setter([]); return; }
    try {
      const res = await fetch(`/api/locations?keyword=${encodeURIComponent(keyword)}`);
      const data = await res.json();
      setter(data.results || []);
    } catch { setter([]); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { if (origin.length >= 2 && !originCode) fetchLocations(origin, setOriginSuggestions); }, 300);
    return () => clearTimeout(t);
  }, [origin, originCode, fetchLocations]);

  useEffect(() => {
    const t = setTimeout(() => { if (destination.length >= 2 && !destinationCode) fetchLocations(destination, setDestSuggestions); }, 300);
    return () => clearTimeout(t);
  }, [destination, destinationCode, fetchLocations]);

  const handleSwap = () => {
    setOrigin(destination); setOriginCode(destinationCode);
    setDestination(origin); setDestinationCode(originCode);
  };

  // Auto-detect IATA codes typed directly (3 uppercase letters)
  const isIataCode = (s: string) => /^[A-Z]{3}$/.test(s.trim().toUpperCase());
  const extractIataFromInput = (s: string) => {
    // Match "City (CODE)" pattern
    const match = s.match(/\(([A-Z]{3})\)/);
    if (match) return match[1];
    // Match raw 3-letter code
    if (isIataCode(s)) return s.trim().toUpperCase();
    return "";
  };

  // Auto-set code when user types a valid IATA code directly
  useEffect(() => {
    if (!originCode && origin.length >= 3) {
      const code = extractIataFromInput(origin);
      if (code) { setOriginCode(code); setOrigin(`${origin.trim().toUpperCase()} ✈`); setShowOriginDrop(false); }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin]);

  useEffect(() => {
    if (!destinationCode && destination.length >= 3) {
      const code = extractIataFromInput(destination);
      if (code) { setDestinationCode(code); setDestination(`${destination.trim().toUpperCase()} ✈`); setShowDestDrop(false); }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const oCode = originCode || extractIataFromInput(origin);
    const dCode = destinationCode || extractIataFromInput(destination);
    if (!oCode || !dCode || !departDate) return;
    onSearch({
      origin: oCode,
      destination: dCode,
      departDate,
      returnDate: isRoundTrip ? returnDate : undefined,
      adults,
      cabin,
    });
  };

  const cabinLabels: Record<string, string> = {
    ECONOMY: "Économique", PREMIUM_ECONOMY: "Premium Éco", BUSINESS: "Business", FIRST: "Première",
  };

  const inputBase = "bg-transparent text-white placeholder-white/40 outline-none w-full text-sm";

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      {/* Trip type toggle */}
      <div className="flex items-center gap-3 mb-4">
        <button type="button" onClick={() => setIsRoundTrip(true)}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${isRoundTrip ? "bg-accent text-white border-accent" : "bg-white/10 text-white/70 border-white/20 hover:bg-white/20"}`}>
          ↔ Aller-retour
        </button>
        <button type="button" onClick={() => setIsRoundTrip(false)}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${!isRoundTrip ? "bg-accent text-white border-accent" : "bg-white/10 text-white/70 border-white/20 hover:bg-white/20"}`}>
          → Aller simple
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-2xl border border-white/18 rounded-2xl p-3 shadow-2xl shadow-black/30">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
          {/* Origin */}
          <div ref={originRef} className="md:col-span-3 relative">
            <div className="flex items-center gap-2 px-3 py-3 bg-white/5 rounded-xl border border-white/10">
              <Plane className="w-4 h-4 text-accent flex-shrink-0" />
              <input
                type="text"
                value={origin}
                onChange={(e) => { setOrigin(e.target.value); setOriginCode(""); setShowOriginDrop(true); }}
                onFocus={() => originSuggestions.length > 0 && setShowOriginDrop(true)}
                placeholder="Départ (ville ou aéroport)"
                className={inputBase}
              />
            </div>
            {showOriginDrop && originSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-white/15 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                {originSuggestions.map((s) => (
                  <button key={s.iataCode} type="button"
                    onClick={() => { setOrigin(`${s.cityName} (${s.iataCode})`); setOriginCode(s.iataCode); setShowOriginDrop(false); }}
                    className="w-full text-left px-4 py-3 hover:bg-white/10 text-white text-sm flex items-center justify-between transition-colors">
                    <span><strong>{s.cityName}</strong> <span className="text-white/50">{s.countryName}</span></span>
                    <span className="text-accent font-mono font-bold text-xs">{s.iataCode}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap button */}
          <div className="md:col-span-1 flex items-center justify-center">
            <button type="button" onClick={handleSwap}
              className="p-2 bg-white/10 hover:bg-accent/30 rounded-full border border-white/15 transition-all hover:rotate-180 duration-300">
              <ArrowRightLeft className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Destination */}
          <div ref={destRef} className="md:col-span-3 relative">
            <div className="flex items-center gap-2 px-3 py-3 bg-white/5 rounded-xl border border-white/10">
              <Plane className="w-4 h-4 text-accent flex-shrink-0 rotate-90" />
              <input
                type="text"
                value={destination}
                onChange={(e) => { setDestination(e.target.value); setDestinationCode(""); setShowDestDrop(true); }}
                onFocus={() => destSuggestions.length > 0 && setShowDestDrop(true)}
                placeholder="Destination"
                className={inputBase}
              />
            </div>
            {showDestDrop && destSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-white/15 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                {destSuggestions.map((s) => (
                  <button key={s.iataCode} type="button"
                    onClick={() => { setDestination(`${s.cityName} (${s.iataCode})`); setDestinationCode(s.iataCode); setShowDestDrop(false); }}
                    className="w-full text-left px-4 py-3 hover:bg-white/10 text-white text-sm flex items-center justify-between transition-colors">
                    <span><strong>{s.cityName}</strong> <span className="text-white/50">{s.countryName}</span></span>
                    <span className="text-accent font-mono font-bold text-xs">{s.iataCode}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dates */}
          <div className={`${isRoundTrip ? "md:col-span-2" : "md:col-span-3"} flex items-center gap-2 px-3 py-3 bg-white/5 rounded-xl border border-white/10`}>
            <Calendar className="w-4 h-4 text-accent flex-shrink-0" />
            <input type="date" value={departDate} onChange={(e) => setDepartDate(e.target.value)}
              className={`${inputBase} [color-scheme:dark]`} />
          </div>

          {isRoundTrip && (
            <div className="md:col-span-2 flex items-center gap-2 px-3 py-3 bg-white/5 rounded-xl border border-white/10">
              <Calendar className="w-4 h-4 text-forest flex-shrink-0" />
              <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)}
                className={`${inputBase} [color-scheme:dark]`} />
            </div>
          )}

          {/* Search button */}
          <div className="md:col-span-1 flex items-center">
            <button type="submit" disabled={isSearching || (!originCode && !isIataCode(origin)) || (!destinationCode && !isIataCode(destination))}
              className="w-full h-full btn-accent rounded-xl flex items-center justify-center gap-2 py-3 disabled:opacity-40 disabled:cursor-not-allowed">
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Bottom row: passengers + cabin */}
        <div className="flex items-center gap-4 mt-2 px-2">
          <div ref={passRef} className="relative">
            <button type="button" onClick={() => setShowPassengers(!showPassengers)}
              className="flex items-center gap-2 text-white/60 hover:text-white text-xs transition-colors">
              <Users className="w-3.5 h-3.5" />
              <span>{adults} voyageur{adults > 1 ? "s" : ""}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showPassengers && (
              <div className="absolute top-full left-0 mt-2 bg-zinc-900 border border-white/15 rounded-xl shadow-2xl z-50 p-4 min-w-[200px]">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">Adultes</span>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center font-bold">-</button>
                    <span className="text-white font-bold w-4 text-center">{adults}</span>
                    <button type="button" onClick={() => setAdults(Math.min(9, adults + 1))}
                      className="w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center font-bold">+</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {Object.entries(cabinLabels).map(([key, label]) => (
              <button key={key} type="button" onClick={() => setCabin(key)}
                className={`text-xs px-3 py-1 rounded-full transition-all ${cabin === key ? "bg-accent/20 text-accent border border-accent/40" : "text-white/40 hover:text-white/70"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}
