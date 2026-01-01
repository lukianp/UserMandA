/**
 * Office 365 Discovered View
 *
 * Displays discovered Office 365 tenant data:
 * - Microsoft 365 subscriptions and licenses
 * - Service health and configuration
 * - Tenant settings
 * - Admin roles
 * - Compliance settings
 *
 * @module office365
 * @category cloud
 */

import React from 'react';
import { DiscoveredViewWrapper } from '../../components/organisms/DiscoveredViewWrapper';

/**
 * Office 365 discovered data view component
 */
export const Office365DiscoveredView: React.FC = () => {
  return (
    <DiscoveredViewWrapper
      moduleName="Office365"
      csvPath="Office365Discovery.csv"
      title="Office 365"
      description="Microsoft 365 tenant configuration, subscriptions, licenses, and admin settings"
      enableSearch={true}
      enableExport={true}
      data-cy="office365-discovered-view"
    />
  );
};

export default Office365DiscoveredView;


