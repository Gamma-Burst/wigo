"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, PlaneTakeoff } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center space-y-8"
      >
        <div className="relative">
           <motion.div 
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
             transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
             className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-100"
           >
             <CheckCircle2 className="w-12 h-12" />
           </motion.div>
           <motion.div 
             animate={{ 
               y: [0, -10, 0],
               rotate: [0, 5, 0]
             }}
             transition={{ duration: 4, repeat: Infinity }}
             className="absolute -top-4 -right-4 bg-accent p-3 rounded-2xl shadow-xl text-white"
           >
              <PlaneTakeoff className="w-6 h-6" />
           </motion.div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-display font-black text-slate-900 tracking-tighter italic uppercase">
            Paiement <span className="text-green-500">Réussi</span> !
          </h1>
          <p className="text-slate-500 font-medium leading-relaxed italic">
            Votre voyage commence ici. <br/>
            Un mail de confirmation avec tous les détails de votre réservation vient d&apos;être envoyé.
          </p>
        </div>

        <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 text-left space-y-4">
           <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-400">
              <span>Statut</span>
              <span className="text-green-500 bg-green-50 px-3 py-1 rounded-full">Validé</span>
           </div>
           <div className="h-px bg-slate-100 w-full" />
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
             Nos experts finalisent actuellement les derniers détails logistiques auprès de nos partenaires locaux.
           </p>
        </div>

        <Link href="/historique">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-slate-900 hover:bg-accent text-white py-6 rounded-2xl font-display font-black uppercase tracking-widest transition-all mt-4 flex items-center justify-center gap-3 shadow-2xl shadow-slate-200"
          >
            Voir mes Réservations <ArrowRight className="w-5 h-5" />
          </motion.button>
        </Link>

        <Link href="/" className="block text-xs font-black text-slate-400 uppercase tracking-[0.3em] hover:text-accent transition-colors">
          Retour à l&apos;accueil
        </Link>
      </motion.div>
    </div>
  );
}
