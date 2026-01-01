/**
 * Azure Storage Account Access Discovered View
 *
 * Displays discovered Azure Storage Account Access data:
 * - Storage accounts with security settings
 * - Network rules and public access configuration
 * - Encryption and TLS settings
 *
 * @module azurestorageaccountaccess
 * @category cloud
 */

import React from 'react';
import { DiscoveredViewWrapper } from '../../components/organisms/DiscoveredViewWrapper';

/**
 * Azure Storage Account Access discovered data view component
 */
export const AzureStorageAccountAccessDiscoveredView: React.FC = () => {
  return (
    <DiscoveredViewWrapper
      moduleName="Azure Storage Account Access"
      csvPath="AzureSecurityDiscovery_StorageAccountAccess.csv"
      title="Azure Storage Account Access"
      description="Storage account security settings including network rules, encryption, and public access configuration"
      enableSearch={true}
      enableExport={true}
      data-cy="azure-storage-access-discovered-view"
    />
  );
};

export default AzureStorageAccountAccessDiscoveredView;


