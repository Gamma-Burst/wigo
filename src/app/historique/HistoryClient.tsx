"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { History, Sparkles, AlertCircle, ArrowLeft, Check, Compass, Star } from "lucide-react";

import { GroupedHistory, SavedHotelModel } from "./types";

interface CompareResult {
    idealProfile: string;
    comparison: {
        hotelName: string;
        pros: string[];
        cons: string[];
    }[];
}

export default function HistoryClientRender({ initialData, isPro }: { initialData: GroupedHistory, isPro: boolean }) {
    const [selectedHotels, setSelectedHotels] = useState<SavedHotelModel[]>([]);
    const [isComparing, setIsComparing] = useState(false);
    const [compareResult, setCompareResult] = useState<CompareResult | null>(null);

    const toggleSelection = (hotel: SavedHotelModel) => {
        if (selectedHotels.find(h => h.id === hotel.id)) {
            setSelectedHotels(selectedHotels.filter(h => h.id !== hotel.id));
        } else {
            if (selectedHotels.length < 3) {
                setSelectedHotels([...selectedHotels, hotel]);
            }
        }
    };

    const handleCompare = async () => {
        if (selectedHotels.length < 2) return;
        setIsComparing(true);
        setCompareResult(null);

        try {
            const res = await fetch("/api/compare", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hotels: selectedHotels.map(h => ({ name: h.name, price: h.price, tags: h.tags })) }),
            });
            const data = await res.json();
            setCompareResult(data);
        } catch (err) {
            console.error("Comparison failed", err);
        } finally {
            setIsComparing(false);
        }
    };

    return (
        <main className="min-h-screen pt-24 pb-32">
            <div className="max-w-7xl mx-auto px-6">

                <div className="flex items-center justify-between mb-12 border-b border-foreground/10 pb-6">
                    <div className="flex items-center">
                        <Link href="/" className="mr-6 glass p-2 rounded-full hover:bg-white/30 transition">
                            <ArrowLeft className="w-5 h-5 text-foreground" />
                        </Link>
                        <h1 className="text-4xl font-extrabold flex items-center bg-clip-text text-transparent bg-gradient-to-r from-forest to-accent">
                            <History className="w-8 h-8 mr-3 text-forest" />
                            Mon Historique
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <p className="text-foreground/60 hidden md:block">Vos dernières pépites sauvegardées</p>
                        {isPro && (
                            <span className="px-3 py-1 bg-accent/20 text-accent font-bold rounded-full text-xs flex items-center shadow-inner border border-accent/20">
                                <Star className="w-3 h-3 mr-1 fill-current" /> PRO
                            </span>
                        )}
                    </div>
                </div>

                {/* List by categories */}
                {Object.keys(initialData).length === 0 ? (
                    <div className="text-center py-20 text-foreground/60 p-8 glass rounded-3xl">
                        Vous n&apos;avez pas encore sauvegardé d&apos;hôtels. Retournez à l&apos;accueil pour explorer des pépites !
                    </div>
                ) : (
                    <div className="space-y-16">
                        {Object.entries(initialData).map(([category, hotels]) => (
                            <div key={category} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <h2 className="text-2xl font-bold mb-6 flex items-center text-foreground/90">
                                    <Compass className="w-6 h-6 mr-2 text-accent" />
                                    {category}
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {hotels.map((hotel) => {
                                        const isSelected = selectedHotels.some(h => h.id === hotel.id);
                                        const isMaxed = selectedHotels.length >= 3 && !isSelected;

                                        return (
                                            <div
                                                key={hotel.id}
                                                onClick={() => !isMaxed && toggleSelection(hotel)}
                                                className={`glass p-4 rounded-3xl flex gap-4 cursor-pointer transition-all duration-300 relative overflow-hidden group
                                                    ${isSelected ? 'ring-2 ring-accent bg-accent/5' : 'hover:bg-white/40 dark:hover:bg-black/40'}
                                                    ${isMaxed ? 'opacity-50 cursor-not-allowed grayscale-[0.5]' : ''}
                                                `}
                                            >
                                                {/* Checkbox */}
                                                <div className={`absolute top-4 left-4 z-20 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                                                    ${isSelected ? 'bg-accent border-accent text-white' : 'border-white/50 bg-black/20'}
                                                `}>
                                                    {isSelected && <Check className="w-4 h-4" />}
                                                </div>

                                                <div className="relative w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0">
                                                    {hotel.imageUrl ? (
                                                        <Image src={hotel.imageUrl} alt={hotel.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                                    ) : (
                                                        <div className="w-full h-full bg-forest/20"></div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                                                </div>

                                                <div className="flex-grow py-2">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="font-bold text-lg leading-tight">{hotel.name}</h3>
                                                        <div className="font-extrabold text-accent">{hotel.price ? `${hotel.price}€` : '-'}</div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        {hotel.tags.map((tag, i) => (
                                                            <span key={i} className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 bg-foreground/5 rounded-md text-foreground/70">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* AI Comparison Results Section */}
                {compareResult && (
                    <div className="mt-20 pt-12 border-t border-foreground/10 animate-in fade-in slide-in-from-bottom-12 duration-700">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center justify-center p-3 glass rounded-full mb-4 bg-accent/10">
                                <Sparkles className="w-8 h-8 text-accent animate-pulse" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-foreground mb-4">Le Verdict de WIGO IA</h2>
                            <p className="max-w-2xl mx-auto text-lg text-foreground/80 glass p-6 rounded-3xl border-l-4 border-l-accent">
                                {compareResult.idealProfile}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {compareResult.comparison.map((comp, idx) => {
                                const hotel = selectedHotels.find(h => h.name === comp.hotelName);
                                return (
                                    <div key={idx} className="glass p-6 rounded-3xl relative overflow-hidden flex flex-col hover:-translate-y-2 transition-transform duration-500">
                                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-forest to-accent"></div>
                                        <h3 className="text-xl font-bold mb-6 text-center">{comp.hotelName}</h3>

                                        <div className="flex-grow space-y-6">
                                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-900/30">
                                                <h4 className="font-bold text-green-700 dark:text-green-400 mb-3 flex items-center">
                                                    <Star className="w-5 h-5 mr-2" /> Points Forts
                                                </h4>
                                                <ul className="space-y-2 text-sm text-green-900/80 dark:text-green-200/80">
                                                    {comp.pros.map((pro, i) => <li key={i} className="flex items-start"><Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" /> {pro}</li>)}
                                                </ul>
                                            </div>

                                            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/30">
                                                <h4 className="font-bold text-red-700 dark:text-red-400 mb-3 flex items-center">
                                                    <AlertCircle className="w-5 h-5 mr-2" /> À Savoir
                                                </h4>
                                                <ul className="space-y-2 text-sm text-red-900/80 dark:text-red-200/80">
                                                    {comp.cons.map((con, i) => <li key={i} className="flex items-start"><span className="mr-2 mt-0.5 font-bold">-</span> {con}</li>)}
                                                </ul>
                                            </div>
                                        </div>

                                        {hotel && (
                                            <Link
                                                href={`/hotel/${hotel.id}?name=${encodeURIComponent(hotel.name)}&price=${encodeURIComponent(hotel.price || "0")}&img=${encodeURIComponent(hotel.imageUrl || "")}`}
                                                className="mt-6 w-full py-3 rounded-full border-2 border-foreground/20 text-center font-bold hover:bg-foreground hover:text-background transition-colors"
                                            >
                                                Voir les détails
                                            </Link>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Action Button for Comparison */}
            {selectedHotels.length >= 2 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-24 duration-500 fade-in">
                    <div className="glass p-2 rounded-full shadow-2xl flex items-center gap-4 bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-accent/30 pr-6 pl-4">
                        <div className="flex -space-x-4">
                            {selectedHotels.map((h, i) => (
                                <div key={i} className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-background shadow-sm">
                                    {h.imageUrl && <Image src={h.imageUrl} alt="h" fill className="object-cover" />}
                                </div>
                            ))}
                        </div>
                        <div className="text-sm font-semibold whitespace-nowrap hidden sm:block">
                            {selectedHotels.length} hôtels sélectionnés
                        </div>
                        <button
                            onClick={handleCompare}
                            disabled={isComparing}
                            className="bg-accent hover:bg-accent/90 text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {isComparing ? (
                                <span className="flex items-center"><span className="w-4 h-4 rounded-full bg-white/50 animate-pulse mr-2"></span> IA en cours...</span>
                            ) : (
                                <span className="flex items-center"><Sparkles className="w-5 h-5 mr-2" /> Comparer</span>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
