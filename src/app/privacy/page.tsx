export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 pb-32">
      <h1 className="text-4xl md:text-5xl font-black mb-8">Politique de Confidentialité</h1>
      
      <div className="space-y-8 text-foreground/80 leading-relaxed text-sm">
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">1. Introduction</h2>
          <p>
            WIGO (&quot;nous&quot;, &quot;notre&quot;, &quot;nos&quot;) s&apos;engage à protéger la vie privée de ses utilisateurs. Cette politique explique quelles données nous collectons, comment nous les utilisons, et comment nous les sécurisons lorsque vous utilisez nos services d&apos;intelligence artificielle pour vos recherches de voyage.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">2. Données collectées</h2>
          <p>Nous collectons et traitons les catégories de données suivantes :</p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li><strong>Données de création de compte :</strong> Votre adresse e-mail, de manière sécurisée via Supabase. Nous n&apos;avons pas accès à vos mots de passe.</li>
            <li><strong>Données de requêtes IA :</strong> Le contenu texte de vos recherches de vacances (les &quot;prompts&quot;). Celles-ci sont anonymisées et envoyées aux API de nos prestataires IA (Gemini) afin de générer vos résultats.</li>
            <li><strong>Données de navigation (Cookies) :</strong> Votre historique de recherche local (Destination, Dates) stocké directement dans le `sessionStorage` de votre propre navigateur pour améliorer votre confort. Ces données ne sont par défaut pas conservées sur nos serveurs à moins que vous les ajoutiez à vos favoris.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">3. Transmission aux Partenaires (Affiliation)</h2>
          <p>
            En tant que comparateur, nous redirigeons nos utilisateurs vers différents prestataires certifiés (tels que Booking.com). Lorsque vous cliquez sur le bouton &quot;Réserver&quot;, nous transmettons un identifiant de session sous la forme d&apos;une référence d&apos;affiliation dans l&apos;URL.
          </p>
          <p className="mt-2 text-amber-500/80 font-medium bg-amber-500/10 p-4 rounded-xl">
            Veuillez noter que le site partenaire recevra vos informations de recherche afin de pré-remplir ses fenêtres de réservation. Une fois redirigé, vous êtes soumis aux conditions de confidentialité de ce partenaire. Nous ne recevons en aucun cas vos informations bancaires via ces partenaires.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">4. Conservation et Suppression (Droit à l&apos;oubli RGPD)</h2>
          <p>
            Vous possédez un droit intégral d&apos;accès, de rectification et de suppression de toutes données à caractère personnel vous concernant. WIGO respecte pleinement la législation RGPD (Règlement Général sur la Protection des Données).
          </p>
          <p className="mt-2">
            Pour exercer ce droit ou exiger la suppression immédiate de votre compte, envoyez simplement votre demande à : <a href="mailto:privacy@wigo-travel.com" className="text-accent hover:underline">privacy@wigo-travel.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
