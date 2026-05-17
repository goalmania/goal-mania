"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { HeartIcon } from "@heroicons/react/24/outline";

import { Layers } from "lucide-react";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useCartStore } from "@/lib/store/cart";
import { IProduct, Review, Patch } from "@/lib/types/product";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";

// Define interface for actual patch objects
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

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { ProductSizeChart } from "@/app/_components/ProductSizeChart";
import ProductReviews from "@/app/_components/ProductReviews";
import DiscountRulesDisplay from "@/app/_components/DiscountRulesDisplay";
import SizeGuideModal from "@/components/shop/SizeGuideModal";
import {
  ArrowRight,
  MinusIcon,
  PlusIcon,
} from "lucide-react";
import { useI18n } from "@/lib/hooks/useI18n";
import FaqSection from "./FaqSection";

const PATCH_PRICES = {
  "europa-league": 3,
  "serie-a": 3,
  "champions-league": 3,
  "coppa-italia": 3,
} as const;

const EXTRAS_PRICES = {
  shorts: 11,
  socks: 17,
  player_edition: 5,
  long_sleeve: 10,
  shorts_socks: 13,
};

export default function ProductDetailClient({
  product,
}: {
  product: IProduct & { patches?: PatchObject[] };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [errors, setErrors] = useState<{
    size?: string;
  }>({});
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [viewers, setViewers] = useState(() => Math.floor(Math.random() * 30) + 30);
  const [soldThisWeek] = useState(() => Math.floor(Math.random() * 20) + 15);
  const [deliveryCountdown, setDeliveryCountdown] = useState("");
  const { t } = useI18n();
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlistStore();
  const { addItem: addToCart, buyItem } = useCartStore();

  // Helper function to check if status is loading
  const isStatusLoading = () => status === "loading";

  const unitPrice = useMemo(() => {
    const base = Number(product.basePrice) || 0;
    const patchTotal = customization.selectedPatches.reduce((acc, p) => acc + p.price, 0);
    const extras =
      (customization.isPlayerEdition ? EXTRAS_PRICES.player_edition : 0) +
      (customization.hasLongSleeve ? EXTRAS_PRICES.long_sleeve : 0) +
      (customization.includeShorts ? EXTRAS_PRICES.shorts : 0) +
      (customization.includeSocks ? EXTRAS_PRICES.socks : 0);

    return base + patchTotal + extras;
  }, [product.basePrice, customization]);

  const calculateTotalPrice = () => unitPrice * quantity;

  useEffect(() => {
    setMounted(true);
    if (product.reviews) {
      setReviews(product.reviews);
    }
  }, [product.reviews]);

  useEffect(() => {
    const interval = setInterval(() => {
      setViewers((v) => {
        const delta = Math.random() < 0.5 ? 1 : -1;
        return Math.max(4, Math.min(23, v + delta));
      });
    }, Math.random() * 30000 + 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function buildCountdown() {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setHours(18, 0, 0, 0);

      let deliveryDate = new Date(now);
      // If past cutoff, ship next working day
      if (now >= cutoff) deliveryDate.setDate(deliveryDate.getDate() + 1);
      // Skip weekends for shipping
      while (deliveryDate.getDay() === 0 || deliveryDate.getDay() === 6)
        deliveryDate.setDate(deliveryDate.getDate() + 1);
      // Add 3-5 working days for delivery
      let workingDaysAdded = 0;
      const target = new Date(deliveryDate);
      while (workingDaysAdded < 4) {
        target.setDate(target.getDate() + 1);
        if (target.getDay() !== 0 && target.getDay() !== 6) workingDaysAdded++;
      }

      const remaining = cutoff.getTime() - now.getTime();
      if (remaining <= 0) {
        setDeliveryCountdown("");
        return;
      }
      const h = Math.floor(remaining / 3600000);
      const m = Math.floor((remaining % 3600000) / 60000);
      const dayNames = ["Domenica","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato"];
      const monthNames = ["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"];
      const dateStr = `${dayNames[target.getDay()]} ${target.getDate()} ${monthNames[target.getMonth()]}`;
      setDeliveryCountdown(`Ordina entro ${h}h ${m}m per riceverlo entro ${dateStr}`);
    }
    buildCountdown();
    const timer = setInterval(buildCountdown, 60000);
    return () => clearInterval(timer);
  }, []);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const handleAddToCart = () => {
    // Reset previous errors
    setErrors({});

    // Validate size selection
    if (!customization.size) {
      setErrors({ size: "Seleziona una taglia prima di aggiungere al carrello" });
      toast.error("Seleziona una taglia prima di aggiungere al carrello");
      return;
    }

    // Toast is already handled by the cart store
    const calculatedPrice = calculateTotalPrice();

    // Generate a unique ID for this customized product
    // This ensures different customizations are added as separate items
    const customizationHash = JSON.stringify({
      name: customization.name,
      number: customization.number,
      patches: customization.selectedPatches,
      shorts: customization.includeShorts,
      socks: customization.includeSocks,
      playerEdition: customization.isPlayerEdition,
      size: customization.size,
      longSleeve: customization.hasLongSleeve,
      isKidSize: customization.isKidSize,
    });

    const hasCustomization = !!(
      customization.name ||
      customization.number ||
      customization.isPlayerEdition ||
      customization.size ||
      customization.includeShorts ||
      customization.hasLongSleeve ||
      customization.includeSocks ||
      customization.selectedPatches.length > 0
    );

    // Create a unique ID for each customized product
    const itemId = hasCustomization
      ? `${product._id}_${customizationHash
          .split("")
          .reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)}`
      : product._id;

    addToCart({
      id: itemId,
      name: product.title,
      price: calculatedPrice,
      image: product.images[selectedImage], // Use the currently selected image
      customization: {
        name: customization.name,
        number: customization.number,
        selectedPatches: customization.selectedPatches.map((p) => p.category as Patch),
        includeShorts: customization.includeShorts,
        hasLongSleeve: customization.hasLongSleeve,
        includeSocks: customization.includeSocks,
        isPlayerEdition: customization.isPlayerEdition,
        size: customization.size,
        isKidSize: customization.isKidSize,
        hasCustomization: hasCustomization,
        excludedShirts: customization.excludedShirts,
      },
      quantity,
    });
  };

  const handleBuyNow = () => {
    // Reset previous errors
    setErrors({});

    // Validate size selection
    if (!customization.size) {
      setErrors({ size: "Seleziona una taglia prima di procedere" });
      toast.error("Seleziona una taglia prima di procedere");
      return;
    }

    handleAddToCart();
    router.push("/checkout");
  };

  const handleWishlistToggle = () => {
    const productId = product._id;
    // Toast is already handled by the wishlist store
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist({
        id: productId,
        name: product.title,
        price: product.basePrice,
        image: product.images[selectedImage],
        team: product.title.split(" ")[0],
      });
    }
  };

  const handleReviewSubmit = async (reviewData: any) => {
    const response = await fetch(`/api/products/${product._id}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reviewData),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401) {
        signIn();
        throw new Error("Sessione scaduta. Effettua di nuovo il login.");
      } else {
        throw new Error(error.error || "Impossibile inviare la recensione");
      }
    }

    // Fetch updated reviews
    const updatedReviewsResponse = await fetch(`/api/products/${product._id}/reviews`);
    if (!updatedReviewsResponse.ok) {
      throw new Error("Failed to fetch updated reviews");
    }

    const updatedReviews = await updatedReviewsResponse.json();
    setReviews(updatedReviews);
  };

  const handleReviewDelete = async (reviewId: string) => {
    // Remove the review from local state immediately for optimistic update
    setReviews((prevReviews) => prevReviews.filter((review) => review._id !== reviewId));

    // Fetch updated reviews to ensure consistency
    try {
      const updatedReviewsResponse = await fetch(`/api/products/${product._id}/reviews`);
      if (updatedReviewsResponse.ok) {
        const updatedReviews = await updatedReviewsResponse.json();
        setReviews(updatedReviews);
      }
    } catch (error) {
      console.error("Error fetching updated reviews after deletion:", error);
    }
  };

  const trustBadges = [
    { icon: "🚚", label: "Spedizione Gratuita", sub: "Sopra €89" },
    { icon: "↩️", label: "Reso 30gg", sub: "Gratuito" },
    { icon: "🔒", label: "Pag. Sicuro", sub: "SSL 256-bit" },
    { icon: "✅", label: "Originale", sub: "Garantito" },
  ];

  return (
    <div className="bg-[#0a0a0a] font-munish">
      {/* Sticky mobile bottom bar */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t"
        style={{ background: "rgba(10,10,10,0.97)", borderColor: "rgba(200,240,0,0.12)", backdropFilter: "blur(20px)" }}
      >
        {customization.size && (
          <div className="flex items-center justify-center gap-2 py-1.5 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <span className="text-[9px] uppercase tracking-widest text-white/30" style={{ fontFamily: "var(--font-mono, monospace)" }}>
              Taglia selezionata:
            </span>
            <span
              className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: "rgba(200,240,0,0.12)", color: "#c8f000", fontFamily: "var(--font-mono, monospace)" }}
            >
              {customization.size}
            </span>
          </div>
        )}
        <div className="flex gap-2 p-3">
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 h-12 flex items-center justify-center gap-2 rounded-2xl text-[11px] font-black uppercase tracking-tight transition-all active:scale-95"
            style={{
              background: "#0d0d0d",
              color: "#fff",
              border: "1.5px solid rgba(200,240,0,0.2)",
              fontFamily: "var(--font-display, sans-serif)",
            }}
          >
            + Carrello
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            className="flex-1 h-12 flex items-center justify-center rounded-2xl text-[11px] font-black uppercase tracking-tight transition-all active:scale-[0.98]"
            style={{
              background: "#c8f000",
              color: "#000",
              boxShadow: "0 4px 20px rgba(200,240,0,0.3)",
              fontFamily: "var(--font-display, sans-serif)",
              letterSpacing: "1px",
            }}
          >
            Compra Subito →
          </button>
        </div>
      </div>

      {/* Product details section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-18 pb-6 sm:pt-22 sm:pb-6">
        {/* Image gallery - takes 3 columns on large screens */}
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-8 lg:gap-12 space-evenly">
          {/* Left Column (Desktop) / Top Section (Mobile): Media Gallery */}
          <div className="w-full lg:sticky lg:top-8 order-2 lg:order-1">
            <div className="flex flex-col items-center lg:items-start space-y-4">
              {/* Main Image Stage - Capped for normal sizing */}
              <div className="relative aspect-[1/1] w-full max-w-[380px] mx-auto sm:max-w-[420px] overflow-hidden rounded-[24px] bg-[#FBFBFB] border border-gray-100 shadow-sm">
                <Image
                  src={product.images[selectedImage] || "/images/placeholder.png"}
                  alt={product.title}
                  fill
                  className="object-contain p-4 transition-transform duration-500 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 400px"
                  priority
                />

                {/* Subtle Counter */}
                <div className="absolute bottom-4 right-4 bg-[#0a0a0a]/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-black/5">
                  <p className="text-[10px] font-bold tracking-tight text-white">
                    {selectedImage + 1} / {product.images.length}
                  </p>
                </div>
              </div>

              {/* Thumbnails Scroller - More compact */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full max-w-[380px] sm:max-w-[420px]">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative w-14 h-18 sm:w-16 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                        index === selectedImage
                          ? "border-black scale-105 shadow-sm"
                          : "border-transparent opacity-60"
                      }`}
                    >
                      <Image
                        src={image}
                        alt="thumbnail"
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Videos - More compact preview */}
              {product.videos && product.videos.length > 0 && (
                <div className="w-full max-w-[380px] sm:max-w-[420px] pt-1">
                  <h3 className="text-[9px] font-black uppercase tracking-[0.15em] text-white/40 mb-2">
                    Anteprima Video
                  </h3>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {product.videos.map((videoUrl, index) => (
                      <div
                        key={index}
                        className="relative w-[180px] aspect-video flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-black"
                      >
                        <video
                          src={videoUrl}
                          className="w-full h-full object-cover"
                          preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="w-6 h-6 bg-[#0a0a0a]/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[7px] border-l-white border-b-[4px] border-b-transparent ml-0.5" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Desktop) / Header Section (Mobile): Product Info */}
          <div className="w-full space-y-6 order-1 lg:order-2">
            <div className="space-y-4">
              {/* Badge & Title */}
              <div className="space-y-2">
                {product.isMysteryBox && (
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                    🎁 Mystery Box
                  </Badge>
                )}
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                  {product.title}
                </h1>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-bold text-white">
                  €{(calculateTotalPrice() * quantity).toFixed(2)}
                </p>
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                  IVA Inclusa
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-green-500 font-medium py-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2">
                  <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/>
                  <rect x="9" y="11" width="14" height="10" rx="1"/>
                  <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                </svg>
                <span>Spedizione gratuita in Italia — Consegna 3-5 giorni lavorativi</span>
              </div>

              {/* Social proof */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 text-sm text-[#c8f000]">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#c8f000] animate-pulse flex-shrink-0" />
                  <span>⚡ {viewers} persone stanno guardando</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <span>✅ {soldThisWeek} venduti questa settimana</span>
                </div>
              </div>

              {/* Urgency: low stock */}
              {product.stockCount !== undefined && product.stockCount > 0 && product.stockCount < 5 && (
                <div
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
                  style={{ background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.25)", color: "#fb923c" }}
                >
                  <span className="animate-pulse">⚠️</span>
                  Solo {product.stockCount} rimast{product.stockCount === 1 ? "o" : "i"} in magazzino!
                </div>
              )}

              <div className="text-xs text-white/50 font-medium">
                ⏱ {deliveryCountdown}
              </div>

              <hr className="border-gray-100" />

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  Description
                </h3>
                <div className="prose prose-sm text-white/60 leading-relaxed max-w-none">
                  {product.description}
                </div>
              </div>

              <div className="grid grid-cols-1 px-4 space-evenly gap-x-8 gap-y-10 lg:col-span-3 order-2 lg:order-2">
                <div>
                  {/* Customization options */}
                  <div className="space-y-8">
                    {/* Section Header */}
                    <div className="space-y-1">
                      <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#c8f000]">
                        {t("products.customizeYourJersey")}
                      </h2>
                      <div className="h-1 w-10 bg-[#c8f000] rounded-full" />
                    </div>

                    {/* Jersey Edition Selection */}
                    {!product.isMysteryBox && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-white">
                          {t("products.jerseyType")}
                        </h3>
                        <RadioGroup
                          value={customization.isPlayerEdition ? "player" : "fan"}
                          onValueChange={(val) =>
                            setCustomization((prev) => ({
                              ...prev,
                              isPlayerEdition: val === "player",
                            }))
                          }
                          className="grid grid-cols-2 gap-4"
                        >
                          {[
                            { id: "fan", label: t("products.fanEdition"), price: 0 },
                            {
                              id: "player",
                              label: t("products.playerEdition"),
                              price: EXTRAS_PRICES.player_edition,
                            },
                          ].map((edition) => (
                            <div key={edition.id}>
                              <RadioGroupItem
                                value={edition.id}
                                id={edition.id}
                                className="sr-only"
                              />
                              <Label
                                htmlFor={edition.id}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                  (edition.id === "player" && customization.isPlayerEdition) ||
                                  (edition.id === "fan" && !customization.isPlayerEdition)
                                    ? "border-black bg-black text-white shadow-md"
                                    : "border-gray-100 bg-[#0a0a0a] text-white/60 hover:border-white/8"
                                }`}
                              >
                                <span className="text-[13px] font-bold">{edition.label}</span>
                                {edition.price > 0 && (
                                  <span className="text-[10px] mt-1 opacity-80">
                                    +€{edition.price}
                                  </span>
                                )}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    )}

                    {/* Name & Number Inputs */}
                    {!product.isMysteryBox && (
                      <div className="grid grid-cols-12 gap-4">
                        {product.allowsNameOnShirt && (
                          <div className="col-span-8 space-y-2">
                            <Label className="text-[11px] font-black uppercase tracking-wider text-white/40">
                              Name on Jersey
                            </Label>
                            <input
                              type="text"
                              value={customization.name}
                              onChange={(e) =>
                                setCustomization((prev) => ({
                                  ...prev,
                                  name: e.target.value.toUpperCase(),
                                }))
                              }
                              maxLength={20}
                              placeholder="MARADONA"
                              className="w-full bg-[#0a0a0a] border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-black transition-all placeholder:text-white/30"
                            />
                          </div>
                        )}
                        {product.allowsNumberOnShirt && (
                          <div className="col-span-4 space-y-2">
                            <Label className="text-[11px] font-black uppercase tracking-wider text-white/40">
                              Number
                            </Label>
                            <input
                              type="text"
                              value={customization.number}
                              onChange={(e) =>
                                setCustomization((prev) => ({
                                  ...prev,
                                  number: e.target.value.replace(/[^0-9]/g, "").slice(0, 2),
                                }))
                              }
                              maxLength={2}
                              placeholder="10"
                              className="w-full bg-[#0a0a0a] border-none rounded-xl px-4 py-3 text-sm font-bold text-center focus:ring-2 focus:ring-black transition-all placeholder:text-white/30"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Patches Grid */}
                    {!product.isMysteryBox && (product.patches?.length ?? 0) > 0 && (
                      <div className="space-y-4">
                        <Label className="text-sm font-bold">
                          {t("products.addOfficialPatches")}
                        </Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {product.patches?.map((patch) => {
                            const isSelected = customization.selectedPatches.some(
                              (p) => p._id === patch._id
                            );
                            return (
                              <button
                                key={patch._id}
                                onClick={() => {
                                  setCustomization((prev) => ({
                                    ...prev,
                                    selectedPatches: isSelected
                                      ? prev.selectedPatches.filter((p) => p._id !== patch._id)
                                      : [...prev.selectedPatches, patch],
                                  }));
                                }}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                                  isSelected
                                    ? "border-black bg-[#0a0a0a] shadow-sm"
                                    : "border-gray-50 bg-[#0a0a0a] hover:border-white/8"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "border-black bg-black" : "border-white/10"}`}
                                  >
                                    {isSelected && (
                                      <div className="w-1.5 h-1.5 bg-[#0a0a0a] rounded-full" />
                                    )}
                                  </div>
                                  <span
                                    className={`text-xs font-bold ${isSelected ? "text-white" : "text-white/50"}`}
                                  >
                                    {patch.title}
                                  </span>
                                </div>
                                <span className="text-[10px] font-black text-[#c8f000]">
                                  +€{patch.price}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Mystery Box Card - Premium Upgrade */}
                    {product.isMysteryBox && (
                      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-purple-600 to-indigo-700 p-6 text-white shadow-xl shadow-purple-200">
                        <div className="relative z-10 space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0a0a0a]/20 backdrop-blur-md">
                              🎁
                            </span>
                            <h3 className="font-black text-sm uppercase tracking-widest">
                              Exclusion List
                            </h3>
                          </div>
                          <p className="text-xs text-purple-100 leading-relaxed">
                            Tell us which teams or specific colors you want to avoid. We’ll curate
                            your box accordingly.
                          </p>
                          <textarea
                            rows={4}
                            value={(customization as any).excludedShirts?.join("\n") || ""}
                            onChange={(e) => {
                              const lines = e.target.value
                                .split("\n")
                                .slice(0, 5)
                                .filter((l) => l.trim() !== "");
                              setCustomization((prev) => ({ ...prev, excludedShirts: lines }));
                            }}
                            className="w-full rounded-xl border-none bg-[#0a0a0a]/10 p-4 text-sm font-medium placeholder:text-purple-300 focus:bg-[#0a0a0a]/20 focus:ring-0 transition-all"
                            placeholder="E.g. No AC Milan, No yellow jerseys..."
                          />
                          <div className="flex justify-between items-center text-[10px] font-bold text-purple-200 uppercase tracking-tighter">
                            <span>
                              {(customization as any).excludedShirts?.length || 0} / 5 Teams
                            </span>
                            <span>Personalization Guaranteed</span>
                          </div>
                        </div>
                        {/* Decorative background element */}
                        <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-[#0a0a0a]/10 blur-3xl" />
                      </div>
                    )}

                    {/* Matching Items / Extras */}
                    {!product.isMysteryBox && (product.hasShorts || product.hasSocks) && (
                      <div className="space-y-4">
                        <Label className="text-sm font-bold">
                          {t("products.addMatchingItems")}
                        </Label>
                        <div className="flex flex-wrap gap-3">
                          {[
                            {
                              id: "shorts",
                              active: product.hasShorts,
                              current: customization.includeShorts,
                              label: t("products.addShorts"),
                              price: EXTRAS_PRICES.shorts,
                            },
                            {
                              id: "socks",
                              active: product.hasSocks,
                              current: customization.includeSocks,
                              label: t("products.addSocks"),
                              price: EXTRAS_PRICES.socks,
                            },
                          ]
                            .filter((item) => item.active)
                            .map((extra) => (
                              <button
                                key={extra.id}
                                onClick={() =>
                                  setCustomization((prev) => ({
                                    ...prev,
                                    [extra.id === "shorts" ? "includeShorts" : "includeSocks"]:
                                      !extra.current,
                                  }))
                                }
                                className={`flex items-center gap-3 px-5 py-3 rounded-full border-2 transition-all ${
                                  extra.current
                                    ? "border-black bg-black text-white shadow-md"
                                    : "border-gray-100 bg-[#0a0a0a] text-white/50 hover:border-white/8"
                                }`}
                              >
                                <span className="text-xs font-bold">{extra.label}</span>
                                <span
                                  className={`text-[10px] font-black ${extra.current ? "text-[#c8f000]" : "text-white/40"}`}
                                >
                                  +€{extra.price}
                                </span>
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quantity selector */}
                  <div>
                    {/* Size Selection Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 inline">
                            {t("products.chooseSize")}
                          </h3>
                          <button
                            type="button"
                            onClick={() => setSizeChartOpen(true)}
                            className="text-xs font-bold ml-2 transition-colors"
                            style={{ color: "#c8f000", textDecoration: "underline" }}
                          >
                            Guida alle taglie →
                          </button>
                          <div className="h-0.5 w-8 bg-black rounded-full" />
                        </div>

                        {/* Adult/Kid Toggle (Only if kids sizes exist) */}
                        {product.kidsSizes && product.kidsSizes.length > 0 && (
                          <div className="flex items-center gap-2 bg-[#111] p-1 rounded-full">
                            <button
                              type="button"
                              onClick={() =>
                                setCustomization({ ...customization, isKidSize: false, size: "" })
                              }
                              className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${!customization.isKidSize ? "bg-[#0a0a0a] text-white shadow-sm" : "text-white/40"}`}
                            >
                              ADULT
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setCustomization({ ...customization, isKidSize: true, size: "" })
                              }
                              className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${customization.isKidSize ? "bg-[#0a0a0a] text-white shadow-sm" : "text-white/40"}`}
                            >
                              KIDS
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Long Sleeve Toggle Card */}
                      <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-2xl border border-gray-100 transition-all hover:border-white/8">
                        <div className="flex items-center gap-3">
                          <div className="bg-[#0a0a0a] p-2 rounded-lg shadow-sm">
                            <Layers size={18} className="text-white" />
                          </div>
                          <div>
                            <Label
                              htmlFor="long-sleeve"
                              className="font-bold block text-xs uppercase tracking-tight"
                            >
                              Manica Lunga
                            </Label>
                            <span className="text-[10px] text-[#c8f000] font-black">+€10.00</span>
                          </div>
                        </div>
                        <Switch
                          id="long-sleeve"
                          checked={customization.hasLongSleeve}
                          onCheckedChange={(val) =>
                            setCustomization((p) => ({ ...p, hasLongSleeve: val }))
                          }
                        />
                      </div>

                      {/* Sizes Grid */}
                      <div className="flex flex-wrap gap-2">
                        {(customization.isKidSize ? product.kidsSizes : product.adultSizes)?.map(
                          (size) => {
                            const isSelected = customization.size === size;
                            return (
                              <button
                                key={size}
                                type="button"
                                onClick={() => setCustomization({ ...customization, size })}
                                className={`min-w-[50px] h-12 rounded-xl text-sm font-bold border-2 transition-all ${
                                  isSelected
                                    ? "border-black bg-black text-white shadow-lg scale-105"
                                    : "border-gray-100 bg-[#0a0a0a] text-white/50 hover:border-white/10"
                                }`}
                              >
                                {size}
                              </button>
                            );
                          }
                        )}
                      </div>

                      {errors.size && (
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">
                          ⚠️ {errors.size}
                        </p>
                      )}
                    </div>

                    {/* Trust Strip ABOVE CTA */}
                    <div
                      className="grid grid-cols-4 gap-1 py-3 rounded-xl mt-4"
                      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      {[
                        { icon: "🚚", label: "Sped. Gratuita", sub: "Sopra €89" },
                        { icon: "🔄", label: "Reso 30gg", sub: "Gratuito" },
                        { icon: "🔒", label: "Pag. Sicuro", sub: "SSL 256-bit" },
                        { icon: "✅", label: "Originale", sub: "Garantito" },
                      ].map(({ icon, label, sub }) => (
                        <div key={label} className="flex flex-col items-center gap-0.5 text-center px-1">
                          <span className="text-base">{icon}</span>
                          <span className="text-[9px] font-black text-white leading-tight" style={{ fontFamily: "var(--font-display, sans-serif)" }}>{label}</span>
                          <span className="text-[8px] leading-tight" style={{ color: "rgba(200,240,0,0.55)", fontFamily: "var(--font-mono, monospace)" }}>{sub}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        {/* Quantity Selector */}
                        <div className="flex items-center bg-[#111] rounded-2xl p-1 shrink-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="h-9 w-9 rounded-xl hover:bg-[#0a0a0a] transition-all"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </Button>
                          <span className="text-sm font-black text-white w-10 text-center">
                            {quantity}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setQuantity(quantity + 1)}
                            className="h-9 w-9 rounded-xl hover:bg-[#0a0a0a] transition-all"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Add to Cart */}
                        <button
                          type="button"
                          onClick={handleAddToCart}
                          className="flex-1 h-12 flex items-center justify-center gap-2 rounded-2xl text-[13px] font-black uppercase tracking-tight transition-all active:scale-95"
                          style={{
                            background: "#0a0a0a",
                            color: "#fff",
                            border: "2px solid rgba(200,240,0,0.25)",
                            fontFamily: "var(--font-display, sans-serif)",
                            letterSpacing: "1px",
                          }}
                        >
                          AGGIUNGI AL CARRELLO
                          <ArrowRight size={16} />
                        </button>

                        {/* Wishlist Button */}
                        <Button
                          onClick={handleWishlistToggle}
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 rounded-2xl border-gray-100 hover:bg-red-50 hover:border-red-100 group transition-all flex-shrink-0"
                        >
                          {isInWishlist(product._id) ? (
                            <HeartIconSolid className="h-5 w-5 text-red-500" />
                          ) : (
                            <HeartIcon className="h-5 w-5 text-white/40 group-hover:text-red-400" />
                          )}
                        </Button>
                      </div>

                      {/* Buy Now - Primary Action */}
                      <button
                        type="button"
                        onClick={handleBuyNow}
                        className="w-full h-14 flex items-center justify-center rounded-[20px] text-sm font-black uppercase tracking-[0.12em] transition-all active:scale-[0.98] hover:opacity-92"
                        style={{
                          background: "#c8f000",
                          color: "#000",
                          boxShadow: "0 8px 32px rgba(200,240,0,0.3)",
                          fontFamily: "var(--font-display, sans-serif)",
                          letterSpacing: "2px",
                        }}
                      >
                        COMPRA SUBITO →
                      </button>

                      {/* Payment icons row */}
                      <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
                        {["VISA", "MC", "PayPal", "Apple Pay", "Google Pay", "Klarna"].map((m) => (
                          <span
                            key={m}
                            className="text-[8px] font-black px-2 py-1 rounded tracking-widest"
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              color: "rgba(255,255,255,0.3)",
                              fontFamily: "var(--font-mono, monospace)",
                              border: "1px solid rgba(255,255,255,0.07)",
                            }}
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Available Discount Rules */}
                  <div className="hidden">
                    <DiscountRulesDisplay
                      productId={product._id}
                      productCategory={product.category}
                      onApplyDiscount={(rule: any) => {
                        // Handle discount rule application
                        console.log("Applied discount rule:", rule);
                      }}
                      showToAllUsers={true}
                      autoApply={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* </div> */}
      </div>
      {/* Trust Badges — redesigned */}
      <div className="border-y" style={{ borderColor: "rgba(255,255,255,0.06)", background: "#0d0d0d" }}>
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map(({ icon, label, sub }) => (
              <div
                key={label}
                className="flex items-center gap-3 p-4 rounded-2xl group transition-all duration-300 hover:border-[#c8f000]/20"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <span className="text-2xl">{icon}</span>
                <div>
                  <p
                    className="text-xs font-black uppercase text-white leading-tight"
                    style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "0.5px" }}
                  >
                    {label}
                  </p>
                  <p
                    className="text-[10px] mt-0.5"
                    style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.5)" }}
                  >
                    {sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Tabs defaultValue="ratings" className="md:w-full  px-0  md:max-w-5xl mx-auto">
        <TabsList className="md:w-full w-[400px] gap-0 px-0 justify-between bg-[#0a0a0a] border-b  h-14 rounded-none shadow-none pb-0 ">
          <TabsTrigger
            value="details"
            className="flex-1  shadow-none rounded-none px-0 font-semibold
             data-[state=active]:border-2
             data-[state=active]:border-b-black 
             data-[state=active]:bg-transparent 
             data-[state=active]:shadow-none"
          >
            Dettagli prodotto
          </TabsTrigger>
          <TabsTrigger
            value="ratings"
            className="flex-1  shadow-none rounded-none px-0 pl-1 font-semibold
             data-[state=active]:border-2
             data-[state=active]:border-b-black 
             data-[state=active]:bg-transparent 
             data-[state=active]:shadow-none"
          >
            Valutazioni e recensioni
          </TabsTrigger>
          <TabsTrigger
            value="faq"
            className="flex-1  shadow-none rounded-none px-0 pl-1 font-semibold
             data-[state=active]:border-2
             data-[state=active]:border-b-black 
             data-[state=active]:bg-transparent 
             data-[state=active]:shadow-none"
          >
            Domande frequenti
          </TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          Apporta modifiche ai dettagli del tuo prodotto qui.
        </TabsContent>
        <TabsContent value="ratings">
          <ProductReviews
            product={product}
            reviews={reviews}
            onReviewSubmit={handleReviewSubmit}
            onReviewDelete={handleReviewDelete}
          />
        </TabsContent>
        <TabsContent value="faq">
          <FaqSection />
        </TabsContent>
      </Tabs>

      {/* Size Guide Modal */}
      <SizeGuideModal isOpen={sizeChartOpen} onClose={() => setSizeChartOpen(false)} />
    </div>
  );
}
