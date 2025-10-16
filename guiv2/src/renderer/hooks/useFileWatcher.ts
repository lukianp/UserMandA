/**
 * File Watcher Hook
 *
 * Replicates /gui/ CacheAwareFileWatcherService pattern:
 * - Auto-starts file watcher when profile is selected
 * - Emits data refresh events when CSV files change
 * - Automatically cleans up on unmount
 *
 * Usage in views:
 * ```typescript
 * useFileWatcher('Users', () => {
 *   console.log('CSV files changed - reloading users');
 *   loadUsers();
 * });
 * ```
 */

import { useEffect, useRef, useState } from 'react';
import { useProfileStore } from '../store/useProfileStore';

export type DataType =
  | 'All'
  | 'Users'
  | 'Groups'
  | 'Computers'
  | 'Applications'
  | 'FileServers'
  | 'Databases'
  | 'Infrastructure';

/**
 * Hook to subscribe to file changes for a specific data type
 *
 * @param dataType - Type of data to monitor (e.g., 'Users', 'Groups', 'All')
 * @param onFileChanged - Callback when relevant files change
 * @param enabled - Whether monitoring is enabled (default: true)
 */
export function useFileWatcher(
  dataType: DataType,
  onFileChanged: () => void,
  enabled = true
): void {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const callbackRef = useRef(onFileChanged);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = onFileChanged;
  }, [onFileChanged]);

  useEffect(() => {
    if (!enabled || !selectedSourceProfile) {
      return;
    }

    console.log(`[FileWatcher] Starting file watcher for ${dataType}...`);

    // Subscribe to file change events
    const unsubscribe = window.electronAPI.onFileChanged((data: any) => {
      const changedDataType = data.dataType as string;

      // Check if this file change is relevant to our data type
      if (changedDataType === dataType || changedDataType === 'All' || dataType === 'All') {
        console.log(`[FileWatcher] File changed detected for ${dataType}: ${data.fileName}`);
        callbackRef.current();
      }
    });

    // Start file watcher for current profile
    window.electronAPI.startFileWatcher(selectedSourceProfile.id)
      .then((result: { success: boolean; error?: string }) => {
        if (result.success) {
          console.log(`[FileWatcher] Successfully started monitoring ${selectedSourceProfile.companyName}`);
        } else {
          console.warn('[FileWatcher] Failed to start file watcher:', result.error);
        }
      })
      .catch((error: unknown) => {
        console.error('[FileWatcher] Error starting file watcher:', error);
      });

    // Cleanup on unmount or profile change
    return () => {
      console.log(`[FileWatcher] Stopping file watcher for ${dataType}`);
      unsubscribe();

      // Note: Don't stop the file watcher for the profile here
      // because other views might still be using it
      // The profile store should handle stopping when profile changes
    };
  }, [selectedSourceProfile, dataType, enabled]);
}

/**
 * Hook to get file watcher statistics
 *
 * @returns File watcher statistics or null
 */
export function useFileWatcherStatistics() {
  const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const stats = await window.electronAPI.getFileWatcherStatistics();
        setStatistics(stats);
      } catch (error) {
        console.error('[FileWatcher] Failed to load statistics:', error);
      }
    };

    loadStatistics();

    // Refresh statistics every 5 seconds
    const interval = setInterval(loadStatistics, 5000);

    return () => clearInterval(interval);
  }, []);

  return statistics;
}
