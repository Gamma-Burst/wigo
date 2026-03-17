"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Plane, ArrowRightLeft, Calendar, Users, Search, ChevronDown, MapPin } from "lucide-react";

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

  // Initialisation des dates par défaut
  useEffect(() => {
    const today = new Date();
    const dep = new Date(today);
    dep.setDate(dep.getDate() + 14);
    const ret = new Date(dep);
    ret.setDate(ret.getDate() + 7);
    setDepartDate(dep.toISOString().split("T")[0]);
    setReturnDate(ret.toISOString().split("T")[0]);
  }, []);

  // Fermeture des menus au clic extérieur
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
    const t = setTimeout(() => {
      if (origin.length >= 2 && !originCode) fetchLocations(origin, setOriginSuggestions);
    }, 300);
    return () => clearTimeout(t);
  }, [origin, originCode, fetchLocations]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (destination.length >= 2 && !destinationCode) fetchLocations(destination, setDestSuggestions);
    }, 300);
    return () => clearTimeout(t);
  }, [destination, destinationCode, fetchLocations]);

  const handleSwap = () => {
    const tempName = origin;
    const tempCode = originCode;
    setOrigin(destination); setOriginCode(destinationCode);
    setDestination(tempName); setDestinationCode(tempCode);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!originCode || !destinationCode || !departDate) return;
    onSearch({
      origin: originCode,
      destination: destinationCode,
      departDate,
      returnDate: isRoundTrip ? returnDate : undefined,
      adults,
      cabin,
    });
  };

  const cabinLabels: Record<string, string> = {
    ECONOMY: "Éco", PREMIUM_ECONOMY: "Premium", BUSINESS: "Business", FIRST: "First",
  };

  const inputContainerClass = "flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/10 focus-within:border-accent/50 focus-within:bg-white/10 transition-all";
  const inputBase = "bg-transparent text-white placeholder-white/30 outline-none w-full text-sm font-medium";

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-5xl mx-auto space-y-4">
      {/* Type de voyage & Options */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
          <button type="button" onClick={() => setIsRoundTrip(true)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isRoundTrip ? "bg-accent text-white shadow-lg" : "text-white/50 hover:text-white"}`}>
            Aller-retour
          </button>
          <button type="button" onClick={() => setIsRoundTrip(false)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${!isRoundTrip ? "bg-accent text-white shadow-lg" : "text-white/50 hover:text-white"}`}>
            Aller simple
          </button>
        </div>

        <div className="flex items-center gap-2">
          {Object.entries(cabinLabels).map(([key, label]) => (
            <button key={key} type="button" onClick={() => setCabin(key)}
              className={`text-[10px] uppercase tracking-wider font-black px-3 py-1.5 rounded-lg border transition-all ${cabin === key ? "border-accent text-accent bg-accent/10" : "border-white/5 text-white/30 hover:text-white/60"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl p-4 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">

          {/* Départ */}
          <div ref={originRef} className="lg:col-span-3 relative">
            <div className={inputContainerClass}>
              <MapPin className="w-4 h-4 text-accent/60" />
              <input
                type="text"
                value={origin}
                onChange={(e) => { setOrigin(e.target.value); setOriginCode(""); setShowOriginDrop(true); }}
                onFocus={() => originSuggestions.length > 0 && setShowOriginDrop(true)}
                placeholder="D'où partez-vous ?"
                className={inputBase}
              />
            </div>
            {showOriginDrop && originSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a18] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2">
                {originSuggestions.map((s) => (
                  <button key={s.iataCode} type="button"
                    onClick={() => { setOrigin(`${s.cityName} (${s.iataCode})`); setOriginCode(s.iataCode); setShowOriginDrop(false); }}
                    className="w-full text-left px-4 py-3 hover:bg-white/5 text-white flex items-center justify-between transition-colors">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{s.cityName}</span>
                      <span className="text-[10px] text-white/40 uppercase tracking-tighter">{s.countryName}</span>
                    </div>
                    <span className="bg-accent/10 text-accent font-mono font-black text-[10px] px-2 py-1 rounded-md">{s.iataCode}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap */}
          <div className="lg:col-span-1 flex justify-center">
            <button type="button" onClick={handleSwap}
              className="p-2.5 bg-white/5 hover:bg-accent/20 rounded-full border border-white/10 transition-all hover:rotate-180 duration-500">
              <ArrowRightLeft className="w-4 h-4 text-white/60" />
            </button>
          </div>

          {/* Destination */}
          <div ref={destRef} className="lg:col-span-3 relative">
            <div className={inputContainerClass}>
              <Plane className="w-4 h-4 text-accent rotate-90" />
              <input
                type="text"
                value={destination}
                onChange={(e) => { setDestination(e.target.value); setDestinationCode(""); setShowDestDrop(true); }}
                onFocus={() => destSuggestions.length > 0 && setShowDestDrop(true)}
                placeholder="Destination (ex: Porto)"
                className={inputBase}
              />
            </div>
            {showDestDrop && destSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a18] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2">
                {destSuggestions.map((s) => (
                  <button key={s.iataCode} type="button"
                    onClick={() => { setDestination(`${s.cityName} (${s.iataCode})`); setDestinationCode(s.iataCode); setShowDestDrop(false); }}
                    className="w-full text-left px-4 py-3 hover:bg-white/5 text-white flex items-center justify-between transition-colors">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{s.cityName}</span>
                      <span className="text-[10px] text-white/40 uppercase tracking-tighter">{s.countryName}</span>
                    </div>
                    <span className="bg-accent/10 text-accent font-mono font-black text-[10px] px-2 py-1 rounded-md">{s.iataCode}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dates */}
          <div className={`${isRoundTrip ? "lg:col-span-2" : "lg:col-span-4"} ${inputContainerClass}`}>
            <Calendar className="w-4 h-4 text-accent/60" />
            <input type="date" value={departDate} onChange={(e) => setDepartDate(e.target.value)}
              className={`${inputBase} [color-scheme:dark]`} />
          </div>

          {isRoundTrip && (
            <div className="lg:col-span-2 flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/10">
              <Calendar className="w-4 h-4 text-emerald-500/60" />
              <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)}
                className={`${inputBase} [color-scheme:dark]`} />
            </div>
          )}

          {/* Bouton Search */}
          <div className="lg:col-span-1">
            <button type="submit" disabled={isSearching || !originCode || !destinationCode}
              className="w-full h-full btn-accent rounded-xl flex items-center justify-center py-3 shadow-lg shadow-accent/20 disabled:opacity-30 disabled:grayscale transition-all hover:scale-105 active:scale-95">
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Footer: passagers */}
        <div className="mt-3 flex items-center px-2">
          <div ref={passRef} className="relative">
            <button type="button" onClick={() => setShowPassengers(!showPassengers)}
              className="flex items-center gap-2 text-white/40 hover:text-accent transition-colors text-xs font-bold">
              <Users className="w-3.5 h-3.5" />
              <span>{adults} voyageur{adults > 1 ? "s" : ""}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showPassengers ? "rotate-180" : ""}`} />
            </button>
            {showPassengers && (
              <div className="absolute top-full left-0 mt-3 bg-[#1a1a18] border border-white/10 rounded-2xl shadow-2xl z-50 p-4 min-w-[220px] animate-in zoom-in-95">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold text-sm">Passagers</span>
                  <div className="flex items-center gap-4">
                    <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-accent/20 flex items-center justify-center font-bold">-</button>
                    <span className="text-white font-black text-sm">{adults}</span>
                    <button type="button" onClick={() => setAdults(Math.min(9, adults + 1))}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-accent/20 flex items-center justify-center font-bold">+</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}