import { Mail, Phone } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuoteSection } from "@/components/home/QuoteSection";
import { Reveal } from "@/components/motion/Reveal";
import { RevealText } from "@/components/motion/RevealText";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/icons";
import { container } from "@/components/ui/styles";
import { hasLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { alternates } from "@/lib/seo";
import { contact } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/contacto">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = await getDictionary(lang);
  return {
    title: t.meta.contactTitle,
    description: t.meta.contactDescription,
    alternates: alternates(lang, "/contacto"),
    openGraph: { title: t.meta.contactTitle, description: t.meta.contactDescription, url: localePath(lang, "/contacto") },
  };
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contacto">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = await getDictionary(lang);

  const channels = [
    { label: t.contactPage.phone, value: contact.phoneDisplay, href: `tel:${contact.phoneE164}`, icon: <Phone className="size-6" aria-hidden /> },
    { label: "WhatsApp", value: contact.phoneDisplay, href: contact.whatsappUrl, icon: <WhatsAppIcon className="size-6" />, external: true },
    { label: t.contactPage.email, value: contact.email, href: `mailto:${contact.email}`, icon: <Mail className="size-6" aria-hidden /> },
    { label: t.contactPage.instagram, value: contact.instagramHandle, href: contact.instagramUrl, icon: <InstagramIcon className="size-6" />, external: true },
  ];

  return (
    <>
      <section className="relative isolate overflow-hidden pb-10 pt-40 sm:pt-48">
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_85%_0%,rgba(0,93,255,.10)_0%,rgba(255,255,255,0)_65%)]" />
        <div className={container}>
          <p className="eyebrow">{t.contactPage.eyebrow}</p>
          <RevealText as="h1" onMount className="mt-5 text-[3.4rem] leading-[0.92] sm:text-8xl">
            {t.contactPage.title}
          </RevealText>
          <Reveal onMount delay={0.5}>
            <p className="mt-6 max-w-xl text-xl text-navy/75">{t.contactPage.lead}</p>
          </Reveal>
          <Reveal as="ul" stagger={0.08} className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {channels.map((c) => (
              <li key={c.label}>
                <a
                  href={c.href}
                  {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="spot flex h-full flex-col justify-between gap-10 rounded-[22px] bg-royal/[0.05] p-6 transition-colors hover:bg-royal/[0.09]"
                >
                  <span className="text-royal">{c.icon}</span>
                  <span>
                    <span className="block text-sm text-navy/60">{c.label}</span>
                    <span className="mt-1 block break-all font-display text-xl font-bold">{c.value}</span>
                  </span>
                </a>
              </li>
            ))}
          </Reveal>
        </div>
      </section>
      <QuoteSection lang={lang} t={t} />
    </>
  );
}
