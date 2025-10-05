/**
 * Cache-Aware File Watcher Service
 *
 * Enhanced file watching with content caching, smart change detection,
 * recursive directory watching, pattern matching, and performance optimization
 *
 * Features:
 * - Content caching (only notify on real content changes)
 * - Debounced change notifications (configurable delay)
 * - Recursive directory watching
 * - Glob pattern matching
 * - Batch change notifications
 * - Ignore patterns (.git, node_modules, etc.)
 * - Performance optimized with chokidar
 */

import chokidar, { FSWatcher } from 'chokidar';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';
import * as path from 'path';
import { EventEmitter } from 'events';
import { BrowserWindow } from 'electron';

/**
 * File change event
 */
export interface CachedFileChangeEvent {
  type: 'added' | 'changed' | 'deleted';
  filePath: string;
  fileName: string;
  directory: string;
  timestamp: Date;
  fileSize?: number;
  contentHash?: string;
  previousHash?: string;
}

/**
 * Watcher configuration
 */
export interface CacheAwareWatcherConfig {
  /** Debounce delay in milliseconds (default: 300) */
  debounceDelay?: number;
  /** Enable recursive watching (default: true) */
  recursive?: boolean;
  /** Glob patterns to watch (default: all) */
  patterns?: string[];
  /** Glob patterns to ignore (default: git and node_modules directories) */
  ignored?: string[];
  /** Enable content hashing for change detection (default: true) */
  enableHashing?: boolean;
  /** Batch interval for change notifications in ms (default: 1000) */
  batchInterval?: number;
  /** Maximum cached file size for hashing in bytes (default: 10MB) */
  maxCacheFileSize?: number;
}

/**
 * File cache entry
 */
interface FileCacheEntry {
  hash: string;
  size: number;
  mtime: number;
  timestamp: number;
}

/**
 * Batch change accumulator
 */
interface BatchedChanges {
  changes: CachedFileChangeEvent[];
  timer: NodeJS.Timeout | null;
}

/**
 * Cache-Aware File Watcher Service
 */
export class CacheAwareFileWatcherService extends EventEmitter {
  private config: Required<CacheAwareWatcherConfig>;
  private watchers: Map<string, FSWatcher> = new Map();
  private fileCache: Map<string, FileCacheEntry> = new Map();
  private batchedChanges: Map<string, BatchedChanges> = new Map();
  private mainWindow: BrowserWindow | null = null;

  // Statistics
  private stats = {
    totalEvents: 0,
    cachedEvents: 0,
    realChanges: 0,
    ignoredEvents: 0,
  };

  constructor(config: CacheAwareWatcherConfig = {}) {
    super();

    this.config = {
      debounceDelay: config.debounceDelay ?? 300,
      recursive: config.recursive !== false,
      patterns: config.patterns || ['**/*'],
      ignored: config.ignored || [
        '**/.git/**',
        '**/node_modules/**',
        '**/.vscode/**',
        '**/.idea/**',
        '**/dist/**',
        '**/build/**',
        '**/*.tmp',
        '**/*.swp',
        '**/*.lock',
      ],
      enableHashing: config.enableHashing !== false,
      batchInterval: config.batchInterval ?? 1000,
      maxCacheFileSize: config.maxCacheFileSize ?? 10 * 1024 * 1024, // 10MB
    };
  }

