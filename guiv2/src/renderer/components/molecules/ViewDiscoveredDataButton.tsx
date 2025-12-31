/**
 * ViewDiscoveredDataButton Component
 * Navigation button to go from discovery view to discovered data view
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Database } from 'lucide-react';
import { Button } from '../atoms/Button';
import Badge from '../atoms/Badge';
import { getDiscoveredRoute, getViewDataLabel } from '../../constants/discoveryRouteMapping';

interface ViewDiscoveredDataButtonProps {
  /** Module ID for auto-lookup (e.g., 'azure-resource') - preferred */
  moduleId?: string;
  /** Explicit path override (e.g., '/discovered/azureresource') */
  discoveredPath?: string;
  /** Button label (e.g., 'View Active Directory Data') - auto-generated if moduleId provided */
  label?: string;
  /** Disable the button if no data exists */
  disabled?: boolean;
  /** Number of records to show in badge */
  recordCount?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Reusable navigation button for discovery views
 * Placed at the bottom of discovery views to navigate to the related discovered data view
 *
 * Usage with moduleId (preferred - auto-looks up route and label):
 *   <ViewDiscoveredDataButton moduleId="azure-resource" />
 *
 * Usage with explicit path:
 *   <ViewDiscoveredDataButton discoveredPath="/discovered/azureresource" label="View Azure Resource Data" />
 */
export function ViewDiscoveredDataButton({
  moduleId,
  discoveredPath,
  label,
  disabled = false,
  recordCount,
  className = '',
}: ViewDiscoveredDataButtonProps) {
  const navigate = useNavigate();

  // Resolve the target path: explicit path takes precedence, then lookup by moduleId
  const targetPath = discoveredPath || (moduleId ? getDiscoveredRoute(moduleId) : '');

  // Resolve the label: explicit label takes precedence, then auto-generate from moduleId
  const buttonLabel = label || (moduleId ? getViewDataLabel(moduleId) : 'View Discovered Data');

  const handleClick = () => {
    if (!disabled && targetPath) {
      navigate(targetPath);
    }
  };

  return (
    <div className={`mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      <Button
        onClick={handleClick}
        disabled={disabled || !targetPath}
        variant="secondary"
        className="w-full justify-center gap-2"
      >
        <Database className="w-4 h-4" />
        <span>{buttonLabel}</span>
        {recordCount !== undefined && recordCount > 0 && (
          <Badge variant="default" size="sm" className="ml-2">
            {recordCount.toLocaleString()} records
          </Badge>
        )}
        <ArrowRight className="w-4 h-4 ml-auto" />
      </Button>
      {disabled && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          Run discovery first to view data
        </p>
      )}
    </div>
  );
}

export default ViewDiscoveredDataButton;
