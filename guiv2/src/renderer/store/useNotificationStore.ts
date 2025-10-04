/**
 * Notification Store
 * Zustand store for managing application notifications and toast messages
 */

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  Notification,
  NotificationType,
  NotificationOptions,
  NotificationFilterState,
  NotificationStats,
  NotificationPriority,
} from '../types/models/notification';

interface NotificationState {
  // State
  notifications: Notification[];
  toasts: Notification[];
  filter: NotificationFilterState;
  maxToasts: number;
  defaultDuration: number;
  soundEnabled: boolean;

  // Actions - Toast Management
  showSuccess: (message: string, options?: NotificationOptions) => string;
  showError: (message: string, options?: NotificationOptions) => string;
  showWarning: (message: string, options?: NotificationOptions) => string;
  showInfo: (message: string, options?: NotificationOptions) => string;
  showToast: (type: NotificationType, message: string, options?: NotificationOptions) => string;
  dismissToast: (id: string) => void;
  dismissAllToasts: () => void;

  // Actions - Notification Center
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => string;
  getNotifications: () => Notification[];
  getFilteredNotifications: () => Notification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  pinNotification: (id: string, pinned: boolean) => void;

  // Actions - Filter Management
  setFilter: (filter: Partial<NotificationFilterState>) => void;
  resetFilter: () => void;

  // Actions - Settings
  setMaxToasts: (max: number) => void;
  setDefaultDuration: (duration: number) => void;
  setSoundEnabled: (enabled: boolean) => void;

  // Getters
  getStats: () => NotificationStats;
  getUnreadCount: () => number;
}

const defaultFilter: NotificationFilterState = {
  types: [],
  priorities: [],
  categories: [],
  unreadOnly: false,
  pinnedOnly: false,
  searchText: '',
};

/**
 * Notification Store with Zustand
 */
