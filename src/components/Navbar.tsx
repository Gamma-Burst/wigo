"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Compass, History, Zap, Plane, LogOut, User as UserIcon } from "lucide-react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";

const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;
const EASE_SPRING = [0.22, 1, 0.36, 1] as const;

export default function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > 50) {
      setScrolled(true);
      if (latest > previous && latest > 150) {
        setHidden(true);
        setMobileOpen(false);
      } else {
        setHidden(false);
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
          hidden: { y: "-110%", opacity: 0 },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.4, ease: EASE_DRAWER }}
        className="fixed left-0 right-0 z-50 top-0 px-4 sm:px-6 pt-4"
      >
        <div 
          className={`mx-auto flex items-center justify-between transition-all duration-500 ${
            scrolled 
              ? "max-w-4xl bg-card/85 backdrop-blur-xl border border-[var(--border)] shadow-nav rounded-full h-14 px-6" 
              : "max-w-6xl bg-transparent h-16 px-2"
          }`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <Image
              src="/logo-banner.png"
              alt="WIGO"
              width={120}
              height={36}
              className={`w-auto object-contain transition-all duration-300 ${scrolled ? "h-7" : "h-8"}`}
              style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
              priority
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            <NavLink href="/" icon={<Compass className="w-4 h-4" />} label="Explorer" scrolled={scrolled} />
            <NavLink href="/vols" icon={<Plane className="w-4 h-4" />} label="Vols" scrolled={scrolled} />
            <NavLink href="/historique" icon={<History className="w-4 h-4" />} label="Mes voyages" scrolled={scrolled} />
            <NavLink href="/pricing" icon={<Zap className="w-4 h-4" />} label="Pro" accent scrolled={scrolled} />
          </div>

          {/* Auth + mobile toggle */}
          <div className="flex items-center gap-3">
            {!user ? (
              <Link href="/login">
                <button
                  className={`hidden md:inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    scrolled
                      ? "bg-foreground text-background hover:opacity-90"
                      : "bg-foreground/10 text-foreground border border-[var(--border-strong)] hover:bg-foreground/15"
                  }`}
                  style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
                >
                  Connexion
                </button>
              </Link>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/historique" className="p-2 rounded-full flex items-center justify-center transition-colors duration-200 bg-foreground/5 hover:bg-foreground/10 text-foreground">
                  <UserIcon className="w-4 h-4" />
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 rounded-full flex items-center justify-center transition-colors duration-200 text-foreground/50 hover:text-red-500 hover:bg-red-500/8"
                  title="Déconnexion"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mobile menu toggle — hamburger morph */}
            <button
              className="md:hidden p-2.5 rounded-full transition-colors duration-200 text-foreground bg-foreground/5 hover:bg-foreground/10"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              <div className="relative w-5 h-5">
                <motion.span
                  animate={mobileOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
                  transition={{ duration: 0.25, ease: EASE_SPRING }}
                  className="absolute left-0 top-1/2 w-5 h-[1.5px] bg-current block origin-center"
                />
                <motion.span
                  animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-1/2 w-5 h-[1.5px] bg-current block"
                />
                <motion.span
                  animate={mobileOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }}
                  transition={{ duration: 0.25, ease: EASE_SPRING }}
                  className="absolute left-0 top-1/2 w-5 h-[1.5px] bg-current block origin-center"
                />
              </div>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile drawer — staggered mask reveal */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />
            <motion.div
              initial={{ y: -12, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -12, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: EASE_SPRING }}
              className="absolute top-[84px] left-4 right-4 bg-card/95 backdrop-blur-xl border border-[var(--border)] rounded-2xl p-3 shadow-card-hover space-y-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              {[
                { href: "/", icon: <Compass className="w-5 h-5" />, label: "Explorer", delay: 0 },
                { href: "/vols", icon: <Plane className="w-5 h-5" />, label: "Vols", delay: 0.05 },
                { href: "/historique", icon: <History className="w-5 h-5" />, label: "Mes voyages", delay: 0.1 },
                { href: "/pricing", icon: <Zap className="w-5 h-5" />, label: "WIGO Pro", delay: 0.15, accent: true },
              ].map((item) => (
                <motion.div
                  key={item.href}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: item.delay, duration: 0.3, ease: EASE_SPRING }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                      item.accent
                        ? "text-accent bg-accent-subtle"
                        : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                    }`}
                  >
                    {item.icon} {item.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3, ease: EASE_SPRING }}
                className="pt-3 border-t border-[var(--border)] mt-2"
              >
                {!user ? (
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <button className="w-full py-3 bg-foreground text-background rounded-xl font-semibold text-sm active:scale-[0.97] transition-transform duration-150">
                      Connexion / Inscription
                    </button>
                  </Link>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 py-2 px-4 rounded-xl text-sm font-medium text-foreground/70">
                      <UserIcon className="w-5 h-5 opacity-50" /> Mon compte
                    </div>
                    <button onClick={handleLogout} className="w-full py-3 text-red-500 bg-red-500/6 rounded-xl font-semibold text-sm hover:bg-red-500/10 transition-colors duration-200 flex justify-center items-center gap-2 active:scale-[0.97]">
                      <LogOut className="w-4 h-4" /> Déconnexion
                    </button>
                  </div>
                )}
              </motion.div>
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
  const base = "flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200";
  if (accent) {
    return (
      <Link
        href={href}
        className={`${base} bg-accent text-white active:scale-[0.97]`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
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
          ? "text-foreground/55 hover:text-foreground hover:bg-foreground/5"
          : "text-foreground/55 hover:text-foreground hover:bg-foreground/5"
      }`}
      style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
    >
      {icon} {label}
    </Link>
  );
}
