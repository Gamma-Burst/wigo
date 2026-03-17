import { NextRequest, NextResponse } from 'next/server';
import { extractFilters } from '@/services/ai-filters';
import { searchHotels } from '@/services/hotel-provider';

/**
 * PRODUCTION-READY SEARCH ORCHESTRATOR
 * Route API pour gérer la recherche d'hôtels via requêtes HTTP POST.
 */
export async function POST(req: NextRequest) {
    try {
        // 1. Lecture sécurisée du body (évite le crash si la requête est mal formatée)
        let body;
        try {
            body = await req.json();
        } catch (e) {
            return NextResponse.json({ error: "Format JSON invalide ou body manquant." }, { status: 400 });
        }

        const { query } = body as { query?: string };

        // 2. Vérification que la recherche existe bien
        if (!query || typeof query !== 'string') {
            return NextResponse.json({ error: "Requête de recherche manquante ou invalide." }, { status: 400 });
        }

        // 3. Extraction des filtres avec l'IA
        const filters = await extractFilters(query);

        // Initialisation sécurisée pour TypeScript
        let searchParams: Record<string, any> = filters || {};

        // 4. Fallback si l'IA échoue (ex: timeout, quota dépassé)
        if (!filters) {
            console.warn("[SEARCH_API] AI Filtering failed, falling back to regex extraction.");

            const fallbackLocation = query.match(/(?:à|en|in|to)\s+([A-ZÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ\s]+)/i)?.[1]?.trim() || "Europe";

            searchParams = {
                location: fallbackLocation,
                guests: 2,
                amenities: []
            };
        }

        // 5. Recherche des hôtels avec le fournisseur (Amadeus / Travelpayouts)
        const hotels = await searchHotels(searchParams as any);

        // 6. Retourne toujours un tableau, même vide, pour éviter les erreurs React (.map is not a function)
        return NextResponse.json({ results: hotels || [] });

    } catch (error: unknown) {
        console.error("[SEARCH_ORCHESTRATOR_ERROR]", error);
        return NextResponse.json(
            { error: "Une erreur interne est survenue lors de la recherche." },
            { status: 500 }
        );
    }
}