/**
 * ApplicationFilterPanel Component
 *
 * Provides intelligent filtering controls for Entra ID applications
 * based on classification (MicrosoftDefault, CustomerManaged, ThirdParty, Unknown).
 *
 * Features:
 * - Category statistics with color-coded cards
 * - Toggle to show/hide Microsoft default applications
 * - Classification details and reasons breakdown
 * - Profile-persisted settings
 */

import React, { useState } from 'react';
import {
  Filter,
  Eye,
  EyeOff,
  Settings,
  Info,
  AlertTriangle,
  Building2,
  Globe,
  Shield,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { ApplicationCategory, ClassificationResult } from '../../services/applicationClassifierService';

interface CategoryCounts {
  MicrosoftDefault: number;
  CustomerManaged: number;
  ThirdParty: number;
  Unknown: number;
}

interface ClassificationStats {
  totalClassified: number;
  highConfidenceExclusions: number;
  reasonsBreakdown: Record<string, number>;
}

export interface ApplicationFilterPanelProps {
  totalCount: number;
  filteredCount: number;
  categoryCounts: CategoryCounts;
  showMicrosoftDefaults: boolean;
  onToggleMicrosoftDefaults: (show: boolean) => void;
  showThirdParty?: boolean;
  onToggleThirdParty?: (show: boolean) => void;
  showUnknown?: boolean;
  onToggleUnknown?: (show: boolean) => void;
  classificationStats?: ClassificationStats;
  onSettingsClick?: () => void;
  onRefreshClassification?: () => void;
  isLoading?: boolean;
  tenantDomains?: string[];
}

/**
 * Get icon for category
 */
function getCategoryIcon(category: ApplicationCategory) {
  switch (category) {
    case 'MicrosoftDefault':
      return <Shield size={20} />;
    case 'CustomerManaged':
      return <Building2 size={20} />;
    case 'ThirdParty':
      return <Globe size={20} />;
    case 'Unknown':
    default:
      return <HelpCircle size={20} />;
  }
}

/**
 * Get color scheme for category
 */
function getCategoryColors(category: ApplicationCategory) {
  switch (category) {
    case 'MicrosoftDefault':
      return {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800'
      };
    case 'CustomerManaged':
      return {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-600 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800'
      };
    case 'ThirdParty':
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800'
      };
    case 'Unknown':
    default:
      return {
        bg: 'bg-gray-50 dark:bg-gray-900/20',
        text: 'text-gray-600 dark:text-gray-400',
        border: 'border-gray-200 dark:border-gray-700'
      };
  }
}

