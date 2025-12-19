/**
 * Azure Infrastructure Discovered View
 *
 * Displays discovered Azure Resource Manager (ARM) infrastructure data:
 * - Subscriptions and Resource Groups
 * - Virtual Machines and Compute resources
 * - Storage Accounts and Blob Containers
 * - Virtual Networks and Network Security Groups
 * - Key Vaults and Managed Identities
 *
 * @module azureresource
 * @category cloud
 */

import React from 'react';
import { DiscoveredViewWrapper } from '../../components/organisms/DiscoveredViewWrapper';

/**
 * Azure Infrastructure discovered data view component
 */
export const AzureresourceDiscoveredView: React.FC = () => {
  return (
    <DiscoveredViewWrapper
      moduleName="Azure Infrastructure"
      csvPath="AzureResourceDiscovery.csv"
      title="Azure Infrastructure"
      description="Azure subscriptions, VMs, storage accounts, networking, and Key Vaults discovered for infrastructure migration planning"
      enableSearch={true}
      enableExport={true}
      data-cy="azureresource-discovered-view"
    />
  );
};

export default AzureresourceDiscoveredView;
