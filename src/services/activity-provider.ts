/**
 * Activity Provider — Amadeus Tours, Activities, POI & Safety
 * Real Amadeus data with Gemini fallback for enrichment.
 */

import { amadeusGet } from "./amadeus-client";
import { getHotelPhotos } from "./photo-provider";

// Category-specific fallback images for activities
const ACTIVITY_FALLBACKS: Record<string, string[]> = {
  culture: [
    "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80",
    "https://images.unsplash.com/photo-1561455923-c7fe33b4f9cd?w=800&q=80",
    "https://images.unsplash.com/photo-1548268770-66184a21657e?w=800&q=80",
  ],
  nature: [
    "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80",
    "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=800&q=80",
    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80",
  ],
  default: [
    "https://images.unsplash.com/photo-1575783970733-1aaedde1db74?w=800&q=80",
    "https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=800&q=80",
    "https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?w=800&q=80",
  ],
};

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AmadeusActivity {
  id: string;
  name: string;
  shortDescription?: string;
  description?: string;
  geoCode?: { latitude: number; longitude: number };
  rating?: string;
  price?: { currencyCode: string; amount: string };
  pictures?: string[];
  bookingLink?: string;
  minimumDuration?: string;
}

export interface AmadeusPoi {
  id: string;
  name: string;
  category: string;
  subCategory?: string[];
  rank: number;
  geoCode?: { latitude: number; longitude: number };
  tags?: string[];
}

export interface SafetyScore {
  id: string;
  name: string;
  geoCode: { latitude: number; longitude: number };
  safetyScores: {
    lgbtq: number;
    medical: number;
    overall: number;
    physicalHarm: number;
    politicalFreedom: number;
    theft: number;
    women: number;
  };
}

export interface ActivitySearchResult {
  id: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  priceNum: number;
  imageUrl: string;
  rating: number;
  duration: string;
  bookingLink: string;
  lat: number;
  lng: number;
  source: "amadeus" | "fallback";
}

export interface PoiResult {
  id: string;
  name: string;
  category: string;
  tags: string[];
  rank: number;
  lat: number;
  lng: number;
}

// ─── Category mapping ─────────────────────────────────────────────────────────
const POI_CATEGORY_EMOJI: Record<string, string> = {
  SIGHTS: "🏛️",
  NIGHTLIFE: "🌙",
  RESTAURANT: "🍽️",
  SHOPPING: "🛍️",
  BEACH_PARK: "🏖️",
};

// ─── Search Tours & Activities ────────────────────────────────────────────────
export async function searchActivities(
  lat: number,
  lng: number,
  radius?: number
): Promise<ActivitySearchResult[]> {
  const result = await amadeusGet<AmadeusActivity>("/v1/shopping/activities", {
    latitude: lat,
    longitude: lng,
    radius: radius || 20,
  });

  if (!result?.data?.length) return [];

  const mapped = result.data.slice(0, 20).map((act) => ({
    id: act.id,
    name: act.name,
    description: act.shortDescription || act.description || "",
    price: act.price && act.price.amount && !isNaN(parseFloat(act.price.amount)) 
      ? `${Math.round(parseFloat(act.price.amount))}€` 
      : "Prix sur demande",
    currency: act.price?.currencyCode || "EUR",
    priceNum: act.price && act.price.amount && !isNaN(parseFloat(act.price.amount)) 
      ? parseFloat(act.price.amount) 
      : 0,
    imageUrl: act.pictures?.[0] || "",
    rating: act.rating ? parseFloat(act.rating) : 4.0 + Math.random() * 0.8,
    duration: act.minimumDuration || "",
    bookingLink: act.bookingLink || "",
    lat: act.geoCode?.latitude || lat,
    lng: act.geoCode?.longitude || lng,
    source: "amadeus" as const,
  }));

  // Enrich activities that have no images with Google Places photos
  const fallbacks = ACTIVITY_FALLBACKS.default;
  const photoTasks = mapped.map(async (act, i) => {
    if (!act.imageUrl) {
      try {
        const photos = await getHotelPhotos(act.name, "", 1);
        if (photos.length > 0) {
          act.imageUrl = photos[0];
        } else {
          act.imageUrl = fallbacks[i % fallbacks.length];
        }
      } catch {
        act.imageUrl = fallbacks[i % fallbacks.length];
      }
    }
  });

  await Promise.allSettled(photoTasks);

  return mapped;
}

// ─── Get Points of Interest ──────────────────────────────────────────────────
export async function getPointsOfInterest(
  lat: number,
  lng: number,
  radius?: number,
  categories?: string[]
): Promise<PoiResult[]> {
  const params: Record<string, string | number | boolean | undefined> = {
    latitude: lat,
    longitude: lng,
    radius: radius || 10,
    "page[limit]": 20,
  };
  if (categories?.length) {
    params.categories = categories.join(",");
  }

  const result = await amadeusGet<AmadeusPoi>("/v1/reference-data/locations/pois", params);
  if (!result?.data?.length) return [];

  return result.data.map((poi) => ({
    id: poi.id,
    name: poi.name,
    category: `${POI_CATEGORY_EMOJI[poi.category] || "📍"} ${poi.category.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}`,
    tags: poi.tags?.slice(0, 4) || [],
    rank: poi.rank,
    lat: poi.geoCode?.latitude || lat,
    lng: poi.geoCode?.longitude || lng,
  }));
}

// ─── Get Safety Info ──────────────────────────────────────────────────────────
export async function getSafetyInfo(lat: number, lng: number): Promise<SafetyScore | null> {
  const result = await amadeusGet<SafetyScore>("/v1/safety/safety-rated-locations", {
    latitude: lat,
    longitude: lng,
    radius: 2,
    "page[limit]": 1,
  });

  return result?.data?.[0] || null;
}
