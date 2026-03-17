"use client";

import { Plane, Clock, ArrowRight, Luggage } from "lucide-react";

export interface FlightResult {
  id: string;
  airline: string;
  airlineName: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  stopCities: string[];
  price: number;
  currency: string;
  cabin: string;
  baggage: string;
  returnFlight?: {
    departureTime: string;
    arrivalTime: string;
    duration: string;
    stops: number;
  };
}

// ─── Airline logos via logo.clearbit.com ───────────────────────────────────────
const AIRLINE_DOMAINS: Record<string, string> = {
  AF: "airfrance.com", BA: "britishairways.com", LH: "lufthansa.com",
  KL: "klm.com", SN: "brusselsairlines.com", VY: "vueling.com",
  FR: "ryanair.com", U2: "easyjet.com", W6: "wizzair.com",
  EW: "eurowings.com", IB: "iberia.com", LX: "swiss.com",
  OS: "austrian.com", TK: "turkishairlines.com", EK: "emirates.com",
  QR: "qatarairways.com", DL: "delta.com", AA: "aa.com", UA: "united.com",
};

function getAirlineLogoUrl(code: string): string {
  const domain = AIRLINE_DOMAINS[code];
  return domain ? `https://logo.clearbit.com/${domain}` : "";
}

function formatFlightTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formatFlightDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
}

const cabinLabels: Record<string, string> = {
  ECONOMY: "Éco", PREMIUM_ECONOMY: "Premium", BUSINESS: "Business", FIRST: "1ère",
};

interface FlightResultCardProps {
  flight: FlightResult;
  onSelect?: () => void;
  isSelected?: boolean;
}

export default function FlightResultCard({ flight, onSelect, isSelected }: FlightResultCardProps) {
  const logoUrl = getAirlineLogoUrl(flight.airline);

  const stopsLabel = flight.stops === 0 ? "Direct" : `${flight.stops} escale${flight.stops > 1 ? "s" : ""}`;
  const stopsColor = flight.stops === 0 ? "text-emerald-500" : flight.stops === 1 ? "text-amber-500" : "text-red-400";

  return (
    <div
      onClick={onSelect}
      className={`bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl border-2 ${
        isSelected ? "border-accent shadow-accent/20" : "border-transparent hover:border-accent/30"
      }`}
    >
      <div className="p-5">
        {/* Header: airline + price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt={flight.airlineName} className="w-8 h-8 rounded-lg object-contain bg-white p-0.5"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Plane className="w-4 h-4 text-accent" />
              </div>
            )}
            <div>
              <div className="font-bold text-foreground text-sm">{flight.airlineName}</div>
              <div className="text-xs text-foreground/40">{flight.flightNumber}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-accent">{flight.price}€</div>
            <div className="text-xs text-foreground/40">par personne</div>
          </div>
        </div>

        {/* Outbound */}
        <div className="flex items-center gap-4 mb-3">
          <div className="text-center min-w-[60px]">
            <div className="text-lg font-bold text-foreground">{formatFlightTime(flight.departureTime)}</div>
            <div className="text-xs font-semibold text-accent">{flight.origin}</div>
          </div>

          <div className="flex-grow flex flex-col items-center gap-1">
            <div className="flex items-center gap-1 text-xs text-foreground/50">
              <Clock className="w-3 h-3" />
              <span>{flight.duration}</span>
            </div>
            <div className="w-full flex items-center gap-1">
              <div className="h-px flex-grow bg-foreground/20" />
              <Plane className="w-3 h-3 text-foreground/30 rotate-90" />
              <div className="h-px flex-grow bg-foreground/20" />
            </div>
            <div className={`text-xs font-semibold ${stopsColor}`}>{stopsLabel}
              {flight.stopCities.length > 0 && (
                <span className="text-foreground/40 font-normal"> via {flight.stopCities.join(", ")}</span>
              )}
            </div>
          </div>

          <div className="text-center min-w-[60px]">
            <div className="text-lg font-bold text-foreground">{formatFlightTime(flight.arrivalTime)}</div>
            <div className="text-xs font-semibold text-accent">{flight.destination}</div>
          </div>
        </div>

        {/* Return flight */}
        {flight.returnFlight && (
          <div className="flex items-center gap-4 mb-3 pt-3 border-t border-foreground/10">
            <div className="text-center min-w-[60px]">
              <div className="text-lg font-bold text-foreground">{formatFlightTime(flight.returnFlight.departureTime)}</div>
              <div className="text-xs font-semibold text-forest">{flight.destination}</div>
            </div>
            <div className="flex-grow flex flex-col items-center gap-1">
              <div className="flex items-center gap-1 text-xs text-foreground/50">
                <Clock className="w-3 h-3" />
                <span>{flight.returnFlight.duration}</span>
              </div>
              <div className="w-full flex items-center gap-1">
                <div className="h-px flex-grow bg-foreground/20" />
                <Plane className="w-3 h-3 text-foreground/30 -rotate-90" />
                <div className="h-px flex-grow bg-foreground/20" />
              </div>
              <div className={`text-xs font-semibold ${flight.returnFlight.stops === 0 ? "text-emerald-500" : "text-amber-500"}`}>
                {flight.returnFlight.stops === 0 ? "Direct" : `${flight.returnFlight.stops} escale${flight.returnFlight.stops > 1 ? "s" : ""}`}
              </div>
            </div>
            <div className="text-center min-w-[60px]">
              <div className="text-lg font-bold text-foreground">{formatFlightTime(flight.returnFlight.arrivalTime)}</div>
              <div className="text-xs font-semibold text-forest">{flight.origin}</div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-foreground/10">
          <div className="flex items-center gap-3 text-xs text-foreground/50">
            <span className="bg-foreground/5 px-2.5 py-1 rounded-full font-medium">
              {cabinLabels[flight.cabin] || flight.cabin}
            </span>
            <span className="flex items-center gap-1">
              <Luggage className="w-3.5 h-3.5" />
              {flight.baggage}
            </span>
            <span>{formatFlightDate(flight.departureTime)}</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
            className="flex items-center gap-1.5 bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105 shadow-md hover:shadow-accent/30 group"
          >
            Sélectionner
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
