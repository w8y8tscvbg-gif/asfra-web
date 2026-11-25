import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import { RevealText } from "@/components/motion/RevealText";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/icons";
import { Logo } from "@/components/ui/Logo";
import { container } from "@/components/ui/styles";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/es";
import { contact, SERVICE_SLUGS } from "@/lib/site";

export function Footer({ lang, t }: { lang: Locale; t: Dictionary }) {
  return (
    <footer className="relative z-10 overflow-hidden border-t border-white/10 bg-ink pb-28 pt-20 sm:pb-16">
      <div className={container}>
        <RevealText
          as="p"
          className="font-display text-[15vw] font-bold leading-[0.9] tracking-[-0.05em] text-white sm:text-[11vw] lg:text-[9.5rem]"
        >
          We connect. <span className="text-royal">You grow.</span>
        </RevealText>

        <div className="mt-16 grid gap-10 border-t border-white/10 pt-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Logo className="size-20" sizes="80px" />
            <p className="max-w-xs text-sm text-white/60">{t.brand.subtitle}</p>
          </div>

          <div>
            <p className="eyebrow mb-4">{t.footer.services}</p>
            <ul className="space-y-2.5 text-[15px] text-white/75">
              {SERVICE_SLUGS.map((s) => (
                <li key={s}>
                  <Link href={localePath(lang, `/servicios/${s}`)} className="hover:text-white">
                    {t.serviceList[s].name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4">{t.footer.company}</p>
            <ul className="space-y-2.5 text-[15px] text-white/75">
              <li>
                <Link href={localePath(lang, "/agencias")} className="hover:text-white">
                  {t.nav.agencies}
                </Link>
              </li>
              <li>
                <Link href={localePath(lang, "/contacto")} className="hover:text-white">
                  {t.nav.contact}
                </Link>
              </li>
              <li>
                <Link href={localePath(lang === "es" ? "en" : "es", "/")} hrefLang={lang === "es" ? "en" : "es"} className="hover:text-white">
                  {lang === "es" ? "English" : "Español"}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4">{t.footer.contact}</p>
            <ul className="space-y-3 text-[15px] text-white/75">
              <li>
                <a href={`tel:${contact.phoneE164}`} className="inline-flex items-center gap-2.5 hover:text-white">
                  <Phone className="size-4 text-royal-400" aria-hidden /> {contact.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 hover:text-white">
                  <WhatsAppIcon className="size-4 text-royal-400" /> WhatsApp
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2.5 hover:text-white">
                  <Mail className="size-4 text-royal-400" aria-hidden /> {contact.email}
                </a>
              </li>
              <li>
                <a href={contact.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 hover:text-white">
                  <InstagramIcon className="size-4 text-royal-400" /> {contact.instagramHandle}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-14 text-xs text-white/45">
          © <CurrentYear /> ASFRA SERVICES LLC. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}

async function CurrentYear() {
  "use cache";
  return <>{new Date().getFullYear()}</>;
}
