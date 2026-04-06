"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import FlightResultCard, { FlightResult } from "@/components/FlightResultCard";
import SearchResultCard, { HotelResult } from "@/components/SearchResultCard";
import { Sparkles, MapPin, Plane, Hotel as HotelIcon, Compass } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ActivityResult } from "@/app/api/search-activities/route";

export default function PackagePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" /></div>}>
      <PackageContent />
    </Suspense>
  );
}

function PackageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    destination: string;
    intent: string;
    hotels: HotelResult[];
    flights: FlightResult[];
    activities: ActivityResult[];
  } | null>(null);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    fetch("/api/package", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    })
      .then(res => res.json())
      .then(res => {
        if (res.passport) setData(res.passport);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium">
            ← Nouvelle Magie
          </Link>
          <div className="bg-accent/10 border border-accent/20 text-accent px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm">
            <Sparkles className="w-4 h-4" /> Passeport WIGO
          </div>
        </div>

        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-center py-32"
          >
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-slate-200 rounded-full" />
              <div className="absolute inset-0 border-4 border-accent border-t-transparent rounded-full animate-spin" />
              <Compass className="absolute inset-0 m-auto w-10 h-10 text-accent animate-pulse" />
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900 mb-3">Création de votre Évasion...</h1>
            <p className="text-slate-500 text-lg max-w-lg mx-auto">
              Notre IA interroge simultanément des milliers de vols, d&apos;hôtels et d&apos;activités pour construire le package idéal pour <strong>« {query} »</strong>.
            </p>
          </motion.div>
        ) : data ? (
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
              <h1 className="text-4xl md:text-6xl font-display font-extrabold text-slate-900 mb-4 tracking-tight">
                Destination : <span className="text-accent">{data.destination}</span>
              </h1>
              <p className="text-slate-500 text-lg mb-12 max-w-2xl">
                Votre escapade sur mesure, générée par l&apos;IA d&apos;après votre envie : <em className="text-slate-700 font-medium">« {data.intent} »</em>.
              </p>
            </motion.div>

            {/* Flights Section */}
            <motion.section 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="mb-14"
            >
              <h2 className="text-2xl font-bold flex items-center gap-3 mb-6 text-slate-900">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 shadow-sm">
                  <Plane className="w-5 h-5 text-accent" />
                </div>
                Le Vol Suggéré
              </h2>
              {data.flights.length > 0 ? (
                <div className="grid gap-4">
                  <FlightResultCard flight={data.flights[0]} isSelected={true} />
                </div>
              ) : (
                <p className="text-slate-500 italic bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">Aucun vol trouvé depuis votre aéroport par défaut pour ces dates.</p>
              )}
            </motion.section>

            {/* Hotels Section */}
            <motion.section 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="mb-14"
            >
              <h2 className="text-2xl font-bold flex items-center gap-3 mb-6 text-slate-900">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-sm">
                  <HotelIcon className="w-5 h-5 text-emerald-600" />
                </div>
                Le Nid Parfait
              </h2>
              {data.hotels.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {data.hotels.map((h, i) => (
                    <motion.div key={h.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + (i * 0.1) }}>
                      <SearchResultCard hotel={h} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">Aucun hôtel trouvé selon vos critères.</p>
              )}
            </motion.section>
            
            {/* Activities Section */}
            <motion.section
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            >
              <h2 className="text-2xl font-bold flex items-center gap-3 mb-6 text-slate-900">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-sm">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                L&apos;Incontournable
              </h2>
              {data.activities.length > 0 ? (
                 <div className="grid md:grid-cols-3 gap-6">
                 {data.activities.map((act, i) => (
                   <motion.div 
                      key={act.id} 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      transition={{ delay: 0.4 + (i * 0.1) }}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      className="bg-white border border-slate-200 shadow-sm hover:shadow-xl rounded-2xl overflow-hidden cursor-pointer hover:border-purple-500/40 transition-all duration-300 group"
                   >
                      <div className="h-48 bg-slate-100 relative overflow-hidden">
                         {act.imageUrl ? (
                           // eslint-disable-next-line @next/next/no-img-element
                           <img src={act.imageUrl} alt={act.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <MapPin className="w-8 h-8 opacity-20" />
                           </div>
                         )}
                         <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-slate-900 border border-slate-200 shadow-sm">
                            {act.price}
                         </div>
                      </div>
                      <div className="p-5">
                         <h3 className="font-bold text-slate-900 text-lg mb-2 truncate group-hover:text-purple-600 transition-colors">{act.name}</h3>
                         <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">{act.description}</p>
                         <button className="text-sm bg-purple-100 hover:bg-purple-600 text-purple-700 hover:text-white font-bold py-2.5 px-4 rounded-xl w-full transition-colors shadow-sm">
                           Réserver l&apos;expérience
                         </button>
                      </div>
                   </motion.div>
                 ))}
               </div>
              ) : (
                <p className="text-slate-500 italic bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">Aucune activité trouvée dans cette zone.</p>
              )}
            </motion.section>

          </div>
        ) : (
          <div className="text-center py-20 text-slate-500 bg-white rounded-3xl border border-slate-200 shadow-sm">
            Aucun passeport n&apos;a pu être généré. Veuillez essayer une autre destination.
          </div>
        )}
      </div>
    </div>
  );
}
