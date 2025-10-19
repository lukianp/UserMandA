/**
 * Microsoft Teams Discovery Logic Hook
 * Contains all business logic for Teams discovery view
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ColDef } from 'ag-grid-community';
import {
  TeamsDiscoveryConfig,
  TeamsDiscoveryResult,
  TeamsDiscoveryProgress,
  TeamsDiscoveryTemplate,
  Team,
  TeamChannel,
  TeamMember,
  TeamApp,
  TeamFilter,
  ChannelFilter,
  MemberFilter,
  AppFilter,
  TeamsExportOptions,
  DEFAULT_TEAMS_CONFIG,
} from '../types/models/teams';
import type { ProgressData } from '../../shared/types';

export function useTeamsDiscoveryLogic() {
  // ============================================================================
  // State Management
  // ============================================================================

  const [config, setConfig] = useState<TeamsDiscoveryConfig>(DEFAULT_TEAMS_CONFIG);
  const [result, setResult] = useState<TeamsDiscoveryResult | null>(null);
  const [progress, setProgress] = useState<TeamsDiscoveryProgress | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Templates
  const [templates, setTemplates] = useState<TeamsDiscoveryTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TeamsDiscoveryTemplate | null>(null);

  // Filters
  const [teamFilter, setTeamFilter] = useState<TeamFilter>({});
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>({});
  const [memberFilter, setMemberFilter] = useState<MemberFilter>({});
  const [appFilter, setAppFilter] = useState<AppFilter>({});

  // UI state
  const [selectedTab, setSelectedTab] = useState<'overview' | 'teams' | 'channels' | 'members'>('overview');

  // ============================================================================
  // Data Fetching
  // ============================================================================

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/TeamsDiscovery.psm1',
        functionName: 'Get-TeamsDiscoveryTemplates',
        parameters: {},
      });
      setTemplates(result.data?.templates || []);
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  // ============================================================================
  // Discovery Execution
  // ============================================================================

  const startDiscovery = useCallback(async () => {
    setIsDiscovering(true);
    setError(null);
    setProgress({
      phase: 'initializing',
      phaseLabel: 'Initializing Teams discovery...',
      percentComplete: 0,
      itemsProcessed: 0,
      totalItems: 0,
      errors: 0,
      warnings: 0,
    });

    try {
      const unsubscribe = window.electronAPI.onProgress((data: ProgressData) => {
        // Convert ProgressData to TeamsDiscoveryProgress
        const progressData: TeamsDiscoveryProgress = {
          phase: 'initializing',
          phaseLabel: data.message || 'Processing...',
          percentComplete: data.percentage,
          itemsProcessed: data.itemsProcessed || 0,
          totalItems: data.totalItems || 0,
          errors: 0,
          warnings: 0,
        };
        setProgress(progressData);
      });

      const discoveryResult = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/TeamsDiscovery.psm1',
        functionName: 'Invoke-TeamsDiscovery',
        parameters: {
          Config: config,
        },
      });

      if (discoveryResult.success && discoveryResult.data) {
        setResult(discoveryResult.data as TeamsDiscoveryResult);
      } else {
        throw new Error(discoveryResult.error || 'Discovery failed');
      }
      setProgress(null);
      unsubscribe();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Discovery failed');
      setProgress(null);
    } finally {
      setIsDiscovering(false);
    }
  }, [config]);

  const cancelDiscovery = useCallback(async () => {
    try {
      await window.electronAPI.cancelExecution('teams-discovery');
      setIsDiscovering(false);
      setProgress(null);
    } catch (err) {
      console.error('Failed to cancel discovery:', err);
    }
  }, []);

  // ============================================================================
  // Template Management
  // ============================================================================

  const loadTemplate = useCallback((template: TeamsDiscoveryTemplate) => {
    setSelectedTemplate(template);
    setConfig(template.config);
  }, []);

  const saveAsTemplate = useCallback(async (name: string, description: string) => {
    try {
      await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/TeamsDiscovery.psm1',
        functionName: 'Save-TeamsDiscoveryTemplate',
        parameters: {
          Name: name,
          Description: description,
          Config: config,
        },
      });
      await loadTemplates();
    } catch (err) {
      console.error('Failed to save template:', err);
      throw err;
    }
  }, [config]);

  // ============================================================================
  // Filtered Data
  // ============================================================================

  const filteredTeams = useMemo(() => {
    if (!result?.teams) return [];

    return result.teams.filter((team) => {
      if (teamFilter.searchText) {
        const search = teamFilter.searchText.toLowerCase();
        const matches =
          team.displayName.toLowerCase().includes(search) ||
          team.description?.toLowerCase().includes(search) ||
          team.mailNickname.toLowerCase().includes(search);
        if (!matches) return false;
      }

      if (teamFilter.visibility?.length) {
        if (!teamFilter.visibility.includes(team.visibility)) return false;
      }

      if (teamFilter.minMemberCount !== undefined && team.memberCount < teamFilter.minMemberCount) {
        return false;
      }

      if (teamFilter.maxMemberCount !== undefined && team.memberCount > teamFilter.maxMemberCount) {
        return false;
      }

      if (teamFilter.isArchived !== undefined && team.isArchived !== teamFilter.isArchived) {
        return false;
      }

      if (teamFilter.hasGuests !== undefined) {
        const hasGuests = team.guestCount > 0;
        if (hasGuests !== teamFilter.hasGuests) return false;
      }

      if (teamFilter.classification?.length) {
        if (!team.classification || !teamFilter.classification.includes(team.classification)) {
          return false;
        }
      }

      return true;
    });
  }, [result?.teams, teamFilter]);

  const filteredChannels = useMemo(() => {
    if (!result?.channels) return [];

    return result.channels.filter((channel) => {
      if (channelFilter.searchText) {
        const search = channelFilter.searchText.toLowerCase();
        const matches =
          channel.displayName.toLowerCase().includes(search) ||
          channel.description?.toLowerCase().includes(search);
        if (!matches) return false;
      }

      if (channelFilter.channelTypes?.length) {
        if (!channelFilter.channelTypes.includes(channel.channelType)) return false;
      }

      if (channelFilter.minMessageCount !== undefined && channel.messageCount < channelFilter.minMessageCount) {
        return false;
      }

      if (channelFilter.hasFiles !== undefined) {
        const hasFiles = (channel.fileCount ?? 0) > 0;
        if (hasFiles !== channelFilter.hasFiles) return false;
      }

      return true;
    });
  }, [result?.channels, channelFilter]);

  const filteredMembers = useMemo(() => {
    if (!result?.members) return [];

    return result.members.filter((member) => {
      if (memberFilter.searchText) {
        const search = memberFilter.searchText.toLowerCase();
        const matches =
          member.displayName.toLowerCase().includes(search) ||
          member.email.toLowerCase().includes(search) ||
          member.userPrincipalName.toLowerCase().includes(search);
        if (!matches) return false;
      }

      if (memberFilter.roles?.length) {
        if (!memberFilter.roles.includes(member.role)) return false;
      }

      if (memberFilter.isGuest !== undefined && member.isGuest !== memberFilter.isGuest) {
        return false;
      }

      if (memberFilter.accountEnabled !== undefined && member.accountEnabled !== memberFilter.accountEnabled) {
        return false;
      }

      if (memberFilter.hasLicense !== undefined) {
        const hasLicense = member.assignedLicenses.length > 0;
        if (hasLicense !== memberFilter.hasLicense) return false;
      }

      return true;
    });
  }, [result?.members, memberFilter]);

  const filteredApps = useMemo(() => {
    if (!result?.apps) return [];

    return result.apps.filter((app) => {
      if (appFilter.searchText) {
        const search = appFilter.searchText.toLowerCase();
        const matches = app.displayName.toLowerCase().includes(search);
        if (!matches) return false;
      }

      if (appFilter.distributionMethods?.length) {
        if (!appFilter.distributionMethods.includes(app.distributionMethod)) return false;
      }

      return true;
    });
  }, [result?.apps, appFilter]);

  // ============================================================================
  // AG Grid Column Definitions
  // ============================================================================

  const teamColumns = useMemo<ColDef<Team>[]>(
    () => [
      {
        field: 'displayName',
        headerName: 'Team Name',
        sortable: true,
        filter: true,
        pinned: 'left',
        width: 250,
      },
      {
        field: 'description',
        headerName: 'Description',
        sortable: true,
        filter: true,
        width: 300,
      },
      {
        field: 'visibility',
        headerName: 'Visibility',
        sortable: true,
        filter: true,
        width: 120,
      },
      {
        field: 'memberCount',
        headerName: 'Members',
        sortable: true,
        filter: 'agNumberColumnFilter',
        width: 100,
      },
      {
        field: 'ownerCount',
        headerName: 'Owners',
        sortable: true,
        filter: 'agNumberColumnFilter',
        width: 90,
      },
      {
        field: 'guestCount',
        headerName: 'Guests',
        sortable: true,
        filter: 'agNumberColumnFilter',
        width: 90,
      },
      {
        field: 'channelCount',
        headerName: 'Channels',
        sortable: true,
        filter: 'agNumberColumnFilter',
        width: 100,
      },
      {
        field: 'isArchived',
        headerName: 'Status',
        sortable: true,
        filter: true,
        valueFormatter: (params) => (params.value ? 'Archived' : 'Active'),
        width: 100,
      },
      {
        field: 'lastActivityDate',
        headerName: 'Last Activity',
        sortable: true,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) =>
          params.value ? new Date(params.value).toLocaleDateString() : 'N/A',
        width: 130,
      },
      {
        field: 'createdDateTime',
        headerName: 'Created',
        sortable: true,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
        width: 120,
      },
    ],
    []
  );

  const channelColumns = useMemo<ColDef<TeamChannel>[]>(
    () => [
      {
        field: 'displayName',
        headerName: 'Channel Name',
        sortable: true,
        filter: true,
        pinned: 'left',
        width: 250,
      },
      {
        field: 'channelType',
        headerName: 'Type',
        sortable: true,
        filter: true,
        width: 120,
      },
      {
        field: 'description',
        headerName: 'Description',
        sortable: true,
        filter: true,
        width: 300,
      },
      {
        field: 'messageCount',
        headerName: 'Messages',
        sortable: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => params.value.toLocaleString(),
        width: 110,
      },
      {
        field: 'replyCount',
        headerName: 'Replies',
        sortable: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => params.value.toLocaleString(),
        width: 100,
      },
      {
        field: 'memberCount',
        headerName: 'Members',
        sortable: true,
        filter: 'agNumberColumnFilter',
        width: 100,
      },
      {
        field: 'fileCount',
        headerName: 'Files',
        sortable: true,
        filter: 'agNumberColumnFilter',
        width: 80,
      },
      {
        field: 'lastActivityDate',
        headerName: 'Last Activity',
        sortable: true,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) =>
          params.value ? new Date(params.value).toLocaleDateString() : 'N/A',
        width: 130,
      },
    ],
    []
  );

  const memberColumns = useMemo<ColDef<TeamMember>[]>(
    () => [
      {
        field: 'displayName',
        headerName: 'Display Name',
        sortable: true,
        filter: true,
        pinned: 'left',
        width: 200,
      },
      {
        field: 'email',
        headerName: 'Email',
        sortable: true,
        filter: true,
        width: 250,
      },
      {
        field: 'role',
        headerName: 'Role',
        sortable: true,
        filter: true,
        width: 100,
      },
      {
        field: 'isGuest',
        headerName: 'Type',
        sortable: true,
        filter: true,
        valueFormatter: (params) => (params.value ? 'Guest' : 'Member'),
        width: 100,
      },
      {
        field: 'accountEnabled',
        headerName: 'Account Status',
        sortable: true,
        filter: true,
        valueFormatter: (params) => (params.value ? 'Active' : 'Disabled'),
        width: 130,
      },
      {
        field: 'messageCount',
        headerName: 'Messages',
        sortable: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => params.value?.toLocaleString() ?? 'N/A',
        width: 100,
      },
      {
        field: 'lastActiveDate',
        headerName: 'Last Active',
        sortable: true,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) =>
          params.value ? new Date(params.value).toLocaleDateString() : 'N/A',
        width: 120,
      },
    ],
    []
  );

  const appColumns = useMemo<ColDef<TeamApp>[]>(
    () => [
      {
        field: 'displayName',
        headerName: 'App Name',
        sortable: true,
        filter: true,
        pinned: 'left',
        width: 250,
      },
      {
        field: 'version',
        headerName: 'Version',
        sortable: true,
        filter: true,
        width: 100,
      },
      {
        field: 'distributionMethod',
        headerName: 'Distribution',
        sortable: true,
        filter: true,
        width: 140,
      },
      {
        field: 'installedBy',
        headerName: 'Installed By',
        sortable: true,
        filter: true,
        width: 200,
      },
      {
        field: 'installedDate',
        headerName: 'Installed',
        sortable: true,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) =>
          params.value ? new Date(params.value).toLocaleDateString() : 'N/A',
        width: 120,
      },
    ],
    []
  );

  // ============================================================================
  // Export Functionality
  // ============================================================================

  const exportData = useCallback(async (options: TeamsExportOptions) => {
    if (!result) return;

    try {
      await window.electronAPI.executeModule({
        modulePath: 'Modules/Export/ExportService.psm1',
        functionName: 'Export-TeamsDiscoveryData',
        parameters: {
          Result: result,
          Options: options,
        },
      });
    } catch (err) {
      console.error('Failed to export data:', err);
      throw err;
    }
  }, [result]);

  // ============================================================================
  // Return Hook API
  // ============================================================================

  return {
    // State
    config,
    setConfig,
    result,
    currentResult: result,
    progress,
    isDiscovering,
    error,

    // Templates
    templates,
    selectedTemplate,
    loadTemplate,
    saveAsTemplate,

    // Discovery control
    startDiscovery,
    cancelDiscovery,

    // Filtered data
    teams: filteredTeams,
    channels: filteredChannels,
    members: filteredMembers,
    apps: filteredApps,

    // Filters
    teamFilter,
    setTeamFilter,
    channelFilter,
    setChannelFilter,
    memberFilter,
    setMemberFilter,
    appFilter,
    setAppFilter,

    // AG Grid columns
    teamColumns,
    channelColumns,
    memberColumns,
    appColumns,

    // Export
    exportData,

    // UI
    selectedTab,
    setSelectedTab,

    // Statistics
    statistics: result?.statistics,
  
  };
}
