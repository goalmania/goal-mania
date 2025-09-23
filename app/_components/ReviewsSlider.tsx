"use client";

import { useState, useEffect, useRef } from "react";
import { StarIcon } from "@heroicons/react/20/solid";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "@/lib/hooks/useTranslation";
import Image from "next/image";
import ReviewMediaDisplay from "@/components/ReviewMediaDisplay";

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  media?: {
    images: string[];
    videos: string[];
  };
  createdAt: string;
  updatedAt: string;
  productId: string;
  productName: string;
  productImage: string;
  source?: "product" | "standalone";
}

export default function ReviewsSlider() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isReviewsEnabled, setIsReviewsEnabled] = useState(true);
  const { t } = useTranslation();

  // Items to show at once based on screen size
  const getVisibleItems = () => {
    if (typeof window === "undefined") return 1;
    const width = window.innerWidth;
    if (width < 640) return 1;
    if (width < 1024) return 2;
    return 3;
  };

  const [visibleItems, setVisibleItems] = useState(1);

  // Track window resize
  useEffect(() => {
    setMounted(true);
    setVisibleItems(getVisibleItems());

    const handleResize = () => {
      setVisibleItems(getVisibleItems());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!isReviewsEnabled) return;

      try {
        setIsLoading(true);
        const response = await fetch("/api/all-reviews");
        if (!response.ok) {
          throw new Error(`Failed to fetch reviews: ${response.status}`);
        }

        const data = await response.json();

        if (data && Array.isArray(data) && data.length > 0) {
          setReviews(data);
        } else {
          setReviews([]);
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch reviews"
        );
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [isReviewsEnabled]);

  // Navigation handlers
  const goToPrev = () => {
    setCurrentIndex((prev) => {
      if (prev === 0) {
        return Math.max(0, reviews.length - visibleItems);
      }
      return Math.max(0, prev - 1);
    });
  };

  const goToNext = () => {
    setCurrentIndex((prev) => {
      if (prev >= reviews.length - visibleItems) {
        return 0;
      }
      return prev + 1;
    });
  };

  // Auto scroll every 5 seconds
  useEffect(() => {
    if (reviews.length <= visibleItems) return;

    const timer = setInterval(() => {
      goToNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [reviews.length, currentIndex, visibleItems]);

  // Extract the date from a review comment if available
  const extractDateFromComment = (comment: string) => {
    const match = comment.match(/\((.*?)\):/);
    return match ? match[1] : null;
  };

  // Format date helper
  const formatDate = (dateStr: string, review: Review) => {
    try {
      // If this is a standalone review, try to extract date from comment
      if (review.source === "standalone") {
        const extractedDate = extractDateFromComment(review.comment);
        if (extractedDate) {
          return extractedDate;
        }
      }

      // Otherwise format the date from the createdAt field
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error, "date string:", dateStr);
      return "Data non disponibile";
    }
  };

  // Extract the actual comment text without date prefix
  const extractComment = (review: Review) => {
    if (review.source === "standalone" && review.comment.includes("): ")) {
      return review.comment.split("): ")[1];
    }
    return review.comment;
  };

  if (!mounted) {
    return (
      <div className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-72 bg-gray-100 animate-pulse rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {t("shop.reviews.title")}
            </h2>
            <div className="mt-10 flex items-center justify-center space-x-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex flex-col rounded-lg bg-gray-100 p-6 animate-pulse h-64 w-full max-w-md"
                >
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                  <div className="h-24 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  // Calculate visible reviews
  const visibleReviews =
    reviews.length > visibleItems
      ? [...reviews.slice(currentIndex), ...reviews.slice(0, currentIndex)]
      : reviews;

  return (
    <div className="bg-white py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t("shop.reviews.title")}
          </h2>
          <p className="mt-2 sm:mt-4 text-sm sm:text-base md:text-lg text-gray-600">
            {t("shop.reviews.rating")} ({reviews.length})
          </p>
        </div>

        <div className="mt-8 sm:mt-12 relative">
          {/* Navigation buttons */}
          {reviews.length > visibleItems && (
            <>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 sm:-translate-x-4 z-10">
                <button
                  onClick={goToPrev}
                  className="rounded-full bg-white p-1.5 sm:p-2 shadow-md hover:bg-gray-50 focus:outline-none"
                  aria-label="Previous review"
                >
                  <ChevronLeftIcon className="h-4 w-4 sm:h-6 sm:w-6 text-gray-600" />
                </button>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 sm:translate-x-4 z-10">
                <button
                  onClick={goToNext}
                  className="rounded-full bg-white p-1.5 sm:p-2 shadow-md hover:bg-gray-50 focus:outline-none"
                  aria-label="Next review"
                >
                  <ChevronRightIcon className="h-4 w-4 sm:h-6 sm:w-6 text-gray-600" />
                </button>
              </div>
            </>
          )}

          {/* Reviews */}
          <div
            ref={sliderRef}
            className="flex overflow-hidden space-x-4 sm:space-x-6 px-1 sm:px-4"
          >
            {visibleReviews.map((review, index) => (
              <div
                key={`review-${review.id || index}`}
                className={`flex-shrink-0 w-full ${
                  visibleItems === 1
                    ? "max-w-full"
                    : visibleItems === 2
                    ? "max-w-[calc(50%-8px)] sm:max-w-[calc(50%-12px)]"
                    : "max-w-[calc(33.333%-11px)] sm:max-w-[calc(33.333%-16px)]"
                }`}
              >
                <div className="h-full flex flex-col bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
                  <div className="flex items-center mb-2 sm:mb-4">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-semibold text-sm sm:text-base">
                        {review.userName?.charAt(0) || "U"}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-medium text-gray-900">
                        {review.userName || "Usuario"}
                      </h3>
                      <div className="text-xs sm:text-sm text-gray-500">
                        {formatDate(review.createdAt, review)}
                      </div>
                    </div>
                  </div>
                  <div className="flex mb-2 sm:mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-3.5 w-3.5 sm:h-5 sm:w-5 ${
                          i < review.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 flex-grow line-clamp-4 sm:line-clamp-6">
                    {extractComment(review)}
                  </p>

                  {/* Display review media if available */}
                  {review.media &&
                    (review.media.images?.length > 0 ||
                      review.media.videos?.length > 0) && (
                      <div className="mt-3">
                        <ReviewMediaDisplay
                          media={review.media}
                          className="mt-2"
                        />
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination dots */}
          {reviews.length > visibleItems && (
            <div className="flex justify-center mt-4 sm:mt-6 space-x-2">
              {Array.from({
                length: Math.min(5, Math.ceil(reviews.length / visibleItems)),
              }).map((_, i) => {
                // Determine if this dot is active
                const isActive =
                  i ===
                  Math.floor(
                    currentIndex /
                      (reviews.length / Math.min(5, reviews.length))
                  );

                return (
                  <button
                    key={`dot-${i}`}
                    className={`h-1.5 sm:h-2 rounded-full transition-all ${
                      isActive
                        ? "w-4 sm:w-6 bg-primary"
                        : "w-1.5 sm:w-2 bg-gray-300"
                    }`}
                    onClick={() => {
                      const targetIndex = Math.floor(
                        (i * reviews.length) /
                          Math.min(5, Math.ceil(reviews.length / visibleItems))
                      );
                      setCurrentIndex(
                        Math.min(
                          targetIndex,
                          Math.max(0, reviews.length - visibleItems)
                        )
                      );
                    }}
                    aria-label={`Go to review set ${i + 1}`}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
