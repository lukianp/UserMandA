/**
 * Scheduled Task Service
 *
 * Features:
 * - Cron expression parsing and scheduling
 * - Recurring and one-time scheduled tasks
 * - Task execution windows (business hours only, etc.)
 * - Task chaining (run B after A completes)
 * - Missed execution handling strategies
 * - Next run time calculation
 * - Task enable/disable
 * - Execution history tracking
 * - Integration with BackgroundTaskQueueService
 */

import { EventEmitter } from 'events';
import * as crypto from 'crypto';

import { ExecutionOptions } from '../../types/shared';

import BackgroundTaskQueueService, { TaskOptions, TaskPriority } from './backgroundTaskQueueService';

/**
 * Cron field types
 */
interface CronExpression {
  minute: string; // 0-59
  hour: string; // 0-23
  dayOfMonth: string; // 1-31
  month: string; // 1-12
  dayOfWeek: string; // 0-6 (0 = Sunday)
}

/**
 * Execution window for time-restricted tasks
 */
interface ExecutionWindow {
  startHour: number; // 0-23
  endHour: number; // 0-23
  daysOfWeek?: number[]; // 0-6, if omitted runs every day
}

/**
 * Missed execution handling strategy
 */
export type MissedExecutionStrategy = 'run-immediately' | 'skip' | 'queue';

/**
 * Scheduled task status
 */
export type ScheduledTaskStatus = 'enabled' | 'disabled' | 'expired';

/**
 * Scheduled task execution record
 */
export interface TaskExecution {
  id: string;
  taskId: string;
  scheduledTime: Date;
  actualTime: Date;
  duration: number;
  success: boolean;
  error?: string;
  result?: any;
}

/**
 * Scheduled task definition
 */
export interface ScheduledTask {
  id: string;
  name: string;
  description?: string;
  status: ScheduledTaskStatus;

  // Scheduling
  cronExpression?: string;
  oneTime?: Date;
  executionWindow?: ExecutionWindow;
  missedExecutionStrategy: MissedExecutionStrategy;

  // Task configuration
  taskType: 'powershell' | 'function' | 'http' | 'custom';
  taskConfig: any; // Type-specific configuration
  taskOptions: TaskOptions;

  // Timing
  createdAt: Date;
  nextRun?: Date;
  lastRun?: Date;
  expiresAt?: Date;

  // Statistics
  executionCount: number;
  successCount: number;
  failureCount: number;

  // Chaining
  chainedTaskIds?: string[]; // Tasks to run after this one completes

  // Metadata
  tags?: string[];
  metadata?: Record<string, any>;
}

/**
 * Task creation parameters
 */
export interface ScheduledTaskParams {
  name: string;
  description?: string;
  cronExpression?: string;
  oneTime?: Date;
  executionWindow?: ExecutionWindow;
  missedExecutionStrategy?: MissedExecutionStrategy;
  expiresAt?: Date;
  chainedTaskIds?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
}

/**
 * Scheduled Task Service
 */
class ScheduledTaskService extends EventEmitter {
  private tasks: Map<string, ScheduledTask>;
  private executions: Map<string, TaskExecution[]>; // taskId -> executions
  private checkInterval: NodeJS.Timeout | null;
  private backgroundQueue: BackgroundTaskQueueService | null;
  private initialized: boolean;

  constructor() {
    super();
    this.tasks = new Map();
    this.executions = new Map();
    this.checkInterval = null;
    this.backgroundQueue = null;
    this.initialized = false;
  }

  /**
   * Initialize the service
   */
  async initialize(backgroundQueue: BackgroundTaskQueueService): Promise<void> {
    if (this.initialized) {
      console.warn('ScheduledTaskService already initialized');
      return;
    }

    this.backgroundQueue = backgroundQueue;
    this.initialized = true;

    // Check for due tasks every minute
    this.checkInterval = setInterval(() => this.checkDueTasks(), 60000);

    console.log('ScheduledTaskService initialized');
    this.emit('initialized');
  }

