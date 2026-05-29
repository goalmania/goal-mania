export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Nav skeleton */}
      <div className="h-12 border-b animate-pulse" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }} />

      {/* Grid skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="h-6 w-40 rounded mb-8 animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)", aspectRatio: "3/4" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
