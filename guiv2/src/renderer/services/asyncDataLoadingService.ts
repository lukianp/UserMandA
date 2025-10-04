/**
 * Async Data Loading Service
 * Queue-based background data loading with priority, caching, and retry logic
 */

import { EventEmitter } from 'events';

/**
 * Load priority levels
 */
export enum LoadPriority {
  HIGH = 0,
  NORMAL = 1,
  LOW = 2,
}

/**
 * Load status
 */
export enum LoadStatus {
  PENDING = 'pending',
  LOADING = 'loading',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * Data load task
 */
export interface DataLoadTask<T = any> {
  /** Unique task ID */
  id: string;
  /** Load function that returns data */
  loader: () => Promise<T>;
  /** Task priority */
  priority: LoadPriority;
  /** Cache key (if cacheable) */
  cacheKey?: string;
  /** Cache TTL in milliseconds */
  cacheTTL?: number;
  /** Enable retry on failure */
  retry?: boolean;
  /** Maximum retry attempts */
  maxRetries?: number;
  /** Retry backoff delay in ms */
  retryDelay?: number;
  /** Task metadata */
  metadata?: any;
}

/**
 * Load task with status
 */
interface TaskWithStatus<T = any> extends DataLoadTask<T> {
  status: LoadStatus;
  result?: T;
  error?: Error;
  progress?: number;
  startTime?: number;
  endTime?: number;
  retries: number;
}

/**
 * Cached data entry
 */
interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Load progress event
 */
export interface LoadProgress {
  taskId: string;
  status: LoadStatus;
  progress?: number;
  result?: any;
  error?: Error;
}

/**
 * Async Data Loading Service
 */
export class AsyncDataLoadingService extends EventEmitter {
  private static instance: AsyncDataLoadingService;

  private taskQueue: TaskWithStatus[];
  private activeTasks: Map<string, TaskWithStatus>;
  private cache: Map<string, CacheEntry>;
  private maxWorkers: number;
  private activeWorkers: number;
  private paused: boolean;

  private constructor(maxWorkers = 3) {
    super();
    this.taskQueue = [];
    this.activeTasks = new Map();
    this.cache = new Map();
    this.maxWorkers = maxWorkers;
    this.activeWorkers = 0;
    this.paused = false;

    // Start cache cleanup interval (every 5 minutes)
    setInterval(() => this.cleanupExpiredCache(), 300000);
  }

  /**
   * Get singleton instance
   */
  static getInstance(maxWorkers?: number): AsyncDataLoadingService {
    if (!AsyncDataLoadingService.instance) {
      AsyncDataLoadingService.instance = new AsyncDataLoadingService(maxWorkers);
    }
    return AsyncDataLoadingService.instance;
  }

  /**
   * Queue a data load task
   * @param task Data load task
   * @returns Promise that resolves when load completes
   */
  async load<T = any>(task: Omit<DataLoadTask<T>, 'id'>): Promise<T> {
    const taskId = this.generateTaskId();

    // Check cache first
    if (task.cacheKey) {
      const cached = this.getFromCache<T>(task.cacheKey);
      if (cached !== null) {
        console.log(`[AsyncDataLoading] Cache hit for ${task.cacheKey}`);
        return cached;
      }
    }

    const taskWithStatus: TaskWithStatus<T> = {
      ...task,
      id: taskId,
      status: LoadStatus.PENDING,
      retries: 0,
    };

    return new Promise<T>((resolve, reject) => {
      // Create wrapper for task resolution
      const wrappedTask = {
        ...taskWithStatus,
        resolve,
        reject,
      };

      // Add to queue
      this.taskQueue.push(wrappedTask as any);

      // Sort queue by priority
      this.sortQueue();

      // Emit queued event
      this.emitProgress(taskId, LoadStatus.PENDING);

      // Process queue
      this.processQueue();
    });
  }

  /**
   * Load with progress tracking
   * @param task Data load task with progress callback
   * @param onProgress Progress callback
   * @returns Promise that resolves when load completes
   */
  async loadWithProgress<T = any>(
    task: Omit<DataLoadTask<T>, 'id'>,
    onProgress: (progress: number) => void
  ): Promise<T> {
    const taskId = this.generateTaskId();

    // Subscribe to progress events
    const progressHandler = (event: LoadProgress) => {
      if (event.taskId === taskId && event.progress !== undefined) {
        onProgress(event.progress);
      }
    };

    this.on('progress', progressHandler);

    try {
      const result = await this.load(task);
      this.off('progress', progressHandler);
      return result;
    } catch (error) {
      this.off('progress', progressHandler);
      throw error;
    }
  }

  /**
   * Load multiple tasks in parallel
   * @param tasks Array of data load tasks
   * @returns Promise that resolves when all loads complete
   */
  async loadBatch<T = any>(tasks: Array<Omit<DataLoadTask<T>, 'id'>>): Promise<T[]> {
    const promises = tasks.map((task) => this.load(task));
    return Promise.all(promises);
  }

