import Image from 'next/image';
import Link from 'next/link';

export default function GuideArticle2() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-20 pb-32">
      <Link href="/guides" className="text-sm text-accent hover:underline mb-8 inline-block">
        ← Retour aux Guides
      </Link>
      
      <h1 className="text-4xl md:text-5xl font-black mb-6 font-display leading-tight">
        L&apos;Intelligence Artificielle au service du voyageur
      </h1>
      
      <div className="flex items-center gap-4 text-sm text-foreground/50 mb-10 border-b border-white/5 pb-8">
        <span>Publié le 4 Avril 2026</span>
        <span>•</span>
        <span>Par WIGO Editorial</span>
      </div>

      <div className="relative w-full h-[400px] rounded-3xl overflow-hidden mb-12">
        <Image 
          src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80"
          alt="IA Voyage"
          fill
          className="object-cover"
        />
      </div>

      <div className="prose prose-invert prose-lg max-w-none text-foreground/80 space-y-6">
        <p>
          Organiser un voyage a longtemps été synonyme d&apos;ouverture de dizaines d&apos;onglets : un pour le vol, un pour l&apos;hôtel, trois pour comparer les prix, et plusieurs blogs de voyage pour comprendre ce qu&apos;il faut voir. Aujourd&apos;hui, la révolution de l&apos;IA générative change la donne.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Le passage des mots clés au langage naturel</h2>
        <p>
          Historiquement, la réservation exigeait des filtres rigides : Date de départ, Date de retour, Nombre d&apos;étoiles, Prix maximum. Mais un être humain ne pense pas en filtres. Il pense en &quot;Idées&quot;.
        </p>
        <p>
          L&apos;IA permet dorénavant de dire à la plateforme : <em>&quot;J&apos;ai besoin de décompresser. Trouve-moi un endroit calme, peut-être en montagne mais où je ne vais pas me ruiner pour un vol direct depuis Bruxelles.&quot;</em> C&apos;est exactement ce que propose WIGO Travel.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">La connexion au monde réel</h2>
        <p>
          La faiblesse des IA classiques comme ChatGPT est qu&apos;elles n&apos;ont pas d&apos;inventaire. Elles peuvent vous conseiller d&apos;aller dans un hôtel, mais ne savent pas s&apos;il est complet le weekend prochain, ni à quel prix précis il se réserve aujourd&apos;hui.
        </p>
        <p>
          En connectant des modèles de langage tels que Gemini aux pipelines de données d&apos;Amadeus, WIGO Travel crée LA plateforme hybride par excellence : la compréhension de la machine, et le prix réel du marché mondial.
        </p>
      </div>
    </article>
  );
}
