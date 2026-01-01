/**
 * Azure Automation Accounts Discovered View
 *
 * Displays discovered Azure Automation Accounts data:
 * - Automation Account names and states
 * - Runbook, schedule, and credential counts
 * - Resource group and location mapping
 *
 * @module azureautomation
 * @category cloud
 */

import React from 'react';
import { DiscoveredViewWrapper } from '../../components/organisms/DiscoveredViewWrapper';

/**
 * Azure Automation Accounts discovered data view component
 */
export const AzureAutomationDiscoveredView: React.FC = () => {
  return (
    <DiscoveredViewWrapper
      moduleName="Azure Automation Accounts"
      csvPath="AzureResourceDiscovery_AutomationAccounts.csv"
      title="Azure Automation Accounts"
      description="Azure Automation Accounts with runbooks, schedules, variables, and credentials for infrastructure assessment"
      enableSearch={true}
      enableExport={true}
      data-cy="azure-automation-discovered-view"
    />
  );
};

export default AzureAutomationDiscoveredView;


