/**
 * ModernCard Component
 *
 * Modern card container with gradient backgrounds, neon shadows, and hover effects.
 *
 * Epic 0: UI/UX Parity - Replaces WPF ModernCardStyle
 * Features gradient backgrounds, border animations, and scale transforms.
 *
 * @component
 * @example
 * ```tsx
 * <ModernCard>
 *   <h2>Card Title</h2>
 *   <p>Card content</p>
 * </ModernCard>
 *
 * <ModernCard hoverable={false} variant="metric">
 *   <MetricDisplay value={1234} label="Total Users" />
 * </ModernCard>
 * ```
 */

import React from 'react';
import { clsx } from 'clsx';

export interface ModernCardProps {
  /** Card content */
  children: React.ReactNode;
  /** Card variant style */
  variant?: 'default' | 'metric' | 'section' | 'glass';
  /** Enable hover scale animation */
  hoverable?: boolean;
  /** Optional header content */
  header?: React.ReactNode;
  /** Optional footer content */
  footer?: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Cypress test selector */
  'data-cy'?: string;
}

/**
 * ModernCard Component
 *
 * Replicates WPF ModernCardStyle with gradient backgrounds and neon effects.
 * Uses design system from Epic 0 architecture.
 */
export const ModernCard: React.FC<ModernCardProps> = React.memo(({
  children,
  variant = 'default',
  hoverable = true,
  header,
  footer,
  onClick,
  className,
  'data-cy': dataCy,
}) => {
  // Variant-specific classes
  const variantClasses = {
    default: clsx(
      'bg-white dark:bg-gray-800',
      'border border-gray-200 dark:border-gray-700',
      'rounded-lg p-5',
      'shadow-card',
      'transition-all duration-200',
      hoverable && 'hover:shadow-card-hover hover:scale-[1.01] hover:-translate-y-0.5'
    ),
    metric: clsx(
      'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900',
      'border border-blue-200 dark:border-cyan-900',
      'rounded-lg p-6',
      'shadow-metric',
      'transition-all duration-200',
      hoverable && 'hover:shadow-metric-hover hover:scale-[1.02]'
    ),
    section: clsx(
      'bg-white dark:bg-gray-800',
      'border-l-4 border-blue-500',
      'rounded-r-lg p-5',
      'shadow-section',
      'transition-all duration-200'
    ),
    glass: clsx(
      'bg-white/80 dark:bg-gray-800/80',
      'backdrop-blur-sm',
      'border border-gray-200/50 dark:border-gray-700/50',
      'rounded-lg p-5 m-2',
      'shadow-card',
      'transition-all duration-200',
      hoverable && 'hover:shadow-card-hover hover:scale-[1.01] hover:-translate-y-0.5'
    ),
  };

  const cardClasses = clsx(
    variantClasses[variant],
    onClick && 'cursor-pointer',
    className
  );

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      data-cy={dataCy}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {/* Optional header */}
      {header && (
        <div className="mb-4 pb-4 border-b border-[var(--border)]">
          {header}
        </div>
      )}

      {/* Card content */}
      <div className="card-content">
        {children}
      </div>

      {/* Optional footer */}
      {footer && (
        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          {footer}
        </div>
      )}
    </div>
  );
});

ModernCard.displayName = 'ModernCard';

export default ModernCard;


