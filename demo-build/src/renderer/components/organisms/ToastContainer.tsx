/**
 * Toast Container
 * Container component that displays all active toast notifications
 */

import React from 'react';

import { useNotificationStore } from '../../store/useNotificationStore';
import { Toast } from '../molecules/Toast';
import { NotificationPosition } from '../../types/models/notification';

interface ToastContainerProps {
  position?: NotificationPosition;
}

const positionClasses: Record<NotificationPosition, string> = {
  'top-left': 'top-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
};

/**
 * Toast Container Component
 * Automatically displays all active toasts from the notification store
 */
export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
}) => {
  const toasts = useNotificationStore((state) => state.toasts);
  const dismissToast = useNotificationStore((state) => state.dismissToast);

  // Group toasts by position
  const toastsByPosition: Record<NotificationPosition, typeof toasts> = {
    'top-left': [],
    'top-center': [],
    'top-right': [],
    'bottom-left': [],
    'bottom-center': [],
    'bottom-right': [],
  };

  toasts.forEach((toast) => {
    const toastPosition = toast.options?.position ?? position;
    toastsByPosition[toastPosition].push(toast);
  });

  return (
    <>
      {Object.entries(toastsByPosition).map(([pos, positionToasts]) => {
        if (positionToasts.length === 0) return null;

        return (
          <div
            key={pos}
            className={`fixed z-[9999] ${positionClasses[pos as NotificationPosition]}`}
            data-cy={`toast-container-${pos}`}
          >
            {positionToasts.map((toast) => (
              <Toast
                key={toast.id}
                notification={toast}
                onDismiss={dismissToast}
              />
            ))}
          </div>
        );
      })}
    </>
  );
};


