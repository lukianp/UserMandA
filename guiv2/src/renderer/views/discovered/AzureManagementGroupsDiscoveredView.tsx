/**
 * Azure Management Groups Discovered View
 *
 * Displays discovered Azure Management Groups data:
 * - Management Group hierarchy and structure
 * - Parent-child relationships
 * - Subscription assignments
 *
 * @module azuremanagementgroups
 * @category cloud
 */

import React from 'react';
import { DiscoveredViewWrapper } from '../../components/organisms/DiscoveredViewWrapper';

/**
 * Azure Management Groups discovered data view component
 */
export const AzureManagementGroupsDiscoveredView: React.FC = () => {
  return (
    <DiscoveredViewWrapper
      moduleName="Azure Management Groups"
      csvPath="AzureSecurityDiscovery_ManagementGroups.csv"
      title="Azure Management Groups"
      description="Azure Management Group hierarchy, subscriptions, and governance structure for security assessment"
      enableSearch={true}
      enableExport={true}
      data-cy="azure-mgmt-groups-discovered-view"
    />
  );
};

export default AzureManagementGroupsDiscoveredView;


