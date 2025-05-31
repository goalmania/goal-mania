"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface JerseyAdBlockProps {
  jerseyId?: string;
}

export function JerseyAdBlock({ jerseyId }: JerseyAdBlockProps) {
  const [jersey, setJersey] = useState<{
    id: string;
    title: string;
    image: string;
    slug: string;
    basePrice: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadJersey = async () => {
      try {
        setIsLoading(true);
        // If a specific jerseyId is provided, fetch that jersey
        // Otherwise fetch a featured jersey
        const endpoint = jerseyId
          ? `/api/products/${jerseyId}`
          : `/api/products/featured?category=all&limit=1`;

        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error("Failed to fetch jersey");
        }

        const data = jerseyId
          ? await response.json()
          : (await response.json())[0];

        if (data) {
          setJersey({
            id: data._id,
            title: data.title,
            image: data.images[0],
            slug: data.slug,
            basePrice: data.basePrice,
          });
        }
      } catch (error) {
        console.error("Error loading jersey:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadJersey();
  }, [jerseyId]);

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-lg shadow-md p-6 my-8 text-center">
        <p className="text-black">Loading jersey...</p>
      </div>
    );
  }

  if (!jersey) {
    return null;
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6 my-8">
      <div className="flex flex-col md:flex-row items-center">
        <div className="relative w-full md:w-1/3 h-64 md:h-72">
          <Image
            src={jersey.image}
            alt={jersey.title}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority
          />
        </div>
        <div className="w-full md:w-2/3 p-4 md:p-6 flex flex-col">
          <h3 className="text-xl md:text-2xl font-bold text-black mb-2">
            {jersey.title}
          </h3>
          <p className="text-gray-800 mb-2">
            Get the latest jersey and show your passion
          </p>
          <p className="text-2xl font-semibold text-black mb-4">
            €{jersey.basePrice}
          </p>
          <Link
            href={`/products/${jersey.slug}`}
            className="mt-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 text-center"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
}
