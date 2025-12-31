/**
 * Discovery Progress Bar Component
 *
 * Visual progress indicator for PowerShell discovery module execution.
 *
 * Features:
 * - Animated progress bar with percentage
 * - Phase indicator (discovering, processing, analyzing, etc.)
 * - Estimated time remaining
 * - Current item/resource being processed
 * - Status indicator (running, paused, completed, error)
 * - Dark theme compatible
 * - Smooth animations with Tailwind transitions
 *
 * Usage:
 * ```tsx
 * <DiscoveryProgressBar
 *   percentage={45}
 *   phase="discovering"
 *   currentItem="Scanning AD users..."
 *   estimatedTimeRemaining={120000}
 *   status="running"
 * />
 * ```
 */

import React, { useMemo } from 'react';
import { Loader2, CheckCircle2, XCircle, PauseCircle, Clock } from 'lucide-react';
import { clsx } from 'clsx';

// ==================== Type Definitions ====================

export type DiscoveryPhase =
  | 'initializing'
  | 'discovering'
  | 'processing'
  | 'analyzing'
  | 'correlating'
  | 'finalizing'
  | 'completed'
  | 'error';

export type DiscoveryStatus = 'idle' | 'running' | 'paused' | 'completed' | 'error' | 'cancelled';

export interface DiscoveryProgressBarProps {
  /** Progress percentage (0-100) */
  percentage: number;

  /** Current execution phase */
  phase?: DiscoveryPhase;

  /** Current item/resource being processed */
  currentItem?: string;

  /** Estimated time remaining in milliseconds */
  estimatedTimeRemaining?: number;

  /** Overall execution status */
  status?: DiscoveryStatus;

  /** Custom class name */
  className?: string;

  /** Show detailed info (phase, current item, ETA) */
  detailed?: boolean;

  /** Animation speed for progress bar (ms) */
  animationSpeed?: number;
}

// ==================== Utility Functions ====================

/**
 * Format duration in milliseconds to human-readable string
 */
const formatDuration = (ms: number): string => {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Get phase display name
 */
const getPhaseDisplayName = (phase: DiscoveryPhase): string => {
  const map: Record<DiscoveryPhase, string> = {
    initializing: 'Initializing',
    discovering: 'Discovering Resources',
    processing: 'Processing Data',
    analyzing: 'Analyzing Results',
    correlating: 'Correlating Relationships',
    finalizing: 'Finalizing',
    completed: 'Completed',
    error: 'Error',
  };
  return map[phase] || phase;
};

/**
 * Get status icon and color
 */
const getStatusInfo = (status: DiscoveryStatus) => {
  switch (status) {
    case 'running':
      return {
        icon: Loader2,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/20',
        animate: true,
      };
    case 'completed':
      return {
        icon: CheckCircle2,
        color: 'text-green-500',
        bgColor: 'bg-green-500/20',
        animate: false,
      };
    case 'error':
    case 'cancelled':
      return {
        icon: XCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-500/20',
        animate: false,
      };
    case 'paused':
      return {
        icon: PauseCircle,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/20',
        animate: false,
      };
    default:
      return {
        icon: Loader2,
        color: 'text-gray-500',
        bgColor: 'bg-gray-500/20',
        animate: false,
      };
  }
};

/**
 * Get progress bar color based on percentage
 */
const getProgressBarColor = (percentage: number, status: DiscoveryStatus): string => {
  if (status === 'error' || status === 'cancelled') {
    return 'bg-red-500';
  }
  if (status === 'completed') {
    return 'bg-green-500';
  }
  if (percentage < 30) {
    return 'bg-blue-500';
  }
  if (percentage < 70) {
    return 'bg-cyan-500';
  }
  return 'bg-green-500';
};

// ==================== Main Component ====================

export const DiscoveryProgressBar: React.FC<DiscoveryProgressBarProps> = ({
  percentage,
  phase = 'initializing',
  currentItem,
  estimatedTimeRemaining,
  status = 'idle',
  className = '',
  detailed = true,
  animationSpeed = 300,
}) => {
  // Clamp percentage to 0-100
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  // Get status info
  const statusInfo = useMemo(() => getStatusInfo(status), [status]);
  const StatusIcon = statusInfo.icon;

  // Get progress bar color
  const progressBarColor = useMemo(
    () => getProgressBarColor(clampedPercentage, status),
    [clampedPercentage, status]
  );

  return (
    <div className={clsx('w-full', className)}>
      {/* Header row with phase and status */}
      {detailed && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={clsx('p-1 rounded', statusInfo.bgColor)}>
              <StatusIcon
                className={clsx('w-4 h-4', statusInfo.color, statusInfo.animate && 'animate-spin')}
              />
            </div>
            <span className="text-sm font-medium text-gray-200 dark:text-gray-300">
              {getPhaseDisplayName(phase)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* ETA */}
            {estimatedTimeRemaining !== undefined && estimatedTimeRemaining > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                <span>ETA: {formatDuration(estimatedTimeRemaining)}</span>
              </div>
            )}

            {/* Percentage */}
            <span className="text-sm font-semibold text-gray-200 dark:text-gray-300">
              {clampedPercentage.toFixed(0)}%
            </span>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="relative w-full h-2 bg-gray-700 dark:bg-gray-800 rounded-full overflow-hidden">
        {/* Progress fill */}
        <div
          className={clsx(
            'h-full rounded-full transition-all ease-out',
            progressBarColor,
            status === 'running' && 'animate-pulse'
          )}
          style={{
            width: `${clampedPercentage}%`,
            transitionDuration: `${animationSpeed}ms`,
          }}
        />

        {/* Shimmer effect for running state */}
        {status === 'running' && (
          <div
            className="absolute top-0 left-0 h-full w-32 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
            style={{
              animation: 'shimmer 2s infinite',
            }}
          />
        )}
      </div>

      {/* Current item being processed */}
      {detailed && currentItem && (
        <div className="mt-2 text-xs text-gray-400 truncate" title={currentItem}>
          {currentItem}
        </div>
      )}

      {/* Simple percentage display when not detailed */}
      {!detailed && (
        <div className="mt-1 text-xs text-right text-gray-400">
          {clampedPercentage.toFixed(0)}%
        </div>
      )}
    </div>
  );
};

// Add keyframes for shimmer animation to global styles if not already present
// This would typically go in src/index.css:
/*
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(400%);
  }
}
*/

export default DiscoveryProgressBar;


