/**
 * Toast Component
 * Individual toast notification with animations and actions
 */

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { Notification } from '../../types/models/notification';
import { Button } from '../atoms/Button';

interface ToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconColorMap = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

const progressColorMap = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-yellow-500',
  info: 'bg-blue-500',
};

export const Toast: React.FC<ToastProps> = ({ notification, onDismiss }) => {
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);

  const Icon = notification.options?.icon || iconMap[notification.type];
  const duration = notification.options?.duration ?? 0;
  const showProgress = notification.options?.showProgress ?? true;

  useEffect(() => {
    if (duration > 0) {
      const interval = 50; // Update every 50ms
      const decrement = (100 / duration) * interval;

      const timer = setInterval(() => {
        setProgress((prev) => {
          const next = prev - decrement;
          return next <= 0 ? 0 : next;
        });
      }, interval);

      return () => clearInterval(timer);
    }
  }, [duration]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300); // Match animation duration
  };

  const handleClick = () => {
    notification.options?.onClick?.();
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg border-2 shadow-lg p-4 mb-3 min-w-[320px] max-w-md
        transition-all duration-300 ease-in-out
        ${colorMap[notification.type]}
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
        ${notification.options?.onClick ? 'cursor-pointer hover:shadow-xl' : ''}
        ${notification.options?.className || ''}
      `}
      onClick={handleClick}
      data-cy={`toast-${notification.type}`}
    >
      {/* Progress bar */}
      {showProgress && duration > 0 && (
        <div
          className={`absolute bottom-0 left-0 h-1 transition-all duration-50 ${progressColorMap[notification.type]}`}
          style={{ width: `${progress}%` }}
        />
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        {Icon && (
          <div className={`flex-shrink-0 ${iconColorMap[notification.type]}`}>
            {typeof Icon === 'function' ? <Icon className="w-5 h-5" /> : Icon}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {notification.title && (
            <p className="font-semibold mb-1">{notification.title}</p>
          )}
          <p className="text-sm">{notification.message}</p>

          {/* Actions */}
          {notification.options?.actions && notification.options.actions.length > 0 && (
            <div className="flex gap-2 mt-3">
              {notification.options.actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'secondary'}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                    if (action.dismissOnClick) {
                      handleDismiss();
                    }
                  }}
                  data-cy={`toast-action-${index}`}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Dismiss button */}
        {notification.options?.dismissible !== false && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className={`flex-shrink-0 ${iconColorMap[notification.type]} hover:opacity-70 transition-opacity`}
            aria-label="Dismiss notification"
            data-cy="toast-dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
