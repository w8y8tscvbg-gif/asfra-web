import Link from "next/link";
import { btn, container } from "@/components/ui/styles";

// The 404 page has no access to the locale, so it is bilingual.
export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] items-center pt-32">
      <div className={container}>
        <p className="eyebrow">404</p>
        <h1 className="mt-4 text-5xl sm:text-7xl">
          Página no encontrada
          <span className="mt-2 block text-navy/45">Page not found</span>
        </h1>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className={btn.primary}>
            Volver al inicio
          </Link>
          <Link href="/en" className={btn.ghost}>
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}