  /**
   * Set main window for IPC communication
   */
  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
  }

  /**
   * Watch a directory with caching and smart change detection
   * @param watchPath Path to watch
   * @param watchId Unique identifier for this watcher
   */
  async watch(watchPath: string, watchId: string = watchPath): Promise<void> {
    // Stop existing watcher if any
    await this.unwatch(watchId);

    console.log(`[CacheAwareWatcher] Starting watch on: ${watchPath} (ID: ${watchId})`);

    // Create chokidar watcher
    const watcher = chokidar.watch(watchPath, {
      persistent: true,
      ignored: this.config.ignored,
      ignoreInitial: false,
      depth: this.config.recursive ? undefined : 0,
      awaitWriteFinish: {
        stabilityThreshold: this.config.debounceDelay,
        pollInterval: 100,
      },
      usePolling: false, // Use native fs.watch for better performance
    });

    // Handle events
    watcher
      .on('add', (filePath) => this.handleFileEvent('added', filePath, watchId))
      .on('change', (filePath) => this.handleFileEvent('changed', filePath, watchId))
      .on('unlink', (filePath) => this.handleFileEvent('deleted', filePath, watchId))
      .on('error', (error) => {
        console.error(`[CacheAwareWatcher] Error watching ${watchPath}:`, error);
        this.emit('error', { watchId, error });
      })
      .on('ready', () => {
        console.log(`[CacheAwareWatcher] Initial scan complete for ${watchPath}`);
        this.emit('ready', { watchId, path: watchPath });
      });

    this.watchers.set(watchId, watcher);
  }

  /**
   * Stop watching a path
   * @param watchId Watcher ID
   */
  async unwatch(watchId: string): Promise<void> {
    const watcher = this.watchers.get(watchId);

    if (watcher) {
      await watcher.close();
      this.watchers.delete(watchId);

      // Clear batched changes
      const batched = this.batchedChanges.get(watchId);
      if (batched?.timer) {
        clearTimeout(batched.timer);
      }
      this.batchedChanges.delete(watchId);

      console.log(`[CacheAwareWatcher] Stopped watching: ${watchId}`);
    }
  }

  /**
   * Stop all watchers
   */
  async unwatchAll(): Promise<void> {
    const watchIds = Array.from(this.watchers.keys());

    for (const id of watchIds) {
      await this.unwatch(id);
    }

    // Clear all caches
    this.fileCache.clear();
    this.batchedChanges.clear();

    console.log('[CacheAwareWatcher] Stopped all watchers');
  }

  /**
   * Handle file event with caching
   */
  private async handleFileEvent(
    eventType: 'added' | 'changed' | 'deleted',
    filePath: string,
    watchId: string
  ): Promise<void> {
    this.stats.totalEvents++;

    // Check if file matches patterns
    if (!this.matchesPatterns(filePath)) {
      this.stats.ignoredEvents++;
      return;
    }

    try {
      if (eventType === 'deleted') {
        // File deleted
        const cached = this.fileCache.get(filePath);
        this.fileCache.delete(filePath);

        const event: CachedFileChangeEvent = {
          type: 'deleted',
          filePath,
          fileName: path.basename(filePath),
          directory: path.dirname(filePath),
          timestamp: new Date(),
          previousHash: cached?.hash,
        };

        this.stats.realChanges++;
        this.emitChange(event, watchId);
      } else {
        // File added or changed - check if content actually changed
        const hasRealChange = await this.hasContentChanged(filePath);

        if (hasRealChange || eventType === 'added') {
          const stats = await fs.stat(filePath);
          const cached = this.fileCache.get(filePath);

          const event: CachedFileChangeEvent = {
            type: eventType,
            filePath,
            fileName: path.basename(filePath),
            directory: path.dirname(filePath),
            timestamp: new Date(),
            fileSize: stats.size,
            contentHash: this.fileCache.get(filePath)?.hash,
            previousHash: cached?.hash,
          };

          this.stats.realChanges++;
          this.emitChange(event, watchId);
        } else {
          // Content hasn't changed (spurious event)
          this.stats.cachedEvents++;
        }
      }
    } catch (error: any) {
      console.error(`[CacheAwareWatcher] Error handling ${eventType} for ${filePath}:`, error);
    }
  }

  /**
   * Check if file content has actually changed using content hashing
   */
  private async hasContentChanged(filePath: string): Promise<boolean> {
    if (!this.config.enableHashing) {
      return true; // Always consider changed if hashing disabled
    }

    try {
      const stats = await fs.stat(filePath);

      // Don't hash very large files
      if (stats.size > this.config.maxCacheFileSize) {
        console.warn(`[CacheAwareWatcher] File too large for hashing: ${filePath} (${stats.size} bytes)`);
        return true;
      }

      const cached = this.fileCache.get(filePath);

      // Quick check: if size or mtime unchanged, likely no change
      if (cached && cached.size === stats.size && cached.mtime === stats.mtimeMs) {
        return false;
      }

      // Calculate content hash
      const content = await fs.readFile(filePath);
      const hash = crypto.createHash('sha256').update(content).digest('hex');

      // Compare with cached hash
      const hasChanged = !cached || cached.hash !== hash;

      // Update cache
      this.fileCache.set(filePath, {
        hash,
        size: stats.size,
        mtime: stats.mtimeMs,
        timestamp: Date.now(),
      });

      return hasChanged;
    } catch (error: any) {
      console.error(`[CacheAwareWatcher] Error checking content change for ${filePath}:`, error);
      return true; // Assume changed on error
    }
  }

  /**
   * Check if file matches watch patterns
   */
  private matchesPatterns(filePath: string): boolean {
    if (this.config.patterns.length === 0 || this.config.patterns.includes('**/*')) {
      return true;
    }

    // Simple pattern matching (can be enhanced with minimatch or micromatch)
    const fileName = path.basename(filePath);
    const ext = path.extname(filePath);

    for (const pattern of this.config.patterns) {
      if (pattern.startsWith('*.')) {
        // Extension pattern (e.g., *.csv)
        const patternExt = pattern.substring(1);
        if (ext === patternExt) {
          return true;
        }
      } else if (pattern.includes('*')) {
        // Wildcard pattern
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        if (regex.test(fileName) || regex.test(filePath)) {
          return true;
        }
      } else {
        // Exact match
        if (fileName === pattern || filePath.includes(pattern)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Emit change event with optional batching
   */
  private emitChange(event: CachedFileChangeEvent, watchId: string): void {
    if (this.config.batchInterval > 0) {
      // Batch changes
      this.addToBatch(event, watchId);
    } else {
      // Emit immediately
      this.emitSingle(event, watchId);
    }
  }

  /**
   * Add change to batch
   */
  private addToBatch(event: CachedFileChangeEvent, watchId: string): void {
    let batch = this.batchedChanges.get(watchId);

    if (!batch) {
      batch = {
        changes: [],
        timer: null,
      };
      this.batchedChanges.set(watchId, batch);
    }

    batch.changes.push(event);

    // Clear existing timer
    if (batch.timer) {
      clearTimeout(batch.timer);
    }

    // Set new timer to flush batch
    batch.timer = setTimeout(() => {
      this.flushBatch(watchId);
    }, this.config.batchInterval);
  }

  /**
   * Flush batched changes
   */
  private flushBatch(watchId: string): void {
    const batch = this.batchedChanges.get(watchId);

    if (batch && batch.changes.length > 0) {
      console.log(`[CacheAwareWatcher] Flushing ${batch.changes.length} batched changes for ${watchId}`);

      // Emit batch event
      this.emit('batch', {
        watchId,
        changes: batch.changes,
        timestamp: new Date(),
      });

      // Send to renderer
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('file:batch-changed', {
          watchId,
          changes: batch.changes,
        });
      }

      // Also emit individual events
      for (const change of batch.changes) {
        this.emitSingle(change, watchId);
      }

      batch.changes = [];
      batch.timer = null;
    }
  }

  /**
   * Emit single change event
   */
  private emitSingle(event: CachedFileChangeEvent, watchId: string): void {
    // Emit to EventEmitter listeners
    this.emit('change', { ...event, watchId });

    // Send to renderer process via IPC
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('file:changed', { ...event, watchId });
    }

    console.log(`[CacheAwareWatcher] ${event.type.toUpperCase()} - ${event.fileName} (${watchId})`);
  }

  /**
   * Get watched paths
   */
  getWatchedPaths(): string[] {
    return Array.from(this.watchers.keys());
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return {
      ...this.stats,
      activeWatchers: this.watchers.size,
      cachedFiles: this.fileCache.size,
      cacheEfficiency: this.stats.totalEvents > 0
        ? ((this.stats.cachedEvents / this.stats.totalEvents) * 100).toFixed(2) + '%'
        : '0%',
    };
  }

  /**
   * Clear file cache
   */
  clearCache(): void {
    this.fileCache.clear();
    console.log('[CacheAwareWatcher] Cleared file cache');
  }

  /**
   * Get cache entry for file
   */
  getCacheEntry(filePath: string): FileCacheEntry | undefined {
    return this.fileCache.get(filePath);
  }
}

/**
 * Singleton instance
 */
let instance: CacheAwareFileWatcherService | null = null;

/**
 * Get or create CacheAwareFileWatcherService instance
 */
export function getCacheAwareFileWatcherService(
  config?: CacheAwareWatcherConfig
): CacheAwareFileWatcherService {
  if (!instance) {
    instance = new CacheAwareFileWatcherService(config);
  }
  return instance;
}

export default getCacheAwareFileWatcherService();