export const useNotificationStore = create<NotificationState>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          // Initial State
          notifications: [],
          toasts: [],
          filter: defaultFilter,
          maxToasts: 5,
          defaultDuration: 5000, // 5 seconds
          soundEnabled: true,

          // ========================================
          // Toast Management
          // ========================================

          showSuccess: (message: string, options?: NotificationOptions) => {
            return get().showToast('success', message, options);
          },

          showError: (message: string, options?: NotificationOptions) => {
            return get().showToast('error', message, {
              duration: 0, // Errors don't auto-dismiss
              ...options
            });
          },

          showWarning: (message: string, options?: NotificationOptions) => {
            return get().showToast('warning', message, options);
          },

          showInfo: (message: string, options?: NotificationOptions) => {
            return get().showToast('info', message, options);
          },

          showToast: (type: NotificationType, message: string, options?: NotificationOptions) => {
            const id = generateNotificationId();
            const duration = options?.duration ?? get().defaultDuration;
            const priority = options?.priority ?? 'normal';

            const notification: Notification = {
              id,
              type,
              message,
              timestamp: new Date(),
              read: false,
              pinned: false,
              priority,
              options: {
                duration,
                position: options?.position ?? 'top-right',
                dismissible: options?.dismissible ?? true,
                showProgress: options?.showProgress ?? true,
                ...options,
              },
              isToast: true,
            };

            set((state) => {
              // Add to notifications list
              state.notifications.unshift(notification);

              // Add to toasts (limit to maxToasts)
              state.toasts.unshift(notification);
              if (state.toasts.length > state.maxToasts) {
                state.toasts = state.toasts.slice(0, state.maxToasts);
              }
            });

            // Auto-dismiss if duration > 0
            if (duration > 0) {
              setTimeout(() => {
                get().dismissToast(id);
              }, duration);
            }

            // Play sound if enabled
            if (get().soundEnabled && options?.playSound !== false) {
              playNotificationSound(type);
            }

            return id;
          },

          dismissToast: (id: string) => {
            set((state) => {
              const index = state.toasts.findIndex((t) => t.id === id);
              if (index !== -1) {
                const toast = state.toasts[index];
                toast.options?.onClose?.();
                state.toasts.splice(index, 1);
              }
            });
          },

          dismissAllToasts: () => {
            set((state) => {
              state.toasts.forEach((toast) => toast.options?.onClose?.());
              state.toasts = [];
            });
          },

          // ========================================
          // Notification Center Management
          // ========================================

          addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
            const id = generateNotificationId();
            const fullNotification: Notification = {
              ...notification,
              id,
              timestamp: new Date(),
              read: false,
            };

            set((state) => {
              state.notifications.unshift(fullNotification);
            });

            return id;
          },

          getNotifications: () => {
            return get().notifications;
          },

          getFilteredNotifications: () => {
            const { notifications, filter } = get();

            return notifications.filter((notification) => {
              // Type filter
              if (filter.types.length > 0 && !filter.types.includes(notification.type)) {
                return false;
              }

              // Priority filter
              if (filter.priorities.length > 0 && !filter.priorities.includes(notification.priority)) {
                return false;
              }

              // Category filter
              if (filter.categories.length > 0 && !filter.categories.includes(notification.category || '')) {
                return false;
              }

              // Unread filter
              if (filter.unreadOnly && notification.read) {
                return false;
              }

              // Pinned filter
              if (filter.pinnedOnly && !notification.pinned) {
                return false;
              }

              // Search filter
              if (filter.searchText) {
                const searchLower = filter.searchText.toLowerCase();
                const matchesMessage = notification.message.toLowerCase().includes(searchLower);
                const matchesTitle = notification.title?.toLowerCase().includes(searchLower);
                if (!matchesMessage && !matchesTitle) {
                  return false;
                }
              }

              return true;
            });
          },

          markAsRead: (id: string) => {
            set((state) => {
              const notification = state.notifications.find((n) => n.id === id);
              if (notification) {
                notification.read = true;
              }
            });
          },

          markAllAsRead: () => {
            set((state) => {
              state.notifications.forEach((n) => {
                n.read = true;
              });
            });
          },

          deleteNotification: (id: string) => {
            set((state) => {
              const index = state.notifications.findIndex((n) => n.id === id);
              if (index !== -1) {
                state.notifications.splice(index, 1);
              }
            });
          },

          clearAll: () => {
            set((state) => {
              state.notifications = [];
              state.toasts = [];
            });
          },

          pinNotification: (id: string, pinned: boolean) => {
            set((state) => {
              const notification = state.notifications.find((n) => n.id === id);
              if (notification) {
                notification.pinned = pinned;
              }
            });
          },

          // ========================================
          // Filter Management
          // ========================================

          setFilter: (filter: Partial<NotificationFilterState>) => {
            set((state) => {
              state.filter = { ...state.filter, ...filter };
            });
          },

          resetFilter: () => {
            set((state) => {
              state.filter = defaultFilter;
            });
          },

          // ========================================
          // Settings
          // ========================================

          setMaxToasts: (max: number) => {
            set((state) => {
              state.maxToasts = max;
              // Trim existing toasts if needed
              if (state.toasts.length > max) {
                state.toasts = state.toasts.slice(0, max);
              }
            });
          },

          setDefaultDuration: (duration: number) => {
            set((state) => {
              state.defaultDuration = duration;
            });
          },

          setSoundEnabled: (enabled: boolean) => {
            set((state) => {
              state.soundEnabled = enabled;
            });
          },

          // ========================================
          // Getters
          // ========================================

          getStats: (): NotificationStats => {
            const notifications = get().notifications;

            const stats: NotificationStats = {
              total: notifications.length,
              unread: notifications.filter((n) => !n.read).length,
              byType: {
                success: notifications.filter((n) => n.type === 'success').length,
                error: notifications.filter((n) => n.type === 'error').length,
                warning: notifications.filter((n) => n.type === 'warning').length,
                info: notifications.filter((n) => n.type === 'info').length,
              },
              byPriority: {
                low: notifications.filter((n) => n.priority === 'low').length,
                normal: notifications.filter((n) => n.priority === 'normal').length,
                high: notifications.filter((n) => n.priority === 'high').length,
                critical: notifications.filter((n) => n.priority === 'critical').length,
              },
            };

            return stats;
          },

          getUnreadCount: () => {
            return get().notifications.filter((n) => !n.read).length;
          },
        }))
      ),
      {
        name: 'NotificationStore',
        version: 1,
        partialize: (state) => ({
          notifications: state.notifications.filter((n) => n.pinned), // Only persist pinned
          filter: state.filter,
          maxToasts: state.maxToasts,
          defaultDuration: state.defaultDuration,
          soundEnabled: state.soundEnabled,
        }),
      }
    )
  )
);

// ========================================
// Helper Functions
// ========================================

/**
 * Generate unique notification ID
 */
function generateNotificationId(): string {
  return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Play notification sound based on type
 */
function playNotificationSound(type: NotificationType): void {
  // Map notification types to system sounds or custom audio files
  const soundMap: Record<NotificationType, string> = {
    success: 'success.mp3',
    error: 'error.mp3',
    warning: 'warning.mp3',
    info: 'info.mp3',
  };

  const soundFile = soundMap[type];

  // Create and play audio
  try {
    const audio = new Audio(`/sounds/${soundFile}`);
    audio.volume = 0.3; // 30% volume
    audio.play().catch((err) => {
      console.warn('Failed to play notification sound:', err);
    });
  } catch (error) {
    console.warn('Notification sound not available:', error);
  }
}
