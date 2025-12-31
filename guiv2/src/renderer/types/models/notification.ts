/**
 * Notification Types
 * Complete type definitions for the notification system
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type NotificationPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

/**
 * Toast Notification Options
 */
export interface NotificationOptions {
  /** Duration in milliseconds before auto-dismiss (0 = no auto-dismiss) */
  duration?: number;
  /** Position on screen */
  position?: NotificationPosition;
  /** Whether notification can be dismissed */
  dismissible?: boolean;
  /** Whether to show progress bar */
  showProgress?: boolean;
  /** Priority level */
  priority?: NotificationPriority;
  /** Action buttons */
  actions?: NotificationAction[];
  /** Icon to display */
  icon?: React.ReactNode;
  /** Whether to play sound */
  playSound?: boolean;
  /** Sound file to play */
  soundFile?: string;
  /** Custom CSS class */
  className?: string;
  /** Click handler */
  onClick?: () => void;
  /** Close handler */
  onClose?: () => void;
}

/**
 * Notification Action Button
 */
export interface NotificationAction {
  /** Button label */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Whether action dismisses notification */
  dismissOnClick?: boolean;
}

/**
 * Notification Data Structure
 */
export interface Notification {
  /** Unique notification ID */
  id: string;
  /** Notification type */
  type: NotificationType;
  /** Notification title */
  title?: string;
  /** Notification message */
  message: string;
  /** Creation timestamp */
  timestamp: Date;
  /** Whether notification has been read */
  read: boolean;
  /** Whether notification is pinned */
  pinned: boolean;
  /** Notification priority */
  priority: NotificationPriority;
  /** Notification category (for filtering) */
  category?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
  /** Display options */
  options?: NotificationOptions;
  /** Whether currently displayed as toast */
  isToast?: boolean;
}

/**
 * Notification Center Filter State
 */
export interface NotificationFilterState {
  /** Filter by type */
  types: NotificationType[];
  /** Filter by priority */
  priorities: NotificationPriority[];
  /** Filter by category */
  categories: string[];
  /** Show only unread */
  unreadOnly: boolean;
  /** Show only pinned */
  pinnedOnly: boolean;
  /** Search text */
  searchText: string;
}

/**
 * Notification Statistics
 */
export interface NotificationStats {
  /** Total notifications */
  total: number;
  /** Unread count */
  unread: number;
  /** Count by type */
  byType: Record<NotificationType, number>;
  /** Count by priority */
  byPriority: Record<NotificationPriority, number>;
}

/**
 * System Tray Notification Options
 */
export interface SystemNotificationOptions {
  /** Notification title */
  title: string;
  /** Notification body */
  body: string;
  /** Icon path or URL */
  icon?: string;
  /** Silent notification (no sound) */
  silent?: boolean;
  /** Click handler */
  onClick?: () => void;
}


