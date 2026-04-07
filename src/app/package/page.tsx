"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import FlightResultCard, { FlightResult } from "@/components/FlightResultCard";
import SearchResultCard, { HotelResult } from "@/components/SearchResultCard";
import { Sparkles, MapPin, Plane, Hotel as HotelIcon, Compass, Utensils, Camera, Landmark, Palmtree } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ActivityResult } from "@/app/api/search-activities/route";
import HotelModal from "@/components/HotelModal";
import type { EnhancedHotelResult } from "@/services/hotel-provider";

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
  const [selectedHotel, setSelectedHotel] = useState<EnhancedHotelResult | null>(null);
  const [data, setData] = useState<{
    destination: string;
    intent: string;
    hotels: HotelResult[];
    flights: FlightResult[];
    activities: ActivityResult[];
    cityInsight?: {
      description: string;
      highlights: string[];
      restaurants?: { name: string; specialty: string; vibe: string }[];
      atypical?: { name: string; description: string }[];
      culture?: { name: string; type: string }[];
      nature?: { name: string; vibe: string }[];
    };
  } | null>(null);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    fetch(`/api/package?v=${Date.now()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: 'no-store',
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
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
                <div className="flex-1">
                  <h1 className="text-4xl md:text-7xl font-display font-extrabold text-slate-900 mb-6 tracking-tight leading-none">
                    Destination : <span className="text-accent uppercase italic">{data.destination}</span>
                  </h1>
                  <p className="text-slate-500 text-xl font-medium max-w-2xl leading-relaxed">
                    Votre escapade sur mesure pour <em className="text-slate-800 not-italic border-b-2 border-accent/30 tracking-tight">« {data.intent} »</em>.
                  </p>
                </div>

                {data.cityInsight && (
                  <div className="space-y-16 mt-12 bg-slate-50/50 p-8 md:p-16 rounded-[4rem] border border-slate-200/50">
                    {/* Header Experience */}
                    <div className="flex flex-col md:flex-row gap-12 items-start">
                      <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-3 text-accent font-black uppercase tracking-[0.3em] text-xs">
                          <Compass className="w-5 h-5" /> EXPÉRIENCE ÉLITE
                        </div>
                        <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900 tracking-tight leading-tight">
                          Le Guide Immersion <span className="text-accent italic">WIGO</span>
                        </h2>
                        <p className="text-slate-600 text-xl leading-relaxed font-medium">
                          &quot;{data.cityInsight.description}&quot;
                        </p>
                      </div>
                      
                      <div className="flex-1 grid grid-cols-1 gap-4">
                        {data.cityInsight.highlights.map((h, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                              <Sparkles className="w-5 h-5" />
                            </div>
                            <span className="text-slate-800 font-bold text-lg">{h}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Grid Categories */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      {/* Restaurants */}
                      {data.cityInsight.restaurants?.length ? (
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:translate-y-[-4px] transition-transform">
                          <Utensils className="w-8 h-8 text-orange-500 mb-6" />
                          <h3 className="text-xl font-black mb-4">Gastronomie</h3>
                          <div className="space-y-4">
                            {data.cityInsight.restaurants.map((r, i) => (
                              <div key={i} className="border-l-2 border-orange-100 pl-4 py-1">
                                <p className="font-bold text-slate-900">{r.name}</p>
                                <p className="text-xs text-slate-500 uppercase font-black tracking-widest">{r.specialty} • {r.vibe}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {/* Atypical */}
                      {data.cityInsight.atypical?.length ? (
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:translate-y-[-4px] transition-transform">
                          <Camera className="w-8 h-8 text-indigo-500 mb-6" />
                          <h3 className="text-xl font-black mb-4">Lieux Insolites</h3>
                          <div className="space-y-4">
                            {data.cityInsight.atypical.map((a, i) => (
                              <div key={i} className="border-l-2 border-indigo-100 pl-4 py-1">
                                <p className="font-bold text-slate-900">{a.name}</p>
                                <p className="text-xs text-slate-500 font-medium leading-tight">{a.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {/* Culture */}
                      {data.cityInsight.culture?.length ? (
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:translate-y-[-4px] transition-transform">
                          <Landmark className="w-8 h-8 text-blue-500 mb-6" />
                          <h3 className="text-xl font-black mb-4">Culture</h3>
                          <div className="space-y-4">
                            {data.cityInsight.culture.map((c, i) => (
                              <div key={i} className="border-l-2 border-blue-100 pl-4 py-1">
                                <p className="font-bold text-slate-900">{c.name}</p>
                                <p className="text-xs text-slate-500 uppercase font-bold">{c.type}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {/* Nature */}
                      {data.cityInsight.nature?.length ? (
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:translate-y-[-4px] transition-transform">
                          <Palmtree className="w-8 h-8 text-emerald-500 mb-6" />
                          <h3 className="text-xl font-black mb-4">Parcs</h3>
                          <div className="space-y-4">
                            {data.cityInsight.nature.map((n, i) => (
                              <div key={i} className="border-l-2 border-emerald-100 pl-4 py-1">
                                <p className="font-bold text-slate-900">{n.name}</p>
                                <p className="text-xs text-slate-500 font-medium italic">{n.vibe}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
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
                      <SearchResultCard 
                        hotel={h} 
                        isActive={selectedHotel?.id === h.id} 
                        onSelect={() => {}} 
                        onBook={() => setSelectedHotel(h)} 
                      />
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
      <HotelModal 
        isOpen={!!selectedHotel} 
        hotel={selectedHotel} 
        onClose={() => setSelectedHotel(null)} 
      />
    </div>
  );
}
