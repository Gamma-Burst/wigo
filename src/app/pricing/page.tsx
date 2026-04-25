"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, Zap, Crown, Lock } from "lucide-react";

const FEATURES = [
  { label: "Recherche IA en langage naturel", free: true, pro: true },
  { label: "Voir jusqu'a 2 resultats", free: true, pro: false },
  { label: "Resultats illimites", free: false, pro: true },
  { label: "Sauvegarder des favoris", free: false, pro: true },
  { label: "Analyse IA hotel et quartier", free: false, pro: true },
  { label: "Comparaison cote a cote", free: false, pro: true },
  { label: "Alertes prix", free: false, pro: true },
  { label: "Historique personnalise", free: false, pro: true },
  { label: "Export PDF de sejour", free: false, pro: true },
  { label: "Support prioritaire", free: false, pro: true },
];

const TESTIMONIALS = [
  { name: "Marie L.", text: "WIGO m'a trouve un hotel incroyable a Bruges en 3 secondes. Jamais vu ca.", avatar: "ML" },
  { name: "Thomas B.", text: "L'analyse IA par hotel vaut a elle seule l'abonnement. Je ne voyage plus sans WIGO.", avatar: "TB" },
  { name: "Sarah K.", text: "Enfin un moteur de voyage qui comprend vraiment ce qu'on veut. Bluffant.", avatar: "SK" },
];

