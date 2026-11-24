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
import DiscountRulesDisplay from "@/app/_components/DiscountRulesDisplay";
import SizeGuideModal from "@/components/shop/SizeGuideModal";
import PdpCustomize from "@/components/shop/PdpCustomize";
import PdpLightbox from "@/components/shop/PdpLightbox";
import VintedReviews from "@/components/shared/VintedReviews";
import RealOrdersGallery from "@/components/shared/RealOrdersGallery";
import FaqShort from "@/components/shared/FaqShort";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
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

  // Smart patch filtering
  const relevantPatches = useMemo(
    () => getRelevantPatches(product.title, product.patches ?? []),
    [product.title, product.patches]
  );

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

      {/* ── Sticky Mobile CTA ──────────────────────────────────────────── */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{ background: "#0a0a0a", borderTop: "1px solid rgba(255,255,255,0.14)", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {customization.size && (
          <div
            className="flex items-center justify-center gap-2 py-1.5 border-b"
            style={{ borderColor: "rgba(255,255,255,0.04)" }}
          >
            <span className="text-[14px] " style={{ color: "rgba(255,255,255,0.8)" }}>
              Taglia:
            </span>
            <span
              className="text-[14px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(200,240,0,0.12)", color: "#c8f000" }}
            >
              {customization.size}
            </span>
            <span className="text-[14px] font-bold" style={{ color: "rgba(255,255,255,0.8)" }}>
              · €{totalPrice.toFixed(2)}
            </span>
          </div>
        )}
        <div className="flex gap-2.5 p-3">
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 h-14 flex items-center justify-center rounded-full text-[17px] font-semibold transition-all active:scale-[0.97]"
            style={{ background: "#26261f", color: "#fff", fontFamily: "var(--font-display,sans-serif)" }}
          >
            + Carrello
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            className="flex-[2] h-14 flex items-center justify-center gap-1.5 rounded-full text-[18px] font-semibold transition-all active:scale-[0.97]"
            style={{ background: "#c8f000", color: "#0a0a0a", fontFamily: "var(--font-display,sans-serif)" }}
          >
            Compra subito →
          </button>
        </div>
      </div>

      {/* ── Main Grid ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 lg:pb-12">
        <div className="lg:grid lg:grid-cols-[1fr_1fr] lg:gap-14 xl:gap-20">

          {/* ── LEFT: Image Gallery ────────────────────────────────────── */}
          <div className="lg:sticky lg:top-6 lg:self-start mb-6 lg:mb-0">
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

          {/* ── RIGHT: Product Info + Customization ───────────────────── */}
          <div className="space-y-6">

            {/* Title + Rating */}
            <div>
              <h1 className="display mb-3 text-[clamp(1.9rem,4vw,2.7rem)]">
                {product.title}
              </h1>

              {/* Stars + reviews count */}
              {reviews.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(star => (
                      <svg key={star} width="14" height="14" viewBox="0 0 14 14" fill={star <= Math.round(avgRating) ? "#c8f000" : "rgba(255,255,255,0.15)"}>
                        <path d="M7 1l1.6 3.3 3.6.5-2.6 2.5.6 3.6L7 9.2l-3.2 1.7.6-3.6L1.8 4.8l3.6-.5z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-[15px] font-bold" style={{ color: "rgba(255,255,255,0.8)" }}>
                    {avgRating.toFixed(1)} · {reviews.length} recension{reviews.length === 1 ? "e" : "i"}
                  </span>
                </div>
              )}

              {/* Prezzo: grande e pulito, le condizioni accanto */}
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="num text-[46px]">€{totalPrice.toFixed(2).replace(".00", "")}</span>
                {quantity > 1 && <span className="text-[15px] text-[var(--text-3)]">({quantity}× €{unitPrice.toFixed(2)})</span>}
                <span className="text-[15px] text-[var(--text-2)]">IVA inclusa · spedizione gratuita</span>
              </div>

              {/* Customization summary chips */}
              {(customization.isPlayerEdition || customization.hasLongSleeve ||
                customization.includeShorts || customization.includeSocks ||
                customization.selectedPatches.length > 0) && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {customization.isPlayerEdition && (
                    <span className="text-[14px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(200,240,0,0.1)", color: "#c8f000" }}>
                      Player +€{EXTRAS_PRICES.player_edition}
                    </span>
                  )}
                  {customization.hasLongSleeve && (
                    <span className="text-[14px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(200,240,0,0.1)", color: "#c8f000" }}>
                      Manica lunga +€{EXTRAS_PRICES.long_sleeve}
                    </span>
                  )}
                  {customization.includeShorts && (
                    <span className="text-[14px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(200,240,0,0.1)", color: "#c8f000" }}>
                      Pantaloncini +€{EXTRAS_PRICES.shorts}
                    </span>
                  )}
                  {customization.includeSocks && (
                    <span className="text-[14px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(200,240,0,0.1)", color: "#c8f000" }}>
                      Calzettoni +€{EXTRAS_PRICES.socks}
                    </span>
                  )}
                  {customization.selectedPatches.map(p => {
                    const cfg = COMP[p.category] || COMP["other"];
                    return (
                      <span key={p._id} className="text-[14px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${cfg.border}18`, color: cfg.text }}>
                        {cfg.abbr} +€{p.price}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Real stock warning / delivery cutoff only — no fabricated viewer/sales counts */}
            {(Boolean(product.stockQuantity !== undefined && product.stockQuantity > 0 && product.stockQuantity < 5) || true) && (
              <div
                className="grid grid-cols-1 gap-2 p-3 cut cut-sm"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                {product.stockQuantity !== undefined && product.stockQuantity > 0 && product.stockQuantity < 5 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] animate-pulse">⚠️</span>
                    <span className="text-[15px] font-bold" style={{ color: "#fb923c" }}>
                      Solo {product.stockQuantity} rimast{product.stockQuantity === 1 ? "o" : "i"}!
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#c8f000]" aria-hidden="true" />
                  <span className="text-[15px] font-semibold text-white">
                    Spedizione gratuita. {eta ? <>Se ordini oggi lo ricevi tra <b>{eta}</b>.</> : "Consegna in 7-10 giorni lavorativi."}
                  </span>
                </div>
              </div>
            )}

            {/* ── SIZE + SLEEVE ─────────────────────────────────────── */}
            <div
              className="cut overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.015)" }}
            >
              <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <span className="display text-[22px] text-white">Taglia</span>
                <button
                  type="button"
                  onClick={() => setSizeChartOpen(true)}
                  className="min-h-[44px] px-1 text-[15px] font-bold"
                  style={{ color: "#c8f000", textDecoration: "underline", textUnderlineOffset: "4px" }}
                >
                  Guida taglie →
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Adult / Kids toggle */}
                {product.kidsSizes && product.kidsSizes.length > 0 && (
                  <div className="flex gap-1 p-1 rounded-xl self-start" style={{ background: "rgba(255,255,255,0.04)", width: "fit-content" }}>
                    {["ADULT", "KIDS"].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setCustomization(p => ({ ...p, isKidSize: type === "KIDS", size: "" }))}
                        className="px-4 py-1.5 rounded-lg text-[14px] font-bold transition-all"
                        style={{
                          background: (type === "KIDS") === customization.isKidSize ? "rgba(255,255,255,0.08)" : "transparent",
                          color: (type === "KIDS") === customization.isKidSize ? "#fff" : "rgba(255,255,255,0.3)",
                          fontFamily: "var(--font-mono,monospace)",
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}

                {/* Size grid */}
                <div className="flex flex-wrap gap-2">
                  {(customization.isKidSize ? product.kidsSizes : product.adultSizes)?.map(size => (
                    <SizeBtn
                      key={size}
                      size={size}
                      selected={customization.size === size}
                      onClick={() => setCustomization(p => ({ ...p, size }))}
                    />
                  ))}
                </div>

                {errors.size && (
                  <p className="text-[14px] font-bold text-red-400 tracking-tight flex items-center gap-1">
                    <span>⚠️</span> {errors.size}
                  </p>
                )}

                {/* Long sleeve toggle */}
                <div
                  className="flex items-center justify-between p-3.5 cut cut-sm"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div>
                    <p className="text-[14px] font-bold text-white" style={{ fontFamily: "var(--font-display,sans-serif)" }}>
                      Manica lunga
                    </p>
                    <p className="text-[14px] font-bold" style={{ color: "#c8f000" }}>
                      +€{EXTRAS_PRICES.long_sleeve}.00
                    </p>
                  </div>
                  <Switch
                    checked={customization.hasLongSleeve}
                    onCheckedChange={val => setCustomization(p => ({ ...p, hasLongSleeve: val }))}
                  />
                </div>
              </div>
            </div>

            {/* ── PERSONALIZZAZIONE ──────────────────────────────────── */}
            {!product.isMysteryBox && (
              <PdpCustomize
                c={customization}
                set={setCustomization as any}
                canName={!!product.allowsNameOnShirt}
                canNumber={!!product.allowsNumberOnShirt}
                patches={relevantPatches}
                hasShorts={!!product.hasShorts}
                hasSocks={!!product.hasSocks}
                prices={{ player_edition: EXTRAS_PRICES.player_edition, shorts: EXTRAS_PRICES.shorts, socks: EXTRAS_PRICES.socks }}
                toggle={togglePatch}
              />
            )}

            {/* Mystery Box exclusion list */}
            {product.isMysteryBox && (
              <div
                className="cut overflow-hidden"
                style={{ background: "linear-gradient(135deg, rgba(88,28,135,0.6), rgba(49,46,129,0.6))", border: "1px solid rgba(139,92,246,0.3)" }}
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎁</span>
                    <span className="text-sm font-bold text-white">Exclusion List</span>
                  </div>
                  <p className="text-[15px] text-purple-200 leading-relaxed">
                    Indica quali squadre o colori vuoi evitare. Selezioneremo la tua box di conseguenza.
                  </p>
                  <textarea
                    rows={4}
                    value={(customization as any).excludedShirts?.join("\n") || ""}
                    onChange={e => {
                      const lines = e.target.value.split("\n").slice(0, 5).filter(l => l.trim() !== "");
                      setCustomization(p => ({ ...p, excludedShirts: lines }));
                    }}
                    className="w-full rounded-xl border-none bg-black/20 p-3 text-sm font-medium text-white placeholder:text-purple-300 focus:ring-0 resize-none"
                    placeholder="Es. No AC Milan, No maglie gialle..."
                  />
                  <div className="flex justify-between text-[14px] font-bold text-purple-200 tracking-tighter">
                    <span>{(customization as any).excludedShirts?.length || 0} / 5 squadre</span>
                    <span>Personalizzazione garantita</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── CTA BLOCK ──────────────────────────────────────────── */}
            <div className="space-y-3 pb-4">
              {/* Condizioni vere, scritte chiare */}
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2 py-1 text-[15px] font-semibold text-white/90">
                {["Spedizione gratuita, 7-10 giorni", "Reso entro 14 giorni", "Pagamento sicuro", "Tracking via email"].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <span className="mt-[7px] h-2 w-2 shrink-0 bg-[#c8f000]" aria-hidden="true" />
                    {t}
                  </li>
                ))}
              </ul>

              {/* Offerta 3x2 vicino al pulsante: la leva piu forte per aumentare lo scontrino */}
              <Link href="/shop" className="block rounded-2xl bg-[#1b1b19] px-4 py-3.5 text-white shadow-[inset_4px_0_0_#c8f000] transition-colors hover:bg-[#c8f000] hover:text-[#0a0a0a] hover:shadow-none">
                <span className="display text-[22px]">Prendi 3, ne paghi 2</span>
                <span className="mt-0.5 block text-[14px] font-semibold opacity-80">La meno cara è gratis. Scegli altre maglie →</span>
              </Link>

              {/* Quantity + Add to cart + Wishlist */}
              <div className="flex items-center gap-2">
                {/* Qty */}
                <div
                  className="flex items-center cut cut-sm overflow-hidden flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-11 h-12 flex items-center justify-center text-white/80 hover:text-white transition-colors text-lg font-bold"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-white" style={{ fontFamily: "var(--font-display,sans-serif)" }}>
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-11 h-12 flex items-center justify-center text-white/80 hover:text-white transition-colors text-lg font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Add to cart */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 h-12 flex items-center justify-center gap-1.5 cut cut-sm text-[15px] font-bold tracking-tight transition-all active:scale-[0.97]"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    color: "#fff",
                    border: "1.5px solid rgba(200,240,0,0.2)",
                    fontFamily: "var(--font-display,sans-serif)",
                    }}
                >
                  + Carrello
                </button>

                {/* Wishlist */}
                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  className="h-12 w-12 flex items-center justify-center cut cut-sm transition-all active:scale-[0.96] flex-shrink-0"
                  style={{
                    background: inWishlist ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.04)",
                    border: `1.5px solid ${inWishlist ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  {inWishlist
                    ? <HeartIconSolid className="h-5 w-5 text-red-500" />
                    : <HeartIcon className="h-5 w-5 text-white/80" />}
                </button>
              </div>

              {/* Acquisto immediato: il pulsante principale */}
              <button type="button" onClick={handleBuyNow} className="btn btn-lime w-full !h-14 !text-[18px]">
                Compra subito
              </button>

              {/* Payment methods */}
              <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1">
                {["VISA","Mastercard","Apple Pay","Google Pay","Klarna"].map(m => (
                  <span
                    key={m}
                    className="rounded-full px-3 py-1 text-[15px] font-medium"
                    style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)" }}
                  >
                    {m}
                  </span>
                ))}
              </div>

              {/* Discount rules (hidden, auto-apply) */}
              <div className="hidden">
                <DiscountRulesDisplay
                  productId={product._id}
                  productCategory={product.category}
                  onApplyDiscount={() => {}}
                  showToAllUsers={true}
                  autoApply={true}
                />
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
                  {product.description}
                </p>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Tabs: Reviews / Details / FAQ ─────────────────────────────── */}
      <div className="mx-auto w-full max-w-[1760px] px-5 pb-12 md:px-10 lg:px-16">
        <Tabs defaultValue="details">
          <TabsList
            className="w-full gap-0 px-0 justify-between bg-transparent border-b h-14 rounded-none shadow-none pb-0"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            {[
              { value: "details", label: "Dettagli" },
              { value: "ratings", label: "Recensioni" },
              { value: "faq", label: "FAQ" },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex-1 shadow-none rounded-none px-0 font-bold text-[15px] text-white/80
                  data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:bg-transparent
                  data-[state=active]:border-b-2 data-[state=active]:border-b-[#c8f000]"
                style={{ fontFamily: "var(--font-display,sans-serif)" }}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="details" className="pt-6">
            <div className="space-y-5 text-[17px] leading-relaxed text-[var(--text-2)]">
              {product.description && <p className="whitespace-pre-line">{product.description}</p>}
              <ul className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Versione tifoso", "Non è la maglia ufficiale del club: Goal Mania non è affiliata ad alcun club o federazione."],
                  ["Spedizione gratuita", "In Italia, su ogni ordine. Consegna in 7-10 giorni lavorativi, con codice per seguire il pacco."],
                  ["Reso entro 14 giorni", "Maglia non indossata, nella confezione. La spedizione del reso è a tuo carico, salvo maglia difettosa o sbagliata. Le maglie con nome e numero non si possono restituire."],
                  ["Taglie", "Usa la guida taglie con le misure in centimetri. Se sei tra due taglie, prendi la più grande."],
                ].map(([t, d]) => (
                  <li key={t} className="rounded-2xl bg-[var(--wall)] p-4 shadow-[inset_0_0_0_1px_var(--line)]">
                    <span className="block text-[18px] font-bold text-white">{t}</span>
                    <span className="mt-1 block text-[16px]">{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="ratings" className="pt-2">
            <VintedReviews compact />
            {reviews.length > 0 && (
              <ProductReviews product={product} reviews={reviews} onReviewSubmit={handleReviewSubmit} onReviewDelete={handleReviewDelete} />
            )}
          </TabsContent>

          <TabsContent value="faq" className="pt-2">
            <FaqShort title="Domande frequenti" />
          </TabsContent>
        </Tabs>
      </div>

      {/* Galleria ordini reali — foto/video di maglie e pacchi dei clienti */}
      <RealOrdersGallery limit={20} />

      {lightbox && <PdpLightbox images={product.images} index={selectedImage} onIndex={setSelectedImage} onClose={() => setLightbox(false)} title={product.title} />}

      {/* Size Guide Modal */}
      <SizeGuideModal isOpen={sizeChartOpen} onClose={() => setSizeChartOpen(false)} />
    </div>
  );
}
