"use client";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Magnetic } from "@/components/motion/Magnetic";
import { Logo } from "@/components/ui/Logo";
import { btn } from "@/components/ui/styles";
import { localePath, stripLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/es";

type Props = {
  lang: Locale;
  t: Pick<Dictionary, "announcement" | "announcementClose" | "nav">;
};

const BAR_H = 40;

export function Header({ lang, t }: Props) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [barOpen, setBarOpen] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > BAR_H);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      window.__lenis?.stop();
      document.documentElement.style.overflow = "hidden";
    } else {
      window.__lenis?.start();
      document.documentElement.style.overflow = "";
    }
  }, [menuOpen]);

  const home = localePath(lang, "/");
  const links = [
    { href: `${home === "/" ? "" : home}/#servicios`, label: t.nav.services },
    { href: localePath(lang, "/agencias"), label: t.nav.agencies },
    { href: localePath(lang, "/contacto"), label: t.nav.contact },
  ];
  const quoteHref = `${home === "/" ? "" : home}/#cotizar`;
  const rest = stripLocale(pathname);
  const otherLang: Locale = lang === "es" ? "en" : "es";
  const switchHref = localePath(otherLang, rest);

  const navTop = barOpen && !scrolled ? BAR_H + 12 : 12;

  return (
    <>
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-navy">
        {t.nav.skip}
      </a>

      {barOpen && (
        <div className="relative z-40 flex h-10 items-center overflow-hidden bg-royal text-[13px] font-semibold text-white">
          <div className="marquee-track flex shrink-0 whitespace-nowrap" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="px-8">
                {t.announcement}
              </span>
            ))}
          </div>
          <span className="sr-only">{t.announcement}</span>
          <button
            type="button"
            onClick={() => setBarOpen(false)}
            aria-label={t.announcementClose}
            className="absolute right-0 top-0 grid h-10 w-11 place-items-center bg-royal"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      )}

      <header
        className="fixed inset-x-3 z-50 transition-[top] duration-300 ease-brand sm:inset-x-6"
        style={{ top: navTop }}
      >
        <nav
          aria-label="Principal"
          className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 rounded-2xl border border-navy/10 bg-white/75 pl-4 pr-2 shadow-[0_20px_50px_-25px_rgba(14,26,61,.28)] backdrop-blur-xl"
        >
          <Link href={home} aria-label={t.nav.home} className="flex items-center">
            <Logo priority />
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="rounded-full px-4 py-2 text-[15px] text-navy/80 transition-colors hover:text-navy">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <Link
              href={switchHref}
              hrefLang={otherLang}
              aria-label={`${t.nav.language}: ${otherLang.toUpperCase()}`}
              className="hidden h-10 items-center rounded-full border border-navy/10 px-3 text-[13px] font-semibold sm:flex"
            >
              <span className={lang === "es" ? "text-navy" : "text-navy/45"}>ES</span>
              <span className="px-1 text-navy/30">/</span>
              <span className={lang === "en" ? "text-navy" : "text-navy/45"}>EN</span>
            </Link>
            <Magnetic strength={0.25}>
              <Link href={quoteHref} className={`${btn.primary} !min-h-11 !px-5`}>
                {t.nav.quote}
              </Link>
            </Magnetic>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t.nav.menu}
              aria-expanded={menuOpen}
              aria-controls="menu-movil"
              className="grid size-11 place-items-center rounded-xl bg-navy/[0.05] md:hidden"
            >
              <Menu className="size-5" aria-hidden />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="menu-movil"
            role="dialog"
            aria-modal="true"
            aria-label={t.nav.menu}
            className="fixed inset-0 z-[70] flex flex-col bg-white"
            initial={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
            animate={reduce ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)" }}
            exit={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: reduce ? 0.15 : 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="flex h-20 items-center justify-between px-6">
              <Logo />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label={t.nav.close}
                className="grid size-11 place-items-center rounded-xl bg-navy/[0.05]"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <ul className="flex flex-1 flex-col justify-center gap-2 px-6">
              {[...links, { href: quoteHref, label: t.nav.quote }].map((l, i) => (
                <li key={l.href} className="overflow-hidden">
                  <motion.span
                    className="block"
                    initial={reduce ? false : { y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.25 + i * 0.07, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
                  >
                    <Link
                      href={l.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between border-b border-navy/10 py-4 font-display text-4xl font-bold tracking-tight"
                    >
                      {l.label}
                      <ArrowUpRight className="size-7 text-royal" aria-hidden />
                    </Link>
                  </motion.span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between px-6 pb-10 text-sm text-navy/70">
              <span>{t.nav.language}</span>
              <Link
                href={switchHref}
                hrefLang={otherLang}
                onClick={() => setMenuOpen(false)}
                className="rounded-full border border-navy/15 px-4 py-2 font-semibold text-navy"
              >
                {lang === "es" ? "English" : "Español"}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
