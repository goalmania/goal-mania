"use client";

import { useState, useEffect, useRef } from "react";
import { X, Share2, Copy, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface SocialSharePanelProps {
  article: {
    title: string;
    summary: string;
    slug: string;
    image?: string;
    category?: string;
  };
  onClose: () => void;
}

const BASE_URL = "https://goal-mania.it";
const FB_PAGE_URL = "https://www.facebook.com/61574373393356";

const HASHTAGS: Record<string, string> = {
  serieA:             "#SerieA #Calcio #GoalMania",
  transferMarket:     "#Calciomercato #Mercato #GoalMania",
  news:               "#Calcio #Football #GoalMania",
  internationalTeams: "#Mondiali #Calcio #GoalMania",
};

function defaultHashtags(category?: string): string {
  return HASHTAGS[category ?? "news"] ?? "#Calcio #GoalMania";
}

const CATEGORY_PATH: Record<string, string> = {
  transferMarket:     "transfer",
  serieA:             "serieA",
  internationalTeams: "international",
  news:               "news",
};

function articleUrl(slug: string, category?: string): string {
  const section = CATEGORY_PATH[category ?? "news"] ?? "news";
  return `${BASE_URL}/${section}/${slug}`;
}

function buildFbText(title: string, summary: string, slug: string, category?: string): string {
  const tags = defaultHashtags(category);
  const link = articleUrl(slug, category);
  return `${title}\n\n${summary}\n\n${link}\n\n${tags}`;
}

function buildTweetText(title: string, slug: string, category?: string): string {
  const tags = defaultHashtags(category);
  const link = articleUrl(slug, category);
  const base = `${title} ${link} ${tags}`;
  return base.length <= 280 ? base : base.slice(0, 277) + "...";
}

export default function SocialSharePanel({ article, onClose }: SocialSharePanelProps) {
  const [fbText, setFbText] = useState("");
  const [twText, setTwText] = useState("");
  const [fbCopied, setFbCopied] = useState(false);
  const [twOpened, setTwOpened] = useState(false);
  const fbTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const twTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setFbText(buildFbText(article.title, article.summary, article.slug, article.category));
    setTwText(buildTweetText(article.title, article.slug, article.category));
  }, [article]);

  useEffect(() => () => {
    if (fbTimer.current) clearTimeout(fbTimer.current);
    if (twTimer.current) clearTimeout(twTimer.current);
  }, []);

  const copyFbText = async () => {
    try {
      await navigator.clipboard.writeText(fbText);
      setFbCopied(true);
      if (fbTimer.current) clearTimeout(fbTimer.current);
      fbTimer.current = setTimeout(() => setFbCopied(false), 2500);
    } catch { /* silent */ }
  };

  const openTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(twText)}`,
      "_blank",
      "noopener,noreferrer"
    );
    setTwOpened(true);
    if (twTimer.current) clearTimeout(twTimer.current);
    twTimer.current = setTimeout(() => setTwOpened(false), 3000);
  };

  const isOver280 = twText.length > 280;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden"
        style={{ background: "#111", borderColor: "rgba(255,255,255,0.1)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-2.5">
            <Share2 size={16} style={{ color: "#c8f000" }} />
            <span
              className="text-sm font-black uppercase tracking-widest text-white"
              style={{ fontFamily: "var(--font-mono, monospace)" }}
            >
              Condividi articolo
            </span>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Article preview */}
        <div
          className="mx-5 mt-4 mb-2 px-3 py-2.5 rounded-lg flex items-center gap-3"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {article.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={article.image} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
          )}
          <p className="text-white/80 text-xs leading-snug line-clamp-2">{article.title}</p>
        </div>

        <div className="px-5 py-4 space-y-5">

          {/* ── Facebook ── */}
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center gap-2">
              <span style={{ color: "#1877F2" }}><FacebookIcon /></span>
              <span className="text-sm font-bold text-white">Facebook</span>
            </div>

            <Textarea
              value={fbText}
              onChange={(e) => setFbText(e.target.value)}
              rows={4}
              className="text-xs resize-none bg-black/20 border-white/10 text-white/80 placeholder-white/20"
              placeholder="Testo del post..."
            />

            <div className="flex items-center gap-2">
              <button
                onClick={copyFbText}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all border"
                style={{
                  borderColor: fbCopied ? "rgba(52,211,153,0.5)" : "rgba(255,255,255,0.15)",
                  color: fbCopied ? "#34d399" : "rgba(255,255,255,0.7)",
                  background: fbCopied ? "rgba(52,211,153,0.08)" : "transparent",
                }}
              >
                {fbCopied ? <><CheckCircle2 size={11} /> Copiato!</> : <><Copy size={11} /> Copia testo</>}
              </button>

              <a
                href={FB_PAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest"
                style={{ background: "#1877F2", color: "#fff", fontFamily: "var(--font-mono, monospace)" }}
              >
                <ExternalLink size={11} /> Apri pagina
              </a>
            </div>
            <p className="text-[10px] text-white/25">Copia il testo → apri la pagina → crea nuovo post → incolla.</p>
          </div>

          {/* ── Twitter / X ── */}
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center gap-2">
              <span style={{ color: "#fff" }}><XIcon /></span>
              <span className="text-sm font-bold text-white">X (Twitter)</span>
            </div>

            <Textarea
              value={twText}
              onChange={(e) => setTwText(e.target.value)}
              rows={3}
              className="text-xs resize-none bg-black/20 border-white/10 text-white/80 placeholder-white/20"
              placeholder="Testo del tweet..."
            />

            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-mono ${isOver280 ? "text-red-400" : "text-white/30"}`}>
                {twText.length}/280
              </span>

              <button
                onClick={openTwitter}
                disabled={isOver280 || !twText.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all disabled:opacity-40"
                style={{
                  background: twOpened ? "rgba(200,240,0,0.5)" : "#c8f000",
                  color: "#0a0a0a",
                  fontFamily: "var(--font-mono, monospace)",
                }}
              >
                {twOpened
                  ? <><CheckCircle2 size={11} /> Aperto!</>
                  : <><ExternalLink size={11} /> Pubblica su X</>
                }
              </button>
            </div>
            <p className="text-[10px] text-white/25">Apre X con il testo precompilato — clicca Tweet per pubblicare.</p>
          </div>

        </div>

        <div
          className="px-5 py-3 border-t flex justify-end"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white/40 hover:text-white text-xs">
            Chiudi
          </Button>
        </div>
      </div>
    </div>
  );
}

function FacebookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}
