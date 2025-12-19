import React from 'react';
import { ICellRendererParams } from 'ag-grid-community';

const statusColors: Record<string, string> = {
  // Success states
  'active': 'success',
  'enabled': 'success',
  'running': 'success',
  'healthy': 'success',
  'compliant': 'success',
  'true': 'success',
  'yes': 'success',
  'connected': 'success',
  'started': 'success',
  'online': 'success',
  'ready': 'success',
  'success': 'success',
  'completed': 'success',
  'synced': 'success',

  // Warning states
  'pending': 'warning',
  'expiring': 'warning',
  'warning': 'warning',
  'disabled': 'warning',
  'stopping': 'warning',
  'stopped': 'warning',
  'paused': 'warning',
  'degraded': 'warning',
  'partial': 'warning',

  // Error states
  'error': 'error',
  'failed': 'error',
  'expired': 'error',
  'non-compliant': 'error',
  'critical': 'error',
  'false': 'error',
  'no': 'error',
  'disconnected': 'error',
  'offline': 'error',
  'unreachable': 'error',
  'blocked': 'error',
  'denied': 'error',

  // Info states
  'info': 'info',
  'cloud': 'info',
  'hybrid': 'info',
  'syncing': 'info',
  'processing': 'info',

  // Default
  'default': 'neutral',
};

export interface StatusBadgeCellRendererProps extends ICellRendererParams {
  // Additional props can be added here if needed
}

export const StatusBadgeCellRenderer: React.FC<StatusBadgeCellRendererProps> = (params) => {
  // Handle null/undefined values
  if (params.value === null || params.value === undefined) {
    return <span className="status-badge status-badge--neutral">N/A</span>;
  }

  const value = params.value?.toString()?.toLowerCase()?.trim() || '';
  const statusType = statusColors[value] || 'neutral';

  // Format display text (capitalize first letter of each word)
  const displayValue = params.value?.toString()
    .split(' ')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ') || 'Unknown';

  return (
    <span className={`status-badge status-badge--${statusType}`}>
      {displayValue}
    </span>
  );
};

export default StatusBadgeCellRenderer;
