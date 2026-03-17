import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GOOGLE_API_KEY
    ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
    : null;

export interface SearchFilters {
    location: string;
    iataCode: string;
    locationDisplay: string;
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

    if (!genAI) return simpleExtract();

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `Tu es l'expert voyage de WIGO. Transforme la requête en JSON. 
RETOURNE UNIQUEMENT DU JSON.

RÈGLES DE DESTINATION :
- "location": Nom de la ville.
- "iataCode": Code IATA de 3 lettres (EX: Porto = OPO, Paris = PAR, Lisbonne = LIS).
- "locationDisplay": Format "Ville (IATA)" (EX: "Porto (OPO)").
- SI l'utilisateur donne un pays (ex: Portugal), choisis la capitale (Lisbonne, LIS).
- IMPORTANT: Pour Porto, utilise OPO (JAMAIS POR).

Requête: "${query}"`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
        const parsed = JSON.parse(text);

        return {
            location: parsed.location || "Lisbonne",
            iataCode: (parsed.iataCode || "LIS").toUpperCase(),
            locationDisplay: parsed.locationDisplay || "Lisbonne (LIS)",
            guests: parsed.guests || 2,
            amenities: parsed.amenities || [],
            max_price: parsed.max_price,
            type: parsed.type,
            checkIn: parsed.checkIn,
            checkOut: parsed.checkOut
        } as SearchFilters;

    } catch (error) {
        console.error("Gemini error:", error);
        return simpleExtract();
    }
}