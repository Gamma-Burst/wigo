import { HotelResult } from "@/components/SearchResultCard";
import { SearchFilters } from "./ai-filters";

const AMADEUS_CLIENT_ID = process.env.AMADEUS_CLIENT_ID;
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET;
const AMADEUS_BASE = "https://test.api.amadeus.com";

/**
 * Step 1: Get Amadeus OAuth2 token
 */
async function getAmadeusToken(): Promise<string | null> {
    if (!AMADEUS_CLIENT_ID || !AMADEUS_CLIENT_SECRET) return null;
    try {
        const res = await fetch(`${AMADEUS_BASE}/v1/security/oauth2/token`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `grant_type=client_credentials&client_id=${AMADEUS_CLIENT_ID}&client_secret=${AMADEUS_CLIENT_SECRET}`,
        });
        const data = await res.json();
        return data.access_token || null;
    } catch (e) {
        console.error("Amadeus token error:", e);
        return null;
    }
}

/**
 * Step 2: Search hotels in a city using keyword (city name)
 */
async function searchHotelsByCity(token: string, cityKeyword: string): Promise<string[]> {
    try {
        const res = await fetch(
            `${AMADEUS_BASE}/v1/reference-data/locations/hotels/by-city?cityCode=${encodeURIComponent(cityKeyword)}&radius=20&radiusUnit=KM&ratings=3,4,5`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (!data.data || data.data.length === 0) return [];
        // Return up to 10 hotel IDs
        return data.data.slice(0, 10).map((h: { hotelId: string }) => h.hotelId);
    } catch (e) {
        console.error("Amadeus hotel search error:", e);
        return [];
    }
}

/**
 * Step 3: Get hotel offers with real prices
 */
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

        const UNSPLASH_HOTEL_IMAGES = [
            "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=800&q=80",
        ];

        return data.data.slice(0, 5).map((item: {
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
            }>;
        }, index: number) => {
            const hotel = item.hotel;
            const offer = item.offers?.[0];
            const price = offer?.price?.total ? `${Math.round(parseFloat(offer.price.total))}€ / nuit` : "Prix sur demande";
            const rating = hotel.rating ? parseInt(hotel.rating) : 3;
            const vibeScore = Math.min(99, 70 + rating * 5 + Math.floor(Math.random() * 10));
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

/**
 * IATA city code lookup for common cities
 */
const CITY_CODES: Record<string, string> = {
    paris: "PAR", lyon: "LYS", marseille: "MRS", bordeaux: "BOD", toulouse: "TLS",
    nice: "NCE", strasbourg: "SXB", rennes: "RNS", lille: "LIL", nantes: "NTE",
    annecy: "NCY", grenoble: "GNB", montpellier: "MPL", brest: "BES",
    bruxelles: "BRU", brussels: "BRU", mons: "QMX", liege: "LGG", gent: "GNE",
    amsterdam: "AMS", london: "LON", rome: "ROM", madrid: "MAD", barcelona: "BCN",
    berlin: "BER", munich: "MUC", vienna: "VIE", lisbon: "LIS", prague: "PRG",
    budapest: "BUD", warsaw: "WAW", zurich: "ZRH", geneva: "GVA", milan: "MIL",
};

function getCityCode(location: string): string | null {
    const normalized = location.toLowerCase().trim();
    // Direct match
    for (const [key, code] of Object.entries(CITY_CODES)) {
        if (normalized.includes(key)) return code;
    }
    // Return uppercase first 3 letters as last resort
    return normalized.slice(0, 3).toUpperCase();
}

// Simple coordinate lookup for popular Belgian/European destinations
const CITY_COORDS: Record<string, { lat: number, lng: number }> = {
    bruxelles: { lat: 50.8503, lng: 4.3517 },
    brussels: { lat: 50.8503, lng: 4.3517 },
    liege: { lat: 50.6326, lng: 5.5797 },
    liège: { lat: 50.6326, lng: 5.5797 },
    namur: { lat: 50.4674, lng: 4.8719 },
    mons: { lat: 50.4542, lng: 3.9567 },
    charleroi: { lat: 50.4114, lng: 4.4436 },
    bruges: { lat: 51.2093, lng: 3.2247 },
    gand: { lat: 51.0543, lng: 3.7174 },
    gent: { lat: 51.0543, lng: 3.7174 },
    anvers: { lat: 51.2194, lng: 4.4025 },
    antwerp: { lat: 51.2194, lng: 4.4025 },
    ardennes: { lat: 50.25, lng: 5.5 }, // Generic Ardennes
    durbuy: { lat: 50.3524, lng: 5.4562 },
    paris: { lat: 48.8566, lng: 2.3522 },
    amsterdam: { lat: 52.3676, lng: 4.9041 },
    londres: { lat: 51.5074, lng: -0.1278 },
    luxembourg: { lat: 49.6116, lng: 6.1319 },
};

function getCoordsForLocation(location: string): { lat: number, lng: number } {
    const locLower = location.toLowerCase().trim();
    for (const [key, coords] of Object.entries(CITY_COORDS)) {
        if (locLower.includes(key)) return coords;
    }
    // Default fallback to center of Belgium if completely unknown
    return { lat: 50.5039, lng: 4.4699 };
}

/**
 * Main export: searches hotels using Amadeus, falls back to contextual mock data
 */
export async function searchHotels(filters: SearchFilters): Promise<HotelResult[]> {
    const token = await getAmadeusToken();

    if (token) {
        const cityCode = getCityCode(filters.location);
        if (cityCode) {
            const hotelIds = await searchHotelsByCity(token, cityCode);
            if (hotelIds.length > 0) {
                const results = await getHotelOffers(token, hotelIds);
                if (results.length > 0) {
                    console.log(`✅ Amadeus returned ${results.length} real hotels for ${filters.location}`);
                    return results;
                }
            }
        }
    }

    // Fallback: contextual mock data using the real location name
    console.warn(`⚠️ Falling back to contextual mock data for: ${filters.location}`);

    // Get proper coordinates for the requested city
    const baseCoords = getCoordsForLocation(filters.location);

    return [
        {
            id: "mock1",
            name: `Lodge Premium – ${filters.location}`,
            price: `${filters.max_price ? filters.max_price - 40 : 149}€ / nuit`,
            imageUrl: "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=800&q=80",
            vibeScore: 96,
            tags: [filters.amenities?.[0] || "Spa", "Vue Panoramique", "Proche Centre"],
            lat: baseCoords.lat + (Math.random() - 0.5) * 0.02,
            lng: baseCoords.lng + (Math.random() - 0.5) * 0.02,
            weather: "cloudy" as const,
        },
        {
            id: "mock2",
            name: `Hôtel Boutique – ${filters.location}`,
            price: `${filters.max_price ? filters.max_price - 60 : 129}€ / nuit`,
            imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80",
            vibeScore: 91,
            tags: ["Petit déjeuner inclus", "Design", "Calme"],
            lat: baseCoords.lat + (Math.random() - 0.5) * 0.02,
            lng: baseCoords.lng + (Math.random() - 0.5) * 0.02,
            weather: "sunny" as const,
        },
        {
            id: "mock3",
            name: `Grand Hôtel – ${filters.location}`,
            price: `${filters.max_price ? filters.max_price - 20 : 195}€ / nuit`,
            imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80",
            vibeScore: 88,
            tags: ["Piscine", "Restaurant Étoilé", "Parking Gratuit"],
            lat: 50.448, lng: 3.945,
            weather: "rainy" as const,
        },
    ];
}