  /**
   * Cancel a pending or active load
   * @param taskId Task ID to cancel
   * @returns True if cancelled, false if not found
   */
  cancelLoad(taskId: string): boolean {
    // Check active tasks
    const activeTask = this.activeTasks.get(taskId);
    if (activeTask) {
      activeTask.status = LoadStatus.CANCELLED;
      this.activeTasks.delete(taskId);
      this.emitProgress(taskId, LoadStatus.CANCELLED);
      this.activeWorkers--;
      this.processQueue();
      return true;
    }

    // Check queued tasks
    const queueIndex = this.taskQueue.findIndex((t) => t.id === taskId);
    if (queueIndex !== -1) {
      const task = this.taskQueue[queueIndex];
      task.status = LoadStatus.CANCELLED;
      this.taskQueue.splice(queueIndex, 1);
      this.emitProgress(taskId, LoadStatus.CANCELLED);
      return true;
    }

    return false;
  }

  /**
   * Cancel all pending loads
   * @returns Number of cancelled tasks
   */
  cancelAllPending(): number {
    const count = this.taskQueue.length;

    for (const task of this.taskQueue) {
      task.status = LoadStatus.CANCELLED;
      this.emitProgress(task.id, LoadStatus.CANCELLED);
    }

    this.taskQueue = [];
    return count;
  }

  /**
   * Get task status
   * @param taskId Task ID
   * @returns Task status or null if not found
   */
  getTaskStatus(taskId: string): LoadStatus | null {
    const activeTask = this.activeTasks.get(taskId);
    if (activeTask) {
      return activeTask.status;
    }

    const queuedTask = this.taskQueue.find((t) => t.id === taskId);
    if (queuedTask) {
      return queuedTask.status;
    }

    return null;
  }

  /**
   * Get queue statistics
   */
  getStatistics() {
    return {
      queueLength: this.taskQueue.length,
      activeTasks: this.activeTasks.size,
      activeWorkers: this.activeWorkers,
      maxWorkers: this.maxWorkers,
      cacheSize: this.cache.size,
      paused: this.paused,
    };
  }

  /**
   * Pause queue processing
   */
  pause(): void {
    this.paused = true;
    this.emit('paused');
  }

  /**
   * Resume queue processing
   */
  resume(): void {
    this.paused = false;
    this.emit('resumed');
    this.processQueue();
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.emit('cache:cleared');
  }

  /**
   * Set max workers
   */
  setMaxWorkers(max: number): void {
    this.maxWorkers = Math.max(1, max);
    this.processQueue();
  }

  /**
   * Process the task queue
   */
  private async processQueue(): Promise<void> {
    if (this.paused) {
      return;
    }

    while (this.activeWorkers < this.maxWorkers && this.taskQueue.length > 0) {
      const task = this.taskQueue.shift();
      if (!task) {
        break;
      }

      this.activeWorkers++;
      this.activeTasks.set(task.id, task);
      this.executeTask(task);
    }
  }

  /**
   * Execute a task
   */
  private async executeTask<T = any>(task: TaskWithStatus<T> & { resolve?: any; reject?: any }): Promise<void> {
    task.status = LoadStatus.LOADING;
    task.startTime = Date.now();

    this.emitProgress(task.id, LoadStatus.LOADING, 0);

    try {
      // Execute loader
      const result = await task.loader();

      // Cache result if requested
      if (task.cacheKey && task.cacheTTL) {
        this.addToCache(task.cacheKey, result, task.cacheTTL);
      }

      task.status = LoadStatus.COMPLETED;
      task.result = result;
      task.endTime = Date.now();

      this.emitProgress(task.id, LoadStatus.COMPLETED, 100, result);

      if (task.resolve) {
        task.resolve(result);
      }
    } catch (error: any) {
      // Handle retry
      if (task.retry && task.retries < (task.maxRetries || 3)) {
        task.retries++;
        const delay = (task.retryDelay || 1000) * Math.pow(2, task.retries - 1);

        console.log(`[AsyncDataLoading] Retrying task ${task.id}, attempt ${task.retries}/${task.maxRetries || 3} after ${delay}ms`);

        // Wait and retry
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Re-queue task
        task.status = LoadStatus.PENDING;
        this.taskQueue.unshift(task);
        this.sortQueue();
      } else {
        // Failed
        task.status = LoadStatus.FAILED;
        task.error = error;
        task.endTime = Date.now();

        this.emitProgress(task.id, LoadStatus.FAILED, 0, undefined, error);

        if (task.reject) {
          task.reject(error);
        }
      }
    } finally {
      this.activeTasks.delete(task.id);
      this.activeWorkers--;
      this.processQueue();
    }
  }

  /**
   * Sort queue by priority
   */
  private sortQueue(): void {
    this.taskQueue.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Generate unique task ID
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Emit progress event
   */
  private emitProgress(
    taskId: string,
    status: LoadStatus,
    progress?: number,
    result?: any,
    error?: Error
  ): void {
    const event: LoadProgress = {
      taskId,
      status,
      progress,
      result,
      error,
    };

    this.emit('progress', event);
    this.emit(`task:${taskId}`, event);
  }

  /**
   * Add data to cache
   */
  private addToCache<T = any>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Get data from cache
   */
  private getFromCache<T = any>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupExpiredCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }

    if (keysToDelete.length > 0) {
      console.log(`[AsyncDataLoading] Cleaned up ${keysToDelete.length} expired cache entries`);
    }
  }
}

export default AsyncDataLoadingService.getInstance();
