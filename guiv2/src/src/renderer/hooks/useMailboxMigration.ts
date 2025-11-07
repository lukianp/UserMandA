import { useCallback, useEffect, useRef, useState } from "react";
import { MigrationProgress } from '../types/models/migration';

declare global {
  interface Window {
    electronAPI: any;
  }
}

/**
 * Mailbox migration hook with full progress tracking and error handling
 */
export function useMailboxMigration(profileId: string) {
  // State management
  const [runId, setRunId] = useState<string | null>(null);
  const [progress, setProgress] = useState<MigrationProgress>({
    waveId: '',
    percentage: 0,
    message: 'Ready',
    currentItem: '',
    itemsProcessed: 0,
    totalItems: 0,
    itemsSucceeded: 0,
    itemsFailed: 0,
    itemsSkipped: 0,
    estimatedTimeRemaining: null,
    transferRateMBps: 0,
    startTime: new Date(),
    lastUpdateTime: new Date(),
  });
  const [rows, setRows] = useState<any[]>([]);
  const [isPlanning, setIsPlanning] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Refs for buffering and cleanup
  const buffer = useRef<any[]>([]);
  const progressCallbacks = useRef<Array<(progress: MigrationProgress) => void>>([]);
  const completionCallbacks = useRef<Array<(success: boolean, error?: string) => void>>([]);

  // Buffer flush interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (buffer.current.length > 0) {
        setRows(prev => prev.concat(buffer.current));
        buffer.current = [];
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Migration event listeners
  useEffect(() => {
    if (!runId) return;

    const onProgress = (event: any, data: any) => {
      if (data.runId !== runId) return;

      const updatedProgress: MigrationProgress = {
        waveId: runId,
        percentage: data.pct || data.percentage || 0,
        message: data.message || `Processing ${data.currentItem || 'items'}`,
        currentItem: data.currentItem || data.item || '',
        itemsProcessed: data.itemsProcessed || data.processed || 0,
        totalItems: data.totalItems || data.total || 0,
        itemsSucceeded: data.itemsSucceeded || data.succeeded || 0,
        itemsFailed: data.itemsFailed || data.failed || 0,
        itemsSkipped: data.itemsSkipped || data.skipped || 0,
        estimatedTimeRemaining: data.estimatedTimeRemaining || data.eta || null,
        transferRateMBps: data.transferRateMBps || data.rate || 0,
        startTime: data.startTime ? new Date(data.startTime) : progress.startTime,
        lastUpdateTime: new Date(),
      };

      setProgress(updatedProgress);

      // Notify progress callbacks
      progressCallbacks.current.forEach(callback => callback(updatedProgress));

      // Handle row data if present
      if (data.row) {
        buffer.current.push(data.row);
        if (buffer.current.length >= 200) {
          setRows(prev => prev.concat(buffer.current));
          buffer.current = [];
        }
      }
    };

    const onResult = (event: any, data: any) => {
      if (data.runId !== runId) return;

      setIsExecuting(false);
      setIsCompleted(true);

      // Flush any remaining buffered rows
      if (buffer.current.length > 0) {
        setRows(prev => prev.concat(buffer.current));
        buffer.current = [];
      }

      // Notify completion callbacks
      const success = !data.error && !error;
      completionCallbacks.current.forEach(callback => callback(success, data.error || error));

      if (data.error) {
        setError(data.error);
      }
    };

    const onError = (event: any, errorData: any) => {
      if (errorData.runId !== runId) return;

      setIsExecuting(false);
      setError(errorData.message || 'Migration failed');
      completionCallbacks.current.forEach(callback => callback(false, errorData.message || 'Migration failed'));
    };

    // Register event listeners
    window.electronAPI.onMigrationProgress(onProgress);
    window.electronAPI.onMigrationResult(onResult);
    window.electronAPI.onMigrationError?.(onError);

    return () => {
      // Cleanup listeners
      window.electronAPI.offMigrationProgress?.(onProgress);
      window.electronAPI.offMigrationResult?.(onResult);
      window.electronAPI.offMigrationError?.(onError);
    };
  }, [runId, error, progress.startTime]);

  /**
   * Plan mailbox migration
   */
  const plan = useCallback(async (args: {
    mailboxes?: string[];
    sourceServer?: string;
    targetServer?: string;
    batchSize?: number;
    includeDeletedItems?: boolean;
    includeArchive?: boolean;
    migrationType?: 'cutover' | 'staged' | 'hybrid';
    targetDeliveryDomain?: string;
    badItemLimit?: number;
    largeItemLimit?: number;
  } = {}) => {
    setError(null);
    setIsPlanning(true);

    try {
      const { runId: newRunId } = await window.electronAPI.planMigration({
        provider: "Mailbox",
        profileId,
        args: {
          mailboxes: args.mailboxes || [],
          sourceServer: args.sourceServer,
          targetServer: args.targetServer,
          batchSize: args.batchSize || 100,
          includeDeletedItems: args.includeDeletedItems || false,
          includeArchive: args.includeArchive || false,
          migrationType: args.migrationType || 'cutover',
          targetDeliveryDomain: args.targetDeliveryDomain,
          badItemLimit: args.badItemLimit || 10,
          largeItemLimit: args.largeItemLimit || 50,
          ...args
        }
      });

      setRunId(newRunId);

      return { success: true, runId: newRunId };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to plan mailbox migration';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsPlanning(false);
    }
  }, [profileId]);

  /**
   * Execute mailbox migration
   */
  const execute = useCallback(async (args: {
    maxConcurrentMigrations?: number;
    maxConcurrentIncrementalSyncs?: number;
    skipSteps?: string[];
    completeAfter?: Date;
    incrementalSyncInterval?: number;
  } = {}) => {
    if (!runId) {
      const errorMessage = 'Cannot execute migration without planning first';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    setError(null);
    setIsExecuting(true);
    setIsCompleted(false);

    try {
      const { runId: executionRunId } = await window.electronAPI.executeMigration({
        provider: "Mailbox",
        profileId,
        runId,
        args: {
          maxConcurrentMigrations: args.maxConcurrentMigrations || 10,
          maxConcurrentIncrementalSyncs: args.maxConcurrentIncrementalSyncs || 5,
          skipSteps: args.skipSteps || [],
          completeAfter: args.completeAfter,
          incrementalSyncInterval: args.incrementalSyncInterval || 1440, // minutes
          ...args
        }
      });

      setRunId(executionRunId);

      return { success: true, runId: executionRunId };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to execute mailbox migration';
      setError(errorMessage);
      setIsExecuting(false);
      return { success: false, error: errorMessage };
    }
  }, [runId, profileId]);

  /**
   * Cancel migration
   */
  const cancel = useCallback(async (): Promise<boolean> => {
    if (!runId) return false;

    try {
      const result = await window.electronAPI.cancelMigration({ runId });
      if (result.success) {
        setIsExecuting(false);
        setError('Migration cancelled by user');
      }
      return result.success;
    } catch (err: any) {
      console.error('Failed to cancel migration:', err);
      return false;
    }
  }, [runId]);

  /**
   * Pause migration
   */
  const pause = useCallback(async (): Promise<boolean> => {
    if (!runId) return false;

    try {
      const result = await window.electronAPI.pauseMigration({ runId });
      return result.success;
    } catch (err: any) {
      console.error('Failed to pause migration:', err);
      return false;
    }
  }, [runId]);

  /**
   * Resume migration
   */
  const resume = useCallback(async (): Promise<boolean> => {
    if (!runId) return false;

    try {
      const result = await window.electronAPI.resumeMigration({ runId });
      if (result.success) {
        setIsExecuting(true);
      }
      return result.success;
    } catch (err: any) {
      console.error('Failed to resume migration:', err);
      return false;
    }
  }, [runId]);

  /**
   * Get migration statistics
   */
  const getStatistics = useCallback(async () => {
    if (!runId) return null;

    try {
      const stats = await window.electronAPI.getMigrationStatistics({ runId });
      return stats;
    } catch (err: any) {
      console.error('Failed to get migration statistics:', err);
      return null;
    }
  }, [runId]);

  /**
   * Register progress callback
   */
  const onProgress = useCallback((callback: (progress: MigrationProgress) => void) => {
    progressCallbacks.current.push(callback);

    // Return cleanup function
    return () => {
      const index = progressCallbacks.current.indexOf(callback);
      if (index > -1) {
        progressCallbacks.current.splice(index, 1);
      }
    };
  }, []);

  /**
   * Register completion callback
   */
  const onComplete = useCallback((callback: (success: boolean, error?: string) => void) => {
    completionCallbacks.current.push(callback);

    // Return cleanup function
    return () => {
      const index = completionCallbacks.current.indexOf(callback);
      if (index > -1) {
        completionCallbacks.current.splice(index, 1);
      }
    };
  }, []);

  /**
   * Reset hook state
   */
  const reset = useCallback(() => {
    setRunId(null);
    setProgress({
      waveId: '',
      percentage: 0,
      message: 'Ready',
      currentItem: '',
      itemsProcessed: 0,
      totalItems: 0,
      itemsSucceeded: 0,
      itemsFailed: 0,
      itemsSkipped: 0,
      estimatedTimeRemaining: null,
      transferRateMBps: 0,
      startTime: new Date(),
      lastUpdateTime: new Date(),
    });
    setRows([]);
    setIsPlanning(false);
    setIsExecuting(false);
    setError(null);
    setIsCompleted(false);
    buffer.current = [];
  }, []);

  return {
    // State
    runId,
    progress,
    rows,
    isPlanning,
    isExecuting,
    error,
    isCompleted,

    // Operations
    plan,
    execute,
    cancel,
    pause,
    resume,

    // Utilities
    getStatistics,
    reset,

    // Callbacks
    onProgress,
    onComplete,
  };
}
