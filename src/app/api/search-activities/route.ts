import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GOOGLE_API_KEY;

export interface ActivityResult {
    id: string;
    name: string;
    category: "hotels" | "hiking" | "events" | "restaurants" | "culture" | "attractions" | "nature" | "markets";
    description: string;
    address: string;
    price: string;
    imageUrl: string;
    rating: number;
    tags: string[];
    openingHours?: string;
    date?: string;
    duration?: string;
    difficulty?: string;
    website?: string;
    lat?: number;
    lng?: number;
}

const CATEGORY_IMAGES: Record<string, string[]> = {
    hiking: [
        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80",
        "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800&q=80",
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
    ],
    events: [
        "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
    ],
    restaurants: [
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
        "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800&q=80",
    ],
    culture: [
        "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80",
        "https://images.unsplash.com/photo-1561455923-c7fe33b4f9cd?w=800&q=80",
        "https://images.unsplash.com/photo-1548268770-66184a21657e?w=800&q=80",
    ],
    attractions: [
        "https://images.unsplash.com/photo-1575783970733-1aaedde1db74?w=800&q=80",
        "https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=800&q=80",
        "https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?w=800&q=80",
    ],
    nature: [
        "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80",
        "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=800&q=80",
        "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&q=80",
    ],
    markets: [
        "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80",
        "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=800&q=80",
        "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80",
    ],
};

function getFallbackResults(query: string, category: string, location: string): ActivityResult[] {
    const imgs = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.nature;
    const baseItems: Partial<ActivityResult>[] = {
        hiking: [
            { name: `Sentier du Panorama – ${location}`, description: "Un magnifique sentier offrant des vues à couper le souffle sur la région. Idéal pour les familles et les randonneurs débutants.", price: "Gratuit", difficulty: "Facile", duration: "2h30", tags: ["Nature", "Vue panoramique", "Famille"] },
            { name: `Circuit des Crêtes`, description: "Un parcours technique traversant forêts et landes, avec des points de vue exceptionnels. Requiert de bonnes chaussures.", price: "Gratuit", difficulty: "Intermédiaire", duration: "4h00", tags: ["Forêt", "Sportif", "Nature"] },
            { name: `Grande Boucle Sauvage`, description: "L'itinéraire phare de la région, réservé aux randonneurs expérimentés. Passages rocheux et bivouac possible.", price: "Gratuit", difficulty: "Difficile", duration: "7h00", tags: ["Aventure", "Expert", "Bivouac"] },
        ],
        events: [
            { name: `Fête Médiévale de ${location}`, description: "Plongez dans le Moyen-Âge avec des chevaliers en armure, des jongleurs et des artisans d'époque. Spectacles toutes les heures.", price: "12€ adulte / 6€ enfant", date: "Week-end prochain", tags: ["Médiéval", "Famille", "Histoire", "Spectacle"] },
            { name: `Marché Nocturne & Food Festival`, description: "Plus de 60 producteurs locaux réunis pour une soirée gourmande en plein air. Musique live et animations.", price: "Entrée libre", date: "Vendredi soir", tags: ["Gastronomie", "Soirée", "Local", "Musique"] },
            { name: `Festival des Arts de Rue`, description: "Jongleurs, acrobates, cracheurs de feu et street art dans toute la ville. L'événement incontournable de l'été!", price: "Gratuit", date: "Ce weekend", tags: ["Art", "Rue", "Gratuit", "Été"] },
        ],
        restaurants: [
            { name: `La Table du Terroir – ${location}`, description: "Cuisine régionale authentique revisitée par un chef étoilé. Produits du marché, carte courte et excellente cave.", price: "35-55€ / personne", openingHours: "12h-14h & 19h-22h", tags: ["Gastronomie", "Terroir", "Chef étoilé"] },
            { name: `Le Refuge du Randonneur`, description: "Ambiance chaleureuse, plats généreux et bières artisanales locales. La cantine idéale après une longue rando.", price: "15-25€ / personne", openingHours: "11h30-23h00", tags: ["Bras.artisanale", "Convivial", "Copieux"] },
            { name: `Chez Marie – Cuisine de Grand-Mère`, description: "Authentique cuisine familiale dans un cadre rustique. Le carbonnades flamandes et le tiramisu maison sont légendaires.", price: "20-35€ / personne", openingHours: "12h-14h & 18h-21h", tags: ["Familial", "Tradition", "Belge"] },
        ],
        culture: [
            { name: `Château de ${location}`, description: "Forteresse médiévale du XIIe siècle dominant la vallée. Visites guidées en costume d'époque, son & lumière les vendredis.", price: "8€ adulte / 4€ enfant", openingHours: "10h-18h (sauf lundi)", tags: ["Château", "Médiéval", "Histoire", "Visite guidée"] },
            { name: `Abbaye Cistercienne & Musée`, description: "L'une des plus belles abbayes conservées d'Europe. Bière de l'abbaye, jardin médicinal et scriptorium reconstitué.", price: "6€ adulte / 3€ enfant", openingHours: "9h-17h30", tags: ["Abbaye", "Patrimoine", "UNESCO", "Sérénité"] },
            { name: `Site Archéologique Romain`, description: "Vestiges d'une villa gallo-romaine avec mosaïques exceptionnelles. Musée interactif sur l'Antiquité dans la région.", price: "5€ adulte / gratuit -12 ans", openingHours: "10h-17h", tags: ["Romain", "Archéologie", "Gratuit enfant"] },
        ],
        attractions: [
            { name: `Parc Animalier des Ardennes`, description: "Plus de 200 animaux européens en semi-liberté sur 40 hectares. Lynx, loups, bisons, cerfs et aigles vous attendent!", price: "18€ adulte / 10€ enfant", openingHours: "9h-18h (ts jours)", tags: ["Animaux", "Famille", "Nature", "Enfants"] },
            { name: `Parc d'Aventure & Accrobranche`, description: "14 parcours dans les arbres pour petits et grands. Tyroliennes géantes, ponts de singe et défis à tous niveaux.", price: "22€ adulte / 15€ enfant", openingHours: "10h-17h30", tags: ["Aventure", "Adrénaline", "Famille", "Acrobranche"] },
            { name: `Labyrinthe & Parc de Loisirs`, description: "Le plus grand labyrinthe de maïs de la région, mini-golf, trampoline et ferme pédagogique. Fun garanti pour toute la famille!", price: "12€ / personne", openingHours: "10h-19h (juil-août)", tags: ["Labyrinthe", "Famille", "Jeux", "Été"] },
        ],
        nature: [
            { name: `Réserve Naturelle de ${location}`, description: "Zone protégée abritant une faune et flore exceptionnelles. Observatoire d'oiseaux, mares à grenouilles et forêt ancienne.", price: "Gratuit", openingHours: "Lever-coucher du soleil", tags: ["Nature", "Oiseaux", "Calme", "Biodiversité"] },
            { name: `Parc Naturel des Hautes Fagnes`, description: "Le plus grand espace naturel protégé de Belgique. Tourbières mystérieuses, landes et brumes matinales époustouflantes.", price: "Gratuit (parking 3€)", openingHours: "Toujours ouvert", tags: ["Fagne", "UNESCO", "Trekking", "Photographie"] },
            { name: `Cascade & Gorges Sauvages`, description: "Sentier sauvage longeant une rivière avec cascades et formations rocheuses. Baignade possible en été.", price: "Gratuit", openingHours: "Accès libre", tags: ["Cascade", "Baignade", "Fraîcheur", "Instagram"] },
        ],
        markets: [
            { name: `Grand Marché Brocante de ${location}`, description: "Plus de 300 exposants sur 2km de trottoirs. Meubles anciens, vinyles, livres rares, bijoux vintage et curiosités.", price: "Entrée libre", date: "Dimanches 7h-14h", tags: ["Brocante", "Vintage", "Antiquités", "Chineurs"] },
            { name: `Vide-Grenier Géant – Parking Saint-Michel`, description: "Le plus grand vide-grenier de la région avec 500+ exposants particuliers. Venez tôt pour les meilleures affaires!", price: "Entrée libre", date: "1er dimanche du mois", tags: ["Vide-grenier", "Particuliers", "Bonnes affaires"] },
            { name: `Marché aux Antiquités & Déco Vintage`, description: "Sélection haut de gamme de mobilier Art Déco, faïences, horloges et tableaux anciens. Experts sur place.", price: "2€ / entrée", date: "Samedi 8h-16h", tags: ["Antiquités", "Art Déco", "Premium", "Décoration"] },
        ],
    }[category] || [];

    return baseItems.map((item, i) => ({
        id: `${category}-${i}`,
        category: category as ActivityResult["category"],
        address: `${location}, Belgique`,
        rating: 4.0 + Math.random() * 0.8,
        imageUrl: imgs[i % imgs.length],
        website: undefined,
        lat: 50.4 + Math.random() * 0.5,
        lng: 4.0 + Math.random() * 1.5,
        ...item,
    } as ActivityResult));
}

