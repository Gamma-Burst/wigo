import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { EnhancedHotelResult } from '@/services/hotel-provider';
import { 
  X, Star, MapPin, CheckCircle, ExternalLink, Calendar, Users, Info, 
  Wifi, Coffee, Utensils, Cigarette, CigaretteOff, Car, Dumbbell, Shield, 
  Clock, CreditCard, Languages 
} from 'lucide-react';

interface HotelModalProps {
  hotel: EnhancedHotelResult | null;
  isOpen: boolean;
  onClose: () => void;
}

const getAmenityIcon = (amenity: string) => {
  const a = amenity.toLowerCase();
  if (a.includes('wifi') || a.includes('internet')) return <Wifi className="w-4 h-4" />;
  if (a.includes('breakfast') || a.includes('coffee')) return <Coffee className="w-4 h-4" />;
  if (a.includes('restaurant') || a.includes('dinner')) return <Utensils className="w-4 h-4" />;
  if (a.includes('gym') || a.includes('fitness')) return <Dumbbell className="w-4 h-4" />;
  if (a.includes('parking')) return <Car className="w-4 h-4" />;
  if (a.includes('smoke') && !a.includes('non')) return <Cigarette className="w-4 h-4" />;
  if (a.includes('non-smoking')) return <CigaretteOff className="w-4 h-4" />;
  if (a.includes('safe') || a.includes('shield')) return <Shield className="w-4 h-4" />;
  return <CheckCircle className="w-4 h-4" />;
};

