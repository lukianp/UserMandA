/**
 * Background Task Queue Service
 *
 * Features:
 * - Priority-based task queuing (critical > high > normal > low)
 * - Worker pool management with configurable concurrency
 * - Task scheduling (immediate, delayed, recurring/cron)
 * - Task dependencies (run B after A completes)
 * - Automatic retry with exponential backoff
 * - Task cancellation and progress tracking
 * - Task history and statistics
 * - Integration with PowerShell service
 */

import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import PowerShellExecutionService from './powerShellService';
import { ExecutionOptions, ExecutionResult } from '../../types/shared';

/**
 * Task priority levels
 */
export type TaskPriority = 'critical' | 'high' | 'normal' | 'low';

/**
 * Task status
 */
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'retrying';

/**
 * Task type discriminator
 */
export type TaskType = 'powershell' | 'function' | 'http' | 'custom';

/**
 * Base task interface
 */
export interface BaseTask {
  id: string;
  name: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  progress: number;
  progressMessage?: string;
  retryCount: number;
  maxRetries: number;
  retryDelay: number; // milliseconds
  error?: string;
  result?: any;
  dependencies?: string[]; // Task IDs that must complete first
  tags?: string[];
  metadata?: Record<string, any>;
}

/**
 * PowerShell task
 */
export interface PowerShellTask extends BaseTask {
  type: 'powershell';
  scriptPath: string;
  args: string[];
  options: ExecutionOptions;
}

/**
 * Function task
 */
export interface FunctionTask extends BaseTask {
  type: 'function';
  fn: () => Promise<any>;
}

/**
 * HTTP request task
 */
export interface HttpTask extends BaseTask {
  type: 'http';
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
}

/**
 * Custom task
 */
export interface CustomTask extends BaseTask {
  type: 'custom';
  executor: (task: CustomTask) => Promise<any>;
}

/**
 * Union type for all task types
 */
export type Task = PowerShellTask | FunctionTask | HttpTask | CustomTask;

/**
 * Task creation options
 */
export interface TaskOptions {
  name: string;
  priority?: TaskPriority;
  maxRetries?: number;
  retryDelay?: number;
  dependencies?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
}

/**
 * Worker configuration
 */
export interface WorkerConfig {
  maxWorkers: number;
  taskTimeout: number; // milliseconds
  retryBackoffMultiplier: number;
  maxRetryDelay: number; // milliseconds
}

/**
 * Task statistics
 */
export interface TaskStatistics {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
  retrying: number;
  averageExecutionTime: number;
  successRate: number;
}

/**
 * Background Task Queue Service
 */
class BackgroundTaskQueueService extends EventEmitter {
  private tasks: Map<string, Task>;
  private queues: Map<TaskPriority, string[]>; // Priority -> Task IDs
  private workers: Set<string>; // Active worker IDs
  private config: WorkerConfig;
  private powerShellService: PowerShellExecutionService | null;
  private initialized: boolean;
  private paused: boolean;
  private processingInterval: NodeJS.Timeout | null;

  constructor(config: Partial<WorkerConfig> = {}) {
    super();

    this.config = {
      maxWorkers: config.maxWorkers || 4,
      taskTimeout: config.taskTimeout || 300000, // 5 minutes
      retryBackoffMultiplier: config.retryBackoffMultiplier || 2,
      maxRetryDelay: config.maxRetryDelay || 60000, // 1 minute
    };

    this.tasks = new Map();
    this.queues = new Map([
      ['critical', []],
      ['high', []],
      ['normal', []],
      ['low', []],
    ]);
    this.workers = new Set();
    this.powerShellService = null;
    this.initialized = false;
    this.paused = false;
    this.processingInterval = null;
  }

  /**
   * Initialize the service
   */
  async initialize(powerShellService?: PowerShellExecutionService): Promise<void> {
    if (this.initialized) {
      console.warn('BackgroundTaskQueueService already initialized');
      return;
    }

    this.powerShellService = powerShellService || null;
    this.initialized = true;

    // Start processing loop (check every 100ms)
    this.processingInterval = setInterval(() => this.processQueue(), 100);

    console.log(`BackgroundTaskQueueService initialized with ${this.config.maxWorkers} workers`);
    this.emit('initialized', { maxWorkers: this.config.maxWorkers });
  }

