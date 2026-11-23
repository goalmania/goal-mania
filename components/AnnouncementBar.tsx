import Link from "next/link";

// Altezza fissa: letta anche dal layout (var --bar-h in globals.css)
export const ANNOUNCEMENT_BAR_HEIGHT = 34;

// Sottile e statica: dice l'offerta, non urla. Nessun JavaScript.
export default function AnnouncementBar() {
  return (
    <div
      className="fixed inset-x-0 top-0 z-[70] flex items-center justify-center bg-[#0c0c0e] px-3 text-[13px] font-medium text-[var(--text-2)]"
      style={{ height: ANNOUNCEMENT_BAR_HEIGHT }}
    >
      <Link href="/shop" className="truncate">
        <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[var(--lime)] align-middle" aria-hidden="true" />
        <span className="hidden sm:inline">Black Friday: </span>
        <b className="font-semibold text-white">prendi 3, ne paghi 2</b>
        <span className="mx-1.5 opacity-50">·</span>
        spedizione gratuita
      </Link>
    </div>
  );
}
