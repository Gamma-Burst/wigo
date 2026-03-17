/**
 * Hotel Provider — Enhanced Amadeus Hotel APIs
 * Hotel List, Hotel Search (offers), Hotel Ratings, Hotel Booking.
 */

import { HotelResult } from "@/components/SearchResultCard";
import { SearchFilters } from "./ai-filters";
import { amadeusGet, amadeusPost, getDefaultCheckIn, getDefaultCheckOut } from "./amadeus-client";

const IMAGES = [
  "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
  "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
  "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80",
  "https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&q=80",
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
];

// ─── IATA city codes ──────────────────────────────────────────────────────────
const CITY_IATA: Record<string, string> = {
  "bruxelles": "BRU", "brussels": "BRU",
  "liege": "LGG", "liège": "LGG",
  "charleroi": "CRL",
  "anvers": "ANR", "antwerpen": "ANR", "antwerp": "ANR",
  "gent": "GNE", "gand": "GNE",
  "bruges": "OST", "ostende": "OST",
  "namur": "QNM", "mons": "QMX",
  "spa": "LGG", "durbuy": "LGG", "dinant": "LGG",
  "bastogne": "LGG", "arlon": "LUX", "tournai": "LIL",
  "verviers": "LGG", "hasselt": "BRU", "leuven": "BRU",
  // France
  "paris": "PAR", "lyon": "LYS", "marseille": "MRS",
  "bordeaux": "BOD", "toulouse": "TLS", "nice": "NCE",
  "strasbourg": "SXB", "lille": "LIL", "nantes": "NTE",
  "montpellier": "MPL", "rennes": "RNS",
  // Europe
  "amsterdam": "AMS", "london": "LON", "rome": "ROM", "roma": "ROM",
  "madrid": "MAD", "barcelona": "BCN", "berlin": "BER",
  "munich": "MUC", "vienna": "VIE", "lisbon": "LIS", "lisbonne": "LIS",
  "prague": "PRG", "budapest": "BUD", "warsaw": "WAW", "varsovie": "WAW",
  "zurich": "ZRH", "geneva": "GVA", "genève": "GVA", "milan": "MIL",
  "luxembourg": "LUX", "cologne": "CGN", "frankfurt": "FRA",
  "rotterdam": "RTM", "stockholm": "STO", "oslo": "OSL",
  "copenhagen": "CPH", "copenhague": "CPH",
  "dublin": "DUB", "edinburgh": "EDI", "athens": "ATH", "athènes": "ATH",
  "istanbul": "IST", "dubai": "DXB", "marrakech": "RAK",
  "new york": "NYC", "los angeles": "LAX", "tokyo": "TYO",
  "bangkok": "BKK", "bali": "DPS", "cancun": "CUN",
};

function getCityIata(location: string): string | null {
  const l = location.toLowerCase()
    .replace(/(belgique|belgium|france|europe|hotel|hôtel|ville\s+de|de\s+)/gi, "")
    .trim();

  for (const [key, code] of Object.entries(CITY_IATA)) {
    if (l.includes(key)) return code;
  }

  const firstWord = l.split(/[\s,]+/)[0];
  if (firstWord && firstWord.length > 4) {
    return firstWord.slice(0, 3).toUpperCase();
  }
  return null;
}

