import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import AutoRail from "@/components/ui/AutoRail";

interface NewsItem {
  _id: string;
  slug: string;
  title: string;
  summary?: string;
  image?: string;
  category: string;
  publishedAt?: string;
}

const CATEGORY_LABEL: Record<string, string> = { news: "News", serieA: "Serie A", transferMarket: "Mercato", internationalTeams: "Internazionale" };
const CATEGORY_PATH: Record<string, string> = { news: "news", serieA: "serieA", transferMarket: "transfer", internationalTeams: "international" };

const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "long" }) : "");

// Le ultime notizie: una fila che scorre, ogni scheda porta all'articolo
export default function HomeNewsStrip({ articles, title = "Dal blog", href = "/news" }: { articles: NewsItem[]; title?: string; href?: string }) {
  if (!articles.length) return null;
  return (
    <section className="py-10 md:py-16">
      <div className="mx-auto mb-5 flex w-full max-w-[1760px] items-end justify-between gap-4 px-5 md:px-10 lg:px-16">
        <div>
          <p className="text-[14px] font-bold text-[var(--lime)]">Calcio, mercato e partite</p>
          <h2 className="disp mt-1 text-[clamp(2.6rem,6vw,5rem)] text-white">{title}</h2>
        </div>
        <Link href={href} className="btn btn-glass !h-11 shrink-0 !px-4 !text-[18px]">
          Tutte le notizie <ArrowRight className="h-4 w-4" strokeWidth={3} />
        </Link>
      </div>
      <AutoRail label="Ultime notizie" speed={30}>
        {articles.map((a) => {
          const path = CATEGORY_PATH[a.category] ?? "news";
          return (
            <Link key={a._id} href={`/${path}/${a.slug}`} draggable={false} className="group block w-[74vw] max-w-[340px] shrink-0 overflow-hidden rounded-[20px] bg-[var(--wall)] shadow-[inset_0_0_0_1px_var(--line)] md:w-[340px]">
              <span className="relative block aspect-[16/10] overflow-hidden bg-[var(--wall-2)]">
                {a.image && <Image src={a.image} alt="" fill sizes="340px" draggable={false} className="object-cover transition-transform duration-500 group-hover:scale-[1.05]" />}
                <span className="absolute left-3 top-3 rounded-full bg-[var(--lime)] px-3 py-1 text-[12px] font-bold text-[#0a0a0a]">{CATEGORY_LABEL[a.category] ?? "News"}</span>
              </span>
              <span className="block p-4">
                <span className="line-clamp-3 block text-[19px] font-semibold leading-tight text-white">{a.title}</span>
                {a.publishedAt && <span className="mt-2 block text-[14px] text-[var(--text-3)]">{fmt(a.publishedAt)}</span>}
              </span>
            </Link>
          );
        })}
      </AutoRail>
    </section>
  );
}
