import Image from 'next/image';
import Link from 'next/link';

export default function GuideArticle1() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-20 pb-32">
      <Link href="/guides" className="text-sm text-accent hover:underline mb-8 inline-block">
        ← Retour aux Guides
      </Link>
      
      <h1 className="text-4xl md:text-5xl font-black mb-6 font-display leading-tight">
        Comment découvrir le Paris secret : Les recommandations de notre IA
      </h1>
      
      <div className="flex items-center gap-4 text-sm text-foreground/50 mb-10 border-b border-white/5 pb-8">
        <span>Publié le 6 Avril 2026</span>
        <span>•</span>
        <span>Par WIGO Editorial</span>
      </div>

      <div className="relative w-full h-[400px] rounded-3xl overflow-hidden mb-12">
        <Image 
          src="https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80"
          alt="Paris Secret"
          fill
          className="object-cover"
        />
      </div>

      <div className="prose prose-invert prose-lg max-w-none text-foreground/80 space-y-6">
        <p>
          Ah, Paris... La Tour Eiffel, le Louvre, Montmartre. Ces lieux iconiques attirent des millions de visiteurs chaque année. Mais que faire si vous avez déjà vu tout cela ? Ou mieux, si vous souhaitez simplement éviter les foules de touristes et vivre une expérience purement locale ?
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Le pouvoir de la précision</h2>
        <p>
          C&apos;est ici que WIGO entre en jeu. La plupart des moteurs de recherche de voyage classiques vous proposent des listes standardisées basées sur la popularité. Vous finissez tous par dîner dans les mêmes restaurants recommandés par le guide du Routard.
        </p>
        <p>
          Avec l&apos;Intelligence Artificielle de WIGO, vous pouvez être d&apos;une précision redoutable. Essayez de nous demander : <strong>&quot;Trouve-moi un hôtel de charme à Paris près du Canal Saint-Martin, sous les 150€ par nuit, et réserve-moi un dîner dans un speakeasy secret.&quot;</strong> 
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Trois adresses générées par l&apos;IA pour vous</h2>
        <ul className="list-disc pl-6 space-y-3">
          <li><strong>Le Musée de la Vie Romantique :</strong> Niché dans le 9e arrondissement, ce havre de paix dispose d&apos;un salon de thé sous une serre sublime, parfait pour lire un livre loin du bruit de la ville.</li>
          <li><strong>La rue des Thermopyles :</strong> Une petite rue pavée du 14e arrondissement qui vous donnera l&apos;impression d&apos;être dans un village pittoresque de campagne.</li>
          <li><strong>Le Comptoir Général :</strong> Un concept store/bar caché au fond d&apos;une impasse près du canal Saint-Martin, à l&apos;atmosphère totalement hybride.</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Comment ça marche ?</h2>
        <p>
          Notre modèle, combiné à la technologie <em>Amadeus</em>, analyse des milliers de points d&apos;intérêts et de notes en temps réel pour croiser vos intentions sémantiques (ce que vous voulez *ressentir*) avec la disponibilité réelle des hébergements locaux.
        </p>
        <p>
          N&apos;attendez plus, essayez de générer l&apos;évasion de vos rêves dès maintenant depuis la <Link href="/" className="text-accent underline">page d&apos;accueil de WIGO</Link>.
        </p>
      </div>
    </article>
  );
}
