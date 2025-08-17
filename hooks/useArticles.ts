import { useState, useEffect, useCallback, useRef } from 'react';
import { IArticle } from '@/lib/models/Article';

interface UseArticlesOptions {
  initialLimit?: number;
  enableCache?: boolean;
  cacheTimeout?: number;
}

interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  status?: string;
  includeDrafts?: boolean;
}

interface PaginationInfo {
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UseArticlesReturn {
  articles: IArticle[];
  pagination: PaginationInfo;
  isLoading: boolean;
  error: string | null;
  fetchArticles: (params?: Partial<PaginationParams>) => Promise<void>;
  refreshArticles: () => Promise<void>;
  clearError: () => void;
  updateArticleOptimistically: (articleId: string, updates: Partial<IArticle>) => void;
  deleteArticleOptimistically: (articleId: string) => void;
}

export function useArticles(options: UseArticlesOptions = {}): UseArticlesReturn {
  const {
    initialLimit = 20,
    enableCache = true,
    cacheTimeout = 5 * 60 * 1000, // 5 minutes
  } = options;

  const [articles, setArticles] = useState<IArticle[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    totalPages: 0,
    page: 1,
    limit: initialLimit,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const cacheRef = useRef<Map<string, { data: any; timestamp: number }>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  const buildCacheKey = useCallback((params: PaginationParams): string => {
    return JSON.stringify({
      page: params.page,
      limit: params.limit,
      search: params.search || '',
      category: params.category || '',
      status: params.status || '',
      includeDrafts: params.includeDrafts || false,
    });
  }, []);

  const isCacheValid = useCallback((cacheKey: string): boolean => {
    if (!enableCache) return false;
    
    const cached = cacheRef.current.get(cacheKey);
    if (!cached) return false;
    
    return Date.now() - cached.timestamp < cacheTimeout;
  }, [enableCache, cacheTimeout]);

  const fetchArticles = useCallback(async (params: Partial<PaginationParams> = {}) => {
    const fetchParams: PaginationParams = {
      page: params.page || 1,
      limit: params.limit || initialLimit,
      search: params.search || '',
      category: params.category || '',
      status: params.status || '',
      includeDrafts: params.includeDrafts !== false,
    };

    const cacheKey = buildCacheKey(fetchParams);

    // Check cache first
    if (isCacheValid(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey);
      if (cached) {
        setArticles(cached.data.articles);
        setPagination(cached.data.pagination);
        setError(null);
        return;
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      searchParams.append('page', fetchParams.page.toString());
      searchParams.append('limit', fetchParams.limit.toString());
      
      if (fetchParams.search) {
        searchParams.append('search', fetchParams.search);
      }
      if (fetchParams.category) {
        searchParams.append('category', fetchParams.category);
      }
      if (fetchParams.status) {
        searchParams.append('status', fetchParams.status);
      }
      if (!fetchParams.includeDrafts) {
        searchParams.append('status', 'published');
      }

      const response = await fetch(`/api/articles?${searchParams.toString()}`, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const paginationInfo: PaginationInfo = {
        total: data.pagination.total,
        totalPages: data.pagination.pages,
        page: data.pagination.page,
        limit: data.pagination.limit,
        hasNextPage: data.pagination.page < data.pagination.pages,
        hasPreviousPage: data.pagination.page > 1,
      };

      setArticles(data.articles || []);
      setPagination(paginationInfo);
      setError(null);

      // Cache the result
      if (enableCache) {
        cacheRef.current.set(cacheKey, {
          data: { articles: data.articles, pagination: paginationInfo },
          timestamp: Date.now(),
        });
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return; // Request was cancelled
      }
      
      console.error('Error fetching articles:', err);
      setError(err.message || 'Failed to fetch articles');
    } finally {
      setIsLoading(false);
    }
  }, [initialLimit, enableCache, buildCacheKey, isCacheValid]);

  const refreshArticles = useCallback(async () => {
    // Clear cache for current page
    const currentParams: PaginationParams = {
      page: pagination.page,
      limit: pagination.limit,
      search: '',
      category: '',
      status: '',
      includeDrafts: true,
    };
    const cacheKey = buildCacheKey(currentParams);
    cacheRef.current.delete(cacheKey);
    
    await fetchArticles(currentParams);
  }, [pagination.page, pagination.limit, fetchArticles, buildCacheKey]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateArticleOptimistically = useCallback((articleId: string, updates: Partial<IArticle>) => {
    setArticles(prev => 
      prev.map(article => 
        article._id === articleId 
          ? { ...article, ...updates } as IArticle
          : article
      )
    );
  }, []);

  const deleteArticleOptimistically = useCallback((articleId: string) => {
    setArticles(prev => prev.filter(article => article._id !== articleId));
    setPagination(prev => ({
      ...prev,
      total: Math.max(0, prev.total - 1),
      totalPages: Math.ceil(Math.max(0, prev.total - 1) / prev.limit),
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    articles,
    pagination,
    isLoading,
    error,
    fetchArticles,
    refreshArticles,
    clearError,
    updateArticleOptimistically,
    deleteArticleOptimistically,
  };
} 