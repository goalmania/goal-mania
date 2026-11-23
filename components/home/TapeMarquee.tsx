// Due nastri incrociati che scorrono in senso opposto: striscione lime e nastro nero. Solo CSS.
const WORDS = ["Goal Mania", "Prendi 3 paghi 2", "35€ le attuali", "40€ le retro", "Spedizione gratuita", "Reso 14 giorni"];

function Strip({ reverse, dark }: { reverse?: boolean; dark?: boolean }) {
  return (
    <div className={`overflow-hidden py-2 ${dark ? "bg-[#0a0a0a] text-[var(--lime)] -rotate-[1.4deg]" : "bg-[var(--lime)] text-[#0a0a0a] rotate-[1.2deg]"}`}>
      <div className="marquee" style={{ ["--dur" as string]: reverse ? "40s" : "34s", animationDirection: reverse ? "reverse" : "normal" }}>
        {[0, 1].map((k) => (
          <p key={k} aria-hidden="true" className="flex shrink-0 items-center gap-6 pr-6 font-[family-name:var(--font-display)] text-[clamp(1.6rem,4.5vw,2.6rem)] italic uppercase leading-none">
            {WORDS.concat(WORDS).map((w, i) => (
              <span key={i} className="flex items-center gap-6">
                {w}
                <span className={`h-2.5 w-2.5 shrink-0 -skew-x-12 ${dark ? "bg-[var(--lime)]" : "bg-[#0a0a0a]"}`} />
              </span>
            ))}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function TapeMarquee() {
  return (
    <div className="relative my-6 overflow-hidden py-5 md:my-10" role="presentation">
      <div className="relative -mx-4">
        <Strip />
        <div className="-mt-9">
          <Strip dark reverse />
        </div>
      </div>
    </div>
  );
}
