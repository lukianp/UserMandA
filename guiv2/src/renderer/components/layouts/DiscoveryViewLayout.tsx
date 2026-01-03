/**
 * DiscoveryViewLayout Component
 *
 * Reusable layout for discovery and discovered views with proper scrolling behavior.
 * Fixes the common issue where content is cut off at the bottom of the viewport.
 *
 * Features:
 * - Proper scrolling when content exceeds viewport height
 * - Responsive header that stays at top
 * - Statistics cards section
 * - Tab navigation
 * - Content area with VirtualizedDataGrid or custom content
 *
 * @example
 * ```tsx
 * <DiscoveryViewLayout
 *   title="Active Directory Discovery"
 *   description="Discover on-premises directory infrastructure"
 *   icon={<Database />}
 *   headerActions={<Button onClick={startDiscovery}>Start Discovery</Button>}
 *   statisticsCards={<StatsGrid />}
 *   tabs={tabs}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 * >
 *   {tabContent}
 * </DiscoveryViewLayout>
 * ```
 */

import React from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
}

interface DiscoveryViewLayoutProps {
  /** Page title displayed in header */
  title: string;

  /** Optional description displayed under title */
  description?: string;

  /** Icon displayed in header */
  icon?: React.ReactNode;

  /** Actions displayed in header (e.g., buttons) */
  headerActions?: React.ReactNode;

  /** Optional alert/banner content displayed below header */
  headerBanner?: React.ReactNode;

  /** Statistics cards section (e.g., Discovery Success %, metrics) */
  statisticsCards?: React.ReactNode;

  /** Array of tabs for navigation */
  tabs?: Tab[];

  /** Currently active tab ID */
  activeTab?: string;

  /** Callback when tab is clicked */
  onTabChange?: (tabId: string) => void;

  /** Main content area */
  children: React.ReactNode;

  /** Optional empty state when no data */
  emptyState?: React.ReactNode;

  /** Show empty state instead of content */
  showEmptyState?: boolean;

  /** Data test ID for testing */
  'data-testid'?: string;

  /** Data cy ID for Cypress testing */
  'data-cy'?: string;
}

/**
 * Reusable discovery view layout with proper scrolling
 */
export const DiscoveryViewLayout: React.FC<DiscoveryViewLayoutProps> = ({
  title,
  description,
  icon,
  headerActions,
  headerBanner,
  statisticsCards,
  tabs,
  activeTab,
  onTabChange,
  children,
  emptyState,
  showEmptyState = false,
  'data-testid': dataTestId,
  'data-cy': dataCy,
}) => {
  return (
    <div
      className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900"
      data-cy={dataCy}
      data-testid={dataTestId}
    >
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            {icon && (
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                {icon}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {title}
              </h1>
              {description && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>
          </div>

          {headerActions && (
            <div className="flex items-center gap-2">
              {headerActions}
            </div>
          )}
        </div>

        {/* Optional header banner (progress, errors, etc.) */}
        {headerBanner}
      </div>

      {/* Show empty state or content */}
      {showEmptyState ? (
        <div className="flex-1 flex items-center justify-center">
          {emptyState}
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Statistics Cards Section */}
          {statisticsCards && (
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
              {statisticsCards}
            </div>
          )}

          {/* Tabs Section */}
          {tabs && tabs.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1 px-4 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange?.(tab.id)}
                    className={`
                      flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors whitespace-nowrap
                      ${activeTab === tab.id
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                      }
                    `}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && tab.badge !== null && (
                      <span className={`
                        px-2 py-0.5 rounded-full text-xs font-semibold
                        ${activeTab === tab.id
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }
                      `}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content Area - CRITICAL: overflow-auto allows scrolling */}
          <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Tab Button Component (for manual tab implementations)
 * Use this if you need custom tab rendering instead of the tabs prop
 */
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
}

export const TabButton: React.FC<TabButtonProps> = ({
  active,
  onClick,
  label,
  icon,
  badge,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors whitespace-nowrap
        ${active
          ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
        }
      `}
    >
      {icon}
      <span>{label}</span>
      {badge !== undefined && badge !== null && (
        <span className={`
          px-2 py-0.5 rounded-full text-xs font-semibold
          ${active
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }
        `}>
          {badge}
        </span>
      )}
    </button>
  );
};
