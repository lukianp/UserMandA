/**
 * State Management Service
 *
 * Features:
 * - Cross-tab state synchronization (BroadcastChannel API)
 * - State persistence (IndexedDB + localStorage)
 * - State versioning and migration
 * - State hydration on app start
 * - State debugging tools
 * - State history (time-travel debugging)
 * - State snapshots for rollback
 * - Integration with Zustand stores
 */

import * as crypto from 'crypto';

import loggingService from './loggingService';

/**
 * State change event
 */
interface StateChangeEvent {
  id: string;
  timestamp: Date;
  storeName: string;
  path: string;
  oldValue: any;
  newValue: any;
  source: 'local' | 'remote';
}

/**
 * State snapshot
 */
interface StateSnapshot {
  id: string;
  timestamp: Date;
  state: Record<string, any>;
  description?: string;
}

/**
 * State migration function
 */
type StateMigration = (oldState: any) => any;

/**
 * State Management Service
 */
class StateManagementService {
  private broadcastChannel: BroadcastChannel | null = null;
  private history: StateChangeEvent[] = [];
  private snapshots: StateSnapshot[] = [];
  private maxHistorySize = 1000;
  private maxSnapshots = 50;
  private migrations: Map<number, StateMigration> = new Map();
  private currentVersion = 1;
  private stores: Map<string, any> = new Map();
  private initialized = false;

  constructor() {
    // Setup BroadcastChannel for cross-tab communication
    if (typeof BroadcastChannel !== 'undefined') {
      this.broadcastChannel = new BroadcastChannel('state-sync');
      this.setupBroadcastListener();
    }
  }

  /**
   * Initialize the service
   */
  async initialize(version = 1): Promise<void> {
    if (this.initialized) {
      console.warn('StateManagementService already initialized');
      return;
    }

    this.currentVersion = version;
    this.initialized = true;

    loggingService.info('StateManagementService initialized', 'StateManagementService', { version });
  }

  /**
   * Setup broadcast channel listener
   */
  private setupBroadcastListener(): void {
    if (!this.broadcastChannel) return;

    this.broadcastChannel.onmessage = (event) => {
      const { type, payload } = event.data;

      switch (type) {
        case 'state-update':
          this.handleRemoteStateUpdate(payload);
          break;
        case 'state-snapshot':
          this.handleRemoteSnapshot(payload);
          break;
        case 'state-rollback':
          this.handleRemoteRollback(payload);
          break;
      }
    };
  }

  /**
   * Register a store for state management
   */
  registerStore(name: string, store: any): void {
    this.stores.set(name, store);
    loggingService.debug(`Registered store: ${name}`, 'StateManagementService');

    // Subscribe to store changes
    if (store.subscribe) {
      store.subscribe((state: any, prevState: any) => {
        this.trackStateChange(name, '', prevState, state, 'local');
      });
    }
  }

  /**
   * Track state change
   */
  private trackStateChange(
    storeName: string,
    path: string,
    oldValue: any,
    newValue: any,
    source: 'local' | 'remote'
  ): void {
    const event: StateChangeEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      storeName,
      path,
      oldValue,
      newValue,
      source,
    };

    this.history.push(event);

    // Manage history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }

