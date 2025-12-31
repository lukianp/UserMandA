/**
 * Progress Service
 * Global progress tracking for long-running operations
 * Supports indeterminate/determinate progress, multi-task tracking, hierarchical progress
 */

import { ProgressTask, ProgressSubtask, ProgressNotificationOptions } from '../types/uiux';

import { notificationService } from './notificationService';

/**
 * Progress Service Class
 */
class ProgressService {
  private tasks: Map<string, ProgressTask> = new Map();
  private listeners: Set<(tasks: ProgressTask[]) => void> = new Set();
  private historyLimit = 50;
  private history: ProgressTask[] = [];

  // ========================================
  // Task Management
  // ========================================

  /**
   * Start a new progress task
   */
  startTask(
    title: string,
    options: {
      description?: string;
      type?: 'determinate' | 'indeterminate';
      totalItems?: number;
      cancellable?: boolean;
      onCancel?: () => void;
      notification?: ProgressNotificationOptions;
    } = {}
  ): string {
    const taskId = this.generateTaskId();

    const task: ProgressTask = {
      id: taskId,
      title,
      description: options.description,
      status: 'running',
      type: options.type || 'indeterminate',
      percentage: options.type === 'determinate' ? 0 : undefined,
      totalItems: options.totalItems,
      itemsProcessed: 0,
      startTime: new Date(),
      cancellable: options.cancellable ?? false,
      onCancel: options.onCancel,
      subtasks: [],
    };

    this.tasks.set(taskId, task);
    this.notifyListeners();

    // Show notification if requested
    if (options.notification?.showToast) {
      notificationService.showInfo(`Started: ${title}`, {
        duration: 3000,
      });
    }

    return taskId;
  }

  /**
   * Update task progress
   */
  updateProgress(
    taskId: string,
    update: {
      percentage?: number;
      currentItem?: string;
      itemsProcessed?: number;
      message?: string;
    }
  ): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    // Update task
    if (update.percentage !== undefined) {
      task.percentage = Math.min(100, Math.max(0, update.percentage));
    }
    if (update.currentItem !== undefined) {
      task.currentItem = update.currentItem;
    }
    if (update.itemsProcessed !== undefined) {
      task.itemsProcessed = update.itemsProcessed;

      // Auto-calculate percentage if totalItems is known
      if (task.totalItems && task.type === 'determinate') {
        task.percentage = Math.round((update.itemsProcessed / task.totalItems) * 100);
      }
    }

    // Calculate estimated time remaining
    if (task.percentage && task.percentage > 0) {
      const elapsed = Date.now() - task.startTime.getTime();
      const estimatedTotal = (elapsed / task.percentage) * 100;
      task.estimatedTimeRemaining = estimatedTotal - elapsed;
    }

