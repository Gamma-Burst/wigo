/**
 * Flight Provider — Amadeus Flight APIs
 * Handles flight search, pricing, inspiration, and booking.
 */

import { amadeusGet, amadeusPost, formatDate } from "./amadeus-client";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface FlightSegment {
  departure: { iataCode: string; terminal?: string; at: string };
  arrival: { iataCode: string; terminal?: string; at: string };
  carrierCode: string;
  number: string;
  aircraft: string;
  duration: string;
  numberOfStops: number;
}

export interface FlightOffer {
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  price: {
    currency: string;
    total: string;
    base: string;
    grandTotal: string;
  };
  pricingOptions: { fareType: string[]; includedCheckedBagsOnly: boolean };
  validatingAirlineCodes: string[];
  itineraries: Array<{
    duration: string;
    segments: FlightSegment[];
  }>;
  travelerPricings: Array<{
    travelerId: string;
    fareOption: string;
    travelerType: string;
    fareDetailsBySegment: Array<{
      segmentId: string;
      cabin: string;
      fareBasis: string;
      class: string;
      includedCheckedBags?: { weight?: number; weightUnit?: string; quantity?: number };
    }>;
  }>;
}

export interface FlightSearchResult {
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
  rawOffer: FlightOffer;
}

export interface FlightInspiration {
  destination: string;
  departureDate: string;
  returnDate: string;
  price: { total: string };
}

// ─── Airline name lookup ──────────────────────────────────────────────────────
const AIRLINE_NAMES: Record<string, string> = {
  AF: "Air France", BA: "British Airways", LH: "Lufthansa", KL: "KLM",
  SN: "Brussels Airlines", VY: "Vueling", FR: "Ryanair", U2: "easyJet",
  W6: "Wizz Air", EW: "Eurowings", IB: "Iberia", AZ: "ITA Airways",
  LX: "Swiss", OS: "Austrian Airlines", SK: "SAS", AY: "Finnair",
  TP: "TAP Portugal", EI: "Aer Lingus", TK: "Turkish Airlines", EK: "Emirates",
  QR: "Qatar Airways", EY: "Etihad", DL: "Delta", AA: "American Airlines",
  UA: "United Airlines", AC: "Air Canada",
};

function getAirlineName(code: string, dictionaries?: Record<string, unknown>): string {
  // Try dictionaries from Amadeus response first
  if (dictionaries?.carriers) {
    const carriers = dictionaries.carriers as Record<string, string>;
    if (carriers[code]) return carriers[code];
  }
  return AIRLINE_NAMES[code] || code;
}

// ─── Duration formatter ───────────────────────────────────────────────────────
function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return isoDuration;
  const h = match[1] || "0";
  const m = match[2] || "0";
  return `${h}h${m.padStart(2, "0")}`;
}

