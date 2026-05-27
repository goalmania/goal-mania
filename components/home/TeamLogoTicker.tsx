"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const L = (slug: string) => `/team-logos/${slug}.png`;

// ─── Club lists ───────────────────────────────────────────────
const SERIE_A = [
  { name: "Juventus",   slug: "juventus",   logo: L("juventus"),   href: "/shop/serieA/juventus" },
  { name: "Inter",      slug: "inter",      logo: L("inter"),      href: "/shop/serieA/inter" },
  { name: "Milan",      slug: "milan",      logo: L("milan"),      href: "/shop/serieA/milan" },
  { name: "Roma",       slug: "roma",       logo: L("roma"),       href: "/shop/serieA/roma" },
  { name: "Napoli",     slug: "napoli",     logo: L("napoli"),     href: "/shop/serieA/napoli" },
  { name: "Lazio",      slug: "lazio",      logo: L("lazio"),      href: "/shop/serieA/lazio" },
  { name: "Como",       slug: "como",       logo: L("como"),       href: "/shop/serieA/como" },
  { name: "Fiorentina", slug: "fiorentina", logo: L("fiorentina"), href: "/shop/serieA/fiorentina" },
  { name: "Atalanta",   slug: "atalanta",   logo: L("atalanta"),   href: "/shop/serieA/atalanta" },
];

const PREMIER = [
  { name: "Arsenal",     slug: "arsenal",    logo: L("arsenal"),    href: "/shop/premier-league/arsenal" },
  { name: "Man City",    slug: "man-city",   logo: L("man-city"),   href: "/shop/premier-league/manchester-city" },
  { name: "Man United",  slug: "man-utd",    logo: L("man-utd"),    href: "/shop/premier-league/manchester-united" },
  { name: "Chelsea",     slug: "chelsea",    logo: L("chelsea"),    href: "/shop/premier-league/chelsea" },
  { name: "Liverpool",   slug: "liverpool",  logo: L("liverpool"),  href: "/shop/premier-league/liverpool" },
  { name: "Tottenham",   slug: "tottenham",  logo: L("tottenham"),  href: "/shop/premier-league/tottenham" },
  { name: "Aston Villa", slug: "aston-villa", logo: L("aston-villa"), href: "/shop/premier-league/aston-villa" },
];

const INTERNAZIONALI = [
  { name: "Real Madrid",  slug: "real-madrid", logo: L("real-madrid"), href: "/shop/international" },
  { name: "Barcellona",   slug: "barcelona",   logo: L("barcelona"),   href: "/shop/international" },
  { name: "PSG",          slug: "psg",         logo: L("psg"),         href: "/shop/international" },
  { name: "Atletico",     slug: "atletico",    logo: L("atletico"),    href: "/shop/international" },
  { name: "Bayern",       slug: "bayern",      logo: L("bayern"),      href: "/shop/international" },
  { name: "Dortmund",     slug: "dortmund",    logo: L("dortmund"),    href: "/shop/international" },
];

const NAZIONALI = [
  { name: "Italia",      slug: "italia",      logo: L("italia"),      href: "/shop/worldcup/italy" },
  { name: "Francia",     slug: "francia",     logo: L("francia"),     href: "/shop/worldcup/france" },
  { name: "Germania",    slug: "germania",    logo: L("germania"),    href: "/shop/worldcup/germany" },
  { name: "Spagna",      slug: "spagna",      logo: L("spagna"),      href: "/shop/worldcup/spain" },
  { name: "Brasile",     slug: "brasile",     logo: L("brasile"),     href: "/shop/worldcup/brazil" },
  { name: "Argentina",   slug: "argentina",   logo: L("argentina"),   href: "/shop/worldcup/argentina" },
  { name: "Portogallo",  slug: "portogallo",  logo: L("portogallo"),  href: "/shop/worldcup/portugal" },
  { name: "Inghilterra", slug: "inghilterra", logo: L("inghilterra"), href: "/shop/worldcup/england" },
  { name: "Olanda",      slug: "olanda",      logo: L("olanda"),      href: "/shop/worldcup/netherlands" },
  { name: "Belgio",      slug: "belgio",      logo: L("belgio"),      href: "/shop/worldcup/belgium" },
  { name: "Croazia",     slug: "croazia",     logo: L("croazia"),     href: "/shop/worldcup/croatia" },
  { name: "Marocco",     slug: "marocco",     logo: L("marocco"),     href: "/shop/worldcup/morocco" },
  { name: "USA",         slug: "usa",         logo: L("usa"),         href: "/shop/worldcup/usa" },
  { name: "Messico",     slug: "messico",     logo: L("messico"),     href: "/shop/worldcup/mexico" },
  { name: "Senegal",     slug: "senegal",     logo: L("senegal"),     href: "/shop/worldcup/senegal" },
  { name: "Giappone",    slug: "giappone",    logo: L("giappone"),    href: "/shop/worldcup/japan" },
];

