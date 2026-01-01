/**
 * StatisticsCard Component
 *
 * Clickable card displaying entity statistics with discovered/migrated breakdown.
 * Used for dashboard overview metrics (Users, Groups, Computers, etc.)
 *
 * Phase 6: Dashboard UI Components
 */

import React from 'react';
import { clsx } from 'clsx';

import { ModernCard } from '../atoms/ModernCard';

interface StatisticsCardProps {
  /** Card title */
  title: string;
  /** Total count value */
  value: number;
  /** Optional discovered count */
  discovered?: number;
  /** Optional migrated count */
  migrated?: number;
  /** Optional icon element */
  icon?: React.ReactNode;
  /** Click handler for navigation */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Cypress test selector */
  'data-cy'?: string;
}

/**
 * StatisticsCard Component
 *
 * Interactive statistics display with:
 * - Large value display
 * - Optional icon
 * - Discovered/migrated breakdown
 * - Hover effects for navigation
 */
export const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  value,
  discovered,
  migrated,
  icon,
  onClick,
  className,
  'data-cy': dataCy,
}) => {
  return (
    <ModernCard
      className={clsx(
        'group transition-all duration-200',
        onClick && 'cursor-pointer hover:border-[var(--accent-primary)] hover:shadow-lg',
        className
      )}
      onClick={onClick}
      data-cy={dataCy}
    >
      {/* Header: Title & Icon */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <p className="text-sm text-[var(--text-secondary)] mb-1 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-4xl font-bold text-[var(--text-primary)] mt-2">
            {(value ?? 0).toLocaleString()}
          </p>
        </div>
        {icon && (
          <div className="text-[var(--accent-primary)] opacity-80">
            {icon}
          </div>
        )}
      </div>

      {/* Breakdown: Discovered/Migrated */}
      {(discovered !== undefined || migrated !== undefined) && (
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[var(--border)]">
          {discovered !== undefined && (
            <div>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                Discovered
              </p>
              <p className="text-lg font-semibold text-[var(--info)]">
                {(discovered ?? 0).toLocaleString()}
              </p>
            </div>
          )}
          {migrated !== undefined && (
            <div>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                Migrated
              </p>
              <p className="text-lg font-semibold text-[var(--success)]">
                {(migrated ?? 0).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hover Indicator */}
      {onClick && (
        <div className="mt-3 text-xs text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity">
          Click to view details →
        </div>
      )}
    </ModernCard>
  );
};

export default StatisticsCard;


