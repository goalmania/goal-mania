"use client";

import { useState } from "react";
import { NewsArticle } from "@/types/news";
import ArticleCard from "@/components/news/ArticleCard";

interface Props {
  articles: NewsArticle[];
}

const CATEGORIES = [
  { id: "all", label: "Tutto" },
  { id: "news", label: "News" },
  { id: "serieA", label: "Serie A" },
  { id: "transferMarket", label: "Calciomercato" },
  { id: "internationalTeams", label: "Nazionale" },
];

export default function NewsCategoryTabsClient({ articles }: Props) {
  const [active, setActive] = useState("all");

  const counts: Record<string, number> = { all: articles.length };
  for (const art of articles) {
    counts[art.category] = (counts[art.category] || 0) + 1;
  }

  const filtered = active === "all" ? articles : articles.filter((a) => a.category === active);

  return (
    <div>
      {/* Category tabs */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        {CATEGORIES.map((cat) => {
          const count = counts[cat.id] || 0;
          if (cat.id !== "all" && count === 0) return null;
          const isActive = active === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200"
              style={{
                fontFamily: "var(--font-display, sans-serif)",
                letterSpacing: "1.5px",
                background: isActive ? "#c8f000" : "rgba(255,255,255,0.04)",
                color: isActive ? "#0a0a0a" : "rgba(255,255,255,0.4)",
                border: isActive ? "1px solid #c8f000" : "1px solid rgba(255,255,255,0.08)",
                boxShadow: isActive ? "0 4px 16px rgba(200,240,0,0.2)" : "none",
              }}
            >
              {cat.label}
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full font-black"
                style={{
                  background: isActive ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.08)",
                  color: isActive ? "#0a0a0a" : "rgba(255,255,255,0.3)",
                  fontFamily: "var(--font-mono, monospace)",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Article grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.slice(0, 9).map((art, i) => (
            <ArticleCard key={art.slug} article={art} variant="standard" priority={i === 0} />
          ))}
        </div>
      ) : (
        <p
          className="text-center py-8 text-xs uppercase tracking-widest"
          style={{ fontFamily: "var(--font-mono, monospace)", color: "#444" }}
        >
          Nessun articolo in questa categoria
        </p>
      )}
    </div>
  );
}
