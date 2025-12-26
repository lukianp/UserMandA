/**
 * Example Integration: Decision "Why?" Panel
 *
 * Shows how to integrate DecisionWhyPanel into entity detail views.
 * This can be added as a tab in UserDetailView, GroupDetailView, etc.
 *
 * Based on Decision Traces architecture in CLAUDE.local.md
 */

import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import DecisionWhyPanel from '../molecules/DecisionWhyPanel';

/**
 * Example: User Detail View with "Why?" tab
 */
export const UserDetailViewWithWhyPanel: React.FC<{
  userId: string;
  userPrincipalName: string;
  profileId: string;
}> = ({ userId, userPrincipalName, profileId }) => {
  const [selectedTab, setSelectedTab] = React.useState(0);

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={selectedTab} onChange={(_, value) => setSelectedTab(value)}>
        <Tab label="Overview" />
        <Tab label="Permissions" />
        <Tab label="Devices" />
        <Tab label="Applications" />
        <Tab label="Groups" />
        <Tab label="Why?" /> {/* Decision Timeline Tab */}
      </Tabs>

      <Box sx={{ p: 3 }}>
        {selectedTab === 0 && <div>Overview Content...</div>}
        {selectedTab === 1 && <div>Permissions Content...</div>}
        {selectedTab === 2 && <div>Devices Content...</div>}
        {selectedTab === 3 && <div>Applications Content...</div>}
        {selectedTab === 4 && <div>Groups Content...</div>}
        {selectedTab === 5 && (
          <DecisionWhyPanel
            entityId={userId}
            profileId={profileId}
          />
        )}
      </Box>
    </Box>
  );
};

/**
 * Example: Group Detail View with "Why?" tab
 */
export const GroupDetailViewWithWhyPanel: React.FC<{
  groupId: string;
  groupName: string;
  profileId: string;
}> = ({ groupId, groupName, profileId }) => {
  const [selectedTab, setSelectedTab] = React.useState(0);

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={selectedTab} onChange={(_, value) => setSelectedTab(value)}>
        <Tab label="Overview" />
        <Tab label="Members" />
        <Tab label="Permissions" />
        <Tab label="Applications" />
        <Tab label="Why?" />
      </Tabs>

      <Box sx={{ p: 3 }}>
        {selectedTab === 0 && <div>Overview Content...</div>}
        {selectedTab === 1 && <div>Members Content...</div>}
        {selectedTab === 2 && <div>Permissions Content...</div>}
        {selectedTab === 3 && <div>Applications Content...</div>}
        {selectedTab === 4 && (
          <DecisionWhyPanel
            entityId={groupId}
            profileId={profileId}
          />
        )}
      </Box>
    </Box>
  );
};

/**
 * Example: Application Detail View with "Why?" tab
 */
export const ApplicationDetailViewWithWhyPanel: React.FC<{
  applicationId: string;
  applicationName: string;
  profileId: string;
}> = ({ applicationId, applicationName, profileId }) => {
  const [selectedTab, setSelectedTab] = React.useState(0);

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={selectedTab} onChange={(_, value) => setSelectedTab(value)}>
        <Tab label="Overview" />
        <Tab label="Users" />
        <Tab label="Servers" />
        <Tab label="Dependencies" />
        <Tab label="Migration" />
        <Tab label="Why?" />
      </Tabs>

      <Box sx={{ p: 3 }}>
        {selectedTab === 0 && <div>Overview Content...</div>}
        {selectedTab === 1 && <div>Users Content...</div>}
        {selectedTab === 2 && <div>Servers Content...</div>}
        {selectedTab === 3 && <div>Dependencies Content...</div>}
        {selectedTab === 4 && <div>Migration Planning...</div>}
        {selectedTab === 5 && (
          <DecisionWhyPanel
            entityId={applicationId}
            profileId={profileId}
          />
        )}
      </Box>
    </Box>
  );
};

/**
 * Example: Infrastructure Detail View with "Why?" tab
 */
export const InfrastructureDetailViewWithWhyPanel: React.FC<{
  computerId: string;
  computerName: string;
  profileId: string;
}> = ({ computerId, computerName, profileId }) => {
  const [selectedTab, setSelectedTab] = React.useState(0);

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={selectedTab} onChange={(_, value) => setSelectedTab(value)}>
        <Tab label="Overview" />
        <Tab label="Hardware" />
        <Tab label="Software" />
        <Tab label="Users" />
        <Tab label="Network" />
        <Tab label="Why?" />
      </Tabs>

      <Box sx={{ p: 3 }}>
        {selectedTab === 0 && <div>Overview Content...</div>}
        {selectedTab === 1 && <div>Hardware Specs...</div>}
        {selectedTab === 2 && <div>Installed Software...</div>}
        {selectedTab === 3 && <div>Assigned Users...</div>}
        {selectedTab === 4 && <div>Network Info...</div>}
        {selectedTab === 5 && (
          <DecisionWhyPanel
            entityId={computerId}
            profileId={profileId}
          />
        )}
      </Box>
    </Box>
  );
};

/**
 * Example: Standalone "Why?" Panel (for testing)
 */
export const StandaloneDecisionWhyPanel: React.FC = () => {
  // Example usage with mock data
  const mockEntityId = 'user-12345-abcd-6789-ef01';
  const mockProfileId = 'contoso-tenant';

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', my: 4 }}>
      <DecisionWhyPanel
        entityId={mockEntityId}
        profileId={mockProfileId}
      />
    </Box>
  );
};

export default {
  UserDetailViewWithWhyPanel,
  GroupDetailViewWithWhyPanel,
  ApplicationDetailViewWithWhyPanel,
  InfrastructureDetailViewWithWhyPanel,
  StandaloneDecisionWhyPanel,
};
