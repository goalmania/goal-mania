"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, A11y, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import {
  realOrdersGallery,
  type GalleryMediaItem,
} from "@/lib/data/realOrdersGallery";

interface RealOrdersGalleryProps {
  /** Titolo principale della sezione */
  title?: string;
  /** Sottotitolo / occhiello sopra il titolo */
  eyebrow?: string;
  /** Testo descrittivo opzionale sotto il titolo */
  description?: string;
  /** Sovrascrive l'elenco media di default (di norma non serve) */
  items?: GalleryMediaItem[];
  /** Colore di sfondo della sezione */
  background?: string;
  className?: string;
}

/**
 * Clip muta in loop. Il poster resta sempre visibile sopra il video finché
 * quest'ultimo non è davvero in riproduzione: così non si vede mai il frame
 * nero mentre il file bufferizza (anche sugli slide clonati da Swiper per il
 * marquee, che non ricevono il JS di lazy-load). Il download parte molto
 * prima che la card entri in viewport.
 */
function GalleryVideo({ item }: { item: GalleryMediaItem }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [load, setLoad] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const near = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setLoad(true);
      },
      { rootMargin: "1400px" }
    );
    near.observe(el);

    const visible = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.25 }
    );
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
        preload="metadata"
        tabIndex={-1}
        aria-label={item.alt || "Video di un ordine reale"}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="h-full w-full object-cover pointer-events-none"
      />
      {item.poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.poster}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            playing ? "opacity-0" : "opacity-100"
          }`}
        />
      )}
    </>
  );
}

export default function RealOrdersGallery({
  title = "Ordini reali",
  eyebrow = "La galleria dei tifosi",
  description = "Foto e video veri di maglie e pacchi ricevuti dai nostri clienti.",
  items,
  background = "#0a0a0a",
  className = "",
}: RealOrdersGalleryProps) {
  const media = items ?? realOrdersGallery;

  if (!media || media.length === 0) return null;

  const enableLoop = media.length > 4;

  return (
    <section
      className={`py-10 md:py-16 font-munish ${className}`}
      style={{ background }}
      aria-label={title}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          {eyebrow && (
            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.4em] text-white/25">
              {eyebrow}
            </p>
          )}
          <h2 className="text-xl md:text-2xl font-black uppercase italic text-white leading-none">
            {title}
          </h2>
          {description && (
            <p className="mt-2 max-w-xl text-sm text-white/45">{description}</p>
          )}
        </div>
      </div>

      <Swiper
        modules={[FreeMode, A11y, Autoplay]}
        spaceBetween={12}
        slidesPerView={1.35}
        // Marquee continuo: scorre da solo in modo fluido (delay 0 + speed
        // lungo lineare) e resta trascinabile a mano; dopo il drag riparte
        // da solo (disableOnInteraction:false). Su desktop si mette in pausa
        // al passaggio del mouse.
        speed={6000}
        freeMode={{ enabled: true, momentum: false }}
        grabCursor
        loop={enableLoop}
        a11y={{ enabled: true }}
        autoplay={
          enableLoop
            ? {
                delay: 0,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false
        }
        breakpoints={{
          480: { slidesPerView: 2.2, spaceBetween: 14 },
          768: { slidesPerView: 3.2, spaceBetween: 16 },
          1024: { slidesPerView: 4.3, spaceBetween: 18 },
          1280: { slidesPerView: 5.2, spaceBetween: 20 },
        }}
        className="!px-4 sm:!px-6 lg:!px-8"
      >
        {media.map((item, i) => (
          <SwiperSlide key={`${item.src}-${i}`} style={{ height: "auto" }}>
            <div
              className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-[#111]"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {item.type === "video" ? (
                <GalleryVideo item={item} />
              ) : (
                <Image
                  src={item.src}
                  alt={item.alt || "Foto di un ordine reale"}
                  fill
                  sizes="(max-width: 480px) 75vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 20vw"
                  className="object-cover"
                  loading="lazy"
                />
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
