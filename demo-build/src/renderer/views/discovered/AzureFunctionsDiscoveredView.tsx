/**
 * Azure Function Apps Discovered View
 *
 * Displays discovered Azure Function Apps data:
 * - Function App names and runtime versions
 * - Hosting configuration (App Service Plan)
 * - State, hostnames, and HTTPS settings
 *
 * @module azurefunctions
 * @category cloud
 */

import React from 'react';
import { DiscoveredViewWrapper } from '../../components/organisms/DiscoveredViewWrapper';

/**
 * Azure Function Apps discovered data view component
 */
export const AzureFunctionsDiscoveredView: React.FC = () => {
  return (
    <DiscoveredViewWrapper
      moduleName="Azure Function Apps"
      csvPath="AzureFunctionsDiscovery.csv"
      title="Azure Function Apps"
      description="Azure Function Apps with runtime, hosting, and serverless configuration for cloud migration planning"
      enableSearch={true}
      enableExport={true}
      data-cy="azure-functions-discovered-view"
    />
  );
};

export default AzureFunctionsDiscoveredView;