  /**
   * Schedule a PowerShell task
   */
  schedulePowerShellTask(
    scriptPath: string,
    args: string[] = [],
    options: ExecutionOptions = {},
    scheduleParams: ScheduledTaskParams,
    taskOptions: TaskOptions
  ): string {
    const task: ScheduledTask = {
      id: crypto.randomUUID(),
      name: scheduleParams.name,
      description: scheduleParams.description,
      status: 'enabled',
      cronExpression: scheduleParams.cronExpression,
      oneTime: scheduleParams.oneTime,
      executionWindow: scheduleParams.executionWindow,
      missedExecutionStrategy: scheduleParams.missedExecutionStrategy || 'queue',
      taskType: 'powershell',
      taskConfig: { scriptPath, args, options },
      taskOptions,
      createdAt: new Date(),
      expiresAt: scheduleParams.expiresAt,
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      chainedTaskIds: scheduleParams.chainedTaskIds,
      tags: scheduleParams.tags,
      metadata: scheduleParams.metadata,
    };

    task.nextRun = this.calculateNextRun(task);
    this.tasks.set(task.id, task);
    this.executions.set(task.id, []);

    console.log(`Scheduled PowerShell task: ${task.name} (${task.id}), next run: ${task.nextRun}`);
    this.emit('task:scheduled', task);

    return task.id;
  }

  /**
   * Schedule a function task
   */
  scheduleFunctionTask(
    fn: () => Promise<any>,
    scheduleParams: ScheduledTaskParams,
    taskOptions: TaskOptions
  ): string {
    const task: ScheduledTask = {
      id: crypto.randomUUID(),
      name: scheduleParams.name,
      description: scheduleParams.description,
      status: 'enabled',
      cronExpression: scheduleParams.cronExpression,
      oneTime: scheduleParams.oneTime,
      executionWindow: scheduleParams.executionWindow,
      missedExecutionStrategy: scheduleParams.missedExecutionStrategy || 'queue',
      taskType: 'function',
      taskConfig: { fn },
      taskOptions,
      createdAt: new Date(),
      expiresAt: scheduleParams.expiresAt,
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      chainedTaskIds: scheduleParams.chainedTaskIds,
      tags: scheduleParams.tags,
      metadata: scheduleParams.metadata,
    };

    task.nextRun = this.calculateNextRun(task);
    this.tasks.set(task.id, task);
    this.executions.set(task.id, []);

    console.log(`Scheduled function task: ${task.name} (${task.id}), next run: ${task.nextRun}`);
    this.emit('task:scheduled', task);

    return task.id;
  }

  /**
   * Check for tasks that are due to run
   */
  private async checkDueTasks(): Promise<void> {
    const now = new Date();

    for (const task of this.tasks.values()) {
      if (task.status !== 'enabled' || !task.nextRun) {
        continue;
      }

      // Check if task has expired
      if (task.expiresAt && now > task.expiresAt) {
        task.status = 'expired';
        this.tasks.set(task.id, task);
        console.log(`Task expired: ${task.name} (${task.id})`);
        this.emit('task:expired', task);
        continue;
      }

      // Check if task is due
      if (now >= task.nextRun) {
        // Check execution window
        if (task.executionWindow && !this.isInExecutionWindow(now, task.executionWindow)) {
          console.log(`Task ${task.name} is due but outside execution window, applying strategy: ${task.missedExecutionStrategy}`);

          switch (task.missedExecutionStrategy) {
            case 'run-immediately':
              // Wait until we're in the window
              break;
            case 'skip':
              // Skip this execution
              task.nextRun = this.calculateNextRun(task);
              this.tasks.set(task.id, task);
              continue;
            case 'queue':
              // Will be queued when window opens
              break;
          }
          continue;
        }

        // Execute the task
        await this.executeTask(task);

        // Calculate next run
        task.lastRun = now;
        task.nextRun = this.calculateNextRun(task);

        // If one-time task, disable it
        if (task.oneTime) {
          task.status = 'disabled';
        }

        this.tasks.set(task.id, task);
      }
    }
  }

