"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ShieldCheck, CreditCard, User, 
  ArrowRight, CheckCircle2, Loader2, Lock,
  Phone, Mail, AlertCircle
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Deleted unused ActivityResult import

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CheckoutItem | null;
}

interface CheckoutItem {
  id: string;
  title: string;
  price: string;
  amount: number;
  type: 'HOTEL' | 'ACTIVITY';
  imageUrl?: string;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

function CheckoutForm({ item, customerInfo, onComplete, onSecondaryAction }: { 
  item: CheckoutItem, 
  customerInfo: CustomerInfo, 
  onComplete: (bookingId: string) => void,
  onSecondaryAction: () => void 
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || "Erreur lors de la validation.");
      setProcessing(false);
      return;
    }

    try {
      // 1. Create Payment Intent and Booking
      const response = await fetch('/api/stripe/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: item.amount,
          title: item.title,
          type: item.type,
          itemId: item.id,
          customerInfo
        }),
      });

      const { clientSecret, bookingId, error: apiError } = await response.json();

      if (apiError) throw new Error(apiError);

      // 2. Confirm Payment
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/success`, 
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message || "Paiement échoué.");
      } else {
        // 3. Finalize Booking
        await fetch('/api/complete-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId }),
        });
        onComplete(bookingId);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue.";
      setError(message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-6">
        <div className="flex justify-between items-center mb-2">
           <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total à régler</span>
           <span className="text-2xl font-display font-black text-slate-900">{item.price}</span>
        </div>
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
           <Lock className="w-3 h-3" /> Paiement 100% sécurisé
        </div>
      </div>

      <PaymentElement />
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-xs font-bold">{error}</p>
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onSecondaryAction}
          className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
        >
          Retour
        </button>
        <button
          disabled={!stripe || processing}
          className="flex-[2] bg-slate-900 hover:bg-accent text-white py-4 px-6 rounded-2xl font-display font-black uppercase tracking-widest transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {processing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>Confirmer le Paiement <ShieldCheck className="w-5 h-5" /></>
          )}
        </button>
      </div>
    </form>
  );
}

export default function CheckoutModal({ isOpen, onClose, item }: CheckoutModalProps) {
  const [step, setStep] = useState(1);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setBookingId(null);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!item) return null;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display font-black text-slate-900 tracking-tighter italic uppercase">
                  Finaliser <span className="text-accent">Réservation</span>
                </h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Étape {step} sur 2 • {item.title}
                </p>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 md:p-10 flex-1 overflow-y-auto">
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <form onSubmit={handleNext} className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Nom complet du passager</label>
                      <div className="relative">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input
                          required
                          value={customerInfo.name}
                          onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                          className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                          placeholder="Jean Dupont"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Adresse Email</label>
                      <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input
                          required
                          type="email"
                          value={customerInfo.email}
                          onChange={e => setCustomerInfo({...customerInfo, email: e.target.value})}
                          className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                          placeholder="jean.dupont@mail.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Téléphone (Optionnel)</label>
                      <div className="relative">
                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input
                          value={customerInfo.phone}
                          onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                          className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                          placeholder="+32 400 00 00 00"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-accent text-white py-5 rounded-2xl font-display font-black uppercase tracking-widest shadow-xl transition-all group flex items-center justify-center gap-4 mt-8"
                    >
                      Détails de Paiement <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <Elements stripe={stripePromise} options={{ 
                    mode: 'payment', 
                    amount: Math.round(item.amount * 100), 
                    currency: 'eur',
                    appearance: {
                      theme: 'flat',
                      variables: {
                        colorPrimary: '#8B5CF6',
                      }
                    } 
                  }}>
                    <CheckoutForm 
                      item={item} 
                      customerInfo={customerInfo} 
                      onComplete={(id) => { setBookingId(id); setStep(3); }} 
                      onSecondaryAction={() => setStep(1)}
                    />
                  </Elements>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10"
                >
                  <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h3 className="text-3xl font-display font-black text-slate-900 mb-4 uppercase italic tracking-tighter">
                    Réservation <span className="text-green-500">Confirmée</span> !
                  </h3>
                  <p className="text-slate-500 font-medium leading-relaxed max-w-sm mx-auto mb-10">
                    Votre demande pour <span className="text-slate-900 font-bold">{item.title}</span> a bien été enregistrée. Un mail de confirmation vous sera envoyé d&apos;ici peu.
                  </p>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-left mb-8">
                     <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">N° de Réservation</span>
                        <span className="font-mono font-bold text-slate-900">{bookingId?.slice(-8).toUpperCase()}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</span>
                        <span className="px-3 py-1 bg-green-500 text-white text-[10px] font-black rounded-full uppercase">Confirmé</span>
                     </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-5 rounded-2xl font-display font-black uppercase tracking-widest transition-all"
                  >
                    Retour au Voyage
                  </button>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            {step !== 3 && (
              <div className="p-6 bg-slate-50/50 flex items-center justify-center gap-8 border-t border-slate-50">
                <div className="flex items-center gap-2 text-slate-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Mastercard / Visa / Amex</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
