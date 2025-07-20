import React, { useState, useCallback, useRef } from 'react';

interface Product {
  _id: string;
  title: string;
  description: string;
  basePrice: number;
  retroPrice?: number;
  shippingPrice?: number;
  stockQuantity: number;
  images: string[];
  isRetro?: boolean;
  hasShorts?: boolean;
  hasSocks?: boolean;
  sizes?: string[];
  category?: string;
  availablePatches?: string[];
  allowsNumberOnShirt?: boolean;
  allowsNameOnShirt?: boolean;
  isActive: boolean;
  feature?: boolean;
  slug?: string;
  categories?: string[];
  isMysteryBox?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UseProductsOptions {
  initialLimit?: number;
  enableCache?: boolean;
  cacheTimeout?: number;
}

interface UseProductsReturn {
  products: Product[];
  pagination: PaginationInfo;
  isLoading: boolean;
  error: string | null;
  fetchProducts: (params: {
    page?: number;
    limit?: number;
    search?: string;
    includeInactive?: boolean;
    category?: string;
    featured?: boolean;
  }) => Promise<void>;
  refreshProducts: () => Promise<void>;
  clearError: () => void;
}

// Simple in-memory cache for product data
const productCache = new Map<string, { data: any; timestamp: number }>();

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const {
    initialLimit = 20,
    enableCache = true,
    cacheTimeout = 5 * 60 * 1000, // 5 minutes
  } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: initialLimit,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const generateCacheKey = useCallback((params: any) => {
    return JSON.stringify(params);
  }, []);

  const isCacheValid = useCallback((timestamp: number) => {
    return Date.now() - timestamp < cacheTimeout;
  }, [cacheTimeout]);

  const fetchProducts = useCallback(async (params: {
    page?: number;
    limit?: number;
    search?: string;
    includeInactive?: boolean;
    category?: string;
    featured?: boolean;
  }) => {
    // Cancel previous request if it's still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    const {
      page = 1,
      limit = initialLimit,
      search = "",
      includeInactive = true,
      category = "all",
      featured = false,
    } = params;

    // Generate cache key
    const cacheKey = generateCacheKey({ page, limit, search, includeInactive, category, featured });

    // Check cache first
    if (enableCache && productCache.has(cacheKey)) {
      const cached = productCache.get(cacheKey)!;
      if (isCacheValid(cached.timestamp)) {
        setProducts(cached.data.products);
        setPagination(cached.data.pagination);
        setError(null);
        return;
      } else {
        // Remove expired cache entry
        productCache.delete(cacheKey);
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const urlParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        includeInactive: includeInactive.toString(),
        ...(search && { search }),
        ...(category !== "all" && { category }),
        ...(featured && { feature: "true" }),
      });

      const response = await fetch(`/api/products?${urlParams}`, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.products && data.pagination) {
        const paginationData = {
          total: data.pagination.total,
          page: data.pagination.page,
          limit: data.pagination.limit,
          totalPages: data.pagination.totalPages,
          hasNextPage: data.pagination.hasNextPage,
          hasPreviousPage: data.pagination.hasPreviousPage,
        };

        setProducts(data.products);
        setPagination(paginationData);

        // Cache the result
        if (enableCache) {
          productCache.set(cacheKey, {
            data: { products: data.products, pagination: paginationData },
            timestamp: Date.now(),
          });
        }
      } else {
        // Fallback for backward compatibility
        setProducts(Array.isArray(data) ? data : []);
        setPagination(prev => ({
          ...prev,
          total: Array.isArray(data) ? data.length : 0,
          totalPages: 1,
        }));
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was cancelled, don't set error
        return;
      }
      
      console.error("Error fetching products:", error);
      setError("Failed to load products");
      setProducts([]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [enableCache, generateCacheKey, isCacheValid, initialLimit]);

  const refreshProducts = useCallback(async () => {
    // Clear cache and refetch current data
    productCache.clear();
    await fetchProducts({
      page: pagination.page,
      limit: pagination.limit,
      includeInactive: true,
    });
  }, [fetchProducts, pagination.page, pagination.limit]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup function to abort pending requests
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    products,
    pagination,
    isLoading,
    error,
    fetchProducts,
    refreshProducts,
    clearError,
  };
}

// Export the cache for external management if needed
export { productCache }; 