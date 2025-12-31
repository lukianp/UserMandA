/**
 * File Watcher Service
 *
 * Monitors discovery data directories for file changes and provides
 * real-time notifications to the renderer process for automatic data reload.
 *
 * Features:
 * - Watches CSV and log files in discovery data directories
 * - Debounced change notifications (300ms)
 * - Per-profile watching with dynamic switching
 * - File statistics tracking
 * - Graceful error handling
 */

import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';

import { BrowserWindow } from 'electron';

/**
 * File change event data
 */
export interface FileChangeEvent {
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
 * Watcher statistics
 */
export interface WatcherStatistics {
  activeWatchers: number;
  watchedDirectories: string[];
  totalEvents: number;
  eventsByType: {
    added: number;
    changed: number;
    deleted: number;
  };
  lastEventTimestamp?: Date;
}

/**
 * Watcher configuration
 */
interface FileWatcherConfig {
  baseDataPath: string;
  debounceDelay: number;
  watchExtensions: string[];
}

/**
 * Active watcher tracking
 */
interface ActiveWatcher {
  profileId: string;
  rawWatcher: fsSync.FSWatcher | null;
  logsWatcher: fsSync.FSWatcher | null;
  rawPath: string;
  logsPath: string;
}

/**
 * File Watcher Service
 *
 * Monitors discovery data directories and emits change events
 */
export class FileWatcherService extends EventEmitter {
  private config: FileWatcherConfig;
  private watchers: Map<string, ActiveWatcher> = new Map();
  private mainWindow: BrowserWindow | null = null;

  // Statistics
  private statistics: WatcherStatistics = {
    activeWatchers: 0,
    watchedDirectories: [],
    totalEvents: 0,
    eventsByType: {
      added: 0,
      changed: 0,
      deleted: 0,
    },
  };

  // Debounce tracking
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private fileStates: Map<string, { size: number; mtime: number }> = new Map();

  /**
   * Create File Watcher Service
   */
  constructor(config: Partial<FileWatcherConfig> = {}) {
    super();

    this.config = {
      baseDataPath: config.baseDataPath || 'C:\\discoverydata',
      debounceDelay: config.debounceDelay || 300,
      watchExtensions: config.watchExtensions || ['.csv', '.json', '.log', '.txt'],
    };
  }

  /**
   * Set main window for IPC communication
   */
  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
  }

  /**
   * Start watching a profile's directories
   */
  async watchProfile(profileId: string): Promise<void> {
    // Stop existing watcher if any
    if (this.watchers.has(profileId)) {
      await this.stopWatching(profileId);
    }

    const rawPath = path.join(this.config.baseDataPath, profileId, 'Raw');
    const logsPath = path.join(this.config.baseDataPath, profileId, 'Logs');

    // Ensure directories exist
    await this.ensureDirectories(rawPath, logsPath);

    // Create watchers
    const watcher: ActiveWatcher = {
      profileId,
      rawWatcher: null,
      logsWatcher: null,
      rawPath,
      logsPath,
    };

    try {
      // Watch Raw directory
      watcher.rawWatcher = this.createWatcher(rawPath, profileId, 'raw');

      // Watch Logs directory
      watcher.logsWatcher = this.createWatcher(logsPath, profileId, 'logs');

      this.watchers.set(profileId, watcher);
      this.statistics.activeWatchers = this.watchers.size;
      this.updateWatchedDirectories();

      console.log(`FileWatcherService: Started watching profile "${profileId}"`);
      console.log(`  Raw: ${rawPath}`);
      console.log(`  Logs: ${logsPath}`);

    } catch (error: any) {
      console.error(`FileWatcherService: Failed to watch profile "${profileId}":`, error.message);

      // Clean up partial watchers
      if (watcher.rawWatcher) {
        watcher.rawWatcher.close();
      }
      if (watcher.logsWatcher) {
        watcher.logsWatcher.close();
      }

      throw error;
    }
  }

  /**
   * Stop watching a specific profile
   */
  async stopWatching(profileId: string): Promise<void> {
    const watcher = this.watchers.get(profileId);

    if (!watcher) {
      console.warn(`FileWatcherService: No watcher found for profile "${profileId}"`);
      return;
    }

    // Close watchers
    if (watcher.rawWatcher) {
      watcher.rawWatcher.close();
    }
    if (watcher.logsWatcher) {
      watcher.logsWatcher.close();
    }

    // Clear debounce timers for this profile
    const timerKeys = Array.from(this.debounceTimers.keys()).filter(key =>
      key.startsWith(`${profileId}:`)
    );

    timerKeys.forEach(key => {
      const timer = this.debounceTimers.get(key);
      if (timer) {
        clearTimeout(timer);
        this.debounceTimers.delete(key);
      }
    });

    // Clear file states for this profile
    const stateKeys = Array.from(this.fileStates.keys()).filter(key =>
      key.startsWith(`${profileId}:`)
    );

    stateKeys.forEach(key => {
      this.fileStates.delete(key);
    });

    this.watchers.delete(profileId);
    this.statistics.activeWatchers = this.watchers.size;
    this.updateWatchedDirectories();

    console.log(`FileWatcherService: Stopped watching profile "${profileId}"`);
  }

  /**
   * Stop all watchers
   */
  async stopAll(): Promise<void> {
    const profileIds = Array.from(this.watchers.keys());

    for (const profileId of profileIds) {
      await this.stopWatching(profileId);
    }

    console.log('FileWatcherService: Stopped all watchers');
  }

