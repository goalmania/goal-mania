"use client";

import dynamic from "next/dynamic";

const AnalyticsTracker = dynamic(
  () => import("@/components/analytics/AnalyticsTracker"),
  { ssr: false }
);

export default function AnalyticsTrackerLoader() {
  return <AnalyticsTracker />;
}
