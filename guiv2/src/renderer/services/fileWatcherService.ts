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

  constructor() {
    this.setupEventListeners();
  }

  /**
   * Setup event listeners for file change events from main process
   */
  private setupEventListeners(): void {
    // Listen for file change events
    const cleanup = window.electronAPI.onFileChanged((data: any) => {
      const event: FileChangeEvent = {
        type: data.type,
        filePath: data.filePath,
        fileName: data.fileName,
        directory: data.directory,
        profileId: data.profileId,
        timestamp: new Date(data.timestamp),
        fileSize: data.fileSize,
        extension: data.extension,
      };

      // Notify all registered callbacks
      this.changeCallbacks.forEach((callback) => {
        callback(event);
      });

      // Trigger data refresh based on file type
      this.triggerDataRefresh(event);
    });

    // Store cleanup function
    this.watchers.set('global-file-listener', cleanup);
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
   * Watch a directory for file changes
   * Mirrors C# CacheAwareFileWatcherService.WatchDirectory pattern
   *
   * @param path Directory path to watch
   * @param onChange Callback function for file changes
   * @returns Cleanup function to stop watching
   */
  watchDirectory(path: string, onChange: (filePath: string) => void): () => void {
    const watcherId = crypto.randomUUID();

    // Create a wrapper callback that filters by path
    const callback = (event: FileChangeEvent) => {
      if (event.filePath.startsWith(path)) {
        onChange(event.filePath);
      }
    };

    this.changeCallbacks.set(watcherId, callback);

    // Return cleanup function
    return () => {
      this.changeCallbacks.delete(watcherId);
    };
  }

  /**
   * Watch a specific profile's data directories
   * @param profileId Profile ID to watch
   * @returns Cleanup function
   */
  async watchProfile(profileId: string): Promise<() => void> {
    try {
      const result = await window.electronAPI.startFileWatcher(profileId);

      if (!result.success) {
        throw new Error(`Failed to start file watcher for profile: ${profileId}`);
      }

      // Return cleanup function that stops watching
      return async () => {
        await window.electronAPI.stopFileWatcher(profileId);
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
    this.changeCallbacks.clear();
    this.dataRefreshCallbacks.clear();
  }
}

// Export singleton instance
export const fileWatcherService = new FileWatcherService();

// Export class for custom instances
export default FileWatcherService;
