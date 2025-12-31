/**
 * RecentActivityFeed Component
 *
 * Displays recent system activity with icons, timestamps, and descriptions.
 * Shows discovery runs, migration events, errors, and configuration changes.
 *
 * Phase 6: Dashboard UI Components
 */

import React from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Info,
  Search,
  Download,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { clsx } from 'clsx';

import { ModernCard } from '../atoms/ModernCard';
import type { ActivityItem } from '../../types/dashboard';

interface RecentActivityFeedProps {
  activities: ActivityItem[];
  className?: string;
  maxItems?: number;
}

/**
 * Get icon component based on activity type
 */
const getActivityIcon = (type: string, status: string) => {
  // Status-based icons
  if (status === 'error') {
    return <AlertCircle className="w-4 h-4 text-[var(--danger)]" />;
  }
  if (status === 'warning') {
    return <AlertTriangle className="w-4 h-4 text-[var(--warning)]" />;
  }
  if (status === 'success') {
    return <CheckCircle className="w-4 h-4 text-[var(--success)]" />;
  }

  // Type-based icons
  switch (type) {
    case 'discovery':
      return <Search className="w-4 h-4 text-[var(--info)]" />;
    case 'migration':
      return <Download className="w-4 h-4 text-[var(--accent-primary)]" />;
    case 'configuration':
      return <Settings className="w-4 h-4 text-[var(--text-secondary)]" />;
    case 'validation':
      return <CheckCircle className="w-4 h-4 text-[var(--success)]" />;
    default:
      return <Activity className="w-4 h-4 text-[var(--text-secondary)]" />;
  }
};

/**
 * Get background color based on status
 */
const getStatusBgColor = (status: string): string => {
  switch (status) {
    case 'error':
      return 'bg-[var(--danger)]/10';
    case 'warning':
      return 'bg-[var(--warning)]/10';
    case 'success':
      return 'bg-[var(--success)]/10';
    case 'info':
      return 'bg-[var(--info)]/10';
    default:
      return 'bg-[var(--card-bg-secondary)]';
  }
};

/**
 * Format timestamp to relative time
 */
const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

/**
 * RecentActivityFeed Component
 *
 * Activity feed with:
 * - Type-based icons
 * - Status indicators
 * - Relative timestamps
 * - Entity counts
 * - Empty state handling
 */
export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  activities,
  className,
  maxItems = 10
}) => {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <ModernCard className={className} hoverable={false}>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
        Recent Activity
      </h3>

      <div className="space-y-2">
        {displayActivities.length === 0 ? (
          /* Empty State */
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-[var(--text-secondary)] opacity-30 mx-auto mb-3" />
            <p className="text-sm text-[var(--text-secondary)]">
              No recent activity
            </p>
          </div>
        ) : (
          /* Activity List */
          displayActivities.map((activity, index) => (
            <div
              key={activity.id}
              className={clsx(
                'flex items-start gap-3 p-3 rounded-lg',
                'transition-colors duration-150',
                'hover:bg-[var(--card-bg-secondary)]',
                getStatusBgColor(activity.status),
                index !== displayActivities.length - 1 && 'border-b border-[var(--border)]'
              )}
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {getActivityIcon(activity.type, activity.status)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {activity.title}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {activity.description}
                </p>

                {/* Metadata */}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-[var(--text-secondary)]">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                  {activity.entityCount !== undefined && (
                    <span className="text-xs text-[var(--accent-primary)] font-medium">
                      {activity.entityCount.toLocaleString()} items
                    </span>
                  )}
                  {activity.user && (
                    <span className="text-xs text-[var(--text-secondary)]">
                      by {activity.user}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Show More Link */}
      {activities.length > maxItems && (
        <div className="mt-4 pt-3 border-t border-[var(--border)] text-center">
          <button
            className="text-sm text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors"
            onClick={() => {/* TODO: Navigate to activity log */}}
          >
            View all {activities.length} activities →
          </button>
        </div>
      )}
    </ModernCard>
  );
};

export default RecentActivityFeed;


