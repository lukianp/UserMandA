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
      'modern-card',
      hoverable && 'hover:scale-[1.01]'
    ),
    metric: clsx(
      'metric-card'
    ),
    section: clsx(
      'section-border'
    ),
    glass: clsx(
      'glass-card',
      'p-5 m-2',
      hoverable && 'hover:scale-[1.01] hover:shadow-card-hover'
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
