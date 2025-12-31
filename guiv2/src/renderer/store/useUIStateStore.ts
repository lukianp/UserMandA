/**
 * UI State Store
 *
 * Global state management for UI components like LoadingOverlay.
 * Uses Zustand for lightweight state management.
 *
 * Epic 0: UI/UX Parity - Supports LoadingOverlay component
 *
 * @example
 * ```tsx
 * const { showLoading, hideLoading } = useUIStateStore();
 *
 * // Show loading overlay
 * showLoading('Discovering users...', 45);
 *
 * // Hide loading overlay
 * hideLoading();
 * ```
 */

import { create } from 'zustand';

export interface LoadingState {
  /** Whether loading overlay is visible */
  isLoading: boolean;
  /** Loading message */
  message: string;
  /** Progress percentage (0-100) */
  progress?: number;
  /** Show cancel button */
  showCancel: boolean;
  /** Cancel handler */
  onCancel?: () => void;
}

interface UIStateStore {
  /** Loading overlay state */
  loading: LoadingState;

  /** Show loading overlay */
  showLoading: (message?: string, progress?: number, options?: {
    showCancel?: boolean;
    onCancel?: () => void;
  }) => void;

  /** Update loading progress */
  updateProgress: (progress: number) => void;

  /** Update loading message */
  updateMessage: (message: string) => void;

  /** Hide loading overlay */
  hideLoading: () => void;

  /** Set loading state directly */
  setLoading: (state: Partial<LoadingState>) => void;
}

/**
 * UI State Store
 *
 * Global state for UI components like modals, overlays, and notifications.
 */
export const useUIStateStore = create<UIStateStore>((set) => ({
  loading: {
    isLoading: false,
    message: 'Loading...',
    progress: undefined,
    showCancel: false,
    onCancel: undefined,
  },

  showLoading: (message = 'Loading...', progress, options = {}) => {
    set({
      loading: {
        isLoading: true,
        message,
        progress,
        showCancel: options.showCancel ?? false,
        onCancel: options.onCancel,
      },
    });
  },

  updateProgress: (progress) => {
    set((state) => ({
      loading: {
        ...state.loading,
        progress,
      },
    }));
  },

  updateMessage: (message) => {
    set((state) => ({
      loading: {
        ...state.loading,
        message,
      },
    }));
  },

  hideLoading: () => {
    set({
      loading: {
        isLoading: false,
        message: 'Loading...',
        progress: undefined,
        showCancel: false,
        onCancel: undefined,
      },
    });
  },

  setLoading: (state) => {
    set((prevState) => ({
      loading: {
        ...prevState.loading,
        ...state,
      },
    }));
  },
}));

export default useUIStateStore;


