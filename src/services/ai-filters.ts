import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GOOGLE_API_KEY
    ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
    : null;

export interface SearchFilters {
    location: string;
    iataCode?: string; // Ajout du code IATA
    locationDisplay?: string; // Pour l'affichage "Ville (CODE)"
    guests: number;
    max_price?: number;
    type?: string;
    amenities: string[];
    checkIn?: string;
    checkOut?: string;
}

export async function extractFilters(query: string): Promise<SearchFilters | null> {
    const simpleExtract = (): SearchFilters => {
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
Transforme la requête utilisateur en filtres JSON. RETOURNE UNIQUEMENT du JSON valide.

RÈGLES CRUCIALES POUR LA DESTINATION :
1. "location": Nom de la ville.
2. "iataCode": Code IATA de 3 lettres (ex: Porto -> OPO, Bruxelles -> BRU, Paris -> PAR).
   - SI l'utilisateur donne un pays (ex: "Portugal"), choisis la ville la plus touristique (ex: "Lisbonne", code "LIS").
   - SI l'utilisateur dit "Porto", utilise impérativement "OPO" (PAS "POR").
3. "locationDisplay": Formatage "Nom de la ville (CODE)" (ex: "Porto (OPO)").

Requête: "${query}"

Format: {"location":"Nom", "iataCode":"XYZ", "locationDisplay":"Nom (XYZ)", "guests":2, "amenities":[]}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
        const parsed = JSON.parse(text) as SearchFilters;

        if (!parsed.location || parsed.location.length < 2) {
            const fallback = simpleExtract();
            parsed.location = fallback.location;
        }

        console.log("✅ Gemini extracted filters:", parsed);
        return parsed;

    } catch (error) {
        console.error("Gemini filter extraction failed:", error);
        return simpleExtract();
    }
}