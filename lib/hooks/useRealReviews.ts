"use client";

import { useEffect, useState } from "react";

export interface RealReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  productName?: string;
  productImage?: string;
  createdAt: string;
}

// Fetches genuine customer reviews only (from /api/all-reviews, backed by
// real review submissions). Returns an empty array — never fabricated
// placeholder data — until real reviews exist.
export function useRealReviews() {
  const [reviews, setReviews] = useState<RealReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/all-reviews")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !Array.isArray(data)) return;
        setReviews(
          data
            .filter((r: any) => r && r.rating >= 4 && r.comment)
            .map((r: any) => ({
              id: r.id,
              userName: r.userName || r.name || "Cliente",
              rating: r.rating,
              comment: r.comment,
              productName: r.productName,
              productImage: r.productImage,
              createdAt: r.createdAt,
            }))
        );
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { reviews, loading };
}
