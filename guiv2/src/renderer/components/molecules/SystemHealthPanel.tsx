/**
 * SystemHealthPanel Component
 *
 * Displays system health status for Logic Engine, PowerShell, and other services.
 * Shows service status indicators, data freshness, and recent errors.
 *
 * Phase 6: Dashboard UI Components
 */

import React from 'react';
import { ModernCard } from '../atoms/ModernCard';
import { StatusIndicator } from '../atoms/StatusIndicator';
import type { SystemHealth } from '../../types/dashboard';
import { AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface SystemHealthPanelProps {
  health: SystemHealth;
  className?: string;
}

/**
 * Get status type for StatusIndicator based on service status
 */
const getStatusType = (status: 'online' | 'offline' | 'degraded' | 'unknown'): 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'online':
      return 'success';
    case 'degraded':
      return 'warning';
    case 'offline':
    case 'unknown':
      return 'error';
  }
};

/**
 * Get icon for service status
 */
const getStatusIcon = (status: 'online' | 'offline' | 'degraded' | 'unknown') => {
  switch (status) {
    case 'online':
      return <CheckCircle className="w-4 h-4" />;
    case 'degraded':
      return <AlertCircle className="w-4 h-4" />;
    case 'offline':
    case 'unknown':
      return <XCircle className="w-4 h-4" />;
  }
};

/**
 * Format data freshness time
 */
const formatFreshness = (minutes: number): string => {
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${Math.round(minutes)}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

/**
 * SystemHealthPanel Component
 *
 * Comprehensive system health monitoring with:
 * - Service status indicators
 * - Data freshness tracking
 * - Error count display
 * - Performance metrics (optional)
 */
export const SystemHealthPanel: React.FC<SystemHealthPanelProps> = ({ health, className }) => {
  return (
    <ModernCard className={className} hoverable={false}>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
        System Health
      </h3>

      <div className="space-y-3">
        {/* Logic Engine Status */}
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--card-bg-secondary)] transition-colors">
          <span className="text-sm text-[var(--text-secondary)] font-medium">
            Logic Engine
          </span>
          <StatusIndicator
            status={getStatusType(health.logicEngineStatus.status)}
            text={health.logicEngineStatus.status}
            size="sm"
            animate={health.logicEngineStatus.status === 'online'}
          />
        </div>

        {/* PowerShell Status */}
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--card-bg-secondary)] transition-colors">
          <span className="text-sm text-[var(--text-secondary)] font-medium">
            PowerShell
          </span>
          <StatusIndicator
            status={getStatusType(health.powerShellStatus.status)}
            text={health.powerShellStatus.status}
            size="sm"
            animate={health.powerShellStatus.status === 'online'}
          />
        </div>

        {/* File System Status */}
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--card-bg-secondary)] transition-colors">
          <span className="text-sm text-[var(--text-secondary)] font-medium">
            File System
          </span>
          <StatusIndicator
            status={getStatusType(health.fileSystemStatus.status)}
            text={health.fileSystemStatus.status}
            size="sm"
            animate={health.fileSystemStatus.status === 'online'}
          />
        </div>

        {/* Network Status */}
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--card-bg-secondary)] transition-colors">
          <span className="text-sm text-[var(--text-secondary)] font-medium">
            Network
          </span>
          <StatusIndicator
            status={getStatusType(health.networkStatus.status)}
            text={health.networkStatus.status}
            size="sm"
            animate={health.networkStatus.status === 'online'}
          />
        </div>

        {/* Data Freshness */}
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--card-bg-secondary)] transition-colors mt-4 pt-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--text-secondary)]" />
            <span className="text-sm text-[var(--text-secondary)] font-medium">
              Data Freshness
            </span>
          </div>
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {formatFreshness(health.dataFreshnessMinutes)}
          </span>
        </div>

        {/* Error Count */}
        {health.lastErrorCount > 0 && (
          <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[var(--danger)]" />
              <span className="text-sm text-[var(--danger)] font-medium">
                Recent Errors
              </span>
            </div>
            <span className="text-sm font-bold text-[var(--danger)]">
              {health.lastErrorCount}
            </span>
          </div>
        )}

        {/* Performance Metrics (Optional) */}
        {health.memoryUsageMB && (
          <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-secondary)]">Memory Usage</span>
              <span className="font-medium text-[var(--text-primary)]">
                {health.memoryUsageMB.toFixed(0)} MB
              </span>
            </div>
            {health.cpuUsagePercent !== undefined && (
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">CPU Usage</span>
                <span className="font-medium text-[var(--text-primary)]">
                  {health.cpuUsagePercent.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </ModernCard>
  );
};

export default SystemHealthPanel;
