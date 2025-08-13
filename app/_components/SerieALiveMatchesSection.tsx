import { Suspense } from "react";
import SerieALiveMatches from "./SerieALiveMatches";

export default function SerieALiveMatchesSection() {
  return (
    <Suspense fallback={<SerieALiveMatchesLoading />}>
      <SerieALiveMatches />
    </Suspense>
  );
}

function SerieALiveMatchesLoading() {
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
