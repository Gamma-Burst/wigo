"use client";

import { useState } from "react";
import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";
import { Check, X, Zap, Crown, Lock } from "lucide-react";

const FEATURES = [
    { label: "Recherche IA en langage naturel", free: true, pro: true },
    { label: "Voir jusqu'à 2 résultats", free: true, pro: false },
    { label: "Résultats illimités", free: false, pro: true },
    { label: "Sauvegarder des favoris", free: false, pro: true },
    { label: "Analyse IA de l'hôtel (randos, food...)", free: false, pro: true },
    { label: "Comparaison côte à côte des hôtels", free: false, pro: true },
    { label: "Alertes prix sur vos favoris", free: false, pro: true },
    { label: "Historique personnalisé", free: false, pro: true },
    { label: "Export PDF de votre séjour", free: false, pro: true },
    { label: "Support prioritaire 24h/7j", free: false, pro: true },
];

const TESTIMONIALS = [
    { name: "Marie L.", text: "WIGO m'a trouvé un hôtel incroyable à Bruges en 3 secondes. Jamais vu ça!", avatar: "ML" },
    { name: "Thomas B.", text: "L'analyse IA par hôtel vaut à elle seule l'abonnement. Je ne voyage plus sans WIGO.", avatar: "TB" },
    { name: "Sarah K.", text: "Enfin un moteur de voyage qui comprend vraiment ce qu'on veut. Bluffant.", avatar: "SK" },
];

