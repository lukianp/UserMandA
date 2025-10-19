/**
 * React Hook for Cache Service
 *
 * Provides React integration for the caching service with automatic
 * state management and re-rendering on cache changes.
 */

import { useState, useEffect, useCallback } from 'react';
import { getCacheService } from '../services/cacheService';

const cacheService = getCacheService();

/**
 * Hook for cached data with automatic refresh
 */
export function useCache<T>(
  key: string,
  factory: () => Promise<T>,
  options?: {
    ttl?: number;
    refreshInterval?: number;
    enabled?: boolean;
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (options?.enabled === false) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await cacheService.getOrSet(key, factory, { ttl: options?.ttl });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setIsLoading(false);
    }
  }, [key, factory, options?.ttl, options?.enabled]);

  useEffect(() => {
    fetchData();

    // Set up refresh interval if specified
    let intervalId: NodeJS.Timeout | undefined;
    if (options?.refreshInterval) {
      intervalId = setInterval(fetchData, options.refreshInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchData, options?.refreshInterval]);

  const invalidate = useCallback(() => {
    cacheService.delete(key);
    fetchData();
  }, [key, fetchData]);

  const refresh = useCallback(() => {
    cacheService.delete(key);
    return fetchData();
  }, [key, fetchData]);

  return {
    data,
    isLoading,
    error,
    invalidate,
    refresh,
  };
}

/**
 * Hook for cache statistics
 */
export function useCacheStats() {
  const [stats, setStats] = useState(cacheService.getStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(cacheService.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return stats;
}

/**
 * Hook for cache management operations
 */
export function useCacheManager() {
  const clear = useCallback(() => {
    cacheService.clear();
  }, []);

  const invalidatePattern = useCallback((pattern: RegExp) => {
    return cacheService.invalidatePattern(pattern);
  }, []);

  const invalidatePrefix = useCallback((prefix: string) => {
    return cacheService.invalidatePrefix(prefix);
  }, []);

  const getStats = useCallback(() => {
    return cacheService.getStats();
  }, []);

  const saveToStorage = useCallback(() => {
    cacheService.saveToStorage();
  }, []);

  return {
    clear,
    invalidatePattern,
    invalidatePrefix,
    getStats,
    saveToStorage,
  };
}

/**
 * Hook for cached query with dependencies
 */
export function useCachedQuery<T>(
  queryKey: string | string[],
  queryFn: () => Promise<T>,
  options?: {
    ttl?: number;
    enabled?: boolean;
    staleTime?: number;
  }
) {
  const key = Array.isArray(queryKey) ? queryKey.join(':') : queryKey;
  return useCache(key, queryFn, options);
}
