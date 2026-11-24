import Image from "next/image";

/**
 * Brand logo. Only the original file supplied by ASFRA may be used here — never redraw,
 * regenerate or recolor it. Drop the file in /public/brand/ and set LOGO below.
 */
const LOGO: { src: string; width: number; height: number } | null = null;

export function Logo({ className }: { className?: string }) {
  if (LOGO) {
    return (
      <Image src={LOGO.src} width={LOGO.width} height={LOGO.height} alt="ASFRA SERVICES LLC" className={className} priority />
    );
  }
  // Temporary placeholder until the original logo file is provided.
  return (
    <span
      className={`inline-flex items-center rounded-lg border border-dashed border-white/50 px-2.5 py-1 font-display text-[11px] font-medium uppercase tracking-[0.18em] text-white/85 ${className ?? ""}`}
    >
      <span className="sr-only">ASFRA SERVICES LLC — </span>Logo
    </span>
  );
}
