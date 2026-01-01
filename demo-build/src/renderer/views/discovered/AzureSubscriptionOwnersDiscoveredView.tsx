/**
 * Azure Subscription Owners Discovered View
 *
 * Displays discovered Azure Subscription Owners data:
 * - Subscription owner role assignments
 * - Principal details for each owner
 * - Control plane access mapping
 *
 * @module azuresubscriptionowners
 * @category security
 */

import React from 'react';
import { DiscoveredViewWrapper } from '../../components/organisms/DiscoveredViewWrapper';

/**
 * Azure Subscription Owners discovered data view component
 */
export const AzureSubscriptionOwnersDiscoveredView: React.FC = () => {
  return (
    <DiscoveredViewWrapper
      moduleName="Azure Subscription Owners"
      csvPath="AzureSecurityDiscovery_SubscriptionOwners.csv"
      title="Azure Subscription Owners"
      description="Azure subscription owner role assignments and control plane access for security assessment"
      enableSearch={true}
      enableExport={true}
      data-cy="azure-sub-owners-discovered-view"
    />
  );
};

export default AzureSubscriptionOwnersDiscoveredView;