// ─── Search Flights ───────────────────────────────────────────────────────────
export async function searchFlights(params: {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults?: number;
  cabin?: string;
  maxPrice?: number;
  nonStop?: boolean;
  max?: number;
}): Promise<FlightSearchResult[]> {
  const queryParams: Record<string, string | number | boolean | undefined> = {
    originLocationCode: params.origin.toUpperCase(),
    destinationLocationCode: params.destination.toUpperCase(),
    departureDate: params.departDate,
    returnDate: params.returnDate || undefined,
    adults: params.adults || 1,
    travelClass: params.cabin?.toUpperCase() || undefined,
    maxPrice: params.maxPrice || undefined,
    nonStop: params.nonStop || undefined,
    max: params.max || 15,
    currencyCode: "EUR",
  };

  const result = await amadeusGet<FlightOffer>("/v2/shopping/flight-offers", queryParams);
  if (!result?.data?.length) return [];

  const dictionaries = (result as unknown as { dictionaries?: Record<string, unknown> }).dictionaries;

  return result.data.map((offer) => {
    const outbound = offer.itineraries[0];
    const returnItin = offer.itineraries[1];
    const firstSeg = outbound.segments[0];
    const lastSeg = outbound.segments[outbound.segments.length - 1];
    const mainCarrier = offer.validatingAirlineCodes[0] || firstSeg.carrierCode;
    const fareDetail = offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0];

    const stopCities = outbound.segments.length > 1
      ? outbound.segments.slice(0, -1).map(s => s.arrival.iataCode)
      : [];

    const baggage = fareDetail?.includedCheckedBags
      ? fareDetail.includedCheckedBags.quantity
        ? `${fareDetail.includedCheckedBags.quantity} bagage(s)`
        : fareDetail.includedCheckedBags.weight
          ? `${fareDetail.includedCheckedBags.weight}${fareDetail.includedCheckedBags.weightUnit}`
          : "Bagage inclus"
      : "Bagage cabine uniquement";

    return {
      id: offer.id,
      airline: mainCarrier,
      airlineName: getAirlineName(mainCarrier, dictionaries),
      flightNumber: `${firstSeg.carrierCode}${firstSeg.number}`,
      origin: firstSeg.departure.iataCode,
      destination: lastSeg.arrival.iataCode,
      departureTime: firstSeg.departure.at,
      arrivalTime: lastSeg.arrival.at,
      duration: formatDuration(outbound.duration),
      stops: outbound.segments.length - 1,
      stopCities,
      price: Math.round(parseFloat(offer.price.grandTotal)),
      currency: offer.price.currency,
      cabin: fareDetail?.cabin || "ECONOMY",
      baggage,
      returnFlight: returnItin
        ? {
            departureTime: returnItin.segments[0].departure.at,
            arrivalTime: returnItin.segments[returnItin.segments.length - 1].arrival.at,
            duration: formatDuration(returnItin.duration),
            stops: returnItin.segments.length - 1,
          }
        : undefined,
      rawOffer: offer,
    };
  });
}

// ─── Price Confirmation ───────────────────────────────────────────────────────
export async function confirmFlightPrice(offer: FlightOffer): Promise<{
  confirmed: boolean;
  price?: { total: string; currency: string };
  error?: string;
}> {
  const result = await amadeusPost<{ flightOffers: FlightOffer[] }>(
    "/v1/shopping/flight-offers/pricing",
    {
      data: { type: "flight-offers-pricing", flightOffers: [offer] },
    }
  );

  if (!result?.data) {
    return { confirmed: false, error: "Impossible de confirmer le prix" };
  }

  const pricedOffer = (result.data as unknown as { flightOffers: FlightOffer[] }).flightOffers?.[0];
  if (!pricedOffer) {
    return { confirmed: false, error: "Vol non disponible" };
  }

  return {
    confirmed: true,
    price: {
      total: pricedOffer.price.grandTotal,
      currency: pricedOffer.price.currency,
    },
  };
}

// ─── Flight Inspiration (Cheapest Destinations) ──────────────────────────────
export async function getFlightInspiration(
  origin: string,
  maxPrice?: number
): Promise<FlightInspiration[]> {
  const result = await amadeusGet<FlightInspiration>("/v1/shopping/flight-destinations", {
    origin: origin.toUpperCase(),
    maxPrice: maxPrice || undefined,
  });

  return result?.data || [];
}

// ─── Cheapest Dates ───────────────────────────────────────────────────────────
export async function getCheapestDates(
  origin: string,
  destination: string
): Promise<Array<{ departureDate: string; returnDate: string; price: { total: string } }>> {
  const result = await amadeusGet<{
    departureDate: string;
    returnDate: string;
    price: { total: string };
  }>("/v1/shopping/flight-dates", {
    origin: origin.toUpperCase(),
    destination: destination.toUpperCase(),
  });

  return result?.data || [];
}

// ─── Utilities ────────────────────────────────────────────────────────────────
export { formatDate, formatDuration };
