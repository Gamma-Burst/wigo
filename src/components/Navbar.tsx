"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Compass, History, Zap, Plane, Menu, X } from "lucide-react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > 50) {
      setScrolled(true);
      if (latest > previous && latest > 150) {
        setHidden(true); // Hide on scroll down
        setMobileOpen(false);
      } else {
        setHidden(false); // Show on scroll up
      }
    } else {
      setScrolled(false);
      setHidden(false);
    }
  });

  return (
    <>
      <motion.nav
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: "-100%", opacity: 0 },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "top-4 px-4 sm:px-6" : "top-0 px-4 sm:px-6"
        }`}
      >
        <div 
          className={`mx-auto transition-all duration-500 flex items-center justify-between ${
            scrolled 
              ? "max-w-5xl bg-white/70 dark:bg-[#1A1A1A]/70 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-full h-14 px-6" 
              : "max-w-7xl bg-transparent h-20 px-2"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <Image
              src="/logo-banner.png"
              alt="WIGO"
              width={120}
              height={36}
              className={`w-auto object-contain transition-all ${scrolled ? "h-7" : "h-9"} group-hover:scale-105`}
              priority
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1.5 absolute left-1/2 -translate-x-1/2">
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
                  className={`hidden md:inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all ${
                    scrolled
                      ? "bg-foreground text-background hover:scale-105 shadow-md"
                      : "bg-white/15 text-white border border-white/25 hover:bg-white/25 backdrop-blur-md hover:scale-105"
                  }`}
                >
                  Connexion
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: scrolled ? "w-8 h-8" : "w-10 h-10 transition-all" } }} />
            </SignedIn>

            {/* Mobile menu toggle */}
            <button
              className={`md:hidden p-2 rounded-full transition-colors ${
                scrolled ? "text-foreground bg-foreground/5 hover:bg-foreground/10" : "text-white bg-white/10 hover:bg-white/20 backdrop-blur-md"
              }`}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute top-[80px] left-4 right-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-black/8 dark:border-white/10 rounded-2xl p-4 shadow-2xl space-y-1"
              onClick={(e) => e.stopPropagation()}
            >
              <MobileNavLink href="/" icon={<Compass className="w-5 h-5" />} label="Explorer" onClick={() => setMobileOpen(false)} />
              <MobileNavLink href="/vols" icon={<Plane className="w-5 h-5" />} label="Vols" onClick={() => setMobileOpen(false)} />
              <MobileNavLink href="/historique" icon={<History className="w-5 h-5" />} label="Mes voyages" onClick={() => setMobileOpen(false)} />
              <MobileNavLink href="/pricing" icon={<Zap className="w-5 h-5" />} label="WIGO Pro" onClick={() => setMobileOpen(false)} accent />
              <div className="pt-3 border-t border-black/8 dark:border-white/10 mt-3">
                <SignedOut>
                  <SignInButton mode="modal" fallbackRedirectUrl="/">
                    <button className="w-full py-3.5 bg-foreground text-background rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform">
                      Connexion / Inscription
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <div className="flex items-center gap-3 py-2 px-2 hover:bg-foreground/5 rounded-xl transition-colors cursor-pointer">
                    <UserButton afterSignOutUrl="/" />
                    <span className="text-sm font-medium text-foreground">Mon compte</span>
                  </div>
                </SignedIn>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
          ? "text-foreground/60 hover:text-foreground hover:bg-foreground/5 hover:scale-105"
          : "text-white/70 hover:text-white hover:bg-white/10 hover:scale-105"
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
