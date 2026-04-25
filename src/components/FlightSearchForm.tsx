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

  useEffect(() => {
    const today = new Date();
    const dep = new Date(today);
    dep.setDate(dep.getDate() + 14);
    const ret = new Date(dep);
    ret.setDate(ret.getDate() + 7);
    setDepartDate(dep.toISOString().split("T")[0]);
    setReturnDate(ret.toISOString().split("T")[0]);
  }, []);

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
    if (keyword.length < 2) {
      setter([]);
      return;
    }

    try {
      const res = await fetch(`/api/locations?keyword=${encodeURIComponent(keyword)}`);
      const data = await res.json();
      setter(data.results || []);
    } catch {
      setter([]);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (origin.length >= 2 && !originCode) fetchLocations(origin, setOriginSuggestions);
    }, 300);

    return () => clearTimeout(timeout);
  }, [origin, originCode, fetchLocations]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (destination.length >= 2 && !destinationCode) fetchLocations(destination, setDestSuggestions);
    }, 300);

    return () => clearTimeout(timeout);
  }, [destination, destinationCode, fetchLocations]);

  const handleSwap = () => {
    const tempName = origin;
    const tempCode = originCode;
    setOrigin(destination);
    setOriginCode(destinationCode);
    setDestination(tempName);
    setDestinationCode(tempCode);
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
    ECONOMY: "Eco",
    PREMIUM_ECONOMY: "Premium",
    BUSINESS: "Business",
    FIRST: "First",
  };

  const inputContainerClass =
    "flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[color:var(--surface-raised)] px-4 py-3.5 transition-all focus-within:border-accent/40 focus-within:shadow-lg focus-within:shadow-accent/5";
  const inputBase =
    "w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-foreground/35";
  const dropdownClass =
    "absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-card py-1 shadow-2xl";

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-5xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[color:var(--surface-raised)] p-1">
          <button
            type="button"
            onClick={() => setIsRoundTrip(true)}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
              isRoundTrip ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-foreground/50 hover:text-foreground"
            }`}
          >
            Aller-retour
          </button>
          <button
            type="button"
            onClick={() => setIsRoundTrip(false)}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
              !isRoundTrip ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-foreground/50 hover:text-foreground"
            }`}
          >
            Aller simple
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(cabinLabels).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setCabin(key)}
              className={`rounded-lg border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all ${
                cabin === key
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-[var(--border)] text-foreground/35 hover:border-[var(--border-strong)] hover:text-foreground/70"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="premium-surface rounded-[28px] p-4 md:p-5">
        <div className="grid grid-cols-1 items-center gap-3 lg:grid-cols-12">
          <div ref={originRef} className="relative lg:col-span-3">
            <div className={inputContainerClass}>
              <MapPin className="h-4 w-4 text-accent/70" />
              <input
                type="text"
                value={origin}
                onChange={(e) => {
                  setOrigin(e.target.value);
                  setOriginCode("");
                  setShowOriginDrop(true);
                }}
                onFocus={() => originSuggestions.length > 0 && setShowOriginDrop(true)}
                placeholder="D'ou partez-vous ?"
                className={inputBase}
              />
            </div>
            {showOriginDrop && originSuggestions.length > 0 && (
              <div className={dropdownClass}>
                {originSuggestions.map((s) => (
                  <button
                    key={s.iataCode}
                    type="button"
                    onClick={() => {
                      setOrigin(`${s.cityName} (${s.iataCode})`);
                      setOriginCode(s.iataCode);
                      setShowOriginDrop(false);
                    }}
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-foreground transition-colors hover:bg-foreground/[0.03]"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{s.cityName}</span>
                      <span className="text-[10px] uppercase tracking-tighter text-foreground/40">{s.countryName}</span>
                    </div>
                    <span className="rounded-md bg-accent/10 px-2 py-1 font-mono text-[10px] font-black text-accent">
                      {s.iataCode}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-center lg:col-span-1">
            <button
              type="button"
              onClick={handleSwap}
              className="rounded-full border border-[var(--border)] bg-[color:var(--surface-raised)] p-2.5 transition-all duration-500 hover:rotate-180 hover:bg-accent/10"
            >
              <ArrowRightLeft className="h-4 w-4 text-foreground/55" />
            </button>
          </div>

          <div ref={destRef} className="relative lg:col-span-3">
            <div className={inputContainerClass}>
              <Plane className="h-4 w-4 rotate-90 text-accent" />
              <input
                type="text"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setDestinationCode("");
                  setShowDestDrop(true);
                }}
                onFocus={() => destSuggestions.length > 0 && setShowDestDrop(true)}
                placeholder="Destination"
                className={inputBase}
              />
            </div>
            {showDestDrop && destSuggestions.length > 0 && (
              <div className={dropdownClass}>
                {destSuggestions.map((s) => (
                  <button
                    key={s.iataCode}
                    type="button"
                    onClick={() => {
                      setDestination(`${s.cityName} (${s.iataCode})`);
                      setDestinationCode(s.iataCode);
                      setShowDestDrop(false);
                    }}
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-foreground transition-colors hover:bg-foreground/[0.03]"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{s.cityName}</span>
                      <span className="text-[10px] uppercase tracking-tighter text-foreground/40">{s.countryName}</span>
                    </div>
                    <span className="rounded-md bg-accent/10 px-2 py-1 font-mono text-[10px] font-black text-accent">
                      {s.iataCode}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={`${isRoundTrip ? "lg:col-span-2" : "lg:col-span-4"} ${inputContainerClass}`}>
            <Calendar className="h-4 w-4 text-accent/70" />
            <input type="date" value={departDate} onChange={(e) => setDepartDate(e.target.value)} className={inputBase} />
          </div>

          {isRoundTrip && (
            <div className="lg:col-span-2">
              <div className={inputContainerClass}>
                <Calendar className="h-4 w-4 text-emerald-500/70" />
                <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className={inputBase} />
              </div>
            </div>
          )}

          <div className="lg:col-span-1">
            <button
              type="submit"
              disabled={isSearching || !originCode || !destinationCode}
              className="btn-accent flex h-full w-full items-center justify-center rounded-2xl py-3.5 shadow-lg shadow-accent/20 transition-all hover:scale-[1.02] active:scale-95 disabled:grayscale"
            >
              {isSearching ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center px-2">
          <div ref={passRef} className="relative">
            <button
              type="button"
              onClick={() => setShowPassengers(!showPassengers)}
              className="flex items-center gap-2 text-xs font-bold text-foreground/45 transition-colors hover:text-accent"
            >
              <Users className="h-3.5 w-3.5" />
              <span>{adults} voyageur{adults > 1 ? "s" : ""}</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${showPassengers ? "rotate-180" : ""}`} />
            </button>
            {showPassengers && (
              <div className="absolute left-0 top-full z-50 mt-3 min-w-[220px] rounded-2xl border border-[var(--border-strong)] bg-card p-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">Passagers</span>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[color:var(--surface-raised)] font-bold text-foreground hover:bg-accent/10"
                    >
                      -
                    </button>
                    <span className="text-sm font-black text-foreground">{adults}</span>
                    <button
                      type="button"
                      onClick={() => setAdults(Math.min(9, adults + 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[color:var(--surface-raised)] font-bold text-foreground hover:bg-accent/10"
                    >
                      +
                    </button>
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