  /**
   * Get list of currently watched files
   */
  getWatchedFiles(): string[] {
    const files: string[] = [];

    for (const watcher of this.watchers.values()) {
      try {
        // List files in Raw directory
        const rawFiles = fsSync.readdirSync(watcher.rawPath)
          .filter(f => this.shouldWatch(f))
          .map(f => path.join(watcher.rawPath, f));

        // List files in Logs directory
        const logFiles = fsSync.readdirSync(watcher.logsPath)
          .filter(f => this.shouldWatch(f))
          .map(f => path.join(watcher.logsPath, f));

        files.push(...rawFiles, ...logFiles);
      } catch (error) {
        // Directory might not exist or be inaccessible
        console.warn(`FileWatcherService: Cannot list files for profile "${watcher.profileId}"`);
      }
    }

    return files;
  }

  /**
   * Get watcher statistics
   */
  getStatistics(): WatcherStatistics {
    return { ...this.statistics };
  }

  /**
   * Create a file system watcher for a directory
   */
  private createWatcher(
    dirPath: string,
    profileId: string,
    directory: 'raw' | 'logs'
  ): fsSync.FSWatcher {
    const watcher = fsSync.watch(dirPath, {
      persistent: true,
      recursive: false,
    }, (eventType, filename) => {
      if (!filename) return;

      // Only watch specific extensions
      if (!this.shouldWatch(filename)) return;

      const filePath = path.join(dirPath, filename);
      const key = `${profileId}:${directory}:${filename}`;

      // Debounce the event
      this.debounceEvent(key, () => {
        this.handleFileChange(eventType, filePath, profileId, directory, filename);
      });
    });

    watcher.on('error', (error) => {
      console.error(`FileWatcherService: Watcher error for ${dirPath}:`, error);
      this.emit('error', { profileId, directory, error });
    });

    return watcher;
  }

  /**
   * Handle file change event
   */
  private async handleFileChange(
    eventType: string,
    filePath: string,
    profileId: string,
    directory: 'raw' | 'logs',
    fileName: string
  ): Promise<void> {
    const stateKey = `${profileId}:${directory}:${fileName}`;
    let changeType: 'added' | 'changed' | 'deleted';

    try {
      // Check if file exists
      const stats = await fs.stat(filePath);
      const currentState = {
        size: stats.size,
        mtime: stats.mtimeMs,
      };

      const previousState = this.fileStates.get(stateKey);

      if (!previousState) {
        // New file
        changeType = 'added';
        this.statistics.eventsByType.added++;
      } else if (
        previousState.size !== currentState.size ||
        previousState.mtime !== currentState.mtime
      ) {
        // File modified
        changeType = 'changed';
        this.statistics.eventsByType.changed++;
      } else {
        // No real change (spurious event)
        return;
      }

      this.fileStates.set(stateKey, currentState);

      const event: FileChangeEvent = {
        type: changeType,
        filePath,
        fileName,
        directory,
        profileId,
        timestamp: new Date(),
        fileSize: stats.size,
        extension: path.extname(fileName),
      };

      this.emitChangeEvent(event);

    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // File deleted
        changeType = 'deleted';
        this.statistics.eventsByType.deleted++;
        this.fileStates.delete(stateKey);

        const event: FileChangeEvent = {
          type: 'deleted',
          filePath,
          fileName,
          directory,
          profileId,
          timestamp: new Date(),
        };

        this.emitChangeEvent(event);
      } else {
        console.error(`FileWatcherService: Error handling file change:`, error);
      }
    }
  }

  /**
   * Emit file change event to renderer
   */
  private emitChangeEvent(event: FileChangeEvent): void {
    this.statistics.totalEvents++;
    this.statistics.lastEventTimestamp = event.timestamp;

    // Emit to EventEmitter listeners
    this.emit('fileChanged', event);

    // Send to renderer process via IPC
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('file:changed', event);
    }

    console.log(`FileWatcherService: ${event.type.toUpperCase()} - ${event.fileName} (${event.directory})`);
  }

  /**
   * Debounce file change events
   */
  private debounceEvent(key: string, callback: () => void): void {
    // Clear existing timer
    const existing = this.debounceTimers.get(key);
    if (existing) {
      clearTimeout(existing);
    }

    // Set new timer
    const timer = setTimeout(() => {
      callback();
      this.debounceTimers.delete(key);
    }, this.config.debounceDelay);

    this.debounceTimers.set(key, timer);
  }

  /**
   * Check if file should be watched based on extension
   */
  private shouldWatch(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return this.config.watchExtensions.includes(ext);
  }

  /**
   * Ensure directories exist, create if needed
   */
  private async ensureDirectories(rawPath: string, logsPath: string): Promise<void> {
    try {
      await fs.mkdir(rawPath, { recursive: true });
      await fs.mkdir(logsPath, { recursive: true });
    } catch (error: any) {
      console.error('FileWatcherService: Failed to create directories:', error.message);
      throw error;
    }
  }

  /**
   * Update watched directories list in statistics
   */
  private updateWatchedDirectories(): void {
    const dirs: string[] = [];

    for (const watcher of this.watchers.values()) {
      dirs.push(watcher.rawPath, watcher.logsPath);
    }

    this.statistics.watchedDirectories = dirs;
  }
}

/**
 * Singleton instance
 */
let instance: FileWatcherService | null = null;

/**
 * Get or create FileWatcherService instance
 */
export function getFileWatcherService(config?: Partial<FileWatcherConfig>): FileWatcherService {
  if (!instance) {
    instance = new FileWatcherService(config);
  }
  return instance;
}


