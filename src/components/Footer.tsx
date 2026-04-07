import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="w-full bg-[#0a0a09] border-t border-white/5 py-12 px-4 mt-20">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-10">
        <div className="max-w-sm">
          <Link href="/">
            <Image
              src="/logo-banner.png"
              alt="WIGO Logo"
              width={120}
              height={36}
              className="object-contain mb-4"
            />
          </Link>
          <p className="text-foreground/50 text-sm leading-relaxed mb-6">
            Construit par des voyageurs, propulsé par l&apos;Intelligence Artificielle. Recherchez, comparez et trouvez les meilleures destinations en Europe aux meilleurs prix, gérés par nos prestigieux partenaires certifiés.
          </p>
          <div className="text-foreground/30 text-xs">
            © 2026 WIGO Travel SARL. Tous droits réservés.
          </div>
        </div>

        <div className="flex gap-16">
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-foreground mb-1">Découvrir</h4>
            <Link href="/guides" className="text-foreground/60 hover:text-accent text-sm transition-colors">
              Nos Guides
            </Link>
            <Link href="/about" className="text-foreground/60 hover:text-accent text-sm transition-colors">
              À Propos de WIGO
            </Link>
            <Link href="/" className="text-foreground/60 hover:text-accent text-sm transition-colors">
              Rechercher un hôtel
            </Link>
          </div>
          
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-foreground mb-1">Légal & Contact</h4>
            <Link href="/legal" className="text-foreground/60 hover:text-accent text-sm transition-colors">
              Mentions Légales & CGU
            </Link>
            <Link href="/privacy" className="text-foreground/60 hover:text-accent text-sm transition-colors">
              Politique de Confidentialité
            </Link>
            <a href="mailto:contact@wigo-travel.com" className="text-foreground/60 hover:text-accent text-sm transition-colors">
              Nous Contacter
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
