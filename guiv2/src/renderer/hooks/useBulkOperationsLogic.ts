import { useState, useCallback } from 'react';

export interface BulkOperation {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  affectedItems: number;
  startTime?: Date;
  endTime?: Date;
  error?: string;
}

export interface BulkOperationsLogicReturn {
  operations: BulkOperation[];
  selectedItems: string[];
  isLoading: boolean;
  error: string | null;
  selectItem: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  startOperation: (name: string, items: string[]) => Promise<void>;
  cancelOperation: (id: string) => void;
  retryOperation: (id: string) => void;
  clearCompleted: () => void;
  refreshOperations: () => void;
}

export function useBulkOperationsLogic(): BulkOperationsLogicReturn {
  const [operations, setOperations] = useState<BulkOperation[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectItem = useCallback((id: string) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedItems(['item-1', 'item-2', 'item-3']); // Mock items
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const startOperation = useCallback(async (name: string, items: string[]) => {
    setIsLoading(true);
    setError(null);

    const operation: BulkOperation = {
      id: `op-${Date.now()}`,
      name,
      description: `Bulk operation on ${items.length} items`,
      status: 'pending',
      progress: 0,
      affectedItems: items.length,
      startTime: new Date(),
    };

    setOperations(prev => [...prev, operation]);

    // Simulate operation progress
    setTimeout(() => {
      setOperations(prev =>
        prev.map(op =>
          op.id === operation.id
            ? { ...op, status: 'running', progress: 25 }
            : op
        )
      );

      setTimeout(() => {
        setOperations(prev =>
          prev.map(op =>
            op.id === operation.id
              ? { ...op, status: 'completed', progress: 100, endTime: new Date() }
              : op
          )
        );
        setIsLoading(false);
      }, 2000);
    }, 500);
  }, []);

  const cancelOperation = useCallback((id: string) => {
    setOperations(prev =>
      prev.map(op =>
        op.id === id
          ? { ...op, status: 'failed', error: 'Cancelled by user' }
          : op
      )
    );
  }, []);

  const retryOperation = useCallback((id: string) => {
    setOperations(prev =>
      prev.map(op =>
        op.id === id
          ? { ...op, status: 'pending', progress: 0, error: undefined }
          : op
      )
    );
  }, []);

  const clearCompleted = useCallback(() => {
    setOperations(prev => prev.filter(op => op.status !== 'completed'));
  }, []);

  const refreshOperations = useCallback(() => {
    // Mock refresh
  }, []);

  return {
    operations,
    selectedItems,
    isLoading,
    error,
    selectItem,
    selectAll,
    clearSelection,
    startOperation,
    cancelOperation,
    retryOperation,
    clearCompleted,
    refreshOperations,
  };
}