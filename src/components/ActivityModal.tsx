"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, MapPin, Star, ExternalLink, 
  Palmtree, Landmark, ShoppingBag, Music, 
  Utensils, Sparkles, Clock
} from 'lucide-react';
import { ActivityResult } from '@/app/api/search-activities/route';

interface ActivityModalProps {
  activity: ActivityResult | null;
  isOpen: boolean;
  onClose: () => void;
}

const getCategoryIcon = (category: string) => {
  const c = category.toLowerCase();
  if (c.includes('nature') || c.includes('hiking')) return <Palmtree className="w-5 h-5" />;
  if (c.includes('culture') || c.includes('attractions')) return <Landmark className="w-5 h-5" />;
  if (c.includes('market') || c.includes('shop')) return <ShoppingBag className="w-5 h-5" />;
  if (c.includes('event') || c.includes('music')) return <Music className="w-5 h-5" />;
  if (c.includes('restau') || c.includes('food')) return <Utensils className="w-5 h-5" />;
  return <Sparkles className="w-5 h-5" />;
};

export default function ActivityModal({ activity, isOpen, onClose }: ActivityModalProps) {
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!activity) return null;

  const handleBookingRedirect = () => {
    if (activity.website) {
      window.open(activity.website, '_blank');
    } else {
      const searchQuery = encodeURIComponent(`${activity.name} ${activity.address || ''}`);
      window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xl"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-10 p-3 bg-white/20 hover:bg-white/40 backdrop-blur-xl rounded-full text-white transition-all hover:rotate-90 active:scale-90"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Left Column: Media */}
            <div className="md:w-[45%] h-[300px] md:h-auto relative shrink-0">
               {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activity.imageUrl}
                alt={activity.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-4 py-1.5 bg-accent/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                    Signature WIGO
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-black leading-tight italic tracking-tighter uppercase whitespace-normal">
                  {activity.name}
                </h2>
              </div>
            </div>

            {/* Right Column: Info */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
              <div className="flex flex-wrap items-center gap-6 mb-10">
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-5 py-3 rounded-2xl">
                  <div className="text-accent">
                    {getCategoryIcon(activity.category)}
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                    {activity.category}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-amber-500 bg-amber-50 px-5 py-3 rounded-2xl border border-amber-100">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-lg font-black">{activity.rating}</span>
                </div>

                <div className="text-2xl font-display font-black text-slate-900 bg-slate-900/5 px-5 py-3 rounded-2xl border border-slate-900/5 ml-auto">
                    {activity.price}
                </div>
              </div>

              <div className="space-y-8">
                <div>
                   <div className="flex items-center gap-2 text-accent mb-4">
                      <Clock className="w-5 h-5" />
                      <h4 className="text-xs font-black uppercase tracking-[0.2em]">Description</h4>
                   </div>
                   <p className="text-slate-500 leading-relaxed font-medium text-lg">
                    {activity.description}
                  </p>
                </div>

                {activity.address && (
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 transition-all hover:border-accent group">
                    <div className="flex items-start gap-4">
                      <div className="bg-white p-3 rounded-2xl shadow-sm text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Localisation</span>
                        <p className="text-slate-900 font-bold">{activity.address}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                   {activity.duration && (
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                         <Clock className="w-5 h-5 text-slate-400" />
                         <span className="text-sm font-bold text-slate-700">{activity.duration}</span>
                      </div>
                   )}
                   {activity.tags && activity.tags.slice(0, 2).map((tag, i) => (
                      <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                         <Sparkles className="w-5 h-5 text-slate-400" />
                         <span className="text-sm font-bold text-slate-700">{tag}</span>
                      </div>
                   ))}
                </div>

                <div className="pt-6">
                  <button
                    onClick={handleBookingRedirect}
                    className="w-full bg-slate-900 hover:bg-accent text-white py-6 rounded-[2rem] font-display font-black uppercase tracking-widest text-sm transition-all shadow-2xl shadow-slate-200 active:scale-[0.98] group flex items-center justify-center gap-4"
                  >
                    Réserver l&apos;Expérience
                    <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                  <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-6">
                    Redirection sécurisée vers la plateforme officielle
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
