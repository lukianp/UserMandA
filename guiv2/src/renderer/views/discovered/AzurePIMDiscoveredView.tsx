/**
 * Azure PIM Eligible Roles Discovered View
 *
 * Displays discovered Azure PIM Eligible Roles data:
 * - PIM eligible role assignments
 * - Principal to privileged role mappings
 * - High-privilege role identification
 *
 * @module azurepim
 * @category security
 */

import React from 'react';
import { DiscoveredViewWrapper } from '../../components/organisms/DiscoveredViewWrapper';

/**
 * Azure PIM Eligible Roles discovered data view component
 */
export const AzurePIMDiscoveredView: React.FC = () => {
  return (
    <DiscoveredViewWrapper
      moduleName="Azure PIM Eligible Roles"
      csvPath="AzureSecurityDiscovery_PIMEligibleRoles.csv"
      title="Azure PIM Eligible Roles"
      description="Privileged Identity Management eligible role assignments for security assessment"
      enableSearch={true}
      enableExport={true}
      data-cy="azure-pim-discovered-view"
    />
  );
};

export default AzurePIMDiscoveredView;
