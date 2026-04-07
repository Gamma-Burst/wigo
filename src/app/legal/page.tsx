export default function LegalPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 pb-32">
      <h1 className="text-4xl md:text-5xl font-black mb-8">Mentions Légales & CGU</h1>
      
      <div className="space-y-8 text-foreground/80 leading-relaxed text-sm">
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">1. Informations sur l&apos;Éditeur WIGO</h2>
          <p>
            Le site internet WIGO Travel (ci-après le &quot;Site&quot;), accessible à l&apos;adresse https://wigo.com (domaine en cours de modification), est édité par la société WIGO SPRL.
            <br/><br/>
            <strong>Siège Social :</strong> [votre adresse], Belgique.<br/>
            <strong>Numéro d&apos;entreprise / TVA :</strong> [votre numéro BE...]<br/>
            <strong>Directeur de la publication :</strong> [Votre nom]<br/>
            <strong>Contact :</strong> contact@wigo-travel.com
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">2. Hébergement</h2>
          <p>
            Ce site est hébergé par Vercel Inc.<br/>
            <strong>Adresse :</strong> 340 S Lemon Ave #4133 Walnut, CA 91789, États-Unis.<br/>
            <strong>Contact hébergeur :</strong> privacy@vercel.com.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">3. Nature du site & Comparateur d&apos;offres (Affiliation)</h2>
          <p>
            WIGO agit en tant que moteur de recherche et méta-comparateur (&quot;Metasearch engine&quot;). Nous utilisons des technologies d&apos;intelligence artificielle pour indexer, organiser et comparer des offres de voyages, de vols, d&apos;hébergements et d&apos;activités fournies par des sociétés tierces (tels que Booking.com, Amadeus, etc.).
          </p>
          <p className="mt-3">
            WIGO n&apos;est pas une agence de voyage ni un tour-opérateur. En conséquence :
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Nous ne vendons directement aucun billet, réservation de chambre, ou activité ;</li>
              <li>Nous n&apos;encaissons pas le montant de votre réservation ;</li>
              <li>Nous n&apos;avons pas accès aux détails de vos réservations confirmées.</li>
            </ul>
          </p>
          <p className="mt-3">
            Le contrat de vente est systématiquement conclu entre l&apos;utilisateur et le partenaire vers lequel nous l&apos;avons redirigé (par exemple Booking.com ou la compagnie aérienne). Les conditions de vente, d&apos;annulation et de remboursement applicables sont exclusivement celles du site partenaire. WIGO décline toute responsabilité en cas de litige, annulation, retard ou modification concernant une réservation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">4. Limitation de Responsabilité sur les données de l&apos;IA</h2>
          <p>
            Bien que nous mettions tout en œuvre pour assurer l&apos;exactitude des résultats affichés par notre intelligence artificielle, ces derniers sont générés à partir de vastes ensembles de données de partenaires et peuvent contenir des inexactitudes de prix, de disponibilité ou de localisation. Les prix finaux et définitifs sont ceux affichés sur le site du fournisseur officiel au moment du paiement. WIGO ne garantit ni la disponibilité permanente des offres ni le fait qu&apos;elles soient exemptes d&apos;erreur.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">5. Propriété Intellectuelle</h2>
          <p>
            L&apos;ensemble de ce site relève des législations belges et internationales sur le droit d&apos;auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents iconographiques et photographiques. L&apos;utilisation, copie, ou altération des éléments visuels du site (designs, code source, textes originaux) sans autorisation préalable écrite est formellement interdite.
          </p>
        </section>
      </div>
    </div>
  );
}
