import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { EnhancedHotelResult } from '@/services/hotel-provider';
import { 
  X, MapPin, CheckCircle, ExternalLink, Info, 
  Wifi, Coffee, Utensils, CigaretteOff, Car, Dumbbell, Shield, 
  ChevronLeft, ChevronRight, TrendingUp,
  Award, Heart, AlertCircle
} from 'lucide-react';

interface HotelModalProps {
  hotel: EnhancedHotelResult | null;
  isOpen: boolean;
  onClose: () => void;
}

const getAmenityIcon = (amenity: string) => {
  const a = amenity.toLowerCase();
  if (a.includes('wifi')) return <Wifi className="w-4 h-4" />;
  if (a.includes('breakfast')) return <Coffee className="w-4 h-4" />;
  if (a.includes('restau')) return <Utensils className="w-4 h-4" />;
  if (a.includes('gym') || a.includes('fitness')) return <Dumbbell className="w-4 h-4" />;
  if (a.includes('parking')) return <Car className="w-4 h-4" />;
  if (a.includes('smoking')) return <CigaretteOff className="w-4 h-4" />;
  return <CheckCircle className="w-4 h-4" />;
};

export default function HotelModal({ hotel, isOpen, onClose }: HotelModalProps) {
  const [currentImg, setCurrentImg] = useState(0);
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCurrentImg(0);
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!hotel) return null;

  const calculateNights = (start?: string, end?: string): number => {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const nights = calculateNights(hotel.checkIn, hotel.checkOut);
  const totalPrice = hotel.priceNum ? hotel.priceNum * nights : 0;
  const images = hotel.images && hotel.images.length > 0 ? hotel.images : [hotel.imageUrl];

  const handleBookingRedirect = () => {
    const searchQuery = encodeURIComponent(`${hotel.name}, ${hotel.city || ''}`);
    const aid = process.env.NEXT_PUBLIC_BOOKING_AFFILIATE_ID;
    let url = `https://www.booking.com/searchresults.fr.html?ss=${searchQuery}`;
    if (aid) url += `&aid=${aid}`;
    if (hotel.checkIn && hotel.checkOut) url += `&checkin=${hotel.checkIn}&checkout=${hotel.checkOut}`;
    if (hotel.guests) url += `&group_adults=${hotel.guests}&no_rooms=1`;
    window.open(url, '_blank');
  };

  const nextImg = () => setCurrentImg((prev) => (prev + 1) % images.length);
  const prevImg = () => setCurrentImg((prev) => (prev - 1 + images.length) % images.length);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 overflow-hidden">
          {/* Deep Overlay Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-[20px]"
          />
          
          {/* Main Elite Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] w-full max-w-7xl h-full max-h-[94vh] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] relative flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button UI */}
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 z-[110] bg-white/5 hover:bg-white/10 backdrop-blur-3xl p-4 rounded-full text-white/50 hover:text-white transition-all border border-white/5 shadow-2xl"
            >
              <X className="w-6 h-6" />
            </button>

            {/* GALLERY PANEL (LEFT) */}
            <div className="w-full md:w-[45%] relative h-[40vh] md:h-full bg-black group">
               <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentImg}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0"
                  >
                    <Image src={images[currentImg]} alt={hotel.name} fill className="object-cover" priority />
                  </motion.div>
               </AnimatePresence>

               {/* Carousel Controls */}
               <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity z-30">
                  <button onClick={prevImg} className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-accent transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button onClick={nextImg} className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-accent transition-colors">
                    <ChevronRight className="w-6 h-6" />
                  </button>
               </div>

               {/* Gallery Progress */}
               <div className="absolute bottom-10 left-10 right-10 z-40 flex items-end justify-between">
                  <div className="flex gap-2 bg-black/60 backdrop-blur-xl p-2 rounded-2xl border border-white/10">
                    {images.map((_, i) => (
                      <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImg ? 'w-8 bg-accent' : 'w-2 bg-white/20'}`} />
                    ))}
                  </div>
                  <div className="bg-emerald-500/90 backdrop-blur-xl px-4 py-2 rounded-xl text-white text-[10px] font-black uppercase tracking-widest animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                    Direct Deal
                  </div>
               </div>

               <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
            </div>

            {/* INFORMATION PANEL (RIGHT) */}
            <div className="flex-1 flex flex-col h-full bg-[#0a0a0a] border-l border-white/5">
               <div className="flex-1 overflow-y-auto p-8 sm:p-16 space-y-12">
                  
                  {/* Header Title & Badges */}
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-3">
                       <span className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-white/40 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                         <TrendingUp className="w-3.5 h-3.5 text-accent" /> Réservé 5 fois aujourd&apos;hui
                       </span>
                       <span className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-white/40 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                         <Award className="w-3.5 h-3.5 text-yellow-500" /> WIGO Selection Elite
                       </span>
                    </div>

                    <div>
                      <h2 className="text-5xl sm:text-7xl font-black text-white leading-none tracking-tighter mb-4 italic uppercase italic">
                        {hotel.name}
                      </h2>
                      <div className="flex items-center gap-4 text-xl text-white/30 font-display">
                        <MapPin className="text-accent" /> {hotel.city} — Idéalement situé
                      </div>
                    </div>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                     {[
                       { title: "Statut", value: "Disponible", icon: <Shield />, trend: "99%", color: "text-emerald-400" },
                       { title: "Matching", value: "Parfait", icon: <Heart />, trend: "+24%", color: "text-rose-400" },
                       { title: "Service", value: "Standard Or", icon: <Award />, trend: "PRO", color: "text-blue-400" }
                     ].map((item, i) => (
                       <div key={i} className="bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 p-6 rounded-[2rem] relative overflow-hidden group">
                          <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform ${item.color}`}>
                             {React.cloneElement(item.icon, { className: "w-12 h-12" })}
                          </div>
                          <div className="relative z-10">
                            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-2">{item.title}</div>
                            <div className="text-xl font-black text-white mb-1">{item.value}</div>
                            <div className={`text-[10px] font-black ${item.color}`}>{item.trend} Trust Score</div>
                          </div>
                       </div>
                     ))}
                  </div>

                  {/* Why Section */}
                  <div className="grid lg:grid-cols-2 gap-12 pt-8">
                     <div className="space-y-6">
                        <h3 className="text-2xl font-black text-white flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                             <Info className="w-6 h-6" />
                          </div>
                          L&apos;Expérience WIGO
                        </h3>
                        <p className="text-white/40 text-lg leading-relaxed font-bold">
                          Sélectionné par WIGO pour son architecture unique à <span className="text-white">{hotel.city}</span>. Cet établissement offre un cadre exceptionnel {nights > 1 ? `pour vos ${nights} nuits.` : "pour votre séjour."} Tout est pensé pour un voyageur qui refuse tout compromis entre luxe et authenticité.
                        </p>
                        
                        <div className="flex flex-wrap gap-3">
                           {hotel.allAmenities?.slice(0, 10).map((tag, i) => (
                             <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/5 px-4 py-2.5 rounded-2xl text-[11px] font-bold text-white/50 hover:bg-white/10 hover:text-white transition-all cursor-default">
                                {getAmenityIcon(tag)}
                                {tag.toLowerCase().replace(/_/g, ' ')}
                             </div>
                           ))}
                        </div>
                     </div>

                     <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 flex flex-col justify-between">
                        <div className="space-y-8">
                          <div className="flex items-center gap-4">
                             <MapPin className="w-6 h-6 text-accent" />
                             <div className="text-sm font-black text-white uppercase tracking-widest">Localisation Elite</div>
                          </div>
                          <div className="text-white/60 text-sm leading-relaxed">
                            Proche des meilleurs restaurants et des points d&apos;intérêt culturels. <br/>
                            <div className="mt-4 flex gap-4">
                              <div className="bg-neutral-800 p-3 rounded-xl border border-white/5">
                                <div className="text-[10px] text-white/20 uppercase font-black">LAT</div>
                                <div className="text-xs font-black text-white">{hotel.lat.toFixed(4)}</div>
                              </div>
                              <div className="bg-neutral-800 p-3 rounded-xl border border-white/5">
                                <div className="text-[10px] text-white/20 uppercase font-black">LNG</div>
                                <div className="text-xs font-black text-white">{hotel.lng.toFixed(4)}</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-4">
                           <div className="w-12 h-12 rounded-full border-2 border-accent p-1">
                              <Image src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80" alt="Specialist" width={40} height={40} className="rounded-full object-cover" />
                           </div>
                           <div>
                              <div className="text-xs font-black text-white">Sophie L.</div>
                              <div className="text-[10px] text-white/30 uppercase font-bold tracking-widest italic">&quot;Mon coup de ❤️ à {hotel.city}&quot;</div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* TRANSACTION FOOTER (STICKY) */}
               <div className="px-10 py-10 sm:px-16 sm:py-14 bg-gradient-to-t from-black to-black/95 border-t border-white/5">
                  <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                     <div className="space-y-4">
                        <div className="flex items-baseline gap-4">
                           <div className="text-accent text-7xl font-black tracking-tighter mb-2">{totalPrice} €</div>
                           <div className="text-white/20 text-2xl font-black uppercase tracking-widest line-through decoration-accent/40 decoration-4">{Math.round(totalPrice * 1.15)}€</div>
                        </div>
                        <div className="bg-neutral-800/80 border border-white/5 p-4 rounded-2xl inline-flex items-center gap-4">
                           <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] px-2 border-r border-white/10">Détail du Pass</div>
                           <div className="text-sm font-black text-white">{hotel.priceNum}€ <span className="text-white/30 font-bold">/ nuit</span> × {nights} nuits</div>
                        </div>
                     </div>

                     <div className="flex-1 max-w-md w-full space-y-6">
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleBookingRedirect}
                          className="w-full bg-[#E8652A] hover:bg-[#ff6c2b] text-white p-8 rounded-[2rem] font-black text-2xl flex items-center justify-center gap-5 shadow-[0_30px_60px_rgba(232,101,42,0.5)] transition-all relative group overflow-hidden"
                        >
                           <span className="relative z-10">Confirmer mon séjour</span>
                           <ExternalLink className="w-8 h-8 relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                           <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        </motion.button>

                        <div className="flex items-center justify-center gap-6 text-white/20">
                           <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
                              <AlertCircle className="w-3 h-3" /> Transparence Affiliation
                           </div>
                           <div className="text-[9px] font-bold opacity-40">
                              WIGO — Comparateur Indépendant Partenaire Booking.com
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
