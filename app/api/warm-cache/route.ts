import { NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/utils/baseUrl";

// Key pages and APIs to keep warm. Keep this list short and high-impact.
const PAGE_PATHS: string[] = [
  "/",
  "/shop",
  "/shop/2024/25",
  "/shop/2025/26",
  "/shop/retro",
  "/shop/serieA",
  "/shop/mystery-box",
  "/news",
  "/transfer",
];

const API_PATHS: string[] = [
  "/api/products?feature=true&limit=4",
  "/api/products?category=2025%2F26&limit=8&noPagination=true",
  "/api/products?type=mysteryBox&limit=6&noPagination=true",
];

export async function GET() {
  const baseUrl = getBaseUrl();
  const targets = [
    ...PAGE_PATHS.map((p) => `${baseUrl}${p}`),
    ...API_PATHS.map((p) => `${baseUrl}${p}`),
  ];

  const startedAt = Date.now();

  const results = await Promise.allSettled(
    targets.map(async (url) => {
      const res = await fetch(url, { method: "GET" });
      return { url, status: res.status };
    })
  );

  const ok = results
    .filter((r): r is PromiseFulfilledResult<{ url: string; status: number }> => r.status === "fulfilled")
    .map((r) => r.value);
  const failed = results
    .filter((r): r is PromiseRejectedResult => r.status === "rejected")
    .map((r) => ({ error: String(r.reason) }));

  return NextResponse.json({
    warmed: ok,
    failed,
    durationMs: Date.now() - startedAt,
  });
}


