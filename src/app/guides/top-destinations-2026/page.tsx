import Image from 'next/image';
import Link from 'next/link';

export default function GuideArticle3() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-20 pb-32">
      <Link href="/guides" className="text-sm text-accent hover:underline mb-8 inline-block">
        ← Retour aux Guides
      </Link>
      
      <h1 className="text-4xl md:text-5xl font-black mb-6 font-display leading-tight">
        Le Top 3 des destinations européennes à découvrir en 2026
      </h1>
      
      <div className="flex items-center gap-4 text-sm text-foreground/50 mb-10 border-b border-white/5 pb-8">
        <span>Publié le 2 Avril 2026</span>
        <span>•</span>
        <span>Par WIGO Editorial</span>
      </div>

      <div className="relative w-full h-[400px] rounded-3xl overflow-hidden mb-12">
        <Image 
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80"
          alt="Top Destinations 2026"
          fill
          className="object-cover"
        />
      </div>

      <div className="prose prose-invert prose-lg max-w-none text-foreground/80 space-y-6">
        <p>
          L&apos;Europe regorge de métropoles dynamiques et de refuges naturels insoupçonnés. Pour cette année 2026, l&apos;algorithme de WIGO Travel a croisé les tendances de vols Amadeus avec l&apos;évolution des prix hôteliers pour vous sortir ce palmarès surprenant des destinations au meilleur potentiel rapport qualité-prix.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Valence, Espagne (L&apos;alternative apaisante à Barcelone)</h2>
        <p>
          Oubliez les foules de la Costa Brava ou l&apos;hyper-densité barcelonaise. Valence offre une combinaison parfaite entre la modernité architecturale (La Cité des Arts et des Sciences), les immenses parcs au cœur de la ville, et de longues plages méditerranéennes étendues.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. Gand, Belgique (La merveille médiévale)</h2>
        <p>
          Souvent mise dans l&apos;ombre de Bruxelles ou Bruges, Gand est une ville étudiante animée enfermée dans une architecture médiévale époustouflante dont le mythique Château des Comtes. L&apos;une des meilleures scènes végétariennes d&apos;Europe et des promenades en bateau sur la Lys inoubliables.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Ljubljana, Slovénie (Le cœur vert de l&apos;Europe)</h2>
        <p>
          La capitale slovène est un modèle d&apos;écologie urbaine avec un centre-ville entièrement piétonnier. C&apos;est la base idéale pour des escapades inoubliables vers le lac de Bled ou les impressionnantes grottes de Postojna. L&apos;un des prix à la nuitée les plus abordables du continent pour une qualité de vie maximale.
        </p>

        <div className="mt-12 bg-white/5 p-8 rounded-2xl border border-white/10">
          <h3 className="text-xl font-bold text-white mb-2">Prêt à partir ?</h3>
          <p className="mb-4">Demandez à WIGO de vous trouver le meilleur vol direct et un hébergement de charme pour l&apos;une de ces destinations dès maintenant.</p>
          <Link href="/">
            <button className="btn-accent px-6 py-3 rounded-xl font-bold text-sm">Organiser mon voyage</button>
          </Link>
        </div>
      </div>
    </article>
  );
}