interface Team { name: string; slug: string; logo: string; href: string; }

// ─── Team card (div, not Link — navigation handled by Strip) ─
function TeamCard({ team }: { team: Team }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      data-href={team.href}
      className="team-card group flex-shrink-0 flex flex-col items-center gap-2 mx-2"
      style={{ width: "88px" }}
      draggable={false}
    >
      <div
        className="relative w-full flex items-center justify-center rounded-2xl overflow-hidden"
        style={{
          height: "108px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          transition: "transform 200ms cubic-bezier(0.23,1,0.32,1), box-shadow 200ms cubic-bezier(0.23,1,0.32,1), border-color 200ms",
          pointerEvents: "none",
        }}
      >
        {!imgError ? (
          <Image
            src={team.logo}
            alt={team.name}
            width={56}
            height={56}
            className="object-contain drop-shadow-lg pointer-events-none"
            style={{ maxWidth: "56px", maxHeight: "56px" }}
            draggable={false}
            onError={() => setImgError(true)}
          />
        ) : (
          <span
            className="font-black text-xl select-none"
            style={{
              fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
              color: "rgba(200,240,0,0.5)",
              letterSpacing: "1px",
              pointerEvents: "none",
            }}
          >
            {team.name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <span
        className="text-[10px] font-bold text-center leading-tight whitespace-nowrap"
        style={{
          fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
          letterSpacing: "1.5px",
          color: "rgba(255,255,255,0.55)",
          textTransform: "uppercase",
          transition: "color 200ms",
          pointerEvents: "none",
        }}
      >
        {team.name}
      </span>

      <style jsx>{`
        @media (hover: hover) and (pointer: fine) {
          .team-card:hover > div:first-child {
            transform: translateY(-4px);
            box-shadow: 0 12px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(200,240,0,0.25);
            border-color: rgba(200,240,0,0.25) !important;
          }
          .team-card:hover span { color: rgba(200,240,0,0.85) !important; }
        }
      `}</style>
    </div>
  );
}

// ─── Scrolling strip ─────────────────────────────────────────
function Strip({
  teams,
  direction,
  duration,
}: {
  teams: Team[];
  direction: "left" | "right";
  duration: number;
}) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const posRef = useRef(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollAtDragStart = useRef(0);
  const lastTs = useRef(0);
  const isPaused = useRef(false);
  const dragMoved = useRef(0); // track drag distance for click detection

  const doubled = [...teams, ...teams];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const init = () => {
      const halfWidth = el.scrollWidth / 2;
      if (direction === "right") {
        el.scrollLeft = halfWidth;
        posRef.current = halfWidth;
      } else {
        el.scrollLeft = 0;
        posRef.current = 0;
      }
    };
    requestAnimationFrame(init);

    function tick(ts: number) {
      const el = scrollRef.current;
      if (!el) { rafRef.current = requestAnimationFrame(tick); return; }

      if (!isDragging.current && !isPaused.current) {
        if (lastTs.current === 0) lastTs.current = ts;
        const dt = Math.min(ts - lastTs.current, 64);
        lastTs.current = ts;
        const halfWidth = el.scrollWidth / 2;
        const speed = halfWidth / duration;
        const delta = speed * (dt / 1000);

        if (direction === "left") {
          posRef.current += delta;
          if (posRef.current >= halfWidth) posRef.current -= halfWidth;
        } else {
          posRef.current -= delta;
          if (posRef.current <= 0) posRef.current += halfWidth;
        }
        el.scrollLeft = posRef.current;
      } else {
        lastTs.current = ts;
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [direction, duration]);

  function onMouseEnter() { isPaused.current = true; lastTs.current = 0; }
  function onMouseLeave() { isPaused.current = false; }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    isDragging.current = true;
    dragMoved.current = 0;
    dragStartX.current = e.clientX;
    scrollAtDragStart.current = scrollRef.current?.scrollLeft ?? 0;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.style.cursor = "grabbing";
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging.current || !scrollRef.current) return;
    const el = scrollRef.current;
    const delta = dragStartX.current - e.clientX;
    dragMoved.current = Math.abs(delta);
    const halfWidth = el.scrollWidth / 2;
    let newPos = scrollAtDragStart.current + delta;
    if (newPos < 0) newPos += halfWidth;
    if (newPos >= halfWidth * 2) newPos -= halfWidth;
    el.scrollLeft = newPos;
    posRef.current = newPos;
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    isDragging.current = false;
    e.currentTarget.style.cursor = "grab";

    // If barely moved → treat as a click → navigate
    if (dragMoved.current < 6) {
      const target = e.target as HTMLElement;
      const card = target.closest("[data-href]") as HTMLElement | null;
      const href = card?.dataset?.href;
      if (href) router.push(href);
    }
  }

  return (
    <div
      ref={scrollRef}
      className="overflow-x-scroll"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        cursor: "grab",
        userSelect: "none",
        WebkitOverflowScrolling: "touch",
      } as React.CSSProperties}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="flex" style={{ width: "max-content" }}>
        {doubled.map((team, i) => (
          <TeamCard key={`${team.slug}-${i}`} team={team} />
        ))}
      </div>
      <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-6 mb-3">
      <span
        className="text-[9px] uppercase tracking-[3px] font-bold"
        style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.6)" }}
      >
        {label}
      </span>
      <span className="flex-1 h-px" style={{ background: "rgba(200,240,0,0.08)" }} />
    </div>
  );
}

