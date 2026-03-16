import { HotelResult } from "@/components/SearchResultCard";
import { SearchFilters } from "./ai-filters";

const AMADEUS_CLIENT_ID = process.env.AMADEUS_CLIENT_ID;
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET;

// ✅ PRODUCTION endpoint (was "test.api.amadeus.com")
const AMADEUS_BASE = "https://api.amadeus.com";

const UNSPLASH_HOTEL_IMAGES = [
  "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
  "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
  "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80",
];

// ─── Token cache ─────────────────────────────────────────────────────────────
let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getAmadeusToken(): Promise<string | null> {
  if (!AMADEUS_CLIENT_ID || !AMADEUS_CLIENT_SECRET) return null;
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  try {
    const res = await fetch(`${AMADEUS_BASE}/v1/security/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=client_credentials&client_id=${AMADEUS_CLIENT_ID}&client_secret=${AMADEUS_CLIENT_SECRET}`,
    });
    const data = await res.json();
    if (data.access_token) {
      cachedToken = data.access_token;
      tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
      return cachedToken;
    }
    return null;
  } catch (e) {
    console.error("Amadeus token error:", e);
    return null;
  }
}

// ─── City name → IATA code ───────────────────────────────────────────────────
const CITY_CODES: Record<string, string> = {
  paris: "PAR", lyon: "LYS", marseille: "MRS", bordeaux: "BOD", toulouse: "TLS",
  nice: "NCE", strasbourg: "SXB", rennes: "RNS", lille: "LIL", nantes: "NTE",
  annecy: "NCY", grenoble: "GNB", montpellier: "MPL", brest: "BES",
  bruxelles: "BRU", brussels: "BRU", mons: "QMX", liege: "LGG", liège: "LGG",
  gent: "GNE", gand: "GNE", bruges: "BRU", anvers: "ANR", antwerp: "ANR",
  namur: "QNM", charleroi: "CRL", tournai: "TUO",
  amsterdam: "AMS", london: "LON", rome: "ROM", madrid: "MAD",
  barcelona: "BCN", berlin: "BER", munich: "MUC", vienna: "VIE",
  lisbon: "LIS", prague: "PRG", budapest: "BUD", warsaw: "WAW",
  zurich: "ZRH", geneva: "GVA", milan: "MIL", florence: "FLR",
  luxembourg: "LUX", cologne: "CGN", frankfurt: "FRA",
};

function getCityCode(location: string): string | null {
  const normalized = location.toLowerCase().trim();
  for (const [key, code] of Object.entries(CITY_CODES)) {
    if (normalized.includes(key)) return code;
  }
  return normalized.slice(0, 3).toUpperCase();
}

// ─── Coordinates lookup ──────────────────────────────────────────────────────
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  bruxelles: { lat: 50.8503, lng: 4.3517 }, brussels: { lat: 50.8503, lng: 4.3517 },
  liege: { lat: 50.6326, lng: 5.5797 }, liège: { lat: 50.6326, lng: 5.5797 },
  namur: { lat: 50.4674, lng: 4.8719 }, mons: { lat: 50.4542, lng: 3.9567 },
  charleroi: { lat: 50.4114, lng: 4.4436 }, bruges: { lat: 51.2093, lng: 3.2247 },
  gand: { lat: 51.0543, lng: 3.7174 }, gent: { lat: 51.0543, lng: 3.7174 },
  anvers: { lat: 51.2194, lng: 4.4025 }, antwerp: { lat: 51.2194, lng: 4.4025 },
  ardennes: { lat: 50.25, lng: 5.5 }, durbuy: { lat: 50.3524, lng: 5.4562 },
  paris: { lat: 48.8566, lng: 2.3522 }, amsterdam: { lat: 52.3676, lng: 4.9041 },
  london: { lat: 51.5074, lng: -0.1278 }, luxembourg: { lat: 49.6116, lng: 6.1319 },
  madrid: { lat: 40.4168, lng: -3.7038 }, barcelona: { lat: 41.3851, lng: 2.1734 },
  rome: { lat: 41.9028, lng: 12.4964 }, milan: { lat: 45.4642, lng: 9.1900 },
  berlin: { lat: 52.5200, lng: 13.4050 }, munich: { lat: 48.1351, lng: 11.5820 },
  vienna: { lat: 48.2082, lng: 16.3738 }, prague: { lat: 50.0755, lng: 14.4378 },
};

function getCoordsForLocation(location: string): { lat: number; lng: number } {
  const locLower = location.toLowerCase().trim();
  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    if (locLower.includes(key)) return coords;
  }
  return { lat: 50.5039, lng: 4.4699 }; // Centre Belgique par défaut
}

