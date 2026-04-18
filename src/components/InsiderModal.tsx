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
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25, mass: 0.8 }}
            className={`relative w-full max-w-2xl overflow-hidden rounded-[3rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)] ${current.color} ${current.textColor} border border-white/10`}
          >
            {/* Top Header Blur Overlay for sleek text fade out when scrolling */}
            <div className={`absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-${current.color === 'bg-white' ? 'white' : 'black'} via-${current.color === 'bg-white' ? 'white' : 'black'}/80 to-transparent pointer-events-none z-10 opacity-70`} />

            <div className="relative flex flex-col max-h-[85vh]">
              {/* Header */}
              <div className="p-10 pb-6 shrink-0 relative z-20">
                <button 
                  onClick={onClose}
                  className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/5 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  style={{ backdropFilter: 'blur(12px)' }}
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6 bg-white/10 border border-white/5 shadow-inner`}>
                  {current.icon}
                </div>
                <h2 className="text-4xl sm:text-5xl font-display font-black uppercase tracking-tighter mb-2 leading-none">
                  {current.title}
                </h2>
                <div className="flex items-center gap-2 text-xs font-black opacity-60 uppercase tracking-[0.2em] mt-4">
                  <MapPin className="w-4 h-4 text-current" /> {destination}
                </div>
              </div>

              {/* Content List */}
              <div className="overflow-y-auto custom-scrollbar relative z-0 flex-1">
                <div className="p-10 pt-0 space-y-6 pb-16">
              {current.items.map((item: {name: string, subtitle: string, desc: string}, idx: number) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.05 * idx }}
                  key={idx} 
                  className="bg-white/5 p-8 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all group"
                >
                  <h3 className="text-2xl font-black mb-1 tracking-tight">{item.name}</h3>
                  <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${current.accent}`}>
                    {item.subtitle}
                  </div>
                  <p className="opacity-70 font-medium leading-relaxed text-sm">
                    {item.desc}
                  </p>
                  
                  {/* Google Maps Button */}
                  <button 
                    onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(item.name + ' ' + destination)}`, '_blank')}
                    className="mt-8 text-[11px] font-black flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity uppercase tracking-widest"
                  >
                    Voir sur la carte ↗
                  </button>
                </motion.div>
              ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
