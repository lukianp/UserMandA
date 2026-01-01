/**
 * File Watcher Service (Renderer-side)
 *
 * Mirrors C# CacheAwareFileWatcherService pattern with:
 * - Directory watching for data file changes
 * - Cache invalidation on file changes
 * - Event-driven data refresh notifications
 * - Profile-based watching
 *
 * This service acts as a client-side wrapper around the Electron file watcher.
 */

/**
 * File change event data
 */
interface FileChangeEvent {
  type: 'added' | 'changed' | 'deleted';
  filePath: string;
  fileName: string;
  directory: 'raw' | 'logs';
  profileId: string;
  timestamp: Date;
  fileSize?: number;
  extension?: string;
}

/**
 * File Watcher Service
 * Mirrors C# CacheAwareFileWatcherService pattern from GUI/Services
 */
export class FileWatcherService {
  private watchers: Map<string, () => void> = new Map();
  private changeCallbacks: Map<string, (event: FileChangeEvent) => void> = new Map();
  private dataRefreshCallbacks: Set<(dataType: string) => void> = new Set();
  private profileWatchers: Map<string, () => void> = new Map();

  constructor() {
    // No global event listeners needed - using direct fs.watchDirectory
  }

  /**
   * Trigger data refresh notifications based on file changes
   * Mirrors C# DataRefreshRequired event pattern
   */
  private triggerDataRefresh(event: FileChangeEvent): void {
    // Determine data type from file extension/name
    let dataType: string | null = null;

    const fileName = event.fileName.toLowerCase();

    if (fileName.includes('user')) {
      dataType = 'users';
    } else if (fileName.includes('group')) {
      dataType = 'groups';
    } else if (fileName.includes('computer') || fileName.includes('device')) {
      dataType = 'devices';
    } else if (fileName.includes('license')) {
      dataType = 'licenses';
    } else if (fileName.includes('application')) {
      dataType = 'applications';
    } else if (fileName.includes('migration')) {
      dataType = 'migration';
    } else if (fileName.includes('network')) {
      dataType = 'network';
    } else if (fileName.includes('security')) {
      dataType = 'security';
    } else if (fileName.includes('compliance')) {
      dataType = 'compliance';
    } else {
      // Generic data type
      dataType = 'general';
    }

    // Notify all data refresh listeners
    if (dataType) {
      this.dataRefreshCallbacks.forEach((callback) => {
        callback(dataType);
      });
    }
  }

  /**
   * Watch a directory for file changes using window.electron.fs.watchDirectory
   * Mirrors C# CacheAwareFileWatcherService.WatchDirectory pattern
   *
   * @param path Directory path to watch
   * @param onChange Callback function for file changes
   * @returns Cleanup function to stop watching
   */
  async watchDirectory(path: string, onChange: (filePath: string) => void): Promise<() => void> {
    const watcherId = crypto.randomUUID();

    try {
      // Use window.electron.fs.watchDirectory for direct file watching
      const unwatch = window.electron.fs.watchDirectory(path, '*.csv', (event) => {
        // Event includes the file path that changed
        onChange(event);
      });

      this.watchers.set(watcherId, unwatch);

      // Return cleanup function
      return () => {
        const watcher = this.watchers.get(watcherId);
        if (watcher) {
          watcher();
          this.watchers.delete(watcherId);
        }
      };
    } catch (error: any) {
      console.error(`Failed to start watching directory: ${path}`, error);
      throw error;
    }
  }

  /**
   * Watch a specific profile's data directories using fs.watchDirectory
   * @param profileId Profile ID to watch
   * @returns Cleanup function
   */
  async watchProfile(profileId: string): Promise<() => void> {
    try {
      // Get the raw data path for the profile
      const rawDataPath = await window.electron.fs.getRawDataPath(profileId);

      // Start watching the raw directory for CSV files
      const unwatch = window.electron.fs.watchDirectory(rawDataPath, '*.csv', (changedPath: string) => {
        // Create file change event
        const event: FileChangeEvent = {
          type: 'changed', // Assume changed since we don't get specific type from fs API
          filePath: changedPath,
          fileName: changedPath.split(/[/\\]/).pop() || '',
          directory: 'raw',
          profileId: profileId,
          timestamp: new Date(),
          extension: changedPath.split('.').pop(),
        };

        // Notify all registered callbacks
        this.changeCallbacks.forEach((callback) => {
          callback(event);
        });

        // Trigger data refresh based on file type
        this.triggerDataRefresh(event);
      });

      // Store the watcher cleanup function
      this.profileWatchers.set(profileId, unwatch);

      return () => {
        const watcher = this.profileWatchers.get(profileId);
        if (watcher) {
          watcher();
          this.profileWatchers.delete(profileId);
        }
      };
    } catch (error: any) {
      console.error(`Failed to start watching profile: ${profileId}`, error);
      throw error;
    }
  }

  /**
   * Stop all file watchers
   */
  async stopAllWatchers(): Promise<void> {
    try {
      await window.electronAPI.stopAllFileWatchers();
      this.changeCallbacks.clear();
      console.log('[FileWatcherService] All watchers stopped');
    } catch (error: any) {
      console.error('Failed to stop all watchers:', error);
      throw error;
    }
  }

  /**
   * Register a callback for data refresh events
   * Mirrors C# DataRefreshRequired event
   *
   * @param callback Function to call when data needs refresh
   * @returns Cleanup function
   */
  onDataRefresh(callback: (dataType: string) => void): () => void {
    this.dataRefreshCallbacks.add(callback);

    return () => {
      this.dataRefreshCallbacks.delete(callback);
    };
  }

  /**
   * Register a callback for file change events
   * @param callback Function to call when files change
   * @returns Cleanup function
   */
  onFileChange(callback: (event: FileChangeEvent) => void): () => void {
    const callbackId = crypto.randomUUID();
    this.changeCallbacks.set(callbackId, callback);

    return () => {
      this.changeCallbacks.delete(callbackId);
    };
  }

  /**
   * Get list of currently watched files
   */
  async getWatchedFiles(): Promise<string[]> {
    try {
      return await window.electronAPI.getWatchedFiles();
    } catch (error: any) {
      console.error('Failed to get watched files:', error);
      return [];
    }
  }

  /**
   * Get file watcher statistics
   */
  async getStatistics(): Promise<{
    activeWatchers: number;
    watchedDirectories: string[];
    totalEvents: number;
    eventsByType: {
      added: number;
      changed: number;
      deleted: number;
    };
    lastEventTimestamp?: Date;
  } | null> {
    try {
      const stats = await window.electronAPI.getFileWatcherStatistics();
      return {
        ...stats,
        lastEventTimestamp: stats.lastEventTimestamp ? new Date(stats.lastEventTimestamp) : undefined,
      };
    } catch (error: any) {
      console.error('Failed to get file watcher statistics:', error);
      return null;
    }
  }

  /**
   * Cleanup all resources
   */
  dispose(): void {
    // Clean up all watchers
    this.watchers.forEach((cleanup) => cleanup());
    this.watchers.clear();

    // Clean up profile watchers
    this.profileWatchers.forEach((cleanup) => cleanup());
    this.profileWatchers.clear();

    this.changeCallbacks.clear();
    this.dataRefreshCallbacks.clear();
  }
}

// Export singleton instance
export const fileWatcherService = new FileWatcherService();

// Export class for custom instances
export default FileWatcherService;


