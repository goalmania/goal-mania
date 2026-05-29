export default function Loading() {
  return (
    <div className="min-h-screen bg-[#070707] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: "rgba(200,240,0,0.2)", borderTopColor: "#c8f000" }}
        />
        <span
          className="text-[10px] uppercase tracking-[4px]"
          style={{ fontFamily: "var(--font-mono,monospace)", color: "rgba(200,240,0,0.4)" }}
        >
          Caricamento
        </span>
      </div>
    </div>
  );
}
