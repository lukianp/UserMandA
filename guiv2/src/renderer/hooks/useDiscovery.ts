import { useCallback, useEffect, useRef, useState } from "react";
import { cacheService } from "../services/cacheService";
import { progressService } from "../services/progressService";
import { ProgressInfo } from "../types/common";

export interface ProgressEvent {
  runId: string;
  pct?: number;
  msg?: string;
  stage?: string;
  row?: Record<string, any>;
  currentItem?: string;
  itemsProcessed?: number;
  totalItems?: number;
  estimatedTimeRemaining?: number;
}

export interface ResultEvent {
  runId: string;
  rowsFile?: string;
  stats?: Record<string, number>;
  durationMs: number;
  cacheKey?: string;
}

export interface IpcError {
  runId?: string;
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

// Enhanced progress info for discovery operations
export interface DiscoveryProgressInfo extends ProgressInfo {
  runId: string;
  stage?: string;
  retryCount?: number;
  cacheHit?: boolean;
}

export interface DiscoveryOptions {
  enableCaching?: boolean;
  cacheTTL?: number;
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  enableProgressTracking?: boolean;
  enableCancellation?: boolean;
  incremental?: boolean;
  lastModified?: Date;
  validationSchema?: any;
}

export interface DiscoveryState {
  runId?: string;
  progress: number;
  rows: any[];
  error: string | null;
  isRunning: boolean;
  isCancelling: boolean;
  lastRun?: Date;
  cacheHit?: boolean;
  retryCount: number;
  estimatedTimeRemaining?: number;
  currentItem?: string;
  itemsProcessed: number;
  totalItems?: number;
}

/**
 * Enhanced generic discovery hook with advanced features
 */
export function useDiscovery(type: string, profileId: string, options: DiscoveryOptions = {}) {
  const {
    enableCaching = true,
    cacheTTL = 5 * 60 * 1000, // 5 minutes
    enableRetry = true,
    maxRetries = 3,
    retryDelay = 1000,
    enableProgressTracking = true,
    enableCancellation = true,
    incremental = false,
    lastModified,
    validationSchema,
  } = options;

  const [state, setState] = useState<DiscoveryState>({
    progress: 0,
    rows: [],
    error: null,
    isRunning: false,
    isCancelling: false,
    retryCount: 0,
    itemsProcessed: 0,
  });

  const buffer = useRef<any[]>([]);
  const progressTaskId = useRef<string>();
  const abortController = useRef<AbortController>();
  const retryTimeout = useRef<NodeJS.Timeout>();

  const getCacheKey = useCallback((args: Record<string, unknown>) => {
    const keyData = { type, profileId, args, incremental, lastModified };
    return `discovery:${type}:${profileId}:${JSON.stringify(keyData)}`;
  }, [type, profileId, incremental, lastModified]);

  const validateRow = useCallback((row: any): boolean => {
    if (!validationSchema) return true;
    // Basic validation - could be enhanced with a schema validator
    try {
      // Simple required fields check
      if (validationSchema.required) {
        for (const field of validationSchema.required) {
          if (!row[field]) return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  }, [validationSchema]);

  const transformRow = useCallback((row: any): any => {
    // Apply data transformations if needed
    if (validationSchema?.transform) {
      return validationSchema.transform(row);
    }
    return row;
  }, [validationSchema]);

  const start = useCallback(
    async (args: Record<string, unknown> = {}) => {
      if (!window.electronAPI) {
        setState(prev => ({ ...prev, error: "Electron API not available" }));
        return;
      }

      if (!profileId) {
        setState(prev => ({ ...prev, error: "No profile selected" }));
        return;
      }

      const cacheKey = getCacheKey(args);

      // Check cache first
      if (enableCaching) {
        const cached = cacheService.get<any[]>(cacheKey);
        if (cached) {
          setState(prev => ({
            ...prev,
            rows: cached,
            progress: 100,
            cacheHit: true,
            lastRun: new Date(),
          }));
          console.log(`[useDiscovery] Cache hit for ${type}`);
          return;
        }
      }

      // Initialize state
      setState(prev => ({
        ...prev,
        error: null,
        progress: 0,
        rows: [],
        isRunning: true,
        isCancelling: false,
        retryCount: 0,
        cacheHit: false,
        currentItem: undefined,
        itemsProcessed: 0,
        totalItems: undefined,
      }));

      buffer.current = [];
      abortController.current = new AbortController();

      // Start progress tracking
      if (enableProgressTracking) {
        progressTaskId.current = progressService.trackDiscovery(type);
      }

      const executeDiscovery = async (retryCount = 0): Promise<void> => {
        try {
          // Generate execution ID
          const executionId = `${type.toLowerCase()}-discovery-${Date.now()}`;

          // Use the correct discovery API
          const result = await (window as any).electron.executeDiscovery({
            moduleName: type,
            parameters: { ...args, profileId },
            executionOptions: {
              timeout: 300000,
              showWindow: false
            },
            executionId
          });

          setState(prev => ({ ...prev, runId: executionId }));
          console.log(`[useDiscovery] Started ${type} discovery with executionId: ${executionId}`);
        } catch (err: any) {
          if (err.name === 'AbortError') {
            console.log(`[useDiscovery] ${type} discovery was cancelled`);
            return;
          }

          console.error(`[useDiscovery] Failed to start discovery:`, err);

          // Retry logic
          if (enableRetry && retryCount < maxRetries) {
            console.log(`[useDiscovery] Retrying ${type} discovery (${retryCount + 1}/${maxRetries})...`);
            setState(prev => ({ ...prev, retryCount: retryCount + 1 }));

            retryTimeout.current = setTimeout(() => {
              executeDiscovery(retryCount + 1);
            }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
            return;
          }

          setState(prev => ({
            ...prev,
            error: err.message || "Failed to start discovery",
            isRunning: false,
          }));

          if (progressTaskId.current) {
            progressService.failTask(progressTaskId.current, err.message);
          }
        }
      };

      await executeDiscovery();
    },
    [type, profileId, enableCaching, enableRetry, maxRetries, retryDelay, enableProgressTracking, getCacheKey, incremental, lastModified]
  );

  const cancel = useCallback(async () => {
    if (!state.isRunning || state.isCancelling) return;

    setState(prev => ({ ...prev, isCancelling: true }));

    // Cancel abort controller
    abortController.current?.abort();

    // Clear retry timeout
    if (retryTimeout.current) {
      clearTimeout(retryTimeout.current);
      retryTimeout.current = undefined;
    }

    // Cancel progress task
    if (progressTaskId.current) {
      progressService.cancelTask(progressTaskId.current);
      progressTaskId.current = undefined;
    }

    // Cancel via Electron API if possible
    if (state.runId && window.electronAPI?.cancelDiscovery) {
      try {
        await window.electronAPI.cancelDiscovery(state.runId);
      } catch (err) {
        console.warn('Failed to cancel discovery via API:', err);
      }
    }

    setState(prev => ({
      ...prev,
      isRunning: false,
      isCancelling: false,
      error: "Discovery cancelled by user",
    }));
  }, [state.isRunning, state.isCancelling, state.runId]);

  const clearResults = useCallback(() => {
    setState(prev => ({
      ...prev,
      rows: [],
      error: null,
      progress: 0,
      cacheHit: false,
    }));

    if (enableCaching) {
      const cacheKey = getCacheKey({});
      cacheService.delete(cacheKey);
    }
  }, [enableCaching, getCacheKey]);

  // Listen for progress events
  useEffect(() => {
    if (!window.electronAPI || !state.runId) return;

    const onProgress = (e: ProgressEvent) => {
      if (e.runId !== state.runId) return;

      setState(prev => {
        const updates: Partial<DiscoveryState> = {};

        if (e.pct !== undefined) {
          updates.progress = e.pct;
        }

        if (e.currentItem) {
          updates.currentItem = e.currentItem;
        }

        if (e.itemsProcessed !== undefined) {
          updates.itemsProcessed = e.itemsProcessed;
        }

        if (e.totalItems !== undefined) {
          updates.totalItems = e.totalItems;
        }

        if (e.estimatedTimeRemaining !== undefined) {
          updates.estimatedTimeRemaining = e.estimatedTimeRemaining;
        }

        return { ...prev, ...updates };
      });

      if (e.msg) {
        console.log(`[useDiscovery] ${type}: ${e.msg}`);
      }

      if (progressTaskId.current) {
        progressService.updateProgress(progressTaskId.current, {
          percentage: e.pct,
          currentItem: e.currentItem,
          itemsProcessed: e.itemsProcessed,
        });
      }

      if (e.row) {
        const transformedRow = transformRow(e.row);
        if (validateRow(transformedRow)) {
          buffer.current.push(transformedRow);
          // Batch updates for performance - flush every 200 rows
          if (buffer.current.length >= 200) {
            setState(prev => ({ ...prev, rows: prev.rows.concat(buffer.current) }));
            buffer.current = [];
          }
        } else {
          console.warn(`[useDiscovery] Invalid row skipped:`, e.row);
        }
      }
    };

    const onResult = (e: ResultEvent) => {
      if (e.runId !== state.runId) return;

      // Flush remaining buffered rows
      if (buffer.current.length > 0) {
        setState(prev => ({ ...prev, rows: prev.rows.concat(buffer.current) }));
        buffer.current = [];
      }

      const finalRows = [...state.rows];
      const cacheKey = e.cacheKey || getCacheKey({});

      // Cache results
      if (enableCaching && finalRows.length > 0) {
        cacheService.set(cacheKey, finalRows, cacheTTL);
      }

      setState(prev => ({
        ...prev,
        progress: 100,
        isRunning: false,
        lastRun: new Date(),
      }));

      if (progressTaskId.current) {
        progressService.completeTask(progressTaskId.current);
        progressTaskId.current = undefined;
      }

      console.log(`[useDiscovery] ${type} completed in ${e.durationMs}ms, cached: ${!!cacheKey}`);
    };

    const onError = (e: IpcError) => {
      if (e.runId !== state.runId) return;

      setState(prev => ({
        ...prev,
        error: e.message,
        isRunning: false,
      }));

      if (progressTaskId.current) {
        progressService.failTask(progressTaskId.current, e.message);
        progressTaskId.current = undefined;
      }

      console.error(`[useDiscovery] ${type} error:`, e);
    };

    const removeProgressListener = (window as any).electron.onDiscoveryProgress?.(onProgress);
    const removeCompleteListener = (window as any).electron.onDiscoveryComplete?.(onResult);
    const removeErrorListener = (window as any).electron.onDiscoveryError?.(onError);

    // Cleanup listeners on unmount
    return () => {
      removeProgressListener?.();
      removeCompleteListener?.();
      removeErrorListener?.();
    };
  }, [state.runId, state.rows, type, enableCaching, cacheTTL, getCacheKey, transformRow, validateRow]);

  // Periodic flush of buffered rows (every 500ms)
  useEffect(() => {
    const interval = setInterval(() => {
      if (buffer.current.length > 0) {
        setState(prev => ({ ...prev, rows: prev.rows.concat(buffer.current) }));
        buffer.current = [];
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return {
    // State
    ...state,

    // Actions
    start,
    cancel: enableCancellation ? cancel : undefined,
    clearResults,

    // Computed properties
    canStart: !state.isRunning,
    canCancel: enableCancellation && state.isRunning && !state.isCancelling,
    hasResults: state.rows.length > 0,
  };
}
