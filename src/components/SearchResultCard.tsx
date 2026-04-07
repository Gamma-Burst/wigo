"use client";

import Image from "next/image";
import { ArrowRight, Star, Heart } from "lucide-react";
import { motion } from "framer-motion";

export interface HotelResult {
    id: string;
    name: string;
    price: string;
    imageUrl: string;
    vibeScore: number;
    tags: string[];
    lat: number;
    lng: number;
    weather?: string;
    hotelRating?: number;
    priceNum?: number;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
}


interface SearchResultCardProps {
    hotel: HotelResult;
    isActive: boolean;
    onSelect: () => void;
    onBook?: () => void;
}

export default function SearchResultCard({ hotel, isActive, onSelect, onBook }: SearchResultCardProps) {

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.3 }}
            className={`group card-3d bg-white dark:bg-[#141412] rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer ${isActive ? 'border-accent shadow-[0_0_30px_rgba(232,101,42,0.2)]' : 'border-white/5 hover:border-white/15'}`}
            onClick={onSelect}
        >
            <div className="flex flex-col md:flex-row">
                {/* Images */}
                <div className="w-full md:w-[35%] h-[250px] relative overflow-hidden shrink-0">
                    <Image
                        src={hotel.imageUrl}
                        alt={hotel.name}
                        fill
                        className="object-cover transition-transform duration-700 blur-0 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-md p-2 rounded-full cursor-pointer hover:bg-white/20 transition-colors">
                        <Heart className="w-4 h-4 text-white" />
                    </div>
                    {hotel.vibeScore && (
                        <div className="absolute top-3 left-3 bg-accent text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                            <span className="text-white text-base">⚡</span> {hotel.vibeScore}% WIGO
                        </div>
                    )}
                </div>

                {/* Contenu */}
                <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-xl font-bold font-display text-foreground group-hover:text-accent transition-colors leading-tight">{hotel.name}</h3>
                                <div className="flex items-center text-yellow-500 mt-1">
                                    {[...Array(hotel.hotelRating || 3)].map((_, i) => (
                                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                                    ))}
                                </div>
                            </div>
                            <div className="text-right pl-4 shrink-0">
                                <div className="text-2xl font-black text-foreground">{hotel.price}</div>
                                <div className="text-[10px] text-foreground/40 font-medium">TTC sur WIGO</div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4 mb-6">
                            {hotel.tags.map((tag, i) => (
                                <span key={i} className="text-xs bg-foreground/5 text-foreground/60 px-3 py-1 rounded-full border border-foreground/5">{tag}</span>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        <div className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-1 rounded-full">
                            ✓ Confirmation immédiate
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onBook) onBook();
                            }}
                            className="btn-accent px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
                        >
                            Réserver <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}