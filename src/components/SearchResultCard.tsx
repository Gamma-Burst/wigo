import Image from "next/image";
import Link from "next/link";
import { Cloud, Sun, CloudRain, Snowflake, MapPin, Star, Zap, ArrowRight } from "lucide-react";

export interface HotelResult {
    id: string;
    name: string;
    price: string;
    imageUrl: string;
    vibeScore: number;
    tags: string[];
    distanceToHike?: number;
    weather?: "sunny" | "cloudy" | "rainy" | "snowy";
    lat?: number;
    lng?: number;
}

interface SearchResultCardProps {
    hotel: HotelResult;
    isActive?: boolean;
    onSelect?: () => void;
}

export default function SearchResultCard({ hotel, isActive, onSelect }: SearchResultCardProps) {
    const isBaseCamp = hotel.distanceToHike !== undefined && hotel.distanceToHike < 500;
    const starRating = Math.min(5, Math.max(3, Math.round(hotel.vibeScore / 20)));
    const reviewCount = 80 + Math.floor((hotel.vibeScore * 4.1) % 300);

    const WeatherIcon = () => {
        switch (hotel.weather) {
            case "sunny": return <Sun className="w-4 h-4 text-yellow-500" />;
            case "cloudy": return <Cloud className="w-4 h-4 text-gray-400" />;
            case "rainy": return <CloudRain className="w-4 h-4 text-blue-400" />;
            case "snowy": return <Snowflake className="w-4 h-4 text-blue-200" />;
            default: return null;
        }
    };

    const detailUrl = `/hotel/${hotel.id}?name=${encodeURIComponent(hotel.name)}&price=${encodeURIComponent(hotel.price)}&img=${encodeURIComponent(hotel.imageUrl)}`;

    return (
        <div
            className={`group bg-white dark:bg-[#141412] rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer card-3d-subtle border ${isActive ? 'border-accent/50 shadow-[0_0_30px_-5px_rgba(232,101,42,0.3)]' : 'border-foreground/[0.06] hover:border-accent/25'}`}
            onClick={onSelect}
        >
            <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="relative w-full md:w-56 h-56 md:h-auto flex-shrink-0 overflow-hidden">
                    <Image
                        src={hotel.imageUrl}
                        alt={hotel.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 224px"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {/* Vibe Score badge */}
                    <div className="absolute top-3 left-3 bg-accent text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-lg shadow-accent/30 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" /> {hotel.vibeScore}% WIGO
                    </div>
                    {/* Weather */}
                    {hotel.weather && (
                        <div className="absolute top-3 right-3 glass-card p-2 rounded-full">
                            <WeatherIcon />
                        </div>
                    )}
                    {/* Base Camp */}
                    {isBaseCamp && (
                        <div className="absolute bottom-3 left-3 bg-forest text-white text-xs font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                            <MapPin className="w-3 h-3" /> Camp de base
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-grow p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="text-lg font-bold text-foreground leading-tight group-hover:text-accent transition-colors duration-300">{hotel.name}</h3>
                            <div className="text-right flex-shrink-0">
                                <div className="text-2xl font-black text-foreground">{hotel.price}</div>
                                <div className="text-xs text-foreground/40">par nuit</div>
                            </div>
                        </div>

                        {/* Stars + reviews */}
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star key={s} className={`w-3.5 h-3.5 ${s <= starRating ? 'text-amber-400 fill-amber-400' : 'text-foreground/10 fill-foreground/10'}`} />
                                ))}
                            </div>
                            <span className="text-xs font-semibold text-foreground/70">{(3.5 + hotel.vibeScore / 100).toFixed(1)}</span>
                            <span className="text-xs text-foreground/40">({reviewCount} avis)</span>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                            {hotel.tags.slice(0, 4).map((tag, i) => (
                                <span key={i} className="tag-pill">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-foreground/[0.06]">
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full border border-emerald-200/30 dark:border-emerald-800/30">
                            ✓ Annulation gratuite
                        </div>
                        <Link
                            href={detailUrl}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 btn-accent px-5 py-2.5 rounded-xl text-sm group/btn"
                        >
                            Voir l&apos;hôtel
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
