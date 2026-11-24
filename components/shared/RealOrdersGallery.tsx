"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import AutoRail from "@/components/ui/AutoRail";
import { realOrdersGallery, type GalleryMediaItem } from "@/lib/data/realOrdersGallery";

interface RealOrdersGalleryProps {
  title?: string;
  eyebrow?: string;
  description?: string;
  items?: GalleryMediaItem[];
  /** Quanti pezzi mostrare al massimo: la fila resta leggera */
  limit?: number;
  className?: string;
}

// Clip muta in loop. Il poster resta sopra finché il video non parte davvero (mai il frame nero).
// Il file si scarica solo quando la card sta per entrare in vista, e parte solo se si vede.
function GalleryVideo({ item }: { item: GalleryMediaItem }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [load, setLoad] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const near = new IntersectionObserver(([e]) => e.isIntersecting && setLoad(true), { rootMargin: "600px" });
    near.observe(el);
    const visible = new IntersectionObserver(([e]) => (e.isIntersecting ? el.play().catch(() => {}) : el.pause()), { threshold: 0.4 });
    visible.observe(el);
    return () => {
      near.disconnect();
      visible.disconnect();
    };
  }, []);

  return (
    <>
      <video
        ref={ref}
        src={load ? item.src : undefined}
        poster={item.poster}
        muted
        loop
        playsInline
        preload="none"
        tabIndex={-1}
        aria-label={item.alt || "Video di un ordine"}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="pointer-events-none h-full w-full object-cover"
      />
      {item.poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.poster} alt="" aria-hidden="true" loading="lazy" decoding="async" className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${playing ? "opacity-0" : "opacity-100"}`} />
      )}
    </>
  );
}

// Pacchi e ordini veri: niente outfit, niente giocatori. Solo quello che prepariamo e spediamo.
export default function RealOrdersGallery({
  title = "Cosa ti arriva a casa",
  eyebrow = "Pacchi veri, preparati da noi",
  description = "Foto e video degli ordini che prepariamo e spediamo.",
  items,
  limit = 28,
  className = "",
}: RealOrdersGalleryProps) {
  const media = (items ?? realOrdersGallery).slice(0, limit);
  if (!media.length) return null;

  return (
    <section className={`py-10 md:py-16 ${className}`} aria-label={title}>
      <div className="mx-auto mb-5 w-full max-w-[1760px] px-5 md:px-10 lg:px-16">
        {eyebrow && <p className="text-[14px] font-bold text-[var(--lime)]">{eyebrow}</p>}
        <h2 className="disp mt-2 text-[clamp(2.4rem,6vw,5rem)] text-white">{title}</h2>
        {description && <p className="mt-3 max-w-[48ch] text-[17px] italic leading-snug text-[var(--text-2)]">{description}</p>}
      </div>
      <AutoRail label={title} speed={34}>
        {media.map((item, i) => (
          <div key={`${item.src}-${i}`} className="relative aspect-[4/5] w-[62vw] max-w-[300px] shrink-0 overflow-hidden rounded-[18px] bg-[#111] shadow-[inset_0_0_0_1px_var(--line)] md:w-[260px] 2xl:w-[290px]">
            {item.type === "video" ? (
              <GalleryVideo item={item} />
            ) : (
              <Image src={item.src} alt={item.alt || "Foto di un ordine"} fill sizes="(max-width: 768px) 62vw, 290px" className="object-cover" loading="lazy" draggable={false} />
            )}
          </div>
        ))}
      </AutoRail>
    </section>
  );
}
