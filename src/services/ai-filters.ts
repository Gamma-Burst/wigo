import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

export interface SearchFilters {
    location: string;
    iataCode: string;
    locationDisplay: string;
    latitude?: number;
    longitude?: number;
    guests: number;
    max_price?: number;
    type?: string;
    amenities: string[];
    checkIn?: string;
    checkOut?: string;
    cityInsight?: {
        description: string;
        highlights: string[];
        restaurants?: { name: string; specialty: string; vibe: string }[];
        atypical?: { name: string; description: string }[];
        culture?: { name: string; type: string }[];
        nature?: { name: string; vibe: string }[];
    };
}

// ─── City dictionary for smart fallback ──────────────────────────────────────
const CITY_DB: Record<string, { iata: string; display: string; lat: number; lng: number }> = {
    "liege": { iata: "LGG", display: "Liège (Belgique)", lat: 50.6326, lng: 5.5797 },
    "liège": { iata: "LGG", display: "Liège (Belgique)", lat: 50.6326, lng: 5.5797 },
    "bruxelles": { iata: "BRU", display: "Bruxelles (Belgique)", lat: 50.8503, lng: 4.3517 },
    "brussels": { iata: "BRU", display: "Bruxelles (Belgique)", lat: 50.8503, lng: 4.3517 },
    "namur": { iata: "QNM", display: "Namur (Belgique)", lat: 50.4674, lng: 4.8719 },
    "mons": { iata: "QMX", display: "Mons (Belgique)", lat: 50.4542, lng: 3.9567 },
    "charleroi": { iata: "CRL", display: "Charleroi (Belgique)", lat: 50.4114, lng: 4.4436 },
    "bruges": { iata: "OST", display: "Bruges (Belgique)", lat: 51.2093, lng: 3.2247 },
    "gand": { iata: "GNE", display: "Gand (Belgique)", lat: 51.0543, lng: 3.7174 },
    "gent": { iata: "GNE", display: "Gent (Belgique)", lat: 51.0543, lng: 3.7174 },
    "anvers": { iata: "ANR", display: "Anvers (Belgique)", lat: 51.2194, lng: 4.4025 },
    "antwerp": { iata: "ANR", display: "Anvers (Belgique)", lat: 51.2194, lng: 4.4025 },
    "spa": { iata: "LGG", display: "Spa (Belgique)", lat: 50.4927, lng: 5.8647 },
    "durbuy": { iata: "LGG", display: "Durbuy (Belgique)", lat: 50.3531, lng: 5.4566 },
    "dinant": { iata: "LGG", display: "Dinant (Belgique)", lat: 50.2611, lng: 4.9119 },
    "paris": { iata: "PAR", display: "Paris (France)", lat: 48.8566, lng: 2.3522 },
    "lyon": { iata: "LYS", display: "Lyon (France)", lat: 45.764, lng: 4.8357 },
    "marseille": { iata: "MRS", display: "Marseille (France)", lat: 43.2965, lng: 5.3698 },
    "nice": { iata: "NCE", display: "Nice (France)", lat: 43.7102, lng: 7.262 },
    "bordeaux": { iata: "BOD", display: "Bordeaux (France)", lat: 44.8378, lng: -0.5792 },
    "amsterdam": { iata: "AMS", display: "Amsterdam (Pays-Bas)", lat: 52.3676, lng: 4.9041 },
    "london": { iata: "LON", display: "London (UK)", lat: 51.5074, lng: -0.1278 },
    "londres": { iata: "LON", display: "Londres (UK)", lat: 51.5074, lng: -0.1278 },
    "rome": { iata: "ROM", display: "Rome (Italie)", lat: 41.9028, lng: 12.4964 },
    "roma": { iata: "ROM", display: "Roma (Italia)", lat: 41.9028, lng: 12.4964 },
    "barcelona": { iata: "BCN", display: "Barcelone (Espagne)", lat: 41.3874, lng: 2.1686 },
    "barcelone": { iata: "BCN", display: "Barcelone (Espagne)", lat: 41.3874, lng: 2.1686 },
    "madrid": { iata: "MAD", display: "Madrid (Espagne)", lat: 40.4168, lng: -3.7038 },
    "lisbonne": { iata: "LIS", display: "Lisbonne (Portugal)", lat: 38.7223, lng: -9.1393 },
    "lisbon": { iata: "LIS", display: "Lisbon (Portugal)", lat: 38.7223, lng: -9.1393 },
    "porto": { iata: "OPO", display: "Porto (Portugal)", lat: 41.1579, lng: -8.6291 },
    "berlin": { iata: "BER", display: "Berlin (Allemagne)", lat: 52.52, lng: 13.405 },
    "munich": { iata: "MUC", display: "Munich (Allemagne)", lat: 48.1351, lng: 11.582 },
    "prague": { iata: "PRG", display: "Prague (Tchéquie)", lat: 50.0755, lng: 14.4378 },
    "istanbul": { iata: "IST", display: "Istanbul (Turquie)", lat: 41.0082, lng: 28.9784 },
    "dubai": { iata: "DXB", display: "Dubaï (EAU)", lat: 25.2048, lng: 55.2708 },
    "marrakech": { iata: "RAK", display: "Marrakech (Maroc)", lat: 31.6295, lng: -7.9811 },
    "new york": { iata: "NYC", display: "New York (USA)", lat: 40.7128, lng: -74.006 },
    "tokyo": { iata: "TYO", display: "Tokyo (Japon)", lat: 35.6762, lng: 139.6503 },
    "bangkok": { iata: "BKK", display: "Bangkok (Thaïlande)", lat: 13.7563, lng: 100.5018 },
    "bali": { iata: "DPS", display: "Bali (Indonésie)", lat: -8.3405, lng: 115.092 },
    "cancun": { iata: "CUN", display: "Cancún (Mexique)", lat: 21.1619, lng: -86.8515 },
    "ostende": { iata: "OST", display: "Ostende (Belgique)", lat: 51.2154, lng: 2.9270 },
    "oostende": { iata: "OST", display: "Ostende (Belgique)", lat: 51.2154, lng: 2.9270 },
};

