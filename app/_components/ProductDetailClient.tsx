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
import { ArrowRight } from "lucide-react";

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
    <div className="bg-white">
      {/* Product details section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-6 sm:pt-28 sm:pb-6">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-5">
          {/* Image gallery - takes 3 columns on large screens */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="lg:sticky lg:top-24 self-start">
              <Card className="overflow-hidden hidden lg:block">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Thumbnail images */}
                    {product.images.length > 1 && (
                      <div className="flex lg:col-span-1 flex-wrap gap-3 justify-center p-4">
                        {product.images.map((image, index) => (
                          <Button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            variant={
                              index === selectedImage ? "default" : "outline"
                            }
                            size="icon"
                            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden"
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

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={handleWishlistToggle}
                              variant="secondary"
                              size="icon"
                              className="absolute top-3 right-3 h-8 w-8 bg-white/80 backdrop-blur-sm shadow-md hover:bg-white"
                              aria-label={
                                isInWishlist(product._id)
                                  ? "Remove from wishlist"
                                  : "Add to wishlist"
                              }
                            >
                              {isInWishlist(product._id) ? (
                                <HeartIconSolid className="h-4 w-4 text-red-500" />
                              ) : (
                                <HeartIcon className="h-4 w-4 text-black" />
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
                </CardContent>
              </Card>
              {/* Size Chart below images */}
              <ProductSizeChart />

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
                <h1 className="text-2xl mb-2 sm:text-3xl font-bold tracking-tight text-black">
                  {product.title}
                </h1>

                <div>
                  <h3 className="sr-only font-light mt-2">Description</h3>
                  <div className="prose font-light prose-sm sm:prose text-black">
                    {product.description}
                  </div>
                </div>
                {product.isMysteryBox && (
                  <Badge
                    variant="secondary"
                    className="mt-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
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
                      <div className="flex lg:col-span-1 flex-wrap gap-3 justify-center p-4">
                        {product.images.map((image, index) => (
                          <Button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            variant={
                              index === selectedImage ? "default" : "outline"
                            }
                            size="icon"
                            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden"
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

              <div className="mb-3">
                <h2 className="sr-only">Product information</h2>
                <p className="text-2xl sm:text-3xl tracking-tight text-black font-semibold">
                  €{(calculateTotalPrice() * quantity).toFixed(2)}
                </p>
              </div>

              {/* Customization options */}
              <div className="-ml-3">
                <CardHeader>
                  <CardTitle className="text-lg text-[#FF7A00]">
                    Customize Your Jersey
                  </CardTitle>
                </CardHeader>

                <div className="px-3">
                  <h3 className="text-lg font-semibold mb-3">Jersey Type</h3>
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
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="fan" id="fan-edition" />
                          <Label htmlFor="fan-edition" className="text-sm">
                            Fan Edition
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="player" id="player-edition" />
                          <Label htmlFor="player-edition" className="text-sm">
                            Player Edition (+€{EXTRAS_PRICES.player_edition})
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                </div>

                {/* INPUTS JERSEY TYPES */}
                <div>
                  {/* Name and Number - Hide for Mystery Box */}
                  {!product.isMysteryBox && (
                    <div className="grid grid-cols-1 gap-4 px-3 pt-4">
                      {product.allowsNameOnShirt && (
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium">
                            Name on Shirt
                          </Label>
                          <div className="relative">
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
                              placeholder="Enter name"
                              className="pr-10 w-full border-b focus:border-b outline-0 "
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                              <span className="text-black sm:text-sm">ABC</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {product.allowsNumberOnShirt && (
                        <div className="space-y-2">
                          <Label
                            htmlFor="number"
                            className="text-sm font-medium"
                          >
                            Number on Shirt
                          </Label>
                          <div className="relative">
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
                              placeholder="Enter number"
                              className="pr-10 w-full border-b focus:border-b outline-0 "
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                              <span className="text-black sm:text-sm">00</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Patches - Hide for Mystery Box */}
                  {!product.isMysteryBox &&
                    product.patches &&
                    product.patches.length > 0 && (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">
                          Add Official Patches
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
                              <Label htmlFor={patch._id} className="text-sm">
                                {patch.title} (+€{patch.price})
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
                <CardContent className="space-y-6 mt-4">
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
                          <CardTitle className="text-sm text-purple-800">
                            🎁 Mystery Box Preferences
                          </CardTitle>
                        </div>
                        <CardDescription className="text-purple-700">
                          Help us personalize your mystery box! List any teams
                          or specific shirts you'd prefer to avoid.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Label className="block text-sm font-medium text-purple-700 mb-2">
                          Shirts you'd prefer NOT to receive (Optional - up to
                          5):
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
                          placeholder="Example:&#10;AC Milan Home&#10;Juventus Away&#10;Inter Milan&#10;Roma&#10;Napoli"
                          rows={5}
                          className="border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                        />
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-purple-600">
                            {(customization as any).excludedShirts?.length || 0}
                            /5 exclusions
                          </p>
                          <div className="flex items-center text-xs text-purple-600">
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
                            We'll do our best to avoid these items
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Extras - Hide for Mystery Box */}
                  {!product.isMysteryBox && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">
                        Add Matching Items
                      </Label>
                      <div className="space-y-4">
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
                            />
                            <Label htmlFor="shorts" className="text-sm">
                              Add Matching Shorts (+€{EXTRAS_PRICES.shorts})
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
                            />
                            <Label htmlFor="socks" className="text-sm">
                              Add Matching Socks (+€{EXTRAS_PRICES.socks})
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
                  <CardHeader>
                  <CardTitle className="text-base font-semibold">Choose Size & Quantity</CardTitle>
                </CardHeader>
                <div className="mt-3">
                  {/* Size Selection */}
                  <div className="space-y-3 px-4 ">
                    <div className="flex justify-between items-center mb-2">
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
                          ))}
                    </div>
                    {errors.size && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.size}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
            
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-8 w-8"
                    >
                      <span className="sr-only">Decrease quantity</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 sm:h-4 sm:w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
                      </svg>
                    </Button>
                    <span className="text-sm sm:text-base font-medium text-black w-8 text-center">
                      {quantity}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-8 w-8"
                    >
                      <span className="sr-only">Increase quantity</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 sm:h-4 sm:w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </Button>
                  </div>
                </CardContent>
              </div>

              {/* Add to Cart buttons */}
              <div className="flex  gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="px-5 py-2 border text-black w-full rounded-full"
                >
                  Add to Cart
                  <ArrowRight className="ml-1 inline-flex" />
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="px-5 py-2 border bg-[#FF7A00] text-black w-full rounded-full"
                >
                  Buy Now
                  <ArrowRight className="ml-1 inline-flex" />
                </button>

                <div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleWishlistToggle}
                          variant="secondary"
                          size="icon"
                          className="absolute top-3 right-3 h-8 w-8 bg-white/80 backdrop-blur-sm shadow-md hover:bg-white"
                          aria-label={
                            isInWishlist(product._id)
                              ? "Remove from wishlist"
                              : "Add to wishlist"
                          }
                        >
                          {isInWishlist(product._id) ? (
                            <HeartIconSolid className="h-4 w-4 text-red-500" />
                          ) : (
                            <HeartIcon className="h-4 w-4 text-black" />
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

              {/* Trust Badges */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="flex flex-col items-center text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="mt-2 text-xs font-medium text-black">
                        Free Shipping
                      </span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <span className="mt-2 text-xs font-medium text-black">
                        Secure Checkout
                      </span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      <span className="mt-2 text-xs font-medium text-black">
                        100% Money-Back Guarantee
                      </span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="mt-2 text-xs font-medium text-black">
                        24/7 Customer Support
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Product Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Quality and Materials */}
                  <div>
                    <h4 className="font-medium text-black">
                      Premium Quality Materials
                    </h4>
                    <p className="mt-2 text-black">
                      Our jerseys are crafted from high-quality, breathable
                      materials that ensure comfort during wear. Each jersey is
                      made with attention to detail, featuring:
                    </p>
                    <ul className="mt-2 list-disc pl-5 text-black">
                      <li>
                        Premium polyester fabric with moisture-wicking
                        technology
                      </li>
                      <li>Durable stitching for long-lasting wear</li>
                      <li>Official team and sponsor logos</li>
                      <li>Authentic design and colors</li>
                    </ul>
                  </div>

                  {/* Delivery Information */}
                  <div>
                    <h4 className="font-medium text-black">
                      Delivery Information
                    </h4>
                    <div className="mt-2 space-y-2 text-black">
                      <p>• Shipping: 7–14 days</p>
                      <p>• Refund: max within 7 days</p>
                    </div>
                  </div>

                  {/* Secure Shopping */}
                  <div>
                    <h4 className="font-medium text-black">
                      Secure Shopping Guarantee
                    </h4>
                    <div className="mt-2 space-y-2 text-black">
                      <p>• 100% Authentic Product Guarantee</p>
                      <p>• Secure Payment Processing</p>
                      <p>• Money-Back Guarantee</p>
                      <p>• Customer Support 7 Days a Week</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <ProductReviews
        product={product}
        reviews={reviews}
        onReviewSubmit={handleReviewSubmit}
        onReviewDelete={handleReviewDelete}
      />
    </div>
  );
}
