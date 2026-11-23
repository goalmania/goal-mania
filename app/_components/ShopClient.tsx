"use client";

import Link from "next/link";
import Image from "next/image";
import FAQ from "@/app/_components/FAQ";
import SerieATeamsClient from "@/app/_components/SerieATeamsClient";
import PremierLeagueClient from "@/app/_components/PremierLeagueClient";
import LeagueRail from "@/components/home/LeagueRail";
import ProductRail from "@/components/home/ProductRail";
import OfferTicket from "@/components/home/OfferTicket";
import type { Product } from "@/lib/types/product";

// ─────────────────────────────────────────────────────────────
// Nazionali (collegamenti alle pagine per squadra)
// ─────────────────────────────────────────────────────────────
const LN = (slug: string) => `/team-logos/${slug}.png`;

const NAZIONALI = [
  { name: "Italia",      slug: "italia",      logo: LN("italia"),      href: "/shop/worldcup/italy" },
  { name: "Francia",     slug: "francia",     logo: LN("francia"),     href: "/shop/worldcup/france" },
  { name: "Germania",    slug: "germania",    logo: LN("germania"),    href: "/shop/worldcup/germany" },
  { name: "Spagna",      slug: "spagna",      logo: LN("spagna"),      href: "/shop/worldcup/spain" },
  { name: "Brasile",     slug: "brasile",     logo: LN("brasile"),     href: "/shop/worldcup/brazil" },
  { name: "Argentina",   slug: "argentina",   logo: LN("argentina"),   href: "/shop/worldcup/argentina" },
  { name: "Portogallo",  slug: "portogallo",  logo: LN("portogallo"),  href: "/shop/worldcup/portugal" },
  { name: "Inghilterra", slug: "inghilterra", logo: LN("inghilterra"), href: "/shop/worldcup/england" },
  { name: "Olanda",      slug: "olanda",      logo: LN("olanda"),      href: "/shop/worldcup/netherlands" },
  { name: "Belgio",      slug: "belgio",      logo: LN("belgio"),      href: "/shop/worldcup/belgium" },
  { name: "Croazia",     slug: "croazia",     logo: LN("croazia"),     href: "/shop/worldcup/croatia" },
  { name: "Marocco",     slug: "marocco",     logo: LN("marocco"),     href: "/shop/worldcup/morocco" },
  { name: "USA",         slug: "usa",         logo: LN("usa"),         href: "/shop/worldcup/usa" },
  { name: "Messico",     slug: "messico",     logo: LN("messico"),     href: "/shop/worldcup/mexico" },
  { name: "Senegal",     slug: "senegal",     logo: LN("senegal"),     href: "/shop/worldcup/senegal" },
  { name: "Giappone",    slug: "giappone",    logo: LN("giappone"),    href: "/shop/worldcup/japan" },
];

function NazionaliLogoCard({ name, logo, href }: { name: string; logo: string; href: string }) {
  return (
    <Link
      href={href}
      className="naz-logo-card group flex flex-col items-center gap-2"
      style={{ width: "92px", flexShrink: 0 }}
    >
      <div
        className="w-full flex items-center justify-center rounded-2xl overflow-hidden"
        style={{
          height: "96px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          transition: "transform 200ms cubic-bezier(0.23,1,0.32,1), box-shadow 200ms, border-color 200ms",
        }}
      >
        <Image
          src={logo}
          alt={name}
          width={52}
          height={52}
          className="object-contain drop-shadow-lg"
          style={{ maxWidth: "52px", maxHeight: "52px" }}
          draggable={false}
        />
      </div>
      <span
        className="text-center leading-tight"
        style={{
          fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
          fontSize: "13px",
          fontWeight: 500,
          letterSpacing: "0",
          color: "rgba(255,255,255,0.8)",
          textTransform: "none",
          transition: "color 200ms",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "88px",
        }}
      >
        {name}
      </span>
      <style jsx>{`
        @media (hover: hover) and (pointer: fine) {
          .naz-logo-card:hover > div:first-child {
            transform: translateY(-4px);
            box-shadow: 0 12px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(200,240,0,0.3);
            border-color: rgba(200,240,0,0.3) !important;
          }
          .naz-logo-card:hover span { color: rgba(200,240,0,0.9) !important; }
        }
        .naz-logo-card:active > div:first-child { transform: scale(0.97); }
      `}</style>
    </Link>
  );
}

function NazionaliSection() {
  return (
    <section className="pb-12 px-4 sm:px-6" style={{ background: "#0a0a0a" }}>
      <div className="max-w-7xl mx-auto">
        <div
          className="grid gap-x-4 gap-y-6"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))" }}
        >
          {NAZIONALI.map((n) => (
            <div key={n.slug} className="flex justify-center">
              <NazionaliLogoCard name={n.name} logo={n.logo} href={n.href} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


function TeamGroup({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-[32px] p-5 md:p-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-[22px] font-semibold tracking-[-0.02em]">{title}</h3>
        <Link href={href} className="flex min-h-[44px] items-center text-[15px] font-semibold text-[var(--lime)]">
          Vedi tutte
        </Link>
      </div>
      {children}
    </section>
  );
}

export default function ShopClient({
  latestProducts = [],
  bestSellingProducts = [],
  featuredProducts = [],
  products2627 = [],
  retroProducts = [],
}: {
  latestProducts: Product[];
  bestSellingProducts: Product[];
  featuredProducts: Product[];
  mysteryBoxProducts?: Product[];
  videoProducts?: Product[];
  worldCupTeams?: any[];
  products2627?: Product[];
  retroProducts?: Product[];
}) {
  const picks = (featuredProducts.length ? featuredProducts : [...bestSellingProducts, ...latestProducts]).slice(0, 12);
  const rail = (list: Product[]) => list.slice(0, 12) as any[];

  return (
    <div>
      <header className="mx-auto max-w-[1280px] px-5 pb-3 pt-8 md:px-8 md:pt-14">
        <h1 className="display text-[clamp(2.4rem,7vw,4.5rem)]">Tutte le maglie</h1>
        <p className="mt-3 max-w-[40ch] text-[19px] leading-snug text-[var(--text-2)]">
          Attuali a 35€, retro a 40€. Spedizione gratuita, e se ne prendi 3 ne paghi 2.
        </p>
      </header>
      <LeagueRail />

      <ProductRail title="Novità 26/27" href="/shop/2026/27" products={rail(products2627)} priorityFirst />
      <ProductRail title="Scelte per te" href="/shop" products={rail(picks)} />
      <OfferTicket />
      <ProductRail title="Maglie retro" href="/shop/retro" products={rail(retroProducts)} />
      <ProductRail title="Ultimi arrivi" href="/shop" products={rail(latestProducts)} />

      <section className="mx-auto max-w-[1280px] space-y-4 px-3 py-10 md:px-6">
        <h2 className="display px-2 text-[clamp(1.9rem,5vw,3rem)]">Cerca per squadra</h2>
        <TeamGroup title="Serie A" href="/shop/serieA">
          <SerieATeamsClient />
        </TeamGroup>
        <TeamGroup title="Premier League" href="/shop/premier-league">
          <PremierLeagueClient />
        </TeamGroup>
        <TeamGroup title="Nazionali" href="/shop/worldcup">
          <NazionaliSection />
        </TeamGroup>
      </section>

      <FAQ />
    </div>
  );
}
