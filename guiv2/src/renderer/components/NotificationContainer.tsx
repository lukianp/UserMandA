/**
 * Notification Container Component
 *
 * Displays toast notifications in the UI.
 */

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { getNotificationService, Notification, NotificationType } from '../services/notificationService';

export const NotificationContainer: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const notificationService = getNotificationService();

    const unsubscribe = notificationService.subscribe((notification) => {
      setNotifications(prev => [...prev, notification]);
    });

    return unsubscribe;
  }, []);

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    getNotificationService().dismiss(id);
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case NotificationType.ERROR:
        return <XCircle className="w-5 h-5 text-red-500" />;
      case NotificationType.WARNING:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case NotificationType.INFO:
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBackgroundClass = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case NotificationType.ERROR:
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case NotificationType.WARNING:
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case NotificationType.INFO:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  const getTextClass = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return 'text-green-800 dark:text-green-200';
      case NotificationType.ERROR:
        return 'text-red-800 dark:text-red-200';
      case NotificationType.WARNING:
        return 'text-yellow-800 dark:text-yellow-200';
      case NotificationType.INFO:
        return 'text-blue-800 dark:text-blue-200';
      default:
        return 'text-gray-800 dark:text-gray-200';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-slide-in-right ${getBackgroundClass(notification.type)}`}
          role="alert"
        >
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(notification.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-semibold ${getTextClass(notification.type)}`}>
              {notification.title}
            </h4>
            <p className={`text-sm mt-1 whitespace-pre-line ${getTextClass(notification.type)}`}>
              {notification.message}
            </p>

            {/* Action Button */}
            {notification.action && (
              <button
                onClick={() => {
                  notification.action?.onClick();
                  handleDismiss(notification.id);
                }}
                className={`text-sm font-medium mt-2 underline ${getTextClass(notification.type)} hover:opacity-80`}
              >
                {notification.action.label}
              </button>
            )}
          </div>

          {/* Dismiss Button */}
          {notification.dismissible && (
            <button
              onClick={() => handleDismiss(notification.id)}
              className={`flex-shrink-0 ${getTextClass(notification.type)} hover:opacity-80`}
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
