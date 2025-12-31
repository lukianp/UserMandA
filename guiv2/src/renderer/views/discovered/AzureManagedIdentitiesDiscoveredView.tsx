/**
 * Azure Managed Identities Discovered View
 *
 * Displays discovered Azure Managed Identities data:
 * - User-assigned managed identities
 * - System-assigned managed identities
 * - Role assignments per identity
 *
 * @module azuremanagedidentities
 * @category cloud
 */

import React from 'react';
import { DiscoveredViewWrapper } from '../../components/organisms/DiscoveredViewWrapper';

/**
 * Azure Managed Identities discovered data view component
 */
export const AzureManagedIdentitiesDiscoveredView: React.FC = () => {
  return (
    <DiscoveredViewWrapper
      moduleName="Azure Managed Identities"
      csvPath="AzureSecurityDiscovery_ManagedIdentities.csv"
      title="Azure Managed Identities"
      description="User-assigned and system-assigned managed identities with their role assignments"
      enableSearch={true}
      enableExport={true}
      data-cy="azure-managed-identities-discovered-view"
    />
  );
};

export default AzureManagedIdentitiesDiscoveredView;


