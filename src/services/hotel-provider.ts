import { HotelResult } from "@/components/SearchResultCard";
import { SearchFilters } from "./ai-filters";

const AMADEUS_CLIENT_ID = process.env.AMADEUS_CLIENT_ID;
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET;
const AMADEUS_BASE = "https://api.amadeus.com";

const IMAGES = [
  "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
  "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
  "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80",
];

// ─── Token cache ──────────────────────────────────────────────────────────────
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

// ─── IATA city codes (pour Hotel List API) ────────────────────────────────────
// Ces codes sont des codes VILLES (pas aéroports) — format 3 lettres Amadeus
const CITY_IATA: Record<string, string> = {
  // Belgique
  "bruxelles": "BRU", "brussels": "BRU",
  "liege": "LGG", "liège": "LGG",
  "charleroi": "CRL",
  "anvers": "ANR", "antwerpen": "ANR", "antwerp": "ANR",
  "gent": "GNE", "gand": "GNE",
  "bruges": "OST", // Bruges → Ostende (le plus proche avec hôtels Amadeus)
  "ostende": "OST",
  "namur": "QNM",
  "mons": "QMX",
  "spa": "LGG",    // Spa → Liège (même zone hôtelière Amadeus)
  "durbuy": "LGG", // Durbuy → Liège
  "dinant": "LGG", // Dinant → Liège
  "bastogne": "LGG",
  "arlon": "LUX",  // Arlon → Luxembourg
  "tournai": "LIL", // Tournai → Lille
  "verviers": "LGG",
  "hasselt": "BRU",
  "leuven": "BRU",
  // France
  "paris": "PAR", "lyon": "LYS", "marseille": "MRS",
  "bordeaux": "BOD", "toulouse": "TLS", "nice": "NCE",
  "strasbourg": "SXB", "lille": "LIL", "nantes": "NTE",
  // Europe
  "amsterdam": "AMS", "london": "LON", "rome": "ROM",
  "madrid": "MAD", "barcelona": "BCN", "berlin": "BER",
  "munich": "MUC", "vienna": "VIE", "lisbon": "LIS",
  "prague": "PRG", "budapest": "BUD", "warsaw": "WAW",
  "zurich": "ZRH", "geneva": "GVA", "milan": "MIL",
  "luxembourg": "LUX", "cologne": "CGN", "frankfurt": "FRA",
  "rotterdam": "RTM",
  "stockholm": "STO", "oslo": "OSL", "copenhagen": "CPH",
  "dublin": "DUB", "edinburgh": "EDI", "athens": "ATH",
};

function getCityIata(location: string): string | null {
  const l = location.toLowerCase()
    .replace(/(belgique|belgium|france|europe|hotel|hôtel|ville\s+de|de\s+)/gi, "")
    .trim();

  // Cherche une correspondance dans la liste
  for (const [key, code] of Object.entries(CITY_IATA)) {
    if (l.includes(key)) return code;
  }

  // Dernière chance : extrait le premier mot et prend les 3 premières lettres
  // SEULEMENT si le mot fait plus de 4 caractères (évite "spa" → "SPA" = USA)
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
  "lyon": { lat: 45.7640, lng: 4.8357 },
};

function getCoords(location: string): { lat: number; lng: number } {
  const l = location.toLowerCase().trim();
  for (const [key, coords] of Object.entries(COORDS)) {
    if (l.includes(key)) return coords;
  }
  return { lat: 50.5039, lng: 4.4699 }; // Centre Belgique
}

// ─── Step 1: Hotel List API → liste des hotelIds ──────────────────────────────
// Doc: GET /v1/reference-data/locations/hotels/by-city?cityCode=BRU
async function getHotelIds(token: string, cityCode: string): Promise<string[]> {
  try {
    const url = `${AMADEUS_BASE}/v1/reference-data/locations/hotels/by-city?cityCode=${cityCode}&radius=20&radiusUnit=KM&ratings=3,4,5&hotelSource=ALL`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      console.warn(`Hotel List: aucun hôtel pour cityCode=${cityCode}`);
      return [];
    }

    const ids = data.data
      .slice(0, 15)
      .map((h: { hotelId: string }) => h.hotelId)
      .filter(Boolean);

    console.log(`Hotel List: ${ids.length} hôtels trouvés pour ${cityCode}`);
    return ids;
  } catch (e) {
    console.error("Hotel List API error:", e);
    return [];
  }
}

