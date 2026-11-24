import { WhatsAppIcon } from "@/components/ui/icons";
import { whatsappLink } from "@/lib/site";

export function WhatsAppFab({ label, text }: { label: string; text: string }) {
  return (
    <a
      href={whatsappLink(text)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="ring-pulse fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full bg-whatsapp text-white shadow-[0_12px_30px_-8px_rgba(37,211,102,.7)] transition-transform duration-200 ease-brand hover:scale-105 sm:bottom-7 sm:right-7"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
