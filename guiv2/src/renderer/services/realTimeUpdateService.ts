/**
 * Real-Time Update Service
 *
 * Features:
 * - Real-time data synchronization
 * - Optimistic UI updates
 * - Conflict resolution (last-write-wins, merge, manual)
 * - Change detection and diffing
 * - Update batching for performance
 * - Selective field updates
 * - Update notifications
 * - Integration with WebSocket service
 * - Offline queue (sync when online)
 */

import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import loggingService from './loggingService';
import eventAggregator from './eventAggregatorService';

/**
 * Conflict resolution strategy
 */
export type ConflictResolutionStrategy = 'last-write-wins' | 'merge' | 'manual';

/**
 * Update operation type
 */
export type UpdateOperation = 'create' | 'update' | 'delete';

/**
 * Data update
 */
export interface DataUpdate<T = any> {
  id: string;
  entityType: string;
  entityId: string;
  operation: UpdateOperation;
  data: Partial<T>;
  timestamp: Date;
  version: number;
  userId?: string;
  source: 'local' | 'remote';
}

/**
 * Pending update (offline queue)
 */
interface PendingUpdate {
  id: string;
  update: DataUpdate;
  retries: number;
  lastAttempt: Date;
}

/**
 * Conflict
 */
export interface Conflict<T = any> {
  id: string;
  entityType: string;
  entityId: string;
  localUpdate: DataUpdate<T>;
  remoteUpdate: DataUpdate<T>;
  resolvedAt?: Date;
  resolution?: Partial<T>;
}

/**
 * Entity subscription
 */
interface Subscription {
  id: string;
  entityType: string;
  entityId?: string; // If omitted, subscribes to all entities of this type
  callback: (update: DataUpdate) => void;
}

/**
 * Real-Time Update Service
 */
class RealTimeUpdateService extends EventEmitter {
  private subscriptions: Map<string, Subscription[]> = new Map();
  private pendingUpdates: Map<string, PendingUpdate> = new Map();
  private conflicts: Map<string, Conflict> = new Map();
  private entityVersions: Map<string, number> = new Map(); // entityType:entityId -> version
  private conflictResolutionStrategy: ConflictResolutionStrategy = 'last-write-wins';
  private batchInterval = 100; // ms
  private batchedUpdates: DataUpdate[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private isOnline: boolean = navigator.onLine;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();

    // Monitor online/offline status
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Start periodic sync of pending updates
    this.syncInterval = setInterval(() => this.syncPendingUpdates(), 5000);

    // Listen to event aggregator for remote updates
    eventAggregator.subscribe('realtime:update', (event) => {
      this.handleRemoteUpdate(event.payload);
    });
  }

  /**
   * Set conflict resolution strategy
   */
  setConflictResolutionStrategy(strategy: ConflictResolutionStrategy): void {
    this.conflictResolutionStrategy = strategy;
    loggingService.info(
      `Conflict resolution strategy set to: ${strategy}`,
      'RealTimeUpdateService'
    );
  }

  /**
   * Subscribe to entity updates
   */
  subscribe(
    entityType: string,
    callback: (update: DataUpdate) => void,
    entityId?: string
  ): string {
    const subscriptionId = crypto.randomUUID();

    const subscription: Subscription = {
      id: subscriptionId,
      entityType,
      entityId,
      callback,
    };

    const typeSubscriptions = this.subscriptions.get(entityType) || [];
    typeSubscriptions.push(subscription);
    this.subscriptions.set(entityType, typeSubscriptions);

    loggingService.debug(
      `Subscribed to ${entityType}${entityId ? `:${entityId}` : ''}`,
      'RealTimeUpdateService',
      { subscriptionId }
    );

    return subscriptionId;
  }

  /**
   * Unsubscribe from updates
   */
  unsubscribe(subscriptionId: string): boolean {
    for (const [entityType, subscriptions] of this.subscriptions.entries()) {
      const index = subscriptions.findIndex((s) => s.id === subscriptionId);
      if (index !== -1) {
        subscriptions.splice(index, 1);
        if (subscriptions.length === 0) {
          this.subscriptions.delete(entityType);
        }
        loggingService.debug('Unsubscribed from updates', 'RealTimeUpdateService', { subscriptionId });
        return true;
      }
    }
    return false;
  }

