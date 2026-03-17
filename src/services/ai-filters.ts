import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GOOGLE_API_KEY
    ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
    : null;

export interface SearchFilters {
    location: string;
    iataCode: string;         // Code IATA (ex: OPO)
    locationDisplay: string;  // Affichage (ex: Porto (OPO))
    guests: number;
    max_price?: number;
    type?: string;
    amenities: string[];
    checkIn?: string;
    checkOut?: string;
}

export async function extractFilters(query: string): Promise<SearchFilters | null> {
    const simpleExtract = (): SearchFilters => ({
        location: "Paris", iataCode: "PAR", locationDisplay: "Paris (PAR)", guests: 2, amenities: []
    });

    if (!genAI) return simpleExtract();

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `Tu es l'expert voyage de WIGO. Transforme la requête en JSON. 
        RÈGLES :
        - "location": Nom de la ville.
        - "iataCode": Code IATA (Porto=OPO, Paris=PAR, Lisbonne=LIS, Bruxelles=BRU).
        - "locationDisplay": "Ville (IATA)".
        - SI pays (ex: Portugal), choisis la capitale (Lisbonne, LIS).
        - IMPORTANT : Porto = OPO (JAMAIS POR).
        Requête: "${query}"`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
        const parsed = JSON.parse(text);

        return {
            ...parsed,
            iataCode: parsed.iataCode?.toUpperCase() || "PAR",
            guests: parsed.guests || 2,
            amenities: parsed.amenities || []
        } as SearchFilters;
    } catch (error) {
        console.error("Gemini error:", error);
        return simpleExtract();
    }
}