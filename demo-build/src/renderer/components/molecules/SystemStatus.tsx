/**
 * SystemStatus Component
 *
 * Displays real-time system health indicators for Logic Engine, PowerShell, and Data Connection.
 * Shows status for critical services with color-coded indicators and last sync timestamp.
 *
 * Epic 0: UI/UX Enhancement - Navigation & UX (TASK 6)
 *
 * @component
 * @example
 * ```tsx
 * const { systemStatus } = useSystemHealthLogic();
 * <SystemStatus indicators={systemStatus} />
 * ```
 */

import React from 'react';
import { Database, Server, Shield, Activity } from 'lucide-react';

import { StatusIndicator } from '../atoms/StatusIndicator';
import type { StatusType } from '../atoms/StatusIndicator';

export interface SystemStatusIndicators {
  /** Logic Engine connection status */
  logicEngine: 'online' | 'offline' | 'degraded';
  /** PowerShell service status */
  powerShell: 'online' | 'offline' | 'degraded';
  /** Data connection status */
  dataConnection: 'online' | 'offline' | 'degraded';
  /** Last successful sync timestamp (ISO string) */
  lastSync?: string;
}

export interface SystemStatusProps {
  /** System health indicators */
  indicators: SystemStatusIndicators;
  /** Show last sync timestamp */
  showLastSync?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Cypress test selector */
  'data-cy'?: string;
}

/**
 * SystemStatus Component
 *
 * Displays real-time health status for critical system services.
 * Updates automatically via useSystemHealthLogic hook.
 */
export const SystemStatus: React.FC<SystemStatusProps> = ({
  indicators,
  showLastSync = true,
  className = '',
  'data-cy': dataCy,
}) => {
  /**
   * Convert service status to StatusIndicator type
   */
  const getStatusType = (status: 'online' | 'offline' | 'degraded'): StatusType => {
    switch (status) {
      case 'online':
        return 'success';
      case 'degraded':
        return 'warning';
      case 'offline':
        return 'error';
      default:
        return 'error';
    }
  };

  /**
   * Format last sync timestamp
   */
  const formatLastSync = (timestamp?: string): string => {
    if (!timestamp) return 'Never';
    try {
      return new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return 'Invalid';
    }
  };

  return (
    <div className={`space-y-2 ${className}`} data-cy={dataCy || 'system-status'}>
      {/* Section header */}
      <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-3">
        System Status
      </h3>

      {/* Logic Engine status */}
      <div className="flex items-center justify-between" data-cy="status-logic-engine">
        <div className="flex items-center gap-2">
          <Database className="w-3 h-3 text-gray-400 dark:text-gray-500" aria-hidden="true" />
          <span className="text-xs text-gray-600 dark:text-gray-400">Logic Engine</span>
        </div>
        <StatusIndicator
          status={getStatusType(indicators.logicEngine)}
          text={indicators.logicEngine}
          size="sm"
          animate={indicators.logicEngine === 'degraded'}
        />
      </div>

      {/* PowerShell service status */}
      <div className="flex items-center justify-between" data-cy="status-powershell">
        <div className="flex items-center gap-2">
          <Server className="w-3 h-3 text-gray-400 dark:text-gray-500" aria-hidden="true" />
          <span className="text-xs text-gray-600 dark:text-gray-400">PowerShell</span>
        </div>
        <StatusIndicator
          status={getStatusType(indicators.powerShell)}
          text={indicators.powerShell}
          size="sm"
          animate={indicators.powerShell === 'degraded'}
        />
      </div>

      {/* Data connection status */}
      <div className="flex items-center justify-between" data-cy="status-data-connection">
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3 text-gray-400 dark:text-gray-500" aria-hidden="true" />
          <span className="text-xs text-gray-600 dark:text-gray-400">Data Connection</span>
        </div>
        <StatusIndicator
          status={getStatusType(indicators.dataConnection)}
          text={indicators.dataConnection}
          size="sm"
          animate={indicators.dataConnection === 'degraded'}
        />
      </div>

      {/* Last sync timestamp */}
      {showLastSync && (
        <div
          className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700"
          data-cy="status-last-sync"
        >
          <Activity className="w-3 h-3 text-gray-400 dark:text-gray-500" aria-hidden="true" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Sync: {formatLastSync(indicators.lastSync)}
          </span>
        </div>
      )}
    </div>
  );
};

export default SystemStatus;


