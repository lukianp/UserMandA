/**
 * Modal Store
 *
 * Manages application-wide modal dialogs.
 * Provides centralized control for opening/closing modals with data passing.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type ModalType =
  | 'createProfile'
  | 'editProfile'
  | 'deleteConfirm'
  | 'columnVisibility'
  | 'exportData'
  | 'importData'
  | 'waveScheduling'
  | 'commandPalette'
  | 'settings'
  | 'about'
  | 'help'
  | 'error'
  | 'success'
  | 'warning'
  | 'info'
  | 'custom';

export interface Modal {
  /** Unique modal identifier */
  id: string;
  /** Modal type */
  type: ModalType;
  /** Modal title */
  title: string;
  /** Optional data to pass to modal */
  data?: any;
  /** Callback when modal is confirmed */
  onConfirm?: (result?: any) => void;
  /** Callback when modal is cancelled */
  onCancel?: () => void;
  /** Whether modal can be closed by clicking outside or pressing ESC */
  dismissable: boolean;
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Timestamp when modal was opened */
  openedAt: number;
}

interface ModalState {
  // State
  modals: Modal[];
  isCommandPaletteOpen: boolean;

  // Actions
  openModal: (modal: Omit<Modal, 'id' | 'openedAt'>) => string;
  closeModal: (modalId: string, result?: any) => void;
  closeAllModals: () => void;
  updateModal: (modalId: string, updates: Partial<Modal>) => void;
  getModal: (modalId: string) => Modal | undefined;
  getActiveModal: () => Modal | undefined;

  // Command Palette specific
  openCommandPalette: () => void;
  closeCommandPalette: () => void;

  // Convenience methods for common modal types
  showError: (title: string, message: string) => void;
  showSuccess: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const useModalStore = create<ModalState>()(
  devtools(
    (set, get) => ({
      // Initial state
      modals: [],
      isCommandPaletteOpen: false,

      // Actions

      /**
       * Open a new modal
       */
      openModal: (modalData) => {
        const modalId = crypto.randomUUID();

        const modal: Modal = {
          ...modalData,
          id: modalId,
          dismissable: modalData.dismissable !== false,
          size: modalData.size || 'md',
          openedAt: Date.now(),
        };

        set((state) => ({
          modals: [...state.modals, modal],
        }));

        return modalId;
      },

      /**
       * Close a modal by ID
       */
      closeModal: (modalId, result) => {
        const modal = get().modals.find(m => m.id === modalId);

        if (modal) {
          // Call appropriate callback
          if (result !== undefined && modal.onConfirm) {
            modal.onConfirm(result);
          } else if (result === undefined && modal.onCancel) {
            modal.onCancel();
          }
        }

        set((state) => ({
          modals: state.modals.filter(m => m.id !== modalId),
        }));
      },

      /**
       * Close all modals
       */
      closeAllModals: () => {
        // Call onCancel for all dismissable modals
        const { modals } = get();
        modals.forEach(modal => {
          if (modal.dismissable && modal.onCancel) {
            modal.onCancel();
          }
        });

        set({ modals: [] });
      },

      /**
       * Update modal properties
       */
      updateModal: (modalId, updates) => {
        set((state) => ({
          modals: state.modals.map(m =>
            m.id === modalId ? { ...m, ...updates } : m
          ),
        }));
      },

      /**
       * Get a modal by ID
       */
      getModal: (modalId) => {
        return get().modals.find(m => m.id === modalId);
      },

      /**
       * Get the currently active (topmost) modal
       */
      getActiveModal: () => {
        const { modals } = get();
        return modals.length > 0 ? modals[modals.length - 1] : undefined;
      },

      /**
       * Open command palette
       */
      openCommandPalette: () => {
        set({ isCommandPaletteOpen: true });
      },

      /**
       * Close command palette
       */
      closeCommandPalette: () => {
        set({ isCommandPaletteOpen: false });
      },

      /**
       * Show error modal
       */
      showError: (title, message) => {
        get().openModal({
          type: 'error',
          title,
          data: { message },
          dismissable: true,
          size: 'md',
        });
      },

      /**
       * Show success modal
       */
      showSuccess: (title, message) => {
        get().openModal({
          type: 'success',
          title,
          data: { message },
          dismissable: true,
          size: 'md',
        });
      },

      /**
       * Show warning modal
       */
      showWarning: (title, message) => {
        get().openModal({
          type: 'warning',
          title,
          data: { message },
          dismissable: true,
          size: 'md',
        });
      },

      /**
       * Show info modal
       */
      showInfo: (title, message) => {
        get().openModal({
          type: 'info',
          title,
          data: { message },
          dismissable: true,
          size: 'md',
        });
      },

      /**
       * Show confirmation dialog
       */
      showConfirm: (title, message, onConfirm) => {
        get().openModal({
          type: 'deleteConfirm',
          title,
          data: { message },
          onConfirm,
          dismissable: true,
          size: 'sm',
        });
      },
    }),
    {
      name: 'ModalStore',
    }
  )
);