export default function TeamLogoTicker() {
  return (
    <section
      className="py-10 overflow-hidden relative select-none"
      style={{
        background: "#0a0a0a",
        borderTop: "0.5px solid rgba(200,240,0,0.1)",
        borderBottom: "0.5px solid rgba(200,240,0,0.1)",
      }}
    >
      {/* Fade edges */}
      <div
        className="absolute inset-y-0 left-0 w-20 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, #0a0a0a, transparent)" }}
      />
      <div
        className="absolute inset-y-0 right-0 w-20 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, #0a0a0a, transparent)" }}
      />

      <div className="flex items-center justify-center gap-3 mb-7 px-4">
        <span className="w-6 h-[1.5px] rounded-full inline-block" style={{ background: "#c8f000" }} />
        <span
          className="text-[10px] uppercase tracking-[4px] font-bold"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.75)" }}
        >
          // Le Squadre
        </span>
        <span className="w-6 h-[1.5px] rounded-full inline-block" style={{ background: "#c8f000" }} />
      </div>

      <div className="mb-5">
        <SectionLabel label="Serie A" />
        <Strip teams={SERIE_A} direction="left" duration={28} />
      </div>
      <div className="mb-5">
        <SectionLabel label="Premier League" />
        <Strip teams={PREMIER} direction="right" duration={24} />
      </div>
      <div className="mb-5">
        <SectionLabel label="Internazionali" />
        <Strip teams={INTERNAZIONALI} direction="left" duration={22} />
      </div>
      <div>
        <SectionLabel label="Nazionali" />
        <Strip teams={NAZIONALI} direction="right" duration={30} />
      </div>

      <p
        className="text-center mt-5 text-[9px] uppercase tracking-[2px]"
        style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.18)" }}
      >
        ← trascina per scorrere • clicca per visitare →
      </p>
    </section>
  );
}