export async function POST(req: Request) {
    const body = await req.json();
    const { query, category = "nature", location = "Belgique" } = body;

    if (!query) return NextResponse.json({ error: "Query required" }, { status: 400 });

    if (!apiKey) {
        return NextResponse.json({ results: getFallbackResults(query, category, location) });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const categoryLabels: Record<string, string> = {
            hiking: "randonnées et sentiers de marche",
            events: "événements, foires, fêtes médiévales, festivals",
            restaurants: "restaurants et bonnes tables",
            culture: "châteaux, sites médiévaux, musées, abbayes",
            attractions: "parcs d'attractions, parcs animaliers, activités de loisirs",
            nature: "parcs naturels, réserves, espaces verts",
            markets: "brocantes, marchés aux puces, vide-greniers",
        };

        const prompt = `Tu es un expert loisirs et tourisme pour WIGO. Pour la recherche "${query}" dans la catégorie "${categoryLabels[category] || category}" près de "${location}", génère exactement 4 résultats.

Retourne UNIQUEMENT ce JSON valide (sans markdown):
{"results":[{"id":"${category}-0","name":"Nom lieu 1","category":"${category}","description":"Description engageante 2-3 phrases","address":"Adresse, Belgique ou pays voisin","price":"Prix ou Gratuit","rating":4.3,"tags":["tag1","tag2","tag3"],"openingHours":"10h-18h ou vide si non applicable","date":"Date si événement ou vide","duration":"Durée si rando ou activité","difficulty":"Facile/Intermédiaire/Difficile si rando ou vide","imageUrl":"","lat":50.4,"lng":4.5},{"id":"${category}-1",...},{"id":"${category}-2",...},{"id":"${category}-3",...}]}

Règles importantes:
- Noms réalistes et vraisemblables pour la région
- Descriptions riches et attrayantes
- Prix réalistes en euros
- Laisse imageUrl vide (string vide "")
- Tags pertinents et courts (max 3 mots chacun)
- Coordonnées approximatives réelles pour la région`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
        const parsed = JSON.parse(text);

        const imgs = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.nature;
        parsed.results = parsed.results.map((r: ActivityResult, i: number) => ({
            ...r,
            imageUrl: imgs[i % imgs.length],
        }));

        return NextResponse.json(parsed);
    } catch (err) {
        console.error("Gemini activity search error:", err);
        return NextResponse.json({ results: getFallbackResults(query, category, location) });
    }
}
