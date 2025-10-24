/**
 * Unit Tests for useTeamsDiscoveryLogic Hook
 * Tests all business logic for Microsoft Teams discovery functionality
 */

import { renderHook, act, waitFor } from '@testing-library/react';

import type { TeamsDiscoveryResult, Team, TeamChannel, TeamMember, TeamApp } from '../types/models/teams';

import { useTeamsDiscoveryLogic } from './useTeamsDiscoveryLogic';

// Mock electron API
const mockElectronAPI = {
  executeModule: jest.fn(),
  cancelExecution: jest.fn(),
  onProgress: jest.fn(() => jest.fn()),
};

// Setup window.electronAPI mock
beforeAll(() => {
  Object.defineProperty(window, 'electronAPI', {
    writable: true,
    value: mockElectronAPI,
  });
});

describe('useTeamsDiscoveryLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for templates loading
    mockElectronAPI.executeModule.mockResolvedValue({
      success: true,
      data: { templates: [] },
    });
  });

  // ============================================================================
  // Initial State Tests
  // ============================================================================

  describe('Initial State', () => {
    it('should initialize with default config', () => {
      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      expect(result.current.config).toBeDefined();
      expect(result.current.result).toBeNull();
      expect(result.current.progress).toBeNull();
      expect(result.current.isDiscovering).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should load templates on mount', async () => {
      const mockTemplates = [
        { id: '1', name: 'Full Teams Discovery', config: {} },
        { id: '2', name: 'Active Teams Only', config: {} },
      ];
      mockElectronAPI.executeModule.mockResolvedValueOnce({
        success: true,
        data: { templates: mockTemplates },
      });

      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      await waitFor(() => {
        expect(result.current.templates).toEqual(mockTemplates);
      });

      expect(mockElectronAPI.executeModule).toHaveBeenCalledWith({
        modulePath: 'Modules/Discovery/TeamsDiscovery.psm1',
        functionName: 'Get-TeamsDiscoveryTemplates',
        parameters: {},
      });
    });

    it('should initialize with empty filters', () => {
      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      expect(result.current.teamFilter).toEqual({});
      expect(result.current.channelFilter).toEqual({});
      expect(result.current.memberFilter).toEqual({});
      expect(result.current.appFilter).toEqual({});
    });

    it('should initialize with overview tab selected', () => {
      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      expect(result.current.selectedTab).toBe('overview');
    });
  });

  // ============================================================================
  // Discovery Execution Tests
  // ============================================================================

  describe('Discovery Execution', () => {
    it('should start discovery successfully', async () => {
      const mockResult: TeamsDiscoveryResult = {
        teams: [
          {
            id: 'team1',
            displayName: 'Sales Team',
            description: 'Sales department collaboration',
            mailNickname: 'sales',
            visibility: 'Private',
            memberCount: 25,
            ownerCount: 3,
            guestCount: 2,
            channelCount: 8,
            isArchived: false,
            classification: 'General',
            lastActivityDate: '2024-01-15T10:00:00Z',
            createdDateTime: '2023-01-01T00:00:00Z',
          },
        ],
        channels: [],
        members: [],
        apps: [],
        statistics: {
          totalTeams: 1,
          totalChannels: 0,
          totalMembers: 0,
          totalApps: 0,
          activeTeams: 1,
          archivedTeams: 0,
          teamsWithGuests: 1,
        },
      };

      mockElectronAPI.executeModule
        .mockResolvedValueOnce({ success: true, data: { templates: [] } }) // Template load
        .mockResolvedValueOnce({
          success: true,
          data: mockResult,
        }); // Discovery

      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      expect(result.current.isDiscovering).toBe(false);
      expect(result.current.result).toEqual(mockResult);
      expect(result.current.error).toBeNull();
    });

    it('should handle discovery failure', async () => {
      const errorMessage = 'Microsoft Teams API unavailable';
      mockElectronAPI.executeModule
        .mockResolvedValueOnce({ success: true, data: { templates: [] } }) // Template load
        .mockRejectedValueOnce(new Error(errorMessage)); // Discovery fails

      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      expect(result.current.isDiscovering).toBe(false);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.result).toBeNull();
    });

    it('should handle discovery with error in result', async () => {
      mockElectronAPI.executeModule
        .mockResolvedValueOnce({ success: true, data: { templates: [] } }) // Template load
        .mockResolvedValueOnce({
          success: false,
          error: 'Insufficient permissions',
        }); // Discovery fails

      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      expect(result.current.error).toBe('Insufficient permissions');
    });

    it('should set progress during discovery', async () => {
      let progressCallback: any;
      mockElectronAPI.onProgress.mockImplementation((cb) => {
        progressCallback = cb;
        return jest.fn();
      });

      mockElectronAPI.executeModule.mockImplementation(() => {
        if (progressCallback) {
          progressCallback({
            message: 'Discovering teams...',
            percentage: 60,
            itemsProcessed: 60,
            totalItems: 100,
          });
        }
        return Promise.resolve({ success: true, data: { teams: [], channels: [], members: [], apps: [], statistics: {} } });
      });

      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      expect(mockElectronAPI.onProgress).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Cancellation Tests
  // ============================================================================

  describe('Discovery Cancellation', () => {
    it('should cancel discovery successfully', async () => {
      mockElectronAPI.cancelExecution.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      await act(async () => {
        await result.current.cancelDiscovery();
      });

      expect(mockElectronAPI.cancelExecution).toHaveBeenCalledWith('teams-discovery');
      expect(result.current.isDiscovering).toBe(false);
      expect(result.current.progress).toBeNull();
    });

    it('should handle cancellation error gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockElectronAPI.cancelExecution.mockRejectedValueOnce(new Error('Cancel failed'));

      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      await act(async () => {
        await result.current.cancelDiscovery();
      });

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  // ============================================================================
  // Template Management Tests
  // ============================================================================

  describe('Template Management', () => {
    it('should load template and apply config', () => {
      const template = {
        id: 'tpl1',
        name: 'Custom Template',
        description: 'Test template',
        config: { includeArchived: false },
      };

      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      act(() => {
        result.current.loadTemplate(template as any);
      });

      expect(result.current.selectedTemplate).toEqual(template);
      expect(result.current.config).toEqual(template.config);
    });

    it('should save template successfully', async () => {
      mockElectronAPI.executeModule
        .mockResolvedValueOnce({ success: true, data: { templates: [] } })
        .mockResolvedValueOnce({ success: true })
        .mockResolvedValueOnce({ success: true, data: { templates: [{ id: 'new', name: 'My Template' }] } });

      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      await act(async () => {
        await result.current.saveAsTemplate('My Template', 'Test description');
      });

      expect(mockElectronAPI.executeModule).toHaveBeenCalledWith({
        modulePath: 'Modules/Discovery/TeamsDiscovery.psm1',
        functionName: 'Save-TeamsDiscoveryTemplate',
        parameters: {
          Name: 'My Template',
          Description: 'Test description',
          Config: expect.any(Object),
        },
      });
    });
  });

  // ============================================================================
  // Team Filtering Tests
  // ============================================================================

  describe('Team Filtering', () => {
    const mockTeams: Team[] = [
      {
        id: 'team1',
        displayName: 'Marketing Team',
        description: 'Marketing collaboration',
        mailNickname: 'marketing',
        visibility: 'Public',
        memberCount: 50,
        ownerCount: 5,
        guestCount: 10,
        channelCount: 15,
        isArchived: false,
        classification: 'General',
        lastActivityDate: '2024-01-15T10:00:00Z',
        createdDateTime: '2023-01-01T00:00:00Z',
      },
      {
        id: 'team2',
        displayName: 'Engineering Team',
        description: 'Engineering projects',
        mailNickname: 'engineering',
        visibility: 'Private',
        memberCount: 30,
        ownerCount: 3,
        guestCount: 0,
        channelCount: 20,
        isArchived: true,
        classification: 'Confidential',
        lastActivityDate: '2023-12-01T10:00:00Z',
        createdDateTime: '2022-06-01T00:00:00Z',
      },
    ];

    beforeEach(() => {
      mockElectronAPI.executeModule.mockResolvedValue({
        success: true,
        data: {
          teams: mockTeams,
          channels: [],
          members: [],
          apps: [],
          statistics: {},
        },
      });
    });

    it('should filter teams by search text', async () => {
      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setTeamFilter({ searchText: 'marketing' });
      });

      expect(result.current.teams).toHaveLength(1);
      expect(result.current.teams[0].displayName).toBe('Marketing Team');
    });

    it('should filter teams by visibility', async () => {
      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setTeamFilter({ visibility: ['Private'] });
      });

      expect(result.current.teams).toHaveLength(1);
      expect(result.current.teams[0].visibility).toBe('Private');
    });

    it('should filter teams by member count range', async () => {
      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setTeamFilter({ minMemberCount: 40, maxMemberCount: 60 });
      });

      expect(result.current.teams).toHaveLength(1);
      expect(result.current.teams[0].memberCount).toBeGreaterThanOrEqual(40);
    });

    it('should filter teams by archived status', async () => {
      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setTeamFilter({ isArchived: true });
      });

      expect(result.current.teams).toHaveLength(1);
      expect(result.current.teams[0].isArchived).toBe(true);
    });

    it('should filter teams by guest presence', async () => {
      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setTeamFilter({ hasGuests: true });
      });

      expect(result.current.teams).toHaveLength(1);
      expect(result.current.teams[0].guestCount).toBeGreaterThan(0);
    });

    it('should filter teams by classification', async () => {
      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setTeamFilter({ classification: ['Confidential'] });
      });

      expect(result.current.teams).toHaveLength(1);
      expect(result.current.teams[0].classification).toBe('Confidential');
    });
  });

  // ============================================================================
  // Channel Filtering Tests
  // ============================================================================

  describe('Channel Filtering', () => {
    const mockChannels: TeamChannel[] = [
      {
        id: 'ch1',
        displayName: 'General',
        description: 'General discussion',
        channelType: 'Standard',
        teamId: 'team1',
        messageCount: 1000,
        replyCount: 500,
        memberCount: 50,
        fileCount: 100,
        lastActivityDate: '2024-01-15T10:00:00Z',
      },
      {
        id: 'ch2',
        displayName: 'Project Alpha',
        description: 'Alpha project channel',
        channelType: 'Private',
        teamId: 'team1',
        messageCount: 200,
        replyCount: 150,
        memberCount: 10,
        fileCount: 25,
        lastActivityDate: '2024-01-10T10:00:00Z',
      },
    ];

    beforeEach(() => {
      mockElectronAPI.executeModule.mockResolvedValue({
        success: true,
        data: {
          teams: [],
          channels: mockChannels,
          members: [],
          apps: [],
          statistics: {},
        },
      });
    });

    it('should filter channels by search text', async () => {
      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setChannelFilter({ searchText: 'alpha' });
      });

      expect(result.current.channels).toHaveLength(1);
      expect(result.current.channels[0].displayName).toBe('Project Alpha');
    });

    it('should filter channels by type', async () => {
      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setChannelFilter({ channelTypes: ['Private'] });
      });

      expect(result.current.channels).toHaveLength(1);
      expect(result.current.channels[0].channelType).toBe('Private');
    });

    it('should filter channels by message count', async () => {
      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setChannelFilter({ minMessageCount: 500 });
      });

      expect(result.current.channels).toHaveLength(1);
      expect(result.current.channels[0].messageCount).toBeGreaterThanOrEqual(500);
    });

    it('should filter channels by file presence', async () => {
      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setChannelFilter({ hasFiles: true });
      });

      expect(result.current.channels).toHaveLength(2);
    });
  });

  // ============================================================================
  // Member Filtering Tests
  // ============================================================================

  describe('Member Filtering', () => {
    const mockMembers: TeamMember[] = [
      {
        id: 'mem1',
        displayName: 'John Doe',
        email: 'john@contoso.com',
        userPrincipalName: 'john@contoso.com',
        teamId: 'team1',
        role: 'Owner',
        isGuest: false,
        accountEnabled: true,
        assignedLicenses: ['E5'],
        messageCount: 500,
        lastActiveDate: '2024-01-15T10:00:00Z',
      },
      {
        id: 'mem2',
        displayName: 'Jane Smith',
        email: 'jane@external.com',
        userPrincipalName: 'jane_external#EXT#@contoso.com',
        teamId: 'team1',
        role: 'Member',
        isGuest: true,
        accountEnabled: true,
        assignedLicenses: [],
        messageCount: 50,
        lastActiveDate: '2024-01-10T10:00:00Z',
      },
    ];

    beforeEach(() => {
      mockElectronAPI.executeModule.mockResolvedValue({
        success: true,
        data: {
          teams: [],
          channels: [],
          members: mockMembers,
          apps: [],
          statistics: {},
        },
      });
    });

    it('should filter members by search text', async () => {
      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setMemberFilter({ searchText: 'john' });
      });

      expect(result.current.members).toHaveLength(1);
      expect(result.current.members[0].displayName).toBe('John Doe');
    });

    it('should filter members by role', async () => {
      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setMemberFilter({ roles: ['Owner'] });
      });

      expect(result.current.members).toHaveLength(1);
      expect(result.current.members[0].role).toBe('Owner');
    });

    it('should filter members by guest status', async () => {
      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setMemberFilter({ isGuest: true });
      });

      expect(result.current.members).toHaveLength(1);
      expect(result.current.members[0].isGuest).toBe(true);
    });

    it('should filter members by account status', async () => {
      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setMemberFilter({ accountEnabled: true });
      });

      expect(result.current.members).toHaveLength(2);
    });

    it('should filter members by license status', async () => {
      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setMemberFilter({ hasLicense: true });
      });

      expect(result.current.members).toHaveLength(1);
      expect(result.current.members[0].assignedLicenses.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // App Filtering Tests
  // ============================================================================

  describe('App Filtering', () => {
    const mockApps: TeamApp[] = [
      {
        id: 'app1',
        displayName: 'Planner',
        teamId: 'team1',
        version: '1.0.0',
        distributionMethod: 'Store',
        installedBy: 'admin@contoso.com',
        installedDate: '2023-01-15T10:00:00Z',
      },
      {
        id: 'app2',
        displayName: 'Custom CRM',
        teamId: 'team1',
        version: '2.5.1',
        distributionMethod: 'Sideloaded',
        installedBy: 'dev@contoso.com',
        installedDate: '2023-06-01T10:00:00Z',
      },
    ];

    beforeEach(() => {
      mockElectronAPI.executeModule.mockResolvedValue({
        success: true,
        data: {
          teams: [],
          channels: [],
          members: [],
          apps: mockApps,
          statistics: {},
        },
      });
    });

    it('should filter apps by search text', async () => {
      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setAppFilter({ searchText: 'crm' });
      });

      expect(result.current.apps).toHaveLength(1);
      expect(result.current.apps[0].displayName).toBe('Custom CRM');
    });

    it('should filter apps by distribution method', async () => {
      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      act(() => {
        result.current.setAppFilter({ distributionMethods: ['Sideloaded'] });
      });

      expect(result.current.apps).toHaveLength(1);
      expect(result.current.apps[0].distributionMethod).toBe('Sideloaded');
    });
  });

  // ============================================================================
  // Export Tests
  // ============================================================================

  describe('Export Functionality', () => {
    it('should export data successfully', async () => {
      mockElectronAPI.executeModule
        .mockResolvedValueOnce({ success: true, data: { templates: [] } }) // Template load
        .mockResolvedValueOnce({ success: true, data: { teams: [], channels: [], members: [], apps: [], statistics: {} } }) // Discovery
        .mockResolvedValueOnce({ success: true }); // Export

      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      await act(async () => {
        await result.current.exportData({ format: 'json', includeTeams: true });
      });

      expect(mockElectronAPI.executeModule).toHaveBeenLastCalledWith({
        modulePath: 'Modules/Export/ExportService.psm1',
        functionName: 'Export-TeamsDiscoveryData',
        parameters: {
          Result: expect.any(Object),
          Options: { format: 'json', includeTeams: true },
        },
      });
    });

    it('should not export when no result available', async () => {
      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      await act(async () => {
        await result.current.exportData({ format: 'csv' });
      });

      expect(mockElectronAPI.executeModule).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================================
  // Column Definitions Tests
  // ============================================================================

  describe('Column Definitions', () => {
    it('should provide team column definitions', () => {
      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      expect(result.current.teamColumns).toBeDefined();
      expect(result.current.teamColumns.length).toBeGreaterThan(0);
      expect(result.current.teamColumns[0].field).toBe('displayName');
    });

    it('should provide channel column definitions', () => {
      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      expect(result.current.channelColumns).toBeDefined();
      expect(result.current.channelColumns.length).toBeGreaterThan(0);
      expect(result.current.channelColumns[0].field).toBe('displayName');
    });

    it('should provide member column definitions', () => {
      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      expect(result.current.memberColumns).toBeDefined();
      expect(result.current.memberColumns.length).toBeGreaterThan(0);
      expect(result.current.memberColumns[0].field).toBe('displayName');
    });

    it('should provide app column definitions', () => {
      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      expect(result.current.appColumns).toBeDefined();
      expect(result.current.appColumns.length).toBeGreaterThan(0);
      expect(result.current.appColumns[0].field).toBe('displayName');
    });
  });

  // ============================================================================
  // UI State Tests
  // ============================================================================

  describe('UI State Management', () => {
    it('should update selected tab', () => {
      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      act(() => {
        result.current.setSelectedTab('teams');
      });

      expect(result.current.selectedTab).toBe('teams');
    });

    it('should update config', () => {
      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      const newConfig = { ...result.current.config, includeArchived: false };

      act(() => {
        result.current.setConfig(newConfig as any);
      });

      expect(result.current.config).toEqual(newConfig);
    });
  });

  // ============================================================================
  // Statistics Tests
  // ============================================================================

  describe('Statistics', () => {
    it('should expose statistics from result', async () => {
      const mockStatistics = {
        totalTeams: 100,
        totalChannels: 500,
        totalMembers: 2500,
        totalApps: 150,
        activeTeams: 90,
        archivedTeams: 10,
        teamsWithGuests: 35,
      };

      mockElectronAPI.executeModule.mockResolvedValue({
        success: true,
        data: {
          teams: [],
          channels: [],
          members: [],
          apps: [],
          statistics: mockStatistics,
        },
      });

      const { result } = renderHook(() => useTeamsDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      expect(result.current.statistics).toEqual(mockStatistics);
    });
  });
});

