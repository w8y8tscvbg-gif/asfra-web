import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

export const inputCls =
  "h-[52px] w-full rounded-xl border border-navy/15 bg-white px-4 text-base text-navy placeholder:text-navy/40 transition-[border-color,box-shadow] duration-200 outline-none focus:border-royal focus:shadow-[0_0_0_3px_rgba(0,93,255,.3)] aria-[invalid=true]:border-[#ff6b6b]";

export function Field({
  id,
  label,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-navy/85">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function SelectWrap({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-navy/60" aria-hidden />
    </div>
  );
}

/** Hidden field that only bots fill in. */
export function Honeypot({ register }: { register: object }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Website
        <input type="text" tabIndex={-1} autoComplete="off" {...register} />
      </label>
    </div>
  );
}