export const ApplicationFilterPanel: React.FC<ApplicationFilterPanelProps> = ({
  totalCount,
  filteredCount,
  categoryCounts,
  showMicrosoftDefaults,
  onToggleMicrosoftDefaults,
  showThirdParty = true,
  onToggleThirdParty,
  showUnknown = true,
  onToggleUnknown,
  classificationStats,
  onSettingsClick,
  onRefreshClassification,
  isLoading = false,
  tenantDomains = []
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const excludedCount = totalCount - filteredCount;
  const microsoftDefaultsCount = categoryCounts.MicrosoftDefault || 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Filter size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Application Filters
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredCount} of {totalCount} applications shown
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRefreshClassification && (
            <button
              onClick={onRefreshClassification}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              title="Refresh classification"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
          )}
          {onSettingsClick && (
            <button
              onClick={onSettingsClick}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Filter settings"
            >
              <Settings size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Category Statistics */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-3">
          {/* Customer Managed */}
          <div className={`p-3 rounded-lg border ${getCategoryColors('CustomerManaged').bg} ${getCategoryColors('CustomerManaged').border}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={getCategoryColors('CustomerManaged').text}>
                {getCategoryIcon('CustomerManaged')}
              </span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Customer Managed</span>
            </div>
            <div className={`text-2xl font-bold ${getCategoryColors('CustomerManaged').text}`}>
              {categoryCounts.CustomerManaged || 0}
            </div>
          </div>

          {/* Third Party */}
          <div className={`p-3 rounded-lg border ${getCategoryColors('ThirdParty').bg} ${getCategoryColors('ThirdParty').border}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={getCategoryColors('ThirdParty').text}>
                {getCategoryIcon('ThirdParty')}
              </span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Third Party</span>
            </div>
            <div className={`text-2xl font-bold ${getCategoryColors('ThirdParty').text}`}>
              {categoryCounts.ThirdParty || 0}
            </div>
          </div>

          {/* Microsoft Defaults */}
          <div className={`p-3 rounded-lg border ${getCategoryColors('MicrosoftDefault').bg} ${getCategoryColors('MicrosoftDefault').border}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={getCategoryColors('MicrosoftDefault').text}>
                {getCategoryIcon('MicrosoftDefault')}
              </span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">MS Defaults</span>
            </div>
            <div className={`text-2xl font-bold ${getCategoryColors('MicrosoftDefault').text}`}>
              {microsoftDefaultsCount}
            </div>
          </div>

          {/* Unknown */}
          <div className={`p-3 rounded-lg border ${getCategoryColors('Unknown').bg} ${getCategoryColors('Unknown').border}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={getCategoryColors('Unknown').text}>
                {getCategoryIcon('Unknown')}
              </span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Unknown</span>
            </div>
            <div className={`text-2xl font-bold ${getCategoryColors('Unknown').text}`}>
              {categoryCounts.Unknown || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Microsoft Defaults Toggle */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showMicrosoftDefaults ? (
              <Eye size={18} className="text-green-600" />
            ) : (
              <EyeOff size={18} className="text-gray-400" />
            )}
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Show Microsoft Default Apps
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {microsoftDefaultsCount} apps {showMicrosoftDefaults ? 'shown' : 'hidden'}
              </div>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showMicrosoftDefaults}
              onChange={(e) => onToggleMicrosoftDefaults(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Exclusion Warning */}
        {!showMicrosoftDefaults && microsoftDefaultsCount > 0 && (
          <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-yellow-800 dark:text-yellow-200">
                  {microsoftDefaultsCount} Microsoft default applications hidden
                </div>
                <div className="text-yellow-700 dark:text-yellow-300 mt-1 text-xs">
                  These are standard Azure/Microsoft services typically not relevant for enterprise architecture.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Additional Toggles */}
      {(onToggleThirdParty || onToggleUnknown) && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
          {onToggleThirdParty && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Third Party Apps</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showThirdParty}
                  onChange={(e) => onToggleThirdParty(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          )}

          {onToggleUnknown && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle size={16} className="text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Unknown Apps</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showUnknown}
                  onChange={(e) => onToggleUnknown(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          )}
        </div>
      )}

      {/* Tenant Domains */}
      {tenantDomains.length > 0 && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Info size={14} className="text-gray-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Tenant Domains</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {tenantDomains.map((domain, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
              >
                {domain}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Classification Details (Expandable) */}
      {classificationStats && (
        <div className="p-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <span>Classification Details</span>
            {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showDetails && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <div className="text-gray-500 dark:text-gray-400">Total Classified</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{classificationStats.totalClassified}</div>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <div className="text-gray-500 dark:text-gray-400">High Confidence Hidden</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{classificationStats.highConfidenceExclusions}</div>
                </div>
              </div>

              {Object.keys(classificationStats.reasonsBreakdown).length > 0 && (
                <div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Top Classification Reasons
                  </div>
                  <div className="space-y-1">
                    {Object.entries(classificationStats.reasonsBreakdown)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([reason, count]) => (
                        <div key={reason} className="flex justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400 truncate" title={reason}>
                            {reason.replace(/_/g, ' ')}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white ml-2">{count}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApplicationFilterPanel;
