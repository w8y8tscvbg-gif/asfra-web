import { Building2, Car, Hash, IdCard, LifeBuoy, ReceiptText, type LucideIcon } from "lucide-react";
import { siInstagram, siWhatsapp } from "simple-icons";
import type { ServiceSlug } from "@/lib/site";

export const SERVICE_ICONS: Record<ServiceSlug, LucideIcon> = {
  "seguros-de-auto": Car,
  "asistencia-en-accidentes": LifeBuoy,
  "creacion-de-llc": Building2,
  "numero-ein": Hash,
  "tramite-de-itin": IdCard,
  taxes: ReceiptText,
};

type BrandProps = { className?: string; title?: string };

function SimpleIcon({ path, className, title }: BrandProps & { path: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title ? <title>{title}</title> : null}
      <path d={path} />
    </svg>
  );
}

export const WhatsAppIcon = (p: BrandProps) => <SimpleIcon path={siWhatsapp.path} {...p} />;
export const InstagramIcon = (p: BrandProps) => <SimpleIcon path={siInstagram.path} {...p} />;
