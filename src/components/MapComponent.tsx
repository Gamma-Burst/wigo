"use client";

import { HotelResult } from "./SearchResultCard";

interface MapComponentProps {
    hotel: HotelResult;
}

export default function MapComponent({ hotel }: MapComponentProps) {
    const lat = hotel.lat || 45.9;
    const lng = hotel.lng || 6.1;

    // Using OpenStreetMap iframe - no JS library needed, no crashes
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.05}%2C${lat - 0.05}%2C${lng + 0.05}%2C${lat + 0.05}&layer=mapnik&marker=${lat}%2C${lng}`;

    return (
        <div className="w-full h-full rounded-2xl overflow-hidden shadow-xl relative">
            {/* Hotel name overlay */}
            <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-black/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="font-bold text-sm text-foreground truncate max-w-[200px]">{hotel.name}</span>
            </div>

            <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '1rem' }}
                title={`Carte - ${hotel.name}`}
                loading="lazy"
            />

            {/* 5km radius legend */}
            <div className="absolute bottom-4 right-4 z-10 bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md text-xs font-semibold text-accent border border-accent/20">
                📍 Zone 5km
            </div>
        </div>
    );
}