// ─── Coordonnées ──────────────────────────────────────────────────────────────
const COORDS: Record<string, { lat: number; lng: number }> = {
  "bruxelles": { lat: 50.8503, lng: 4.3517 }, "brussels": { lat: 50.8503, lng: 4.3517 },
  "liege": { lat: 50.6326, lng: 5.5797 }, "namur": { lat: 50.4674, lng: 4.8719 },
  "mons": { lat: 50.4542, lng: 3.9567 }, "charleroi": { lat: 50.4114, lng: 4.4436 },
  "bruges": { lat: 51.2093, lng: 3.2247 }, "gent": { lat: 51.0543, lng: 3.7174 },
  "gand": { lat: 51.0543, lng: 3.7174 }, "anvers": { lat: 51.2194, lng: 4.4025 },
  "spa": { lat: 50.4927, lng: 5.8647 }, "durbuy": { lat: 50.3524, lng: 5.4562 },
  "dinant": { lat: 50.2608, lng: 4.9122 }, "bouillon": { lat: 49.7297, lng: 5.0694 },
  "ardennes": { lat: 50.25, lng: 5.5 }, "bastogne": { lat: 50.0038, lng: 5.7192 },
  "tournai": { lat: 50.6064, lng: 3.3882 }, "arlon": { lat: 49.6853, lng: 5.8167 },
  "paris": { lat: 48.8566, lng: 2.3522 }, "amsterdam": { lat: 52.3676, lng: 4.9041 },
  "london": { lat: 51.5074, lng: -0.1278 }, "luxembourg": { lat: 49.6116, lng: 6.1319 },
  "madrid": { lat: 40.4168, lng: -3.7038 }, "barcelona": { lat: 41.3851, lng: 2.1734 },
  "rome": { lat: 41.9028, lng: 12.4964 }, "berlin": { lat: 52.5200, lng: 13.4050 },
  "munich": { lat: 48.1351, lng: 11.5820 }, "vienna": { lat: 48.2082, lng: 16.3738 },
  "prague": { lat: 50.0755, lng: 14.4378 }, "nice": { lat: 43.7102, lng: 7.2620 },
  "lyon": { lat: 45.7640, lng: 4.8357 }, "lisbon": { lat: 38.7223, lng: -9.1393 },
  "istanbul": { lat: 41.0082, lng: 28.9784 }, "dubai": { lat: 25.2048, lng: 55.2708 },
  "marrakech": { lat: 31.6295, lng: -7.9811 }, "new york": { lat: 40.7128, lng: -74.0060 },
  "tokyo": { lat: 35.6762, lng: 139.6503 }, "bangkok": { lat: 13.7563, lng: 100.5018 },
};

export function getCoords(location: string): { lat: number; lng: number } {
  const l = location.toLowerCase().trim();
  for (const [key, coords] of Object.entries(COORDS)) {
    if (l.includes(key)) return coords;
  }
  return { lat: 50.5039, lng: 4.4699 }; // Centre Belgique
}

// ─── Amadeus Hotel Data Types ─────────────────────────────────────────────────
interface AmadeusHotelListItem {
  hotelId: string;
  name?: string;
  geoCode?: { latitude: number; longitude: number };
}

interface AmadeusHotelOffer {
  available?: boolean;
  hotel: {
    hotelId: string;
    name: string;
    latitude: number;
    longitude: number;
    amenities?: string[];
    rating?: string;
    cityCode?: string;
  };
  offers: Array<{
    id: string;
    price: { total: string; currency: string; base?: string };
    room?: {
      typeEstimated?: { category?: string; beds?: number; bedType?: string };
      description?: { text?: string };
    };
    policies?: {
      cancellation?: { type?: string; description?: { text?: string } };
      guarantee?: { acceptedPayments?: { methods: string[] } };
    };
    boardType?: string;
    checkInDate?: string;
    checkOutDate?: string;
  }>;
}

// ─── Enhanced Hotel Result ────────────────────────────────────────────────────
export interface EnhancedHotelResult extends HotelResult {
  offerId?: string;
  roomType?: string;
  roomDescription?: string;
  boardType?: string;
  cancellationPolicy?: string;
  freeCancellation?: boolean;
  priceNum?: number;
  currency?: string;
  checkIn?: string;
  checkOut?: string;
  hotelRating?: number;
  cityCode?: string;
}

// ─── Step 1: Hotel List API → liste des hotelIds ──────────────────────────────
async function getHotelIds(cityCode: string): Promise<string[]> {
  const result = await amadeusGet<AmadeusHotelListItem>(
    "/v1/reference-data/locations/hotels/by-city",
    {
      cityCode,
      radius: 20,
      radiusUnit: "KM",
      ratings: "3,4,5",
      hotelSource: "ALL",
    }
  );

  if (!result?.data?.length) {
    console.warn(`Hotel List: aucun hôtel pour cityCode=${cityCode}`);
    return [];
  }

  const ids = result.data
    .slice(0, 30) // Increased from 15 to 30
    .map((h) => h.hotelId)
    .filter(Boolean);

  console.log(`Hotel List: ${ids.length} hôtels trouvés pour ${cityCode}`);
  return ids;
}

