/**
 * Azure Key Vault Access Discovered View
 *
 * Displays discovered Azure Key Vault access policy data:
 * - Key Vault access policies
 * - Principals with secrets, keys, and certificates permissions
 * - Security flags for full access detection
 *
 * @module azurekeyvaultaccess
 * @category cloud
 */

import React from 'react';
import { DiscoveredViewWrapper } from '../../components/organisms/DiscoveredViewWrapper';

/**
 * Azure Key Vault Access discovered data view component
 */
export const AzureKeyVaultAccessDiscoveredView: React.FC = () => {
  return (
    <DiscoveredViewWrapper
      moduleName="Azure Key Vault Access"
      csvPath="AzureSecurityDiscovery_KeyVaultAccessPolicies.csv"
      title="Azure Key Vault Access Policies"
      description="Key Vault access policies showing principals with secrets, keys, and certificates permissions"
      enableSearch={true}
      enableExport={true}
      data-cy="azure-keyvault-access-discovered-view"
    />
  );
};

export default AzureKeyVaultAccessDiscoveredView;