export default function HotelModal({ hotel, isOpen, onClose }: HotelModalProps) {
  
  // Disable background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
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

  const handleBookingRedirect = () => {
    const searchQuery = encodeURIComponent(`${hotel.name}, ${hotel.city || ''}`);
    const affiliateId = process.env.NEXT_PUBLIC_BOOKING_AFFILIATE_ID;
    let bookingComUrl = `https://www.booking.com/searchresults.fr.html?ss=${searchQuery}`;
    
    if (affiliateId) {
        bookingComUrl += `&aid=${affiliateId}`;
    }
    if (hotel.checkIn && hotel.checkOut) {
        bookingComUrl += `&checkin=${hotel.checkIn}&checkout=${hotel.checkOut}`;
    }
    if (hotel.guests) {
        bookingComUrl += `&group_adults=${hotel.guests}&no_rooms=1`;
    }
    
    window.open(bookingComUrl, '_blank');
  };

  const displayAmenities = hotel.allAmenities && hotel.allAmenities.length > 0 
    ? hotel.allAmenities.slice(0, 12) 
    : hotel.tags;

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-2 sm:p-6"
          >
            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0f0f0e] border border-white/10 rounded-[2.5rem] w-full max-w-6xl h-full max-h-[92vh] overflow-hidden shadow-2xl relative flex flex-col"
            >
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 z-50 bg-black/40 hover:bg-black/60 backdrop-blur-xl p-3 rounded-full text-white transition-all shadow-xl border border-white/10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col md:flex-row h-full overflow-hidden">
                {/* Visual Section (Left) */}
                <div className="w-full md:w-2/5 relative h-1/3 md:h-full shrink-0">
                  <Image 
                    src={hotel.imageUrl} 
                    alt={hotel.name}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0e] via-transparent to-transparent" />
                  
                  <div className="absolute bottom-10 left-10 right-10 z-20">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="bg-accent px-4 py-2 rounded-2xl text-white text-[10px] font-black tracking-[0.2em] uppercase shadow-lg border border-white/10">
                        Top WIGO Choice
                      </div>
                      <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl text-white text-[10px] font-black tracking-[0.2em] uppercase border border-white/10">
                        {hotel.vibeScore}% Match
                      </div>
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-black font-display text-white mb-2 leading-[1.1] tracking-tight">
                      {hotel.name}
                    </h2>
                    <div className="flex items-center gap-2 text-white/60 font-bold mb-4">
                      <MapPin className="w-5 h-5 text-accent" />
                      <span className="text-lg">{hotel.city}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < (hotel.hotelRating || 3) ? 'text-yellow-400 fill-current' : 'text-white/20'}`} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Info Section (Right) */}
                <div className="w-full md:w-3/5 p-8 sm:p-14 overflow-y-auto space-y-12 bg-gradient-to-br from-[#0f0f0e] to-neutral-900/40">
                  
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                     {[
                       { icon: <Calendar />, label: "Séjour", value: `${nights} nuits`, color: "accent" },
                       { icon: <Users />, label: "Voyageurs", value: `${hotel.guests || 2} pers.`, color: "accent" },
                       { icon: <Shield />, label: "Sécurité", value: "Garanti", color: "emerald-400" },
                       { icon: <Languages />, label: "Service", value: "24/7", color: "blue-400" }
                     ].map((item, i) => (
                       <div key={i} className="bg-white/[0.04] border border-white/10 p-5 rounded-3xl group hover:bg-white/[0.06] transition-colors">
                          <div className={`text-${item.color} mb-3 group-hover:scale-110 transition-transform`}>
                            {React.cloneElement(item.icon as React.ReactElement, { className: "w-6 h-6" })}
                          </div>
                          <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">{item.label}</div>
                          <div className="text-sm font-black text-white">{item.value}</div>
                       </div>
                     ))}
                  </div>

                  <div className="grid lg:grid-cols-5 gap-12">
                    <div className="lg:col-span-3 space-y-8">
                      {/* Description Section */}
                      <div>
                        <h3 className="text-2xl font-black text-white mb-5 flex items-center gap-3">
                          <Info className="w-7 h-7 text-accent" /> À savoir
                        </h3>
                        <p className="text-white/60 leading-relaxed text-lg font-medium">
                          Idéalement situé au cœur de <span className="text-white font-bold">{hotel.city}</span>, cet établissement {hotel.hotelRating} étoiles est la référence pour un séjour alliant confort et élégance. {displayAmenities.length > 0 ? `Il propose des services de premier ordre comme ${displayAmenities.slice(0, 2).join(' et ')} pour vous garantir une expérience inoubliable.` : ""} 
                        </p>
                      </div>

                      {/* Amenities Grid */}
                      <div>
                        <h3 className="text-xl font-bold mb-6 text-white uppercase tracking-[0.15em] text-xs opacity-50 flex items-center gap-2">
                          Tous les services de l&apos;établissement
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {displayAmenities.map((tag, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white/5 px-5 py-4 rounded-3xl border border-white/5 hover:border-accent/40 transition-all group cursor-default">
                              <div className="text-accent bg-accent/10 p-2 rounded-xl group-hover:bg-accent group-hover:text-white transition-all">
                                {getAmenityIcon(tag)}
                              </div>
                              <span className="capitalize text-sm font-bold text-white/80">{tag.toLowerCase().replace(/_/g, ' ')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                       {/* Location Details */}
                       <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 space-y-6">
                          <h4 className="text-lg font-black text-white">Localisation précise</h4>
                          <div className="aspect-video bg-neutral-800/80 rounded-2xl relative overflow-hidden flex items-center justify-center border border-white/10">
                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] opacity-20" />
                             <div className="z-10 flex flex-col items-center">
                               <MapPin className="w-10 h-10 text-accent mb-2 animate-bounce" />
                               <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold text-white/70">
                                 Lat: {hotel.lat.toFixed(4)} / Lng: {hotel.lng.toFixed(4)}
                               </div>
                             </div>
                          </div>
                          <div className="space-y-4">
                            <div className="flex gap-4">
                              <Clock className="w-5 h-5 text-accent shrink-0" />
                              <div className="text-xs font-bold text-white/70">Check-in: 15h00<br/>Check-out: 11h00</div>
                            </div>
                            <div className="flex gap-4">
                              <CreditCard className="w-5 h-5 text-accent shrink-0" />
                              <div className="text-xs font-bold text-white/70">Paiement sur place ou<br/>Réservation sécurisée</div>
                            </div>
                          </div>
                       </div>

                       {/* Why this choice? */}
                       <div className="bg-accent/10 border border-accent/20 p-8 rounded-[2rem]">
                          <div className="flex items-center gap-3 mb-4 text-accent">
                            <CheckCircle className="w-7 h-7" />
                            <span className="font-black text-white">L&apos;avis WIGO</span>
                          </div>
                          <p className="text-sm text-white/60 leading-relaxed font-bold italic">
                            &quot;Une pépite locale offrant l&apos;un des meilleurs rapports qualité-prix du quartier {hotel.city}.&quot;
                          </p>
                       </div>
                    </div>
                  </div>

                  {/* Pricing and Action Footer */}
                  <div className="pt-10 border-t border-white/10 sticky bottom-0 bg-[#0f0f0e]/80 backdrop-blur-xl mt-12 -mx-14 px-14 pb-14 shadow-[0_-20px_40px_rgba(0,0,0,0.4)]">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
                       <div className="text-center sm:text-left">
                          <div className="flex items-end gap-3 mb-1">
                            <div className="text-accent font-black text-5xl tracking-tighter">{totalPrice} €</div>
                            <div className="text-white/30 text-sm mb-2 font-bold uppercase tracking-widest line-through decoration-accent/40">{Math.round(totalPrice * 1.12)} €</div>
                          </div>
                          <div className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em]">Offre exclusive WIGO / Booking.com</div>
                       </div>

                       <div className="w-full sm:w-auto">
                        <button 
                          onClick={handleBookingRedirect} 
                          className="w-full sm:px-12 bg-accent hover:bg-accent/90 text-white p-7 rounded-[1.8rem] font-black text-2xl flex items-center justify-center gap-4 shadow-[0_20px_40px_rgba(232,101,42,0.4)] transition-all hover:scale-[1.03] active:scale-[0.98] group relative overflow-hidden"
                        >
                          <span className="relative z-10">Réserver maintenant</span>
                          <ExternalLink className="w-7 h-7 relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        </button>
                       </div>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