  /**
   * Apply local update (optimistic)
   */
  async applyLocalUpdate<T = any>(
    entityType: string,
    entityId: string,
    operation: UpdateOperation,
    data: Partial<T>
  ): Promise<void> {
    const versionKey = `${entityType}:${entityId}`;
    const currentVersion = this.entityVersions.get(versionKey) || 0;
    const newVersion = currentVersion + 1;

    const update: DataUpdate<T> = {
      id: crypto.randomUUID(),
      entityType,
      entityId,
      operation,
      data,
      timestamp: new Date(),
      version: newVersion,
      source: 'local',
    };

    // Update version
    this.entityVersions.set(versionKey, newVersion);

    // Add to batch
    this.batchUpdate(update);

    // Notify subscribers immediately (optimistic update)
    this.notifySubscribers(update);

    // Queue for remote sync if offline
    if (!this.isOnline) {
      this.queueUpdate(update);
    }

    loggingService.debug(
      `Applied local update: ${entityType}:${entityId}`,
      'RealTimeUpdateService',
      { operation, version: newVersion }
    );
  }

  /**
   * Handle remote update
   */
  private async handleRemoteUpdate<T = any>(update: DataUpdate<T>): Promise<void> {
    const versionKey = `${update.entityType}:${update.entityId}`;
    const currentVersion = this.entityVersions.get(versionKey) || 0;

    // Check for conflict
    if (update.version <= currentVersion) {
      // Remote update is older or same version - potential conflict
      const conflict = this.detectConflict(update);

      if (conflict) {
        await this.resolveConflict(conflict);
        return;
      }
    }

    // No conflict, apply update
    this.entityVersions.set(versionKey, update.version);
    this.notifySubscribers(update);

    loggingService.debug(
      `Applied remote update: ${update.entityType}:${update.entityId}`,
      'RealTimeUpdateService',
      { operation: update.operation, version: update.version }
    );
  }

  /**
   * Detect conflict
   */
  private detectConflict<T = any>(remoteUpdate: DataUpdate<T>): Conflict<T> | null {
    // Find pending local update for same entity
    for (const pending of this.pendingUpdates.values()) {
      if (
        pending.update.entityType === remoteUpdate.entityType &&
        pending.update.entityId === remoteUpdate.entityId
      ) {
        const conflict: Conflict<T> = {
          id: crypto.randomUUID(),
          entityType: remoteUpdate.entityType,
          entityId: remoteUpdate.entityId,
          localUpdate: pending.update as DataUpdate<T>,
          remoteUpdate,
        };

        this.conflicts.set(conflict.id, conflict);

        loggingService.warn(
          `Conflict detected: ${conflict.entityType}:${conflict.entityId}`,
          'RealTimeUpdateService',
          { conflictId: conflict.id }
        );

        return conflict;
      }
    }

    return null;
  }

  /**
   * Resolve conflict
   */
  private async resolveConflict<T = any>(conflict: Conflict<T>): Promise<void> {
    let resolution: Partial<T> | null = null;

    switch (this.conflictResolutionStrategy) {
      case 'last-write-wins':
        resolution = this.resolveLastWriteWins(conflict);
        break;
      case 'merge':
        resolution = this.resolveMerge(conflict);
        break;
      case 'manual':
        // Emit conflict event for manual resolution
        this.emit('conflict', conflict);
        return;
    }

    if (resolution) {
      conflict.resolution = resolution;
      conflict.resolvedAt = new Date();

      // Apply resolution
      const resolvedUpdate: DataUpdate<T> = {
        id: crypto.randomUUID(),
        entityType: conflict.entityType,
        entityId: conflict.entityId,
        operation: 'update',
        data: resolution,
        timestamp: new Date(),
        version: Math.max(conflict.localUpdate.version, conflict.remoteUpdate.version) + 1,
        source: 'local',
      };

      this.notifySubscribers(resolvedUpdate);

      // Remove from pending updates
      this.pendingUpdates.delete(conflict.localUpdate.id);

      loggingService.info(
        `Conflict resolved: ${conflict.entityType}:${conflict.entityId}`,
        'RealTimeUpdateService',
        { strategy: this.conflictResolutionStrategy }
      );
    }
  }

  /**
   * Resolve using last-write-wins strategy
   */
  private resolveLastWriteWins<T = any>(conflict: Conflict<T>): Partial<T> {
    if (conflict.localUpdate.timestamp > conflict.remoteUpdate.timestamp) {
      return conflict.localUpdate.data;
    } else {
      return conflict.remoteUpdate.data;
    }
  }

  /**
   * Resolve using merge strategy
   */
  private resolveMerge<T = any>(conflict: Conflict<T>): Partial<T> {
    // Simple merge: remote takes precedence for conflicts, but keep non-conflicting local changes
    return {
      ...conflict.localUpdate.data,
      ...conflict.remoteUpdate.data,
    };
  }

  /**
   * Batch update
   */
  private batchUpdate(update: DataUpdate): void {
    this.batchedUpdates.push(update);

    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(() => {
      this.flushBatch();
    }, this.batchInterval);
  }

