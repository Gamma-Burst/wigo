"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Compass, History, Zap, Plane, Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/8 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <Image
                src="/logo-banner.png"
                alt="WIGO"
                width={120}
                height={36}
                className="h-9 w-auto object-contain transition-opacity group-hover:opacity-80"
                priority
              />
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              <NavLink href="/" icon={<Compass className="w-4 h-4" />} label="Explorer" scrolled={scrolled} />
              <NavLink href="/vols" icon={<Plane className="w-4 h-4" />} label="Vols" scrolled={scrolled} />
              <NavLink href="/historique" icon={<History className="w-4 h-4" />} label="Mes voyages" scrolled={scrolled} />
              <NavLink href="/pricing" icon={<Zap className="w-4 h-4" />} label="Pro" accent scrolled={scrolled} />
            </div>

            {/* Auth + mobile toggle */}
            <div className="flex items-center gap-3">
              <SignedOut>
                <SignInButton mode="modal" fallbackRedirectUrl="/">
                  <button
                    className={`hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      scrolled
                        ? "bg-foreground text-background hover:bg-foreground/80"
                        : "bg-white/15 text-white border border-white/25 hover:bg-white/25 backdrop-blur-sm"
                    }`}
                  >
                    Connexion
                  </button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
              </SignedIn>

              {/* Mobile menu toggle */}
              <button
                className={`md:hidden p-2 rounded-lg transition-colors ${
                  scrolled ? "text-foreground hover:bg-foreground/5" : "text-white hover:bg-white/10"
                }`}
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="absolute top-16 left-0 right-0 bg-white dark:bg-zinc-900 border-b border-black/8 px-4 py-4 space-y-1 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <MobileNavLink href="/" icon={<Compass className="w-5 h-5" />} label="Explorer" onClick={() => setMobileOpen(false)} />
            <MobileNavLink href="/vols" icon={<Plane className="w-5 h-5" />} label="Vols" onClick={() => setMobileOpen(false)} />
            <MobileNavLink href="/historique" icon={<History className="w-5 h-5" />} label="Mes voyages" onClick={() => setMobileOpen(false)} />
            <MobileNavLink href="/pricing" icon={<Zap className="w-5 h-5" />} label="WIGO Pro" onClick={() => setMobileOpen(false)} accent />
            <div className="pt-2 border-t border-black/8 mt-2">
              <SignedOut>
                <SignInButton mode="modal" fallbackRedirectUrl="/">
                  <button className="w-full py-3 bg-foreground text-background rounded-xl font-semibold text-sm">
                    Connexion / Inscription
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-3 py-2">
                  <UserButton afterSignOutUrl="/" />
                  <span className="text-sm text-foreground/70">Mon compte</span>
                </div>
              </SignedIn>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function NavLink({
  href, icon, label, accent, scrolled,
}: {
  href: string; icon: React.ReactNode; label: string; accent?: boolean; scrolled: boolean;
}) {
  const base = "flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all";
  if (accent) {
    return (
      <Link
        href={href}
        className={`${base} ${
          scrolled
            ? "bg-accent text-white hover:bg-accent/90"
            : "bg-white/15 text-white border border-white/25 hover:bg-white/25"
        }`}
      >
        {icon} {label}
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className={`${base} ${
        scrolled
          ? "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
          : "text-white/80 hover:text-white hover:bg-white/10"
      }`}
    >
      {icon} {label}
    </Link>
  );
}

function MobileNavLink({
  href, icon, label, accent, onClick,
}: {
  href: string; icon: React.ReactNode; label: string; accent?: boolean; onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors ${
        accent
          ? "text-accent bg-accent/5 hover:bg-accent/10"
          : "text-foreground/80 hover:text-foreground hover:bg-foreground/5"
      }`}
    >
      {icon} {label}
    </Link>
  );
}
