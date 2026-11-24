const base =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold transition-[background-color,color,box-shadow] duration-200 ease-brand cursor-pointer select-none disabled:cursor-not-allowed disabled:opacity-60";

export const btn = {
  primary: `${base} bg-royal text-white shadow-[0_14px_40px_-14px_#005dff] hover:bg-[#1a6dff]`,
  light: `${base} bg-white text-navy hover:bg-white/90`,
  ghost: `${base} border border-white/15 bg-white/5 text-white hover:bg-white/10`,
};

export const container = "mx-auto w-full max-w-7xl px-5 sm:px-8";