  /**
   * Flush batched updates
   */
  private flushBatch(): void {
    if (this.batchedUpdates.length === 0) {
      return;
    }

    const updates = [...this.batchedUpdates];
    this.batchedUpdates = [];

    // Publish batch to event aggregator
    eventAggregator.publish('realtime:batch', updates, {
      namespace: 'system',
      source: 'RealTimeUpdateService',
    });

    loggingService.debug(
      `Flushed batch of ${updates.length} updates`,
      'RealTimeUpdateService'
    );
  }

  /**
   * Queue update for offline sync
   */
  private queueUpdate(update: DataUpdate): void {
    const pending: PendingUpdate = {
      id: update.id,
      update,
      retries: 0,
      lastAttempt: new Date(),
    };

    this.pendingUpdates.set(update.id, pending);

    loggingService.info(
      `Queued update for offline sync: ${update.entityType}:${update.entityId}`,
      'RealTimeUpdateService'
    );
  }

  /**
   * Sync pending updates
   */
  private async syncPendingUpdates(): Promise<void> {
    if (!this.isOnline || this.pendingUpdates.size === 0) {
      return;
    }

    const updates = Array.from(this.pendingUpdates.values());

    for (const pending of updates) {
      try {
        // Attempt to sync (would integrate with actual backend API)
        // For now, just simulate success
        await new Promise((resolve) => setTimeout(resolve, 100));

        this.pendingUpdates.delete(pending.id);

        loggingService.debug(
          `Synced pending update: ${pending.update.entityType}:${pending.update.entityId}`,
          'RealTimeUpdateService'
        );
      } catch (error: any) {
        pending.retries++;
        pending.lastAttempt = new Date();

        if (pending.retries >= 3) {
          this.pendingUpdates.delete(pending.id);

          loggingService.error(
            `Failed to sync update after 3 retries: ${pending.update.entityType}:${pending.update.entityId}`,
            'RealTimeUpdateService',
            undefined,
            error
          );
        }
      }
    }
  }

  /**
   * Notify subscribers
   */
  private notifySubscribers(update: DataUpdate): void {
    const subscriptions = this.subscriptions.get(update.entityType) || [];

    for (const sub of subscriptions) {
      // Check if subscription is for specific entity or all entities
      if (!sub.entityId || sub.entityId === update.entityId) {
        try {
          sub.callback(update);
        } catch (error: any) {
          loggingService.error(
            `Subscription callback error`,
            'RealTimeUpdateService',
            { subscriptionId: sub.id },
            error
          );
        }
      }
    }
  }

  /**
   * Handle online event
   */
  private handleOnline(): void {
    this.isOnline = true;
    loggingService.info('Connection online, syncing pending updates', 'RealTimeUpdateService');
    this.emit('online');
    this.syncPendingUpdates();
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    this.isOnline = false;
    loggingService.warn('Connection offline, queuing updates', 'RealTimeUpdateService');
    this.emit('offline');
  }

  /**
   * Get pending updates count
   */
  getPendingUpdatesCount(): number {
    return this.pendingUpdates.size;
  }

  /**
   * Get conflicts
   */
  getConflicts(): Conflict[] {
    return Array.from(this.conflicts.values());
  }

  /**
   * Manually resolve conflict
   */
  resolveConflictManually<T = any>(conflictId: string, resolution: Partial<T>): void {
    const conflict = this.conflicts.get(conflictId);

    if (!conflict) {
      throw new Error(`Conflict not found: ${conflictId}`);
    }

    conflict.resolution = resolution;
    conflict.resolvedAt = new Date();

    const resolvedUpdate: DataUpdate<T> = {
      id: crypto.randomUUID(),
      entityType: conflict.entityType,
      entityId: conflict.entityId,
      operation: 'update',
      data: resolution,
      timestamp: new Date(),
      version: Math.max(conflict.localUpdate.version, conflict.remoteUpdate.version) + 1,
      source: 'local',
    };

    this.notifySubscribers(resolvedUpdate);
    this.conflicts.delete(conflictId);

    loggingService.info(
      `Conflict manually resolved: ${conflict.entityType}:${conflict.entityId}`,
      'RealTimeUpdateService',
      { conflictId }
    );
  }

  /**
   * Shutdown service
   */
  shutdown(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    this.flushBatch();

    this.subscriptions.clear();
    this.pendingUpdates.clear();
    this.conflicts.clear();
    this.entityVersions.clear();

    loggingService.info('RealTimeUpdateService shut down', 'RealTimeUpdateService');
  }
}

export default new RealTimeUpdateService();
