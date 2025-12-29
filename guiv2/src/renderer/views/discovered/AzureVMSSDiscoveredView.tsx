/**
 * Azure VM Scale Sets Discovered View
 *
 * Displays discovered Azure Virtual Machine Scale Sets data:
 * - Scale Set names, SKUs, and instance counts
 * - Network configuration (VNet, Subnet)
 * - Resource group and location mapping
 *
 * @module azurevmss
 * @category cloud
 */

import React from 'react';
import { DiscoveredViewWrapper } from '../../components/organisms/DiscoveredViewWrapper';

/**
 * Azure VM Scale Sets discovered data view component
 */
export const AzureVMSSDiscoveredView: React.FC = () => {
  return (
    <DiscoveredViewWrapper
      moduleName="Azure VM Scale Sets"
      csvPath="AzureVMSSDiscovery.csv"
      title="Azure VM Scale Sets"
      description="Azure VM Scale Sets with capacity, networking, and scaling configuration for infrastructure assessment"
      enableSearch={true}
      enableExport={true}
      data-cy="azure-vmss-discovered-view"
    />
  );
};

export default AzureVMSSDiscoveredView;
