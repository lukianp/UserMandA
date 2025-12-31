/**
 * Azure Container Registry Discovered View
 *
 * Displays discovered Azure Container Registry data:
 * - Registry names and login servers
 * - SKU tiers and admin user settings
 * - Network access and zone redundancy configuration
 *
 * @module azureacr
 * @category cloud
 */

import React from 'react';
import { DiscoveredViewWrapper } from '../../components/organisms/DiscoveredViewWrapper';

/**
 * Azure Container Registry discovered data view component
 */
export const AzureACRDiscoveredView: React.FC = () => {
  return (
    <DiscoveredViewWrapper
      moduleName="Azure Container Registries"
      csvPath="AzureACRDiscovery.csv"
      title="Azure Container Registries"
      description="Azure Container Registries with SKU, access settings, and security configuration for container migration"
      enableSearch={true}
      enableExport={true}
      data-cy="azure-acr-discovered-view"
    />
  );
};

export default AzureACRDiscoveredView;