  /**
   * Execute a scheduled task
   */
  private async executeTask(task: ScheduledTask): Promise<void> {
    if (!this.backgroundQueue) {
      console.error('BackgroundTaskQueueService not available');
      return;
    }

    console.log(`Executing scheduled task: ${task.name} (${task.id})`);
    this.emit('task:executing', task);

    const execution: TaskExecution = {
      id: crypto.randomUUID(),
      taskId: task.id,
      scheduledTime: task.nextRun!,
      actualTime: new Date(),
      duration: 0,
      success: false,
    };

    const startTime = Date.now();

    try {
      let backgroundTaskId: string;

      // Queue task based on type
      switch (task.taskType) {
        case 'powershell':
          backgroundTaskId = this.backgroundQueue.queuePowerShellTask(
            task.taskConfig.scriptPath,
            task.taskConfig.args,
            task.taskConfig.options,
            task.taskOptions
          );
          break;
        case 'function':
          backgroundTaskId = this.backgroundQueue.queueFunctionTask(
            task.taskConfig.fn,
            task.taskOptions
          );
          break;
        case 'http':
          backgroundTaskId = this.backgroundQueue.queueHttpTask(
            task.taskConfig.url,
            task.taskConfig.method,
            task.taskOptions,
            task.taskConfig.headers,
            task.taskConfig.body
          );
          break;
        default:
          throw new Error(`Unsupported task type: ${task.taskType}`);
      }

      // Wait for task completion
      const backgroundTask = await this.waitForTaskCompletion(backgroundTaskId);

      execution.success = backgroundTask.status === 'completed';
      execution.duration = Date.now() - startTime;
      execution.result = backgroundTask.result;

      if (!execution.success) {
        execution.error = backgroundTask.error;
      }

      task.executionCount++;
      if (execution.success) {
        task.successCount++;
      } else {
        task.failureCount++;
      }

      // Execute chained tasks if this one succeeded
      if (execution.success && task.chainedTaskIds && task.chainedTaskIds.length > 0) {
        for (const chainedId of task.chainedTaskIds) {
          const chainedTask = this.tasks.get(chainedId);
          if (chainedTask && chainedTask.status === 'enabled') {
            await this.executeTask(chainedTask);
          }
        }
      }
    } catch (error: any) {
      execution.success = false;
      execution.error = error.message;
      execution.duration = Date.now() - startTime;
      task.executionCount++;
      task.failureCount++;

      console.error(`Scheduled task execution failed: ${task.name}`, error);
    }

    // Record execution
    const executions = this.executions.get(task.id) || [];
    executions.push(execution);
    this.executions.set(task.id, executions);

    this.emit('task:executed', { task, execution });
  }

  /**
   * Wait for background task to complete
   */
  private async waitForTaskCompletion(taskId: string): Promise<any> {
    if (!this.backgroundQueue) {
      throw new Error('BackgroundTaskQueueService not available');
    }

    return new Promise((resolve, reject) => {
      const checkTask = () => {
        const task = this.backgroundQueue!.getTask(taskId);

        if (!task) {
          reject(new Error('Task not found'));
          return;
        }

        if (task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled') {
          resolve(task);
          return;
        }

        // Check again in 100ms
        setTimeout(checkTask, 100);
      };

      checkTask();
    });
  }

  /**
   * Check if current time is within execution window
   */
  private isInExecutionWindow(time: Date, window: ExecutionWindow): boolean {
    const hour = time.getHours();
    const dayOfWeek = time.getDay();

    // Check time range
    if (hour < window.startHour || hour >= window.endHour) {
      return false;
    }

    // Check day of week
    if (window.daysOfWeek && !window.daysOfWeek.includes(dayOfWeek)) {
      return false;
    }

    return true;
  }

  /**
   * Calculate next run time for a task
   */
  private calculateNextRun(task: ScheduledTask): Date | undefined {
    // One-time task
    if (task.oneTime) {
      return task.oneTime;
    }

    // Recurring task with cron
    if (task.cronExpression) {
      return this.getNextCronTime(task.cronExpression, task.lastRun || new Date());
    }

    return undefined;
  }

