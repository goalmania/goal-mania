import { Suspense } from "react";
import LiveFootballMatches from "./LiveFootballMatches";

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
