/**
 * Notification Center
 * Panel displaying notification history with filtering and management
 */

import React, { useState } from 'react';
import {
  Bell,
  BellOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Trash2,
  Pin,
  PinOff,
  Search,
  Filter,
  X,
} from 'lucide-react';

import { useNotificationStore } from '../../store/useNotificationStore';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Badge } from '../atoms/Badge';
import { NotificationType } from '../../types/models/notification';

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const iconColorMap = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const notifications = useNotificationStore((state) => state.getFilteredNotifications());
  const filter = useNotificationStore((state) => state.filter);
  const setFilter = useNotificationStore((state) => state.setFilter);
  const resetFilter = useNotificationStore((state) => state.resetFilter);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const deleteNotification = useNotificationStore((state) => state.deleteNotification);
  const pinNotification = useNotificationStore((state) => state.pinNotification);
  const clearAll = useNotificationStore((state) => state.clearAll);
  const stats = useNotificationStore((state) => state.getStats());
  const unreadCount = useNotificationStore((state) => state.getUnreadCount());

  if (!isOpen) return null;

  const handleTypeFilter = (type: NotificationType) => {
    const types = filter.types.includes(type)
      ? filter.types.filter((t) => t !== type)
      : [...filter.types, type];
    setFilter({ types });
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-30 backdrop-blur-sm"
      onClick={onClose}
      data-cy="notification-center-overlay"
    >
      <div
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        data-cy="notification-center"
      >
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Notifications</h2>
              {unreadCount > 0 && (
                <Badge variant="danger" size="sm">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              aria-label="Close notification center"
              data-cy="notification-center-close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search notifications..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setFilter({ searchText: e.target.value });
              }}
              className="pl-10"
              data-cy="notification-search"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              icon={<Filter className="w-4 h-4" />}
              data-cy="toggle-filters"
            >
              Filters
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              data-cy="mark-all-read"
            >
              Mark All Read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              icon={<Trash2 className="w-4 h-4" />}
              data-cy="clear-all"
            >
              Clear
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2 mb-2">
                {(['success', 'error', 'warning', 'info'] as NotificationType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleTypeFilter(type)}
                    className={`
                      px-3 py-1 rounded-full text-sm font-medium transition-colors
                      ${
                        filter.types.includes(type)
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }
                    `}
                    data-cy={`filter-${type}`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filter.unreadOnly}
                    onChange={(e) => setFilter({ unreadOnly: e.target.checked })}
                    className="rounded"
                    data-cy="filter-unread"
                  />
                  Unread only
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filter.pinnedOnly}
                    onChange={(e) => setFilter({ pinnedOnly: e.target.checked })}
                    className="rounded"
                    data-cy="filter-pinned"
                  />
                  Pinned only
                </label>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilter}
                className="mt-2"
                data-cy="reset-filters"
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
          <div className="grid grid-cols-4 gap-2 text-center text-sm">
            <div>
              <div className="font-semibold">{stats.total}</div>
              <div className="text-gray-500 text-xs">Total</div>
            </div>
            <div>
              <div className="font-semibold text-green-600">{stats.byType.success}</div>
              <div className="text-gray-500 text-xs">Success</div>
            </div>
            <div>
              <div className="font-semibold text-red-600">{stats.byType.error}</div>
              <div className="text-gray-500 text-xs">Errors</div>
            </div>
            <div>
              <div className="font-semibold text-yellow-600">{stats.byType.warning}</div>
              <div className="text-gray-500 text-xs">Warnings</div>
            </div>
          </div>
        </div>

        {/* Notification List */}
        <div className="overflow-y-auto h-[calc(100%-280px)]" data-cy="notification-list">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <BellOff className="w-16 h-16 mb-3" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map((notification) => {
                const Icon = iconMap[notification.type];
                return (
                  <div
                    key={notification.id}
                    className={`
                      p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors
                      ${!notification.read ? 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20' : ''}
                    `}
                    onClick={() => markAsRead(notification.id)}
                    data-cy={`notification-item-${notification.type}`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 flex-shrink-0 ${iconColorMap[notification.type]}`} />

                      <div className="flex-1 min-w-0">
                        {notification.title && (
                          <p className="font-semibold text-sm mb-1">{notification.title}</p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-300 break-words">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            pinNotification(notification.id, !notification.pinned);
                          }}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          aria-label={notification.pinned ? 'Unpin' : 'Pin'}
                          data-cy="pin-notification"
                        >
                          {notification.pinned ? (
                            <PinOff className="w-4 h-4" />
                          ) : (
                            <Pin className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="text-gray-400 hover:text-red-500"
                          aria-label="Delete"
                          data-cy="delete-notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
