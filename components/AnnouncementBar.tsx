// Altezza fissa: letta anche dal layout (var --bar-h in globals.css)
export const ANNOUNCEMENT_BAR_HEIGHT = 36;

const ITEMS = ["Black Friday: prendi 3, paghi 2", "Spedizione gratuita", "Reso entro 14 giorni", "Retro a 40€", "Maglie attuali a 35€"];

// Striscione lime che scorre (solo CSS). Si ferma al passaggio del mouse.
export default function AnnouncementBar() {
  return (
    <div className="fixed inset-x-0 top-0 z-[70] overflow-hidden bg-[var(--lime)] text-[#0a0a0a]" style={{ height: ANNOUNCEMENT_BAR_HEIGHT }} role="note">
      <div className="marquee" style={{ ["--dur" as string]: "46s" }}>
        {[0, 1].map((k) => (
          <p key={k} aria-hidden={k === 1} className="flex shrink-0 items-center gap-6 pr-6 font-[family-name:var(--font-display)] text-[17px] italic uppercase leading-[36px]">
            {ITEMS.concat(ITEMS).map((t, i) => (
              <span key={i} className="flex items-center gap-6">
                {t}
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#0a0a0a]" aria-hidden="true" />
              </span>
            ))}
          </p>
        ))}
      </div>
    </div>
  );
}