function smartFallback(query: string): SearchFilters {
    const q = query.toLowerCase().trim();
    for (const [key, city] of Object.entries(CITY_DB)) {
        if (q.includes(key)) {
            return {
                location: city.display.split(" (")[0],
                iataCode: city.iata,
                locationDisplay: city.display,
                latitude: city.lat,
                longitude: city.lng,
                guests: 2,
                amenities: [],
                cityInsight: {
                    description: `Bienvenue à ${city.display}. Une destination authentique sélectionnée par l'expertise WIGO.`,
                    highlights: ["Culture locale", "Points d'intérêt", "Ambiance unique"]
                }
            };
        }
    }
    // Ultime fallback si rien ne matche
    return {
        location: query,
        iataCode: "",
        locationDisplay: query,
        guests: 2,
        amenities: [],
        cityInsight: {
            description: `Explorez ${query}, une destination pleine de surprises à découvrir avec WIGO.`,
            highlights: ["Aventure", "Découverte", "Expérience"]
        }
    };
}

export async function extractFilters(query: string): Promise<SearchFilters | null> {
    if (!openai) {
        console.error("[AI] OPENAI_API_KEY manquant ! Smart fallback activé.");
        return smartFallback(query);
    }

    try {
        console.log("[AI] Analyse NLP via OpenAI pour :", query);

        const prompt = `Tu es l'expert voyage de WIGO. Transforme la requête de l'utilisateur en JSON strict.
RETOURNE UNIQUEMENT DU JSON, sans texte additionnel ni block (pas de \`\`\`json).

RÈGLES DE DESTINATION :
- "location": Nom précis de la ville, du village ou du lieu (EX: Maredsous, Rome, Tokyo).
- "iataCode": Code aéroport IATA 3 lettres le plus proche (EX: Maredsous -> CRL, Rome -> ROM, Liège -> LGG).
- "locationDisplay": Format "Lieu (Pays)" (EX: "Maredsous (Belgique)", "Liège (Belgique)").
- "latitude": Coordonnée géolocalisée précise de latitude absolue (Nombre).
- "longitude": Coordonnée géolocalisée précise de longitude absolue (Nombre).
- "cityInsight": {
    "description": "2 phrases max sur l'ambiance",
    "highlights": ["3 points forts"],
    "restaurants": [{"name": "string", "specialty": "string", "vibe": "chic/local"}],
    "atypical": [{"name": "string", "description": "lieu insolite peu connu"}],
    "culture": [{"name": "string", "type": "musée/art"}],
    "nature": [{"name": "string", "vibe": "parc/balade"}]
}
IMPORTANT : Priorise des lieux ATYPIQUES et INSOLITES que les guides classiques ne mentionnent pas.
IMPORTANT : Tu DOIS fournir les coordonnées géographiques (latitude et longitude) exactes pour le lieu demandé.

Requête: "${query}"`;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: prompt }],
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            temperature: 0.1
        });

        const text = completion.choices[0]?.message?.content?.trim() || "{}";
        const parsed = JSON.parse(text);

        // Use smart fallback values instead of always defaulting to Lisbonne
        const fallback = smartFallback(query);

        return {
            location: parsed.location || fallback.location,
            iataCode: (parsed.iataCode || fallback.iataCode).toUpperCase(),
            locationDisplay: parsed.locationDisplay || fallback.locationDisplay,
            latitude: parsed.latitude || fallback.latitude,
            longitude: parsed.longitude || fallback.longitude,
            guests: parsed.guests || 2,
            amenities: parsed.amenities || [],
            max_price: parsed.max_price,
            type: parsed.type,
            checkIn: parsed.checkIn,
            checkOut: parsed.checkOut,
            cityInsight: parsed.cityInsight || {
                description: `Découvrez ${parsed.locationDisplay || fallback.locationDisplay}, une destination unique sélectionnée par WIGO.`,
                highlights: ["Exploration locale", "Gastronomie", "Culture"],
                restaurants: [], atypical: [], culture: [], nature: []
            }
        } as SearchFilters;

    } catch (error) {
        console.error("OpenAI error:", error);
        return smartFallback(query);
    }
}