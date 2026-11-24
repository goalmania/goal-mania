import Link from "next/link";
import "@/app/era.css";
import { ERA_THEME, ERA_RANGE } from "@/lib/eraTheme";
import { eraFontClasses } from "@/lib/eraFonts";
import { cld } from "@/lib/utils/cloudinary";
import EraNumeral from "@/components/era/EraNumeral";
import AutoRail from "@/components/ui/AutoRail";

export interface EraPanelData {
  slug: string;
  count: number;
  image: string;
  alt: string;
  teams: string[];
  cupYears: number[];
}

// Porta d'ingresso alle maglie retro: un pannello per decennio, ognuno nel suo mondo.
// Dice chiaro cosa c'e dentro: gli anni, quante maglie, le squadre, i Mondiali.
// Su desktop il pannello sotto il cursore si apre; su telefono scorrono da soli e a mano.
export default function EraPanels({ panels }: { panels: EraPanelData[] }) {
  return (
    <div className={eraFontClasses}>
      <AutoRail className="eras" label="Maglie retro per decennio" speed={34}>
        {panels.map((p, i) => {
          const th = ERA_THEME[p.slug];
          if (!th) return null;
          return (
            <Link
              key={p.slug}
              href={`/archivio/${p.slug}`}
              aria-label={`Maglie retro ${th.title}, ${ERA_RANGE[p.slug]}: ${p.count} maglie`}
              className={`era era-scene era-panel ${th.cls}`}
              style={{ ["--rot" as string]: `${i % 2 ? 2.5 : -2.5}deg` }}
              draggable={false}
            >
              <span className="era-bg" aria-hidden="true" />
              <span className="era-pitch" aria-hidden="true" />
              <EraNumeral cls={th.cls} value={th.numeral} className="absolute left-4 top-7 lg:left-5" />
              {p.image && (
                <span className="p-jersey">
                  <span className="era-frame">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cld(p.image, 420)} alt={p.alt} width={420} height={525} loading="lazy" decoding="async" draggable={false} className="aspect-[4/5] w-full object-contain p-2" />
                  </span>
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 px-4 py-4 lg:px-5" style={{ background: "var(--e-ac)", color: "var(--e-ac-ink)" }}>
                <span className="block text-[12px] font-extrabold uppercase tracking-[0.12em] opacity-80">Retro · {ERA_RANGE[p.slug]}</span>
                <span className="mt-1 flex items-end justify-between gap-2">
                  <span className="font-[family-name:var(--font-display)] text-[26px] italic uppercase leading-none">{th.title}</span>
                  <span className="shrink-0 text-[15px] font-bold">{p.count} maglie</span>
                </span>
                <span className="p-extra block text-[14px] font-semibold leading-snug">
                  {p.teams.length > 0 && <span className="block">{p.teams.slice(0, 3).join(", ")} e altre</span>}
                  {p.cupYears.length > 0 && <span className="block opacity-85">Mondiali {p.cupYears.join(", ")}</span>}
                  <span className="mt-1.5 block font-[family-name:var(--font-display)] text-[19px] italic uppercase">Vedi le maglie →</span>
                </span>
              </span>
            </Link>
          );
        })}
      </AutoRail>
    </div>
  );
}
