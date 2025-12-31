/**
 * Azure Service Principal Credentials Discovered View
 *
 * Displays discovered Azure Service Principal Credentials data:
 * - App registration secrets with expiry dates
 * - App registration certificates
 * - Expired and expiring-soon credentials
 *
 * @module azureserviceprincipalcredentials
 * @category cloud
 */

import React from 'react';
import { DiscoveredViewWrapper } from '../../components/organisms/DiscoveredViewWrapper';

/**
 * Azure Service Principal Credentials discovered data view component
 */
export const AzureServicePrincipalCredentialsDiscoveredView: React.FC = () => {
  return (
    <DiscoveredViewWrapper
      moduleName="Azure Service Principal Credentials"
      csvPath="AzureSecurityDiscovery_ServicePrincipalCredentials.csv"
      title="Azure Service Principal Credentials"
      description="App registration secrets and certificates with expiry tracking and security assessment"
      enableSearch={true}
      enableExport={true}
      data-cy="azure-sp-credentials-discovered-view"
    />
  );
};

export default AzureServicePrincipalCredentialsDiscoveredView;


