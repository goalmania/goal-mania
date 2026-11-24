import Link from "next/link";
import Image from "next/image";
import AutoRail from "@/components/ui/AutoRail";

type Team = { name: string; logo: string; href: string };
const L = (s: string) => `/team-logos/${s}.png`;

// Prima le squadre di Serie A, poi i top club europei. Ogni logo porta alla pagina con le maglie di quella squadra.
const SERIE_A: Team[] = [
  { name: "Inter", logo: L("inter"), href: "/shop/serieA/inter" },
  { name: "Milan", logo: L("milan"), href: "/shop/serieA/milan" },
  { name: "Juventus", logo: L("juventus"), href: "/shop/serieA/juventus" },
  { name: "Napoli", logo: L("napoli"), href: "/shop/serieA/napoli" },
  { name: "Roma", logo: L("roma"), href: "/shop/serieA/roma" },
  { name: "Lazio", logo: L("lazio"), href: "/shop/serieA/lazio" },
  { name: "Atalanta", logo: L("atalanta"), href: "/shop/serieA/atalanta" },
  { name: "Fiorentina", logo: L("fiorentina"), href: "/shop/serieA/fiorentina" },
  { name: "Bologna", logo: L("bologna"), href: "/shop/serieA/bologna" },
  { name: "Torino", logo: L("torino"), href: "/shop/serieA/torino" },
];

const EUROPA: Team[] = [
  { name: "Real Madrid", logo: L("real-madrid"), href: "/shop/international/real-madrid" },
  { name: "Barcellona", logo: L("barcelona"), href: "/shop/international/barcelona" },
  { name: "PSG", logo: L("psg"), href: "/shop/international/psg" },
  { name: "Bayern", logo: L("bayern"), href: "/shop/international/bayern" },
  { name: "Atlético", logo: L("atletico"), href: "/shop/international/atletico" },
  { name: "Dortmund", logo: L("dortmund"), href: "/shop/international/dortmund" },
  { name: "Liverpool", logo: L("liverpool"), href: "/shop/premier-league/liverpool" },
  { name: "Man City", logo: L("man-city"), href: "/shop/premier-league/manchester-city" },
  { name: "Arsenal", logo: L("arsenal"), href: "/shop/premier-league/arsenal" },
  { name: "Chelsea", logo: L("chelsea"), href: "/shop/premier-league/chelsea" },
  { name: "Man United", logo: L("man-utd"), href: "/shop/premier-league/manchester-united" },
  { name: "Tottenham", logo: L("tottenham"), href: "/shop/premier-league/tottenham" },
];

function Item({ t }: { t: Team }) {
  return (
    <Link href={t.href} draggable={false} className="group flex w-[104px] shrink-0 flex-col items-center gap-2.5 sm:w-[120px]" aria-label={`Maglie ${t.name}`}>
      <span className="flex h-[92px] w-[92px] items-center justify-center rounded-full bg-[var(--paper)] shadow-[0_12px_20px_-12px_rgba(0,0,0,0.8)] transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:scale-105 sm:h-[104px] sm:w-[104px]">
        <Image src={t.logo} alt="" width={64} height={64} draggable={false} className="h-[62px] w-[62px] object-contain sm:h-[70px] sm:w-[70px]" />
      </span>
      <span className="text-center text-[15px] font-semibold leading-tight text-white transition-colors group-hover:text-[var(--lime)]">{t.name}</span>
    </Link>
  );
}

function Label({ children }: { children: string }) {
  return (
    <span className="flex shrink-0 items-center self-stretch px-2" aria-hidden="true">
      <span className="disp -rotate-90 whitespace-nowrap text-[26px] text-[var(--lime)]">{children}</span>
    </span>
  );
}

export default function TeamLogoRail() {
  return (
    <section aria-labelledby="teams-h" className="pb-10 md:pb-14">
      <div className="mx-auto mb-4 w-full max-w-[1760px] px-5 md:px-10 lg:px-16">
        <h2 id="teams-h" className="disp text-[clamp(2rem,4.6vw,3.8rem)] text-white">Cerchi la tua squadra?</h2>
        <p className="mt-2 text-[17px] italic text-[var(--text-2)]">Tocca lo stemma e vedi tutte le sue maglie.</p>
      </div>
      <AutoRail label="Squadre" speed={36}>
        <Label>Serie A</Label>
        {SERIE_A.map((t) => <Item key={t.href} t={t} />)}
        <Label>Europa</Label>
        {EUROPA.map((t) => <Item key={t.href} t={t} />)}
      </AutoRail>
    </section>
  );
}
