"use client";

import { useState } from "react";
import { Star, ThumbsUp, ThumbsDown, BadgeCheck, PenLine } from "lucide-react";

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  verified: boolean;
  helpful: number;
  notHelpful: number;
}

interface ProductReviewsSectionProps {
  productName?: string;
  reviews?: Review[];
  averageRating?: number;
  totalReviews?: number;
}

const DEFAULT_REVIEWS: Review[] = [
  {
    id: "1",
    author: "Marco B.",
    rating: 5,
    date: "12 Mag 2026",
    text: "Maglia perfetta, qualità eccellente! Il tessuto è leggero e traspirante, identica a quella originale. Spedizione super veloce, arrivata in 3 giorni. Consigliatissima!",
    verified: true,
    helpful: 47,
    notHelpful: 2,
  },
  {
    id: "2",
    author: "Giulia R.",
    rating: 5,
    date: "28 Apr 2026",
    text: "Ho ordinato la personalizzazione con nome e numero e il risultato è stupendo. Stampa precisa, colori vivaci. Mio figlio è contentissimo. Sicuramente acquisterò ancora.",
    verified: true,
    helpful: 31,
    notHelpful: 0,
  },
  {
    id: "3",
    author: "Luca M.",
    rating: 4,
    date: "10 Apr 2026",
    text: "Ottima maglia, molto fedele all'originale. Taglia leggermente larga, consiglio di prendere una taglia in meno se siete tra le due. Qualità del materiale ottima.",
    verified: true,
    helpful: 22,
    notHelpful: 3,
  },
];

const RATING_BREAKDOWN = [
  { stars: 5, pct: 78 },
  { stars: 4, pct: 14 },
  { stars: 3, pct: 5 },
  { stars: 2, pct: 2 },
  { stars: 1, pct: 1 },
];

function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          fill={s <= rating ? "#c8f000" : "none"}
          color={s <= rating ? "#c8f000" : "#333"}
        />
      ))}
    </div>
  );
}

export default function ProductReviewsSection({
  productName,
  reviews = DEFAULT_REVIEWS,
  averageRating = 4.8,
  totalReviews = 247,
}: ProductReviewsSectionProps) {
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, "up" | "down" | null>>({});

  const handleVote = (reviewId: string, vote: "up" | "down") => {
    setHelpfulVotes((prev) => ({
      ...prev,
      [reviewId]: prev[reviewId] === vote ? null : vote,
    }));
  };

  return (
    <div className="space-y-8">
      {/* Overall rating summary */}
      <div
        className="rounded-2xl p-6"
        style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Big number */}
          <div className="text-center min-w-[100px]">
            <p
              className="text-6xl font-black text-white leading-none"
              style={{ fontFamily: "var(--font-display, sans-serif)" }}
            >
              {averageRating.toFixed(1)}
            </p>
            <StarDisplay rating={Math.round(averageRating)} size={16} />
            <p
              className="text-[10px] text-white/40 mt-1"
              style={{ fontFamily: "var(--font-mono, monospace)" }}
            >
              {totalReviews} recensioni
            </p>
          </div>

          {/* Bar breakdown */}
          <div className="flex-1 w-full space-y-2">
            {RATING_BREAKDOWN.map(({ stars, pct }) => (
              <div key={stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 min-w-[60px]">
                  <span className="text-[11px] font-bold text-white/60">{stars}</span>
                  <Star size={10} fill="#c8f000" color="#c8f000" />
                </div>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: "#c8f000" }}
                  />
                </div>
                <span
                  className="text-[10px] text-white/30 min-w-[28px] text-right"
                  style={{ fontFamily: "var(--font-mono, monospace)" }}
                >
                  {pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Individual reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-2xl p-5 space-y-3 transition-all hover:border-white/12"
            style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {/* Review header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Avatar placeholder */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm"
                  style={{ background: "rgba(200,240,0,0.12)", color: "#c8f000" }}
                >
                  {review.author.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white">{review.author}</span>
                    {review.verified && (
                      <span
                        className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{
                          background: "rgba(200,240,0,0.1)",
                          color: "#c8f000",
                          fontFamily: "var(--font-mono, monospace)",
                          border: "1px solid rgba(200,240,0,0.2)",
                        }}
                      >
                        <BadgeCheck size={9} />
                        Acquisto Verificato
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-white/30 mt-0.5" style={{ fontFamily: "var(--font-mono, monospace)" }}>
                    {review.date}
                  </p>
                </div>
              </div>
              <StarDisplay rating={review.rating} size={12} />
            </div>

            {/* Review text */}
            <p className="text-sm text-white/65 leading-relaxed">{review.text}</p>

            {/* Helpful/Not helpful */}
            <div className="flex items-center gap-4 pt-1">
              <span className="text-[10px] text-white/30" style={{ fontFamily: "var(--font-mono, monospace)" }}>
                Utile?
              </span>
              <button
                onClick={() => handleVote(review.id, "up")}
                className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full transition-all ${
                  helpfulVotes[review.id] === "up"
                    ? "text-[#c8f000] border-[#c8f000]/40"
                    : "text-white/40 border-white/10 hover:text-white/60"
                }`}
                style={{ border: "1px solid" }}
              >
                <ThumbsUp size={10} />
                {review.helpful + (helpfulVotes[review.id] === "up" ? 1 : 0)}
              </button>
              <button
                onClick={() => handleVote(review.id, "down")}
                className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full transition-all ${
                  helpfulVotes[review.id] === "down"
                    ? "text-red-400 border-red-400/40"
                    : "text-white/40 border-white/10 hover:text-white/60"
                }`}
                style={{ border: "1px solid" }}
              >
                <ThumbsDown size={10} />
                {review.notHelpful + (helpfulVotes[review.id] === "down" ? 1 : 0)}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Write review CTA */}
      <div className="text-center py-4">
        <button
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-black uppercase text-black transition-all hover:opacity-90 hover:-translate-y-0.5 text-sm"
          style={{
            background: "#c8f000",
            fontFamily: "var(--font-display, sans-serif)",
            letterSpacing: "1px",
            boxShadow: "0 8px 24px rgba(200,240,0,0.2)",
          }}
        >
          <PenLine size={14} />
          Scrivi una Recensione
        </button>
        <p className="text-[10px] text-white/30 mt-3" style={{ fontFamily: "var(--font-mono, monospace)" }}>
          Solo acquirenti verificati possono lasciare una recensione
        </p>
      </div>
    </div>
  );
}
