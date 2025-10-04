/**
 * Breadcrumb Navigation Component
 * Hierarchical navigation trail with overflow handling
 */

import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

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
 */
const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  items,
  separator = <ChevronRight className="w-4 h-4 text-gray-400" />,
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
      className={`flex items-center space-x-2 text-sm ${className}`}
      aria-label="Breadcrumb"
      data-cy={dataCy}
    >
      <ol className="flex items-center space-x-2">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isEllipsis = item.label === '...';

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2">{separator}</span>
              )}

              {isEllipsis ? (
                <span className="text-gray-500 dark:text-gray-400">...</span>
              ) : isLast ? (
                <span
                  className="flex items-center gap-1 font-medium text-gray-900 dark:text-gray-100"
                  aria-current="page"
                  data-cy={`breadcrumb-${index}`}
                >
                  {item.icon}
                  {item.label}
                </span>
              ) : item.path ? (
                <Link
                  to={item.path}
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  data-cy={`breadcrumb-${index}`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ) : item.onClick ? (
                <button
                  onClick={item.onClick}
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  data-cy={`breadcrumb-${index}`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ) : (
                <span
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-400"
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
};

export default BreadcrumbNavigation;
