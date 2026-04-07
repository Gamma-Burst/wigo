export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 pb-32">
      <h1 className="text-4xl md:text-5xl font-black mb-8">À Propos de WIGO</h1>
      
      <div className="space-y-8 text-foreground/80 leading-relaxed text-lg">
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Notre Mission</h2>
          <p>
            WIGO est né d&apos;un constat simple : organiser un voyage sur mesure en Europe prend trop de temps. Entre trouver le bon vol, le bon hôtel qui correspond à notre budget et les activités locales idéales, les voyageurs passent en moyenne 15 heures devant leur écran avant de finaliser une réservation.
          </p>
          <p className="mt-4">
            Notre mission est de démocratiser le voyage sur mesure en confiant cette tâche fastidieuse à l&apos;Intelligence Artificielle. En une seule phrase, WIGO comprend vos envies, votre budget et assemble le séjour parfait.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Notre Technologie</h2>
          <p>
            Propulsé par les dernières avancées en IA générative (notamment Gemini AI), WIGO est capable de comprendre les nuances de vos demandes (&quot;un week-end romantique avec spa et un restaurant caché&quot;). 
          </p>
          <p className="mt-4">
            Nous avons couplé ce &quot;cerveau&quot; avec les puissantes API d&apos;Amadeus, le leader mondial de la technologie du voyage, afin de vous garantir des inventaires en temps réel sur plus de 150 000 hébergements, 500 compagnies aériennes et des dizaines de milliers d&apos;activités certifiées. L&apos;imagination de l&apos;IA, la rigueur de l&apos;inventaire mondial.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Un modèle transparent</h2>
          <p>
            WIGO est un comparateur de voyage indépendant (Travel Metasearch Engine). Nous ne fixons pas les prix et nous ne facturons aucun frais de réservation cachés. 
          </p>
          <p className="mt-4">
            Lorsque vous trouvez le séjour parfait sur WIGO, nous vous redirigeons en toute sécurité vers nos partenaires certifiés (comme Booking.com ou directement les compagnies aériennes) pour finaliser votre transaction en toute sécurité. Nous nous rémunérons uniquement via une commission partenaire, sans surcoût pour vous.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">L&apos;Équipe</h2>
          <p>
            Basée au carrefour de l&apos;Europe, l&apos;équipe de WIGO est composée de passionnés de voyage et de développeurs spécialisés en Machine Learning. Chaque jour, nous entraînons nos algorithmes pour qu&apos;ils découvrent les meilleures pépites régionales et les tarifs les plus compétitifs, vous assurant l&apos;expérience d&apos;un agent de voyage privé premium, entièrement gratuit.
          </p>
        </section>
      </div>
    </div>
  );
}
