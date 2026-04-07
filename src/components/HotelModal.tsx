import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { EnhancedHotelResult } from '@/services/hotel-provider';
import { X, Star, MapPin, CheckCircle, ExternalLink, Calendar, Users, Info } from 'lucide-react';

interface HotelModalProps {
  hotel: EnhancedHotelResult | null;
  isOpen: boolean;
  onClose: () => void;
}

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
    // FIX: Include city in search query to avoid location fallback on Booking.com
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6"
          >
            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0f0f0e] border border-white/10 rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col"
            >
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-xl p-3 rounded-full text-white transition-all shadow-xl border border-white/10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col md:flex-row h-full overflow-y-auto">
                {/* Visual Section (Left/Top) */}
                <div className="w-full md:w-1/2 min-h-[40vh] md:min-h-full relative sticky top-0 md:h-[90vh] shrink-0">
                  <Image 
                    src={hotel.imageUrl} 
                    alt={hotel.name}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0e] via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#0f0f0e]/20" />
                  
                  <div className="absolute bottom-10 left-10 right-10 z-20">
                    <div className="inline-flex items-center gap-2 bg-accent px-4 py-2 rounded-2xl text-white text-xs font-black tracking-widest uppercase mb-4 shadow-xl">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{hotel.vibeScore}% WIGO Selected</span>
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-black font-display text-white mb-2 leading-[1.1] tracking-tight text-shadow-lg">
                      {hotel.name}
                    </h2>
                    <div className="flex items-center gap-2 text-white/80 font-medium">
                      <MapPin className="w-5 h-5 text-accent" />
                      <span className="text-lg">{hotel.city || 'Destination de rêve'}</span>
                    </div>
                  </div>
                </div>

                {/* Info Section (Right/Bottom) */}
                <div className="w-full md:w-1/2 p-8 sm:p-12 space-y-10">
                  
                  {/* Quick Summary Bar */}
                  <div className="flex flex-wrap gap-4 items-center justify-between bg-white/[0.03] border border-white/10 p-6 rounded-3xl">
                     <div className="flex items-center gap-3">
                        <div className="bg-accent/20 p-3 rounded-xl border border-accent/20">
                          <Calendar className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Séjour</div>
                          <div className="text-sm font-bold text-white">{nights} nuits</div>
                        </div>
                     </div>

                     <div className="flex items-center gap-3">
                        <div className="bg-accent/20 p-3 rounded-xl border border-accent/20">
                          <Users className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Voyageurs</div>
                          <div className="text-sm font-bold text-white">{hotel.guests || 2} adultes</div>
                        </div>
                     </div>

                     <div className="flex items-center gap-3">
                        <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-emerald-400/60 font-bold">Statut</div>
                          <div className="text-sm font-bold text-emerald-400">Disponible</div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
                        <Info className="w-6 h-6 text-accent" /> Pourquoi cet hôtel ?
                      </h3>
                      <p className="text-white/60 leading-relaxed text-lg font-medium">
                        Cet établissement a été méticuleusement sélectionné par notre IA car il combine un design d&apos;exception avec une localisation stratégique à <span className="text-white font-bold">{hotel.city}</span>. C&apos;est le choix idéal pour un voyageur exigeant cherchant à la fois le confort moderne et l&apos;authenticité locale.
                      </p>
                    </div>

                    <div className="pt-4">
                      <h3 className="text-xl font-bold mb-4 text-white uppercase tracking-widest text-xs opacity-50">Points forts & Équipements</h3>
                      <div className="flex flex-wrap gap-3">
                        {hotel.tags.map((tag, i) => (
                          <div key={i} className="flex items-center gap-2 bg-white/5 px-4 py-2.5 rounded-2xl border border-white/5 hover:border-accent/30 transition-colors group">
                            <CheckCircle className="w-4 h-4 text-accent transition-transform group-hover:scale-110" />
                            <span className="capitalize text-sm font-bold text-white/80">{tag.toLowerCase()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="pt-8 border-t border-white/10">
                    <div className="flex items-end justify-between mb-8">
                       <div>
                          <div className="text-accent font-black text-4xl mb-1">{totalPrice} €</div>
                          <div className="text-xs text-white/30 uppercase tracking-widest font-bold">Paiement sécurisé via Booking</div>
                       </div>
                       <div className="text-right">
                          <div className="text-white/40 text-sm line-through decoration-accent/40">{Math.round(totalPrice * 1.15)} €</div>
                          <div className="text-emerald-400 text-xs font-black uppercase tracking-widest">Meilleur prix garanti</div>
                       </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <button 
                        onClick={handleBookingRedirect} 
                        className="w-full bg-accent hover:bg-accent/90 text-white p-6 rounded-[1.5rem] font-black text-xl flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(232,101,42,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden"
                      >
                        <span className="relative z-10">Confirmer & Réserver</span>
                        <ExternalLink className="w-6 h-6 relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      </button>
                      <p className="text-[10px] text-center text-white/30 px-4 uppercase tracking-[0.1em] font-black">
                        Rémanence : Les tarifs peuvent varier selon la disponibilité temps réel de notre partenaire.
                      </p>
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