// ─── Step 2: Hotel Search API v3 → offres avec prix ──────────────────────────
async function getHotelOffers(
  hotelIds: string[],
  checkIn?: string,
  checkOut?: string,
  adults?: number
): Promise<EnhancedHotelResult[]> {
  if (hotelIds.length === 0) return [];

  const ci = checkIn || getDefaultCheckIn();
  const co = checkOut || getDefaultCheckOut();

  // Batch in groups of 5 (Amadeus limit) and run up to 4 batches
  const batches: string[][] = [];
  for (let i = 0; i < Math.min(hotelIds.length, 20); i += 5) {
    batches.push(hotelIds.slice(i, i + 5));
  }

  const allResults: EnhancedHotelResult[] = [];
  let imgIndex = 0;

  for (const batch of batches) {
    const batchStr = batch.join(",");
    const result = await amadeusGet<AmadeusHotelOffer>("/v3/shopping/hotel-offers", {
      hotelIds: batchStr,
      checkInDate: ci,
      checkOutDate: co,
      adults: adults || 2,
      roomQuantity: 1,
      currency: "EUR",
      bestRateOnly: true,
    });

    if (!result?.data?.length) continue;

    const mapped = result.data
      .filter((item) => item.available !== false)
      .map((item) => {
        const h = item.hotel;
        const offer = item.offers?.[0];
        const priceNum = offer?.price?.total ? Math.round(parseFloat(offer.price.total)) : null;
        const price = priceNum ? `${priceNum}€ / nuit` : "Prix sur demande";
        const rating = h.rating ? parseInt(h.rating) : 3;
        const vibeScore = Math.min(99, 65 + rating * 6 + Math.floor(Math.random() * 8));

        const amenities = h.amenities?.slice(0, 3).map((a: string) =>
          a.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())
        ) || ["Wi-Fi", "Petit déjeuner", "Parking"];

        const freeCancellation = offer?.policies?.cancellation?.type !== "FULL_STAY";
        const roomType = offer?.room?.typeEstimated?.category
          ? offer.room.typeEstimated.category.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
          : undefined;

        const boardLabels: Record<string, string> = {
          ROOM_ONLY: "Chambre seule",
          BREAKFAST: "Petit-déjeuner inclus",
          HALF_BOARD: "Demi-pension",
          FULL_BOARD: "Pension complète",
          ALL_INCLUSIVE: "Tout inclus",
        };

        const currentImg = IMAGES[imgIndex % IMAGES.length];
        imgIndex++;

        return {
          id: h.hotelId,
          name: h.name.split(" ").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" "),
          price,
          imageUrl: currentImg,
          vibeScore,
          tags: [...amenities],
          lat: h.latitude,
          lng: h.longitude,
          weather: (["sunny", "cloudy", "rainy"] as const)[Math.floor(Math.random() * 3)],
          // Enhanced fields
          offerId: offer?.id,
          roomType,
          roomDescription: offer?.room?.description?.text,
          boardType: offer?.boardType ? (boardLabels[offer.boardType] || offer.boardType) : undefined,
          cancellationPolicy: offer?.policies?.cancellation?.description?.text,
          freeCancellation,
          priceNum: priceNum ?? undefined,
          currency: offer?.price?.currency || "EUR",
          checkIn: ci,
          checkOut: co,
          hotelRating: rating,
          cityCode: h.cityCode,
        } as EnhancedHotelResult;
      });

    allResults.push(...mapped);
  }

  return allResults;
}

// ─── Hotel Ratings / Sentiments ───────────────────────────────────────────────
export interface HotelSentiment {
  hotelId: string;
  overallRating: number;
  numberOfReviews: number;
  numberOfRatings: number;
  sentiments: {
    sleepQuality: number;
    service: number;
    facilities: number;
    roomComforts: number;
    valueForMoney: number;
    catering: number;
    location: number;
    pointsOfInterest: number;
    staff: number;
    internet?: number;
    swimmingPool?: number;
  };
}

export async function getHotelRatings(hotelIds: string[]): Promise<HotelSentiment[]> {
  if (hotelIds.length === 0) return [];

  const result = await amadeusGet<HotelSentiment>("/v2/e-reputation/hotel-sentiments", {
    hotelIds: hotelIds.slice(0, 3).join(","),
  });

  return result?.data || [];
}

// ─── Hotel Booking ────────────────────────────────────────────────────────────
export interface HotelBookingRequest {
  offerId: string;
  guests: Array<{
    name: { title: string; firstName: string; lastName: string };
    contact: { email: string; phone: string };
  }>;
  payment?: {
    method: string;
    card?: {
      vendorCode: string;
      cardNumber: string;
      expiryDate: string;
    };
  };
}

