/**
 * Discovery Store
 *
 * Manages discovery operations, results, and state.
 * Handles domain, network, user, and application discovery processes.
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { DiscoveryResult, DiscoveryType, DiscoveryStatus } from '../types/models/discovery';

export interface DiscoveryOperation {
  /** Unique operation identifier */
  id: string;
  /** Discovery type */
  type: DiscoveryType;
  /** Operation status */
  status: DiscoveryStatus;
  /** Progress percentage (0-100) */
  progress: number;
  /** Current operation message */
  message: string;
  /** Items discovered so far */
  itemsDiscovered: number;
  /** Start timestamp */
  startedAt: number;
  /** Completion timestamp */
  completedAt?: number;
  /** Error message if failed */
  error?: string;
  /** Cancellation token */
  cancellationToken: string;
}

interface DiscoveryState {
  // State
  operations: Map<string, DiscoveryOperation>;
  results: Map<string, DiscoveryResult[]>;
  selectedOperation: string | null;
  isDiscovering: boolean;

  // Actions
  startDiscovery: (type: DiscoveryType, parameters: Record<string, any>) => Promise<string>;
  cancelDiscovery: (operationId: string) => Promise<void>;
  updateProgress: (operationId: string, progress: number, message: string) => void;
  completeDiscovery: (operationId: string, results: DiscoveryResult[]) => void;
  failDiscovery: (operationId: string, error: string) => void;
  clearOperation: (operationId: string) => void;
  clearAllOperations: () => void;
  getOperation: (operationId: string) => DiscoveryOperation | undefined;
  getResults: (operationId: string) => DiscoveryResult[] | undefined;
}

export const useDiscoveryStore = create<DiscoveryState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      operations: new Map(),
      results: new Map(),
      selectedOperation: null,
      isDiscovering: false,

      // Actions

      /**
       * Start a new discovery operation
       */
      startDiscovery: async (type, parameters) => {
        const operationId = crypto.randomUUID();
        const cancellationToken = crypto.randomUUID();

        const operation: DiscoveryOperation = {
          id: operationId,
          type,
          status: 'running',
          progress: 0,
          message: 'Initializing discovery...',
          itemsDiscovered: 0,
          startedAt: Date.now(),
          cancellationToken,
        };

        // Add operation to state
        set((state) => {
          const newOperations = new Map(state.operations);
          newOperations.set(operationId, operation);
          return {
            operations: newOperations,
            selectedOperation: operationId,
            isDiscovering: true,
          };
        });

        // Setup progress listener
        const progressCleanup = window.electronAPI.onProgress((data) => {
          if (data.executionId === cancellationToken) {
            get().updateProgress(operationId, data.percentage, data.message);
          }
        });

        try {
          // Execute discovery module
          const result = await window.electronAPI.executeModule({
            modulePath: `Modules/Discovery/${type}.psm1`,
            functionName: `Start-${type}Discovery`,
            parameters,
            options: {
              cancellationToken,
              streamOutput: true,
              timeout: 300000, // 5 minutes
            },
          });

          // Cleanup progress listener
          progressCleanup();

          if (result.success) {
            get().completeDiscovery(operationId, result.data?.results || []);
          } else {
            get().failDiscovery(operationId, result.error || 'Discovery failed');
          }
        } catch (error: any) {
          progressCleanup();
          get().failDiscovery(operationId, error.message || 'Discovery failed');
        }

        return operationId;
      },

      /**
       * Cancel a running discovery operation
       */
      cancelDiscovery: async (operationId) => {
        const operation = get().operations.get(operationId);
        if (!operation || operation.status !== 'running') {
          return;
        }

        try {
          await window.electronAPI.cancelExecution(operation.cancellationToken);

          set((state) => {
            const newOperations = new Map(state.operations);
            const op = newOperations.get(operationId);
            if (op) {
              op.status = 'cancelled';
              op.message = 'Discovery cancelled by user';
              op.completedAt = Date.now();
            }
            return {
              operations: newOperations,
              isDiscovering: Array.from(newOperations.values()).some(o => o.status === 'running'),
            };
          });
        } catch (error: any) {
          console.error('Failed to cancel discovery:', error);
        }
      },

      /**
       * Update progress for a running operation
       */
      updateProgress: (operationId, progress, message) => {
        set((state) => {
          const newOperations = new Map(state.operations);
          const operation = newOperations.get(operationId);

          if (operation && operation.status === 'running') {
            operation.progress = progress;
            operation.message = message;
          }

          return { operations: newOperations };
        });
      },

      /**
       * Mark operation as completed with results
       */
      completeDiscovery: (operationId, results) => {
        set((state) => {
          const newOperations = new Map(state.operations);
          const newResults = new Map(state.results);

          const operation = newOperations.get(operationId);
          if (operation) {
            operation.status = 'completed';
            operation.progress = 100;
            operation.message = `Discovered ${results.length} items`;
            operation.itemsDiscovered = results.length;
            operation.completedAt = Date.now();
          }

          newResults.set(operationId, results);

          return {
            operations: newOperations,
            results: newResults,
            isDiscovering: Array.from(newOperations.values()).some(o => o.status === 'running'),
          };
        });
      },

      /**
       * Mark operation as failed
       */
      failDiscovery: (operationId, error) => {
        set((state) => {
          const newOperations = new Map(state.operations);
          const operation = newOperations.get(operationId);

          if (operation) {
            operation.status = 'failed';
            operation.error = error;
            operation.message = `Discovery failed: ${error}`;
            operation.completedAt = Date.now();
          }

          return {
            operations: newOperations,
            isDiscovering: Array.from(newOperations.values()).some(o => o.status === 'running'),
          };
        });
      },

      /**
       * Clear a single operation and its results
       */
      clearOperation: (operationId) => {
        set((state) => {
          const newOperations = new Map(state.operations);
          const newResults = new Map(state.results);

          newOperations.delete(operationId);
          newResults.delete(operationId);

          return {
            operations: newOperations,
            results: newResults,
            selectedOperation: state.selectedOperation === operationId ? null : state.selectedOperation,
          };
        });
      },

      /**
       * Clear all operations and results
       */
      clearAllOperations: () => {
        // Only clear completed, failed, or cancelled operations
        set((state) => {
          const newOperations = new Map(state.operations);
          const newResults = new Map(state.results);

          for (const [id, operation] of newOperations.entries()) {
            if (operation.status !== 'running') {
              newOperations.delete(id);
              newResults.delete(id);
            }
          }

          return {
            operations: newOperations,
            results: newResults,
          };
        });
      },

      /**
       * Get a specific operation
       */
      getOperation: (operationId) => {
        return get().operations.get(operationId);
      },

      /**
       * Get results for a specific operation
       */
      getResults: (operationId) => {
        return get().results.get(operationId);
      },
    })),
    {
      name: 'DiscoveryStore',
    }
  )
);
