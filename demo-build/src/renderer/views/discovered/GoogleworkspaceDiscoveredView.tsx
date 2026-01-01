/**
 * Google Workspace Discovered View
 *
 * Displays discovered Google Workspace data:
 * - Google users and groups
 * - Google Drive storage
 * - Gmail mailboxes
 * - Google Calendar resources
 * - Shared drives
 *
 * @module googleworkspace
 * @category cloud
 */

import React from 'react';
import { DiscoveredViewWrapper } from '../../components/organisms/DiscoveredViewWrapper';

/**
 * Google Workspace discovered data view component
 */
export const GoogleworkspaceDiscoveredView: React.FC = () => {
  return (
    <DiscoveredViewWrapper
      moduleName="GoogleWorkspace"
      csvPath="GoogleWorkspaceDiscovery.csv"
      title="Google Workspace"
      description="Google Workspace users, groups, Drive storage, Gmail, and Calendar resources"
      enableSearch={true}
      enableExport={true}
      data-cy="googleworkspace-discovered-view"
    />
  );
};

export default GoogleworkspaceDiscoveredView;


