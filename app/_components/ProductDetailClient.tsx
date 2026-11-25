"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";

// Bypassa /_next/image (quota Vercel Hobby) per immagini Cloudinary:
// usa trasformazioni native Cloudinary f_auto,q_auto,w_{size}
function cloudinaryOpt(url: string, width = 828): string {
  if (!url) return url;
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/w_${width},q_auto,f_auto/`);
  }
  return url;
}
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useCartStore } from "@/lib/store/cart";
import { IProduct, Review, Patch } from "@/lib/types/product";
import ProductReviews from "@/app/_components/ProductReviews";
import SizeGuideModal from "@/components/shop/SizeGuideModal";
import PdpCustomize from "@/components/shop/PdpCustomize";
import PdpLightbox from "@/components/shop/PdpLightbox";
import { vintedStats } from "@/lib/data/vintedReviews";
import { clubOfTitle, clubHref } from "@/lib/clubs";
import { plainName } from "@/lib/archive";
import { PATCHES, patchById, suggestedPatches } from "@/lib/patches";
import { Truck, RotateCcw, ShieldCheck, ChevronDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useI18n } from "@/lib/hooks/useI18n";
import { useTrackEvent } from "@/components/analytics/AnalyticsTracker";
import { trackFbq } from "@/lib/utils/fbq";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PatchObject {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  price: number;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
}

// ─── Prices ───────────────────────────────────────────────────────────────────
const EXTRAS_PRICES = { player_edition: 5, long_sleeve: 10, shorts: 11, socks: 17 };

// ─── Competition config (visual) ─────────────────────────────────────────────
const COMP: Record<string, { label: string; abbr: string; border: string; text: string; bg: string }> = {
  "champions-league":  { label: "Competizione Europea", abbr: "UEFA", border: "#FFD700", text: "#FFD700", bg: "rgba(20,18,0,0.95)" },
  "europa-league":     { label: "Competizione Europea", abbr: "UEFA", border: "#FF6600", text: "#FF8C3F", bg: "rgba(28,10,0,0.95)" },
  "conference-league": { label: "Competizione Europea", abbr: "UEFA", border: "#00A651", text: "#3DCA7A", bg: "rgba(0,18,8,0.95)"  },
  "serie-a":           { label: "Serie A",          abbr: "SA",   border: "#1B5EBF", text: "#5B9EFF", bg: "rgba(5,10,30,0.95)" },
  "coppa-italia":      { label: "Coppa Italia",     abbr: "CI",   border: "#0066CC", text: "#5BAAFF", bg: "rgba(0,10,28,0.95)" },
  "premier-league":    { label: "Premier League",   abbr: "PL",   border: "#7B2FBE", text: "#C8A0D4", bg: "rgba(15,5,25,0.95)" },
  "fa-cup":            { label: "FA Cup",            abbr: "FA",   border: "#003090", text: "#7EA4F0", bg: "rgba(0,6,28,0.95)"  },
  "other":             { label: "Altra Competizione",abbr: "CUP", border: "#555",    text: "#aaa",    bg: "rgba(14,14,14,0.95)"},
};

// ─── Smart patch mapping (team → relevant competitions) ──────────────────────
const TEAM_COMPETITIONS: Record<string, string[]> = {
  // Serie A
  "inter":        ["champions-league","serie-a","coppa-italia"],
  "milan":        ["champions-league","serie-a","coppa-italia"],
  "juventus":     ["champions-league","serie-a","coppa-italia"],
  "napoli":       ["champions-league","serie-a","coppa-italia"],
  "lazio":        ["champions-league","serie-a","coppa-italia"],
  "atalanta":     ["champions-league","serie-a","coppa-italia"],
  "bologna":      ["champions-league","serie-a","coppa-italia"],
  "roma":         ["europa-league","serie-a","coppa-italia"],
  "fiorentina":   ["conference-league","serie-a","coppa-italia"],
  "torino":       ["serie-a","coppa-italia"],
  "udinese":      ["serie-a","coppa-italia"],
  "monza":        ["serie-a","coppa-italia"],
  "genoa":        ["serie-a","coppa-italia"],
  "lecce":        ["serie-a","coppa-italia"],
  "cagliari":     ["serie-a","coppa-italia"],
  "verona":       ["serie-a","coppa-italia"],
  "sassuolo":     ["serie-a","coppa-italia"],
  "empoli":       ["serie-a","coppa-italia"],
  "parma":        ["serie-a","coppa-italia"],
  "como":         ["serie-a","coppa-italia"],
  // Premier League
  "arsenal":           ["champions-league","premier-league","fa-cup"],
  "liverpool":         ["champions-league","premier-league","fa-cup"],
  "man city":          ["champions-league","premier-league","fa-cup"],
  "manchester city":   ["champions-league","premier-league","fa-cup"],
  "chelsea":           ["champions-league","premier-league","fa-cup"],
  "newcastle":         ["champions-league","premier-league","fa-cup"],
  "aston villa":       ["champions-league","premier-league","fa-cup"],
  "man utd":           ["europa-league","premier-league","fa-cup"],
  "manchester united": ["europa-league","premier-league","fa-cup"],
  "nottm forest":      ["europa-league","premier-league","fa-cup"],
  "brighton":          ["europa-league","premier-league","fa-cup"],
  "tottenham":         ["conference-league","premier-league","fa-cup"],
  "west ham":          ["conference-league","premier-league","fa-cup"],
  // Spanish / European
  "real madrid":  ["champions-league"],
  "barcelona":    ["champions-league"],
  "atletico":     ["champions-league"],
  "bayern":       ["champions-league"],
  "dortmund":     ["champions-league"],
  "psg":          ["champions-league"],
  "porto":        ["champions-league"],
  "benfica":      ["champions-league"],
  "sporting":     ["champions-league"],
  "ajax":         ["champions-league"],
};

function detectTeam(title: string): string[] {
  const t = title.toLowerCase();
  for (const [key, comps] of Object.entries(TEAM_COMPETITIONS)) {
    if (t.includes(key)) return comps;
  }
  return [];
}

function getRelevantPatches(title: string, patches: PatchObject[]): PatchObject[] {
  const relevant = detectTeam(title);
  if (relevant.length === 0) return patches; // show all if unknown team
  return patches.filter(p => relevant.includes(p.category));
}

// ─── Patch Card ───────────────────────────────────────────────────────────────
function PatchCard({ patch, selected, onToggle }: {
  patch: PatchObject; selected: boolean; onToggle: () => void;
}) {
  const cfg = COMP[patch.category] || COMP["other"];
  return (
    <button
      type="button"
      onClick={onToggle}
      className="patch-card relative flex flex-col gap-2 p-3 cut cut-sm transition-all active:scale-[0.97] text-left"
      style={{
        background: selected ? cfg.bg : "rgba(255,255,255,0.02)",
        border: `1.5px solid ${selected ? cfg.border : "rgba(255,255,255,0.07)"}`,
        boxShadow: selected ? `0 0 0 1px ${cfg.border}22, 0 4px 16px ${cfg.border}18` : "none",
        transition: "all 180ms cubic-bezier(0.23,1,0.32,1)",
      }}
    >
      {/* Selected indicator */}
      <div
        className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center"
        style={{
          background: selected ? cfg.border : "rgba(255,255,255,0.08)",
          border: `1.5px solid ${selected ? cfg.border : "rgba(255,255,255,0.15)"}`,
          transition: "all 180ms",
        }}
      >
        {selected && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path d="M1 3L3 5L7 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      {/* Competition badge */}
      <div
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full self-start"
        style={{ background: `${cfg.border}18`, border: `1px solid ${cfg.border}30` }}
      >
        <span
          className="text-[14px] font-bold "
          style={{ color: cfg.text, fontFamily: "var(--font-mono, monospace)" }}
        >
          {cfg.abbr}
        </span>
      </div>
      {/* Name */}
      <span
        className="text-[15px] font-bold leading-tight pr-5"
        style={{
          color: selected ? "#fff" : "rgba(255,255,255,0.55)",
          fontFamily: "var(--font-display, sans-serif)",
          }}
      >
        {cfg.label}
      </span>
      {/* Price */}
      <span
        className="text-[14px] font-bold"
        style={{ color: cfg.border, fontFamily: "var(--font-mono, monospace)" }}
      >
        +€{patch.price.toFixed(2)}
      </span>
      <style jsx>{`
        @media (hover: hover) and (pointer: fine) {
          .patch-card:hover {
            border-color: ${cfg.border}55 !important;
            background: ${cfg.bg} !important;
          }
        }
      `}</style>
    </button>
  );
}

// ─── Size Button ──────────────────────────────────────────────────────────────
function SizeBtn({ size, selected, onClick }: { size: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative h-12 min-w-[54px] px-3 rounded-[6px] text-[16px] font-bold transition-all active:scale-[0.96]"
      style={{
        background: selected ? "#c8f000" : "transparent",
        color: selected ? "#0a0a0a" : "rgba(255,255,255,0.9)",
        border: `2px solid ${selected ? "#c8f000" : "rgba(255,255,255,0.3)"}`,
        fontFamily: "var(--font-display, sans-serif)",
        transition: "all 160ms cubic-bezier(0.23,1,0.32,1)",
      }}
    >
      {size}
    </button>
  );
}

// ─── Step Header ──────────────────────────────────────────────────────────────
function StepLabel({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(200,240,0,0.12)", border: "1px solid rgba(200,240,0,0.25)" }}
      >
        <span
          className="text-[14px] font-bold"
          style={{ color: "#c8f000", fontFamily: "var(--font-mono, monospace)" }}
        >
          {n}
        </span>
      </div>
      <span
        className="text-[14px] font-bold "
        style={{ color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-display, sans-serif)" }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductDetailClient({
  product,
}: {
  product: IProduct & { patches?: PatchObject[] };
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const [quantity, setQuantity] = useState(1);
  const [customOpen, setCustomOpen] = useState(false); // personalizzazione chiusa di default: prima taglia e acquisto
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [eta, setEta] = useState(""); // finestra di consegna: 7-10 giorni lavorativi da oggi, calcolata nel browser
  const [errors, setErrors] = useState<{ size?: string }>({});
  const { t } = useI18n();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();
  const trackEvent = useTrackEvent();

  const [customization, setCustomization] = useState({
    name: "",
    number: "",
    includeShorts: false,
    includeSocks: false,
    selectedPatches: [] as PatchObject[],
    size: "",
    isPlayerEdition: false,
    isKidSize: false,
    hasLongSleeve: false,
    excludedShirts: [] as string[],
  });

  // Tutte le patch per tutti: il prezzo viene dal database se la patch c'e, altrimenti dal listino; consigliate quelle della squadra
  const patchCatalog = useMemo(() => {
    const db = new Map((product.patches ?? []).map((p) => [p.category, Number(p.price)]));
    return PATCHES.map((d) => ({ _id: d.id, category: d.id, title: d.label, price: db.get(d.id) ?? d.price }));
  }, [product.patches]);
  const suggestedPatchIds = useMemo(() => suggestedPatches(product.title, !!product.isWorldCup), [product.title, product.isWorldCup]);

  // Live price
  const unitPrice = useMemo(() => {
    const base = Number(product.basePrice) || 0;
    const patchTotal = customization.selectedPatches.reduce((s, p) => s + p.price, 0);
    const extras =
      (customization.isPlayerEdition ? EXTRAS_PRICES.player_edition : 0) +
      (customization.hasLongSleeve ? EXTRAS_PRICES.long_sleeve : 0) +
      (customization.includeShorts ? EXTRAS_PRICES.shorts : 0) +
      (customization.includeSocks ? EXTRAS_PRICES.socks : 0);
    return base + patchTotal + extras;
  }, [product.basePrice, customization]);

  const totalPrice = unitPrice * quantity;

  // Prendi 3, paghi 2: quante maglie ci sono gia nel carrello e quante ne regala la regola con questa selezione
  const cartItemsList = useCartStore((s) => s.items);
  const jerseysInCart = cartItemsList.reduce((n, i) => n + (i.quantity || 0), 0);
  const jerseysTotal = jerseysInCart + quantity;
  const freeNow = Math.floor(jerseysTotal / 3);
  const club = useMemo(() => clubOfTitle(product.title), [product.title]);


  useEffect(() => {
    setMounted(true);
    const addWork = (n: number) => {
      const d = new Date();
      while (n > 0) {
        d.setDate(d.getDate() + 1);
        if (d.getDay() !== 0 && d.getDay() !== 6) n--;
      }
      return d.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "long" });
    };
    setEta(`${addWork(7)} e ${addWork(10)}`);
    if (product.reviews) setReviews(product.reviews);
    // Track product view once on mount
    trackEvent("product_view", {
      productId: product._id,
      productSlug: product.slug || product._id,
      value: Number(product.basePrice) || 0,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product._id]);

  // Average rating
  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  // Handlers
  const handleAddToCart = () => {
    setErrors({});
    if (!customization.size) {
      setErrors({ size: "Seleziona una taglia" });
      toast.error("Seleziona una taglia prima di aggiungere al carrello");
      return;
    }
    const hash = JSON.stringify({ ...customization, patches: customization.selectedPatches });
    const hasCustom = !!(customization.name || customization.number || customization.isPlayerEdition ||
      customization.size || customization.includeShorts || customization.hasLongSleeve ||
      customization.includeSocks || customization.selectedPatches.length > 0);
    const itemId = hasCustom
      ? `${product._id}_${hash.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)}`
      : product._id;
    addToCart({
      id: itemId,
      slug: product.slug || product._id,
      name: product.title,
      price: totalPrice,
      image: product.images[selectedImage],
      category: product.category,
      customization: {
        name: customization.name,
        number: customization.number,
        selectedPatches: customization.selectedPatches.map(p => p.category as Patch),
        includeShorts: customization.includeShorts,
        hasLongSleeve: customization.hasLongSleeve,
        includeSocks: customization.includeSocks,
        isPlayerEdition: customization.isPlayerEdition,
        size: customization.size,
        isKidSize: customization.isKidSize,
        // la sola taglia non e una personalizzazione (hasCustom la include solo per distinguere le righe del carrello)
        hasCustomization: !!(customization.name || customization.number || customization.isPlayerEdition ||
          customization.includeShorts || customization.hasLongSleeve || customization.includeSocks ||
          customization.selectedPatches.length > 0),
        excludedShirts: customization.excludedShirts,
      },
      quantity,
    });
    trackEvent("add_to_cart", {
      productId: product._id,
      productSlug: product.slug || product._id,
      value: totalPrice,
    });
    trackFbq("AddToCart", {
      content_ids: [product._id],
      content_name: product.title,
      content_type: "product",
      value: totalPrice,
      currency: "EUR",
    });
  };

  const handleBuyNow = () => {
    setErrors({});
    if (!customization.size) {
      setErrors({ size: "Seleziona una taglia" });
      toast.error("Seleziona una taglia prima di procedere");
      return;
    }
    handleAddToCart();
    // checkout_start viene tracciato in app/checkout/page.tsx quando si
    // raggiunge davvero lo step di pagamento con un PaymentIntent Stripe
    // valido — non qui, altrimenti chi arriva al pagamento verrebbe
    // contato due volte nel funnel.
    trackFbq("InitiateCheckout", {
      content_ids: [product._id],
      content_name: product.title,
      value: totalPrice,
      currency: "EUR",
      num_items: 1,
    });
    router.push("/checkout");
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist({ id: product._id, name: product.title, price: product.basePrice, image: product.images[selectedImage], team: product.title.split(" ")[0] });
    }
  };

  const handleReviewSubmit = async (reviewData: any) => {
    const res = await fetch(`/api/products/${product._id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewData),
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json();
      if (res.status === 401) { signIn(); throw new Error("Sessione scaduta."); }
      throw new Error(err.error || "Impossibile inviare la recensione");
    }
    const updated = await fetch(`/api/products/${product._id}/reviews`);
    if (updated.ok) setReviews(await updated.json());
  };

  const handleReviewDelete = async (reviewId: string) => {
    setReviews(prev => prev.filter(r => r._id !== reviewId));
    const updated = await fetch(`/api/products/${product._id}/reviews`);
    if (updated.ok) setReviews(await updated.json());
  };

  const togglePatch = (patch: PatchObject) => {
    setCustomization(prev => ({
      ...prev,
      selectedPatches: prev.selectedPatches.some(p => p._id === patch._id)
        ? prev.selectedPatches.filter(p => p._id !== patch._id)
        : [...prev.selectedPatches, patch],
    }));
  };

  const inWishlist = mounted && isInWishlist(product._id);

  return (
    <div className="min-h-screen" style={{ background: "#080808" }}>

      {/* ── Barra d'acquisto su telefono: prezzo e un solo pulsante grande ─────────── */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 border-t border-white/15 bg-[#0a0a0a] lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="min-w-0 leading-tight">
            <span className="num block text-[28px]">€{totalPrice.toFixed(2).replace(".00", "").replace(".", ",")}</span>
            <span className="block truncate text-[13px] font-semibold text-[var(--text-3)]">{customization.size ? `Taglia ${customization.size}` : "Scegli la taglia"} · spedizione gratis</span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!customization.size) {
                setErrors({ size: "Seleziona una taglia" });
                document.getElementById("taglia")?.scrollIntoView({ behavior: "smooth", block: "center" });
                return;
              }
              handleAddToCart();
            }}
            className="btn btn-lime ml-auto !h-14 shrink-0 !px-6 !text-[18px]"
          >
            {customization.size ? "Aggiungi al carrello" : "Scegli la taglia"}
          </button>
        </div>
      </div>

      {/* ── Main Grid ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 lg:pb-12">
        <div className="lg:grid lg:grid-cols-[1fr_1fr] lg:gap-14 xl:gap-20">

          {/* ── LEFT: Image Gallery ────────────────────────────────────── */}
          <div className="lg:sticky lg:top-[calc(var(--bar-h)+var(--head-h)+16px)] lg:self-start mb-6 lg:mb-0">
            {/* Telefono: le foto si sfogliano con il dito, una dopo l'altra */}
            <div className="lg:hidden">
              <div
                className="flex snap-x snap-mandatory overflow-x-auto rounded-[24px] [scrollbar-width:none]"
                style={{ background: "#F7F7F7" }}
                onScroll={(e) => {
                  const el = e.currentTarget;
                  const i = Math.round(el.scrollLeft / el.clientWidth);
                  if (i !== selectedImage) setSelectedImage(i);
                }}
              >
                {product.images.map((img, i) => (
                  <div key={i} className="relative aspect-square w-full shrink-0 snap-center" onClick={() => { setSelectedImage(i); setLightbox(true); }}>
                    <Image
                      src={imgErrors[i] ? "/images/placeholder.png" : (cloudinaryOpt(img, 900) || "/images/placeholder.png")}
                      alt={i === 0 ? product.title : `${product.title}, foto ${i + 1}`}
                      fill
                      unoptimized
                      priority={i === 0}
                      loading={i === 0 ? "eager" : "lazy"}
                      className="object-contain p-4"
                      sizes="100vw"
                      onError={() => setImgErrors((prev) => ({ ...prev, [i]: true }))}
                    />
                  </div>
                ))}
              </div>
              {product.images.length > 1 && (
                <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
                  {product.images.map((_, i) => (
                    <span key={i} className="h-2 rounded-full transition-all" style={{ width: i === selectedImage ? 22 : 8, background: i === selectedImage ? "#c8f000" : "rgba(255,255,255,0.3)" }} />
                  ))}
                </div>
              )}
            </div>

            {/* Computer: foto grande e miniature */}
            <div
              onClick={() => setLightbox(true)}
              role="button"
              tabIndex={0}
              aria-label="Ingrandisci la foto"
              onKeyDown={(e) => e.key === "Enter" && setLightbox(true)}
              className="relative hidden w-full cursor-zoom-in rounded-[28px] overflow-hidden lg:block"
              style={{
                aspectRatio: "1/1",
                background: "#F7F7F7",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <Image
                src={imgErrors[selectedImage] ? "/images/placeholder.png" : (cloudinaryOpt(product.images[selectedImage]) || "/images/placeholder.png")}
                alt={product.title}
                fill
                unoptimized
                className="object-contain p-5 transition-all duration-400"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                onError={() => setImgErrors(prev => ({ ...prev, [selectedImage]: true }))}
              />
              {/* Image counter */}
              <div
                className="absolute bottom-4 right-4 px-2.5 py-1 rounded-full"
                style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
              >
                <span className="text-[14px] font-bold text-white" style={{ fontFamily: "var(--font-mono,monospace)" }}>
                  {selectedImage + 1}/{product.images.length}
                </span>
              </div>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="mt-3 hidden gap-2 overflow-x-auto pb-1 lg:flex" style={{ scrollbarWidth: "none" }}>
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImage(i)}
                    className="flex-shrink-0 rounded-xl overflow-hidden transition-all active:scale-[0.96]"
                    style={{
                      width: 76,
                      height: 76,
                      border: `2px solid ${i === selectedImage ? "#c8f000" : "rgba(255,255,255,0.08)"}`,
                      background: "#F7F7F7",
                      opacity: i === selectedImage ? 1 : 0.55,
                    }}
                  >
                    <Image src={imgErrors[i] ? "/images/placeholder.png" : (cloudinaryOpt(img, 120) || "/images/placeholder.png")} alt="" width={76} height={76} unoptimized className="object-contain w-full h-full p-1" onError={() => setImgErrors(prev => ({ ...prev, [i]: true }))} />
                  </button>
                ))}
              </div>
            )}

            {/* Videos */}
            {product.videos && product.videos.length > 0 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {product.videos.map((v, i) => (
                  <div key={i} className="relative flex-shrink-0 rounded-xl overflow-hidden" style={{ width: 140, height: 100, background: "#111" }}>
                    <video src={v} className="w-full h-full object-cover" preload="metadata" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-black/50 flex items-center justify-center">
                        <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[9px] border-l-white border-b-[5px] border-b-transparent ml-0.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: acquisto ───────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Dove sei + etichette */}
            <div className="flex flex-wrap items-center gap-2 text-[14px] font-semibold text-[var(--text-3)]">
              <Link href="/" className="hover:text-white">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href={product.isRetro ? "/archivio" : product.isWorldCup ? "/shop/worldcup" : "/shop"} className="hover:text-white">{product.isRetro ? "Maglie retro" : product.isWorldCup ? "Mondiali" : "Maglie"}</Link>
              {club && (<><span aria-hidden="true">/</span><Link href={clubHref(club)} className="text-[var(--lime)] hover:underline">{club.name}</Link></>)}
            </div>

            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-[var(--lime)] px-3 py-1 text-[13px] font-bold text-[#0a0a0a]">{product.isRetro ? "Maglia retro" : product.isWorldCup ? "Mondiali 2026" : "Nuova stagione"}</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[13px] font-semibold text-white">Versione tifoso</span>
              </div>
              <h1 className="display text-[clamp(2rem,4.2vw,3rem)] leading-[0.95]">{product.isRetro ? plainName(product.title) : product.title}</h1>

              {/* Recensioni vere ricevute su Vinted, con la fonte */}
              <a href="#recensioni" className="mt-3 inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] font-semibold text-[var(--text-2)] hover:text-white">
                <span className="flex gap-0.5" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 14 14" fill={i <= Math.round(vintedStats.avg) ? "#c8f000" : "rgba(255,255,255,0.2)"}><path d="M7 1l1.6 3.3 3.6.5-2.6 2.5.6 3.6L7 9.2l-3.2 1.7.6-3.6L1.8 4.8l3.6-.5z" /></svg>
                  ))}
                </span>
                <span>{vintedStats.avg.toFixed(1).replace(".", ",")} · {vintedStats.count} recensioni su Vinted</span>
              </a>
              {reviews.length > 0 && <p className="mt-1 text-[14px] text-[var(--text-3)]">{reviews.length} recension{reviews.length === 1 ? "e" : "i"} su questo sito, media {avgRating.toFixed(1).replace(".", ",")}</p>}
            </div>

            {/* Prezzo */}
            <div>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="num text-[clamp(3rem,7vw,4.4rem)] leading-none">€{totalPrice.toFixed(2).replace(".00", "").replace(".", ",")}</span>
                {quantity > 1 && <span className="text-[15px] text-[var(--text-3)]">({quantity} × €{unitPrice.toFixed(2).replace(".00", "").replace(".", ",")})</span>}
              </div>
              <p className="mt-1 text-[15px] font-semibold text-[var(--text-2)]">IVA inclusa · spedizione gratuita in Italia</p>
              {(customization.isPlayerEdition || customization.hasLongSleeve || customization.includeShorts || customization.includeSocks || customization.selectedPatches.length > 0) && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {customization.isPlayerEdition && <span className="rounded-full bg-[rgba(200,240,0,0.12)] px-2.5 py-0.5 text-[13px] font-bold text-[#c8f000]">Player +€{EXTRAS_PRICES.player_edition}</span>}
                  {customization.hasLongSleeve && <span className="rounded-full bg-[rgba(200,240,0,0.12)] px-2.5 py-0.5 text-[13px] font-bold text-[#c8f000]">Manica lunga +€{EXTRAS_PRICES.long_sleeve}</span>}
                  {customization.includeShorts && <span className="rounded-full bg-[rgba(200,240,0,0.12)] px-2.5 py-0.5 text-[13px] font-bold text-[#c8f000]">Pantaloncini +€{EXTRAS_PRICES.shorts}</span>}
                  {customization.includeSocks && <span className="rounded-full bg-[rgba(200,240,0,0.12)] px-2.5 py-0.5 text-[13px] font-bold text-[#c8f000]">Calzettoni +€{EXTRAS_PRICES.socks}</span>}
                  {customization.selectedPatches.map((p) => (
                    <span key={p._id} className="rounded-full bg-[rgba(200,240,0,0.12)] px-2.5 py-0.5 text-[13px] font-bold text-[#c8f000]">{patchById(p.category)?.label || p.category} +€{p.price}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Prendi 3, paghi 2: calcolato sul carrello vero */}
            <Link href="/cart" className="group block rounded-2xl bg-[var(--lime)] p-4 text-[#0a0a0a] transition-transform active:scale-[0.99]">
              <span className="flex items-center justify-between gap-3">
                <span className="disp text-[clamp(1.5rem,3vw,2rem)] leading-none">Prendi 3, paghi 2</span>
                <span className="flex gap-1.5" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className={`flex h-8 w-8 items-center justify-center rounded-full text-[14px] font-black ${i < Math.min(3, jerseysTotal % 3 === 0 && jerseysTotal > 0 ? 3 : jerseysTotal % 3) ? "bg-[#0a0a0a] text-[var(--lime)]" : "bg-[#0a0a0a]/15"}`}>{i === 2 ? "🎁" : i + 1}</span>
                  ))}
                </span>
              </span>
              <span className="mt-1.5 block text-[15px] font-semibold">
                {freeNow > 0
                  ? `Con questa maglia hai ${freeNow === 1 ? "1 maglia in regalo" : `${freeNow} maglie in regalo`}: la meno cara è gratis.`
                  : `Aggiungine ${3 - jerseysTotal} e la meno cara è gratis${jerseysInCart > 0 ? ` (hai già ${jerseysInCart} nel carrello)` : ""}.`}
              </span>
            </Link>

            {/* Taglia */}
            <div id="taglia" className="scroll-mt-40">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="display text-[24px] text-white">Taglia</h2>
                <button type="button" onClick={() => setSizeChartOpen(true)} className="min-h-[44px] px-1 text-[15px] font-bold text-[#c8f000] underline underline-offset-4">Guida taglie →</button>
              </div>
              {product.kidsSizes && product.kidsSizes.length > 0 && (
                <div className="mb-3 inline-flex gap-1 rounded-full bg-[var(--wall)] p-1 shadow-[inset_0_0_0_1px_var(--line)]" role="group" aria-label="Adulto o bambino">
                  {[["Adulto", false], ["Bambino", true]].map(([l, v]) => (
                    <button key={String(l)} type="button" aria-pressed={customization.isKidSize === v} onClick={() => setCustomization((p) => ({ ...p, isKidSize: v as boolean, size: "" }))} className="h-10 rounded-full px-5 text-[15px] font-semibold text-white aria-pressed:bg-[var(--lime)] aria-pressed:text-[#0a0a0a]">{l as string}</button>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {(customization.isKidSize ? product.kidsSizes : product.adultSizes)?.map((size) => (
                  <SizeBtn key={size} size={size} selected={customization.size === size} onClick={() => { setErrors({}); setCustomization((p) => ({ ...p, size })); }} />
                ))}
              </div>
              {errors.size && <p role="alert" className="mt-2 text-[15px] font-bold text-red-400">{errors.size}</p>}
              <p className="mt-2 text-[14px] italic text-[var(--text-3)]">Tra due taglie? Prendi la più grande. Se non va bene, reso entro 14 giorni.</p>

              <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 rounded-2xl bg-[var(--wall)] px-4 py-3 shadow-[inset_0_0_0_1px_var(--line)]">
                <span>
                  <span className="block text-[16px] font-bold text-white">Manica lunga</span>
                  <span className="block text-[14px] font-bold text-[#c8f000]">+€{EXTRAS_PRICES.long_sleeve}</span>
                </span>
                <Switch checked={customization.hasLongSleeve} onCheckedChange={(val) => setCustomization((p) => ({ ...p, hasLongSleeve: val }))} />
              </label>
            </div>

            {/* Personalizzazione */}
            <PdpCustomize
              c={customization}
              set={setCustomization as any}
              canName={!!product.allowsNameOnShirt}
              canNumber={!!product.allowsNumberOnShirt}
              patches={patchCatalog}
              suggested={suggestedPatchIds}
              hasShorts={!!product.hasShorts}
              hasSocks={!!product.hasSocks}
              prices={{ player_edition: EXTRAS_PRICES.player_edition, shorts: EXTRAS_PRICES.shorts, socks: EXTRAS_PRICES.socks }}
              toggle={togglePatch}
            />

            {/* Acquisto */}
            <div className="space-y-3">
              <div className="flex items-stretch gap-2">
                <div className="flex shrink-0 items-center overflow-hidden rounded-full bg-[var(--wall)] shadow-[inset_0_0_0_1px_var(--line)]" role="group" aria-label="Quantità">
                  <button type="button" aria-label="Una in meno" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="h-14 w-12 text-[22px] font-bold text-white hover:bg-white/10">−</button>
                  <span className="w-8 text-center text-[18px] font-bold text-white" aria-live="polite">{quantity}</span>
                  <button type="button" aria-label="Una in più" onClick={() => setQuantity((q) => Math.min(20, q + 1))} className="h-14 w-12 text-[22px] font-bold text-white hover:bg-white/10">+</button>
                </div>
                <button type="button" onClick={handleAddToCart} className="btn btn-lime min-w-0 flex-1 !h-14 !text-[18px]">
                  Aggiungi al carrello · €{totalPrice.toFixed(2).replace(".00", "").replace(".", ",")}
                </button>
                <button type="button" onClick={handleWishlistToggle} aria-label={inWishlist ? "Togli dai preferiti" : "Aggiungi ai preferiti"} aria-pressed={inWishlist} className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full transition-transform active:scale-95 ${inWishlist ? "bg-red-500/15 shadow-[inset_0_0_0_2px_rgba(239,68,68,0.5)]" : "bg-[var(--wall)] shadow-[inset_0_0_0_1px_var(--line)]"}`}>
                  {inWishlist ? <HeartIconSolid className="h-6 w-6 text-red-500" /> : <HeartIcon className="h-6 w-6 text-white/80" />}
                </button>
              </div>
              <button type="button" onClick={handleBuyNow} className="btn btn-ghost w-full !h-14 !text-[18px]">Compra subito</button>
            </div>

            {/* Consegna e garanzie: le regole vere del negozio */}
            <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-2xl bg-[var(--wall)] shadow-[inset_0_0_0_1px_var(--line)]">
              <li className="flex items-start gap-3 p-4">
                <Truck className="mt-0.5 h-6 w-6 shrink-0 text-[var(--lime)]" strokeWidth={2.2} />
                <span className="text-[16px] leading-snug text-white"><b>Spedizione gratuita.</b> {eta ? <>Se ordini oggi lo ricevi tra <b>{eta}</b>.</> : "Consegna in 7-10 giorni lavorativi."} <span className="text-[var(--text-3)]">Codice per seguire il pacco via email.</span></span>
              </li>
              <li className="flex items-start gap-3 p-4">
                <RotateCcw className="mt-0.5 h-6 w-6 shrink-0 text-[var(--lime)]" strokeWidth={2.2} />
                <span className="text-[16px] leading-snug text-white"><b>Reso entro 14 giorni.</b> <span className="text-[var(--text-3)]">Maglia non indossata; spedizione del reso a tuo carico. Le personalizzate non si rendono.</span></span>
              </li>
              <li className="flex items-start gap-3 p-4">
                <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-[var(--lime)]" strokeWidth={2.2} />
                <span className="text-[16px] leading-snug text-white"><b>Pagamento protetto.</b> <span className="text-[var(--text-3)]">Carte, Apple Pay, Google Pay, PayPal, Klarna.</span></span>
              </li>
            </ul>

            {/* Dettagli a scomparsa */}
            <div className="divide-y divide-[var(--line)] overflow-hidden rounded-2xl bg-[var(--wall)] shadow-[inset_0_0_0_1px_var(--line)]">
              {[
                ["Descrizione", product.description || `${product.title}: maglia versione tifoso, spedita gratis in Italia.`],
                ["Versione tifoso, non ufficiale", "Non è la maglia ufficiale del club: Goal Mania non è affiliata ad alcun club o federazione. Stessa vestibilità e stampe delle maglie da tifoso."],
                ["Spedizione e reso", "Spedizione gratuita in Italia, consegna in 7-10 giorni lavorativi con codice di tracciamento. Reso entro 14 giorni con maglia non indossata e nella confezione: la spedizione del reso è a tuo carico, salvo maglia difettosa o sbagliata. Nome e numero non si rendono."],
                ["Come scegliere la taglia", "Apri la guida taglie e confronta le misure in centimetri con una maglia che ti sta bene. Se sei tra due taglie, prendi la più grande."],
              ].map(([t, d], i) => (
                <details key={t} className="group" open={i === 0}>
                  <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-3 px-4 text-[17px] font-bold text-white [&::-webkit-details-marker]:hidden">
                    {t}
                    <ChevronDown className="h-5 w-5 shrink-0 text-[var(--text-3)] transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="whitespace-pre-line px-4 pb-4 text-[16px] leading-relaxed text-[var(--text-2)]">{d}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recensioni: le Vinted stanno nella pagina sotto (con la fonte); qui quelle lasciate su questo sito, se ci sono */}
      <div id="recensioni" className="scroll-mt-32" />
      {reviews.length > 0 && (
        <div className="mx-auto w-full max-w-[1760px] px-5 pb-8 md:px-10 lg:px-16">
          <ProductReviews product={product} reviews={reviews} onReviewSubmit={handleReviewSubmit} onReviewDelete={handleReviewDelete} />
        </div>
      )}
      {lightbox && <PdpLightbox images={product.images} index={selectedImage} onIndex={setSelectedImage} onClose={() => setLightbox(false)} title={product.title} />}

      {/* Size Guide Modal */}
      <SizeGuideModal isOpen={sizeChartOpen} onClose={() => setSizeChartOpen(false)} />
    </div>
  );
}
