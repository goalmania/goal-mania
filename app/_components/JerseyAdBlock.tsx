"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface JerseyAdBlockProps {
  jerseyId?: string;
  teamHint?: string;
}

export function JerseyAdBlock({ jerseyId, teamHint }: JerseyAdBlockProps) {
  const [jersey, setJersey] = useState<{
    id: string;
    title: string;
    image: string;
    slug: string;
    basePrice: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    let timeoutId: NodeJS.Timeout | null = null;

    const safeJson = async (res: Response) => {
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        return res.json();
      }
      // Try to parse text and fallback to empty
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        return null;
      }
    };

    const loadJersey = async () => {
      try {
        setIsLoading(true);

        const timeout = 10000;
        timeoutId = setTimeout(() => controller.abort(), timeout);

        let item: any = null;

        // Priority 1: manual jersey override
        if (jerseyId) {
          const res = await fetch(
            `/api/products/${encodeURIComponent(jerseyId)}`,
            { signal: controller.signal }
          );
          if (res.ok) item = await safeJson(res);
        }

        // Priority 2: team-based match (the core value prop)
        if (!item && teamHint) {
          const res = await fetch(
            `/api/products?search=${encodeURIComponent(teamHint)}&limit=1`,
            { signal: controller.signal }
          );
          if (res.ok) {
            const data = await safeJson(res);
            item = data?.products?.[0] ?? null;
          }
        }

        // Priority 3: generic featured fallback
        if (!item) {
          const res = await fetch(
            `/api/products/featured?limit=1`,
            { signal: controller.signal }
          );
          if (res.ok) {
            const data = await safeJson(res);
            item = data?.products?.[0] ?? null;
          }
        }

        if (timeoutId) clearTimeout(timeoutId);
        if (!mounted) return;

        // Validate data before setting
        if (
          item &&
          (item._id || item.id) &&
          (item.images && item.images.length > 0 || item.image)
        ) {
          const imageUrl = item.images?.[0] || item.image || "/images/placeholder.png";
          setJersey({
            id: item._id || item.id,
            title: item.title || "Offerta Goal Mania",
            image: imageUrl,
            slug: item.slug || item._id || "/shop",
            basePrice: item.basePrice || item.price || 30,
          });
        } else {
          // fallback to placeholder when data not usable
          setJersey({
            id: "placeholder",
            title: "Offerta Goal Mania",
            image: "/images/placeholder.png",
            slug: "/shop",
            basePrice: 30,
          });
        }
      } catch (err: any) {
        // Silently ignore abort errors from cleanup or timeout
        if (err.name === "AbortError") {
          if (mounted) {
            console.warn("JerseyAdBlock fetch aborted (timeout).");
          }
          // Don't set fallback on unmount abort
          if (!mounted) return;
        } else {
          console.error("Error loading jersey:", err);
        }
        if (!mounted) return;
        // Fallback so UI doesn't break
        setJersey({
          id: "placeholder",
          title: "Offerta Goal Mania",
          image: "/images/placeholder.png",
          slug: "/shop",
          basePrice: 30,
        });
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadJersey();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      controller.abort();
    };
  }, [jerseyId, teamHint]);

  if (isLoading) {
    return (
      <div className="w-full my-8 rounded-xl overflow-hidden border border-white/10 bg-[#111111] h-[160px] animate-pulse" />
    );
  }

  if (!jersey) {
    return null;
  }

  return (
    <div className="w-full my-8 rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-[#111111]">
      <div className="flex flex-col sm:flex-row">
        {/* Image column */}
        <div className="relative sm:w-[220px] shrink-0 bg-[#0a0a0a] flex items-center justify-center min-h-[220px]">
          <div className="absolute top-3 left-3 bg-[#c8f000] text-black text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full z-10">
            In evidenza
          </div>
          <div className="relative w-full h-full min-h-[220px]">
            <Image
              src={jersey.image}
              alt={jersey.title}
              fill
              className="object-contain p-4"
              sizes="(max-width: 640px) 100vw, 220px"
              priority
            />
          </div>
        </div>

        {/* Content column */}
        <div className="flex flex-col justify-between p-5 flex-1 gap-4">
          <div>
            <p className="text-[#c8f000] text-xs font-bold uppercase tracking-widest mb-1">
              Offerta esclusiva
            </p>
            <h3 className="text-white text-lg sm:text-xl font-bold leading-snug">
              {jersey.title}
            </h3>
            <p className="text-white/50 text-sm mt-2">
              Mostra la tua passione — spedizione gratuita inclusa.
            </p>
          </div>

          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div className="flex items-baseline gap-2">
              <span className="text-[#c8f000] text-3xl font-black">€{jersey.basePrice}</span>
              <span className="text-white/30 text-sm line-through">€{Math.round(jersey.basePrice * 1.2)}</span>
            </div>
            <Link
              href={`/products/${jersey.slug}`}
              className="bg-[#c8f000] hover:bg-[#d4ff00] active:scale-95 text-black text-sm font-black uppercase tracking-wide px-5 py-2.5 rounded-lg transition-all duration-150 flex items-center gap-2 whitespace-nowrap"
            >
              Acquista ora
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}