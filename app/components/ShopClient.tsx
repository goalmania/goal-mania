"use client";
import { useState, useEffect } from "react";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useCartStore } from "@/lib/store/cart";
import { useTranslation } from "@/lib/hooks/useTranslation";
import ProductGrid from "@/app/components/ProductGrid";
import ShopNav from "@/app/components/ShopNav";
import FAQ from "@/app/components/FAQ";
import Guarantees from "@/app/components/Guarantees";
import ReviewsSlider from "@/app/components/ReviewsSlider";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  team: string;
}

export default function ShopClient({ products }: { products: Product[] }) {
  // Always declare all hooks at the top level, regardless of whether they're used immediately
  const [mounted, setMounted] = useState(false);
  const [season2025Products, setSeason2025Products] = useState<Product[]>([]);
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null);
  const [featuredProduct2, setFeaturedProduct2] = useState<Product | null>(
    null
  );
  const [featuredProduct3, setFeaturedProduct3] = useState<Product | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Declare store hooks
  const wishlistStore = useWishlistStore();
  const cartStore = useCartStore();
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    setIsLoading(true);
    setError(null);

    // Fetch 2025/26 products
    const fetchSeason2025Products = async () => {
      try {
        console.log("Fetching 2025/26 products...");
        // Using category=2025%2F26 as / needs to be URL encoded, with noPagination for direct array
        const response = await fetch(
          "/api/products?category=2025%2F26&limit=8&noPagination=true"
        );
        if (!response.ok) {
          throw new Error(`Error fetching products: ${response.status}`);
        }
        const data = await response.json();
        console.log("Received data:", data);

        let productsData = [];
        // Check if the data has a products property (for compatibility with API structure)
        if (data.products && Array.isArray(data.products)) {
          productsData = data.products;
        } else if (Array.isArray(data)) {
          productsData = data;
        } else {
          throw new Error("Invalid data format received from API");
        }

        // Map to client format
        const mappedProducts = productsData.map((product: any) => ({
          id: product._id || "",
          name: product.title || "Unknown Product",
          price: product.basePrice || 0,
          image: product.images?.[0] || "/images/image.png",
          category: product.category || "Uncategorized",
          team: product.title ? product.title.split(" ")[0] : "Unknown",
        }));

        console.log("Mapped products:", mappedProducts.length);
        setSeason2025Products(mappedProducts);
      } catch (error) {
        console.error("Error fetching 2025/26 products:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch products"
        );
        setSeason2025Products([]);
      }
    };

    // Fetch featured products for the highlight sections
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch("/api/products?feature=true&limit=3");
        if (!response.ok) {
          throw new Error(
            `Error fetching featured products: ${response.status}`
          );
        }
        const data = await response.json();

        // Handle the API response format which returns {products: [...]} object
        let productsData = [];
        if (data.products && Array.isArray(data.products)) {
          productsData = data.products;
        } else if (Array.isArray(data)) {
          productsData = data;
        } else {
          throw new Error("Invalid data format received from API");
        }

        if (productsData.length > 0) {
          // First featured product
          const product1 = productsData[0];
          setFeaturedProduct({
            id: product1._id || "",
            name: product1.title || "Featured Product",
            price: product1.basePrice || 0,
            image: product1.images?.[0] || "/images/image.png",
            category: product1.category || "Uncategorized",
            team: product1.title ? product1.title.split(" ")[0] : "Unknown",
          });

          // Second featured product (if available)
          if (productsData.length > 1) {
            const product2 = productsData[1];
            setFeaturedProduct2({
              id: product2._id || "",
              name: product2.title || "Featured Product",
              price: product2.basePrice || 0,
              image: product2.images?.[0] || "/images/image.png",
              category: product2.category || "Uncategorized",
              team: product2.title ? product2.title.split(" ")[0] : "Unknown",
            });
          }

          // Third featured product (if available)
          if (productsData.length > 2) {
            const product3 = productsData[2];
            setFeaturedProduct3({
              id: product3._id || "",
              name: product3.title || "Featured Product",
              price: product3.basePrice || 0,
              image: product3.images?.[0] || "/images/image.png",
              category: product3.category || "Uncategorized",
              team: product3.title ? product3.title.split(" ")[0] : "Unknown",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
        // Don't set error state here since we already might have set it above
        // Just clear the featured products
        setFeaturedProduct(null);
        setFeaturedProduct2(null);
        setFeaturedProduct3(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Execute both fetch operations
    const fetchData = async () => {
      try {
        await Promise.all([fetchSeason2025Products(), fetchFeaturedProducts()]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Add this outside the useEffect hook to make it accessible to the rest of the component
  const retryFetchSeason2025Products = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Retrying 2025/26 products fetch...");
      const response = await fetch(
        "/api/products?category=2025%2F26&limit=8&noPagination=true"
      );
      if (!response.ok) {
        throw new Error(`Error fetching products: ${response.status}`);
      }
      const data = await response.json();

      let productsData = [];
      if (data.products && Array.isArray(data.products)) {
        productsData = data.products;
      } else if (Array.isArray(data)) {
        productsData = data;
      } else {
        throw new Error("Invalid data format received from API");
      }

      // Map to client format
      const mappedProducts = productsData.map((product: any) => ({
        id: product._id || "",
        name: product.title || "Unknown Product",
        price: product.basePrice || 0,
        image: product.images?.[0] || "/images/image.png",
        category: product.category || "Uncategorized",
        team: product.title ? product.title.split(" ")[0] : "Unknown",
      }));

      setSeason2025Products(mappedProducts);
    } catch (error) {
      console.error("Error fetching 2025/26 products:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch products"
      );
      setSeason2025Products([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  // If not mounted, show skeleton loading UI
  if (!mounted) {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="group">
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-w-7 xl:aspect-h-8 h-80"></div>
                  <div className="mt-4 h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="mt-2 h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Extract store methods only after we're mounted and rendering
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = wishlistStore;
  const { addItem: addToCart } = cartStore;

  return (
    <div className="bg-white">
      <ShopNav />

      {/* Search Bar */}
      <div className="bg-gray-100 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                placeholder="Cerca prodotti..."
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 px-3 flex items-center bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
              >
                Cerca
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Hero section - adjust height to account for fixed header */}
      <div className="relative pt-4">
        <div className="mx-auto max-w-7xl">
          <div className="relative z-10 pt-10 sm:pt-14 lg:w-full lg:max-w-2xl">
            <div className="relative px-4 sm:px-6 py-12 sm:py-16 md:py-24 lg:px-8 lg:py-56 lg:pr-0">
              <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  {t("shop.hero.title")}
                </h1>
                <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg leading-6 sm:leading-8 text-gray-600">
                  {t("shop.hero.description")}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Image section - full width on mobile, half width on desktop */}
        <div className="bg-gray-50 h-64 sm:h-72 md:h-96 lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-1/2">
          <div className="h-full w-full relative">
            <Image
              src="/images/shop/shophome.jpg"
              alt="Shop Hero"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </div>

      {/* Customer Satisfaction Message */}
      <div className="bg-gray-800 py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Oltre 1200 Clienti Felici ⭐️{" "}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base md:text-lg text-white">
              Oltre 1200 persone hanno scelto di fare parte della nostra
              famiglia di clienti soddisfatti. La qualità dei nostri prodotti e
              l'attenzione che dedichiamo a ogni dettaglio hanno reso ogni
              acquisto un'esperienza positiva.
            </p>
          </div>
        </div>
      </div>

      {/* Maglie 2025/26 Section */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Maglie 2025/26
          </h2>
          <Link
            href="/shop/2025/26"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Vedi tutti
          </Link>
        </div>
        <div className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-48 md:h-64 rounded-lg"></div>
                  <div className="h-4 bg-gray-200 rounded mt-2 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded mt-2 w-1/2"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
              <button
                onClick={retryFetchSeason2025Products}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Riprova
              </button>
            </div>
          ) : season2025Products.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nessun prodotto disponibile in questa categoria.</p>
            </div>
          ) : (
            <Suspense fallback={<div>Loading...</div>}>
              <ProductGrid
                products={season2025Products}
                onWishlistToggle={(product) => {
                  const productId = product.id.toString();
                  if (isInWishlist(productId)) {
                    removeFromWishlist(productId);
                  } else {
                    addToWishlist({
                      id: productId,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      team: product.team,
                    });
                  }
                }}
                onAddToCart={(product) => {
                  router.push(`/products/${product.id}`);
                }}
                isInWishlist={isInWishlist}
              />
            </Suspense>
          )}
        </div>
      </div>

      {/* Guarantees Section */}
      <div className="bg-gray-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Guarantees />
        </div>
      </div>

      {/* Featured Product Showcase 1 */}
      {featuredProduct && (
        <div className="bg-[#1e2937] py-10 sm:py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 lg:gap-16">
              {/* Product Image - Left side */}
              <div className="w-full md:w-1/2">
                <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
                  <Image
                    src={featuredProduct.image}
                    alt={featuredProduct.name}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
              </div>

              {/* Product Description - Right side */}
              <div className="w-full md:w-1/2 text-white">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                  Qualità Super 🧵
                </h2>
                <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8">
                  Le nostre maglie sono capi curati nei minimi dettagli con
                  <span className="font-semibold"> materiali premium</span>.
                  Perfette per i veri appassionati che vogliono collezionare
                  emozioni, non solo tessuto.
                </p>
                <Link
                  href={`/products/${featuredProduct.id}`}
                  className="inline-block bg-white text-[#1e2937] px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-semibold rounded-md hover:bg-gray-100 transition-colors"
                >
                  Acquista ora
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Featured Product Showcase 2 */}
      {featuredProduct2 && (
        <div className="bg-white py-10 sm:py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row-reverse items-center gap-6 md:gap-8 lg:gap-16">
              {/* Product Image - Right side (reversed) */}
              <div className="w-full md:w-1/2">
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={featuredProduct2.image}
                    alt={featuredProduct2.name}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
              </div>

              {/* Product Description - Left side */}
              <div className="w-full md:w-1/2 text-gray-900">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                  Modelli introvabili 🔥
                </h2>
                <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8">
                  Associa un testo a un'immagine per dare importanza al
                  prodotto, alla collezione o all'articolo del blog di tua
                  scelta. Aggiungi dettagli sulla disponibilità, sullo stile o
                  fornisci una recensione.
                </p>
                <Link
                  href={`/products/${featuredProduct2.id}`}
                  className="inline-block bg-[#1e2937] text-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-semibold rounded-md hover:bg-gray-800 transition-colors"
                >
                  Acquista ora
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Featured Product Showcase 3 */}
      {featuredProduct3 && (
        <div className="bg-gray-100 py-10 sm:py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 lg:gap-16">
              {/* Product Image - Left side */}
              <div className="w-full md:w-1/2">
                <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
                  <Image
                    src={featuredProduct3.image}
                    alt={featuredProduct3.name}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
              </div>

              {/* Product Description - Right side */}
              <div className="w-full md:w-1/2 text-gray-900">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                  Vestibilità perfetta 🎯
                </h2>
                <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8">
                  Associa un testo a un'immagine per dare importanza al
                  prodotto, alla collezione o all'articolo del blog di tua
                  scelta. Aggiungi dettagli sulla disponibilità, sullo stile o
                  fornisci una recensione.
                </p>
                <Link
                  href={`/products/${featuredProduct3.id}`}
                  className="inline-block bg-[#1e2937] text-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-semibold rounded-md hover:bg-gray-800 transition-colors"
                >
                  Acquista ora
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Customer Satisfaction Banner */}
      <div className="bg-gray-800 py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Valutazioni Stellari: 4.8⭐️ di Media!{" "}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base md:text-lg text-white">
              Oltre 1200 clienti felici e +40 recensioni tutte positive, che
              trovi scorrendo in basso! Unisciti a noi nel creare esperienze
              uniche e rendere ogni giorno migliore con le maglie che hanno
              scritto la storia. La nostra famiglia è pronta ad accoglierti a
              braccia aperte!
            </p>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <Suspense
        fallback={<div className="h-64 bg-gray-100 animate-pulse"></div>}
      >
        <ReviewsSlider />
      </Suspense>

      {/* FAQ Section */}
      <div className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FAQ />
        </div>
      </div>
    </div>
  );
}
