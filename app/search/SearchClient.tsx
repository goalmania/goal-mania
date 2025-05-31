"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams?.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(queryParam || initialQuery);
  const [products, setProducts] = useState<Product[]>(initialProducts);
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
          setProducts(data.products || []);
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Update URL with search query
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("q", searchQuery);
    router.push(`/search?${params.toString()}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("it-IT", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Ricerca</h1>
          <form onSubmit={handleSearch} className="max-w-3xl">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca prodotti, articoli..."
                className="block w-full rounded-md border-0 py-3 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 flex items-center px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Cerca
              </button>
            </div>
          </form>
        </div>

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
            {queryParam && products.length === 0 && articles.length === 0 ? (
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
                {products.length > 0 && (
                  <div className="mb-10">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                      Prodotti ({products.length})
                    </h2>
                    <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
                      {products.map((product) => (
                        <Link
                          key={product._id}
                          href={`/products/${product._id}`}
                          className="group"
                        >
                          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-w-7 xl:aspect-h-8">
                            <Image
                              src={product.images?.[0] || "/images/image.png"}
                              alt={product.title}
                              width={300}
                              height={300}
                              className="h-full w-full object-cover object-center group-hover:opacity-75"
                            />
                          </div>
                          <h3 className="mt-4 text-sm text-gray-700">
                            {product.title}
                          </h3>
                          <p className="mt-1 text-lg font-medium text-gray-900">
                            €{product.basePrice}
                          </p>
                        </Link>
                      ))}
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
