"use client";

import { Plane, Clock, Luggage, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

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

const TRAVELPAYOUTS_MARKER = "508965";

const AIRLINE_COLORS: Record<string, string> = {
  AF: "#002157", BA: "#1B3D6D", LH: "#05164D", KL: "#00A1DE",
  SN: "#003B5C", VY: "#FFD100", FR: "#073590", U2: "#FF6600",
  W6: "#C6007E", EW: "#A6003F", IB: "#D71921", LX: "#E2001A",
  OS: "#E2001A", TK: "#C7202F", EK: "#D71920", QR: "#5C0632",
  DL: "#003366", AA: "#B61E2C", UA: "#002244", TP: "#E4002B",
  EI: "#00634A", AY: "#0B1560", SK: "#000066", AC: "#F01428",
};

function AirlineLogo({ code }: { code: string }) {
  const bg = AIRLINE_COLORS[code] || "#E8652A";
  return (
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-md flex-shrink-0"
      style={{ backgroundColor: bg }}
    >
      {code}
    </div>
  );
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
  ECONOMY: "Éco", PREMIUM_ECONOMY: "Premium Éco", BUSINESS: "Business", FIRST: "Première",
};

interface FlightResultCardProps {
  flight: FlightResult;
  onSelect?: () => void;
  isSelected?: boolean;
}

export default function FlightResultCard({ flight, onSelect, isSelected }: FlightResultCardProps) {
  const stopsLabel = flight.stops === 0 ? "Direct" : `${flight.stops} escale${flight.stops > 1 ? "s" : ""}`;
  const stopsColor = flight.stops === 0 ? "text-emerald-500" : flight.stops === 1 ? "text-amber-500" : "text-red-400";

  // --- CORRECTION DU LIEN D'AFFILIATION ---
  const getAffiliateLink = () => {
    const d = new Date(flight.departureTime);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');

    // Format attendu par Aviasales: /search/ORIGINDDMMDEST1
    // Le '1' à la fin indique 1 passager adulte.
    const searchPath = `${flight.origin}${day}${month}${flight.destination}1`;

    return `https://www.aviasales.com/search/${searchPath}?marker=${TRAVELPAYOUTS_MARKER}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.3 }}
      onClick={onSelect}
      className={`group bg-white dark:bg-[#141412] rounded-2xl overflow-hidden transition-all duration-400 cursor-pointer card-3d border ${isSelected
          ? "border-accent/50 shadow-[0_0_30px_-5px_rgba(232,101,42,0.3)]"
          : "border-foreground/[0.06] hover:border-accent/30 hover:shadow-xl"
        }`}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <AirlineLogo code={flight.airline} />
            <div>
              <div className="font-bold text-foreground text-sm group-hover:text-accent transition-colors">{flight.airlineName}</div>
              <div className="text-xs text-foreground/40">{flight.flightNumber}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-accent">{flight.price}€</div>
            <div className="text-xs text-foreground/40">par personne</div>
          </div>
        </div>

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
              <div className="h-px flex-grow bg-foreground/15" />
              <Plane className="w-3 h-3 text-foreground/25 rotate-90" />
              <div className="h-px flex-grow bg-foreground/15" />
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

        {flight.returnFlight && (
          <div className="flex items-center gap-4 mb-3 pt-3 border-t border-foreground/[0.06]">
            <div className="text-center min-w-[60px]">
              <div className="text-lg font-bold text-foreground">{formatFlightTime(flight.returnFlight.departureTime)}</div>
              <div className="text-xs font-semibold text-accent">{flight.destination}</div>
            </div>
            <div className="flex-grow flex flex-col items-center gap-1">
              <div className="flex items-center gap-1 text-xs text-foreground/50">
                <Clock className="w-3 h-3" />
                <span>{flight.returnFlight.duration}</span>
              </div>
              <div className="w-full flex items-center gap-1">
                <div className="h-px flex-grow bg-foreground/15" />
                <Plane className="w-3 h-3 text-foreground/25 -rotate-90" />
                <div className="h-px flex-grow bg-foreground/15" />
              </div>
              <div className={`text-xs font-semibold ${flight.returnFlight.stops === 0 ? "text-emerald-500" : "text-amber-500"}`}>
                {flight.returnFlight.stops === 0 ? "Direct" : `${flight.returnFlight.stops} escale${flight.returnFlight.stops > 1 ? "s" : ""}`}
              </div>
            </div>
            <div className="text-center min-w-[60px]">
              <div className="text-lg font-bold text-foreground">{formatFlightTime(flight.returnFlight.arrivalTime)}</div>
              <div className="text-xs font-semibold text-accent">{flight.origin}</div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-foreground/[0.06]">
          <div className="flex items-center gap-3 text-xs text-foreground/50">
            <span className="tag-pill">
              {cabinLabels[flight.cabin] || flight.cabin}
            </span>
            <span className="flex items-center gap-1">
              <Luggage className="w-3.5 h-3.5" />
              {flight.baggage}
            </span>
            <span>{formatFlightDate(flight.departureTime)}</span>
          </div>

          <a
            href={getAffiliateLink()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-sm bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/20 transition-all duration-300"
          >
            Voir l&apos;offre <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}