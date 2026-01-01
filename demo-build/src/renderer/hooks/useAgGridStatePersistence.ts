/**
 * AG-Grid State Persistence Hook
 *
 * Saves and restores grid state (columns, filters, sorting, pagination) to localStorage.
 * Used by discovered views to remember user customizations.
 *
 * @module useAgGridStatePersistence
 */

import { useCallback, useEffect, useState, useRef } from 'react';
import type { ColumnState, FilterModel } from 'ag-grid-community';

/**
 * Sort model type for AG-Grid
 */
export interface SortModelItem {
  colId: string;
  sort: 'asc' | 'desc' | null;
}

/**
 * Persisted AG-Grid state structure
 */
export interface AgGridState {
  columnState: ColumnState[];
  filterModel: FilterModel;
  sortModel: SortModelItem[];
  paginationPageSize?: number;
  paginationCurrentPage?: number;
  /** Timestamp when state was last saved */
  savedAt?: number;
  /** Version for future migrations */
  version?: number;
}

/**
 * Return type for useAgGridStatePersistence hook
 */
export interface UseAgGridStatePersistenceReturn {
  /** Previously saved state, or null if none exists */
  savedState: AgGridState | null;
  /** Save current state (merges with existing) */
  saveState: (state: Partial<AgGridState>) => void;
  /** Clear all saved state for this key */
  clearState: () => void;
  /** Whether the saved state is valid and usable */
  isStateValid: boolean;
  /** Whether state is currently being loaded */
  isLoading: boolean;
}

/** Current version of the state schema */
const STATE_VERSION = 1;

/** Storage key prefix */
const STORAGE_PREFIX = 'aggrid-state-';

/**
 * Validate that the parsed state has the expected structure
 */
const validateState = (state: unknown): state is AgGridState => {
  if (!state || typeof state !== 'object') {
    return false;
  }

  const s = state as Record<string, unknown>;

  // columnState should be an array if present
  if (s.columnState !== undefined && !Array.isArray(s.columnState)) {
    return false;
  }

  // filterModel should be an object if present
  if (s.filterModel !== undefined && (typeof s.filterModel !== 'object' || s.filterModel === null)) {
    return false;
  }

  // sortModel should be an array if present
  if (s.sortModel !== undefined && !Array.isArray(s.sortModel)) {
    return false;
  }

  return true;
};

/**
 * Hook for persisting AG-Grid state to localStorage
 *
 * @param persistenceKey - Unique key for this grid instance (e.g., csvPath)
 * @returns Object with savedState, saveState, clearState, isStateValid, and isLoading
 *
 * @example
 * ```tsx
 * const { savedState, saveState, clearState } = useAgGridStatePersistence('EntraIDUsers.csv');
 *
 * // On grid ready, restore state
 * if (savedState?.columnState) {
 *   gridApi.applyColumnState({ state: savedState.columnState });
 * }
 *
 * // On column change, save state
 * saveState({ columnState: gridApi.getColumnState() });
 * ```
 */
