/**
 * Location Provider — Amadeus Airport & City Search
 * Used for autocomplete in flight search and location resolution.
 */

import { amadeusGet } from "./amadeus-client";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface LocationResult {
  type: "airport" | "city";
  iataCode: string;
  name: string;
  cityName: string;
  countryCode: string;
  countryName: string;
  lat?: number;
  lng?: number;
}

interface AmadeusLocation {
  type: string;
  subType: string;
  name: string;
  iataCode: string;
  address?: {
    cityName?: string;
    cityCode?: string;
    countryName?: string;
    countryCode?: string;
  };
  geoCode?: { latitude: number; longitude: number };
}

// ─── Search Airports & Cities ─────────────────────────────────────────────────
export async function searchLocations(keyword: string, subType?: string): Promise<LocationResult[]> {
  if (!keyword || keyword.length < 2) return [];

  const result = await amadeusGet<AmadeusLocation>("/v1/reference-data/locations", {
    keyword: keyword.toUpperCase(),
    subType: subType || "CITY,AIRPORT",
    "page[limit]": 10,
    sort: "analytics.travelers.score",
    view: "LIGHT",
  });

  if (!result?.data) return [];

  return result.data.map((loc) => ({
    type: loc.subType === "AIRPORT" ? "airport" as const : "city" as const,
    iataCode: loc.iataCode,
    name: loc.name,
    cityName: loc.address?.cityName || loc.name,
    countryCode: loc.address?.countryCode || "",
    countryName: loc.address?.countryName || "",
    lat: loc.geoCode?.latitude,
    lng: loc.geoCode?.longitude,
  }));
}

// ─── Search Cities Only ───────────────────────────────────────────────────────
export async function searchCities(keyword: string): Promise<LocationResult[]> {
  return searchLocations(keyword, "CITY");
}

// ─── Nearest Airport ──────────────────────────────────────────────────────────
export async function getNearestAirport(lat: number, lng: number): Promise<LocationResult[]> {
  const result = await amadeusGet<AmadeusLocation>("/v1/reference-data/locations/airports", {
    latitude: lat,
    longitude: lng,
    radius: 100,
    "page[limit]": 5,
    sort: "relevance",
  });

  if (!result?.data) return [];

  return result.data.map((loc) => ({
    type: "airport" as const,
    iataCode: loc.iataCode,
    name: loc.name,
    cityName: loc.address?.cityName || loc.name,
    countryCode: loc.address?.countryCode || "",
    countryName: loc.address?.countryName || "",
    lat: loc.geoCode?.latitude,
    lng: loc.geoCode?.longitude,
  }));
}
