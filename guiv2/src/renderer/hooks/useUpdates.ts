/**
 * useUpdates Hook
 * React hook for application update management
 */

import { useState, useEffect, useCallback } from 'react';

export interface UpdateInfo {
  available: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseNotes?: string;
  downloadUrl?: string;
  checksumUrl?: string;
  publishedAt?: string;
  isBreaking?: boolean;
}

export interface UpdateProgress {
  phase: 'downloading' | 'verifying' | 'installing' | 'complete';
  percentage: number;
  bytesDownloaded?: number;
  totalBytes?: number;
  message?: string;
}

export interface UpdateRecord {
  from: string;
  to: string;
  timestamp: string;
  status: 'success' | 'failed' | 'rolled_back';
  error?: string;
  channel?: string;
}

export interface UseUpdatesReturn {
  // State
  updateInfo: UpdateInfo | null;
  isChecking: boolean;
  isDownloading: boolean;
  isInstalling: boolean;
  downloadProgress: UpdateProgress | null;
  error: string | null;
  updateHistory: UpdateRecord[];

  // Actions
  checkForUpdates: () => Promise<void>;
  downloadUpdate: () => Promise<void>;
  applyUpdate: (mode?: 'prompt' | 'silent') => Promise<void>;
  rollbackUpdate: () => Promise<void>;
  refreshHistory: () => Promise<void>;
  setAutoUpdate: (enabled: boolean) => Promise<void>;

  // Utilities
  hasUpdateAvailable: boolean;
  isBreakingUpdate: boolean;
}

export function useUpdates(): UseUpdatesReturn {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<UpdateProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updateHistory, setUpdateHistory] = useState<UpdateRecord[]>([]);
  const [downloadedFilePath, setDownloadedFilePath] = useState<string | null>(null);

  /**
   * Check for available updates
   */
  const checkForUpdates = useCallback(async (): Promise<void> => {
    setIsChecking(true);
    setError(null);

    try {
      const result = await window.electronAPI.updates.check();

      if (result.success && result.updateInfo) {
        setUpdateInfo(result.updateInfo);
      } else {
        setError(result.error || 'Failed to check for updates');
        setUpdateInfo(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      setUpdateInfo(null);
    } finally {
      setIsChecking(false);
    }
  }, []);

  /**
   * Download available update
   */
  const downloadUpdate = useCallback(async (): Promise<void> => {
    if (!updateInfo || !updateInfo.available) {
      setError('No update available to download');
      return;
    }

    setIsDownloading(true);
    setError(null);
    setDownloadProgress({ phase: 'downloading', percentage: 0 });

    try {
      const result = await window.electronAPI.updates.download(updateInfo);

      if (result.success && result.filePath) {
        setDownloadedFilePath(result.filePath);
        setDownloadProgress({ phase: 'complete', percentage: 100 });
      } else {
        setError(result.error || 'Failed to download update');
        setDownloadProgress(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      setDownloadProgress(null);
    } finally {
      setIsDownloading(false);
    }
  }, [updateInfo]);

  /**
   * Apply downloaded update
   */
  const applyUpdate = useCallback(async (mode: 'prompt' | 'silent' = 'prompt'): Promise<void> => {
    if (!downloadedFilePath) {
      setError('No downloaded update to apply');
      return;
    }

    setIsInstalling(true);
    setError(null);
    setDownloadProgress({ phase: 'installing', percentage: 0 });

    try {
      const result = await window.electronAPI.updates.apply(downloadedFilePath, mode);

      if (result.success) {
        setDownloadProgress({ phase: 'complete', percentage: 100 });
        // App will restart after this
      } else {
        setError(result.error || 'Failed to apply update');
        setDownloadProgress(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      setDownloadProgress(null);
    } finally {
      setIsInstalling(false);
    }
  }, [downloadedFilePath]);

  /**
   * Rollback to previous version
   */
  const rollbackUpdate = useCallback(async (): Promise<void> => {
    setIsInstalling(true);
    setError(null);

    try {
      const result = await window.electronAPI.updates.rollback();

      if (result.success) {
        // App will restart after this
      } else {
        setError(result.error || 'Failed to rollback update');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setIsInstalling(false);
    }
  }, []);

  /**
   * Refresh update history
   */
  const refreshHistory = useCallback(async (): Promise<void> => {
    try {
      const result = await window.electronAPI.updates.getHistory();

      if (result.success && result.history) {
        setUpdateHistory(result.history);
      }
    } catch (err) {
      console.error('Failed to load update history:', err);
    }
  }, []);

  /**
   * Enable/disable automatic updates
   */
  const setAutoUpdate = useCallback(async (enabled: boolean): Promise<void> => {
    try {
      const result = await window.electronAPI.updates.setAutoUpdate(enabled);

      if (!result.success) {
        setError(result.error || 'Failed to update auto-update setting');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    }
  }, []);

  /**
   * Set up event listeners for update events
   */
  useEffect(() => {
    // Load update history on mount
    refreshHistory();

    // Listen for update available events
    const unsubscribeAvailable = window.electronAPI.updates.onAvailable((info: UpdateInfo) => {
      setUpdateInfo(info);
    });

    // Listen for download progress events
    const unsubscribeProgress = window.electronAPI.updates.onDownloadProgress((progress: UpdateProgress) => {
      setDownloadProgress(progress);
    });

    // Listen for download complete events
    const unsubscribeComplete = window.electronAPI.updates.onDownloadComplete((data: any) => {
      if (data.filePath) {
        setDownloadedFilePath(data.filePath);
      }
    });

    // Listen for install started events
    const unsubscribeInstallStarted = window.electronAPI.updates.onInstallStarted(() => {
      setIsInstalling(true);
      setDownloadProgress({ phase: 'installing', percentage: 0 });
    });

    // Listen for install complete events
    const unsubscribeInstallComplete = window.electronAPI.updates.onInstallComplete(() => {
      setDownloadProgress({ phase: 'complete', percentage: 100 });
      // App will restart shortly
    });

    // Cleanup
    return () => {
      unsubscribeAvailable();
      unsubscribeProgress();
      unsubscribeComplete();
      unsubscribeInstallStarted();
      unsubscribeInstallComplete();
    };
  }, [refreshHistory]);

  return {
    // State
    updateInfo,
    isChecking,
    isDownloading,
    isInstalling,
    downloadProgress,
    error,
    updateHistory,

    // Actions
    checkForUpdates,
    downloadUpdate,
    applyUpdate,
    rollbackUpdate,
    refreshHistory,
    setAutoUpdate,

    // Utilities
    hasUpdateAvailable: updateInfo?.available ?? false,
    isBreakingUpdate: updateInfo?.isBreaking ?? false,
  };
}

export default useUpdates;
