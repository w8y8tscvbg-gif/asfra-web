import Image from "next/image";

/**
 * Brand logo: ASFRA's original file (public/brand/asfra-logo.png, transparent PNG, 1024x1024),
 * copied byte-for-byte. Never redraw, regenerate, recolor or crop it.
 */
export function Logo({ className = "size-11", sizes = "44px", priority = false }: { className?: string; sizes?: string; priority?: boolean }) {
  return (
    <Image
      src="/brand/asfra-logo.png"
      width={1024}
      height={1024}
      sizes={sizes}
      alt="ASFRA SERVICES LLC"
      className={`object-contain ${className}`}
      priority={priority}
    />
  );
}