export default function PricingPage() {
    const [annual, setAnnual] = useState(true);
    const monthlyPrice = 9.99;
    const annualPrice = 6.99;

    return (
        <main className="min-h-screen bg-background">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pt-32 pb-24 text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/20 rounded-full blur-[120px] -translate-y-1/2" />
                <Link href="/" className="absolute top-6 left-6 text-white/70 hover:text-white transition text-sm font-medium">← Retour</Link>

                <div className="relative z-10 max-w-4xl mx-auto px-6">
                    <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent text-sm font-semibold px-4 py-2 rounded-full mb-6">
                        <Crown className="w-4 h-4" /> Passez à la vitesse supérieure
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
                        Voyagez plus intelligent.<br />
                        <span className="bg-gradient-to-r from-accent to-amber-400 bg-clip-text text-transparent">Dépensez moins.</span>
                    </h1>
                    <p className="text-lg text-white/60 max-w-2xl mx-auto">
                        WIGO Pro débloque toute la puissance de l&apos;IA pour trouver, analyser et organiser vos séjours parfaits.
                    </p>

                    {/* Toggle annual/monthly */}
                    <div className="flex items-center justify-center gap-4 mt-10">
                        <span className={`text-sm font-medium ${!annual ? "text-white" : "text-white/40"}`}>Mensuel</span>
                        <button onClick={() => setAnnual(a => !a)}
                            className={`relative w-14 h-7 rounded-full transition-all duration-300 ${annual ? "bg-accent" : "bg-white/20"}`}>
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${annual ? "left-8" : "left-1"}`} />
                        </button>
                        <span className={`text-sm font-medium flex items-center gap-2 ${annual ? "text-white" : "text-white/40"}`}>
                            Annuel
                            <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">-30%</span>
                        </span>
                    </div>
                </div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 -mt-12 pb-24">
                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-6 mb-16">
                    {/* Free */}
                    <div className="bg-white dark:bg-zinc-900 border border-foreground/10 rounded-3xl p-8 shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-foreground/5 rounded-xl">
                                <Zap className="w-6 h-6 text-foreground/50" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Gratuit</h2>
                                <p className="text-sm text-foreground/50">Pour explorer WIGO</p>
                            </div>
                        </div>
                        <div className="mb-8">
                            <span className="text-5xl font-black text-foreground">0€</span>
                            <span className="text-foreground/50 ml-2">pour toujours</span>
                        </div>
                        <SignInButton mode="modal">
                            <button className="w-full border-2 border-foreground/20 hover:border-foreground/40 text-foreground font-bold py-4 rounded-2xl transition-all mb-6">
                                Commencer gratuitement
                            </button>
                        </SignInButton>
                        <ul className="space-y-3">
                            {FEATURES.map((f, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm">
                                    {f.free
                                        ? <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                        : <X className="w-4 h-4 text-foreground/20 flex-shrink-0" />}
                                    <span className={f.free ? "text-foreground" : "text-foreground/40 line-through"}>{f.label}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Pro */}
                    <div className="relative bg-gradient-to-br from-accent to-orange-600 rounded-3xl p-8 shadow-2xl shadow-accent/30 text-white overflow-hidden">
                        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white text-xs font-black px-3 py-1.5 rounded-full border border-white/30">
                            ⭐ POPULAIRE
                        </div>
                        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-white/10 rounded-full" />
                        <div className="absolute -top-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />

                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <Crown className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">WIGO Pro</h2>
                                <p className="text-sm text-white/70">Expérience complète</p>
                            </div>
                        </div>
                        <div className="mb-2 relative z-10">
                            <span className="text-5xl font-black">{annual ? annualPrice : monthlyPrice}€</span>
                            <span className="text-white/70 ml-2">/ mois</span>
                        </div>
                        {annual && <p className="text-sm text-white/70 mb-8 relative z-10">Facturé {(annualPrice * 12).toFixed(0)}€/an — Économisez {((monthlyPrice - annualPrice) * 12).toFixed(0)}€</p>}

                        <Link href="/api/stripe/checkout">
                            <button className="w-full bg-white text-accent font-black py-4 rounded-2xl transition-all hover:bg-white/90 hover:scale-105 shadow-xl mb-6 relative z-10 text-lg">
                                🚀 Essayer Pro 7 jours gratuits
                            </button>
                        </Link>

                        <ul className="space-y-3 relative z-10">
                            {FEATURES.map((f, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm">
                                    <Check className="w-4 h-4 text-white flex-shrink-0" />
                                    <span className="text-white">{f.label}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Feature Preview — Locked Features */}
                <div className="bg-foreground/5 border border-foreground/10 rounded-3xl p-8 mb-16">
                    <h3 className="text-2xl font-black text-foreground mb-2 text-center">Ce que vous débloquez avec Pro</h3>
                    <p className="text-foreground/50 text-center mb-10 text-sm">Ces fonctionnalités sont exclusives aux membres WIGO Pro</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: "🗺️", title: "Analyse IA complète", desc: "Pour chaque hôtel : randonnées à proximité, spots food locaux, conseils équipement exclusifs.", locked: true },
                            { icon: "⚖️", title: "Comparaison intelligente", desc: "Comparez jusqu'à 3 hôtels côte à côte : prix, ambiance, activités, avis — tout en un coup d'œil.", locked: true },
                            { icon: "🔔", title: "Alertes prix", desc: "Recevez une notification dès que le prix d'un hôtel sauvegardé baisse. Ne ratez plus aucune promo.", locked: true },
                        ].map(({ icon, title, desc, locked }) => (
                            <div key={title} className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-foreground/10 relative overflow-hidden">
                                {locked && (
                                    <div className="absolute top-3 right-3">
                                        <Lock className="w-4 h-4 text-accent" />
                                    </div>
                                )}
                                <div className="text-3xl mb-3">{icon}</div>
                                <h4 className="font-bold text-foreground mb-2">{title}</h4>
                                <p className="text-sm text-foreground/60">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Testimonials */}
                <div className="mb-16">
                    <h3 className="text-2xl font-black text-foreground text-center mb-8">Ils ont rejoint WIGO Pro</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map(t => (
                            <div key={t.name} className="bg-white dark:bg-zinc-900 border border-foreground/10 rounded-2xl p-6 shadow-sm">
                                <div className="flex gap-1 mb-3">
                                    {[1, 2, 3, 4, 5].map(s => <span key={s} className="text-yellow-400 text-sm">★</span>)}
                                </div>
                                <p className="text-foreground/80 text-sm italic mb-4">&quot;{t.text}&quot;</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-xs">{t.avatar}</div>
                                    <span className="font-semibold text-sm text-foreground">{t.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Final CTA */}
                <div className="text-center bg-gradient-to-br from-accent/10 to-forest/10 border border-accent/20 rounded-3xl p-12">
                    <h3 className="text-3xl font-black text-foreground mb-3">Prêt à voyager plus intelligemment ?</h3>
                    <p className="text-foreground/60 mb-8">7 jours gratuits. Aucune carte bancaire requise pour commencer.</p>
                    <Link href="/api/stripe/checkout">
                        <button className="bg-accent hover:bg-accent/90 text-white font-black py-4 px-10 rounded-2xl text-lg transition-all hover:scale-105 shadow-xl shadow-accent/30">
                            Démarrer mon essai gratuit →
                        </button>
                    </Link>
                    <p className="text-xs text-foreground/40 mt-4">Résiliation possible à tout moment • Sans engagement</p>
                </div>
            </div>
        </main>
    );
}