const PRO_BENEFITS = [
  {
    icon: "MAP",
    title: "Analyse IA complete",
    desc: "Chaque option est recontextualisee avec le quartier, les activites proches, la vibe du lieu et les compromis reels.",
  },
  {
    icon: "FIT",
    title: "Comparaison intelligente",
    desc: "Tu compares les options qui comptent vraiment: prix, ambiance, temps perdu, confort et coherence avec ton voyage.",
  },
  {
    icon: "ALERT",
    title: "Alertes prix utiles",
    desc: "Tu suis les bonnes opportunites au lieu de rechecker les memes offres encore et encore.",
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);
  const monthlyPrice = 9.99;
  const annualPrice = 6.99;
  const checkoutHref = `/api/stripe/checkout?billing=${annual ? "annual" : "monthly"}`;

  return (
    <main className="min-h-screen bg-background">
      <div className="warm-section relative overflow-hidden pb-24 pt-32 text-center">
        <div className="absolute left-1/2 top-0 h-[380px] w-[760px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-accent/15 blur-[120px]" />
        <div className="absolute right-[10%] top-[18%] h-[240px] w-[240px] rounded-full bg-forest/10 blur-[100px]" />
        <Link href="/" className="absolute left-6 top-6 text-sm font-medium text-foreground/60 transition hover:text-foreground">
          ← Retour
        </Link>

        <div className="relative z-10 mx-auto max-w-4xl px-6">
          <div className="eyebrow mb-6">
            <Crown className="h-4 w-4" /> Passez a la vitesse superieure
          </div>
          <h1 className="mb-5 font-display text-5xl font-bold leading-[1.04] text-foreground md:text-6xl lg:text-[72px]">
            L&apos;experience voyage
            <br />
            <span className="text-accent">qui pense comme toi.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-foreground-soft">
            WIGO Pro debloque la couche premium de l&apos;assistant: plus d&apos;analyse, plus de contexte, plus de comparaison,
            et une experience de recherche vraiment continue.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!annual ? "text-foreground" : "text-foreground/40"}`}>Mensuel</span>
            <button
              onClick={() => setAnnual((a) => !a)}
              className={`relative h-7 w-14 rounded-full transition-all duration-300 ${annual ? "bg-accent" : "bg-foreground/15"}`}
            >
              <div className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all duration-300 ${annual ? "left-8" : "left-1"}`} />
            </button>
            <span className={`flex items-center gap-2 text-sm font-medium ${annual ? "text-foreground" : "text-foreground/40"}`}>
              Annuel
              <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">-30%</span>
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-12 max-w-6xl px-6 pb-24">
        <div className="mb-16 grid gap-6 md:grid-cols-2">
          <div className="premium-surface rounded-[30px] p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-foreground/5 p-3">
                <Zap className="h-6 w-6 text-foreground/50" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Gratuit</h2>
                <p className="text-sm text-foreground/50">Pour explorer WIGO</p>
              </div>
            </div>
            <div className="mb-8">
              <span className="text-5xl font-black text-foreground">0€</span>
              <span className="ml-2 text-foreground/50">pour toujours</span>
            </div>
            <Link href="/signup">
              <button className="mb-6 w-full rounded-2xl border-2 border-foreground/20 py-4 font-bold text-foreground transition-all hover:border-foreground/40">
                Commencer gratuitement
              </button>
            </Link>
            <ul className="space-y-3">
              {FEATURES.map((feature) => (
                <li key={feature.label} className="flex items-center gap-3 text-sm">
                  {feature.free ? (
                    <Check className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                  ) : (
                    <X className="h-4 w-4 flex-shrink-0 text-foreground/20" />
                  )}
                  <span className={feature.free ? "text-foreground" : "text-foreground/40 line-through"}>{feature.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-[30px] border border-accent/30 bg-[linear-gradient(145deg,rgba(232,101,42,0.94),rgba(176,83,24,0.98))] p-8 text-white shadow-2xl shadow-accent/20">
            <div className="accent-divider absolute inset-x-0 top-0 h-px opacity-80" />
            <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-white/10" />
            <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
            <div className="absolute right-4 top-4 rounded-full border border-white/30 bg-white/20 px-3 py-1.5 text-xs font-black">
              PLUS CHOISI
            </div>

            <div className="relative z-10 mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-white/20 p-3">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">WIGO Pro</h2>
                <p className="text-sm text-white/70">Experience complete</p>
              </div>
            </div>

            <div className="relative z-10 mb-2">
              <span className="text-5xl font-black">{annual ? annualPrice : monthlyPrice}€</span>
              <span className="ml-2 text-white/70">{annual ? "/ mois equiv." : "/ mois"}</span>
            </div>
            {annual && (
              <p className="relative z-10 mb-8 text-sm text-white/70">
                Facture {(annualPrice * 12).toFixed(0)}€/an · economie de {((monthlyPrice - annualPrice) * 12).toFixed(0)}€
              </p>
            )}

            <Link href={checkoutHref}>
              <button className="relative z-10 mb-6 w-full rounded-2xl bg-white py-4 text-lg font-black text-accent shadow-xl transition-all hover:scale-105 hover:bg-white/90">
                Essayer WIGO Pro 7 jours
              </button>
            </Link>

            <ul className="relative z-10 space-y-3">
              {FEATURES.map((feature) => (
                <li key={feature.label} className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4 flex-shrink-0 text-white" />
                  <span className="text-white">{feature.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="premium-surface mb-16 rounded-[30px] p-8">
          <h3 className="mb-2 text-center font-display text-3xl font-bold text-foreground">Ce que WIGO Pro ajoute vraiment</h3>
          <p className="mb-10 text-center text-sm text-foreground/50">
            Des gains tangibles sur la qualite de decision, pas juste une liste de cases cochees.
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {PRO_BENEFITS.map((item) => (
              <div key={item.title} className="relative overflow-hidden rounded-[24px] border border-[var(--border)] bg-card p-6">
                <div className="absolute right-3 top-3">
                  <Lock className="h-4 w-4 text-accent" />
                </div>
                <div className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-accent/70">{item.icon}</div>
                <h4 className="mb-2 font-bold text-foreground">{item.title}</h4>
                <p className="text-sm text-foreground/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h3 className="mb-8 text-center font-display text-3xl font-bold text-foreground">Ils ont rejoint WIGO Pro</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((testimonial) => (
              <div key={testimonial.name} className="premium-surface rounded-[24px] p-6">
                <div className="mb-3 flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-sm text-yellow-400">★</span>
                  ))}
                </div>
                <p className="mb-4 text-sm italic text-foreground/80">&quot;{testimonial.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                    {testimonial.avatar}
                  </div>
                  <span className="text-sm font-semibold text-foreground">{testimonial.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="premium-surface relative overflow-hidden rounded-[32px] p-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(232,101,42,0.1),transparent_42%)]" />
          <h3 className="relative z-10 mb-3 font-display text-4xl font-bold text-foreground">Pret a voyager plus intelligemment ?</h3>
          <p className="relative z-10 mb-8 text-foreground/60">
            7 jours d&apos;essai inclus, puis abonnement {annual ? "annuel" : "mensuel"} avec annulation possible avant
            l&apos;echeance.
          </p>
          <Link href={checkoutHref}>
            <button className="relative z-10 rounded-2xl bg-accent px-10 py-4 text-lg font-black text-white shadow-xl shadow-accent/30 transition-all hover:scale-105 hover:bg-accent/90">
              Activer mon essai Pro →
            </button>
          </Link>
          <p className="relative z-10 mt-4 text-xs text-foreground/40">
            Paiement securise via Stripe • Resiliation possible a tout moment
          </p>
        </div>
      </div>
    </main>
  );
}
