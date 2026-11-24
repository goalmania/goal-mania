"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const big = (u: string) => (u && u.includes("res.cloudinary.com") && u.includes("/upload/") ? u.replace("/upload/", "/upload/w_1600,q_auto,f_auto/") : u);

// Foto a schermo intero: frecce, tastiera, swipe, e tocco per ingrandire
export default function PdpLightbox({ images, index, onIndex, onClose, title }: { images: string[]; index: number; onIndex: (i: number) => void; onClose: () => void; title: string }) {
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const touch = useRef<number | null>(null);
  const n = images.length;
  const go = (d: number) => { setZoom(false); onIndex((index + d + n) % n); };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", key);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", key); };
  }); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fade-in fixed inset-0 z-[100] flex flex-col bg-[#0a0a0a]/96" role="dialog" aria-modal="true" aria-label={`Foto di ${title}`}>
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-[16px] font-bold text-white">{index + 1} / {n}</span>
        <button type="button" onClick={onClose} aria-label="Chiudi" className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"><X className="h-6 w-6" /></button>
      </div>
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden"
        onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => { if (touch.current == null || zoom) return; const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); touch.current = null; }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={big(images[index])}
          alt={`${title}, foto ${index + 1}`}
          draggable={false}
          onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`); setZoom((z) => !z); }}
          onMouseMove={(e) => { if (!zoom) return; const r = e.currentTarget.getBoundingClientRect(); setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`); }}
          className="max-h-full max-w-full rounded-2xl bg-[#f4f2ea] object-contain transition-transform duration-200"
          style={{ transform: zoom ? "scale(2.2)" : "none", transformOrigin: origin, cursor: zoom ? "zoom-out" : "zoom-in" }}
        />
        {n > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Foto precedente" className="absolute left-3 flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-[var(--lime)] hover:text-[#0a0a0a]"><ChevronLeft className="h-7 w-7" /></button>
            <button type="button" onClick={() => go(1)} aria-label="Foto successiva" className="absolute right-3 flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-[var(--lime)] hover:text-[#0a0a0a]"><ChevronRight className="h-7 w-7" /></button>
          </>
        )}
      </div>
      <p className="px-4 py-3 text-center text-[14px] text-white/70">Tocca la foto per ingrandire</p>
    </div>
  );
}
