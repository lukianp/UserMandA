/**
 * Azure Logic Apps Discovered View
 *
 * Displays discovered Azure Logic Apps data:
 * - Logic App names and workflow states
 * - Trigger counts and run history
 * - Resource group and location mapping
 *
 * @module azurelogicapps
 * @category cloud
 */

import React from 'react';
import { DiscoveredViewWrapper } from '../../components/organisms/DiscoveredViewWrapper';

/**
 * Azure Logic Apps discovered data view component
 */
export const AzureLogicAppsDiscoveredView: React.FC = () => {
  return (
    <DiscoveredViewWrapper
      moduleName="Azure Logic Apps"
      csvPath="AzureResourceDiscovery_LogicApps.csv"
      title="Azure Logic Apps"
      description="Azure Logic Apps with triggers, run history, and workflow configuration for infrastructure assessment"
      enableSearch={true}
      enableExport={true}
      data-cy="azure-logicapps-discovered-view"
    />
  );
};

export default AzureLogicAppsDiscoveredView;


