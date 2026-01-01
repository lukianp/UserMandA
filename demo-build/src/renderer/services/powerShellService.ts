/**
 * Renderer-side PowerShell Service
 *
 * Mirrors C# CsvDataServiceNew and LogicEngineService patterns with:
 * - Session-based caching with TTL (Time To Live)
 * - Automatic cache invalidation
 * - Progress reporting
 * - Cancellation support
 * - Fallback mechanisms
 * - Script and module execution
 *
 * This service acts as a client-side wrapper around the Electron IPC PowerShell execution.
 */

import type {
  ExecutionOptions,
  ExecutionResult,
  ScriptExecutionParams,
  ModuleExecutionParams,
  ProgressData,
  OutputData,
} from '../types/electron';
import { getElectronAPI } from '../lib/electron-api-fallback';

/**
 * Cached result with metadata
 */
interface CachedResult<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

/**
 * PowerShell service configuration
 */
interface PowerShellServiceConfig {
  /** Default cache TTL in milliseconds (default: 5 minutes like C#) */
  defaultCacheTTL: number;
  /** Enable automatic cache cleanup */
  enableCacheCleanup: boolean;
  /** Cache cleanup interval in milliseconds */
  cacheCleanupInterval: number;
  /** Maximum cache size (number of entries) */
  maxCacheSize: number;
}

/**
 * PowerShell Service - Client-side wrapper for PowerShell execution
 *
 * Mirrors C# patterns from:
 * - GUI/Services/CsvDataServiceNew.cs
 * - GUI/Services/LogicEngineService.cs
 * - GUI/Services/PowerShellExecutor.cs
 */
export class PowerShellService {
  private cache: Map<string, CachedResult> = new Map();
  private config: PowerShellServiceConfig;
  private cacheCleanupInterval: any = null;
  private progressCallbacks: Map<string, (data: ProgressData) => void> = new Map();
  private outputCallbacks: Map<string, (data: OutputData) => void> = new Map();

  constructor(config?: Partial<PowerShellServiceConfig>) {
    this.config = {
      defaultCacheTTL: 300000, // 5 minutes like C#
      enableCacheCleanup: true,
      cacheCleanupInterval: 60000, // 1 minute
      maxCacheSize: 100,
      ...config,
    };

    if (this.config.enableCacheCleanup) {
      this.startCacheCleanup();
    }

    // Setup IPC event listeners for progress and output
    this.setupEventListeners();
  }

  /**
   * Setup event listeners for PowerShell execution events
   * Mirrors C# event handling patterns
   */
  private setupEventListeners(): void {
    const api = getElectronAPI();
    if (!api) return;

    // Progress events
    if (api.onProgress) {
      api.onProgress((data: ProgressData) => {
        const callback = this.progressCallbacks.get(data.executionId);
        if (callback) {
          callback(data);
        }
      });
    }

    // Output events - handle all 6 PowerShell streams
    if (api.onOutputStream) {
      api.onOutputStream((data: OutputData) => {
        const callback = this.outputCallbacks.get(data.executionId);
        if (callback) {
          callback(data);
        }
      });
    }

    if (api.onErrorStream) {
      api.onErrorStream((data: OutputData) => {
        const callback = this.outputCallbacks.get(data.executionId);
        if (callback) {
          callback(data);
        }
      });
    }

    if (api.onWarningStream) {
      api.onWarningStream((data: OutputData) => {
        const callback = this.outputCallbacks.get(data.executionId);
        if (callback) {
          callback(data);
        }
      });
    }

    if (api.onVerboseStream) {
      api.onVerboseStream((data: OutputData) => {
        const callback = this.outputCallbacks.get(data.executionId);
        if (callback) {
          callback(data);
        }
      });
    }

    if (api.onDebugStream) {
      api.onDebugStream((data: OutputData) => {
        const callback = this.outputCallbacks.get(data.executionId);
        if (callback) {
          callback(data);
        }
      });
    }

    if (api.onInformationStream) {
      api.onInformationStream((data: OutputData) => {
        const callback = this.outputCallbacks.get(data.executionId);
        if (callback) {
          callback(data);
        }
      });
    }
  }

