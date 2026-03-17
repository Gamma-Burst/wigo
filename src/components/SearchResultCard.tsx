"use client";

import Image from "next/image";
import { Zap, ArrowRight, Star } from "lucide-react";
import { useState } from "react";
import { EnhancedHotelResult } from "@/services/hotel-provider";

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
}


interface SearchResultCardProps {
    hotel: EnhancedHotelResult;
    isActive?: boolean;
    onSelect?: () => void;
}

export default function SearchResultCard({ hotel, isActive, onSelect }: SearchResultCardProps) {
    const [loading, setLoading] = useState(false);

    const handleInternalBooking = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setLoading(true);
        try {
            const res = await fetch('/api/stripe/hotel-checkout', {
                method: 'POST',
                body: JSON.stringify({
                    hotelName: hotel.name,
                    price: hotel.priceNum,
                    hotelId: hotel.id,
                    imageUrl: hotel.imageUrl
                })
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
        } catch {
            setLoading(false);
        }
    };

    return (
        <div
            className={`group bg-white dark:bg-[#141412] rounded-2xl overflow-hidden border transition-all duration-300 ${isActive ? 'border-accent shadow-xl' : 'border-white/5'}`}
            onClick={onSelect}
        >
            <div className="flex flex-col md:flex-row">
                <div className="relative w-full md:w-52 h-48">
                    <Image src={hotel.imageUrl} alt={hotel.name} fill className="object-cover" />
                    <div className="absolute top-2 left-2 bg-accent text-white text-[10px] font-black px-2 py-1 rounded-lg">
                        <Zap className="w-3 h-3 inline mr-1" /> {hotel.vibeScore}% WIGO
                    </div>
                </div>
                <div className="flex-grow p-4 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-foreground text-sm leading-tight">{hotel.name}</h3>
                            <div className="text-right">
                                <div className="text-lg font-black text-foreground">{hotel.price}</div>
                                <div className="text-[10px] opacity-40">TTC sur WIGO</div>
                            </div>
                        </div>
                        <div className="flex gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} className={`w-3 h-3 ${s <= (hotel.hotelRating || 3) ? 'text-amber-400 fill-amber-400' : 'text-white/10'}`} />
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        <div className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-1 rounded-full">
                            ✓ Confirmation immédiate
                        </div>
                        <button
                            onClick={handleInternalBooking}
                            disabled={loading}
                            className="btn-accent px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
                        >
                            {loading ? "Vérification..." : "Réserver"} <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}