  /**
   * Queue a PowerShell task
   */
  queuePowerShellTask(
    scriptPath: string,
    args: string[] = [],
    options: ExecutionOptions = {},
    taskOptions: TaskOptions
  ): string {
    const task: PowerShellTask = {
      id: crypto.randomUUID(),
      name: taskOptions.name,
      type: 'powershell',
      priority: taskOptions.priority || 'normal',
      status: 'pending',
      createdAt: new Date(),
      progress: 0,
      retryCount: 0,
      maxRetries: taskOptions.maxRetries || 3,
      retryDelay: taskOptions.retryDelay || 1000,
      scriptPath,
      args,
      options,
      dependencies: taskOptions.dependencies,
      tags: taskOptions.tags,
      metadata: taskOptions.metadata,
    };

    this.addTaskToQueue(task);
    return task.id;
  }

  /**
   * Queue a function task
   */
  queueFunctionTask(fn: () => Promise<any>, taskOptions: TaskOptions): string {
    const task: FunctionTask = {
      id: crypto.randomUUID(),
      name: taskOptions.name,
      type: 'function',
      priority: taskOptions.priority || 'normal',
      status: 'pending',
      createdAt: new Date(),
      progress: 0,
      retryCount: 0,
      maxRetries: taskOptions.maxRetries || 3,
      retryDelay: taskOptions.retryDelay || 1000,
      fn,
      dependencies: taskOptions.dependencies,
      tags: taskOptions.tags,
      metadata: taskOptions.metadata,
    };

    this.addTaskToQueue(task);
    return task.id;
  }

  /**
   * Queue an HTTP task
   */
  queueHttpTask(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    taskOptions: TaskOptions,
    headers?: Record<string, string>,
    body?: any
  ): string {
    const task: HttpTask = {
      id: crypto.randomUUID(),
      name: taskOptions.name,
      type: 'http',
      priority: taskOptions.priority || 'normal',
      status: 'pending',
      createdAt: new Date(),
      progress: 0,
      retryCount: 0,
      maxRetries: taskOptions.maxRetries || 3,
      retryDelay: taskOptions.retryDelay || 1000,
      url,
      method,
      headers,
      body,
      dependencies: taskOptions.dependencies,
      tags: taskOptions.tags,
      metadata: taskOptions.metadata,
    };

    this.addTaskToQueue(task);
    return task.id;
  }

  /**
   * Queue a custom task
   */
  queueCustomTask(
    executor: (task: CustomTask) => Promise<any>,
    taskOptions: TaskOptions
  ): string {
    const task: CustomTask = {
      id: crypto.randomUUID(),
      name: taskOptions.name,
      type: 'custom',
      priority: taskOptions.priority || 'normal',
      status: 'pending',
      createdAt: new Date(),
      progress: 0,
      retryCount: 0,
      maxRetries: taskOptions.maxRetries || 3,
      retryDelay: taskOptions.retryDelay || 1000,
      executor,
      dependencies: taskOptions.dependencies,
      tags: taskOptions.tags,
      metadata: taskOptions.metadata,
    };

    this.addTaskToQueue(task);
    return task.id;
  }

  /**
   * Add task to appropriate priority queue
   */
  private addTaskToQueue(task: Task): void {
    this.tasks.set(task.id, task);
    const queue = this.queues.get(task.priority);
    if (queue) {
      queue.push(task.id);
    }

    console.log(`Queued task [${task.priority}]: ${task.name} (${task.id})`);
    this.emit('task:queued', task);
  }

  /**
   * Process the task queues
   */
  private async processQueue(): Promise<void> {
    if (this.paused || this.workers.size >= this.config.maxWorkers) {
      return;
    }

    // Find next task to execute (priority order)
    const priorities: TaskPriority[] = ['critical', 'high', 'normal', 'low'];

    for (const priority of priorities) {
      const queue = this.queues.get(priority);
      if (!queue || queue.length === 0) continue;

      // Find a task whose dependencies are satisfied
      for (let i = 0; i < queue.length; i++) {
        const taskId = queue[i];
        const task = this.tasks.get(taskId);

        if (!task || task.status !== 'pending') {
          queue.splice(i, 1);
          i--;
          continue;
        }

        // Check dependencies
        if (task.dependencies && task.dependencies.length > 0) {
          const dependenciesSatisfied = task.dependencies.every((depId) => {
            const depTask = this.tasks.get(depId);
            return depTask && depTask.status === 'completed';
          });

          if (!dependenciesSatisfied) {
            continue; // Skip this task, dependencies not met
          }
        }

        // Dependencies satisfied, execute this task
        queue.splice(i, 1);
        await this.executeTask(task);
        return; // Process one task at a time
      }
    }
  }

