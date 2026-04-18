import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="w-full bg-[#0F0E0C] border-t border-white/[0.06] py-16 px-4 mt-20">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-12">
        {/* Brand column */}
        <div className="max-w-sm">
          <Link href="/">
            <Image
              src="/logo-banner.png"
              alt="WIGO Logo"
              width={120}
              height={36}
              className="object-contain mb-5"
            />
          </Link>
          <p className="text-white/40 text-sm leading-relaxed mb-8">
            Construit par des voyageurs, propulsé par l&apos;Intelligence Artificielle. Recherchez, comparez et trouvez les meilleures destinations en Europe aux meilleurs prix, gérés par nos prestigieux partenaires certifiés.
          </p>
          <div className="text-white/20 text-xs">
            © 2026 WIGO Travel SARL. Tous droits réservés.
          </div>
        </div>

        {/* Links columns */}
        <div className="flex gap-16">
          <div className="flex flex-col gap-4">
            <h4 className="font-display text-white/90 font-bold text-sm tracking-tight mb-1">Découvrir</h4>
            <Link href="/guides" className="text-white/40 hover:text-white text-sm hover-underline transition-colors duration-200 w-fit" style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
              Nos Guides
            </Link>
            <Link href="/about" className="text-white/40 hover:text-white text-sm hover-underline transition-colors duration-200 w-fit" style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
              À Propos de WIGO
            </Link>
            <Link href="/" className="text-white/40 hover:text-white text-sm hover-underline transition-colors duration-200 w-fit" style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
              Rechercher un hôtel
            </Link>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="font-display text-white/90 font-bold text-sm tracking-tight mb-1">Légal &amp; Contact</h4>
            <Link href="/legal" className="text-white/40 hover:text-white text-sm hover-underline transition-colors duration-200 w-fit" style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
              Mentions Légales &amp; CGU
            </Link>
            <Link href="/privacy" className="text-white/40 hover:text-white text-sm hover-underline transition-colors duration-200 w-fit" style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
              Politique de Confidentialité
            </Link>
            <a href="mailto:contact@wigo-travel.com" className="text-white/40 hover:text-white text-sm hover-underline transition-colors duration-200 w-fit" style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
              Nous Contacter
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