// ─── Step 2: Hotel Search API v3 → offres avec prix ──────────────────────────
// Doc: GET /v3/shopping/hotel-offers?hotelIds=...&checkInDate=...
async function getHotelOffers(token: string, hotelIds: string[]): Promise<HotelResult[]> {
  if (hotelIds.length === 0) return [];

  // Dates check-in/check-out (dans 7 jours, 1 nuit)
  const ci = new Date();
  ci.setDate(ci.getDate() + 7);
  const co = new Date();
  co.setDate(co.getDate() + 8);
  const checkIn = ci.toISOString().split("T")[0];
  const checkOut = co.toISOString().split("T")[0];

  // Amadeus accepte max 5 hotelIds par requête pour les offres
  const batch = hotelIds.slice(0, 5).join(",");

  try {
    const url = `${AMADEUS_BASE}/v3/shopping/hotel-offers?hotelIds=${batch}&checkInDate=${checkIn}&checkOutDate=${checkOut}&adults=2&roomQuantity=1&currency=EUR&bestRateOnly=true`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      console.warn("Hotel Offers: aucune offre disponible pour ces hôtels");
      return [];
    }

    return data.data
      .filter((item: { available?: boolean }) => item.available !== false)
      .slice(0, 5)
      .map((item: {
        hotel: {
          hotelId: string;
          name: string;
          latitude: number;
          longitude: number;
          amenities?: string[];
          rating?: string;
        };
        offers: Array<{
          price: { total: string; currency: string };
          room?: { typeEstimated?: { category?: string } };
          policies?: { cancellation?: { type?: string } };
        }>;
      }, index: number) => {
        const h = item.hotel;
        const offer = item.offers?.[0];
        const priceNum = offer?.price?.total ? Math.round(parseFloat(offer.price.total)) : null;
        const price = priceNum ? `${priceNum}€ / nuit` : "Prix sur demande";
        const rating = h.rating ? parseInt(h.rating) : 3;
        const vibeScore = Math.min(99, 65 + rating * 6 + Math.floor(Math.random() * 8));
        const amenities = h.amenities?.slice(0, 3).map((a: string) =>
          a.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())
        ) || ["Wi-Fi", "Petit déjeuner", "Parking"];
        const isFree = offer?.policies?.cancellation?.type !== "FULL_STAY";

        return {
          id: h.hotelId,
          name: h.name
            .split(" ")
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" "),
          price,
          imageUrl: IMAGES[index % IMAGES.length],
          vibeScore,
          tags: [...amenities, ...(isFree ? [] : [])],
          lat: h.latitude,
          lng: h.longitude,
          weather: (["sunny", "cloudy", "rainy"] as const)[Math.floor(Math.random() * 3)],
        };
      });
  } catch (e) {
    console.error("Hotel Offers API error:", e);
    return [];
  }
}

// ─── Fallback quand Amadeus ne trouve rien ────────────────────────────────────
function buildFallback(filters: SearchFilters): HotelResult[] {
  const coords = getCoords(filters.location);
  const loc = filters.location
    .replace(/(belgique|belgium|france|europe)/gi, "")
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());
  const maxP = filters.max_price;

  return [
    {
      id: "mock1",
      name: `Lodge Premium – ${loc}`,
      price: `${maxP ? maxP - 40 : 149}€ / nuit`,
      imageUrl: IMAGES[0], vibeScore: 96,
      tags: [filters.amenities?.[0] || "Spa", "Vue Panoramique", "Proche Centre"],
      lat: coords.lat + (Math.random() - 0.5) * 0.04,
      lng: coords.lng + (Math.random() - 0.5) * 0.04,
      weather: "sunny" as const,
    },
    {
      id: "mock2",
      name: `Hôtel Boutique – ${loc}`,
      price: `${maxP ? maxP - 60 : 119}€ / nuit`,
      imageUrl: IMAGES[1], vibeScore: 91,
      tags: ["Petit-déjeuner inclus", "Design", "Calme"],
      lat: coords.lat + (Math.random() - 0.5) * 0.04,
      lng: coords.lng + (Math.random() - 0.5) * 0.04,
      weather: "cloudy" as const,
    },
    {
      id: "mock3",
      name: `Grand Hôtel – ${loc}`,
      price: `${maxP ? maxP - 20 : 195}€ / nuit`,
      imageUrl: IMAGES[2], vibeScore: 88,
      tags: ["Piscine", "Restaurant Gastronomique", "Parking"],
      lat: coords.lat + (Math.random() - 0.5) * 0.04,
      lng: coords.lng + (Math.random() - 0.5) * 0.04,
      weather: "rainy" as const,
    },
    {
      id: "mock4",
      name: `Château Séjour – ${loc}`,
      price: `${maxP ? maxP + 20 : 249}€ / nuit`,
      imageUrl: IMAGES[5], vibeScore: 98,
      tags: ["Romantique", "Table Étoilée", "Parc Privé"],
      lat: coords.lat + (Math.random() - 0.5) * 0.04,
      lng: coords.lng + (Math.random() - 0.5) * 0.04,
      weather: "sunny" as const,
    },
  ];
}

// ─── Export principal ─────────────────────────────────────────────────────────
export async function searchHotels(filters: SearchFilters): Promise<HotelResult[]> {
  const token = await getAmadeusToken();

  if (token) {
    // 1. Convertit le nom de ville en code IATA
    const cityCode = getCityIata(filters.location);
    console.log(`🔍 Recherche: "${filters.location}" → cityCode: ${cityCode}`);

    if (cityCode) {
      // 2. Hotel List API → récupère les IDs des hôtels dans la ville
      const hotelIds = await getHotelIds(token, cityCode);

      if (hotelIds.length > 0) {
        // 3. Hotel Search API → récupère les offres avec vrais prix
        const results = await getHotelOffers(token, hotelIds);

        if (results.length > 0) {
          console.log(`✅ Amadeus: ${results.length} hôtels réels pour "${filters.location}"`);
          return results;
        }

        // Si pas d'offres dispo, essaie avec d'autres hôtels de la liste
        if (hotelIds.length > 5) {
          const results2 = await getHotelOffers(token, hotelIds.slice(5, 10));
          if (results2.length > 0) {
            console.log(`✅ Amadeus (batch 2): ${results2.length} hôtels pour "${filters.location}"`);
            return results2;
          }
        }
      }
    }
  }

  console.warn(`⚠️ Fallback pour: "${filters.location}"`);
  return buildFallback(filters);
}