// ─── Amadeus: Hotel list by city ─────────────────────────────────────────────
async function searchHotelsByCity(token: string, cityCode: string): Promise<string[]> {
  try {
    const res = await fetch(
      `${AMADEUS_BASE}/v1/reference-data/locations/hotels/by-city?cityCode=${cityCode}&radius=20&radiusUnit=KM&ratings=3,4,5`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    if (!data.data || data.data.length === 0) return [];
    return data.data.slice(0, 10).map((h: { hotelId: string }) => h.hotelId);
  } catch (e) {
    console.error("Amadeus hotel search error:", e);
    return [];
  }
}

// ─── Amadeus: Real offers with prices ────────────────────────────────────────
async function getHotelOffers(token: string, hotelIds: string[]): Promise<HotelResult[]> {
  if (hotelIds.length === 0) return [];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 7);
  const afterTomorrow = new Date();
  afterTomorrow.setDate(afterTomorrow.getDate() + 8);
  const checkIn = tomorrow.toISOString().split("T")[0];
  const checkOut = afterTomorrow.toISOString().split("T")[0];

  try {
    const idsParam = hotelIds.slice(0, 5).join(",");
    const res = await fetch(
      `${AMADEUS_BASE}/v3/shopping/hotel-offers?hotelIds=${idsParam}&checkInDate=${checkIn}&checkOutDate=${checkOut}&adults=2&roomQuantity=1&currency=EUR&bestRateOnly=true`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    if (!data.data || data.data.length === 0) return [];

    return data.data.slice(0, 5).map((item: {
      hotel: {
        hotelId: string; name: string;
        latitude: number; longitude: number;
        amenities?: string[]; rating?: string;
      };
      offers: Array<{ price: { total: string; currency: string } }>;
    }, index: number) => {
      const hotel = item.hotel;
      const offer = item.offers?.[0];
      const price = offer?.price?.total
        ? `${Math.round(parseFloat(offer.price.total))}€ / nuit`
        : "Prix sur demande";
      const rating = hotel.rating ? parseInt(hotel.rating) : 3;
      const vibeScore = Math.min(99, 70 + rating * 5 + Math.floor(Math.random() * 8));
      const amenities = hotel.amenities?.slice(0, 3).map((a: string) =>
        a.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())
      ) || ["Wi-Fi", "Petit déjeuner", "Parking"];

      return {
        id: hotel.hotelId,
        name: hotel.name,
        price,
        imageUrl: UNSPLASH_HOTEL_IMAGES[index % UNSPLASH_HOTEL_IMAGES.length],
        vibeScore,
        tags: amenities,
        lat: hotel.latitude,
        lng: hotel.longitude,
        weather: (["sunny", "cloudy", "rainy"] as const)[Math.floor(Math.random() * 3)],
      };
    });
  } catch (e) {
    console.error("Amadeus offers error:", e);
    return [];
  }
}

// ─── Contextual fallback data ─────────────────────────────────────────────────
function buildFallback(filters: SearchFilters): HotelResult[] {
  const coords = getCoordsForLocation(filters.location);
  const loc = filters.location;
  const maxP = filters.max_price;

  const hotels = [
    {
      name: `Lodge Premium – ${loc}`,
      price: `${maxP ? maxP - 40 : 149}€ / nuit`,
      vibeScore: 96,
      tags: [filters.amenities?.[0] || "Spa", "Vue Panoramique", "Proche Centre"],
      img: UNSPLASH_HOTEL_IMAGES[0],
      weather: "sunny" as const,
    },
    {
      name: `Hôtel Boutique – ${loc}`,
      price: `${maxP ? maxP - 60 : 119}€ / nuit`,
      vibeScore: 91,
      tags: ["Petit-déjeuner inclus", "Design", "Calme"],
      img: UNSPLASH_HOTEL_IMAGES[1],
      weather: "cloudy" as const,
    },
    {
      name: `Grand Hôtel – ${loc}`,
      price: `${maxP ? maxP - 20 : 195}€ / nuit`,
      vibeScore: 88,
      tags: ["Piscine", "Restaurant", "Parking Gratuit"],
      img: UNSPLASH_HOTEL_IMAGES[2],
      weather: "rainy" as const,
    },
    {
      name: `Château Séjour – ${loc}`,
      price: `${maxP ? maxP + 20 : 249}€ / nuit`,
      vibeScore: 98,
      tags: ["Romantique", "Table gastronomique", "Parc privé"],
      img: UNSPLASH_HOTEL_IMAGES[5],
      weather: "sunny" as const,
    },
  ];

  return hotels.map((h, i) => ({
    id: `mock${i + 1}`,
    name: h.name,
    price: h.price,
    imageUrl: h.img,
    vibeScore: h.vibeScore,
    tags: h.tags,
    lat: coords.lat + (Math.random() - 0.5) * 0.04,
    lng: coords.lng + (Math.random() - 0.5) * 0.04,
    weather: h.weather,
  }));
}

// ─── Main export ──────────────────────────────────────────────────────────────
export async function searchHotels(filters: SearchFilters): Promise<HotelResult[]> {
  const token = await getAmadeusToken();

  if (token) {
    const cityCode = getCityCode(filters.location);
    if (cityCode) {
      const hotelIds = await searchHotelsByCity(token, cityCode);
      if (hotelIds.length > 0) {
        const results = await getHotelOffers(token, hotelIds);
        if (results.length > 0) {
          console.log(`✅ Amadeus PROD: ${results.length} hôtels pour ${filters.location}`);
          return results;
        }
      }
    }
  }

  console.warn(`⚠️ Fallback contextuel pour: ${filters.location}`);
  return buildFallback(filters);
}
