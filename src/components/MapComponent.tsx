"use client";

interface MapComponentProps {
    hotel: {
        lat?: number;
        lng?: number;
        name: string;
    }
}

export default function MapComponent({ hotel }: MapComponentProps) {
    const lat = hotel.lat || 38.7223;
    const lng = hotel.lng || -9.1393;

    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`;

    return (
        <div className="w-full h-full rounded-2xl overflow-hidden relative border border-white/10 shadow-2xl">
            <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-accent/20">
                <span className="text-[10px] font-black text-accent uppercase tracking-widest">📍 {hotel.name}</span>
            </div>
            <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                title={`Carte - ${hotel.name}`}
            />
        </div>
    );
}