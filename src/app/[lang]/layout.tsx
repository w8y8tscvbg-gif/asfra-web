import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { contact, SITE_URL, STATES } from "@/lib/site";
import "../globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: "#0e1a3d",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = await getDictionary(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.meta.homeTitle, template: `%s` },
    description: t.meta.homeDescription,
    applicationName: t.meta.siteName,
    openGraph: {
      type: "website",
      siteName: t.meta.siteName,
      locale: lang === "es" ? "es_US" : "en_US",
    },
    twitter: { card: "summary_large_image" },
  };
}

// Content animated in by JS starts hidden only when motion is allowed. If the JS bundle has not
// started within 3 s (slow connection), the content is shown statically instead of staying hidden.
const MOTION_FLAG = `try{var d=document.documentElement;if(!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('js-motion');setTimeout(function(){if(!window.__motionReady)d.classList.remove('js-motion')},3000)}}catch(e){}`;

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = await getDictionary(lang);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "ASFRA SERVICES LLC",
    slogan: t.brand.slogan,
    description: t.meta.homeDescription,
    url: SITE_URL,
    telephone: contact.phoneE164,
    email: contact.email,
    sameAs: [contact.instagramUrl],
    areaServed: STATES.map((s) => ({ "@type": "State", name: s.name })),
  };

  return (
    <html lang={lang} className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_FLAG }} />
      </head>
      <body className="min-h-dvh">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        <SmoothScroll />
        <Header lang={lang} t={{ announcement: t.announcement, announcementClose: t.announcementClose, nav: t.nav }} />
        <main id="contenido">{children}</main>
        <Footer lang={lang} t={t} />
        <WhatsAppFab label={t.whatsappFab} text={t.quote.whatsappText} />
      </body>
    </html>
  );
}
