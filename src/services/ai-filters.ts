import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GOOGLE_API_KEY
    ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
    : null;

export interface SearchFilters {
    location: string;
    guests: number;
    max_price?: number;
    type?: string;
    amenities: string[];
    checkIn?: string;
    checkOut?: string;
}

/**
 * Uses Gemini to extract structured search filters from a natural language query.
 */
export async function extractFilters(query: string): Promise<SearchFilters | null> {
    // Simple keyword extraction as fallback (no API key needed)
    const simpleExtract = (): SearchFilters => {
        // Extract location: try to find a capitalized word or known city
        const words = query.split(/\s+/);
        const stopWords = ["je", "recherche", "trouve", "veux", "hotel", "hôtel", "chambre", "nuit", "pas", "cher", "avec", "pour", "dans", "un", "une", "des", "les", "la", "le", "à", "a", "en", "sur", "near", "proche"];
        const locationCandidate = words.find(w =>
            w.length > 2 && !stopWords.includes(w.toLowerCase())
        ) || query.split(/\s+/)[0];

        return {
            location: locationCandidate,
            guests: 2,
            amenities: [],
        };
    };

    if (!genAI) {
        console.warn("Gemini API Key missing — using simple keyword extraction.");
        return simpleExtract();
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `Tu es l'assistant IA de "WIGO", une agence de voyage.
Transforme la requête utilisateur en filtres JSON. RETOURNE UNIQUEMENT du JSON valide, sans markdown.

Requête: "${query}"

Règles:
- "location": Nom exact de la ville/région mentionnée. Si "mons" -> "Mons". Si "bruxelles" -> "Bruxelles". Si "paris" -> "Paris". OBLIGATOIRE, utilise le premier nom géographique trouvé.
- "guests": Nombre de personnes (défaut: 2)
- "max_price": Budget max en euros (optionnel)
- "type": Type de logement (optionnel)
- "amenities": Liste de services demandés (tableau, peut être vide)

Exemple: {"location":"Mons","guests":2,"amenities":["spa"]}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
        const parsed = JSON.parse(text) as SearchFilters;

        // Safety: ensure location is populated
        if (!parsed.location || parsed.location.length < 2) {
            parsed.location = simpleExtract().location;
        }

        console.log("✅ Gemini extracted filters:", parsed);
        return parsed;

    } catch (error) {
        console.error("Gemini filter extraction failed:", error);
        return simpleExtract();
    }
}
