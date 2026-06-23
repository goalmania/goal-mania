"use client";

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
import FaqSection from "./FaqSection";
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
  "champions-league":  { label: "Champions League", abbr: "UCL",  border: "#FFD700", text: "#FFD700", bg: "rgba(20,18,0,0.95)" },
  "europa-league":     { label: "Europa League",    abbr: "UEL",  border: "#FF6600", text: "#FF8C3F", bg: "rgba(28,10,0,0.95)" },
  "conference-league": { label: "Conference League",abbr: "UECL", border: "#00A651", text: "#3DCA7A", bg: "rgba(0,18,8,0.95)"  },
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
      className="patch-card relative flex flex-col gap-2 p-3 rounded-2xl transition-all active:scale-[0.97] text-left"
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
          className="text-[9px] font-black uppercase tracking-widest"
          style={{ color: cfg.text, fontFamily: "var(--font-mono, monospace)" }}
        >
          {cfg.abbr}
        </span>
      </div>
      {/* Name */}
      <span
        className="text-[11px] font-black leading-tight pr-5"
        style={{
          color: selected ? "#fff" : "rgba(255,255,255,0.55)",
          fontFamily: "var(--font-display, sans-serif)",
          letterSpacing: "0.5px",
        }}
      >
        {cfg.label}
      </span>
      {/* Price */}
      <span
        className="text-[10px] font-black"
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
      className="relative h-11 min-w-[44px] px-3 rounded-xl text-[12px] font-black transition-all active:scale-[0.96]"
      style={{
        background: selected ? "#c8f000" : "rgba(255,255,255,0.04)",
        color: selected ? "#000" : "rgba(255,255,255,0.5)",
        border: `1.5px solid ${selected ? "#c8f000" : "rgba(255,255,255,0.08)"}`,
        fontFamily: "var(--font-display, sans-serif)",
        letterSpacing: "0.5px",
        boxShadow: selected ? "0 4px 16px rgba(200,240,0,0.25)" : "none",
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
          className="text-[9px] font-black"
          style={{ color: "#c8f000", fontFamily: "var(--font-mono, monospace)" }}
        >
          {n}
        </span>
      </div>
      <span
        className="text-[10px] font-black uppercase tracking-[2px]"
        style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-display, sans-serif)" }}
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
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const [quantity, setQuantity] = useState(1);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [viewers] = useState(() => Math.floor(Math.random() * 20) + 8);
  const [soldThisWeek] = useState(() => Math.floor(Math.random() * 20) + 15);
  const [deliveryCountdown, setDeliveryCountdown] = useState("");
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

  // Delivery countdown
  useEffect(() => {
    function build() {
      const now = new Date();
      const cutoff = new Date(); cutoff.setHours(18, 0, 0, 0);
      if (now >= cutoff) { setDeliveryCountdown(""); return; }
      const rem = cutoff.getTime() - now.getTime();
      const h = Math.floor(rem / 3600000);
      const m = Math.floor((rem % 3600000) / 60000);
      const days = ["Dom","Lun","Mar","Mer","Gio","Ven","Sab"];
      const months = ["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"];
      const target = new Date(now);
      target.setDate(target.getDate() + (now < cutoff ? 0 : 1));
      let wd = 0; const t = new Date(target);
      while (wd < 4) { t.setDate(t.getDate() + 1); if (t.getDay() !== 0 && t.getDay() !== 6) wd++; }
      setDeliveryCountdown(`Ordina entro ${h}h ${m}m → consegna entro ${days[t.getDay()]} ${t.getDate()} ${months[t.getMonth()]}`);
    }
    build();
    const id = setInterval(build, 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setMounted(true);
    if (product.reviews) setReviews(product.reviews);
    // Track product view once on mount
    trackEvent("product_view", {
      productId: product._id,
      productSlug: product.slug || product._id,
      value: Number(product.basePrice) || 0,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product._id]);

  if (!mounted) return null;

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
        hasCustomization: hasCustom,
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
    trackEvent("checkout_start", {
      productId: product._id,
      productSlug: product.slug || product._id,
      value: totalPrice,
    });
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

  const inWishlist = isInWishlist(product._id);

  return (
    <div className="min-h-screen" style={{ background: "#080808" }}>

      {/* ── Sticky Mobile CTA ──────────────────────────────────────────── */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: "rgba(8,8,8,0.96)",
          borderTop: "1px solid rgba(200,240,0,0.12)",
          backdropFilter: "blur(24px)",
        }}
      >
        {customization.size && (
          <div
            className="flex items-center justify-center gap-2 py-1.5 border-b"
            style={{ borderColor: "rgba(255,255,255,0.04)" }}
          >
            <span className="text-[9px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-mono,monospace)" }}>
              Taglia:
            </span>
            <span
              className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: "rgba(200,240,0,0.12)", color: "#c8f000", fontFamily: "var(--font-mono,monospace)" }}
            >
              {customization.size}
            </span>
            <span className="text-[9px] font-black" style={{ color: "rgba(255,255,255,0.3)" }}>
              · €{totalPrice.toFixed(2)}
            </span>
          </div>
        )}
        <div className="flex gap-2.5 p-3">
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 h-12 flex items-center justify-center rounded-2xl text-[11px] font-black uppercase tracking-tight transition-all active:scale-[0.97]"
            style={{
              background: "rgba(255,255,255,0.05)",
              color: "#fff",
              border: "1.5px solid rgba(200,240,0,0.2)",
              fontFamily: "var(--font-display,sans-serif)",
              letterSpacing: "1px",
            }}
          >
            + Carrello
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            className="flex-[2] h-12 flex items-center justify-center gap-1.5 rounded-2xl text-[12px] font-black uppercase tracking-tight transition-all active:scale-[0.97]"
            style={{
              background: "#c8f000",
              color: "#000",
              fontFamily: "var(--font-display,sans-serif)",
              letterSpacing: "1.5px",
              boxShadow: "0 4px 20px rgba(200,240,0,0.3)",
            }}
          >
            Compra Subito →
          </button>
        </div>
      </div>

      {/* ── Main Grid ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 lg:pb-12">
        <div className="lg:grid lg:grid-cols-[1fr_1fr] lg:gap-14 xl:gap-20">

          {/* ── LEFT: Image Gallery ────────────────────────────────────── */}
          <div className="lg:sticky lg:top-6 lg:self-start mb-6 lg:mb-0">
            {/* Main image */}
            <div
              className="relative w-full rounded-[28px] overflow-hidden"
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
                <span className="text-[10px] font-black text-white" style={{ fontFamily: "var(--font-mono,monospace)" }}>
                  {selectedImage + 1}/{product.images.length}
                </span>
              </div>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImage(i)}
                    className="flex-shrink-0 rounded-xl overflow-hidden transition-all active:scale-[0.96]"
                    style={{
                      width: 60,
                      height: 60,
                      border: `2px solid ${i === selectedImage ? "#c8f000" : "rgba(255,255,255,0.08)"}`,
                      background: "#F7F7F7",
                      opacity: i === selectedImage ? 1 : 0.55,
                    }}
                  >
                    <Image src={imgErrors[i] ? "/images/placeholder.png" : (cloudinaryOpt(img, 120) || "/images/placeholder.png")} alt="" width={60} height={60} unoptimized className="object-contain w-full h-full p-1" onError={() => setImgErrors(prev => ({ ...prev, [i]: true }))} />
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
              <h1
                className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-none mb-3"
                style={{ fontFamily: "var(--font-display,sans-serif)" }}
              >
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
                  <span className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-mono,monospace)" }}>
                    {avgRating.toFixed(1)} · {reviews.length} recension{reviews.length === 1 ? "e" : "i"}
                  </span>
                </div>
              )}

              {/* Price block */}
              <div
                className="flex items-baseline gap-3 p-4 rounded-2xl"
                style={{ background: "rgba(200,240,0,0.04)", border: "1px solid rgba(200,240,0,0.08)" }}
              >
                <span className="text-4xl font-black text-white" style={{ fontFamily: "var(--font-display,sans-serif)" }}>
                  €{totalPrice.toFixed(2)}
                </span>
                {quantity > 1 && (
                  <span className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.35)" }}>
                    ({quantity}× €{unitPrice.toFixed(2)})
                  </span>
                )}
                <span className="text-[10px] font-black uppercase tracking-widest ml-auto" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-mono,monospace)" }}>
                  IVA incl.
                </span>
              </div>

              {/* Customization summary chips */}
              {(customization.isPlayerEdition || customization.hasLongSleeve ||
                customization.includeShorts || customization.includeSocks ||
                customization.selectedPatches.length > 0) && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {customization.isPlayerEdition && (
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(200,240,0,0.1)", color: "#c8f000", fontFamily: "var(--font-mono,monospace)" }}>
                      Player +€{EXTRAS_PRICES.player_edition}
                    </span>
                  )}
                  {customization.hasLongSleeve && (
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(200,240,0,0.1)", color: "#c8f000", fontFamily: "var(--font-mono,monospace)" }}>
                      Manica lunga +€{EXTRAS_PRICES.long_sleeve}
                    </span>
                  )}
                  {customization.includeShorts && (
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(200,240,0,0.1)", color: "#c8f000", fontFamily: "var(--font-mono,monospace)" }}>
                      Pantaloncini +€{EXTRAS_PRICES.shorts}
                    </span>
                  )}
                  {customization.includeSocks && (
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(200,240,0,0.1)", color: "#c8f000", fontFamily: "var(--font-mono,monospace)" }}>
                      Calzettoni +€{EXTRAS_PRICES.socks}
                    </span>
                  )}
                  {customization.selectedPatches.map(p => {
                    const cfg = COMP[p.category] || COMP["other"];
                    return (
                      <span key={p._id} className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: `${cfg.border}18`, color: cfg.text, fontFamily: "var(--font-mono,monospace)" }}>
                        {cfg.abbr} +€{p.price}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Social proof + urgency */}
            <div
              className="grid grid-cols-2 gap-2 p-3 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c8f000] animate-pulse flex-shrink-0" />
                <span className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {viewers} guardando ora
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px]">✅</span>
                <span className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {soldThisWeek} venduti
                </span>
              </div>
              {product.stockQuantity !== undefined && product.stockQuantity > 0 && product.stockQuantity < 5 && (
                <div className="col-span-2 flex items-center gap-2">
                  <span className="text-[11px] animate-pulse">⚠️</span>
                  <span className="text-[11px] font-black" style={{ color: "#fb923c" }}>
                    Solo {product.stockQuantity} rimast{product.stockQuantity === 1 ? "o" : "i"}!
                  </span>
                </div>
              )}
              {deliveryCountdown && (
                <div className="col-span-2 flex items-center gap-2">
                  <span className="text-[11px]">⚡</span>
                  <span className="text-[11px] font-bold" style={{ color: "#c8f000" }}>{deliveryCountdown}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {product.description}
                </p>
              </div>
            )}

            {/* ── CUSTOMIZATION SECTION ──────────────────────────────── */}
            {!product.isMysteryBox && (
              <div
                className="rounded-[24px] overflow-hidden"
                style={{ border: "1px solid rgba(200,240,0,0.1)", background: "rgba(200,240,0,0.015)" }}
              >
                <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(200,240,0,0.08)" }}>
                  <span
                    className="text-[9px] font-black uppercase tracking-[3px]"
                    style={{ color: "#c8f000", fontFamily: "var(--font-mono,monospace)" }}
                  >
                    // Personalizza la tua maglia
                  </span>
                </div>

                <div className="p-4 space-y-6">

                  {/* STEP 1: Tipo maglia */}
                  <div>
                    <StepLabel n={1} label="Tipo di maglia" />
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "fan", label: "Edizione tifoso", price: 0, active: !customization.isPlayerEdition },
                        { id: "player", label: "Edizione giocatore", price: EXTRAS_PRICES.player_edition, active: customization.isPlayerEdition },
                      ].map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setCustomization(p => ({ ...p, isPlayerEdition: opt.id === "player" }))}
                          className="flex flex-col items-center justify-center p-3.5 rounded-2xl transition-all active:scale-[0.97]"
                          style={{
                            background: opt.active ? "#c8f000" : "rgba(255,255,255,0.03)",
                            border: `1.5px solid ${opt.active ? "#c8f000" : "rgba(255,255,255,0.08)"}`,
                            transition: "all 160ms cubic-bezier(0.23,1,0.32,1)",
                          }}
                        >
                          <span
                            className="text-[12px] font-black"
                            style={{
                              color: opt.active ? "#000" : "rgba(255,255,255,0.6)",
                              fontFamily: "var(--font-display,sans-serif)",
                            }}
                          >
                            {opt.label}
                          </span>
                          {opt.price > 0 && (
                            <span
                              className="text-[10px] font-black mt-0.5"
                              style={{ color: opt.active ? "#000" : "rgba(200,240,0,0.6)" }}
                            >
                              +€{opt.price}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* STEP 2: Nome e Numero */}
                  {(product.allowsNameOnShirt || product.allowsNumberOnShirt) && (
                    <div>
                      <StepLabel n={2} label="Nome e numero" />
                      <div className="grid grid-cols-3 gap-2">
                        {product.allowsNameOnShirt && (
                          <div className="col-span-2 space-y-1.5">
                            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-mono,monospace)" }}>Nome</span>
                            <input
                              type="text"
                              value={customization.name}
                              onChange={e => setCustomization(p => ({ ...p, name: e.target.value.toUpperCase() }))}
                              maxLength={20}
                              placeholder="MARADONA"
                              className="w-full rounded-xl px-3.5 py-2.5 text-sm font-black text-white placeholder:text-white/20 outline-none focus:ring-1 focus:ring-[#c8f000]/30"
                              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "var(--font-display,sans-serif)" }}
                            />
                          </div>
                        )}
                        {product.allowsNumberOnShirt && (
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-mono,monospace)" }}>N°</span>
                            <input
                              type="text"
                              value={customization.number}
                              onChange={e => setCustomization(p => ({ ...p, number: e.target.value.replace(/[^0-9]/g, "").slice(0, 2) }))}
                              maxLength={2}
                              placeholder="10"
                              className="w-full rounded-xl px-3.5 py-2.5 text-sm font-black text-white text-center placeholder:text-white/20 outline-none focus:ring-1 focus:ring-[#c8f000]/30"
                              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "var(--font-display,sans-serif)" }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Patch */}
                  {relevantPatches.length > 0 && (
                    <div>
                      <StepLabel n={3} label={`Patch competizioni (${relevantPatches.length} disponibili)`} />
                      <div className="grid grid-cols-2 gap-2">
                        {relevantPatches.map(patch => (
                          <PatchCard
                            key={patch._id}
                            patch={patch}
                            selected={customization.selectedPatches.some(p => p._id === patch._id)}
                            onToggle={() => togglePatch(patch)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Extras (shorts / socks) */}
                  {(product.hasShorts || product.hasSocks) && (
                    <div>
                      <StepLabel n={relevantPatches.length > 0 ? 4 : 3} label="Completa il kit" />
                      <div className="flex flex-wrap gap-2">
                        {product.hasShorts && (
                          <button
                            type="button"
                            onClick={() => setCustomization(p => ({ ...p, includeShorts: !p.includeShorts }))}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-full transition-all active:scale-[0.96]"
                            style={{
                              background: customization.includeShorts ? "rgba(200,240,0,0.12)" : "rgba(255,255,255,0.03)",
                              border: `1.5px solid ${customization.includeShorts ? "#c8f000" : "rgba(255,255,255,0.08)"}`,
                            }}
                          >
                            <span className="text-[11px] font-black" style={{ color: customization.includeShorts ? "#c8f000" : "rgba(255,255,255,0.5)" }}>
                              + Pantaloncini
                            </span>
                            <span className="text-[10px] font-black" style={{ color: "rgba(200,240,0,0.6)" }}>
                              +€{EXTRAS_PRICES.shorts}
                            </span>
                          </button>
                        )}
                        {product.hasSocks && (
                          <button
                            type="button"
                            onClick={() => setCustomization(p => ({ ...p, includeSocks: !p.includeSocks }))}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-full transition-all active:scale-[0.96]"
                            style={{
                              background: customization.includeSocks ? "rgba(200,240,0,0.12)" : "rgba(255,255,255,0.03)",
                              border: `1.5px solid ${customization.includeSocks ? "#c8f000" : "rgba(255,255,255,0.08)"}`,
                            }}
                          >
                            <span className="text-[11px] font-black" style={{ color: customization.includeSocks ? "#c8f000" : "rgba(255,255,255,0.5)" }}>
                              + Calzettoni
                            </span>
                            <span className="text-[10px] font-black" style={{ color: "rgba(200,240,0,0.6)" }}>
                              +€{EXTRAS_PRICES.socks}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* Mystery Box exclusion list */}
            {product.isMysteryBox && (
              <div
                className="rounded-[24px] overflow-hidden"
                style={{ background: "linear-gradient(135deg, rgba(88,28,135,0.6), rgba(49,46,129,0.6))", border: "1px solid rgba(139,92,246,0.3)" }}
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎁</span>
                    <span className="text-sm font-black uppercase tracking-wider text-white">Exclusion List</span>
                  </div>
                  <p className="text-[11px] text-purple-200 leading-relaxed">
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
                  <div className="flex justify-between text-[10px] font-bold text-purple-200 uppercase tracking-tighter">
                    <span>{(customization as any).excludedShirts?.length || 0} / 5 squadre</span>
                    <span>Personalizzazione garantita</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── SIZE + SLEEVE ─────────────────────────────────────── */}
            <div
              className="rounded-[24px] overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.015)" }}
            >
              <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <span className="text-[9px] font-black uppercase tracking-[3px]" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-mono,monospace)" }}>
                  // Taglia
                </span>
                <button
                  type="button"
                  onClick={() => setSizeChartOpen(true)}
                  className="text-[10px] font-black"
                  style={{ color: "#c8f000", textDecoration: "underline", fontFamily: "var(--font-mono,monospace)" }}
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
                        className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
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
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-tight flex items-center gap-1">
                    <span>⚠️</span> {errors.size}
                  </p>
                )}

                {/* Long sleeve toggle */}
                <div
                  className="flex items-center justify-between p-3.5 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div>
                    <p className="text-[12px] font-black text-white" style={{ fontFamily: "var(--font-display,sans-serif)" }}>
                      Manica lunga
                    </p>
                    <p className="text-[10px] font-black" style={{ color: "rgba(200,240,0,0.6)", fontFamily: "var(--font-mono,monospace)" }}>
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

            {/* ── CTA BLOCK ──────────────────────────────────────────── */}
            <div className="space-y-3 pb-4">
              {/* Trust row */}
              <div
                className="grid grid-cols-4 gap-1 py-3 px-2 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                {[
                  { icon: "🚚", label: "Sped. Gratuita", sub: "Sopra €89" },
                  { icon: "🔄", label: "Reso 30gg", sub: "Gratuito" },
                  { icon: "🔒", label: "Pagamento", sub: "Sicuro SSL" },
                  { icon: "⭐", label: "Qualità", sub: "Garantita" },
                ].map(({ icon, label, sub }) => (
                  <div key={label} className="flex flex-col items-center gap-0.5 text-center">
                    <span className="text-base">{icon}</span>
                    <span className="text-[9px] font-black text-white leading-tight" style={{ fontFamily: "var(--font-display,sans-serif)" }}>{label}</span>
                    <span className="text-[8px] leading-tight" style={{ color: "rgba(200,240,0,0.5)", fontFamily: "var(--font-mono,monospace)" }}>{sub}</span>
                  </div>
                ))}
              </div>

              {/* Quantity + Add to cart + Wishlist */}
              <div className="flex items-center gap-2">
                {/* Qty */}
                <div
                  className="flex items-center rounded-2xl overflow-hidden flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-11 h-12 flex items-center justify-center text-white/60 hover:text-white transition-colors text-lg font-bold"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-black text-white" style={{ fontFamily: "var(--font-display,sans-serif)" }}>
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-11 h-12 flex items-center justify-center text-white/60 hover:text-white transition-colors text-lg font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Add to cart */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 h-12 flex items-center justify-center gap-1.5 rounded-2xl text-[11px] font-black uppercase tracking-tight transition-all active:scale-[0.97]"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    color: "#fff",
                    border: "1.5px solid rgba(200,240,0,0.2)",
                    fontFamily: "var(--font-display,sans-serif)",
                    letterSpacing: "1px",
                  }}
                >
                  + Carrello
                </button>

                {/* Wishlist */}
                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  className="h-12 w-12 flex items-center justify-center rounded-2xl transition-all active:scale-[0.96] flex-shrink-0"
                  style={{
                    background: inWishlist ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.04)",
                    border: `1.5px solid ${inWishlist ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  {inWishlist
                    ? <HeartIconSolid className="h-5 w-5 text-red-500" />
                    : <HeartIcon className="h-5 w-5 text-white/40" />}
                </button>
              </div>

              {/* BUY NOW — primary CTA */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full h-14 flex items-center justify-center gap-2 rounded-[20px] text-[14px] font-black uppercase tracking-[2px] transition-all active:scale-[0.98] hidden lg:flex"
                style={{
                  background: "#c8f000",
                  color: "#000",
                  boxShadow: "0 8px 32px rgba(200,240,0,0.28)",
                  fontFamily: "var(--font-display,sans-serif)",
                }}
              >
                COMPRA SUBITO →
              </button>

              {/* Payment methods */}
              <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1">
                {["VISA","Mastercard","PayPal","Apple Pay","Google Pay","Klarna"].map(m => (
                  <span
                    key={m}
                    className="text-[8px] font-black px-2 py-1 rounded tracking-widest"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      color: "rgba(255,255,255,0.25)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      fontFamily: "var(--font-mono,monospace)",
                    }}
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
          </div>
        </div>
      </div>

      {/* ── Trust Strip ────────────────────────────────────────────────── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "#0d0d0d" }}>
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "🚚", label: "Spedizione Gratuita", sub: "Per ordini sopra €89" },
              { icon: "🔄", label: "Reso Gratuito", sub: "Entro 30 giorni" },
              { icon: "🔒", label: "Pagamento Sicuro", sub: "Crittografia SSL 256-bit" },
              { icon: "⭐", label: "Qualità Garantita", sub: "Soddisfatti o rimborsati" },
            ].map(({ icon, label, sub }) => (
              <div
                key={label}
                className="flex items-center gap-3 p-4 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <span className="text-2xl flex-shrink-0">{icon}</span>
                <div>
                  <p className="text-[11px] font-black uppercase text-white" style={{ fontFamily: "var(--font-display,sans-serif)", letterSpacing: "0.5px" }}>
                    {label}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: "rgba(200,240,0,0.45)", fontFamily: "var(--font-mono,monospace)" }}>
                    {sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs: Reviews / Details / FAQ ─────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        <Tabs defaultValue="ratings">
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
                className="flex-1 shadow-none rounded-none px-0 font-black text-[11px] uppercase tracking-widest text-white/40
                  data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:bg-transparent
                  data-[state=active]:border-b-2 data-[state=active]:border-b-[#c8f000]"
                style={{ fontFamily: "var(--font-display,sans-serif)" }}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="details" className="pt-6">
            <div className="space-y-3 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              {product.description && <p className="leading-relaxed">{product.description}</p>}
              <ul className="space-y-2 mt-4">
                {[
                  "Materiale premium di alta qualità",
                  "Cuciture rinforzate per maggiore durabilità",
                  "Tessuto traspirante e leggero",
                  "Lavabile in lavatrice (30°C)",
                ].map(feat => (
                  <li key={feat} className="flex items-start gap-2">
                    <span style={{ color: "#c8f000" }}>✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="ratings" className="pt-4">
            <ProductReviews
              product={product}
              reviews={reviews}
              onReviewSubmit={handleReviewSubmit}
              onReviewDelete={handleReviewDelete}
            />
          </TabsContent>

          <TabsContent value="faq" className="pt-4">
            <FaqSection />
          </TabsContent>
        </Tabs>
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal isOpen={sizeChartOpen} onClose={() => setSizeChartOpen(false)} />
    </div>
  );
}
