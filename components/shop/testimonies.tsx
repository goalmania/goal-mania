"use client";
import React, { useState, useEffect } from "react";
import { CheckCircle2, Star, ArrowRight, ArrowLeft } from "lucide-react";

interface Review {
  id: string;
  userName: string;
  comment: string;
  rating: number;
  productId: string;
  createdAt: string;
  updatedAt: string;
}

interface Testimony {
  id: string;
  name: string;
  text: string;
  rating: number;
}

const Testimonies = () => {
  const [current, setCurrent] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReviewsEnabled, setIsReviewsEnabled] = useState(true);

  const visibleCards = 4;

  useEffect(() => {
    console.log("Component mounted, starting to fetch reviews");

    const fetchReviews = async () => {
      if (!isReviewsEnabled) {
        console.log("Reviews fetching is disabled");
        return;
      }

      try {
        console.log("Starting fetch request to /api/all-reviews");
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/all-reviews");
        console.log("Response received:", response.status, response.statusText);

        if (!response.ok) {
          throw new Error(`Failed to fetch reviews: ${response.status}`);
        }

        const data: Review[] = await response.json();
        console.log("Data received from API:", data);

        if (data && Array.isArray(data) && data.length > 0) {
          console.log(`Successfully fetched ${data.length} reviews`);
          setReviews(data);

          // Transform API data to testimonies format
          const transformedTestimonies: Testimony[] = data.map((review) => ({
            id: review.id,
            name: review.userName || "Anonymous",
            text: review.comment || "",
            rating: review.rating || 5,
          }));

          setTestimonies(transformedTestimonies);
          console.log("Transformed testimonies:", transformedTestimonies);
        } else {
          console.log("No reviews found or invalid data format");
          setReviews([]);
          setTestimonies([]);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch reviews";
        setError(errorMessage);
        setReviews([]);
        setTestimonies([]);
      } finally {
        setIsLoading(false);
        console.log("Fetch operation completed");
      }
    };

    fetchReviews();
  }, [isReviewsEnabled]);

  // Log state changes
  useEffect(() => {
    console.log("Reviews state updated:", reviews);
  }, [reviews]);

  useEffect(() => {
    console.log("Testimonies state updated:", testimonies);
  }, [testimonies]);

  useEffect(() => {
    console.log("Loading state updated:", isLoading);
  }, [isLoading]);

  useEffect(() => {
    console.log("Error state updated:", error);
  }, [error]);

  const nextSlide = () => {
    console.log("Next slide clicked, current:", current);
    if (current < testimonies.length - visibleCards) {
      setCurrent((prev) => {
        const newValue = prev + 1;
        console.log("Moving to slide:", newValue);
        return newValue;
      });
    }
  };

  const prevSlide = () => {
    console.log("Previous slide clicked, current:", current);
    if (current > 0) {
      setCurrent((prev) => {
        const newValue = prev - 1;
        console.log("Moving to slide:", newValue);
        return newValue;
      });
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="relative w-full max-w-7xl mx-auto p-6">
        <div className="mb-4">
          <h2 className="text-5xl font-bold">I nostri clienti felici</h2>
        </div>
        <div className="flex gap-4">
          {Array.from({ length: visibleCards }).map((_, index) => (
            <div key={index} className="w-full sm:w-1/2 lg:w-1/4 flex-shrink-0">
              <div className="h-64 border border-gray-200 rounded-2xl bg-gray-100 animate-pulse">
                <div className="p-4 space-y-3">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 bg-gray-300 rounded"
                      ></div>
                    ))}
                  </div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-300 rounded"></div>
                    <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-300 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="relative w-full max-w-7xl mx-auto p-6">
        <div className="mb-4">
          <h2 className="text-5xl font-bold">I nostri clienti felici</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading reviews: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show empty state
  if (testimonies.length === 0) {
    return (
      <div className="relative w-full max-w-7xl mx-auto p-6">
        <div className="mb-4">
          <h2 className="text-5xl font-bold">I nostri clienti felici</h2>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-600">No reviews available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-7xl mx-auto p-6 overflow-hidden">
      <div className="mb-4 flex items-center md:justify-between justify-center">
        <h2 className="md:text-5xl text-[37px] font-bold md:text-left text-center">
          I nostri clienti felici
        </h2>

        <div className=" gap-2 hidden lg:flex">
          <button
            onClick={prevSlide}
            disabled={current === 0}
            className="p-2 border-none shadow-none rounded-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextSlide}
            disabled={current >= testimonies.length - visibleCards}
            className="p-2 border-none shadow-none rounded-none  cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${current * (100 / visibleCards)}%)`,
          }}
        >
          {testimonies.map((item) => (
            <div
              key={item.id}
              className="w-full sm:w-1/2 lg:w-1/4 flex-shrink-0 px-3"
            >
              <div className="h-64 border border-black/10 rounded-2xl shadow-sm bg-white">
                <div className="p-4 text-start space-y-2 h-full flex flex-col">
                  {/* Stars */}
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        fill={i < item.rating ? "#FFC633" : "none"}
                        color="#FFC633"
                        size={19}
                      />
                    ))}
                  </div>

                  {/* Name */}
                  <h3 className="text-base flex items-center font-bold tracking-tight text-gray-800">
                    {item.name}
                    <CheckCircle2
                      className="ml-1"
                      fill="#01AB31"
                      color="white"
                      size={16}
                    />
                  </h3>

                  {/* Text */}
                  <p className="text-sm text-gray-800 flex-1 overflow-hidden leading-relaxed">
                    {item.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonies;