export interface HotelBookingResult {
  success: boolean;
  bookingId?: string;
  providerConfirmationId?: string;
  error?: string;
}

export async function bookHotel(request: HotelBookingRequest): Promise<HotelBookingResult> {
  const body = {
    data: {
      offerId: request.offerId,
      guests: request.guests,
      payments: request.payment ? [{
        method: request.payment.method,
        card: request.payment.card,
      }] : undefined,
    },
  };

  const result = await amadeusPost<Array<{
    id: string;
    providerConfirmationId?: string;
    type: string;
  }>>("/v1/booking/hotel-bookings", body);

  if (!result?.data) {
    return { success: false, error: "Réservation impossible" };
  }

  const booking = Array.isArray(result.data) ? result.data[0] : result.data;
  return {
    success: true,
    bookingId: booking?.id,
    providerConfirmationId: booking?.providerConfirmationId,
  };
}

// ─── Fallback ─────────────────────────────────────────────────────────────────
function buildFallback(filters: SearchFilters): EnhancedHotelResult[] {
  const coords = getCoords(filters.location);
  const loc = filters.location
    .replace(/(belgique|belgium|france|europe)/gi, "")
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());
  const maxP = filters.max_price;

  return [
    {
      id: "mock1", name: `Lodge Premium – ${loc}`,
      price: `${maxP ? maxP - 40 : 149}€ / nuit`, imageUrl: IMAGES[0], vibeScore: 96,
      tags: [filters.amenities?.[0] || "Spa", "Vue Panoramique", "Proche Centre"],
      lat: coords.lat + (Math.random() - 0.5) * 0.04, lng: coords.lng + (Math.random() - 0.5) * 0.04,
      weather: "sunny" as const, freeCancellation: true, priceNum: maxP ? maxP - 40 : 149, hotelRating: 5,
    },
    {
      id: "mock2", name: `Hôtel Boutique – ${loc}`,
      price: `${maxP ? maxP - 60 : 119}€ / nuit`, imageUrl: IMAGES[1], vibeScore: 91,
      tags: ["Petit-déjeuner inclus", "Design", "Calme"],
      lat: coords.lat + (Math.random() - 0.5) * 0.04, lng: coords.lng + (Math.random() - 0.5) * 0.04,
      weather: "cloudy" as const, freeCancellation: true, priceNum: maxP ? maxP - 60 : 119, hotelRating: 4,
    },
    {
      id: "mock3", name: `Grand Hôtel – ${loc}`,
      price: `${maxP ? maxP - 20 : 195}€ / nuit`, imageUrl: IMAGES[2], vibeScore: 88,
      tags: ["Piscine", "Restaurant Gastronomique", "Parking"],
      lat: coords.lat + (Math.random() - 0.5) * 0.04, lng: coords.lng + (Math.random() - 0.5) * 0.04,
      weather: "rainy" as const, freeCancellation: false, priceNum: maxP ? maxP - 20 : 195, hotelRating: 4,
    },
    {
      id: "mock4", name: `Château Séjour – ${loc}`,
      price: `${maxP ? maxP + 20 : 249}€ / nuit`, imageUrl: IMAGES[5], vibeScore: 98,
      tags: ["Romantique", "Table Étoilée", "Parc Privé"],
      lat: coords.lat + (Math.random() - 0.5) * 0.04, lng: coords.lng + (Math.random() - 0.5) * 0.04,
      weather: "sunny" as const, freeCancellation: true, priceNum: maxP ? maxP + 20 : 249, hotelRating: 5,
    },
  ];
}

// ─── Export principal ─────────────────────────────────────────────────────────
export async function searchHotels(filters: SearchFilters): Promise<EnhancedHotelResult[]> {
  const cityCode = getCityIata(filters.location);
  console.log(`🔍 Recherche: "${filters.location}" → cityCode: ${cityCode}`);

  if (cityCode) {
    const hotelIds = await getHotelIds(cityCode);

    if (hotelIds.length > 0) {
      const results = await getHotelOffers(
        hotelIds,
        filters.checkIn,
        filters.checkOut,
        filters.guests
      );

      if (results.length > 0) {
        console.log(`✅ Amadeus: ${results.length} hôtels réels pour "${filters.location}"`);
        return results;
      }
    }
  }

  console.warn(`⚠️ Fallback pour: "${filters.location}"`);
  return buildFallback(filters);
}

export { getCityIata, getCoords as getCoordsForCity };