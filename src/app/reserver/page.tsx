"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
    ArrowLeft, Star, MapPin, Shield, CheckCircle,
    CreditCard, Lock, Calendar, Users, ChevronRight
} from "lucide-react";


/* ───────── helpers ───────── */
function addDays(date: Date, n: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
}
function fmt(d: Date) {
    return d.toISOString().split("T")[0];
}
function fmtDisplay(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-BE", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}
function nightsBetween(a: string, b: string) {
    return Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
}
function parsePrice(p: string) {
    const n = parseFloat(p?.replace(/[^0-9.]/g, "") || "0");
    return isNaN(n) ? 120 : n;
}

/* ───────── sub-components ───────── */
function FieldLabel({ children }: { children: React.ReactNode }) {
    return <label className="block text-sm font-semibold text-foreground/80 mb-1.5">{children}</label>;
}
function TextInput({ id, placeholder, value, onChange, type = "text", required = false }:
    { id: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
    return (
        <input id={id} type={type} required={required} value={value} onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-foreground/5 border border-foreground/10 text-foreground placeholder-foreground/30 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition" />
    );
}

/* ───────── main ───────── */
function ReservationContent() {
    const params = useSearchParams();

    const id = params.get("hotelId") || "";
    const name = params.get("name") || "Hôtel";
    const location = params.get("location") || "";
    const priceStr = params.get("price") || "120€";
    const img = params.get("img") || "";
    const ratingStr = params.get("rating") || "4.5";
    const rating = parseFloat(ratingStr);
    const pricePerNight = parsePrice(priceStr);

    const today = new Date();
    const [checkIn, setCheckIn] = useState(fmt(addDays(today, 1)));
    const [checkOut, setCheckOut] = useState(fmt(addDays(today, 3)));
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [rooms, setRooms] = useState(1);

    const [prenom, setPrenom] = useState("");
    const [nom, setNom] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [requests, setRequests] = useState("");

    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const nights = nightsBetween(checkIn, checkOut);
    const roomCost = pricePerNight * nights * rooms;
    const taxRate = 0.06;
    const taxes = Math.round(roomCost * taxRate);
    const touristTax = rooms * nights * 3.5;
    const total = roomCost + taxes + touristTax;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            // Build Booking.com deep link with cache-busting params
            // Use dest_type=hotel and selected_currency + label to bypass cookie-based old searches
            const hotelQuery = encodeURIComponent(name + (location ? ", " + location : ""));
            const timestamp = Date.now();
            const bookingUrl = [
              `https://www.booking.com/searchresults.fr.html`,
              `?ss=${hotelQuery}`,
              `&checkin=${checkIn}`,
              `&checkout=${checkOut}`,
              `&group_adults=${adults}`,
              `&group_children=${children}`,
              `&no_rooms=${rooms}`,
              `&dest_type=hotel`,
              `&sb=1`,
              `&src=searchresults`,
              `&selected_currency=EUR`,
              `&sb_travel_purpose=leisure`,
              `&nflt=`,                          // Force clear all filters
              `&label=wigo-${timestamp}`,         // Unique label to bust Booking cache
              `&aid=304142`,
            ].join("");
            setLoading(false);
            setSubmitted(true);
            // Redirect after showing success screen
            setTimeout(() => window.open(bookingUrl, "_blank"), 1200);
        }, 1500);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h1 className="text-2xl font-black text-foreground mb-3">Demande envoyée !</h1>
                    <p className="text-foreground/60 mb-6">Nous vous redirigeons vers la page de paiement sécurisée pour finaliser votre réservation à <strong>{name}</strong>.</p>
                    <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-5 text-left space-y-2 mb-8">
                        {[
                            ["Séjour", `${fmtDisplay(checkIn)} → ${fmtDisplay(checkOut)}`],
                            ["Voyageurs", `${adults} adulte${adults > 1 ? "s" : ""}${children > 0 ? `, ${children} enfant${children > 1 ? "s" : ""}` : ""}`],
                            ["Chambres", `${rooms}`],
                            ["Total estimé", `${total.toFixed(2)} €`],
                        ].map(([k, v]) => (
                            <div key={k} className="flex justify-between text-sm">
                                <span className="text-foreground/50">{k}</span>
                                <span className="font-semibold text-foreground">{v}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-foreground/40">
                        <Lock className="w-3.5 h-3.5" /> Paiement 100% sécurisé SSL
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Top bar */}
            <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-lg border-b border-foreground/10">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
                    <Link href={`/hotel/${id}?name=${encodeURIComponent(name)}&location=${encodeURIComponent(location)}&price=${encodeURIComponent(priceStr)}&img=${encodeURIComponent(img)}&rating=${ratingStr}`}
                        className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition">
                        <ArrowLeft className="w-4 h-4" /> Retour à l&apos;hôtel
                    </Link>
                    <div className="flex-grow h-px bg-foreground/10 hidden md:block" />
                    <div className="flex items-center gap-3 text-xs text-foreground/40">
                        <span className="flex items-center gap-1 text-accent font-semibold"><span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-xs font-black">1</span> Vos infos</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="flex items-center gap-1"><span className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-black">2</span> Paiement</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="flex items-center gap-1"><span className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-black">3</span> Confirmation</span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-black text-foreground mb-8">Finalisez votre réservation</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ─── LEFT: Form ─── */}
                    <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">

                        {/* Dates & Guests */}
                        <div className="bg-white dark:bg-zinc-900 border border-foreground/10 rounded-2xl p-6 shadow-sm">
                            <h2 className="font-bold text-lg text-foreground mb-5 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-accent" /> Dates & voyageurs
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <FieldLabel>Arrivée *</FieldLabel>
                                    <input type="date" required value={checkIn} min={fmt(addDays(today, 1))}
                                        onChange={e => { setCheckIn(e.target.value); if (e.target.value >= checkOut) setCheckOut(fmt(addDays(new Date(e.target.value), 1))); }}
                                        className="w-full bg-foreground/5 border border-foreground/10 text-foreground text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition" />
                                </div>
                                <div>
                                    <FieldLabel>Départ *</FieldLabel>
                                    <input type="date" required value={checkOut} min={fmt(addDays(new Date(checkIn), 1))}
                                        onChange={e => setCheckOut(e.target.value)}
                                        className="w-full bg-foreground/5 border border-foreground/10 text-foreground text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { label: "Adultes", value: adults, set: setAdults, min: 1, max: 6 },
                                    { label: "Enfants", value: children, set: setChildren, min: 0, max: 4 },
                                    { label: "Chambres", value: rooms, set: setRooms, min: 1, max: 4 },
                                ].map(({ label, value, set, min, max }) => (
                                    <div key={label}>
                                        <FieldLabel>{label}</FieldLabel>
                                        <div className="flex items-center border border-foreground/10 bg-foreground/5 rounded-xl overflow-hidden">
                                            <button type="button" onClick={() => set(Math.max(min, value - 1))} className="px-3 py-3 text-foreground/60 hover:text-foreground hover:bg-foreground/10 transition text-lg font-bold">−</button>
                                            <span className="flex-grow text-center font-bold text-sm text-foreground">{value}</span>
                                            <button type="button" onClick={() => set(Math.min(max, value + 1))} className="px-3 py-3 text-foreground/60 hover:text-foreground hover:bg-foreground/10 transition text-lg font-bold">+</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="bg-white dark:bg-zinc-900 border border-foreground/10 rounded-2xl p-6 shadow-sm">
                            <h2 className="font-bold text-lg text-foreground mb-5 flex items-center gap-2">
                                <Users className="w-5 h-5 text-accent" /> Vos coordonnées
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <FieldLabel>Prénom *</FieldLabel>
                                    <TextInput id="prenom" required placeholder="Ex: Marie" value={prenom} onChange={setPrenom} />
                                </div>
                                <div>
                                    <FieldLabel>Nom de famille *</FieldLabel>
                                    <TextInput id="nom" required placeholder="Ex: Dupont" value={nom} onChange={setNom} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <FieldLabel>E-mail *</FieldLabel>
                                    <TextInput id="email" required type="email" placeholder="votre@email.com" value={email} onChange={setEmail} />
                                </div>
                                <div>
                                    <FieldLabel>Téléphone</FieldLabel>
                                    <TextInput id="phone" type="tel" placeholder="+32 4xx xx xx xx" value={phone} onChange={setPhone} />
                                </div>
                            </div>
                            <div>
                                <FieldLabel>Demandes particulières</FieldLabel>
                                <textarea value={requests} onChange={e => setRequests(e.target.value)} rows={3}
                                    placeholder="Chambre haute, lit bébé, arrivée tardive..."
                                    className="w-full bg-foreground/5 border border-foreground/10 text-foreground placeholder-foreground/30 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition resize-none" />
                                <p className="text-xs text-foreground/40 mt-1">Non garanties mais transmises à l&apos;établissement</p>
                            </div>
                        </div>

                        {/* Cancellation */}
                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-2xl p-5">
                            <h3 className="font-bold text-base text-foreground mb-3 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-amber-500" /> Politique d&apos;annulation
                            </h3>
                            <div className="space-y-2 text-sm text-foreground/70">
                                <p>✅ <strong>Annulation gratuite</strong> jusqu&apos;à 24h avant l&apos;arrivée</p>
                                <p>⚠️ Après ce délai, des frais peuvent s&apos;appliquer selon les conditions de l&apos;établissement</p>
                                <p>📧 Confirmation par email dans les 10 minutes</p>
                            </div>
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={loading || !prenom || !nom || !email}
                            className="w-full flex items-center justify-center gap-3 bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-lg py-5 rounded-2xl transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-accent/30 shadow-lg">
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    Préparation de votre réservation...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="w-6 h-6" />
                                    Finaliser ma réservation · {total.toFixed(0)} €
                                </>
                            )}
                        </button>
                        <div className="flex items-center justify-center gap-3 text-foreground/40 text-xs">
                            <Lock className="w-3.5 h-3.5" /> Paiement 100% sécurisé
                            <span>·</span>
                            <Shield className="w-3.5 h-3.5" /> Données protégées
                            <span>·</span>
                            ✓ Meilleur prix garanti
                        </div>
                    </form>

                    {/* ─── RIGHT: Summary ─── */}
                    <div className="space-y-5">
                        {/* Hotel card */}
                        <div className="bg-white dark:bg-zinc-900 border border-foreground/10 rounded-2xl p-5 shadow-sm">
                            <div className="relative w-full h-40 rounded-xl overflow-hidden mb-4">
                                {img ? (
                                    <Image src={img} alt={name} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-accent/20 to-forest/20 flex items-center justify-center text-4xl">🏨</div>
                                )}
                            </div>
                            <h3 className="font-bold text-base text-foreground leading-tight mb-1">{name}</h3>
                            {location && (
                                <p className="text-sm text-foreground/50 flex items-center gap-1 mb-3">
                                    <MapPin className="w-3.5 h-3.5" /> {location}
                                </p>
                            )}
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-foreground/20"}`} />)}
                                <span className="ml-1 text-xs font-semibold text-foreground/60">{rating.toFixed(1)}</span>
                            </div>
                        </div>

                        {/* Price breakdown */}
                        <div className="bg-white dark:bg-zinc-900 border border-foreground/10 rounded-2xl p-5 shadow-sm">
                            <h3 className="font-bold text-base text-foreground mb-4">Détail du prix</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-foreground/70">
                                    <span>{pricePerNight.toFixed(0)} € × {nights} nuit{nights > 1 ? "s" : ""} × {rooms} chambre{rooms > 1 ? "s" : ""}</span>
                                    <span className="font-semibold">{roomCost.toFixed(2)} €</span>
                                </div>
                                <div className="flex justify-between text-foreground/70">
                                    <span>Taxes et frais ({(taxRate * 100).toFixed(0)}%)</span>
                                    <span className="font-semibold">{taxes.toFixed(2)} €</span>
                                </div>
                                <div className="flex justify-between text-foreground/70">
                                    <span>Taxe de séjour</span>
                                    <span className="font-semibold">{touristTax.toFixed(2)} €</span>
                                </div>
                                <div className="border-t border-foreground/10 pt-3 mt-3 flex justify-between font-black text-foreground text-base">
                                    <span>Total</span>
                                    <span className="text-accent">{total.toFixed(2)} €</span>
                                </div>
                            </div>
                        </div>

                        {/* Trust */}
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { icon: "🔒", label: "Paiement SSL" },
                                { icon: "📧", label: "Confirmation immédiate" },
                                { icon: "✅", label: "Annulation gratuite" },
                                { icon: "🏆", label: "Meilleur prix garanti" },
                            ].map(({ icon, label }) => (
                                <div key={label} className="bg-foreground/3 border border-foreground/8 rounded-xl p-3 text-center">
                                    <div className="text-lg mb-1">{icon}</div>
                                    <div className="text-xs font-medium text-foreground/60">{label}</div>
                                </div>
                            ))}
                        </div>

                        {/* WIGO logo */}
                        <div className="text-center">
                            <Image src="/logo-banner.png" alt="WIGO" width={100} height={30} className="h-7 w-auto object-contain mx-auto opacity-50" />
                            <p className="text-xs text-foreground/30 mt-1">Votre compagnon de voyage IA</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ReservationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <ReservationContent />
        </Suspense>
    );
}
