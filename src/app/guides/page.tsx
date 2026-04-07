import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const ARTICLES = [
  {
    slug: 'paris-secrete',
    title: 'Comment découvrir le Paris secret : Les recommandations de notre IA',
    excerpt: 'Oubliez la Tour Eiffel et le Louvre. Plongez dans les ruelles cachées, les speakeasies et les passages couverts que seule une IA capable de déchiffrer les requêtes complexes peut vous dénicher.',
    image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'comment-utiliser-ia-voyage',
    title: 'L\'Intelligence Artificielle au service du voyageur',
    excerpt: 'Découvrez comment les LLM (Large Language Models) révolutionnent la planification de vos séjours. De la genèse d\'un itinéraire jusqu\'à la réservation finale des hôtels.',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'top-destinations-2026',
    title: 'Le Top 3 des destinations européennes à découvrir en 2026',
    excerpt: 'Notre IA a analysé les tendances de vol Amadeus pour vous. Voici les villes qui vont exploser cette année grâce à leur rapport qualité-prix imbattable.',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
  }
];

export default function GuidesIndexPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-20 pb-32">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-black mb-4 font-display">Nos Guides de Voyage</h1>
        <p className="text-foreground/60 text-lg md:text-xl max-w-2xl mx-auto">
          Inspiration, astuces technologiques et conseils pratiques pour voyager plus intelligemment avec WIGO.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {ARTICLES.map((article) => (
          <Link href={`/guides/${article.slug}`} key={article.slug} className="group relative bg-[#141412] border border-white/5 rounded-3xl overflow-hidden hover:border-accent/40 transition-colors flex flex-col h-full">
            <div className="relative h-48 w-full overflow-hidden">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
              <Image 
                src={article.image}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="p-6 flex flex-col flex-grow justify-between">
              <div>
                <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-accent transition-colors leading-tight">
                  {article.title}
                </h3>
                <p className="text-foreground/60 text-sm leading-relaxed mb-6">
                  {article.excerpt}
                </p>
              </div>
              <div className="flex items-center text-accent text-sm font-bold gap-2">
                Lire l&apos;article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
