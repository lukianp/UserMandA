/**
 * Notification Service
 * Centralized notification management with toast notifications and system tray integration
 */

import { useNotificationStore } from '../store/useNotificationStore';
import type {
  Notification,
  NotificationOptions,
  NotificationType,
  SystemNotificationOptions,
} from '../types/models/notification';

/**
 * Notification Service Class
 * Provides a class-based API for notification management
 */
class NotificationService {
  private store = useNotificationStore;

  // ========================================
  // Toast Notifications
  // ========================================

  /**
   * Show a success toast notification
   */
  showSuccess(message: string, options?: NotificationOptions): string {
    return this.store.getState().showSuccess(message, options);
  }

  /**
   * Show an error toast notification
   */
  showError(message: string, options?: NotificationOptions): string {
    return this.store.getState().showError(message, options);
  }

  /**
   * Show a warning toast notification
   */
  showWarning(message: string, options?: NotificationOptions): string {
    return this.store.getState().showWarning(message, options);
  }

  /**
   * Show an info toast notification
   */
  showInfo(message: string, options?: NotificationOptions): string {
    return this.store.getState().showInfo(message, options);
  }

  /**
   * Show a toast notification with custom type
   */
  showToast(type: NotificationType, message: string, options?: NotificationOptions): string {
    return this.store.getState().showToast(type, message, options);
  }

  /**
   * Dismiss a specific toast
   */
  dismissToast(id: string): void {
    this.store.getState().dismissToast(id);
  }

  /**
   * Dismiss all active toasts
   */
  dismissAllToasts(): void {
    this.store.getState().dismissAllToasts();
  }

  // ========================================
  // Notification Center
  // ========================================

  /**
   * Add a notification to the notification center
   */
  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): string {
    return this.store.getState().addNotification(notification);
  }

  /**
   * Get all notifications
   */
  getNotifications(): Notification[] {
    return this.store.getState().getNotifications();
  }

  /**
   * Get filtered notifications
   */
  getFilteredNotifications(): Notification[] {
    return this.store.getState().getFilteredNotifications();
  }

  /**
   * Mark a notification as read
   */
  markAsRead(id: string): void {
    this.store.getState().markAsRead(id);
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.store.getState().markAllAsRead();
  }

  /**
   * Delete a notification
   */
  deleteNotification(id: string): void {
    this.store.getState().deleteNotification(id);
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.store.getState().clearAll();
  }

  /**
   * Pin/unpin a notification
   */
  pinNotification(id: string, pinned: boolean): void {
    this.store.getState().pinNotification(id, pinned);
  }

  /**
   * Get notification statistics
   */
  getStats() {
    return this.store.getState().getStats();
  }

  /**
   * Get unread notification count
   */
  getUnreadCount(): number {
    return this.store.getState().getUnreadCount();
  }

  // ========================================
  // System Tray Notifications (Electron)
  // ========================================

  /**
   * Show a system tray notification (Electron native)
   */
  async showSystemNotification(options: SystemNotificationOptions): Promise<void> {
    const { title, body, icon, silent, onClick } = options;

    // Check if Notification API is available
    if (!('Notification' in window)) {
      console.warn('System notifications not supported in this environment');
      return;
    }

    // Request permission if needed
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return;
      }
    }

    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: icon || '/icon.png',
        silent: silent ?? false,
        tag: 'manda-discovery', // Prevents duplicate notifications
      });

      if (onClick) {
        notification.onclick = onClick;
      }

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }
  }

  /**
   * Show system notification for success
   */
  async showSystemSuccess(title: string, body: string): Promise<void> {
    await this.showSystemNotification({
      title,
      body,
      icon: '/icons/success.png',
    });
  }

  /**
   * Show system notification for error
   */
  async showSystemError(title: string, body: string): Promise<void> {
    await this.showSystemNotification({
      title,
      body,
      icon: '/icons/error.png',
      silent: false,
    });
  }

  /**
   * Show system notification for warning
   */
  async showSystemWarning(title: string, body: string): Promise<void> {
    await this.showSystemNotification({
      title,
      body,
      icon: '/icons/warning.png',
    });
  }

  /**
   * Show system notification for info
   */
  async showSystemInfo(title: string, body: string): Promise<void> {
    await this.showSystemNotification({
      title,
      body,
      icon: '/icons/info.png',
    });
  }

  // ========================================
  // Convenience Methods
  // ========================================

  /**
   * Show notification for PowerShell execution completion
   */
  notifyExecutionComplete(scriptName: string, success: boolean, duration: number): string {
    const message = success
      ? `Script "${scriptName}" completed successfully in ${(duration / 1000).toFixed(1)}s`
      : `Script "${scriptName}" failed`;

    const type: NotificationType = success ? 'success' : 'error';

    return this.showToast(type, message, {
      duration: success ? 5000 : 0, // Errors don't auto-dismiss
      actions: success
        ? []
        : [
            {
              label: 'View Details',
              onClick: () => {
                // Navigate to execution log or show details
                console.log('View execution details');
              },
              variant: 'primary',
              dismissOnClick: true,
            },
          ],
    });
  }

  /**
   * Show notification for discovery completion
   */
  notifyDiscoveryComplete(discoveryType: string, itemsFound: number): string {
    return this.showSuccess(
      `${discoveryType} discovery complete: ${itemsFound} items found`,
      {
        duration: 7000,
        actions: [
          {
            label: 'View Results',
            onClick: () => {
              // Navigate to discovery results
              console.log('Navigate to discovery results');
            },
            variant: 'primary',
            dismissOnClick: true,
          },
        ],
      }
    );
  }

  /**
   * Show notification for migration progress
   */
  notifyMigrationProgress(waveName: string, progress: number, status: string): string {
    const message = `Migration wave "${waveName}": ${progress}% complete`;

    return this.showInfo(message, {
      duration: 0, // Don't auto-dismiss during migration
      showProgress: true,
      actions: [
        {
          label: 'View Details',
          onClick: () => {
            // Navigate to migration execution view
            console.log('Navigate to migration view');
          },
          variant: 'primary',
          dismissOnClick: false, // Keep notification open
        },
      ],
    });
  }

  /**
   * Show notification for validation errors
   */
  notifyValidationErrors(errorCount: number, context: string): string {
    return this.showError(
      `${errorCount} validation error${errorCount > 1 ? 's' : ''} found in ${context}`,
      {
        duration: 0,
        actions: [
          {
            label: 'Fix Errors',
            onClick: () => {
              // Navigate to validation view
              console.log('Navigate to validation view');
            },
            variant: 'danger',
            dismissOnClick: true,
          },
        ],
      }
    );
  }

  /**
   * Subscribe to store changes
   */
  subscribe(callback: (state: ReturnType<typeof this.store.getState>) => void) {
    return this.store.subscribe(callback);
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Export class for testing or custom instances
export default NotificationService;
