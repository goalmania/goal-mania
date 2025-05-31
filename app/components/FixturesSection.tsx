"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

interface FixturesSectionProps {
  league: string;
}

// Dynamic import with no SSR
const UpcomingFixtures = dynamic(
  () => import("@/app/components/UpcomingFixtures"),
  { ssr: false }
);

export default function FixturesSection({ league }: FixturesSectionProps) {
  return (
    <Suspense fallback={<FixturesLoading />}>
      <UpcomingFixtures league={league} />
    </Suspense>
  );
}

function FixturesLoading() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-gray-100 animate-pulse h-16 rounded-lg"
        ></div>
      ))}
    </div>
  );
}
