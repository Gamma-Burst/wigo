"use client";

export type CategoryId = "hotels" | "hiking" | "events" | "restaurants" | "culture" | "attractions" | "nature" | "markets";

export interface Category {
    id: CategoryId;
    label: string;
    emoji: string;
    placeholder: string;
}

export const CATEGORIES: Category[] = [
    { id: "hotels", label: "Hôtels", emoji: "🏨", placeholder: "Hotel spa à Bruxelles 2 personnes..." },
    { id: "hiking", label: "Randos", emoji: "🥾", placeholder: "Sentier facile en famille près de Liège..." },
    { id: "events", label: "Événements", emoji: "🎪", placeholder: "Fête médiévale en Belgique ce weekend..." },
    { id: "restaurants", label: "Restaurants", emoji: "🍽", placeholder: "Gastronomie locale à Namur..." },
    { id: "culture", label: "Culture", emoji: "🏰", placeholder: "Château médiéval à visiter dans les Ardennes..." },
    { id: "attractions", label: "Attractions", emoji: "🎠", placeholder: "Parc animalier pour enfants Belgique..." },
    { id: "nature", label: "Nature", emoji: "🌿", placeholder: "Réserve naturelle Hautes Fagnes..." },
    { id: "markets", label: "Brocantes", emoji: "🛍", placeholder: "Grand marché brocante dimanche près de chez moi..." },
];

interface CategoryTabsProps {
    active: CategoryId;
    onChange: (id: CategoryId) => void;
}

export default function CategoryTabs({ active, onChange }: CategoryTabsProps) {
    return (
        <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex gap-2 min-w-max px-1">
                {CATEGORIES.map((cat) => {
                    const isActive = active === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => onChange(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap border ${isActive
                                    ? "bg-accent text-white border-accent shadow-lg shadow-accent/30 scale-105"
                                    : "bg-white/10 text-white/70 border-white/20 hover:bg-white/20 hover:text-white hover:border-white/40"
                                }`}
                        >
                            <span className="text-base">{cat.emoji}</span>
                            {cat.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
