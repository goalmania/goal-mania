"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { TrashIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { ShieldCheck, Truck, RotateCcw, Clock, ArrowRight, Trash2, Minus, Plus } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { trackFbq } from "@/lib/utils/fbq";
import { threeForTwoHint } from "@/lib/utils/threeForTwo";

const FREE_SHIPPING_THRESHOLD = 0; // spedizione sempre gratuita

// Barra 3x2: dice quante maglie mancano per averne una gratis (regola reale, attiva al checkout)
function ShippingProgressBar({ count }: { count: number }) {
  const hint = threeForTwoHint(count);
  const filled = count % 3 === 0 ? 3 : count % 3;
  return (
    <div className={`rounded-3xl p-5 ${hint.active ? "bg-[var(--lime)] text-[#0a0a0a]" : "bg-[var(--wall)] text-white shadow-[inset_0_0_0_1px_var(--line)]"}`}>
      <p className="disp text-[clamp(1.6rem,3vw,2.2rem)]">{hint.text}</p>
      <div className="mt-3 grid grid-cols-3 gap-2" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span key={n} className={`h-2.5 rounded-full ${n <= filled ? (hint.active ? "bg-[#0a0a0a]" : "bg-[var(--lime)]") : hint.active ? "bg-[#0a0a0a]/25" : "bg-white/20"}`} />
        ))}
      </div>
      <p className={`mt-2 text-[15px] ${hint.active ? "text-[#0a0a0a]/80" : "text-[var(--text-2)]"}`}>Spedizione gratuita su ogni ordine.</p>
    </div>
  );
}

interface UpsellProduct {
  _id: string;
  title: string;
  basePrice: number;
  images: string[];
  slug: string;
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const { t } = useTranslation();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [upsellProducts, setUpsellProducts] = useState<UpsellProduct[]>([]);
  const router = useRouter();