  /**
   * Execute a PowerShell script
   * Mirrors C# CsvDataServiceNew.LoadUsersAsync pattern
   *
   * @param scriptPath Path to PowerShell script file
   * @param parameters Script parameters
   * @param options Execution options
   * @returns Promise resolving to execution result
   */
  async executeScript<T = any>(
    scriptPath: string,
    parameters: Record<string, any> = {},
    options: ExecutionOptions = {}
  ): Promise<ExecutionResult<T>> {
    const api = getElectronAPI();

    // Build script arguments from parameters (mirrors C# parameter building)
    const args = Object.entries(parameters).map(([key, value]) => {
      if (typeof value === 'boolean') {
        return value ? `-${key}` : '';
      }
      return `-${key}`;
    }).filter(Boolean);

    // Add parameter values
    Object.entries(parameters).forEach(([key, value]) => {
      if (typeof value !== 'boolean') {
        args.push(String(value));
      }
    });

    const params: ScriptExecutionParams = {
      scriptPath,
      args,
      options: {
        timeout: options.timeout || this.config.defaultCacheTTL,
        cancellationToken: options.cancellationToken || window.crypto.randomUUID(),
        streamOutput: options.streamOutput !== false,
        ...options,
      },
    };

    try {
      const result = await api.executeScript(params);

      // Validate result structure like C# does
      if (!result.success) {
        throw new Error(result.error || 'PowerShell execution failed');
      }

      return result as ExecutionResult<T>;
    } catch (error: any) {
      console.error(`PowerShell script execution failed: ${scriptPath}`, error);
      throw error;
    }
  }

  /**
   * Execute a PowerShell module function
   * Mirrors C# LogicEngineService.GetUsersAsync pattern
   *
   * @param modulePath Path to PowerShell module
   * @param functionName Function name to invoke
   * @param parameters Function parameters
   * @param options Execution options
   * @returns Promise resolving to execution result
   */
  async executeModule<T = any>(
    modulePath: string,
    functionName: string,
    parameters: Record<string, any> = {},
    options: ExecutionOptions = {}
  ): Promise<ExecutionResult<T>> {
    const api = getElectronAPI();

    const params: ModuleExecutionParams = {
      modulePath,
      functionName,
      parameters,
      options: {
        timeout: options.timeout || this.config.defaultCacheTTL,
        cancellationToken: options.cancellationToken || window.crypto.randomUUID(),
        streamOutput: options.streamOutput !== false,
        ...options,
      },
    };

    try {
      const result = await api.executeModule(params);

      // Validate result structure like C# does
      if (!result.success) {
        throw new Error(result.error || 'PowerShell module execution failed');
      }

      return result as ExecutionResult<T>;
    } catch (error: any) {
      console.error(`PowerShell module execution failed: ${modulePath}:${functionName}`, error);
      throw error;
    }
  }

