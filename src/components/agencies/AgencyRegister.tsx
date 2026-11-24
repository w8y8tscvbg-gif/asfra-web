"use client";
import { useState } from "react";
import { AgencyForm } from "@/components/forms/AgencyForm";
import { UsNetworkMap } from "@/components/home/UsNetworkMap";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/es";
import type { StateCode } from "@/lib/site";
import type { UsMapData } from "@/lib/usMap";

/** Registration form and map side by side; the state picked in the form lights up on the map. */
export function AgencyRegister({
  lang,
  t,
  map,
  mapLabel,
  mapTitle,
}: {
  lang: Locale;
  t: Pick<Dictionary, "agencyForm" | "validation" | "quote">;
  map: UsMapData;
  mapLabel: string;
  mapTitle: string;
}) {
  const [selected, setSelected] = useState<StateCode | null>(null);
  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
      <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 sm:p-9">
        <h2 className="text-3xl leading-tight sm:text-4xl">{t.agencyForm.title}</h2>
        <div className="mt-7">
          <AgencyForm lang={lang} t={t} onStateChange={setSelected} />
        </div>
      </div>
      <div className="lg:sticky lg:top-28">
        <p className="eyebrow mb-4">{mapTitle}</p>
        <UsNetworkMap data={map} label={mapLabel} showLabels highlight={selected} />
      </div>
    </div>
  );
}