  // Carica prodotti correlati (escludi quelli già nel carrello)
  useEffect(() => {
    const cartIds = items.map(i => i.id);
    fetch(`/api/products/upsell?exclude=${cartIds.join(",")}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setUpsellProducts(data.slice(0, 2)))
      .catch(() => {});
  }, [items.length]);

  const total = getTotal();

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      // checkout_start viene tracciato in app/checkout/page.tsx quando si
      // raggiunge davvero lo step di pagamento con un PaymentIntent Stripe
      // valido — non qui, altrimenti chi arriva al pagamento verrebbe
      // contato due volte nel funnel.
      trackFbq("InitiateCheckout", {
        value: getTotal(),
        currency: "EUR",
        num_items: items.reduce((n, i) => n + i.quantity, 0),
        content_ids: items.map((i) => i.id),
      });
      router.push("/checkout");
    } catch (error) {
      console.error("Checkout failed:", error);
      toast.error("Failed to proceed to checkout");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const qty = items.reduce((n, i) => n + i.quantity, 0);
  // Stima del 3x2: ogni 3 maglie la meno cara e gratis. Il conto vero lo rifa il server al pagamento.
  const units = items.flatMap((i) => Array.from({ length: i.quantity }, () => Number(i.price))).sort((a, b) => a - b);
  const saving = units.slice(0, Math.floor(units.length / 3)).reduce((a, b) => a + b, 0);
  const eur = (n: number) => `${n.toFixed(2).replace(".", ",")}€`;

  if (items.length === 0) {
    return (
      <div>
        <PageHeader eyebrow="Carrello" title="Il carrello è vuoto" lead="Non hai ancora aggiunto nessuna maglia.">
          <Link href="/shop" className="btn btn-lime">{t("cart.empty.cta")} <ArrowRight className="h-5 w-5" strokeWidth={3} /></Link>
        </PageHeader>
        <div className="h-24" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader eyebrow="Carrello" title={<>Il tuo carrello <span className="mark"><span>{qty}</span></span></>} />
      <div className="mx-auto grid w-full max-w-[1760px] gap-8 px-5 pb-16 md:px-10 lg:grid-cols-[1fr_440px] lg:px-16">
        <div className="space-y-5">
          <ShippingProgressBar count={qty} />

          <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-3xl bg-[var(--wall)] shadow-[inset_0_0_0_1px_var(--line)]">
            {items.map((item) => (
              <li key={item.id} className="flex gap-4 p-4 md:p-5">
                <Link href={`/products/${item.slug || item.id}`} className="pc-stage relative block h-[104px] w-[84px] shrink-0 overflow-hidden rounded-2xl md:h-[128px] md:w-[104px]" style={{ aspectRatio: "auto" }}>
                  <Image src={item.image || "/images/image.png"} alt={item.name || "Maglia"} fill unoptimized sizes="104px" className="z-[1] object-contain p-1.5" style={{ mixBlendMode: "multiply" }} />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 text-[18px] font-semibold leading-tight text-white"><Link href={`/products/${item.slug || item.id}`} className="hover:text-[var(--lime)]">{item.name}</Link></h3>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.customization?.size && <span className="rounded-full bg-[var(--wall-2)] px-2.5 py-1 text-[13px] font-bold text-[var(--lime)]">Taglia {item.customization.size}</span>}
                        {item.customization?.hasCustomization && <span className="rounded-full bg-[var(--wall-2)] px-2.5 py-1 text-[13px] font-semibold text-[var(--text-2)]">Personalizzata</span>}
                        {!!item.customization?.excludedShirts?.length && <span className="rounded-full bg-[var(--wall-2)] px-2.5 py-1 text-[13px] font-semibold text-[var(--text-2)]">Escluse: {item.customization.excludedShirts.join(", ")}</span>}
                      </div>
                    </div>
                    <p className="pc-price shrink-0 !text-[26px]">{eur(Number(item.price) * item.quantity)}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center rounded-full bg-[var(--wall-2)] p-1">
                      <button type="button" aria-label="Una in meno" onClick={() => handleQuantityChange(item.id, item.quantity - 1)} className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"><Minus className="h-4 w-4" strokeWidth={3} /></button>
                      <span className="w-9 text-center text-[17px] font-bold text-white" aria-live="polite">{item.quantity}</span>
                      <button type="button" aria-label="Una in più" onClick={() => handleQuantityChange(item.id, item.quantity + 1)} className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"><Plus className="h-4 w-4" strokeWidth={3} /></button>
                    </div>
                    <button type="button" onClick={() => removeItem(item.id)} className="flex h-10 items-center gap-1.5 rounded-full px-3 text-[15px] font-semibold text-[var(--text-3)] transition-colors hover:text-[var(--red)]"><Trash2 className="h-4 w-4" />Rimuovi</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <Link href="/shop" className="inline-flex h-11 items-center text-[16px] font-semibold text-[var(--lime)] underline-offset-4 hover:underline">← Continua a comprare</Link>

          {upsellProducts.length > 0 && (
            <section aria-label="Potrebbero piacerti" className="rounded-3xl bg-[var(--wall)] p-5 shadow-[inset_0_0_0_1px_var(--line)]">
              <h2 className="disp text-[clamp(1.6rem,3vw,2.2rem)] text-white">Aggiungi un&apos;altra maglia</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {upsellProducts.map((item) => (
                  <li key={item._id}>
                    <Link href={`/products/${item.slug}`} className="flex items-center gap-3 rounded-2xl bg-[var(--wall-2)] p-3 transition-colors hover:bg-[var(--wall)]">
                      <span className="pc-stage relative block h-16 w-14 shrink-0 overflow-hidden rounded-xl" style={{ aspectRatio: "auto" }}>
                        {item.images?.[0] && <Image src={item.images[0].includes("res.cloudinary.com") ? item.images[0].replace("/upload/", "/upload/w_120,q_auto,f_auto/") : item.images[0]} alt="" fill unoptimized className="z-[1] object-contain p-1" style={{ mixBlendMode: "multiply" }} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 block text-[16px] font-semibold leading-tight text-white">{item.title}</span>
                        <span className="mt-0.5 block text-[16px] font-bold text-[var(--lime)]">{eur(Number(item.basePrice))}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-[var(--text-3)]" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-[calc(var(--bar-h)+var(--head-h)+16px)] lg:self-start" aria-label="Riepilogo ordine">
          <div className="rounded-3xl bg-[var(--wall)] p-6 shadow-[inset_0_0_0_1px_var(--line)]">
            <h2 className="disp text-[28px] text-white">Riepilogo</h2>
            <dl className="mt-4 space-y-3 text-[17px]">
              <div className="flex justify-between text-[var(--text-2)]"><dt>Subtotale</dt><dd className="font-semibold text-white">{eur(total)}</dd></div>
              {saving > 0 && <div className="flex justify-between font-semibold text-[var(--lime)]"><dt>3x2: maglia in regalo</dt><dd>−{eur(saving)}</dd></div>}
              <div className="flex justify-between text-[var(--text-2)]"><dt>Spedizione</dt><dd className="font-semibold text-[var(--lime)]">Gratuita</dd></div>
            </dl>
            <div className="mt-4 flex items-end justify-between border-t border-dashed border-[var(--line)] pt-4">
              <span className="text-[15px] font-semibold text-[var(--text-3)]">Totale{saving > 0 ? " stimato" : ""}</span>
              <span className="pc-price !text-[48px] text-[var(--lime)]">{eur(Math.max(0, total - saving))}</span>
            </div>
            <p className="mt-1 text-[13px] italic text-[var(--text-3)]">IVA inclusa. Il totale definitivo si conferma al pagamento.</p>
            <button type="button" onClick={handleCheckout} disabled={isCheckingOut} className="btn btn-lime mt-5 w-full disabled:opacity-60">
              {isCheckingOut ? "Un attimo…" : <>Vai al pagamento <ArrowRight className="h-5 w-5" strokeWidth={3} /></>}
            </button>
            <ul className="mt-5 grid grid-cols-2 gap-2">
              {[[ShieldCheck, "Pagamento protetto"], [Truck, "Spedizione gratuita"], [RotateCcw, "Reso entro 14 giorni"], [Clock, "Consegna 7-10 giorni"]].map(([Icon, l]) => {
                const I = Icon as typeof ShieldCheck;
                return <li key={String(l)} className="flex items-center gap-2 rounded-2xl bg-[var(--wall-2)] px-3 py-2.5 text-[14px] font-semibold text-[var(--text-2)]"><I className="h-4 w-4 shrink-0 text-[var(--lime)]" />{String(l)}</li>;
              })}
            </ul>
            <p className="mt-4 text-center text-[13px] text-[var(--text-3)]">Visa, Mastercard, American Express, Apple Pay, Google Pay, PayPal, Klarna</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
