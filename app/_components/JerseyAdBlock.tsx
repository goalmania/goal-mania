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
          : `/api/products?limit=1&noPagination=true`;

        console.log("🔍 Fetching jersey from:", endpoint);

        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });

        console.log("📡 Response status:", response.status);

        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          console.log("📄 Content-Type:", contentType);
          
          let errorText = '';
          try {
            errorText = await response.text();
            console.error("❌ Error response:", errorText);
          } catch (e) {
            console.error("❌ Could not read error response");
          }
          
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        console.log("📦 Received data:", data);
        
        // Handle different response formats
        let jerseyData;
        if (jerseyId) {
          jerseyData = data;
        } else {
          // For products API, extract from products array
          jerseyData = data.products?.[0] || data[0];
        }

        console.log("👕 Jersey data:", jerseyData);

        if (jerseyData && jerseyData.title) {
          setJersey({
            id: jerseyData._id || jerseyData.id || 'unknown',
            title: jerseyData.title,
            image: jerseyData.images?.[0] || jerseyData.image || '/images/placeholder.png',
            slug: jerseyData.slug || jerseyData._id || 'product',
            basePrice: jerseyData.basePrice || 30,
          });
        } else {
          console.warn("⚠️ No valid jersey data found");
        }
      } catch (error) {
        console.error("❌ Error loading jersey:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadJersey();
  }, [jerseyId]);

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-lg shadow-md p-6 my-8 text-center">
        <p className="text-black">Caricamento maglia...</p>
      </div>
    );
  }

  if (!jersey) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-orange-500 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-6 my-8 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200 to-orange-300 opacity-20 rounded-full -translate-y-16 translate-x-16"></div>
      
      <div className="flex flex-col md:flex-row items-center relative z-10">
        <div className="relative w-full md:w-1/3 h-64 md:h-72 mb-4 md:mb-0">
          {/* Enhanced image container with subtle shadow and border */}
          <div className="relative w-full h-full bg-white rounded-lg shadow-md border-2 border-orange-200 overflow-hidden">
            <Image
              src={jersey.image}
              alt={jersey.title}
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority
            />
          </div>
          {/* "Featured" badge */}
          <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
            IN EVIDENZA
          </div>
        </div>
        
        <div className="w-full md:w-2/3 p-4 md:p-6 flex flex-col">
          {/* Enhanced title with orange accent */}
          <div className="mb-3">
            <span className="text-orange-500 text-sm font-semibold uppercase tracking-wide">
              Offerta Esclusiva
            </span>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 leading-tight">
              {jersey.title}
            </h3>
          </div>
          
          {/* Enhanced description */}
          <p className="text-gray-700 mb-3 font-medium">
            🔥 Acquista la maglia più recente e mostra la tua passione per il calcio!
          </p>
          
          {/* Enhanced price with orange styling */}
          <div className="mb-4">
            <span className="text-3xl font-bold text-orange-600">
              €{jersey.basePrice}
            </span>
            <span className="text-gray-500 ml-2 line-through text-lg">
              €{Math.round(jersey.basePrice * 1.2)}
            </span>
          </div>
          
          {/* Enhanced call-to-action button with orange theme */}
          <Link
            href={`/products/${jersey.slug}`}
            className="mt-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 flex items-center justify-center gap-2"
          >
            <span>🛒 Acquista Ora</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          
          {/* Additional incentive text */}
          <p className="text-xs text-orange-600 mt-2 text-center font-medium">
            ⚡ Offerta a tempo limitato • Spedizione gratuita
          </p>
        </div>
      </div>
    </div>
  );
}