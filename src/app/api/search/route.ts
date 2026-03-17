import { NextRequest, NextResponse } from 'next/server';
import { extractFilters, SearchFilters } from '@/services/ai-filters';
import { searchHotels } from '@/services/hotel-provider';

/**
 * PRODUCTION-READY SEARCH ORCHESTRATOR
 * Version corrigée : Typage strict SearchFilters et conformité ESLint Vercel.
 */
export async function POST(req: NextRequest) {
    try {
        // 1. Lecture sécurisée du body (plus de variable 'e' inutilisée)
        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Format JSON invalide ou body manquant." }, { status: 400 });
        }

        const { query } = body as { query?: string };

        // 2. Vérification de la requête
        if (!query || typeof query !== 'string') {
            return NextResponse.json({ error: "Requête de recherche manquante ou invalide." }, { status: 400 });
        }

        // 3. Extraction des filtres avec l'IA
        const filters = await extractFilters(query);

        // 4. Utilisation du type exact SearchFilters au lieu de Record ou any
        let searchParams: SearchFilters;

        if (!filters) {
            console.warn("[SEARCH_API] AI Filtering failed, falling back to regex extraction.");

            // Regex améliorée pour extraire la destination
            const fallbackLocation = query.match(/(?:à|en|in|to)\s+([A-ZÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ\s]+)/i)?.[1]?.trim() || "Europe";

            searchParams = {
                location: fallbackLocation,
                guests: 2,
                amenities: []
            };
        } else {
            searchParams = filters;
        }

        // 5. Recherche des hôtels avec le type correct (plus de 'as any')
        const hotels = await searchHotels(searchParams);

        // 6. Retourne toujours un tableau, même vide
        return NextResponse.json({ results: hotels || [] });

    } catch (error: unknown) {
        console.error("[SEARCH_ORCHESTRATOR_ERROR]", error);
        return NextResponse.json(
            { error: "Une erreur interne est survenue lors de la recherche." },
            { status: 500 }
        );
    }
}