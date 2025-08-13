// lib/cache.ts - In-memory caching for API responses
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class InMemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  set<T>(key: string, data: T, ttlMs: number = 300000): void { // Default 5 minutes
    // Cleanup old entries if cache is getting too large
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // Remove expired entries
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats(): { size: number; maxSize: number; hitRate?: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }

  // Create cache key from multiple parameters
  static createKey(prefix: string, ...params: (string | number | boolean)[]): string {
    return `${prefix}:${params.join(':')}`;
  }
}

// Create global cache instance
const globalCache = new InMemoryCache(2000);

// Cache decorators for common use cases
export const withCache = <T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlMs: number = 300000
): Promise<T> => {
  const cached = globalCache.get<T>(key);
  if (cached !== null) {
    return Promise.resolve(cached);
  }

  return fetchFn().then((data) => {
    globalCache.set(key, data, ttlMs);
    return data;
  });
};

// Specific cache utilities for different data types
export const ProductCache = {
  get: (key: string) => globalCache.get(key),
  set: (key: string, data: any, ttl = 600000) => globalCache.set(key, data, ttl), // 10 minutes
  createKey: (category: string, page: number, limit: number, filters: string = '') => 
    `products:${category}:${page}:${limit}:${filters}`,
};

export const ArticleCache = {
  get: (key: string) => globalCache.get(key),
  set: (key: string, data: any, ttl = 300000) => globalCache.set(key, data, ttl), // 5 minutes
  createKey: (category: string, page: number, status: string = '') => 
    `articles:${category}:${page}:${status}`,
};

export const FootballCache = {
  get: (key: string) => globalCache.get(key),
  set: (key: string, data: any, ttl = 3600000) => globalCache.set(key, data, ttl), // 1 hour
  createKey: (endpoint: string, ...params: string[]) => 
    `football:${endpoint}:${params.join(':')}`,
};

export const AnalyticsCache = {
  get: (key: string) => globalCache.get(key),
  set: (key: string, data: any, ttl = 1800000) => globalCache.set(key, data, ttl), // 30 minutes
  createKey: (metric: string, period: string = 'all') => 
    `analytics:${metric}:${period}`,
};

export default globalCache;