    this.notifyListeners();
  }

  /**
   * Complete a task
   */
  completeTask(taskId: string, notification?: ProgressNotificationOptions): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = 'completed';
    task.endTime = new Date();
    task.percentage = 100;

    this.moveToHistory(task);
    this.notifyListeners();

    // Show notification
    if (notification?.showToast) {
      const duration = (task.endTime.getTime() - task.startTime.getTime()) / 1000;
      notificationService.showSuccess(`Completed: ${task.title} (${duration.toFixed(1)}s)`, {
        duration: 5000,
      });
    }
  }

  /**
   * Fail a task
   */
  failTask(taskId: string, error: string, notification?: ProgressNotificationOptions): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = 'failed';
    task.endTime = new Date();
    task.error = error;

    this.moveToHistory(task);
    this.notifyListeners();

    // Show notification
    if (notification?.showToast) {
      notificationService.showError(`Failed: ${task.title} - ${error}`, {
        duration: 0, // Don't auto-dismiss errors
      });
    }
  }

  /**
   * Cancel a task
   */
  cancelTask(taskId: string, notification?: ProgressNotificationOptions): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    if (!task.cancellable) {
      console.warn(`Task ${taskId} is not cancellable`);
      return;
    }

    // Call cancel handler
    if (task.onCancel) {
      try {
        task.onCancel();
      } catch (error) {
        console.error('Error calling onCancel handler:', error);
      }
    }

    task.status = 'cancelled';
    task.endTime = new Date();

    this.moveToHistory(task);
    this.notifyListeners();

    // Show notification
    if (notification?.showToast) {
      notificationService.showWarning(`Cancelled: ${task.title}`, {
        duration: 3000,
      });
    }
  }

  /**
   * Remove a task (for completed/failed/cancelled tasks)
   */
  removeTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (task && task.status === 'running') {
      console.warn('Cannot remove running task. Cancel or complete it first.');
      return;
    }

    this.tasks.delete(taskId);
    this.notifyListeners();
  }

  /**
   * Clear all completed/failed/cancelled tasks
   */
  clearCompletedTasks(): void {
    const toRemove: string[] = [];

    this.tasks.forEach((task, id) => {
      if (task.status !== 'running') {
        toRemove.push(id);
      }
    });

    toRemove.forEach((id) => this.tasks.delete(id));
    this.notifyListeners();
  }

  // ========================================
  // Hierarchical Progress (Subtasks)
  // ========================================

  /**
   * Add a subtask to a parent task
   */
  addSubtask(taskId: string, subtaskTitle: string): string {
    const task = this.tasks.get(taskId);
    if (!task) return '';

    const subtaskId = `${taskId}-sub-${task.subtasks!.length}`;

    const subtask: ProgressSubtask = {
      id: subtaskId,
      title: subtaskTitle,
      percentage: 0,
      status: 'pending',
    };

    task.subtasks!.push(subtask);
    this.notifyListeners();

    return subtaskId;
  }

  /**
   * Update subtask progress
   */
  updateSubtask(
    taskId: string,
    subtaskId: string,
    update: {
      percentage?: number;
      status?: ProgressSubtask['status'];
    }
  ): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    const subtask = task.subtasks!.find((st) => st.id === subtaskId);
    if (!subtask) return;

    if (update.percentage !== undefined) {
      subtask.percentage = update.percentage;
    }
    if (update.status !== undefined) {
      subtask.status = update.status;
    }

    // Recalculate parent task percentage based on subtasks
    if (task.subtasks!.length > 0) {
      const totalPercentage = task.subtasks!.reduce((sum, st) => sum + st.percentage, 0);
      task.percentage = Math.round(totalPercentage / task.subtasks!.length);
    }

    this.notifyListeners();
  }

  // ========================================
  // Queries
  // ========================================

  /**
   * Get all active tasks
   */
  getTasks(): ProgressTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get a specific task
   */
  getTask(taskId: string): ProgressTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get running tasks
   */
  getRunningTasks(): ProgressTask[] {
    return this.getTasks().filter((t) => t.status === 'running');
  }

  /**
   * Check if any tasks are running
   */
  hasRunningTasks(): boolean {
    return this.getRunningTasks().length > 0;
  }

  /**
   * Get task count by status
   */
  getTaskCount(status?: ProgressTask['status']): number {
    if (!status) return this.tasks.size;
    return this.getTasks().filter((t) => t.status === status).length;
  }

  /**
   * Get task history
   */
  getHistory(): ProgressTask[] {
    return [...this.history];
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.history = [];
  }

  // ========================================
  // Convenience Methods
  // ========================================

  /**
   * Run a task with automatic progress tracking
   */
  async runTask<T>(
    title: string,
    asyncFn: (updateProgress: (percentage: number, message?: string) => void) => Promise<T>,
    options: {
      description?: string;
      totalItems?: number;
      notification?: ProgressNotificationOptions;
    } = {}
  ): Promise<T> {
    const taskId = this.startTask(title, {
      ...options,
      type: 'determinate',
    });

    try {
      const updateProgress = (percentage: number, message?: string) => {
        this.updateProgress(taskId, {
          percentage,
          currentItem: message,
        });
      };

      const result = await asyncFn(updateProgress);

      this.completeTask(taskId, options.notification);

      return result;
    } catch (error) {
      this.failTask(
        taskId,
        error instanceof Error ? error.message : 'Unknown error',
        options.notification
      );
      throw error;
    }
  }

  /**
   * Track PowerShell script execution
   */
  trackScriptExecution(
    scriptName: string,
    options: {
      cancellable?: boolean;
      onCancel?: () => void;
    } = {}
  ): string {
    return this.startTask(`Executing ${scriptName}`, {
      type: 'indeterminate',
      cancellable: options.cancellable,
      onCancel: options.onCancel,
      notification: { showToast: false }, // Don't show toast for scripts
    });
  }

  /**
   * Track discovery operation
   */
  trackDiscovery(
    discoveryType: string,
    expectedItems?: number
  ): string {
    return this.startTask(`${discoveryType} Discovery`, {
      description: 'Scanning environment...',
      type: expectedItems ? 'determinate' : 'indeterminate',
      totalItems: expectedItems,
      cancellable: true,
      notification: { showToast: true },
    });
  }

  /**
   * Track migration operation
   */
  trackMigration(
    waveName: string,
    totalUsers: number
  ): string {
    return this.startTask(`Migrating Wave: ${waveName}`, {
      description: `Processing ${totalUsers} users...`,
      type: 'determinate',
      totalItems: totalUsers,
      cancellable: true,
      notification: { showToast: true },
    });
  }

  // ========================================
  // Helpers
  // ========================================

  /**
   * Generate unique task ID
   */
  private generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Move task to history
   */
  private moveToHistory(task: ProgressTask): void {
    this.tasks.delete(task.id);

    // Add to history
    this.history.unshift(task);

    // Limit history size
    if (this.history.length > this.historyLimit) {
      this.history = this.history.slice(0, this.historyLimit);
    }
  }

  /**
   * Subscribe to progress updates
   */
  subscribe(listener: (tasks: ProgressTask[]) => void): () => void {
    this.listeners.add(listener);

    // Immediately notify with current state
    listener(this.getTasks());

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    const tasks = this.getTasks();
    this.listeners.forEach((listener) => {
      try {
        listener(tasks);
      } catch (error) {
        console.error('Progress listener error:', error);
      }
    });
  }
}

// Export singleton instance
export const progressService = new ProgressService();

// Export class for testing
export default ProgressService;


