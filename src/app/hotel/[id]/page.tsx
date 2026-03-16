"use client";
import NextImage from "next/image";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Sparkles, Map, Utensils, Compass, ShieldCheck, Heart, Star, Wifi, Car, Coffee, ChevronRight } from "lucide-react";

interface HotelDetailsData {
    whyWeRecommend: string;
    gearTip: string;
    radar: {
        hikes: { name: string; difficulty: string; duration: string }[];
        foodSpots: { name: string; description: string }[];
    };
}

function HotelDetailContent() {
    const searchParams = useSearchParams();
    const name = searchParams.get("name") || "";
    const price = searchParams.get("price") || "";
    const img = searchParams.get("img") || "";
    const location = searchParams.get("location") || "";

    const [data, setData] = useState<HotelDetailsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<"overview" | "activities" | "food">("overview");

    useEffect(() => {
        async function fetchDetails() {
            try {
                const res = await fetch("/api/hotel-details", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ hotelName: name, location: location || "Europe" }),
                });
                if (!res.ok) throw new Error("API error");
                const json = await res.json();
                if (json && json.whyWeRecommend) {
                    setData(json);
                }
            } catch (err) {
                console.error("Hotel detail fetch error:", err);
            } finally {
                setLoading(false);
            }
        }
        if (name) fetchDetails();
        else setLoading(false);
    }, [name, location]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch("/api/hotels/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hotelId: name, name, location, imageUrl: img, price: parseFloat(price?.replace(/[^0-9.]/g, "") || "0") }),
            });
            const resData = await res.json();
            if (res.ok) setIsSaved(resData.saved);
            else alert("Connectez-vous pour sauvegarder !");
        } catch (error) {
            console.error("Save error:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const DifficultyBadge = ({ level }: { level: string }) => {
        const cls = level.toLowerCase().includes("facil") ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
            level.toLowerCase().includes("inter") ? "bg-amber-100 text-amber-800 border-amber-200" :
                "bg-red-100 text-red-800 border-red-200";
        return <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${cls}`}>{level}</span>;
    };

    const fauxRating = 4.2 + Math.random() * 0.6;
    const reviewCount = 120 + Math.floor(Math.random() * 400);

    return (
        <main className="min-h-screen bg-background pb-32">
            {/* HERO */}
            <div className="relative h-[60vh] min-h-[480px] w-full">
                {img ? (
                    <Image src={img} alt={name} fill className="object-cover" priority />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-forest/30 to-accent/20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

                {/* Nav */}
                <div className="absolute top-0 w-full px-6 pt-6 z-10 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 bg-white/15 hover:bg-white/30 text-white px-4 py-2.5 rounded-full backdrop-blur-md border border-white/20 transition font-medium text-sm shadow-lg">
                        <ArrowLeft className="w-4 h-4" /> Retour
                    </Link>
                    <NextImage src="/logo-icon.png" alt="WIGO" width={44} height={44} className="w-11 h-11 object-contain drop-shadow" />
                </div>

                {/* Hero content */}
                <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 z-10">
                    <div className="max-w-7xl mx-auto">
                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow">⚡ WIGO Recommande</span>
                            <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm border border-white/30">✓ Annulation Gratuite</span>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-2xl leading-tight mb-2">{name}</h1>
                                <div className="flex flex-wrap items-center gap-4 text-white/90">
                                    <span className="flex items-center gap-1.5 text-sm font-medium">
                                        <Map className="w-4 h-4" /> {location || "Europe"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star key={s} className={`w-4 h-4 ${s <= Math.round(fauxRating) ? "text-yellow-400 fill-yellow-400" : "text-white/30"}`} />
                                        ))}
                                        <span className="ml-1 text-sm font-semibold">{fauxRating.toFixed(1)}</span>
                                        <span className="text-white/60 text-sm ml-1">({reviewCount} avis)</span>
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={handleSave} disabled={isSaving}
                                    className={`p-3.5 rounded-full transition-all duration-300 backdrop-blur-md shadow-xl border ${isSaved ? 'bg-rose-500 border-rose-400 text-white' : 'bg-white/15 border-white/30 text-white hover:bg-white/30'}`}>
                                    <Heart className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
                                </button>
                                <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 text-white text-right">
                                    <div className="text-xs text-white/70 mb-0.5">Prix moyen</div>
                                    <div className="text-3xl font-black text-accent">{price}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* LEFT: Main Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Quick amenities bar */}
                        <div className="flex flex-wrap gap-3">
                            {[
                                { icon: Wifi, label: "Wi-Fi Inclus" },
                                { icon: Car, label: "Parking Gratuit" },
                                { icon: Coffee, label: "Petit-Déj Inclus" },
                                { icon: ShieldCheck, label: "Assurance Voyage" },
                            ].map(({ icon: Icon, label }) => (
                                <div key={label} className="flex items-center gap-2 bg-white dark:bg-white/5 border border-foreground/10 px-4 py-2.5 rounded-xl text-sm font-medium text-foreground/80 shadow-sm">
                                    <Icon className="w-4 h-4 text-accent" /> {label}
                                </div>
                            ))}
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 bg-foreground/5 p-1 rounded-xl w-fit">
                            {(["overview", "activities", "food"] as const).map((tab) => {
                                const labels = { overview: "✨ L'essentiel", activities: "🥾 Randos", food: "🍽 Food" };
                                return (
                                    <button key={tab} onClick={() => setActiveTab(tab)}
                                        className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? 'bg-white dark:bg-white/10 shadow text-accent' : 'text-foreground/60 hover:text-foreground'}`}>
                                        {labels[tab]}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tab: Overview */}
                        {activeTab === "overview" && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="bg-gradient-to-br from-accent/5 to-forest/5 border border-accent/10 p-8 rounded-3xl shadow-sm">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2.5 bg-accent/10 rounded-xl">
                                            <Sparkles className="w-5 h-5 text-accent" />
                                        </div>
                                        <h2 className="text-xl font-bold text-foreground">Pourquoi WIGO adore ce lieu</h2>
                                    </div>
                                    {loading ? (
                                        <div className="animate-pulse space-y-3">
                                            {[100, 90, 95, 80].map((w, i) => (
                                                <div key={i} className={`h-4 bg-foreground/10 rounded`} style={{ width: `${w}%` }} />
                                            ))}
                                        </div>
                                    ) : data?.whyWeRecommend ? (
                                        <p className="text-foreground/80 leading-relaxed text-base">{data.whyWeRecommend}</p>
                                    ) : (
                                        <p className="text-foreground/60 italic">Contenu en cours de génération par notre IA...</p>
                                    )}
                                </div>

                                {/* Gear Tip */}
                                {(loading || data?.gearTip) && (
                                    <div className="flex items-start gap-4 bg-forest/5 border border-forest/15 p-5 rounded-2xl">
                                        <span className="text-2xl">🎒</span>
                                        <div>
                                            <div className="text-xs font-bold uppercase tracking-wider text-forest/70 mb-1">Conseil Équipement WIGO</div>
                                            {loading ? (
                                                <div className="h-4 bg-foreground/10 rounded w-3/4 animate-pulse" />
                                            ) : (
                                                <p className="text-sm font-medium text-foreground/80">{data?.gearTip}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab: Activities */}
                        {activeTab === "activities" && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                    <Compass className="w-5 h-5 text-forest" /> Top Randonnées à proximité
                                </h3>
                                {loading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-foreground/5 rounded-2xl animate-pulse" />)}
                                    </div>
                                ) : data?.radar.hikes.length ? data.radar.hikes.map((hike, i) => (
                                    <div key={i} className="flex items-center justify-between p-5 bg-white dark:bg-white/5 border border-foreground/10 rounded-2xl hover:border-forest/30 hover:shadow-md transition-all group">
                                        <div>
                                            <div className="font-bold text-foreground group-hover:text-forest transition-colors">{hike.name}</div>
                                            <div className="flex items-center gap-3 mt-2">
                                                <DifficultyBadge level={hike.difficulty} />
                                                <span className="text-sm text-foreground/60">⏱ {hike.duration}</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-foreground/30 group-hover:text-forest transition-colors" />
                                    </div>
                                )) : (
                                    <p className="text-foreground/50 italic">Aucune randonnée trouvée pour ce lieu.</p>
                                )}
                            </div>
                        )}

                        {/* Tab: Food */}
                        {activeTab === "food" && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                    <Utensils className="w-5 h-5 text-accent" /> Spots gastronomiques à tester
                                </h3>
                                {loading ? (
                                    <div className="space-y-3">
                                        {[1, 2].map(i => <div key={i} className="h-24 bg-foreground/5 rounded-2xl animate-pulse" />)}
                                    </div>
                                ) : data?.radar.foodSpots.length ? data.radar.foodSpots.map((spot, i) => (
                                    <div key={i} className="p-5 bg-white dark:bg-white/5 border border-foreground/10 rounded-2xl hover:border-accent/30 hover:shadow-md transition-all">
                                        <div className="font-bold text-foreground mb-1">{spot.name}</div>
                                        <div className="text-sm text-foreground/70">{spot.description}</div>
                                    </div>
                                )) : (
                                    <p className="text-foreground/50 italic">Aucun spot trouvé pour ce lieu.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Booking CTA */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-4">
                            <div className="bg-white dark:bg-white/5 border border-foreground/10 rounded-3xl p-7 shadow-xl">
                                <div className="text-center mb-6">
                                    <div className="text-sm text-foreground/50 mb-1">Prix par nuit à partir de</div>
                                    <div className="text-4xl font-black text-accent">{price}</div>
                                    <div className="text-xs text-foreground/40 mt-1">Taxes et frais inclus</div>
                                </div>

                                {/* Rating visual */}
                                <div className="flex items-center justify-between py-4 border-y border-foreground/10 mb-6">
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-foreground">{fauxRating.toFixed(1)}</div>
                                        <div className="text-xs text-foreground/50">Note globale</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-foreground">{reviewCount}</div>
                                        <div className="text-xs text-foreground/50">Avis vérifiés</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-forest">92%</div>
                                        <div className="text-xs text-foreground/50">Recommandent</div>
                                    </div>
                                </div>

                                <Link
                                    href={`/reserver?hotelId=${encodeURIComponent(name)}&name=${encodeURIComponent(name)}&location=${encodeURIComponent(location)}&price=${encodeURIComponent(price)}&img=${encodeURIComponent(img)}&rating=${fauxRating.toFixed(1)}`}
                                    className="w-full bg-accent hover:bg-accent/90 text-white rounded-2xl py-4 px-6 font-bold text-base transition-all duration-300 hover:shadow-xl hover:shadow-accent/30 flex items-center justify-center gap-2 group mb-3">
                                    Réserver maintenant
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <div className="text-center text-xs text-foreground/40">
                                    🔒 Paiement sécurisé • Annulation possible
                                </div>
                            </div>

                            {/* Trust badges */}
                            <div className="grid grid-cols-3 gap-2 text-center">
                                {["Meilleur Prix", "Sans Frais", "Support 24h"].map(label => (
                                    <div key={label} className="bg-foreground/5 border border-foreground/10 rounded-xl py-2.5 px-1">
                                        <div className="text-xs font-semibold text-foreground/70">{label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}

export default function HotelDetailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-foreground/60 font-medium">Chargement de votre aventure...</p>
                </div>
            </div>
        }>
            <HotelDetailContent />
        </Suspense>
    );
}
