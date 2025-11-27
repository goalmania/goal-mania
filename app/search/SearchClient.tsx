"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface Product {
  _id: string;
  title: string;
  images: string[];
  basePrice: number;
  category: string;
}

interface Article {
  _id: string;
  title: string;
  summary: string;
  image: string;
  category: string;
  createdAt: string;
  slug: string;
}

interface SearchClientProps {
  initialProducts: Product[];
  initialArticles: Article[];
  query: string;
}

export default function SearchClient({
  initialProducts,
  initialArticles,
  query: initialQuery,
}: SearchClientProps) {
  const searchParams = useSearchParams();
  const queryParam = searchParams?.get("q") || "";
  
  // Helper function to check if an image URL is a real image (not placeholder)
  const isRealImage = (img: string): boolean => {
    if (!img || typeof img !== 'string') return false;
    const trimmed = img.trim();
    
    if (trimmed.length === 0) return false;
    
    const lowerTrimmed = trimmed.toLowerCase();
    
    // Reject placeholder images - local paths
    if (lowerTrimmed === '/images/image.png') return false;
    if (lowerTrimmed === '/images/placeholder.png') return false;
    if (lowerTrimmed.includes('/images/image.png')) return false;
    if (lowerTrimmed.includes('/images/placeholder.png')) return false;
    
    // Reject Cloudinary placeholder images (jersey-placeholder, retro-placeholder, 2025-placeholder, etc.)
    if (lowerTrimmed.includes('placeholder') || 
        lowerTrimmed.includes('jersey-placeholder') || 
        lowerTrimmed.includes('retro-placeholder') || 
        lowerTrimmed.includes('2025-placeholder')) {
      return false;
    }
    
    // Reject default/fallback images
    if (lowerTrimmed.includes('default') && (lowerTrimmed.includes('image') || lowerTrimmed.includes('placeholder'))) {
      return false;
    }
    
    // Reject generic image.png files in /images/ directory
    if (lowerTrimmed.endsWith('image.png') && lowerTrimmed.includes('/images/')) return false;
    
    return true;
  };
  
  // Helper function to check if product has real image
  const hasRealImage = (product: Product): boolean => {
    if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
      return false;
    }
    return product.images.some(isRealImage);
  };
  
  // Helper function to filter products with real images
  const filterProductsWithRealImages = (productsToFilter: Product[]): Product[] => {
    return productsToFilter.filter(hasRealImage);
  };
  
  // Filter initial products to only include those with real images
  const [products, setProducts] = useState<Product[]>(() => filterProductsWithRealImages(initialProducts));
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch search results when query parameter changes
  useEffect(() => {
    async function fetchSearchResults() {
      if (!queryParam) return;
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(queryParam)}`
        );
        if (response.ok) {
          const data = await response.json();
          
          // Additional client-side validation to ensure no products without real images
          // Filter out products that only have placeholder images
          const validProducts = filterProductsWithRealImages(data.products || []);
          
          setProducts(validProducts);
          setArticles(data.articles || []);
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSearchResults();
  }, [queryParam]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("it-IT", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter products to only include those with real images
  const productsWithRealImages = useMemo(() => {
    const filtered = products.filter(hasRealImage);
    
    // Debug logging in development
    if (process.env.NODE_ENV === 'development' && products.length > 0) {
      console.log('🔍 Product filtering:', {
        total: products.length,
        withRealImages: filtered.length,
        withoutImages: products.length - filtered.length,
        sample: products.slice(0, 3).map(p => ({
          id: p._id?.substring(0, 8),
          title: p.title?.substring(0, 30),
          images: p.images?.length || 0,
          firstImage: p.images?.[0]?.substring(0, 50) || 'none',
          hasReal: hasRealImage(p)
        }))
      });
    }
    
    return filtered;
  }, [products]);

  // Helper function to find the first real image from product's images array
  const findRealImage = (product: Product): string | null => {
    if (!product.images || !Array.isArray(product.images)) return null;
    return product.images.find(isRealImage) || null;
  };

  // Helper function to get image URL - use proxy for goalmania.shop to handle certificate errors
  const getImageUrl = (imageUrl: string): string => {
    // Use image proxy for goalmania.shop URLs to handle certificate errors
    if (imageUrl.includes('goalmania.shop')) {
      return `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
    }
    return imageUrl;
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search bar removed, now handled by header for /shop */}
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow">
                  <div className="h-40 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {queryParam && productsWithRealImages.length === 0 && articles.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-medium text-gray-900 mb-2">
                  Nessun risultato trovato per "{queryParam}"
                </h2>
                <p className="text-gray-600">
                  Prova con termini di ricerca diversi o sfoglia le nostre
                  categorie.
                </p>
              </div>
            ) : (
              <>
                {productsWithRealImages.length > 0 && (
                  <div className="mb-10">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                      Prodotti ({productsWithRealImages.length})
                    </h2>
                    <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
                      {productsWithRealImages.map((product) => {
                          // Find the first REAL image (not placeholder) from the product's images array
                          const realImage = findRealImage(product);
                          
                          // Only render if we have a real image - no fallback to placeholder
                          if (!realImage) {
                            return null; // Don't render products without real images (shouldn't happen due to filter)
                          }
                          
                          // Get the image URL (use proxy for goalmania.shop)
                          const imageUrl = getImageUrl(realImage);
                          
                          return (
                            <Link
                              key={product._id}
                              href={`/products/${product._id}`}
                              className="group"
                            >
                              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-w-7 xl:aspect-h-8">
                                <Image
                                  src={imageUrl}
                                  alt={product.title || 'Product'}
                                  width={300}
                                  height={300}
                                  className="h-full w-full object-cover object-center group-hover:opacity-75"
                                  unoptimized={imageUrl.includes('/api/image-proxy')}
                                  onError={(e) => {
                                    // Log error but don't hide the product - show broken image icon instead
                                    console.warn('Image failed to load:', imageUrl);
                                    // Optionally set a fallback background color
                                    const img = e.target as HTMLImageElement;
                                    img.style.backgroundColor = '#f3f4f6';
                                  }}
                                />
                              </div>
                              <h3 className="mt-4 text-sm text-gray-700">
                                {product.title}
                              </h3>
                              <p className="mt-1 text-lg font-medium text-gray-900">
                                €{product.basePrice || 0}
                              </p>
                            </Link>
                          );
                        })
                        .filter((item) => item !== null)}
                    </div>
                  </div>
                )}

                {articles.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                      Articoli ({articles.length})
                    </h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {articles.map((article) => (
                        <Link
                          key={article._id}
                          href={`/news/${article.slug}`}
                          className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="aspect-w-16 aspect-h-9">
                            <Image
                              src={article.image || "/images/image.png"}
                              alt={article.title}
                              width={600}
                              height={338}
                              className="h-48 w-full object-cover"
                            />
                          </div>
                          <div className="p-4">
                            <div className="flex items-center text-xs text-gray-500 mb-1">
                              <span className="capitalize">
                                {article.category}
                              </span>
                              <span className="mx-1">•</span>
                              <span>{formatDate(article.createdAt)}</span>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              {article.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {article.summary}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
