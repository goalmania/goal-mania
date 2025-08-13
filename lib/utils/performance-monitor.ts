// lib/utils/performance-monitor.ts - Performance monitoring utilities

interface PerformanceMetrics {
  operation: string;
  duration: number;
  timestamp: Date;
  success: boolean;
  metadata?: any;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics: number = 1000;

  // Time an async operation
  async timeOperation<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: any
  ): Promise<T> {
    const start = performance.now();
    let success = true;
    
    try {
      const result = await fn();
      return result;
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const duration = performance.now() - start;
      this.recordMetric({
        operation,
        duration,
        timestamp: new Date(),
        success,
        metadata
      });
    }
  }

  // Record a manual metric
  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  // Get performance statistics
  getStats(operation?: string): {
    totalOperations: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    successRate: number;
    recentOperations: PerformanceMetrics[];
  } {
    const filteredMetrics = operation 
      ? this.metrics.filter(m => m.operation === operation)
      : this.metrics;

    if (filteredMetrics.length === 0) {
      return {
        totalOperations: 0,
        avgDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        successRate: 0,
        recentOperations: []
      };
    }

    const durations = filteredMetrics.map(m => m.duration);
    const successCount = filteredMetrics.filter(m => m.success).length;

    return {
      totalOperations: filteredMetrics.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      successRate: (successCount / filteredMetrics.length) * 100,
      recentOperations: filteredMetrics.slice(-10)
    };
  }

  // Get slow operations (above threshold)
  getSlowOperations(thresholdMs: number = 1000): PerformanceMetrics[] {
    return this.metrics.filter(m => m.duration > thresholdMs);
  }

  // Clear all metrics
  clear(): void {
    this.metrics = [];
  }

  // Export metrics for analysis
  exportMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }
}

// Global performance monitor instance
const performanceMonitor = new PerformanceMonitor();

// Database query performance wrapper
export const monitorQuery = async <T>(
  queryName: string,
  query: () => Promise<T>,
  metadata?: any
): Promise<T> => {
  return performanceMonitor.timeOperation(
    `db:${queryName}`,
    query,
    metadata
  );
};

// API endpoint performance wrapper
export const monitorAPIEndpoint = async <T>(
  endpoint: string,
  handler: () => Promise<T>,
  metadata?: any
): Promise<T> => {
  return performanceMonitor.timeOperation(
    `api:${endpoint}`,
    handler,
    metadata
  );
};

// Cache operation monitoring
export const monitorCacheOperation = async <T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: any
): Promise<T> => {
  return performanceMonitor.timeOperation(
    `cache:${operation}`,
    fn,
    metadata
  );
};

// Performance logging middleware for APIs
export const logPerformanceMiddleware = (req: any, operationName?: string) => {
  const start = performance.now();
  const operation = operationName || `${req.method}:${req.url}`;
  
  return () => {
    const duration = performance.now() - start;
    performanceMonitor.recordMetric({
      operation,
      duration,
      timestamp: new Date(),
      success: true, // We don't know if it failed at this point
      metadata: {
        method: req.method,
        url: req.url
      }
    });
    
    // Log slow operations
    if (duration > 1000) {
      console.warn(`⚠️ Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`);
    }
  };
};

// Get performance report
export const getPerformanceReport = () => {
  const allStats = performanceMonitor.getStats();
  const dbStats = performanceMonitor.getStats('db');
  const apiStats = performanceMonitor.getStats('api');
  const cacheStats = performanceMonitor.getStats('cache');
  const slowOperations = performanceMonitor.getSlowOperations(1000);

  return {
    overall: allStats,
    database: dbStats,
    api: apiStats,
    cache: cacheStats,
    slowOperations: slowOperations.slice(-20), // Last 20 slow operations
    recommendations: generateRecommendations(allStats, slowOperations)
  };
};

// Generate performance recommendations
const generateRecommendations = (
  stats: any,
  slowOperations: PerformanceMetrics[]
): string[] => {
  const recommendations: string[] = [];

  if (stats.avgDuration > 500) {
    recommendations.push('Average operation time is high. Consider adding caching or optimizing queries.');
  }

  if (stats.successRate < 95) {
    recommendations.push('Success rate is below 95%. Check error handling and database connection stability.');
  }

  if (slowOperations.length > 10) {
    recommendations.push('Multiple slow operations detected. Review database indexes and query optimization.');
  }

  const dbOperations = slowOperations.filter(op => op.operation.startsWith('db:'));
  if (dbOperations.length > 5) {
    recommendations.push('Slow database queries detected. Consider adding indexes or using aggregation pipelines.');
  }

  const apiOperations = slowOperations.filter(op => op.operation.startsWith('api:'));
  if (apiOperations.length > 5) {
    recommendations.push('Slow API responses detected. Consider implementing response caching.');
  }

  return recommendations;
};

export default performanceMonitor;
export { PerformanceMonitor, performanceMonitor };