export const useAgGridStatePersistence = (persistenceKey: string | undefined): UseAgGridStatePersistenceReturn => {
  const storageKey = persistenceKey ? `${STORAGE_PREFIX}${persistenceKey}` : null;

  const [savedState, setSavedState] = useState<AgGridState | null>(null);
  const [isStateValid, setIsStateValid] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Use ref to track if we've loaded initial state
  const hasLoadedRef = useRef(false);

  // Debounce save operations to avoid excessive writes
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingStateRef = useRef<Partial<AgGridState> | null>(null);

  // Load state from localStorage on mount or when key changes
  useEffect(() => {
    if (!storageKey) {
      setIsLoading(false);
      setSavedState(null);
      setIsStateValid(true);
      return;
    }

    // Avoid duplicate loads
    if (hasLoadedRef.current) {
      return;
    }

    setIsLoading(true);

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);

        if (validateState(parsed)) {
          console.log(`[AgGridStatePersistence] Loaded state for ${persistenceKey}:`, {
            hasColumnState: !!parsed.columnState?.length,
            hasFilterModel: !!parsed.filterModel && Object.keys(parsed.filterModel).length > 0,
            hasSortModel: !!parsed.sortModel?.length,
            paginationPageSize: parsed.paginationPageSize,
          });
          setSavedState(parsed);
          setIsStateValid(true);
        } else {
          console.warn(`[AgGridStatePersistence] Invalid state structure for ${persistenceKey}, ignoring`);
          setIsStateValid(false);
          setSavedState(null);
        }
      } else {
        console.log(`[AgGridStatePersistence] No saved state for ${persistenceKey}`);
        setSavedState(null);
        setIsStateValid(true);
      }
    } catch (error) {
      console.error(`[AgGridStatePersistence] Error loading state for ${persistenceKey}:`, error);
      setIsStateValid(false);
      setSavedState(null);
    } finally {
      setIsLoading(false);
      hasLoadedRef.current = true;
    }
  }, [storageKey, persistenceKey]);

  // Reset loaded flag when key changes
  useEffect(() => {
    hasLoadedRef.current = false;
  }, [storageKey]);

  /**
   * Save state with debouncing to avoid excessive localStorage writes
   */
  const saveState = useCallback((newState: Partial<AgGridState>) => {
    if (!storageKey) {
      console.warn('[AgGridStatePersistence] Cannot save state: no persistenceKey provided');
      return;
    }

    // Merge with pending state
    pendingStateRef.current = {
      ...pendingStateRef.current,
      ...newState,
    };

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce the save operation (300ms)
    saveTimeoutRef.current = setTimeout(() => {
      try {
        const currentState = savedState || {};
        const updatedState: AgGridState = {
          ...currentState,
          ...pendingStateRef.current,
          savedAt: Date.now(),
          version: STATE_VERSION,
        } as AgGridState;

        localStorage.setItem(storageKey, JSON.stringify(updatedState));
        setSavedState(updatedState);
        setIsStateValid(true);
        pendingStateRef.current = null;

        console.log(`[AgGridStatePersistence] Saved state for ${persistenceKey}`);
      } catch (error) {
        // Handle localStorage quota exceeded
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.error(`[AgGridStatePersistence] localStorage quota exceeded for ${persistenceKey}`);
          // Try to clear old states from other keys
          try {
            clearOldStates();
            // Retry save
            const currentState = savedState || {};
            const updatedState: AgGridState = {
              ...currentState,
              ...pendingStateRef.current,
              savedAt: Date.now(),
              version: STATE_VERSION,
            } as AgGridState;
            localStorage.setItem(storageKey, JSON.stringify(updatedState));
            setSavedState(updatedState);
            setIsStateValid(true);
            pendingStateRef.current = null;
          } catch (retryError) {
            console.error(`[AgGridStatePersistence] Failed to save even after clearing old states:`, retryError);
            setIsStateValid(false);
          }
        } else {
          console.error(`[AgGridStatePersistence] Error saving state for ${persistenceKey}:`, error);
          setIsStateValid(false);
        }
      }
    }, 300);
  }, [savedState, storageKey, persistenceKey]);

  /**
   * Clear saved state for this key
   */
  const clearState = useCallback(() => {
    if (!storageKey) {
      return;
    }

    // Cancel any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    pendingStateRef.current = null;

    try {
      localStorage.removeItem(storageKey);
      setSavedState(null);
      setIsStateValid(true);
      console.log(`[AgGridStatePersistence] Cleared state for ${persistenceKey}`);
    } catch (error) {
      console.error(`[AgGridStatePersistence] Error clearing state for ${persistenceKey}:`, error);
    }
  }, [storageKey, persistenceKey]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    savedState,
    saveState,
    clearState,
    isStateValid,
    isLoading,
  };
};

/**
 * Clear old AG-Grid states that haven't been accessed recently
 * Called when localStorage quota is exceeded
 */
function clearOldStates(): void {
  const now = Date.now();
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

  try {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.savedAt && now - parsed.savedAt > maxAge) {
              keysToRemove.push(key);
            }
          }
        } catch {
          // Invalid JSON, remove it
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`[AgGridStatePersistence] Cleared ${keysToRemove.length} old states`);
  } catch (error) {
    console.error('[AgGridStatePersistence] Error clearing old states:', error);
  }
}

export default useAgGridStatePersistence;


