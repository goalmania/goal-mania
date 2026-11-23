import Link from "next/link";

// Altezza fissa: letta anche dal layout (var --bar-h in globals.css = 36px)
export const ANNOUNCEMENT_BAR_HEIGHT = 36;

// Statica: nessun JavaScript, nessuna scorrimento da leggere in corsa.
export default function AnnouncementBar() {
  return (
    <div
      className="fixed inset-x-0 top-0 z-[70] flex items-center justify-center bg-[#c8f000] px-3 text-[#0a0a0a]"
      style={{ height: ANNOUNCEMENT_BAR_HEIGHT }}
    >
      <Link
        href="/shop"
        className="truncate text-[13px] font-extrabold uppercase tracking-[0.06em]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        <span className="hidden sm:inline">Black Friday · </span>
        Prendi 3, ne paghi 2
        <span className="mx-2 opacity-40">/</span>
        Spedizione gratuita
        <span className="hidden md:inline">
          <span className="mx-2 opacity-40">/</span>
          Reso entro 14 giorni
        </span>
      </Link>
    </div>
  );
}
