"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, MapPin, Clock, Tag, Calendar, ArrowRight } from "lucide-react";
import type { ActivityResult } from "@/app/api/search-activities/route";

const CATEGORY_COLORS: Record<string, string> = {
    hiking: "bg-emerald-100 text-emerald-800",
    events: "bg-purple-100 text-purple-800",
    restaurants: "bg-amber-100 text-amber-800",
    culture: "bg-blue-100 text-blue-800",
    attractions: "bg-pink-100 text-pink-800",
    nature: "bg-green-100 text-green-800",
    markets: "bg-orange-100 text-orange-800",
};

const CATEGORY_LABELS: Record<string, string> = {
    hiking: "🥾 Rando",
    events: "🎪 Événement",
    restaurants: "🍽 Restaurant",
    culture: "🏰 Culture",
    attractions: "🎠 Attraction",
    nature: "🌿 Nature",
    markets: "🛍 Brocante",
};

interface Props {
    activity: ActivityResult;
}

export default function ActivityCard({ activity }: Props) {
    const router = useRouter();
    const rating = typeof activity.rating === "number" ? activity.rating : 4.2;

    const handleClick = () => {
        const params = new URLSearchParams({
            name: activity.name,
            category: activity.category,
            description: activity.description,
            address: activity.address,
            price: activity.price,
            img: activity.imageUrl || "",
            tags: activity.tags?.join(",") || "",
            openingHours: activity.openingHours || "",
            date: activity.date || "",
            duration: activity.duration || "",
            difficulty: activity.difficulty || "",
            rating: String(rating),
        });
        router.push(`/activity/${encodeURIComponent(activity.id)}?${params.toString()}`);
    };

    return (
        <div
            onClick={handleClick}
            className="group bg-white dark:bg-zinc-900 border border-foreground/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col md:flex-row"
        >
            {/* Image */}
            <div className="relative w-full md:w-56 h-48 md:h-auto flex-shrink-0 overflow-hidden">
                {activity.imageUrl ? (
                    <Image
                        src={activity.imageUrl}
                        alt={activity.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent/20 to-forest/20 flex items-center justify-center text-4xl">
                        {CATEGORY_LABELS[activity.category]?.split(" ")[0] || "🌍"}
                    </div>
                )}
                {/* Category badge */}
                <div className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[activity.category] || "bg-gray-100 text-gray-800"}`}>
                    {CATEGORY_LABELS[activity.category] || activity.category}
                </div>
            </div>

            {/* Content */}
            <div className="flex-grow p-5 flex flex-col justify-between gap-3">
                <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-bold text-lg text-foreground leading-snug group-hover:text-accent transition-colors">
                            {activity.name}
                        </h3>
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="font-bold text-sm text-foreground">{rating.toFixed(1)}</span>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-foreground/60 line-clamp-2 mb-3">{activity.description}</p>

                    {/* Meta info */}
                    <div className="flex flex-wrap gap-3 text-xs text-foreground/50">
                        {activity.address && (
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" /> {activity.address}
                            </span>
                        )}
                        {activity.openingHours && (
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> {activity.openingHours}
                            </span>
                        )}
                        {activity.date && (
                            <span className="flex items-center gap-1 text-accent font-semibold">
                                <Calendar className="w-3.5 h-3.5" /> {activity.date}
                            </span>
                        )}
                        {activity.duration && (
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> {activity.duration}
                            </span>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-foreground/10">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                        {activity.tags?.slice(0, 3).map((tag) => (
                            <span key={tag} className="flex items-center gap-1 text-xs bg-foreground/5 text-foreground/70 px-2.5 py-1 rounded-full border border-foreground/10">
                                <Tag className="w-3 h-3" /> {tag}
                            </span>
                        ))}
                    </div>

                    {/* Price + CTA */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`font-black text-base ${activity.price?.toLowerCase() === "gratuit" || activity.price?.toLowerCase() === "entrée libre" ? "text-emerald-600" : "text-accent"}`}>
                            {activity.price}
                        </span>
                        <button className="flex items-center gap-1.5 bg-accent text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-accent/90 transition group-hover:scale-105">
                            Voir <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
