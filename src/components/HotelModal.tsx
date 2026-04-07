import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { EnhancedHotelResult } from '@/services/hotel-provider';
import { X, Star, MapPin, CheckCircle, ExternalLink } from 'lucide-react';

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

  const handleBookingRedirect = () => {
    const searchQuery = encodeURIComponent(hotel.name);
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6"
          >
            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0a0a09] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/80 backdrop-blur-md p-2 rounded-full text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Hero Image */}
              <div className="relative w-full h-[30vh] sm:h-[40vh] bg-neutral-900">
                <Image 
                  src={hotel.imageUrl} 
                  alt={hotel.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a09] to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                  <div className="bg-accent/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                    <span>{hotel.vibeScore}% WIGO MATCH</span>
                  </div>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 sm:p-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-black font-display text-white mb-2 leading-tight">
                      {hotel.name}
                    </h2>
                    <div className="flex items-center gap-4 text-foreground/60 text-sm">
                      <div className="flex items-center text-yellow-500">
                        {[...Array(hotel.hotelRating || 3)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>Carte Google Maps (Aperçu)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-left md:text-right bg-white/5 p-4 rounded-2xl border border-white/10 min-w-[200px]">
                    <div className="text-sm border-b border-white/10 pb-2 mb-2 text-foreground/60">{hotel.priceNum} € / nuit</div>
                    <div className="text-3xl font-black text-white">{hotel.priceNum ? hotel.priceNum * 3 : "---"} €</div>
                    <div className="text-xs text-foreground/40 mt-1">Total estimé pour 3 nuits (Taxes incluses)</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold mb-4 text-white">Ce que vous allez adorer</h3>
                      <p className="text-foreground/70 leading-relaxed text-sm">
                        Sélectionné par l&apos;Intelligence Artificielle de WIGO pour répondre exactement à votre requête. Cet établissement allie confort premium, localisation de choix, et équipements parfaits pour votre séjour que vous soyez en voyage d&apos;affaires ou en vacances.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-4 text-white">Équipements & Services</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {hotel.tags.map((tag, i) => (
                          <div key={i} className="flex items-center gap-2 text-foreground/70 text-sm bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                            <CheckCircle className="w-4 h-4 text-accent" />
                            <span className="capitalize">{tag.toLowerCase()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-sm text-foreground/70 flex flex-col items-center justify-center h-48 text-center relative overflow-hidden">
                       <MapPin className="w-8 h-8 text-white/20 mb-2" />
                       <p className="z-10 relative">Lat: {hotel.lat} / Lng: {hotel.lng}</p>
                       <p className="text-xs text-white/40 mt-2 z-10 relative">Vue carte détaillée indisponible dans cet aperçu.</p>
                       <div className="absolute inset-0 bg-white/5 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] opacity-10"></div>
                    </div>

                    <div className="bg-accent/10 border border-accent/20 p-5 rounded-2xl flex items-start gap-4">
                      <div className="bg-accent text-white rounded-full p-2 mt-1">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-1">Garantie Sécurité WIGO</h4>
                        <p className="text-xs text-foreground/70">
                          En cliquant sur &quot;Réserver&quot;, vous serez redirigé vers l&apos;environnement ultra-sécurisé de Booking.com pour finaliser la transaction. Vos dates et le nombre de personnes seront automatiquement configurés.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sticky Action Footer Emulator */}
                <div className="mt-10 pt-6 border-t border-white/10 flex justify-end gap-4">
                  <button onClick={onClose} className="px-6 py-4 rounded-xl text-foreground hover:bg-white/5 font-bold transition-colors">
                    Fermer
                  </button>
                  <button onClick={handleBookingRedirect} className="bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(232,101,42,0.4)] transition-all overflow-hidden relative group">
                    <span className="relative z-10">Vérifier les prix & Réserver</span>
                    <ExternalLink className="w-4 h-4 relative z-10" />
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </button>
                </div>

              </div>
            </motion.div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
