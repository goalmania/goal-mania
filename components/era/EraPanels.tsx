import Link from "next/link";
import "@/app/era.css";
import { ERA_THEME } from "@/lib/eraTheme";
import { eraFontClasses } from "@/lib/eraFonts";
import { cld } from "@/lib/utils/cloudinary";
import EraNumeral from "@/components/era/EraNumeral";

export interface EraPanelData {
  slug: string;
  count: number;
  image: string;
  alt: string;
}

// Porta d'ingresso: sei pannelli, uno per decennio, ognuno nel suo mondo.
// Su desktop il pannello sotto il cursore si apre; su telefono scorrono di lato.
export default function EraPanels({ panels }: { panels: EraPanelData[] }) {
  return (
    <div className={eraFontClasses}>
      <div className="eras" role="list">
        {panels.map((p, i) => {
          const th = ERA_THEME[p.slug];
          if (!th) return null;
          return (
            <Link
              key={p.slug}
              href={`/archivio/${p.slug}`}
              role="listitem"
              aria-label={`${th.title}: ${p.count} maglie`}
              className={`era era-scene era-panel ${th.cls}`}
              style={{ ["--rot" as string]: `${i % 2 ? 2.5 : -2.5}deg` }}
            >
              <span className="era-bg" aria-hidden="true" />
              <EraNumeral cls={th.cls} value={th.numeral} className="absolute left-4 top-7 lg:left-5" />
              {p.image && (
                <span className="p-jersey">
                  <span className="era-frame">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cld(p.image, 420)}
                      alt={p.alt}
                      width={420}
                      height={525}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/5] w-full object-contain p-2"
                    />
                  </span>
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 px-4 py-4 lg:px-5" style={{ background: "var(--e-ac)", color: "var(--e-ac-ink)" }}>
                <span className="block">
                  <span className="block font-[family-name:var(--font-display)] text-[24px] italic uppercase leading-none">{th.title}</span>
                  <span className="mt-1 block text-[14px] font-semibold opacity-80">{p.count} maglie</span>
                </span>
                <span className="p-cue font-[family-name:var(--font-display)] text-[20px] italic uppercase leading-none" aria-hidden="true">Entra →</span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
