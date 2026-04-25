"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center space-y-8"
      >
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-red-100">
           <XCircle className="w-12 h-12" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-display font-black text-slate-900 tracking-tighter italic uppercase">
            Paiement <span className="text-red-500">Annulé</span>
          </h1>
          <p className="text-slate-500 font-medium leading-relaxed italic">
            La transaction n&apos;a pas pu être finalisée. <br/>
            Aucun montant n&apos;a été débité de votre compte.
          </p>
        </div>

        <div className="bg-amber-50 p-6 rounded-[2.5rem] border border-amber-100 text-left flex items-start gap-4">
           <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
           <p className="text-xs font-bold text-amber-800 leading-relaxed uppercase tracking-wider">
             Si vous avez rencontré un problème technique, n&apos;hésitez pas à réinitialiser votre recherche ou à nous contacter.
           </p>
        </div>

        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-slate-900 hover:bg-accent text-white py-6 rounded-2xl font-display font-black uppercase tracking-widest transition-all mt-4 flex items-center justify-center gap-3 shadow-2xl shadow-slate-200"
          >
            <ArrowLeft className="w-5 h-5" /> Retour à la recherche
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
