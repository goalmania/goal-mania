"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamic import with no SSR is allowed in a client component
const LiveFootballMatches = dynamic(
  () => import("@/app/components/LiveFootballMatches"),
  { ssr: false }
);

export default function LiveMatchesSection() {
  return (
    <Suspense fallback={<LiveMatchesLoading />}>
      <LiveFootballMatches />
    </Suspense>
  );
}

function LiveMatchesLoading() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-gray-100 animate-pulse h-24 rounded-lg"
        ></div>
      ))}
    </div>
  );
}
