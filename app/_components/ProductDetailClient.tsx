"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { StarIcon } from "@heroicons/react/20/solid";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
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
import { getBaseUrl } from "@/lib/utils/baseUrl";
import { Product } from "@/lib/types/home";
import FeaturedProducts from "@/components/home/FeaturedProducts";
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
  const { addItem: addToCart } = useCartStore();

  // Helper function to check if status is loading
  const isStatusLoading = () => status === "loading";

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

  const calculateTotalPrice = () => {
    let total = Number(product.basePrice);

    // Add patches price
    customization.selectedPatches.forEach((patch) => {
      total += patch.price;
    });

    // Add player edition price
    if (customization.isPlayerEdition) {
      total += EXTRAS_PRICES.player_edition;
    }

    // Add shorts price
    if (customization.includeShorts) {
      total += EXTRAS_PRICES.shorts;
    }

    // Add socks price
    if (customization.includeSocks) {
      total += EXTRAS_PRICES.socks;
    }

    return total;
  };

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
      isKidSize: customization.isKidSize,
    });

    const hasCustomization = !!(
      customization.name ||
      customization.number ||
      customization.isPlayerEdition ||
      customization.size ||
      customization.includeShorts ||
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
        selectedPatches: customization.selectedPatches.map(
          (p) => p.category as Patch
        ),
        includeShorts: customization.includeShorts,
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
    const updatedReviewsResponse = await fetch(
      `/api/products/${product._id}/reviews`
    );
    if (!updatedReviewsResponse.ok) {
      throw new Error("Failed to fetch updated reviews");
    }

    const updatedReviews = await updatedReviewsResponse.json();
    setReviews(updatedReviews);
  };

  const handleReviewDelete = async (reviewId: string) => {
    // Remove the review from local state immediately for optimistic update
    setReviews((prevReviews) =>
      prevReviews.filter((review) => review._id !== reviewId)
    );

    // Fetch updated reviews to ensure consistency
    try {
      const updatedReviewsResponse = await fetch(
        `/api/products/${product._id}/reviews`
      );
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
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-5">
          {/* Image gallery - takes 3 columns on large screens */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="lg:sticky lg:top-24 self-start">
              <Card className="overflow-hidden hidden lg:block shadow-none border-none">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Thumbnail images */}
                    {product.images.length > 1 && (
                      <div className="hidden lg:flex lg:col-span-1 flex-col gap-3 justify-center p-4">
                        {product.images.map((image, index) => (
                          <Button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            variant={
                              index === selectedImage ? "default" : "outline"
                            }
                            size="icon"
                            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden hidden md:flex shadow-none border border-black"
                          >
                            <Image
                              src={image}
                              alt={`${product.title} thumbnail ${index + 1}`}
                              fill
                              className="object-cover object-center"
                              sizes="80px"
                            />
                          </Button>
                        ))}
                      </div>
                    )}
                    {/* Main image */}
                    <div className="relative lg:col-span-2 aspect-square  overflow-hidden border-[1px] border-[#000000] w-full rounded-[20px]">
                      <Image
                        src={
                          product.images[selectedImage] ||
                          "/images/placeholder.png"
                        }
                        alt={product.title || "Product image"}
                        fill
                        className="object-contain object-center hover:scale-[1.02] transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 50vw"
                        priority
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="hidden">
                <ProductSizeChart />
              </div>

              {/* Product Videos */}
              {product.videos && product.videos.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Product Videos</span>
                    </CardTitle>
                    <CardDescription>
                      Watch product previews and demonstrations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      {product.videos.map((videoUrl, index) => (
                        <div
                          key={index}
                          className="relative aspect-video overflow-hidden rounded-lg border border-gray-200"
                        >
                          <video
                            src={videoUrl}
                            controls
                            className="w-full h-full object-cover"
                            preload="metadata"
                            poster={product.images[0]}
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Product info - takes 2 columns on large screens */}
          <div className="lg:col-span-2 lg:pl-8 order-1 lg:order-2">
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl mb-2 sm:text-[27px] font-bold tracking-tight text-black">
                  {product.title}
                </h1>
                <div className="mb-3">
                  <h2 className="sr-only">Product information</h2>
                  <p className="text-2xl sm:text-3xl tracking-tight text-black font-bold">
                    €{(calculateTotalPrice() * quantity).toFixed(2)}
                  </p>
                </div>
                <div>
                  <h3 className="sr-only font-light mt-2">Description</h3>
                  <div className="prose font-normal prose-sm sm:prose text-gray-700 leading-relaxed">
                    {product.description}
                  </div>
                </div>
                <hr className="my-4" />
                {product.isMysteryBox && (
                  <Badge
                    variant="secondary"
                    className="mt-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold"
                  >
                    🎁 Mystery Box
                  </Badge>
                )}
              </div>

              {/* Image gallery - takes 1 columns on mobile screens */}
              <div className="overflow-hidden lg:hidden border rounded-2xl">
                <div className="p-0">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Thumbnail images */}
                    {product.images.length > 1 && (
                      <div className="lg:col-span-1 w-full h-[200px] p-4">
                        <Swiper
                          direction="vertical"
                          spaceBetween={12}
                          slidesPerView="auto"
                          freeMode
                          className="h-auto"
                        >
                          {product.images.map((image, index) => (
                            <SwiperSlide key={index} className="!w-auto">
                              <Button
                                onClick={() => setSelectedImage(index)}
                                variant={
                                  index === selectedImage
                                    ? "default"
                                    : "outline"
                                }
                                size="icon"
                                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden"
                              >
                                <Image
                                  src={image}
                                  alt={`${product.title} thumbnail ${
                                    index + 1
                                  }`}
                                  fill
                                  className="object-cover object-center"
                                  sizes="80px"
                                />
                              </Button>
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      </div>
                    )}

                    {/* Main image */}
                    <div className="relative lg:col-span-2 aspect-square  overflow-hidden bg-gray-100 w-full">
                      <Image
                        src={
                          product.images[selectedImage] ||
                          "/images/placeholder.png"
                        }
                        alt={product.title || "Product image"}
                        fill
                        className="object-contain object-center hover:scale-[1.02] transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 50vw"
                        priority
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Customization options */}
              <div className="-ml-3">
                <CardHeader className="p-0">
                  <CardTitle className="text-[18px] font-semibold p-0 text-[#FF7A00]">
                    {t("products.customizeYourJersey")}
                  </CardTitle>
                </CardHeader>

                <div className="">
                  <h3 className="text-[18px] font-bold mb-3 text-[#333333]">
                    {t("products.jerseyType")}
                  </h3>
                  {/* Jersey Type (Player or Fan Edition) - Hide for Mystery Box */}
                  {!product.isMysteryBox && (
                    <div className="space-y-3 flex ">
                      <RadioGroup
                        value={customization.isPlayerEdition ? "player" : "fan"}
                        onValueChange={(value) =>
                          setCustomization((prev) => ({
                            ...prev,
                            isPlayerEdition: value === "player",
                          }))
                        }
                      >
                        <div className="flex gap-3">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="fan"
                              id="fan-edition"
                              className="text-[#D9D9D9] bg-[#0A1A2F] border-none 
             data-[state=checked]:bg-[#D9D9D9] data-[state=checked]:text-[#0A1A2F]"
                            />

                            <Label
                              htmlFor="fan-edition"
                              className="text-[14px] font-medium"
                            >
                              {t("products.fanEdition")}
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="player"
                              id="player-edition"
                              className="text-[#D9D9D9] bg-[#D9D9D9] border-none 
             data-[state=checked]:bg-[#D9D9D9] data-[state=checked]:text-[#0A1A2F]"
                            />
                            <Label
                              htmlFor="player-edition"
                              className="text-[14px] font-medium"
                            >
                              {t("products.playerEdition")} <span className="font-bold">(+€
                              {EXTRAS_PRICES.player_edition})</span>
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                  <hr className="my-4 " />
                </div>

                {/* INPUTS JERSEY TYPES */}
                <div>
                  {/* Name and Number - Hide for Mystery Box */}
                  {!product.isMysteryBox && (
                    <div className="flex justify-between items-center gap-4 ">
                      {product.allowsNameOnShirt && (
                        <div className=" w-1/2">
                          <div className="">
                            <input
                              type="text"
                              id="name"
                              value={customization.name}
                              onChange={(e) =>
                                setCustomization((prev) => ({
                                  ...prev,
                                  name: e.target.value.toUpperCase(),
                                }))
                              }
                              maxLength={20}
                              placeholder="Inserisci qui il tuo nome sulla maglia..."
                              className=" w-full  border-b focus:border-b outline-0 placeholder:text-[#333333] placeholder:font-normal text-[#333333] text-[16px] font-semibold"
                            />
                          </div>
                        </div>
                      )}

                      {product.allowsNumberOnShirt && (
                        <div className=" w-1/2">
                          <div className="">
                            <input
                              type="text"
                              id="number"
                              value={customization.number}
                              onChange={(e) =>
                                setCustomization((prev) => ({
                                  ...prev,
                                  number: e.target.value
                                    .replace(/[^0-9]/g, "")
                                    .slice(0, 2),
                                }))
                              }
                              maxLength={2}
                              placeholder="Inserisci qui il tuo numero sulla maglia..."
                              className=" w-full border-b  focus:border-b outline-0 placeholder:text-[#333333] placeholder:font-normal text-[#333333] text-[16px] font-semibold"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Patches - Hide for Mystery Box */}
                  {!product.isMysteryBox &&
                    product.patches &&
                    product.patches.length > 0 && (
                      <div className="space-y-3 mt-3 ">
                        <Label className="text-[16px] font-bold">
                          {t("products.addOfficialPatches")}
                        </Label>
                        <div className="grid grid-cols-2 gap-4">
                          {product.patches.map((patch) => (
                            <div
                              key={patch._id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={patch._id}
                                checked={customization.selectedPatches.some(
                                  (p) => p._id === patch._id
                                )}
                                onCheckedChange={(checked) => {
                                  setCustomization((prev) => ({
                                    ...prev,
                                    selectedPatches: checked
                                      ? [...prev.selectedPatches, patch]
                                      : prev.selectedPatches.filter(
                                          (p) => p._id !== patch._id
                                        ),
                                  }));
                                }}
                              />
                              <Label
                                htmlFor={patch._id}
                                className="text-[14px] font-medium"
                              >
                                {patch.title} <span className="font-bold">(+€{patch.price})</span>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
                <CardContent className="space-y-6 mt-4 p-0">
                  {/* Mystery Box Exclusion List - Only for Mystery Box products */}
                  {product.isMysteryBox && (
                    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                      <CardHeader>
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                            <svg
                              className="w-5 h-5 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <CardTitle className="text-sm text-purple-800 font-bold">
                            🎁 Preferenze Scatola Misteriosa
                          </CardTitle>
                        </div>
                        <CardDescription className="text-purple-700 font-medium">
                          Aiutaci a personalizzare la tua scatola misteriosa! Elenca le squadre
                          o le maglie specifiche che preferiresti evitare.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Label className="block text-sm font-bold text-purple-700 mb-2">
                          Maglie che preferiresti NON ricevere (Opzionale - fino a 5):
                        </Label>
                        <Textarea
                          value={
                            (customization as any).excludedShirts?.join("\n") ||
                            ""
                          }
                          onChange={(e) => {
                            const lines = e.target.value
                              .split("\n")
                              .slice(0, 5)
                              .filter((line) => line.trim() !== "");
                            setCustomization((prev) => ({
                              ...prev,
                              excludedShirts: lines,
                            }));
                          }}
                          placeholder="Esempio:&#10;AC Milan Casa&#10;Juventus Trasferta&#10;Inter Milano&#10;Roma&#10;Napoli"
                          rows={5}
                          className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 font-medium"
                        />
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-purple-600 font-bold">
                            {(customization as any).excludedShirts?.length || 0}
                            /5 exclusions
                          </p>
                          <div className="flex items-center text-xs text-purple-600 font-medium">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Faremo del nostro meglio per evitare questi articoli
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Extras - Hide for Mystery Box */}
                  {!product.isMysteryBox && (
                    <div className="space-y-2 ">
                      <Label className="text-sm font-bold">
                        {t("products.addMatchingItems")}
                      </Label>
                      <div className=" flex md:flex-row flex-col gap-4">
                        {product.hasShorts && (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="shorts"
                              checked={customization.includeShorts}
                              onCheckedChange={(checked) =>
                                setCustomization((prev) => ({
                                  ...prev,
                                  includeShorts: checked as boolean,
                                }))
                              }
                              className="data-[state=checked]:bg-[#0A1A2F] data-[state=checked]:text-[#D9D9D9] rounded-full border-2 border-[#D9D9D9] bg-[#D9D9D9] w-4 h-4 flex items-center justify-center"
                            />
                            <Label
                              htmlFor="shorts"
                              className="text-[14px] whitespace-nowrap font-medium"
                            >
                              {t("products.addShorts")}
                              <span className="font-bold"> (+€{EXTRAS_PRICES.shorts})</span>
                            </Label>
                          </div>
                        )}

                        {product.hasSocks && (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="socks"
                              checked={customization.includeSocks}
                              onCheckedChange={(checked) =>
                                setCustomization((prev) => ({
                                  ...prev,
                                  includeSocks: checked as boolean,
                                }))
                              }
                              className="data-[state=checked]:bg-[#0A1A2F] data-[state=checked]:text-[#D9D9D9] rounded-full border-2 border-[#D9D9D9] bg-[#D9D9D9] w-4 h-4 flex items-center justify-center"
                            />
                            <Label
                              htmlFor="socks"
                              className="text-[14px] whitespace-nowrap font-medium"
                            >
                              {t("products.addSocks")}
                              <span className="font-bold"> (+€{EXTRAS_PRICES.socks})</span>
                            </Label>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </div>

              {/* Quantity selector */}
              <div className="-ml-2">
                <CardHeader className="p-0">
                  <CardTitle className="text-sm font-bold">
                    {t("products.chooseSize")}
                  </CardTitle>
                </CardHeader>
                <div className="mt-2">
                  {/* Size Selection */}
                  <div className="space-y-3  ">
                    <div className=" justify-between items-center mb-2 hidden">
                      <Label className="text-sm sm:text-base font-medium">
                        Size
                      </Label>
                      {product.kidsSizes && product.kidsSizes.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <Label
                            htmlFor="kid-size"
                            className="text-xs sm:text-sm"
                          >
                            Kid Size
                          </Label>
                          <Switch
                            id="kid-size"
                            checked={customization.isKidSize}
                            onCheckedChange={(checked) =>
                              setCustomization({
                                ...customization,
                                isKidSize: checked,
                                // Clear existing size if switching between adult/kid
                                size: "",
                              })
                            }
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 sm:gap-3 mt-3">
                      {customization.isKidSize
                        ? (product.kidsSizes && product.kidsSizes.length > 0
                            ? product.kidsSizes
                            : []
                          ).map((size) => (
                            <Button
                              key={size}
                              type="button"
                              variant={
                                customization.size === size
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                setCustomization({ ...customization, size })
                              }
                            >
                              {size}
                            </Button>
                          ))
                        : (product.adultSizes && product.adultSizes.length > 0
                            ? product.adultSizes
                            : []
                          ).map((size) => (
                            <Button
                              key={size}
                              type="button"
                              size="sm"
                              className={` rounded-full text-[14px] hover:text-white ${
                                customization.size === size
                                  ? "bg-[#0A1A2F] text-[#FFFFFF]"
                                  : "bg-[#F0F0F0] text-[#00000099]"
                              }`}
                              onClick={() =>
                                setCustomization({ ...customization, size })
                              }
                            >
                              {size}
                            </Button>
                          ))}
                    </div>
                    {errors.size && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.size}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>

              {/* Add to Cart buttons */}
              <div className="flex  gap-1.5  mt-2.5">
                <div className="flex items-center  bg-[#F0F0F0] rounded-full w-fit">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-8 w-8 border-none shadow-none bg-[#F0F0F0] rounded-full"
                  >
                    <span className="sr-only">Decrease quantity</span>
                    <MinusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <span className="text-sm sm:text-base font-bold text-black w-8 text-center">
                    {quantity}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-8 w-8 border-none shadow-none bg-[#F0F0F0] rounded-full"
                  >
                    <span className="sr-only">Increase quantity</span>
                    <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="px-2 py-2 border text-black  flex items-center whitespace-nowrap rounded-full text-[14px] w-fit h-fit font-semibold"
                >
                  Aggiungi al Carrello
                  <ArrowRight className="ml-1 inline-flex" size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="px-2 py-2 border bg-[#FF7A00] text-black flex items-center whitespace-nowrap rounded-full text-[14px] w-fit h-fit border-none font-bold"
                >
                  Compra Ora
                  <ArrowRight className="ml-1 inline-flex" size={16} />
                </button>

                <div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleWishlistToggle}
                          variant="secondary"
                          size="icon"
                          className="  bg-white shadow-none"
                          aria-label={
                            isInWishlist(product._id)
                              ? "Remove from wishlist"
                              : "Add to wishlist"
                          }
                        >
                          {isInWishlist(product._id) ? (
                            <HeartIconSolid className=" text-red-500" />
                          ) : (
                            <HeartIcon className=" text-black" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isInWishlist(product._id)
                          ? "Remove from wishlist"
                          : "Add to wishlist"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
      <div className="">
        {/* Trust Badges */}
        <Card className="bg-[#0A1A2F] text-white font-light flex justify-center rounded-none border-none shadow-none">
          <CardContent className="p-4 bg-[#0A1A2F] text-white font-light">
            <div className="flex justify-around flex-col md:flex-row gap-4 items-center">
              <div className="flex flex-row gap-1 items-center text-white font-light text-center">
                <ShieldCheck strokeWidth={1} className="h-8 w-8 text-white" />
                <div className=" flex flex-col text-start">
                  <span className="mt-2 text-sm font-medium text-white">
                    1 Anno
                  </span>
                  <span className="mt-2 text-sm font-medium text-white">
                    Garanzia
                  </span>
                </div>
              </div>
              <div className="flex flex-row gap-1 items-center text-white font-light text-center">
                <Truck strokeWidth={1} className="h-8 w-8 text-white" />
                <div className=" flex flex-col text-start">
                  <span className="mt-2 text-sm font-medium text-white">
                    Spedizione Gratuita
                  </span>
                  <span className="mt-2 text-sm font-medium text-white">
                    Express
                  </span>
                </div>
              </div>
              <div className="flex flex-row gap-1 items-center text-white font-light text-center">
                <Coins strokeWidth={1} className="h-8 w-8 text-white" />
                <div className=" flex flex-col text-start">
                  <span className="mt-2 text-sm font-medium text-white">
                    7 Giorni
                  </span>
                  <span className="mt-2 text-sm font-medium text-white">
                    Sostituzione
                  </span>
                </div>
              </div>
              <div className="flex flex-row gap-1 items-center text-white font-light text-center">
                <CreditCard strokeWidth={1} className="h-8 w-8 text-white" />
                <div className=" flex flex-col text-start">
                  <span className="mt-2 text-sm font-medium text-white">
                    100% Sicuri
                  </span>
                  <span className="mt-2 text-sm font-medium text-white">
                    Pagamenti
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Tabs
        defaultValue="ratings"
        className="md:w-full  px-0  md:max-w-5xl mx-auto"
      >
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