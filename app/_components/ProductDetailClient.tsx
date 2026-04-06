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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ProductSizeChart } from "@/app/_components/ProductSizeChart";
import ProductReviews from "@/app/_components/ProductReviews";
import DiscountRulesDisplay from "@/app/_components/DiscountRulesDisplay";
import {
  ArrowRight,
  Coins,
  CreditCard,
  MinusIcon,
  PlusIcon,
  ShieldCheck,
  Truck,
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
    // Initialize reviews from product data
    if (product.reviews) {
      setReviews(product.reviews);
    }
  }, [product.reviews]);
  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const handleAddToCart = () => {
    // Reset previous errors
    setErrors({});

    // Validate size selection
    if (!customization.size) {
      setErrors({ size: "Please select a size before adding to cart" });
      toast.error("Please select a size before adding to cart");
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
      setErrors({ size: "Please select a size before proceeding" });
      toast.error("Please select a size before proceeding");
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
        throw new Error("Session expired. Please sign in again.");
      } else {
        throw new Error(error.error || "Failed to submit review");
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

  return (
    <div className="bg-white font-munish">
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
                <div className="absolute bottom-4 right-4 bg-white/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-black/5">
                  <p className="text-[10px] font-bold tracking-tight text-black">
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
                  <h3 className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 mb-2">
                    Video Preview
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
                          <div className="w-6 h-6 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
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
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-black leading-tight">
                  {product.title}
                </h1>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-bold text-black">
                  €{(calculateTotalPrice() * quantity).toFixed(2)}
                </p>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Vat Included
                </span>
              </div>

              <hr className="border-gray-100" />

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Description
                </h3>
                <div className="prose prose-sm text-gray-600 leading-relaxed max-w-none">
                  {product.description}
                </div>
              </div>

              <div className="grid grid-cols-1 px-4 space-evenly gap-x-8 gap-y-10 lg:col-span-3 order-2 lg:order-2">
                <div>
                  {/* Customization options */}
                  <div className="space-y-8">
                    {/* Section Header */}
                    <div className="space-y-1">
                      <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#FF7A00]">
                        {t("products.customizeYourJersey")}
                      </h2>
                      <div className="h-1 w-10 bg-[#FF7A00] rounded-full" />
                    </div>

                    {/* Jersey Edition Selection */}
                    {!product.isMysteryBox && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900">
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
                                    : "border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200"
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
                            <Label className="text-[11px] font-black uppercase tracking-wider text-gray-400">
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
                              className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-black transition-all placeholder:text-gray-300"
                            />
                          </div>
                        )}
                        {product.allowsNumberOnShirt && (
                          <div className="col-span-4 space-y-2">
                            <Label className="text-[11px] font-black uppercase tracking-wider text-gray-400">
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
                              className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-center focus:ring-2 focus:ring-black transition-all placeholder:text-gray-300"
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
                                    ? "border-black bg-white shadow-sm"
                                    : "border-gray-50 bg-gray-50 hover:border-gray-200"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "border-black bg-black" : "border-gray-300"}`}
                                  >
                                    {isSelected && (
                                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                    )}
                                  </div>
                                  <span
                                    className={`text-xs font-bold ${isSelected ? "text-black" : "text-gray-500"}`}
                                  >
                                    {patch.title}
                                  </span>
                                </div>
                                <span className="text-[10px] font-black text-[#FF7A00]">
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
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
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
                            className="w-full rounded-xl border-none bg-white/10 p-4 text-sm font-medium placeholder:text-purple-300 focus:bg-white/20 focus:ring-0 transition-all"
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
                        <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
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
                                    : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                                }`}
                              >
                                <span className="text-xs font-bold">{extra.label}</span>
                                <span
                                  className={`text-[10px] font-black ${extra.current ? "text-[#FF7A00]" : "text-gray-400"}`}
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
                          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                            {t("products.chooseSize")}
                          </h3>
                          <div className="h-0.5 w-8 bg-black rounded-full" />
                        </div>

                        {/* Adult/Kid Toggle (Only if kids sizes exist) */}
                        {product.kidsSizes && product.kidsSizes.length > 0 && (
                          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-full">
                            <button
                              type="button"
                              onClick={() =>
                                setCustomization({ ...customization, isKidSize: false, size: "" })
                              }
                              className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${!customization.isKidSize ? "bg-white text-black shadow-sm" : "text-gray-400"}`}
                            >
                              ADULT
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setCustomization({ ...customization, isKidSize: true, size: "" })
                              }
                              className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${customization.isKidSize ? "bg-white text-black shadow-sm" : "text-gray-400"}`}
                            >
                              KIDS
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Long Sleeve Toggle Card */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="bg-white p-2 rounded-lg shadow-sm">
                            <Layers size={18} className="text-black" />
                          </div>
                          <div>
                            <Label
                              htmlFor="long-sleeve"
                              className="font-bold block text-xs uppercase tracking-tight"
                            >
                              Manica Lunga
                            </Label>
                            <span className="text-[10px] text-[#FF7A00] font-black">+€10.00</span>
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
                                    : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-300"
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

                    {/* Action Bar */}
                    <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        {/* Quantity Selector */}
                        <div className="flex items-center bg-gray-100 rounded-2xl p-1 shrink-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="h-9 w-9 rounded-xl hover:bg-white transition-all"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </Button>
                          <span className="text-sm font-black text-black w-10 text-center">
                            {quantity}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setQuantity(quantity + 1)}
                            className="h-9 w-9 rounded-xl hover:bg-white transition-all"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Add to Cart */}
                        <button
                          type="button"
                          onClick={handleAddToCart}
                          className="flex-1 h-11 bg-black text-white flex items-center justify-center gap-2 rounded-2xl text-[13px] font-black uppercase tracking-tight hover:bg-gray-800 transition-all active:scale-95"
                        >
                          Aggiungi
                          <ArrowRight size={16} />
                        </button>

                        {/* Wishlist Button */}
                        <Button
                          onClick={handleWishlistToggle}
                          variant="outline"
                          size="icon"
                          className="h-11 w-11 rounded-2xl border-gray-100 hover:bg-red-50 hover:border-red-100 group transition-all"
                        >
                          {isInWishlist(product._id) ? (
                            <HeartIconSolid className="h-5 w-5 text-red-500" />
                          ) : (
                            <HeartIcon className="h-5 w-5 text-gray-400 group-hover:text-red-400" />
                          )}
                        </Button>
                      </div>

                      {/* Buy Now - Primary Action */}
                      <button
                        type="button"
                        onClick={handleBuyNow}
                        className="w-full h-14 bg-[#FF7A00] text-white flex items-center justify-center rounded-[20px] text-sm font-black uppercase tracking-[0.1em] shadow-xl shadow-orange-100 hover:opacity-90 transition-all active:scale-[0.98]"
                      >
                        Compra Ora
                      </button>
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
      <div className="">
        {/* Trust Badges */}
        <Card className="bg-[#0A1A2F] text-white font-light flex justify-center rounded-none border-none shadow-none">
          <CardContent className="p-4 bg-[#0A1A2F] text-white font-light">
            <div className="flex justify-around flex-col md:flex-row gap-4 items-center">
              <div className="flex flex-row gap-1 items-center text-white font-light text-center">
                <ShieldCheck strokeWidth={1} className="h-8 w-8 text-white" />
                <div className=" flex flex-col text-start">
                  <span className="mt-2 text-sm font-medium text-white">1 Anno</span>
                  <span className="mt-2 text-sm font-medium text-white">Garanzia</span>
                </div>
              </div>
              <div className="flex flex-row gap-1 items-center text-white font-light text-center">
                <Truck strokeWidth={1} className="h-8 w-8 text-white" />
                <div className=" flex flex-col text-start">
                  <span className="mt-2 text-sm font-medium text-white">Spedizione Gratuita</span>
                  <span className="mt-2 text-sm font-medium text-white">Express</span>
                </div>
              </div>
              <div className="flex flex-row gap-1 items-center text-white font-light text-center">
                <Coins strokeWidth={1} className="h-8 w-8 text-white" />
                <div className=" flex flex-col text-start">
                  <span className="mt-2 text-sm font-medium text-white">7 Giorni</span>
                  <span className="mt-2 text-sm font-medium text-white">Sostituzione</span>
                </div>
              </div>
              <div className="flex flex-row gap-1 items-center text-white font-light text-center">
                <CreditCard strokeWidth={1} className="h-8 w-8 text-white" />
                <div className=" flex flex-col text-start">
                  <span className="mt-2 text-sm font-medium text-white">100% Sicuri</span>
                  <span className="mt-2 text-sm font-medium text-white">Pagamenti</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="ratings" className="md:w-full  px-0  md:max-w-5xl mx-auto">
        <TabsList className="md:w-full w-[400px] gap-0 px-0 justify-between bg-white border-b  h-14 rounded-none shadow-none pb-0 ">
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
    </div>
  );
}
