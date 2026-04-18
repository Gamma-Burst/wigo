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
    <div className="min-h-screen bg-white pt-24 pb-32 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto">
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
            className="flex flex-col items-center justify-center py-48 text-center"
          >
            <div className="relative w-32 h-32 mb-12">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-[1px] border-slate-200 rounded-full" 
              />
              <motion.div 
                animate={{ rotate: -360 }} 
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 border-[1px] border-accent/30 rounded-full border-t-accent" 
              />
              <Compass className="absolute inset-0 m-auto w-12 h-12 text-accent" />
            </div>
            <h1 className="text-4xl font-display font-black text-slate-900 mb-4 tracking-tighter italic">Rédaction de votre Guide Personnel...</h1>
            <p className="text-slate-400 text-xl font-medium max-w-md mx-auto leading-relaxed">
              WIGO assemble les meilleures pépites locales pour <span className="text-slate-900">« {query} »</span>.
            </p>
          </motion.div>
        ) : data ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            {/* Sidebar : Destination Intelligence */}
            <aside className="lg:col-span-4 lg:sticky lg:top-32 space-y-12">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/5 border border-accent/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-accent">
                   <Sparkles className="w-3 h-3" /> WIGO Intelligence
                </div>
                <h1 className="text-5xl md:text-8xl font-display font-black text-slate-900 tracking-tighter leading-[0.85] italic">
                  {data.destination}
                </h1>
                <p className="text-slate-500 text-xl font-medium leading-relaxed border-l-2 border-accent/20 pl-6 py-2 italic font-serif">
                  &quot;{data.cityInsight?.description}&quot;
                </p>
                <div className="pt-4 flex flex-wrap gap-2">
                  {data.cityInsight?.highlights.map((h, i) => (
                    <span key={i} className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-4 py-2 rounded-full border border-slate-200">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main Content : The Experience */}
            <main className="lg:col-span-8 space-y-32">
              {/* Bento Grid Experience */}
              {data.cityInsight && (
                <section>
                  <div className="flex items-center justify-between mb-12">
                    <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Immersion Elite</h2>
                    <div className="h-px flex-1 bg-slate-100 ml-8" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[300px] gap-6">
                    {/* Restaurants (Large/Atypical Focus) */}
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="md:col-span-2 md:row-span-2 bg-slate-900 rounded-[3rem] p-10 text-white flex flex-col justify-between relative overflow-hidden group shadow-2xl shadow-slate-200"
                    >
                      <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <Utensils className="w-48 h-48" />
                      </div>
                      <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8">
                          <Utensils className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-3xl font-display font-black mb-6 uppercase italic tracking-tighter">Table d&apos;Exception</h3>
                        <div className="space-y-6">
                          {data.cityInsight.restaurants?.map((r, i) => (
                            <div key={i} className="group/item">
                              <p className="text-xl font-bold text-white group-hover/item:text-accent transition-colors">{r.name}</p>
                              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{r.specialty} • {r.vibe}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="relative z-10 text-xs font-black text-accent tracking-[0.3em] uppercase group-hover:translate-x-2 transition-transform">
                        Explorez la Gastronomie →
                      </div>
                    </motion.div>

                    {/* Atypical (Tall/Vertical) */}
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="md:col-span-2 md:row-span-1 bg-accent rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-accent/20"
                    >
                      <div className="absolute -bottom-4 -right-4 opacity-20 group-hover:scale-110 transition-transform">
                        <Camera className="w-32 h-32" />
                      </div>
                      <div className="relative z-10 flex flex-col h-full justify-between">
                         <div>
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4 text-white">
                              <Camera className="w-5 h-5" />
                            </div>
                            <h3 className="text-2xl font-display font-black uppercase italic tracking-tighter">Le Secret WIGO</h3>
                         </div>
                         <div className="space-y-4">
                            {data.cityInsight.atypical?.slice(0, 1).map((a, i) => (
                              <div key={i}>
                                <p className="text-lg font-bold">{a.name}</p>
                                <p className="text-xs font-medium text-white/80 line-clamp-2">{a.description}</p>
                              </div>
                            ))}
                         </div>
                      </div>
                    </motion.div>

                    {/* Culture (Square) */}
                    <motion.div 
                       whileHover={{ y: -5 }}
                       className="md:col-span-1 md:row-span-1 bg-white border border-slate-100 rounded-[3rem] p-8 shadow-xl shadow-slate-200/50 flex flex-col justify-between group"
                    >
                       <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                          <Landmark className="w-6 h-6" />
                       </div>
                       <div>
                          <h3 className="text-lg font-black uppercase tracking-tighter mb-4 italic">Arts & Culture</h3>
                          <div className="space-y-2">
                             {data.cityInsight.culture?.slice(0, 2).map((c, i) => (
                                <p key={i} className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">{c.name}</p>
                             ))}
                          </div>
                       </div>
                    </motion.div>

                    {/* Nature (Square) */}
                    <motion.div 
                       whileHover={{ y: -5 }}
                       className="md:col-span-1 md:row-span-1 bg-emerald-50 content-highlight border border-emerald-100 rounded-[3rem] p-8 flex flex-col justify-between group"
                    >
                       <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                          <Palmtree className="w-6 h-6" />
                       </div>
                       <div>
                          <h3 className="text-lg font-black uppercase tracking-tighter mb-4 italic text-emerald-900">Espaces Verts</h3>
                          <div className="space-y-2 text-emerald-800">
                             {data.cityInsight.nature?.slice(0, 2).map((n, i) => (
                                <p key={i} className="text-xs font-bold border-b border-emerald-200 pb-2">{n.name}</p>
                             ))}
                          </div>
                       </div>
                    </motion.div>
                  </div>
                </section>
              )}

              {/* The Travel Package (Flight + Hotels) */}
              <section className="space-y-24">
                 {/* Suggested Flight */}
                 <div className="relative">
                    <div className="flex items-center gap-6 mb-12">
                       <Plane className="w-12 h-12 text-slate-200" />
                       <h2 className="text-4xl font-display font-black text-slate-900 tracking-tighter italic">Ligne de Vol <span className="text-accent underline decoration-4 decoration-accent/20">Directe</span></h2>
                    </div>
                    {data.flights.length > 0 ? (
                      <FlightResultCard flight={data.flights[0]} isSelected={true} />
                    ) : (
                      <div className="p-12 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">
                        Connexion Sol uniquement
                      </div>
                    )}
                 </div>

                 {/* Top Hotels */}
                 <div>
                    <div className="flex items-center justify-between mb-12">
                       <div className="flex items-center gap-6">
                          <HotelIcon className="w-12 h-12 text-slate-200" />
                          <h2 className="text-4xl font-display font-black text-slate-900 tracking-tighter italic">Demures d&apos;Exception</h2>
                       </div>
                       <div className="text-xs font-black uppercase tracking-widest text-accent border border-accent/20 px-6 py-3 rounded-full">
                          {data.hotels.length} Pépites Trouvées
                       </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      {data.hotels.slice(0, 8).map((h, i) => (
                        <motion.div 
                          key={h.id} 
                          initial={{ opacity: 0, y: 30 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          transition={{ delay: 0.1 * i }}
                        >
                          <SearchResultCard 
                            hotel={h} 
                            isActive={selectedHotel?.id === h.id} 
                            onSelect={() => {}} 
                            onBook={() => setSelectedHotel(h)} 
                          />
                        </motion.div>
                      ))}
                    </div>
                 </div>
              </section>

              {/* Activities Section */}
              <section>
                 <div className="flex items-center gap-6 mb-12">
                    <MapPin className="w-12 h-12 text-slate-200" />
                    <h2 className="text-4xl font-display font-black text-slate-900 tracking-tighter italic">Expériences <span className="text-purple-500">Signature</span></h2>
                 </div>
                 
                 {data.activities.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {data.activities.slice(0, 6).map((act, i) => (
                      <motion.div 
                         key={act.id} 
                         initial={{ opacity: 0, scale: 0.95 }} 
                         animate={{ opacity: 1, scale: 1 }} 
                         transition={{ delay: i * 0.1 }}
                         whileHover={{ y: -8, transition: { duration: 0.4, ease: "circOut" } }}
                         className="bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden cursor-pointer group flex flex-col h-full"
                      >
                         <div className="h-64 bg-slate-100 relative overflow-hidden">
                            {act.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={act.imageUrl} alt={act.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                 <MapPin className="w-12 h-12" />
                              </div>
                            )}
                            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-5 py-2 rounded-2xl text-xs font-black text-slate-900 shadow-xl border border-white/20">
                               {act.price}
                            </div>
                         </div>
                         <div className="p-8 flex flex-col flex-1 justify-between">
                            <div>
                               <h3 className="font-display font-black text-slate-900 text-2xl mb-3 leading-tight uppercase italic tracking-tighter group-hover:text-accent transition-colors">{act.name}</h3>
                               <p className="text-sm text-slate-500 line-clamp-3 mb-8 leading-relaxed font-medium">{act.description}</p>
                            </div>
                            <button className="text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white py-4 rounded-2xl w-full transition-all hover:bg-accent hover:shadow-xl active:scale-95 shadow-md">
                              Réserver l&apos;Expérience
                            </button>
                         </div>
                      </motion.div>
                    ))}
                  </div>
                 ) : (
                   <div className="p-20 bg-slate-50 rounded-[3rem] border border-slate-100 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">
                     Horizon en cours d&apos;exploration
                   </div>
                 )}
              </section>
            </main>
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
