/**
 * Breadcrumb Navigation Component
 * Hierarchical navigation trail with overflow handling
 *
 * Epic 0: UI/UX Parity - Replaces WPF BreadcrumbNavigation.xaml
 * Uses Epic 0 design system colors and typography
 *
 * @component
 * @example
 * ```tsx
 * <BreadcrumbNavigation
 *   items={[
 *     { label: 'Home', path: '/', icon: <Home /> },
 *     { label: 'Discovery', path: '/discovery' },
 *     { label: 'Users', path: '/discovery/users' }
 *   ]}
 * />
 * ```
 */

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

export interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** Route path */
  path?: string;
  /** Icon component */
  icon?: React.ReactNode;
  /** Click handler (alternative to path) */
  onClick?: () => void;
}

export interface BreadcrumbNavigationProps {
  /** Breadcrumb items */
  items: BreadcrumbItem[];
  /** Separator element */
  separator?: React.ReactNode;
  /** Maximum items to show before collapsing */
  maxItems?: number;
  /** Additional CSS classes */
  className?: string;
  /** Data attribute for testing */
  'data-cy'?: string;
}

/**
 * Breadcrumb Navigation Component
 *
 * Displays hierarchical navigation path with theme-aware colors.
 * Matches WPF BreadcrumbNavigation styling.
 */
const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = React.memo(({
  items,
  separator = <ChevronRight className="w-4 h-4" aria-hidden="true" />,
  maxItems = 5,
  className = '',
  'data-cy': dataCy = 'breadcrumb-nav',
}) => {
  // Handle overflow by showing first, last, and collapsed middle items
  const displayItems = items.length > maxItems
    ? [
        items[0],
        { label: '...', path: undefined, onClick: undefined },
        ...items.slice(-(maxItems - 2))
      ]
    : items;

  return (
    <nav
      className={clsx(
        'flex items-center text-sm',
        className
      )}
      aria-label="Breadcrumb"
      data-cy={dataCy}
    >
      <ol className="flex items-center">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isEllipsis = item.label === '...';

          return (
            <li key={`${item.label}-${index}`} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-[var(--foreground-muted)]">
                  {separator}
                </span>
              )}

              {isEllipsis ? (
                <span className="text-[var(--foreground-muted)]">...</span>
              ) : isLast ? (
                <span
                  className={clsx(
                    'flex items-center gap-1.5 font-medium',
                    'text-[var(--foreground)]'
                  )}
                  aria-current="page"
                  data-cy={`breadcrumb-${index}`}
                >
                  {item.icon}
                  {item.label}
                </span>
              ) : item.path ? (
                <Link
                  to={item.path}
                  className={clsx(
                    'flex items-center gap-1.5',
                    'text-[var(--foreground-secondary)]',
                    'hover:text-brand-primary',
                    'transition-colors duration-200',
                    'focus-visible-ring rounded-sm px-1'
                  )}
                  data-cy={`breadcrumb-${index}`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ) : item.onClick ? (
                <button
                  onClick={item.onClick}
                  className={clsx(
                    'flex items-center gap-1.5',
                    'text-[var(--foreground-secondary)]',
                    'hover:text-brand-primary',
                    'transition-colors duration-200',
                    'focus-visible-ring rounded-sm px-1'
                  )}
                  data-cy={`breadcrumb-${index}`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ) : (
                <span
                  className={clsx(
                    'flex items-center gap-1.5',
                    'text-[var(--foreground-secondary)]'
                  )}
                  data-cy={`breadcrumb-${index}`}
                >
                  {item.icon}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});

BreadcrumbNavigation.displayName = 'BreadcrumbNavigation';

export default BreadcrumbNavigation;
