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
}

export async function extractFilters(query: string): Promise<SearchFilters | null> {
    const simpleExtract = (): SearchFilters => {
        return {
            location: "Lisbonne",
            iataCode: "LIS",
            locationDisplay: "Lisbonne (LIS)",
            guests: 2,
            amenities: [],
        };
    };

    if (!openai) {
        console.error("[AI] OPENAI_API_KEY manquant ! Fallback activé.");
        return simpleExtract();
    }

    try {
        console.log("[AI] Analyse NLP via OpenAI pour :", query);

        const prompt = `Tu es l'expert voyage de WIGO. Transforme la requête de l'utilisateur en JSON strict.
RETOURNE UNIQUEMENT DU JSON, sans texte additionnel ni block (pas de \`\`\`json).

RÈGLES DE DESTINATION :
- "location": Nom précis de la ville, du village ou du lieu (EX: Maredsous, Rome, Tokyo).
- "iataCode": Code aéroport IATA 3 lettres le plus proche (EX: Maredsous -> CRL, Rome -> ROM).
- "locationDisplay": Format "Lieu (Pays)" (EX: "Maredsous (Belgique)").
- "latitude": Coordonnée géolocalisée précise de latitude absolue (Nombre).
- "longitude": Coordonnée géolocalisée précise de longitude absolue (Nombre).
IMPORTANT : Tu DOIS fournir les coordonnées géographiques (latitude et longitude) exactes pour le lieu demandé, même s'il s'agit d'un petit village comme Maredsous.

Requête: "${query}"`;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: prompt }],
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            temperature: 0.1
        });

        const text = completion.choices[0]?.message?.content?.trim() || "{}";
        const parsed = JSON.parse(text);

        return {
            location: parsed.location || "Lisbonne",
            iataCode: (parsed.iataCode || "LIS").toUpperCase(),
            locationDisplay: parsed.locationDisplay || "Lisbonne (LIS)",
            latitude: parsed.latitude,
            longitude: parsed.longitude,
            guests: parsed.guests || 2,
            amenities: parsed.amenities || [],
            max_price: parsed.max_price,
            type: parsed.type,
            checkIn: parsed.checkIn,
            checkOut: parsed.checkOut
        } as SearchFilters;

    } catch (error) {
        console.error("OpenAI error:", error);
        return simpleExtract();
    }
}