import { NextResponse } from 'next/server';
import { extractFilters } from '@/services/ai-filters';
import { searchHotels } from '@/services/hotel-provider';

/**
 * PRODUCTION-READY SEARCH ORCHESTRATOR
 * Step 1: Receives natural language "query" from the front-end.
 * Step 2: Uses OpenAI (ai-filters.ts) to convert text to JSON filters (Location, Price, Tags).
 * Step 3: Uses Travelpayouts/Amadeus (hotel-provider.ts) to fetch real inventory.
 * Step 4: Returns the cleanly mapped HotelResult[] back to the React UI.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { query } = body;

        if (!query) {
            return NextResponse.json({ error: "No search query provided." }, { status: 400 });
        }

        // 1. NLP to JSON (OpenAI)
        const filters = await extractFilters(query);

        if (!filters) {
            console.warn("AI Filtering failed, falling back to primitive keyword extraction.");
            // Extremely basic regex fallback if OpenAI is down or key is missing
            const fallbackLocation = query.match(/à\s+([A-Z][A-Za-z]+)/i)?.[1] || "Nature";
            return NextResponse.json({ results: await searchHotels({ location: fallbackLocation, guests: 2, amenities: [] }) });
        }

        // 2. Fetch Real Data (TravelPayouts / Amadeus)
        const hotels = await searchHotels(filters);

        // Optional Step 3:
        // If the real API data is too "boring", we could call Gemini here
        // to rewrite the hotel descriptions (Adding the NomadIC "Vibe Score" and poetry).
        // For now, hotel-provider.ts handles the mapping.

        return NextResponse.json({ results: hotels });

    } catch (error) {
        console.error("Search Orchestration Error:", error);
        return NextResponse.json(
            { error: "Failed to process search." },
            { status: 500 }
        );
    }
}
