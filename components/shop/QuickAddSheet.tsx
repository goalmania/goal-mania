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

// Aggiunta in due tocchi: scegli la taglia e la maglia e nel carrello, senza aprire la scheda.
export default function QuickAddSheet({ open, onClose, product }: Props) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [sizes, setSizes] = useState<{ adult: string[]; kids: string[] } | null>(null);
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
    if (!sizes) {
      fetch(`/api/products/${product.id}`)
        .then((r) => r.json())
        .then((p) => {
          if (!alive) return;
          setSizes({ adult: p.adultSizes?.length ? p.adultSizes : ["S", "M", "L", "XL", "XXL"], kids: p.kidsSizes || [] });
        })
        .catch(() => alive && setSizes({ adult: ["S", "M", "L", "XL", "XXL"], kids: [] }));
    }
    return () => {
      alive = false;
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;
  const list = sizes ? (kid ? sizes.kids : sizes.adult) : [];

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
    const n = useCartStore.getState().getItemCount();
    const hint = threeForTwoHint(n);
    onClose();
    toast.custom(
      (t) => (
        <div
          className={`cut cut-sm w-[min(92vw,380px)] bg-[#c8f000] p-4 text-[#0a0a0a] transition-opacity ${t.visible ? "opacity-100" : "opacity-0"}`}
          role="status"
        >
          <p className="display text-[22px]">Nel carrello</p>
          <p className="mt-1 text-[15px] font-semibold leading-snug">{hint.text}</p>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              router.push("/cart");
            }}
            className="mt-3 h-11 w-full bg-[#0a0a0a] text-[15px] font-extrabold uppercase tracking-wide text-[#c8f000]"
            style={{ fontFamily: "var(--font-display)" }}
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
      <button className="absolute inset-0 bg-black/70" onClick={onClose} aria-label="Chiudi" />
      <div className="cut cut-lg relative w-full max-w-[460px] bg-[#121211] p-5 pb-[calc(20px+env(safe-area-inset-bottom))] md:pb-5">
        <button onClick={onClose} className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center text-white" aria-label="Chiudi">
          <X className="h-6 w-6" />
        </button>
        <div className="flex gap-4 pr-10">
          <div className="h-[88px] w-[72px] shrink-0 bg-[#f1f1ec]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cld(product.image, 160)} alt="" className="h-full w-full object-contain p-1" style={{ mixBlendMode: "multiply" }} />
          </div>
          <div className="min-w-0">
            <p className="display text-[22px] leading-none text-white">{product.name.replace(/^Maglia\s+/i, "")}</p>
            <p className="num mt-2 text-[34px] text-[#c8f000]">{product.price}€</p>
          </div>
        </div>

        {sizes && sizes.kids.length > 0 && (
          <div className="mt-5 flex gap-2" role="tablist">
            {[
              { k: false, l: "Adulto" },
              { k: true, l: "Bambino" },
            ].map((t) => (
              <button
                key={t.l}
                role="tab"
                aria-selected={kid === t.k}
                onClick={() => {
                  setKid(t.k);
                  setSize("");
                }}
                className={`h-11 flex-1 text-[16px] font-extrabold uppercase ${kid === t.k ? "bg-white text-[#0a0a0a]" : "bg-white/10 text-white"}`}
                style={{ fontFamily: "var(--font-display)" }}
              >
                {t.l}
              </button>
            ))}
          </div>
        )}

        <p className="mt-5 text-[14px] font-bold uppercase tracking-wider text-white/70" style={{ fontFamily: "var(--font-display)" }}>
          Taglia
        </p>
        <div className="mt-2 flex min-h-[52px] flex-wrap gap-2">
          {!sizes && <p className="text-[15px] text-white/60">Carico le taglie…</p>}
          {list.map((s) => (
            <button
              key={s}
              onClick={() => {
                setSize(s);
                setError("");
              }}
              aria-pressed={size === s}
              className={`h-[52px] min-w-[56px] px-3 text-[20px] font-extrabold transition-colors active:scale-[0.97] ${size === s ? "bg-[#c8f000] text-[#0a0a0a]" : "border-2 border-white/35 text-white hover:border-white"}`}
              style={{ fontFamily: "var(--font-display)" }}
            >
              {s}
            </button>
          ))}
        </div>
        {error && <p className="mt-2 text-[15px] font-bold text-[#ff6b6b]" role="alert">{error}</p>}

        <button
          onClick={confirm}
          className="cut mt-5 flex h-14 w-full items-center justify-center bg-[#c8f000] text-[19px] font-extrabold uppercase tracking-wide text-[#0a0a0a] transition-colors hover:bg-[#d8ff1a] active:bg-[#b5d800]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Aggiungi al carrello
        </button>
        <Link href={`/products/${product.slug || product.id}`} className="mt-3 flex min-h-[44px] items-center justify-center text-[15px] font-semibold text-white/75 underline underline-offset-4 hover:text-[#c8f000]">
          Vuoi nome e numero? Personalizza nella scheda
        </Link>
      </div>
    </div>
  );
}