  /**
   * Execute a task
   */
  private async executeTask(task: Task): Promise<void> {
    const workerId = crypto.randomUUID();
    this.workers.add(workerId);

    task.status = 'running';
    task.startedAt = new Date();
    this.tasks.set(task.id, task);

    console.log(`Executing task [${task.priority}]: ${task.name} (${task.id})`);
    this.emit('task:started', task);

    try {
      let result: any;

      // Setup timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Task execution timeout')), this.config.taskTimeout)
      );

      const executionPromise = (async () => {
        switch (task.type) {
          case 'powershell':
            return await this.executePowerShellTask(task as PowerShellTask);
          case 'function':
            return await this.executeFunctionTask(task as FunctionTask);
          case 'http':
            return await this.executeHttpTask(task as HttpTask);
          case 'custom':
            return await this.executeCustomTask(task as CustomTask);
          default:
            throw new Error(`Unknown task type: ${(task as any).type}`);
        }
      })();

      result = await Promise.race([executionPromise, timeoutPromise]);

      // Task succeeded
      task.status = 'completed';
      task.completedAt = new Date();
      task.progress = 100;
      task.result = result;
      this.tasks.set(task.id, task);

      console.log(`Task completed: ${task.name} (${task.id})`);
      this.emit('task:completed', task);
    } catch (error: any) {
      console.error(`Task failed: ${task.name} (${task.id})`, error);
      task.error = error.message;

      // Check if we should retry
      if (task.retryCount < task.maxRetries) {
        task.retryCount++;
        task.status = 'retrying';
        this.tasks.set(task.id, task);

        // Calculate retry delay with exponential backoff
        const delay = Math.min(
          task.retryDelay * Math.pow(this.config.retryBackoffMultiplier, task.retryCount - 1),
          this.config.maxRetryDelay
        );

        console.log(`Retrying task ${task.name} in ${delay}ms (attempt ${task.retryCount}/${task.maxRetries})`);
        this.emit('task:retrying', { task, delay });

        setTimeout(() => {
          task.status = 'pending';
          this.addTaskToQueue(task);
        }, delay);
      } else {
        // Max retries exhausted
        task.status = 'failed';
        task.completedAt = new Date();
        this.tasks.set(task.id, task);

        console.error(`Task failed permanently: ${task.name} (${task.id})`);
        this.emit('task:failed', task);
      }
    } finally {
      this.workers.delete(workerId);
    }
  }

  /**
   * Execute PowerShell task
   */
  private async executePowerShellTask(task: PowerShellTask): Promise<any> {
    if (!this.powerShellService) {
      throw new Error('PowerShell service not available');
    }

    const result: ExecutionResult = await this.powerShellService.executeScript(
      task.scriptPath,
      task.args,
      task.options
    );

    if (!result.success) {
      throw new Error(result.error || 'PowerShell execution failed');
    }

    return result.data;
  }

  /**
   * Execute function task
   */
  private async executeFunctionTask(task: FunctionTask): Promise<any> {
    return await task.fn();
  }

  /**
   * Execute HTTP task
   */
  private async executeHttpTask(task: HttpTask): Promise<any> {
    const fetchOptions: RequestInit = {
      method: task.method,
      headers: task.headers,
    };

    if (task.body) {
      fetchOptions.body = typeof task.body === 'string' ? task.body : JSON.stringify(task.body);
    }

    const response = await fetch(task.url, fetchOptions);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return await response.text();
  }

  /**
   * Execute custom task
   */
  private async executeCustomTask(task: CustomTask): Promise<any> {
    return await task.executor(task);
  }

  /**
   * Cancel a task
   */
  cancelTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);

    if (!task) {
      return false;
    }

    if (task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled') {
      return false; // Already finished
    }

    if (task.status === 'running') {
      // Task is currently running, we can't stop it mid-execution
      // but we can mark it as cancelled for when it finishes
      console.warn(`Cannot cancel running task: ${task.name} (${task.id})`);
      return false;
    }

    // Remove from queue
    const queue = this.queues.get(task.priority);
    if (queue) {
      const index = queue.indexOf(taskId);
      if (index !== -1) {
        queue.splice(index, 1);
      }
    }

    task.status = 'cancelled';
    task.completedAt = new Date();
    this.tasks.set(taskId, task);

    console.log(`Task cancelled: ${task.name} (${taskId})`);
    this.emit('task:cancelled', task);

    return true;
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get all tasks
   */
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get tasks by status
   */
  getTasksByStatus(status: TaskStatus): Task[] {
    return Array.from(this.tasks.values()).filter((t) => t.status === status);
  }

  /**
   * Get tasks by tags
   */
  getTasksByTags(tags: string[]): Task[] {
    return Array.from(this.tasks.values()).filter((t) =>
      t.tags && tags.some((tag) => t.tags!.includes(tag))
    );
  }

  /**
   * Get task statistics
   */
  getStatistics(): TaskStatistics {
    const tasks = Array.from(this.tasks.values());
    const completed = tasks.filter((t) => t.status === 'completed');
    const totalExecutionTime = completed.reduce((sum, t) => {
      if (t.startedAt && t.completedAt) {
        return sum + (t.completedAt.getTime() - t.startedAt.getTime());
      }
      return sum;
    }, 0);

    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      running: tasks.filter((t) => t.status === 'running').length,
      completed: completed.length,
      failed: tasks.filter((t) => t.status === 'failed').length,
      cancelled: tasks.filter((t) => t.status === 'cancelled').length,
      retrying: tasks.filter((t) => t.status === 'retrying').length,
      averageExecutionTime: completed.length > 0 ? totalExecutionTime / completed.length : 0,
      successRate: tasks.length > 0 ? (completed.length / tasks.length) * 100 : 0,
    };
  }

  /**
   * Clear completed tasks older than specified age
   */
  clearOldTasks(maxAgeMs: number = 3600000): number {
    const now = Date.now();
    let cleared = 0;

    for (const [id, task] of this.tasks.entries()) {
      if (
        (task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled') &&
        task.completedAt &&
        now - task.completedAt.getTime() > maxAgeMs
      ) {
        this.tasks.delete(id);
        cleared++;
      }
    }

    if (cleared > 0) {
      console.log(`Cleared ${cleared} old tasks`);
      this.emit('tasks:cleared', { count: cleared });
    }

    return cleared;
  }

  /**
   * Pause queue processing
   */
  pause(): void {
    this.paused = true;
    console.log('Task queue paused');
    this.emit('queue:paused');
  }

  /**
   * Resume queue processing
   */
  resume(): void {
    this.paused = false;
    console.log('Task queue resumed');
    this.emit('queue:resumed');
  }

  /**
   * Clear all pending tasks
   */
  clearQueue(): number {
    let cleared = 0;

    for (const queue of this.queues.values()) {
      for (const taskId of queue) {
        const task = this.tasks.get(taskId);
        if (task && task.status === 'pending') {
          task.status = 'cancelled';
          task.completedAt = new Date();
          this.tasks.set(taskId, task);
          cleared++;
        }
      }
      queue.length = 0;
    }

    console.log(`Cleared ${cleared} pending tasks from queue`);
    this.emit('queue:cleared', { count: cleared });

    return cleared;
  }

  /**
   * Shutdown the service
   */
  async shutdown(): Promise<void> {
    console.log('Shutting down BackgroundTaskQueueService...');

    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    this.paused = true;
    this.clearQueue();

    // Wait for running tasks to complete (with timeout)
    const timeout = Date.now() + 10000; // 10 second timeout
    while (this.workers.size > 0 && Date.now() < timeout) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.tasks.clear();
    this.workers.clear();
    this.initialized = false;

    console.log('BackgroundTaskQueueService shutdown complete');
  }
}

export default BackgroundTaskQueueService;
