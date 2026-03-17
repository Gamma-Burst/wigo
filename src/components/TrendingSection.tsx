"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, TrendingUp, Flame } from "lucide-react";
import { CATEGORIES, type CategoryId } from "./CategoryTabs";
import { ShareButton } from "./ShareButton";

interface TrendingItem {
    id: string;
    name: string;
    location: string;
    image: string;
    rating: number;
    likes: number;
    bookings: number;
    tag: string;
    price?: string;
    slug?: string;
}

const TRENDING_DATA: Record<CategoryId, TrendingItem[]> = {
    hotels: [
        { id: "h1", name: "L'Hôtel Amigo", location: "Bruxelles, Belgique", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80", rating: 4.9, likes: 2847, bookings: 1203, tag: "Coup de cœur", price: "À partir de 189€" },
        { id: "h2", name: "Château-Hôtel d'Hassonville", location: "Marche-en-Famenne, Belgique", image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80", rating: 4.8, likes: 1923, bookings: 876, tag: "Romanesque", price: "À partir de 145€" },
        { id: "h3", name: "Le Nid — Escapade Forêt", location: "Ardennes, Belgique", image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80", rating: 4.7, likes: 3412, bookings: 2109, tag: "🔥 Tendance", price: "À partir de 210€" },
        { id: "h4", name: "The Hoxton, Anvers", location: "Anvers, Belgique", image: "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=800&q=80", rating: 4.6, likes: 1567, bookings: 934, tag: "Urbain chic", price: "À partir de 129€" },
        { id: "h5", name: "Hotel Van der Valk", location: "Bruxelles-Est, Belgique", image: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&q=80", rating: 4.5, likes: 988, bookings: 712, tag: "Famille", price: "À partir de 99€" },
        { id: "h6", name: "Boutiquehotel Pillows", location: "Gand, Belgique", image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80", rating: 4.8, likes: 2103, bookings: 1456, tag: "Design", price: "À partir de 159€" },
    ],
    hiking: [
        { id: "k1", name: "Sentier des Fées — Vallée de la Semois", location: "Bouillon, Ardennes", image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80", rating: 4.9, likes: 4231, bookings: 0, tag: "🔥 Populaire", price: "Gratuit" },
        { id: "k2", name: "Circuit des Fagnes — Hautes-Fagnes", location: "Liège, Belgique", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80", rating: 4.8, likes: 3109, bookings: 0, tag: "Panorama", price: "Gratuit" },
        { id: "k3", name: "Tour du Lac de Butgenbach", location: "Cantons de l'Est, Belgique", image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80", rating: 4.7, likes: 2876, bookings: 0, tag: "Famille", price: "Gratuit" },
        { id: "k4", name: "Boucle des Gorges de la Fraiture", location: "Durbuy, Wallonie", image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80", rating: 4.6, likes: 1943, bookings: 0, tag: "Sauvage", price: "Gratuit" },
        { id: "k5", name: "Rando des Grottes de Han", location: "Han-sur-Lesse, Belgique", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", rating: 4.8, likes: 3456, bookings: 0, tag: "Unique", price: "Gratuit" },
        { id: "k6", name: "Chemin des Crêtes de l'Ourthe", location: "La Roche-en-Ardenne", image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80", rating: 4.7, likes: 2234, bookings: 0, tag: "Vue imprenable", price: "Gratuit" },
    ],
    events: [
        { id: "e1", name: "Marché de Noël de Liège", location: "Liège, Belgique", image: "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800&q=80", rating: 4.9, likes: 8932, bookings: 0, tag: "🔥 Incontournable", price: "Entrée libre" },
        { id: "e2", name: "Festival de Durbuy", location: "Durbuy, Wallonie", image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80", rating: 4.7, likes: 3421, bookings: 0, tag: "Musique", price: "À partir de 25€" },
        { id: "e3", name: "Carnaval de Binche", location: "Binche, Hainaut", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80", rating: 4.9, likes: 5678, bookings: 0, tag: "Patrimoine UNESCO", price: "Entrée libre" },
        { id: "e4", name: "Foire du Midi", location: "Bruxelles, Belgique", image: "https://images.unsplash.com/photo-1575936123452-b67c3203c357?w=800&q=80", rating: 4.6, likes: 2109, bookings: 0, tag: "Famille", price: "À partir de 5€" },
        { id: "e5", name: "Festival de Spa", location: "Spa, Belgique", image: "https://images.unsplash.com/photo-1501386761578-eaa54b6a0e77?w=800&q=80", rating: 4.8, likes: 1876, bookings: 0, tag: "Jazz & Blues", price: "À partir de 30€" },
        { id: "e6", name: "Fête de la Bière à Gand", location: "Gand, Belgique", image: "https://images.unsplash.com/photo-1436076863939-06870fe779c2?w=800&q=80", rating: 4.7, likes: 4231, bookings: 0, tag: "Convivial", price: "Entrée libre" },
    ],
    restaurants: [
        { id: "r1", name: "Comme Chez Soi ⭐⭐", location: "Bruxelles, Belgique", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80", rating: 4.9, likes: 5421, bookings: 2341, tag: "🔥 2 étoiles Michelin", price: "Menu à partir de 95€" },
        { id: "r2", name: "Bord'Eau — La Woluwe", location: "Bruxelles-Est, Belgique", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80", rating: 4.8, likes: 2876, bookings: 1543, tag: "Terrasse rivière", price: "Menu à partir de 45€" },
        { id: "r3", name: "Bij den Boer — Fruits de Mer", location: "Bruxelles, Belgique", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80", rating: 4.7, likes: 3234, bookings: 1876, tag: "Tradition belge", price: "Menu à partir de 35€" },
        { id: "r4", name: "La Villa in the Sky", location: "Bruxelles, Belgique", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80", rating: 4.8, likes: 1987, bookings: 765, tag: "Vue panoramique", price: "Menu à partir de 75€" },
        { id: "r5", name: "Vitrine du Monde", location: "Bruges, Belgique", image: "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800&q=80", rating: 4.6, likes: 1543, bookings: 934, tag: "Fusion créative", price: "Menu à partir de 55€" },
        { id: "r6", name: "Le Pain Quotidien — Origine", location: "Bruxelles, Belgique", image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80", rating: 4.5, likes: 6789, bookings: 4321, tag: "Brunch cult", price: "À partir de 18€" },
    ],
    culture: [
        { id: "c1", name: "Château de Bouillon", location: "Bouillon, Ardennes", image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80", rating: 4.8, likes: 4567, bookings: 0, tag: "🔥 Médiéval", price: "À partir de 8€" },
        { id: "c2", name: "Musées Royaux des Beaux-Arts", location: "Bruxelles, Belgique", image: "https://images.unsplash.com/photo-1565060169194-19fabf63012e?w=800&q=80", rating: 4.7, likes: 3234, bookings: 0, tag: "Chef-d'œuvre", price: "À partir de 12€" },
        { id: "c3", name: "Château de Freÿr", location: "Dinant, Wallonie", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", rating: 4.9, likes: 2987, bookings: 0, tag: "Secret & magnifique", price: "À partir de 9€" },
        { id: "c4", name: "Grand-Place & Atomium", location: "Bruxelles, Belgique", image: "https://images.unsplash.com/photo-1559113513-d5e96a3ef98e?w=800&q=80", rating: 4.8, likes: 12456, bookings: 0, tag: "Iconique", price: "Gratuit" },
        { id: "c5", name: "Château de Vêves", location: "Celles, Namur", image: "https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=800&q=80", rating: 4.8, likes: 1876, bookings: 0, tag: "Conte de fées", price: "À partir de 7€" },
        { id: "c6", name: "Beffroi de Bruges", location: "Bruges, Belgique", image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80", rating: 4.7, likes: 5432, bookings: 0, tag: "Panorama 360°", price: "À partir de 14€" },
    ],
    attractions: [
        { id: "a1", name: "Walibi Belgium", location: "Wavre, Brabant Wallon", image: "https://images.unsplash.com/photo-1582036206432-87bee5cde5c6?w=800&q=80", rating: 4.6, likes: 9876, bookings: 7654, tag: "🔥 Familles", price: "À partir de 39€" },
        { id: "a2", name: "Grottes de Han-sur-Lesse", location: "Han-sur-Lesse, Namur", image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80", rating: 4.8, likes: 6543, bookings: 4321, tag: "Unique au monde", price: "À partir de 19€" },
        { id: "a3", name: "Plopsaland De Panne", location: "De Panne, Côte belge", image: "https://images.unsplash.com/photo-1596451190630-186aff535bf2?w=800&q=80", rating: 4.5, likes: 4231, bookings: 3109, tag: "Enfants adorent", price: "À partir de 28€" },
        { id: "a4", name: "Mini-Europe", location: "Bruxelles, Belgique", image: "https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=800&q=80", rating: 4.4, likes: 3456, bookings: 2345, tag: "Toute l'Europe", price: "À partir de 16€" },
        { id: "a5", name: "Parc de Buttes à Rebecq", location: "Rebecq, Brabant Wallon", image: "https://images.unsplash.com/photo-1565080488934-8a7f93d8c2a0?w=800&q=80", rating: 4.7, likes: 1876, bookings: 943, tag: "Nature & Aventure", price: "À partir de 12€" },
        { id: "a6", name: "Sea Life Blankenberge", location: "Blankenberge, Mer du Nord", image: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=800&q=80", rating: 4.6, likes: 2987, bookings: 2109, tag: "Aquatique", price: "À partir de 18€" },
    ],
    nature: [
        { id: "n1", name: "Hautes-Fagnes — Tourbière Royale", location: "Liège, Province", image: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&q=80", rating: 4.9, likes: 5678, bookings: 0, tag: "🔥 Naturel rare", price: "Gratuit" },
        { id: "n2", name: "Cascade de Coo", location: "Stavelot, Liège", image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&q=80", rating: 4.8, likes: 4321, bookings: 0, tag: "Spectaculaire", price: "Gratuit" },
        { id: "n3", name: "Réserve de Virelles", location: "Chimay, Hainaut", image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80", rating: 4.7, likes: 2109, bookings: 0, tag: "Oiseaux & nature", price: "À partir de 7€" },
        { id: "n4", name: "Forêt de Soignes", location: "Bruxelles, Belgique", image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80", rating: 4.8, likes: 8765, bookings: 0, tag: "Poumon vert", price: "Gratuit" },
        { id: "n5", name: "Lacs de l'Eau d'Heure", location: "Froidchapelle, Hainaut", image: "https://images.unsplash.com/photo-1439066244792-48fef2c15a7d?w=800&q=80", rating: 4.7, likes: 3456, bookings: 0, tag: "Voile & kayak", price: "Gratuit" },
        { id: "n6", name: "Domaine des Grottes de Remouchamps", location: "Aywaille, Ardennes", image: "https://images.unsplash.com/photo-1505489435671-80a5b0a39bdd?w=800&q=80", rating: 4.8, likes: 2876, bookings: 0, tag: "Mystérieux", price: "À partir de 12€" },
    ],
    markets: [
        { id: "m1", name: "Brocante de la Place du Jeu de Balle", location: "Bruxelles, Belgique", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80", rating: 4.8, likes: 7654, bookings: 0, tag: "🔥 Culte à Bruxelles", price: "Entrée libre" },
        { id: "m2", name: "Marché Bio de Flagey", location: "Ixelles, Bruxelles", image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80", rating: 4.7, likes: 4321, bookings: 0, tag: "Bio & local", price: "Entrée libre" },
        { id: "m3", name: "Vide-Grenier de Liège (Batte)", location: "Liège, Belgique", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", rating: 4.6, likes: 3109, bookings: 0, tag: "Plus grand de Belgique", price: "Entrée libre" },
        { id: "m4", name: "Marché de Noël de Bruges", location: "Bruges, Bruges", image: "https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=800&q=80", rating: 4.9, likes: 9876, bookings: 0, tag: "Romantique ❤️", price: "Entrée libre" },
        { id: "m5", name: "Brocante Nationale d'Ath", location: "Ath, Hainaut", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", rating: 4.5, likes: 1543, bookings: 0, tag: "Trésors cachés", price: "Entrée libre" },
        { id: "m6", name: "Marché Artisanal de Durbuy", location: "Durbuy, Luxembourg", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80", rating: 4.8, likes: 2345, bookings: 0, tag: "Artisans locaux", price: "Entrée libre" },
    ],
    flights: [
        { id: "f1", name: "Bruxelles → Barcelone", location: "Brussels Airlines · Direct", image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80", rating: 4.8, likes: 12340, bookings: 8765, tag: "🔥 Populaire", price: "À partir de 49€", slug: "/vols" },
        { id: "f2", name: "Bruxelles → Rome", location: "Ryanair · Direct", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80", rating: 4.7, likes: 9876, bookings: 6543, tag: "Culture", price: "À partir de 29€", slug: "/vols" },
        { id: "f3", name: "Bruxelles → Lisbonne", location: "TAP Portugal · Direct", image: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&q=80", rating: 4.9, likes: 7654, bookings: 5432, tag: "Soleil", price: "À partir de 59€", slug: "/vols" },
        { id: "f4", name: "Paris → Marrakech", location: "Air France · Direct", image: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&q=80", rating: 4.6, likes: 11234, bookings: 9876, tag: "Exotique", price: "À partir de 89€", slug: "/vols" },
        { id: "f5", name: "Bruxelles → Londres", location: "easyJet · Direct", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80", rating: 4.5, likes: 15678, bookings: 12345, tag: "Weekend", price: "À partir de 35€", slug: "/vols" },
        { id: "f6", name: "Paris → Dubai", location: "Emirates · Direct", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80", rating: 4.9, likes: 8765, bookings: 4321, tag: "Luxe ✨", price: "À partir de 299€", slug: "/vols" },
    ],
};

const SECTION_TITLES: Record<CategoryId, string> = {
    hotels: "Les hôtels les plus réservés",
    flights: "Les vols les plus recherchés",
    hiking: "Les sentiers les plus parcourus",
    events: "Les événements les plus attendus",
    restaurants: "Les tables les plus appréciées",
    culture: "Les sites les plus visités",
    attractions: "Les attractions les plus populaires",
    nature: "Les espaces naturels les plus aimés",
    markets: "Les marchés les plus courus",
};

function formatCount(n: number) {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
}

interface TrendingSectionProps {
    activeCategory?: CategoryId;
}

export default function TrendingSection({ activeCategory }: TrendingSectionProps) {
    const [localCategory, setLocalCategory] = useState<CategoryId>("hotels");
    const category = activeCategory || localCategory;
    const items = TRENDING_DATA[category] || [];
    const [liked, setLiked] = useState<Set<string>>(new Set());

    const toggleLike = (id: string) => {
        setLiked(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    return (
        <section className="bg-background py-16 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Flame className="w-5 h-5 text-accent" />
                            <span className="text-sm font-semibold text-accent uppercase tracking-wider">Populaire en ce moment</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-foreground">
                            {SECTION_TITLES[category]}
                        </h2>
                        <p className="text-foreground/50 text-sm mt-1">Choix de notre communauté WIGO cette semaine</p>
                    </div>
                    <div className="flex items-center gap-2 bg-foreground/5 border border-foreground/10 rounded-full px-3 py-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-semibold text-foreground/60">Mis à jour en temps réel</span>
                    </div>
                </div>

                {/* Category tabs (only show if no parent category) */}
                {!activeCategory && (
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-6">
                        {CATEGORIES.map(cat => (
                            <button key={cat.id} onClick={() => setLocalCategory(cat.id)}
                                className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all border ${localCategory === cat.id
                                    ? "bg-accent text-white border-accent shadow-md shadow-accent/20"
                                    : "bg-foreground/5 text-foreground/60 border-foreground/10 hover:border-foreground/30 hover:text-foreground"
                                    }`}>
                                <span>{cat.emoji}</span> {cat.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
                    {items.map((item, i) => (
                        <article key={item.id} className="group bg-white dark:bg-[#141412] border border-foreground/[0.06] rounded-2xl overflow-hidden card-3d-subtle animate-slide-up">
                            {/* Image */}
                            <div className="relative h-52 overflow-hidden">
                                <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                                {/* Rank badge */}
                                <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-white/95 backdrop-blur shadow-lg flex items-center justify-center font-black text-sm text-foreground">
                                    {i + 1}
                                </div>
                                {/* Tag */}
                                <div className="absolute top-3 right-12 bg-accent text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-accent/20">
                                    {item.tag}
                                </div>
                                {/* Like button */}
                                <button onClick={() => toggleLike(item.id)}
                                    className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 magnetic ${liked.has(item.id)
                                        ? "bg-red-500 text-white scale-110"
                                        : "bg-white/90 text-foreground/60 hover:text-red-500 hover:bg-white"
                                        }`}>
                                    <Heart className={`w-4 h-4 ${liked.has(item.id) ? "fill-current" : ""}`} />
                                </button>
                                {/* Bottom price overlay */}
                                {item.price && (
                                    <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-black/70 backdrop-blur-xl px-3 py-1.5 rounded-full">
                                        <span className="text-xs font-bold text-foreground dark:text-white">{item.price}</span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="font-bold text-foreground text-base leading-tight mb-0.5 truncate group-hover:text-accent transition-colors duration-300">{item.name}</h3>
                                <p className="text-sm text-foreground/40 mb-3">📍 {item.location}</p>

                                {/* Stats row */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3 text-xs text-foreground/50">
                                        <span className="flex items-center gap-1">
                                            <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
                                            <strong className="text-foreground/70">{formatCount(item.likes + (liked.has(item.id) ? 1 : 0))}</strong>
                                        </span>
                                        {item.bookings > 0 && (
                                            <span className="flex items-center gap-1">
                                                <span>🎫</span>
                                                <strong className="text-foreground/70">{formatCount(item.bookings)}</strong> réservations
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                        <span className="text-xs font-bold text-foreground">{item.rating}</span>
                                    </div>
                                </div>

                                {/* CTA */}
                                <div className="flex items-center justify-end gap-1">
                                    <ShareButton
                                        title={item.name}
                                        location={item.location}
                                        url={`https://wigo.travel/hotel/${encodeURIComponent(item.id)}?name=${encodeURIComponent(item.name)}&location=${encodeURIComponent(item.location)}`}
                                    />
                                    <Link href={`/hotel/${encodeURIComponent(item.id)}?name=${encodeURIComponent(item.name)}&location=${encodeURIComponent(item.location)}&img=${encodeURIComponent(item.image)}&price=${encodeURIComponent(item.price || "")}&rating=${item.rating}`}
                                        className="text-sm font-bold text-accent hover:text-accent/80 flex items-center gap-1 transition-colors px-2 hover-underline">
                                        Voir →
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-10">
                    <p className="text-foreground/40 text-sm">
                        🌍 Basé sur les interactions de <strong className="text-foreground/70">+50 000 voyageurs WIGO</strong> cette semaine
                    </p>
                </div>
            </div>
        </section>
    );
}
