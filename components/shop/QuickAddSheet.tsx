"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { cld } from "@/lib/utils/cloudinary";
import { threeForTwoHint } from "@/lib/utils/threeForTwo";

interface Props {
  open: boolean;
  onClose: () => void;
  product: { id: string; slug?: string; name: string; price: number; image: string; category?: string };
}

// Pannello che sale dal basso (come su iOS): scegli la taglia, la maglia e nel carrello, senza aprire la scheda.
export default function QuickAddSheet({ open, onClose, product }: Props) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [sizes, setSizes] = useState<{ adult: string[]; kids: string[] }>({ adult: ["S", "M", "L", "XL", "XXL"], kids: [] });
  const [loaded, setLoaded] = useState(false);
  const [kid, setKid] = useState(false);
  const [size, setSize] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setSize("");
    setError("");
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    let alive = true;
    if (!loaded) {
      fetch(`/api/products/${product.id}`)
        .then((r) => r.json())
        .then((p) => {
          if (!alive) return;
          setSizes({ adult: p.adultSizes?.length ? p.adultSizes : ["S", "M", "L", "XL", "XXL"], kids: p.kidsSizes || [] });
          setLoaded(true);
        })
        .catch(() => undefined);
    }
    return () => {
      alive = false;
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;
  const list = kid ? sizes.kids : sizes.adult;
  const inCart = useCartStore.getState().getItemCount();
  const next = threeForTwoHint(inCart + 1);

  const confirm = () => {
    if (!size) {
      setError("Scegli la taglia");
      return;
    }
    addItem({
      id: `${product.id}_${kid ? "k" : "a"}${size}`,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      customization: {
        name: "",
        number: "",
        selectedPatches: [],
        includeShorts: false,
        includeSocks: false,
        hasLongSleeve: false,
        isPlayerEdition: false,
        size,
        isKidSize: kid,
        hasCustomization: false,
      },
      quantity: 1,
    });
    const hint = threeForTwoHint(useCartStore.getState().getItemCount());
    onClose();
    toast.custom(
      (t) => (
        <div
          className={`glass-strong w-[min(92vw,380px)] rounded-[26px] p-4 text-white transition-all duration-300 ${t.visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`}
          role="status"
        >
          <p className="font-[family-name:var(--font-display)] text-[26px] italic uppercase text-[var(--lime)]">Nel carrello</p>
          <p className="mt-0.5 text-[15px] text-[var(--text-2)]">{hint.text}</p>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              router.push("/cart");
            }}
            className="btn btn-lime mt-3 !h-12 w-full !text-[19px]"
          >
            Vai al carrello
          </button>
        </div>
      ),
      { duration: 5000, position: "top-center" }
    );
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center md:items-center" role="dialog" aria-modal="true" aria-label={`Scegli la taglia, ${product.name}`}>
      <button className="fade-in absolute inset-0 bg-black/75" onClick={onClose} aria-label="Chiudi" />
      <div className="sheet-up relative w-full max-w-[500px] rounded-t-[28px] bg-[var(--wall)] p-5 pb-[calc(20px+env(safe-area-inset-bottom))] shadow-[inset_0_0_0_1px_var(--line)] md:rounded-[28px] md:p-6">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-white/25 md:hidden" aria-hidden="true" />
        <button onClick={onClose} className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20" aria-label="Chiudi">
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-4 pr-12">
          <div className="pc-stage !aspect-auto h-[96px] w-[78px] shrink-0 overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cld(product.image, 200)} alt="" className="relative z-[1] h-full w-full object-contain p-1.5" style={{ mixBlendMode: "multiply" }} />
          </div>
          <div className="min-w-0">
            <p className="line-clamp-2 text-[19px] font-semibold leading-tight text-white">{product.name.replace(/^Maglia\s+/i, "")}</p>
            <p className="pc-price mt-1.5 text-[var(--lime)]">{product.price}€</p>
          </div>
        </div>

        {sizes.kids.length > 0 && (
          <div className="mt-5 flex rounded-full bg-[var(--wall-2)] p-1" role="tablist">
            {[{ k: false, l: "Adulto" }, { k: true, l: "Bambino" }].map((t) => (
              <button key={t.l} role="tab" aria-selected={kid === t.k} onClick={() => { setKid(t.k); setSize(""); }} className={`h-11 flex-1 rounded-full text-[16px] font-bold transition-colors ${kid === t.k ? "bg-[var(--lime)] text-[#0a0a0a]" : "text-white"}`}>{t.l}</button>
            ))}
          </div>
        )}

        <p className="mt-5 text-[15px] font-bold text-[var(--text-2)]">Scegli la taglia</p>
        <div className="mt-2 flex min-h-[56px] flex-wrap gap-2">
          {list.map((s) => (
            <button key={s} onClick={() => { setSize(s); setError(""); }} aria-pressed={size === s} className={`h-[54px] min-w-[58px] rounded-2xl px-4 text-[19px] font-bold transition-all duration-150 active:scale-95 ${size === s ? "bg-[var(--lime)] text-[#0a0a0a]" : "text-white shadow-[inset_0_0_0_1.5px_rgba(244,242,234,0.35)] hover:bg-white/10"}`}>{s}</button>
          ))}
        </div>
        {error && <p className="mt-2 text-[16px] font-semibold text-[var(--red)]" role="alert">{error}</p>}

        <p className={`mt-4 rounded-2xl px-4 py-2.5 text-[15px] font-semibold ${next.active ? "bg-[var(--lime)] text-[#0a0a0a]" : "bg-[var(--wall-2)] text-[var(--text-2)]"}`}>{next.active ? "Con questa hai il 3x2: la meno cara è gratis" : next.text}</p>

        <button onClick={confirm} className="btn btn-lime mt-4 w-full">Aggiungi al carrello</button>
        <Link href={`/products/${product.slug || product.id}`} className="mt-1 flex min-h-[48px] items-center justify-center text-[16px] font-semibold text-[var(--text-2)] underline decoration-white/30 underline-offset-4 hover:text-white">
          Nome, numero e patch: personalizza nella scheda
        </Link>
      </div>
    </div>
  );
}