  /**
   * Get cached result or execute function to fetch new data
   * Mirrors C# LogicEngineService caching pattern
   *
   * @param cacheKey Unique cache key
   * @param fetchFunction Function to execute if cache miss
   * @param ttl Optional custom TTL in milliseconds
   * @returns Promise resolving to cached or fresh data
   */
  async getCachedResult<T = any>(
    cacheKey: string,
    fetchFunction: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Check if we have a valid cached result
    const cached = this.cache.get(cacheKey);
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < cached.ttl) {
        console.log(`[PowerShellService] Cache HIT for key: ${cacheKey} (age: ${age}ms)`);
        return cached.data as T;
      } else {
        console.log(`[PowerShellService] Cache EXPIRED for key: ${cacheKey} (age: ${age}ms, ttl: ${cached.ttl}ms)`);
        this.cache.delete(cacheKey);
      }
    } else {
      console.log(`[PowerShellService] Cache MISS for key: ${cacheKey}`);
    }

    // Cache miss or expired - fetch fresh data
    const result = await fetchFunction();

    // Store in cache
    this.cache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultCacheTTL,
    });

    // Enforce max cache size (LRU eviction - remove oldest entry)
    if (this.cache.size > this.config.maxCacheSize) {
      const oldestKey = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
      this.cache.delete(oldestKey);
      console.log(`[PowerShellService] Cache size limit reached, evicted: ${oldestKey}`);
    }

    return result;
  }

  /**
   * Invalidate cache entry by key
   * @param cacheKey Cache key to invalidate
   */
  invalidateCache(cacheKey: string): void {
    const deleted = this.cache.delete(cacheKey);
    if (deleted) {
      console.log(`[PowerShellService] Cache invalidated: ${cacheKey}`);
    }
  }

  /**
   * Invalidate all cache entries matching a prefix
   * @param prefix Key prefix to match
   */
  invalidateCacheByPrefix(prefix: string): void {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        count++;
      }
    }
    console.log(`[PowerShellService] Cache invalidated ${count} entries with prefix: ${prefix}`);
  }

  /**
   * Clear all cache entries
   */
  clearCache(): void {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`[PowerShellService] Cache cleared (${size} entries removed)`);
  }

  /**
   * Register a progress callback for a specific execution
   * @param executionId Execution ID
   * @param callback Progress callback function
   * @returns Cleanup function
   */
  onProgress(executionId: string, callback: (data: ProgressData) => void): () => void {
    this.progressCallbacks.set(executionId, callback);
    return () => {
      this.progressCallbacks.delete(executionId);
    };
  }

  /**
   * Register an output callback for a specific execution
   * @param executionId Execution ID
   * @param callback Output callback function
   * @returns Cleanup function
   */
  onOutput(executionId: string, callback: (data: OutputData) => void): () => void {
    this.outputCallbacks.set(executionId, callback);
    return () => {
      this.outputCallbacks.delete(executionId);
    };
  }

  /**
   * Cancel a running PowerShell execution
   * @param cancellationToken Cancellation token
   * @returns Promise resolving to true if cancelled successfully
   */
  async cancelExecution(cancellationToken: string): Promise<boolean> {
    const api = getElectronAPI();

    try {
      const cancelled = await api.cancelExecution(cancellationToken);
      if (cancelled) {
        console.log(`[PowerShellService] Execution cancelled: ${cancellationToken}`);
        // Clean up callbacks
        this.progressCallbacks.delete(cancellationToken);
        this.outputCallbacks.delete(cancellationToken);
      }
      return cancelled;
    } catch (error: any) {
      console.error(`Failed to cancel execution: ${cancellationToken}`, error);
      return false;
    }
  }

  /**
   * Start periodic cache cleanup
   * Removes expired entries automatically
   */
  private startCacheCleanup(): void {
    this.cacheCleanupInterval = setInterval(() => {
      const now = Date.now();
      let cleaned = 0;

      for (const [key, cached] of this.cache.entries()) {
        const age = now - cached.timestamp;
        if (age >= cached.ttl) {
          this.cache.delete(key);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        console.log(`[PowerShellService] Cache cleanup: removed ${cleaned} expired entries`);
      }
    }, this.config.cacheCleanupInterval);
  }

  /**
   * Stop cache cleanup interval
   */
  stopCacheCleanup(): void {
    if (this.cacheCleanupInterval) {
      clearInterval(this.cacheCleanupInterval);
      this.cacheCleanupInterval = null;
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStatistics(): {
    size: number;
    entries: Array<{ key: string; age: number; ttl: number }>;
  } {
    const now = Date.now();
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, cached]) => ({
        key,
        age: now - cached.timestamp,
        ttl: cached.ttl,
      })),
    };
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.stopCacheCleanup();
    this.clearCache();
    this.progressCallbacks.clear();
    this.outputCallbacks.clear();
  }
}

// Export singleton instance
export const powerShellService = new PowerShellService();

// Export class for custom instances
export default PowerShellService;