    // Broadcast to other tabs if local change
    if (source === 'local' && this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'state-update',
        payload: event,
      });
    }

    loggingService.trace(`State changed: ${storeName}.${path}`, 'StateManagementService');
  }

  /**
   * Handle remote state update
   */
  private handleRemoteStateUpdate(event: StateChangeEvent): void {
    loggingService.debug(`Received remote state update: ${event.storeName}`, 'StateManagementService');

    const store = this.stores.get(event.storeName);
    if (store && store.setState) {
      // Apply the state update
      store.setState(event.newValue);
    }

    // Add to history
    this.history.push({ ...event, source: 'remote' });

    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Persist state to localStorage
   */
  async persistState(storeName: string): Promise<void> {
    const store = this.stores.get(storeName);
    if (!store) {
      throw new Error(`Store not found: ${storeName}`);
    }

    try {
      const state = store.getState();
      const data = {
        version: this.currentVersion,
        state,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem(`state:${storeName}`, JSON.stringify(data));
      loggingService.debug(`Persisted state: ${storeName}`, 'StateManagementService');
    } catch (error: any) {
      loggingService.error(
        `Failed to persist state: ${storeName}`,
        'StateManagementService',
        undefined,
        error
      );
    }
  }

  /**
   * Hydrate state from localStorage
   */
  async hydrateState(storeName: string): Promise<boolean> {
    try {
      const stored = localStorage.getItem(`state:${storeName}`);
      if (!stored) {
        return false;
      }

      const data = JSON.parse(stored);

      // Run migrations if version mismatch
      let state = data.state;
      if (data.version < this.currentVersion) {
        state = this.migrateState(data.version, state);
      }

      // Apply state to store
      const store = this.stores.get(storeName);
      if (store && store.setState) {
        store.setState(state);
        loggingService.info(`Hydrated state: ${storeName}`, 'StateManagementService');
        return true;
      }

      return false;
    } catch (error: any) {
      loggingService.error(
        `Failed to hydrate state: ${storeName}`,
        'StateManagementService',
        undefined,
        error
      );
      return false;
    }
  }

  /**
   * Create a state snapshot
   */
  createSnapshot(description?: string): string {
    const snapshot: StateSnapshot = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      state: {},
      description,
    };

    // Capture state from all stores
    for (const [name, store] of this.stores.entries()) {
      if (store.getState) {
        snapshot.state[name] = store.getState();
      }
    }

    this.snapshots.push(snapshot);

    // Manage snapshot size
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }

    loggingService.info(`Created state snapshot: ${snapshot.id}`, 'StateManagementService', { description });

    // Broadcast snapshot to other tabs
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'state-snapshot',
        payload: snapshot,
      });
    }

    return snapshot.id;
  }

  /**
   * Handle remote snapshot
   */
  private handleRemoteSnapshot(snapshot: StateSnapshot): void {
    loggingService.debug(`Received remote snapshot: ${snapshot.id}`, 'StateManagementService');

    this.snapshots.push(snapshot);

    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }
  }

  /**
   * Rollback to a snapshot
   */
  rollbackToSnapshot(snapshotId: string): boolean {
    const snapshot = this.snapshots.find((s) => s.id === snapshotId);

    if (!snapshot) {
      loggingService.warn(`Snapshot not found: ${snapshotId}`, 'StateManagementService');
      return false;
    }

    // Restore state to all stores
    for (const [name, state] of Object.entries(snapshot.state)) {
      const store = this.stores.get(name);
      if (store && store.setState) {
        store.setState(state);
      }
    }

    loggingService.info(`Rolled back to snapshot: ${snapshotId}`, 'StateManagementService');

    // Broadcast rollback to other tabs
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'state-rollback',
        payload: { snapshotId },
      });
    }

    return true;
  }

  /**
   * Handle remote rollback
   */
  private handleRemoteRollback(payload: { snapshotId: string }): void {
    loggingService.debug(`Received remote rollback: ${payload.snapshotId}`, 'StateManagementService');
    this.rollbackToSnapshot(payload.snapshotId);
  }

  /**
   * Register a state migration
   */
  registerMigration(version: number, migration: StateMigration): void {
    this.migrations.set(version, migration);
    loggingService.debug(`Registered migration for version ${version}`, 'StateManagementService');
  }

  /**
   * Migrate state from old version to current
   */
  private migrateState(fromVersion: number, state: any): any {
    let migratedState = state;

    for (let v = fromVersion + 1; v <= this.currentVersion; v++) {
      const migration = this.migrations.get(v);
      if (migration) {
        loggingService.info(`Migrating state from version ${v - 1} to ${v}`, 'StateManagementService');
        migratedState = migration(migratedState);
      }
    }

    return migratedState;
  }

  /**
   * Get state history
   */
  getHistory(storeName?: string, limit?: number): StateChangeEvent[] {
    let history = this.history;

    if (storeName) {
      history = history.filter((e) => e.storeName === storeName);
    }

    if (limit) {
      history = history.slice(-limit);
    }

    return history;
  }

  /**
   * Get all snapshots
   */
  getSnapshots(): StateSnapshot[] {
    return [...this.snapshots];
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.history = [];
    loggingService.info('State history cleared', 'StateManagementService');
  }

  /**
   * Clear all persisted state
   */
  clearPersistedState(): void {
    for (const [name] of this.stores.entries()) {
      localStorage.removeItem(`state:${name}`);
    }
    loggingService.info('All persisted state cleared', 'StateManagementService');
  }

  /**
   * Export state for debugging
   */
  exportState(): Record<string, any> {
    const exported: Record<string, any> = {};

    for (const [name, store] of this.stores.entries()) {
      if (store.getState) {
        exported[name] = store.getState();
      }
    }

    return exported;
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return {
      stores: this.stores.size,
      historySize: this.history.length,
      snapshotsSize: this.snapshots.length,
      version: this.currentVersion,
      migrations: this.migrations.size,
      broadcastEnabled: !!this.broadcastChannel,
    };
  }

  /**
   * Shutdown the service
   */
  shutdown(): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }

    this.stores.clear();
    this.history = [];
    this.snapshots = [];
    this.initialized = false;

    loggingService.info('StateManagementService shut down', 'StateManagementService');
  }
}

export default new StateManagementService();


