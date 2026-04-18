import { motion, AnimatePresence } from 'framer-motion';
import { X, Utensils, Camera, Landmark, Palmtree, MapPin } from 'lucide-react';

// Types pour l'intérieur des données
interface CityInsight {
  restaurants?: Array<{ name: string; specialty: string; vibe: string }>;
  atypical?: Array<{ name: string; description: string }>;
  culture?: Array<{ name: string; type: string }>;
  nature?: Array<{ name: string; vibe: string }>;
}

interface InsiderModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: "restaurants" | "atypical" | "culture" | "nature" | null;
  insightData: CityInsight;
  destination: string;
}

export default function InsiderModal({ isOpen, onClose, category, insightData, destination }: InsiderModalProps) {
  if (!category || !insightData) return null;

  // Configuration par catégorie
  const config = {
    restaurants: {
      title: "Tables d'Exception",
      icon: <Utensils className="w-8 h-8" />,
      color: "bg-slate-900",
      textColor: "text-white",
      accent: "text-[#E8652A]",
      items: insightData.restaurants?.map((r) => ({
        name: r.name,
        subtitle: r.specialty,
        desc: r.vibe
      })) || []
    },
    atypical: {
      title: "Le Secret WIGO",
      icon: <Camera className="w-8 h-8" />,
      color: "bg-[#E8652A]",
      textColor: "text-white",
      accent: "text-white/80",
      items: insightData.atypical?.map((a) => ({
        name: a.name,
        subtitle: "Lieu Insolite",
        desc: a.description
      })) || []
    },
    culture: {
      title: "Arts & Culture",
      icon: <Landmark className="w-8 h-8" />,
      color: "bg-white",
      textColor: "text-slate-900",
      accent: "text-blue-600",
      items: insightData.culture?.map((c) => ({
        name: c.name,
        subtitle: c.type,
        desc: "Une expérience culturelle incontournable sélectionnée par WIGO."
      })) || []
    },
    nature: {
      title: "Espaces Verts",
      icon: <Palmtree className="w-8 h-8" />,
      color: "bg-emerald-50",
      textColor: "text-emerald-900",
      accent: "text-emerald-600",
      items: insightData.nature?.map((n) => ({
        name: n.name,
        subtitle: "Nature & Détente",
        desc: n.vibe
      })) || []
    }
  };

  const current = config[category];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full max-w-2xl overflow-hidden rounded-[3rem] shadow-2xl ${current.color} ${current.textColor} border border-white/10`}
          >
            {/* Header */}
            <div className="p-10 pb-6">
              <button 
                onClick={onClose}
                className="absolute top-8 right-8 w-10 h-10 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center transition-colors"
                style={{ backdropFilter: 'blur(10px)' }}
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-black/10`}>
                {current.icon}
              </div>
              <h2 className="text-4xl font-display font-black uppercase italic tracking-tighter mb-2">
                {current.title}
              </h2>
              <div className="flex items-center gap-2 text-sm font-bold opacity-80 uppercase tracking-widest">
                <MapPin className="w-4 h-4" /> {destination}
              </div>
            </div>

            {/* Content List */}
            <div className="p-10 pt-0 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {current.items.map((item: {name: string, subtitle: string, desc: string}, idx: number) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  key={idx} 
                  className="bg-black/5 p-6 rounded-2xl border border-black/5 hover:bg-black/10 transition-colors"
                >
                  <h3 className="text-2xl font-bold mb-1">{item.name}</h3>
                  <div className={`text-xs font-black uppercase tracking-widest mb-3 ${current.accent}`}>
                    {item.subtitle}
                  </div>
                  <p className="opacity-80 font-medium leading-relaxed">
                    {item.desc}
                  </p>
                  
                  {/* Google Maps Button */}
                  <button 
                    onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(item.name + ' ' + destination)}`, '_blank')}
                    className="mt-6 text-sm font-bold flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity"
                  >
                    Voir sur la carte ↗
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