  /**
   * Parse cron expression and get next run time
   */
  private getNextCronTime(cronExpression: string, fromDate: Date): Date {
    const cron = this.parseCronExpression(cronExpression);
    const next = new Date(fromDate);
    next.setSeconds(0, 0);

    // Simple cron parser - supports basic patterns
    // Format: minute hour dayOfMonth month dayOfWeek
    // Supports: *, specific numbers, ranges (1-5), steps (*/5)

    let attempts = 0;
    const maxAttempts = 366 * 24 * 60; // One year of minutes

    while (attempts < maxAttempts) {
      next.setMinutes(next.getMinutes() + 1);
      attempts++;

      if (
        this.matchesCronField(next.getMinutes(), cron.minute) &&
        this.matchesCronField(next.getHours(), cron.hour) &&
        this.matchesCronField(next.getDate(), cron.dayOfMonth) &&
        this.matchesCronField(next.getMonth() + 1, cron.month) &&
        this.matchesCronField(next.getDay(), cron.dayOfWeek)
      ) {
        return next;
      }
    }

    throw new Error('Could not calculate next cron time');
  }

  /**
   * Parse cron expression into fields
   */
  private parseCronExpression(expression: string): CronExpression {
    const parts = expression.trim().split(/\s+/);

    if (parts.length !== 5) {
      throw new Error('Invalid cron expression. Expected format: minute hour dayOfMonth month dayOfWeek');
    }

    return {
      minute: parts[0],
      hour: parts[1],
      dayOfMonth: parts[2],
      month: parts[3],
      dayOfWeek: parts[4],
    };
  }

  /**
   * Check if a value matches a cron field
   */
  private matchesCronField(value: number, field: string): boolean {
    // Wildcard
    if (field === '*') {
      return true;
    }

    // Specific value
    if (/^\d+$/.test(field)) {
      return value === parseInt(field, 10);
    }

    // Range (e.g., 1-5)
    if (/^\d+-\d+$/.test(field)) {
      const [start, end] = field.split('-').map(Number);
      return value >= start && value <= end;
    }

    // Step (e.g., */5)
    if (/^\*\/\d+$/.test(field)) {
      const step = parseInt(field.split('/')[1], 10);
      return value % step === 0;
    }

    // List (e.g., 1,3,5)
    if (field.includes(',')) {
      const values = field.split(',').map(Number);
      return values.includes(value);
    }

    return false;
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): ScheduledTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get all tasks
   */
  getAllTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get tasks by status
   */
  getTasksByStatus(status: ScheduledTaskStatus): ScheduledTask[] {
    return Array.from(this.tasks.values()).filter((t) => t.status === status);
  }

  /**
   * Get task execution history
   */
  getExecutionHistory(taskId: string, limit?: number): TaskExecution[] {
    const executions = this.executions.get(taskId) || [];

    if (limit) {
      return executions.slice(-limit);
    }

    return executions;
  }

  /**
   * Enable a task
   */
  enableTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);

    if (!task) {
      return false;
    }

    task.status = 'enabled';
    task.nextRun = this.calculateNextRun(task);
    this.tasks.set(taskId, task);

    console.log(`Task enabled: ${task.name} (${taskId})`);
    this.emit('task:enabled', task);

    return true;
  }

  /**
   * Disable a task
   */
  disableTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);

    if (!task) {
      return false;
    }

    task.status = 'disabled';
    this.tasks.set(taskId, task);

    console.log(`Task disabled: ${task.name} (${taskId})`);
    this.emit('task:disabled', task);

    return true;
  }

  /**
   * Delete a task
   */
  deleteTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);

    if (!task) {
      return false;
    }

    this.tasks.delete(taskId);
    this.executions.delete(taskId);

    console.log(`Task deleted: ${task.name} (${taskId})`);
    this.emit('task:deleted', task);

    return true;
  }

  /**
   * Trigger a task immediately (ignoring schedule)
   */
  async triggerTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    await this.executeTask(task);
  }

  /**
   * Shutdown the service
   */
  async shutdown(): Promise<void> {
    console.log('Shutting down ScheduledTaskService...');

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    this.tasks.clear();
    this.executions.clear();
    this.initialized = false;

    console.log('ScheduledTaskService shutdown complete');
  }
}

export default ScheduledTaskService;
