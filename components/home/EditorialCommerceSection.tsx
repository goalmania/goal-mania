"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingBag, Tag } from "lucide-react";
import { Article, Product } from "@/lib/types/home";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").slice(0, 120).trim() + "…";
}

function articleHref(article: Article) {
  const cat = article.category === "transferMarket" ? "transfer" : article.category;
  return `/${cat}/${article.slug}`;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(price);
}

// ─────────────────────────────────────────────────────────────
// NewsCard
// ─────────────────────────────────────────────────────────────

function NewsCard({ article }: { article: Article }) {
  return (
    <Link
      href={articleHref(article)}
      className="group gm-card flex flex-col overflow-hidden rounded-2xl h-full"
      style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Image */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover gm-product-img"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(10,10,10,0.85) 100%)" }}
        />
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest"
            style={{
              background: "rgba(200,240,0,0.15)",
              border: "1px solid rgba(200,240,0,0.3)",
              color: "#c8f000",
              fontFamily: "var(--font-mono, monospace)",
            }}
          >
            <Tag size={8} />
            {article.category === "transferMarket" ? "Mercato" : article.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-5 flex-1">
        <h3
          className="font-black uppercase leading-tight text-white line-clamp-2"
          style={{
            fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
            fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
            letterSpacing: "0.5px",
          }}
        >
          {article.title}
        </h3>
        <p className="text-white/50 text-sm leading-relaxed line-clamp-2 flex-1" style={{ fontFamily: "var(--font-body, sans-serif)" }}>
          {article.summary || stripHtml(article.content)}
        </p>
        <div
          className="flex items-center gap-1.5 mt-auto"
          style={{ color: "#c8f000", fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase" }}
        >
          Leggi
          <ArrowRight
            size={12}
            className="transition-transform duration-200 group-hover:translate-x-1"
            style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
          />
        </div>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────
// ProductCard
// ─────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group gm-product-card flex flex-col overflow-hidden rounded-2xl h-full"
      style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Image — 4:5 aspect ratio */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/5" }}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover gm-product-img"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, transparent 60%, rgba(10,10,10,0.9) 100%)" }}
        />
        {/* Hover overlay CTA */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100"
          style={{ transition: "opacity 200ms cubic-bezier(0.23, 1, 0.32, 1)", background: "rgba(0,0,0,0.35)" }}
        >
          <span
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-black uppercase text-xs"
            style={{
              background: "#c8f000",
              color: "#0a0a0a",
              fontFamily: "var(--font-display, sans-serif)",
              letterSpacing: "2px",
              transform: "translateY(4px)",
              transition: "transform 200ms cubic-bezier(0.23, 1, 0.32, 1)",
            }}
          >
            <ShoppingBag size={14} />
            Vedi Maglia
          </span>
        </div>
        {/* Team label */}
        {product.team && (
          <div className="absolute top-3 left-3">
            <span
              className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.8)",
                fontFamily: "var(--font-mono, monospace)",
              }}
            >
              {product.team}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1.5">
        <h3
          className="font-black uppercase text-white line-clamp-1 leading-tight"
          style={{
            fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
            fontSize: "1rem",
            letterSpacing: "0.5px",
          }}
        >
          {product.name}
        </h3>
        <div className="flex items-baseline justify-between gap-2 mt-1">
          <span
            className="font-black text-xl"
            style={{ fontFamily: "var(--font-display, sans-serif)", color: "#c8f000" }}
          >
            {formatPrice(product.price)}
          </span>
          <span
            className="text-[9px] uppercase tracking-widest"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.3)" }}
          >
            {product.category}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────
// EditorialCommerceSection — main export
// ─────────────────────────────────────────────────────────────

interface Props {
  articles: Article[];
  products: Product[];
}

export default function EditorialCommerceSection({ articles, products }: Props) {
  if (!articles.length && !products.length) return null;

  // Build alternating pairs: [article, product, article, product, ...]
  // Max 3 pairs to keep the section tight
  const pairs = Array.from({ length: Math.min(3, Math.max(articles.length, products.length)) }, (_, i) => ({
    article: articles[i] ?? null,
    product: products[i] ?? null,
  }));

  return (
    <section className="py-16 md:py-24" style={{ background: "#0a0a0a" }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

        {/* Section header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-6 h-[1.5px] rounded-full" style={{ background: "#c8f000" }} />
              <span
                className="text-[10px] uppercase tracking-[4px] font-bold"
                style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.7)" }}
              >
                // News & Shop
              </span>
            </div>
            <h2
              className="font-black uppercase leading-none text-white"
              style={{
                fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                letterSpacing: "1px",
              }}
            >
              Calcio &amp; <span style={{ color: "#c8f000" }}>Stile</span>
            </h2>
            <p className="text-white/40 text-sm mt-2 max-w-md" style={{ fontFamily: "var(--font-body, sans-serif)" }}>
              Notizie fresche affiancate alla maglia della squadra protagonista.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/news"
              className="gm-btn gm-btn-secondary px-5 py-2.5 rounded-full text-xs font-black uppercase"
              style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "2px" }}
            >
              Tutte le News
            </Link>
            <Link
              href="/shop"
              className="gm-btn gm-btn-primary px-5 py-2.5 rounded-full text-xs font-black uppercase"
              style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "2px" }}
            >
              Shop
            </Link>
          </div>
        </div>

        {/* Pairs */}
        <div className="flex flex-col gap-8">
          {pairs.map(({ article, product }, i) => (
            <div
              key={i}
              className={`grid gap-4 md:gap-6 items-stretch ${
                i % 2 === 0
                  ? "grid-cols-1 md:grid-cols-[3fr_2fr]"
                  : "grid-cols-1 md:grid-cols-[2fr_3fr]"
              }`}
            >
              {/* Even rows: news left, product right. Odd: product left, news right */}
              {i % 2 === 0 ? (
                <>
                  {article && <NewsCard article={article} />}
                  {product && <ProductCard product={product} />}
                </>
              ) : (
                <>
                  {product && <ProductCard product={product} />}
                  {article && <NewsCard article={article} />}
                </>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
