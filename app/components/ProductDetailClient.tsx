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
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";

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
  product: IProduct;
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
    selectedPatches: [] as Patch[],
    size: "",
    isPlayerEdition: false,
    isKidSize: false,
    excludedShirts: [] as string[],
  });
  const [reviewInput, setReviewInput] = useState({
    rating: 5,
    comment: "",
  });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
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
      total += PATCH_PRICES[patch];
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
        selectedPatches: customization.selectedPatches,
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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check authentication status
    if (isStatusLoading()) {
      // Session is still loading, don't proceed yet
      return;
    }

    if (!session) {
      // Show feedback before redirecting
      setReviewFeedback({
        type: "error",
        message: "You must be logged in to submit a review",
      });

      // Delay redirect to allow user to see the message
      setTimeout(() => {
        signIn();
      }, 1500);
      return;
    }

    setIsSubmittingReview(true);
    setReviewFeedback(null);

    try {
      const response = await fetch(`/api/products/${product._id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewInput),
        credentials: "include", // Include cookies for session
      });

      if (!response.ok) {
        const error = await response.json();
        // If unauthorized, redirect to sign in page
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

      // Reset form and show success message
      setReviewInput({ rating: 5, comment: "" });
      setReviewFeedback({
        type: "success",
        message: "Review submitted successfully!",
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setReviewFeedback(null);
      }, 3000);
    } catch (error) {
      console.error("Error submitting review:", error);
      setReviewFeedback({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to submit review",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Product details section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-6 sm:pt-28 sm:pb-6">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-5">
          {/* Image gallery - takes 3 columns on large screens */}
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-24 self-start">
              <div className="grid grid-cols-1 gap-6">
                {/* Main image */}
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 w-full shadow-sm hover:shadow-md transition-shadow duration-300">
                  <Image
                    src={
                      product.images[selectedImage] || "/images/placeholder.png"
                    }
                    alt={product.title || "Product image"}
                    fill
                    className="object-contain object-center hover:scale-[1.02] transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 50vw"
                    priority
                  />

                  <button
                    onClick={handleWishlistToggle}
                    className="absolute top-3 right-3 p-1.5 sm:p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white transition-colors duration-200"
                    aria-label={
                      isInWishlist(product._id)
                        ? "Remove from wishlist"
                        : "Add to wishlist"
                    }
                  >
                    {isInWishlist(product._id) ? (
                      <HeartIconSolid className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                    ) : (
                      <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
                    )}
                  </button>
                </div>

                {/* Thumbnail images */}
                {product.images.length > 1 && (
                  <div className="flex flex-wrap gap-3 justify-center">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden bg-gray-100 transition-all duration-200 ${
                          index === selectedImage
                            ? "ring-2 ring-indigo-500 scale-105"
                            : "hover:ring-1 hover:ring-indigo-300 opacity-80 hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${product.title} thumbnail ${index + 1}`}
                          fill
                          className="object-cover object-center"
                          sizes="80px"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product info - takes 2 columns on large screens */}
          <div className="lg:col-span-2 lg:pl-8">
            <div className="space-y-6">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
                {product.title}
              </h1>

              <div>
                <h2 className="sr-only">Product information</h2>
                <p className="text-2xl sm:text-3xl tracking-tight text-black font-semibold">
                  €{(calculateTotalPrice() * quantity).toFixed(2)}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="sr-only">Description</h3>
                <div className="prose prose-sm sm:prose text-black">
                  {product.description}
                </div>
              </div>

              {/* Quantity selector */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm sm:text-base font-medium text-black mb-2">
                  Quantity
                </h3>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 sm:p-2 border border-gray-300 rounded-md text-black hover:bg-gray-50"
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
                  </button>
                  <span className="text-sm sm:text-base font-medium text-black w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1.5 sm:p-2 border border-gray-300 rounded-md text-black hover:bg-gray-50"
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
                  </button>
                </div>
              </div>

              {/* Customization options */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-medium text-black mb-4">
                  Customize Your Jersey
                </h3>

                {/* Size Selection */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm sm:text-base font-medium text-black">
                      Size
                    </h3>
                    {product.kidsSizes && product.kidsSizes.length > 0 && (
                      <div className="form-control">
                        <label className="label cursor-pointer gap-2">
                          <span className="label-text text-xs sm:text-sm text-black">
                            Kid Size
                          </span>
                          <input
                            type="checkbox"
                            className="toggle toggle-sm toggle-primary"
                            checked={customization.isKidSize}
                            onChange={(e) =>
                              setCustomization({
                                ...customization,
                                isKidSize: e.target.checked,
                                // Clear existing size if switching between adult/kid
                                size: "",
                              })
                            }
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {customization.isKidSize
                      ? (product.kidsSizes && product.kidsSizes.length > 0
                          ? product.kidsSizes
                          : []
                        ).map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() =>
                              setCustomization({ ...customization, size })
                            }
                            className={`px-2.5 py-1.5 sm:px-3 sm:py-2 border rounded-md text-xs sm:text-sm font-medium ${
                              customization.size === size
                                ? "border-indigo-600 bg-indigo-600 text-white"
                                : "border-gray-300 text-black hover:bg-gray-50"
                            }`}
                          >
                            {size}
                          </button>
                        ))
                      : (product.adultSizes && product.adultSizes.length > 0
                          ? product.adultSizes
                          : []
                        ).map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() =>
                              setCustomization({ ...customization, size })
                            }
                            className={`px-2.5 py-1.5 sm:px-3 sm:py-2 border rounded-md text-xs sm:text-sm font-medium ${
                              customization.size === size
                                ? "border-indigo-600 bg-indigo-600 text-white"
                                : "border-gray-300 text-black hover:bg-gray-50"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                  </div>
                  {errors.size && (
                    <p className="text-red-500 text-xs mt-1">{errors.size}</p>
                  )}
                </div>

                {/* Mystery Box Exclusion List - Only for Mystery Box products */}
                {product.isMysteryBox && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-semibold text-purple-800">
                        🎁 Mystery Box Preferences
                      </h4>
                    </div>
                    <label className="block text-sm font-medium text-purple-700 mb-2">
                      Shirts you'd prefer NOT to receive (Optional - up to 5):
                    </label>
                    <p className="text-xs text-purple-600 mb-3">
                      Help us personalize your mystery box! List any teams or specific shirts you'd prefer to avoid.
                    </p>
                    <textarea
                      value={(customization as any).excludedShirts?.join('\n') || ''}
                      onChange={(e) => {
                        const lines = e.target.value.split('\n').slice(0, 5).filter(line => line.trim() !== '');
                        setCustomization((prev) => ({
                          ...prev,
                          excludedShirts: lines
                        }));
                      }}
                      placeholder="Example:&#10;AC Milan Home&#10;Juventus Away&#10;Inter Milan&#10;Roma&#10;Napoli"
                      rows={5}
                      className="w-full rounded-md border-purple-300 text-gray-800 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500 sm:text-sm bg-white/80"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-purple-600">
                        {((customization as any).excludedShirts?.length || 0)}/5 exclusions
                      </p>
                      <div className="flex items-center text-xs text-purple-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        We'll do our best to avoid these items
                      </div>
                    </div>
                  </div>
                )}

                {/* Jersey Type (Player or Fan Edition) - Hide for Mystery Box */}
                {!product.isMysteryBox && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-black">
                    Jersey Type
                  </label>
                  <div className="mt-2 space-y-2">
                    <div className="relative flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          type="radio"
                          id="fan-edition"
                          name="jersey-type"
                          checked={!customization.isPlayerEdition}
                          onChange={() =>
                            setCustomization((prev) => ({
                              ...prev,
                              isPlayerEdition: false,
                            }))
                          }
                          className="h-4 w-4 border-gray-300 text-accent focus:ring-accent"
                        />
                      </div>
                      <div className="ml-3">
                        <label
                          htmlFor="fan-edition"
                          className="text-sm text-black"
                        >
                          Fan Edition
                        </label>
                      </div>
                    </div>

                    <div className="relative flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          type="radio"
                          id="player-edition"
                          name="jersey-type"
                          checked={customization.isPlayerEdition}
                          onChange={() =>
                            setCustomization((prev) => ({
                              ...prev,
                              isPlayerEdition: true,
                            }))
                          }
                          className="h-4 w-4 border-gray-300 text-accent focus:ring-accent"
                        />
                      </div>
                      <div className="ml-3">
                        <label
                          htmlFor="player-edition"
                          className="text-sm text-black"
                        >
                          Player Edition (+€{EXTRAS_PRICES.player_edition})
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                )}

                {/* Name and Number - Hide for Mystery Box */}
                {!product.isMysteryBox && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {product.allowsNameOnShirt && (
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-black"
                      >
                        Name on Shirt
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
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
                          className="block w-full rounded-md border-gray-300 pr-10 text-black placeholder-black focus:border-accent focus:ring-accent sm:text-sm transition duration-150 ease-in-out hover:border-gray-400 py-3"
                        />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-black sm:text-sm">ABC</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {product.allowsNumberOnShirt && (
                    <div>
                      <label
                        htmlFor="number"
                        className="block text-sm font-medium text-black"
                      >
                        Number on Shirt
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
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
                          className="block w-full rounded-md border-gray-300 pr-10 text-black placeholder-black focus:border-accent focus:ring-accent sm:text-sm transition duration-150 ease-in-out hover:border-gray-400 py-3"
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
                {!product.isMysteryBox && product.availablePatches &&
                  product.availablePatches.length > 0 && (
                    <div className="mt-6">
                      <label className="text-sm font-medium text-black">
                        Add Official Patches
                      </label>
                      <div className="mt-2 grid grid-cols-2 gap-4">
                        {product.availablePatches.map((patch) => (
                          <div
                            key={patch}
                            className="relative flex items-start"
                          >
                            <div className="flex h-5 items-center">
                              <input
                                type="checkbox"
                                checked={customization.selectedPatches.includes(
                                  patch
                                )}
                                onChange={() => {
                                  setCustomization((prev) => ({
                                    ...prev,
                                    selectedPatches:
                                      prev.selectedPatches.includes(patch)
                                        ? prev.selectedPatches.filter(
                                            (p) => p !== patch
                                          )
                                        : [...prev.selectedPatches, patch],
                                  }));
                                }}
                                className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                              />
                            </div>
                            <div className="ml-3">
                              <label className="text-sm text-black">
                                {patch === "champions-league"
                                  ? "Coppa Europea"
                                  : patch === "serie-a"
                                  ? "Campionato Nazionale"
                                  : patch
                                      .split("-")
                                      .map(
                                        (word: string) =>
                                          word.charAt(0).toUpperCase() +
                                          word.slice(1)
                                      )
                                      .join(" ")}{" "}
                                (+€{PATCH_PRICES[patch]})
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Extras - Hide for Mystery Box */}
                {!product.isMysteryBox && (
                <div className="mt-6">
                  <label className="text-sm font-medium text-black">
                    Add Matching Items
                  </label>
                  <div className="mt-2 space-y-4">
                    {product.hasShorts && (
                      <div className="relative flex items-start">
                        <div className="flex h-5 items-center">
                          <input
                            type="checkbox"
                            checked={customization.includeShorts}
                            onChange={(e) =>
                              setCustomization((prev) => ({
                                ...prev,
                                includeShorts: e.target.checked,
                              }))
                            }
                            className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                          />
                        </div>
                        <div className="ml-3">
                          <label className="text-sm text-black">
                            Add Matching Shorts (+€{EXTRAS_PRICES.shorts})
                          </label>
                        </div>
                      </div>
                    )}

                    {product.hasSocks && (
                      <div className="relative flex items-start">
                        <div className="flex h-5 items-center">
                          <input
                            type="checkbox"
                            checked={customization.includeSocks}
                            onChange={(e) =>
                              setCustomization((prev) => ({
                                ...prev,
                                includeSocks: e.target.checked,
                              }))
                            }
                            className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                          />
                        </div>
                        <div className="ml-3">
                          <label className="text-sm text-black">
                            Add Matching Socks (+€{EXTRAS_PRICES.socks})
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                )}
              </div>

              {/* Add to Cart buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  onClick={handleAddToCart}
                  variant="default"
                  size="lg"
                  className="flex-1"
                >
                  Add to Cart
                </Button>
                <Button
                  type="button"
                  onClick={handleBuyNow}
                  variant="orange"
                  size="lg"
                  className="flex-1"
                >
                  Buy Now
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
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

              {/* Product Information */}
              <div className="mt-8 border-t border-gray-200 pt-8">
                <div className="prose prose-sm max-w-none">
                  <h3 className="text-lg font-medium text-black mb-4">
                    Product Information
                  </h3>

                  <div className="space-y-6">
                    {/* Quality and Materials */}
                    <div>
                      <h4 className="font-medium text-black">
                        Premium Quality Materials
                      </h4>
                      <p className="mt-2 text-black">
                        Our jerseys are crafted from high-quality, breathable
                        materials that ensure comfort during wear. Each jersey
                        is made with attention to detail, featuring:
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews section - completely separate from product details */}
      <div className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-xl sm:text-2xl font-bold text-black mb-8">
            Customer Reviews
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Review summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <div className="flex flex-col items-center">
                  <div className="flex items-center mb-2">
                    {[0, 1, 2, 3, 4].map((rating) => (
                      <StarIcon
                        key={rating}
                        className={`h-6 w-6 ${
                          product.averageRating > rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-lg font-semibold text-black">
                    {product.averageRating?.toFixed(1) || "0.0"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Based on {product.reviews?.length || 0} reviews
                  </p>
                </div>

                {session ? (
                  <Button
                    onClick={() =>
                      document
                        .getElementById("review-form")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    variant="default"
                    size="sm"
                    className="mt-6 w-full"
                  >
                    Write a Review
                  </Button>
                ) : (
                  <Button
                    onClick={() => signIn()}
                    variant="default"
                    size="sm"
                    className="mt-6 w-full"
                  >
                    Sign in to Review
                  </Button>
                )}
              </div>
            </div>

            {/* Review list */}
            <div className="lg:col-span-3">
              <div className="space-y-8">
                {reviews.length > 0 ? (
                  reviews.map((review, index) => (
                    <div
                      key={index}
                      className="border-b border-gray-200 pb-6 last:border-b-0"
                    >
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center">
                          {[0, 1, 2, 3, 4].map((rating) => (
                            <StarIcon
                              key={rating}
                              className={`h-4 w-4 ${
                                review.rating > rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm font-medium text-black">
                          {review.userName || "Anonymous"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-800">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No reviews yet.</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Be the first to review this product!
                    </p>
                  </div>
                )}
              </div>

              {/* Review form */}
              {session && (
                <div
                  id="review-form"
                  className="mt-12 bg-gray-50 p-6 rounded-lg"
                >
                  <h3 className="text-lg font-medium text-black mb-4">
                    Write a Review
                  </h3>
                  {reviewFeedback && (
                    <div
                      className={`mb-4 rounded-md p-4 ${
                        reviewFeedback.type === "success"
                          ? "bg-green-50"
                          : "bg-red-50"
                      }`}
                    >
                      <div className="flex">
                        <div className="flex-shrink-0">
                          {reviewFeedback.type === "success" ? (
                            <CheckCircleIcon
                              className="h-5 w-5 text-green-400"
                              aria-hidden="true"
                            />
                          ) : (
                            <XCircleIcon
                              className="h-5 w-5 text-red-400"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                        <div className="ml-3">
                          <p
                            className={`text-sm font-medium ${
                              reviewFeedback.type === "success"
                                ? "text-green-800"
                                : "text-red-800"
                            }`}
                          >
                            {reviewFeedback.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Rating
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() =>
                              setReviewInput((prev) => ({
                                ...prev,
                                rating,
                              }))
                            }
                            className="p-1 rounded-full hover:bg-gray-100 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <StarIcon
                              className={`h-5 w-5 ${
                                reviewInput.rating >= rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Comment
                      </label>
                      <textarea
                        value={reviewInput.comment}
                        onChange={(e) =>
                          setReviewInput((prev) => ({
                            ...prev,
                            comment: e.target.value,
                          }))
                        }
                        rows={4}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                        placeholder="Share your experience with this product..."
                        required
                      />
                    </div>
                    <div>
                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="w-full bg-indigo-600 border border-transparent rounded-md py-2 px-4 flex items-center justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        {isSubmittingReview ? "Submitting..." : "Submit Review"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
