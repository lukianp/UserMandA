/**
 * Exchange Discovery Logic Hook
 * Contains all business logic for Exchange discovery view
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ColDef } from 'ag-grid-community';

import {
  ExchangeDiscoveryConfig,
  ExchangeDiscoveryResult,
  ExchangeDiscoveryProgress,
  ExchangeDiscoveryTemplate,
  ExchangeMailbox,
  ExchangeDistributionGroup,
  ExchangeTransportRule,
  ExchangeMailboxFilter,
  ExchangeGroupFilter,
  ExchangeRuleFilter,
  ExchangeExportOptions,
  DEFAULT_EXCHANGE_CONFIG,
} from '../types/models/exchange';
import type { ProgressData } from '../../shared/types';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
import { getElectronAPI } from '../lib/electron-api-fallback';
import type { PowerShellLog } from '../components/molecules/PowerShellExecutionDialog';

/**
 * Parse PowerShell date objects into JavaScript Date objects
 * PowerShell serializes dates as complex objects with DateTime property
 */
const parsePowerShellDate = (dateObj: any): Date | undefined => {
  if (!dateObj) {
    console.log('[parsePowerShellDate] Received null/undefined');
    return undefined;
  }

  // Handle PowerShell serialized date objects with DateTime property
  if (dateObj.DateTime) {
    console.log('[parsePowerShellDate] Using DateTime property:', dateObj.DateTime);
    return new Date(dateObj.DateTime);
  }

  // Handle Microsoft JSON date format /Date(timestamp)/
  if (dateObj.value && typeof dateObj.value === 'string' && dateObj.value.startsWith('/Date(')) {
    const timestamp = dateObj.value.match(/\/Date\((\d+)\)\//)?.[1];
    console.log('[parsePowerShellDate] Using /Date() timestamp:', timestamp);
    return timestamp ? new Date(parseInt(timestamp)) : undefined;
  }

  // Handle ISO date strings directly
  if (typeof dateObj === 'string') {
    console.log('[parsePowerShellDate] Using ISO string:', dateObj);
    try {
      return new Date(dateObj);
    } catch {
      return undefined;
    }
  }

  // Fallback for direct date objects
  console.log('[parsePowerShellDate] Using direct date object conversion');
  try {
    return new Date(dateObj);
  } catch {
    return undefined;
  }
};

export function useExchangeDiscoveryLogic() {
  // Get selected company profile from store
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult: addDiscoveryResult, getResultsByModuleName } = useDiscoveryStore();
  // ============================================================================
  // State Management
  // ============================================================================

  const [config, setConfig] = useState<ExchangeDiscoveryConfig>(DEFAULT_EXCHANGE_CONFIG);
  const [result, setResult] = useState<ExchangeDiscoveryResult | null>(null);
  const [progress, setProgress] = useState<ExchangeDiscoveryProgress | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<PowerShellLog[]>([]);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);

  // Templates
  const [templates, setTemplates] = useState<ExchangeDiscoveryTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ExchangeDiscoveryTemplate | null>(null);

  // Filters
  const [mailboxFilter, setMailboxFilter] = useState<ExchangeMailboxFilter>({});
  const [groupFilter, setGroupFilter] = useState<ExchangeGroupFilter>({});
  const [ruleFilter, setRuleFilter] = useState<ExchangeRuleFilter>({});

  // UI state
  const [selectedTab, setSelectedTab] = useState<'overview' | 'mailboxes' | 'groups' | 'rules'>('overview');

  // ============================================================================
  // Utility Functions
  // ============================================================================

  // Utility function for adding logs
  const addLog = useCallback((message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, level }]);
  }, []);

  // ============================================================================
  // Data Fetching
  // ============================================================================

  useEffect(() => {
    loadTemplates();
  }, []);

  // Restore previous discovery results from store on mount
  useEffect(() => {
    const previousResults = getResultsByModuleName('ExchangeDiscovery');
    if (previousResults && previousResults.length > 0) {
      console.log('[ExchangeDiscoveryHook] Restoring', previousResults.length, 'previous results from store');
      const latestResult = previousResults[previousResults.length - 1];
      setResult(latestResult.additionalData as ExchangeDiscoveryResult);
    }
  }, [getResultsByModuleName]);

  // Event handlers for discovery - similar to Azure discovery pattern
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeProgress = window.electron.onDiscoveryProgress((data) => {
      console.log('[ExchangeDiscoveryHook] Progress event received:', data);
      if (data.executionId && data.executionId.startsWith('exchange-discovery-')) {
        // Construct progress message from available properties (no 'message' property on progress events)
        const progressMessage = data.currentPhase
          ? `${data.currentPhase}${data.itemsProcessed !== undefined && data.totalItems !== undefined ? ` (${data.itemsProcessed}/${data.totalItems})` : ''}`
          : 'Processing...';
        addLog(progressMessage, 'info');
        setProgress(data as unknown as ExchangeDiscoveryProgress);
      }
    });

    const unsubscribeOutput = window.electron.onDiscoveryOutput?.((data) => {
      console.log('[ExchangeDiscoveryHook] Output event received:', data);
      if (data.executionId && data.executionId.startsWith('exchange-discovery-')) {
        const logLevel = data.level === 'error' ? 'error' : data.level === 'warning' ? 'warning' : 'info';
        addLog(data.message, logLevel);
      }
    });

    const unsubscribeComplete = window.electron.onDiscoveryComplete((data) => {
      console.log('[ExchangeDiscoveryHook] Complete event received:', data);
      if (data.executionId && data.executionId.startsWith('exchange-discovery-')) {
        // ENHANCED: Robust data extraction handling multiple PowerShell output formats
        // PowerShellReturnValue can be: { Success, Data: {...}, RecordCount, ... } OR { success, data: {...} } OR direct data
        const executionResult = data.result as any;
        const psReturnValue = executionResult?.data || executionResult; // Handle both formats

        console.log('[ExchangeDiscoveryHook] PowerShell return value:', JSON.stringify(psReturnValue).slice(0, 500));
        console.log('[ExchangeDiscoveryHook] PowerShell return value keys:', Object.keys(psReturnValue || {}));

        // Extract the structured data - handle nested Data property or direct structure
        const structuredData = psReturnValue?.Data || psReturnValue?.data || psReturnValue || {};

        console.log('[ExchangeDiscoveryHook] Structured data type:', Array.isArray(structuredData) ? 'Array' : typeof structuredData);
        console.log('[ExchangeDiscoveryHook] Structured data keys:', Array.isArray(structuredData) ? `Array[${structuredData.length}]` : Object.keys(structuredData));

        // Initialize result containers
        let mailboxes: any[] = [];
        let distributionGroups: any[] = [];
        let transportRules: any[] = [];
        let connectors: any[] = [];
        let publicFolders: any[] = [];
        let mailContacts: any[] = [];

        // Handle both flat array (with _DataType) and structured object formats
        if (Array.isArray(structuredData)) {
          console.log('[ExchangeDiscoveryHook] Processing flat array with _DataType grouping...');
          // Flat array with _DataType property - group by type
          mailboxes = structuredData.filter((item: any) => item._DataType === 'Mailbox' || item._DataType === 'SharedMailbox');
          distributionGroups = structuredData.filter((item: any) => item._DataType === 'DistributionGroup');
          transportRules = structuredData.filter((item: any) => item._DataType === 'TransportRule');
          connectors = structuredData.filter((item: any) => item._DataType === 'Connector');
          publicFolders = structuredData.filter((item: any) => item._DataType === 'PublicFolder');
          mailContacts = structuredData.filter((item: any) => item._DataType === 'MailContact');
        } else {
          console.log('[ExchangeDiscoveryHook] Processing structured object format...');
          // Structured object format - extract arrays (handle both camelCase and PascalCase)
          mailboxes = structuredData.mailboxes || structuredData.Mailboxes || [];
          distributionGroups = structuredData.distributionGroups || structuredData.DistributionGroups || [];
          transportRules = structuredData.transportRules || structuredData.TransportRules || [];
          connectors = structuredData.connectors || structuredData.Connectors || [];
          publicFolders = structuredData.publicFolders || structuredData.PublicFolders || [];
          mailContacts = structuredData.mailContacts || structuredData.MailContacts || [];
        }

        console.log('[ExchangeDiscoveryHook] Extracted counts:', {
          mailboxes: mailboxes.length,
          distributionGroups: distributionGroups.length,
          transportRules: transportRules.length,
          connectors: connectors.length,
          publicFolders: publicFolders.length,
          mailContacts: mailContacts.length
        });

        // DEBUG: Log data samples and column field verification
        console.log('[ExchangeDiscoveryHook] ========== DEBUG DATA VERIFICATION ==========');
        console.log('[ExchangeDiscoveryHook] PowerShell return keys:', Object.keys(psReturnValue || {}));
        if (mailboxes.length > 0) {
          console.log('[ExchangeDiscoveryHook] First mailbox sample:', mailboxes[0]);
          console.log('[ExchangeDiscoveryHook] First mailbox keys:', Object.keys(mailboxes[0]));
        }
        if (distributionGroups.length > 0) {
          console.log('[ExchangeDiscoveryHook] First group sample:', distributionGroups[0]);
          console.log('[ExchangeDiscoveryHook] First group keys:', Object.keys(distributionGroups[0]));
        }
        console.log('[ExchangeDiscoveryHook] Mailbox column fields:', mailboxColumns.map(c => c.field));
        console.log('[ExchangeDiscoveryHook] Group column fields:', groupColumns.map(c => c.field));
        console.log('[ExchangeDiscoveryHook] ========================================');

        // Build the ExchangeDiscoveryResult with all required properties
        const exchangeResult: ExchangeDiscoveryResult = {
          // Required metadata properties
          id: psReturnValue?.id || `exchange-discovery-${Date.now()}`,
          discoveredBy: 'ExchangeDiscovery',
          environment: 'Online',

          // Timing properties - use parsePowerShellDate to handle complex date objects
          startTime: parsePowerShellDate(psReturnValue?.startTime) || new Date(),
          endTime: parsePowerShellDate(psReturnValue?.endTime),
          duration: psReturnValue?.duration || 0,
          status: 'completed',

          // Configuration
          config: config,

          // Data arrays (using extracted data)
          mailboxes: mailboxes,
          distributionGroups: distributionGroups,
          transportRules: transportRules,
          connectors: connectors,
          publicFolders: publicFolders,

          // Statistics and errors
          statistics: psReturnValue?.statistics || {
            totalMailboxes: mailboxes.length,
            totalDistributionGroups: distributionGroups.length,
            totalTransportRules: transportRules.length,
            totalConnectors: connectors.length,
            totalPublicFolders: publicFolders.length
          },
          errors: (psReturnValue?.Errors || []).map((err: any) => ({
            message: typeof err === 'string' ? err : err.message || 'Unknown error',
            timestamp: new Date(),
            severity: 'error' as const
          })),
          warnings: (psReturnValue?.Warnings || []).map((warn: any) => ({
            message: typeof warn === 'string' ? warn : warn.message || 'Unknown warning',
            timestamp: new Date(),
            severity: 'warning' as const
          })),
        };

        console.log('[ExchangeDiscoveryHook] Final exchangeResult:', exchangeResult);
        console.log('[ExchangeDiscoveryHook] Final exchangeResult.mailboxes:', exchangeResult.mailboxes?.length || 0);
        console.log('[ExchangeDiscoveryHook] Final exchangeResult.distributionGroups:', exchangeResult.distributionGroups?.length || 0);

        setResult(exchangeResult);
        setIsDiscovering(false);
        setProgress(null);

        const mailboxCount = exchangeResult?.mailboxes?.length || 0;
        const groupCount = exchangeResult?.distributionGroups?.length || 0;
        addLog(`Exchange discovery completed: ${mailboxCount} mailboxes, ${groupCount} groups`, 'success');

        // Store result in discovery store for persistence
        const discoveryResult = {
          id: `exchange-discovery-${Date.now()}`,
          name: 'Exchange Discovery',
          moduleName: 'ExchangeDiscovery',
          displayName: 'Exchange Online Discovery',
          itemCount: mailboxCount + groupCount,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: '',
          success: true,
          summary: `Discovered ${mailboxCount} mailboxes, ${groupCount} groups`,
          errorMessage: '',
          additionalData: exchangeResult,
          createdAt: new Date().toISOString(),
        };
        addDiscoveryResult(discoveryResult);
      }
    });

    const unsubscribeError = window.electron.onDiscoveryError((data) => {
      console.log('[ExchangeDiscoveryHook] Error event received:', data);
      if (data.executionId && data.executionId.startsWith('exchange-discovery-')) {
        setError(data.error);
        addLog(`Error: ${data.error}`, 'error');
        setIsDiscovering(false);
        setProgress(null);
      }
    });

    return () => {
      if (unsubscribeProgress) unsubscribeProgress();
      if (unsubscribeOutput) unsubscribeOutput();
      if (unsubscribeComplete) unsubscribeComplete();
      if (unsubscribeError) unsubscribeError();
    };
  }, [addDiscoveryResult, addLog]);

  const loadTemplates = async () => {
    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/ExchangeDiscovery.psm1',
        functionName: 'Get-ExchangeDiscoveryTemplates',
        parameters: {},
      });
      setTemplates((result.data as any)?.templates || []);
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  // ============================================================================
  // Discovery Execution
  // ============================================================================

  const startDiscovery = useCallback(async () => {
    // Check if a profile is selected
    if (!selectedSourceProfile) {
      const errorMessage = 'No company profile selected. Please select a profile first.';
      setError(errorMessage);
      addLog(errorMessage, 'error');
      return;
    }

    console.log(`[ExchangeDiscoveryHook] Starting Exchange discovery for company: ${selectedSourceProfile.companyName}`);
    console.log(`[ExchangeDiscoveryHook] Parameters:`, config);

    setIsDiscovering(true);
    setError(null);
    setLogs([]);
    setShowExecutionDialog(true);
    addLog(`Starting Exchange discovery for ${selectedSourceProfile.companyName}...`, 'info');

    const token = `exchange-discovery-${Date.now()}`;

    setProgress({
      phase: 'initializing',
      phaseLabel: 'Initializing Exchange discovery...',
      percentComplete: 0,
      itemsProcessed: 0,
      totalItems: 0,
      errors: 0,
      warnings: 0,
    });

    try {
      // Use the streaming discovery handler for real-time updates
      const result = await window.electron.executeDiscovery({
        moduleName: 'Exchange',
        parameters: {
          // Profile information (passed as parameters, not as top-level property)
          ProfileName: selectedSourceProfile?.companyName || 'Default',
          TenantId: selectedSourceProfile?.tenantId || '',

          // Discovery options
          DiscoverMailboxes: config.discoverMailboxes,
          DiscoverDistributionGroups: config.discoverDistributionGroups,
          DiscoverTransportRules: config.discoverTransportRules,
          DiscoverConnectors: config.discoverConnectors,
          DiscoverPublicFolders: config.discoverPublicFolders,
          IncludeArchiveData: config.includeArchiveData,
          IncludeMailboxPermissions: config.includeMailboxPermissions,
          IncludeMailboxStatistics: config.includeMailboxStatistics,
          IncludeMobileDevices: config.includeMobileDevices,
          IncludeGroupMembership: config.includeGroupMembership,
          IncludeNestedGroups: config.includeNestedGroups,
          showWindow: false,
          timeout: 300000,
        },
        executionId: token,
      });

      if (result.success) {
        console.log(`[ExchangeDiscoveryHook] ✅ Exchange discovery completed successfully`);
        addLog('Exchange discovery completed successfully', 'success');
      } else {
        console.error(`[ExchangeDiscoveryHook] ❌ Exchange discovery failed:`, result.error);
        const errorMsg = result.error || 'Discovery failed';
        setError(errorMsg);
        addLog(errorMsg, 'error');
        setIsDiscovering(false);
        setProgress(null);
      }
    } catch (err) {
      console.error(`[ExchangeDiscoveryHook] Error:`, err);
      const errorMsg = err instanceof Error ? err.message : 'Discovery failed';
      setError(errorMsg);
      addLog(errorMsg, 'error');
      setIsDiscovering(false);
      setProgress(null);
    }
  }, [config, selectedSourceProfile, addLog]);

  const cancelDiscovery = useCallback(async () => {
    try {
      await window.electron.cancelDiscovery('exchange-discovery');
      setIsDiscovering(false);
      setProgress(null);
    } catch (err) {
      console.error('Failed to cancel discovery:', err);
    }
  }, []);

  // ============================================================================
  // Template Management
  // ============================================================================

  const loadTemplate = useCallback((template: ExchangeDiscoveryTemplate) => {
    setSelectedTemplate(template);
    setConfig(template.config);
  }, []);

  const saveAsTemplate = useCallback(async (name: string, description: string) => {
    try {
      await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/ExchangeDiscovery.psm1',
        functionName: 'Save-ExchangeDiscoveryTemplate',
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

  const filteredMailboxes = useMemo(() => {
    console.log('[DEBUG filteredMailboxes] ========== START ==========');
    console.log('[DEBUG filteredMailboxes] result exists:', !!result);
    console.log('[DEBUG filteredMailboxes] result?.mailboxes exists:', !!result?.mailboxes);
    console.log('[DEBUG filteredMailboxes] result?.mailboxes type:', typeof result?.mailboxes);
    console.log('[DEBUG filteredMailboxes] result?.mailboxes isArray:', Array.isArray(result?.mailboxes));
    console.log('[DEBUG filteredMailboxes] result?.mailboxes length:', result?.mailboxes?.length);
    console.log('[DEBUG filteredMailboxes] result?.mailboxes[0]:', result?.mailboxes?.[0]);

    // More robust check
    if (!result || !result.mailboxes || !Array.isArray(result.mailboxes) || result.mailboxes.length === 0) {
      console.log('[DEBUG filteredMailboxes] No valid mailbox data, returning []');
      console.log('[DEBUG filteredMailboxes] - result:', !!result);
      console.log('[DEBUG filteredMailboxes] - result.mailboxes:', !!result?.mailboxes);
      console.log('[DEBUG filteredMailboxes] - isArray:', Array.isArray(result?.mailboxes));
      console.log('[DEBUG filteredMailboxes] - length:', result?.mailboxes?.length);
      return [];
    }

    console.log('[DEBUG filteredMailboxes] Filtering', result.mailboxes.length, 'mailboxes');

    const filtered = result.mailboxes.filter((mailbox) => {
      // Search text
      if (mailboxFilter.searchText) {
        const search = mailboxFilter.searchText.toLowerCase();
        const matches =
          (mailbox.displayName ?? '').toLowerCase().includes(search) ||
          (mailbox.userPrincipalName ?? '').toLowerCase().includes(search) ||
          (mailbox.primarySmtpAddress ?? '').toLowerCase().includes(search);
        if (!matches) return false;
      }

      // Mailbox types
      if (mailboxFilter.mailboxTypes?.length) {
        if (!mailboxFilter.mailboxTypes.includes(mailbox.mailboxType)) return false;
      }

      // Size filters
      if (mailboxFilter.minSize !== undefined && mailbox.totalItemSize < mailboxFilter.minSize) {
        return false;
      }
      if (mailboxFilter.maxSize !== undefined && mailbox.totalItemSize > mailboxFilter.maxSize) {
        return false;
      }

      // Inactive filter
      if (mailboxFilter.isInactive !== undefined && mailbox.isInactive !== mailboxFilter.isInactive) {
        return false;
      }

      // Archive filter
      if (mailboxFilter.hasArchive !== undefined && mailbox.archiveEnabled !== mailboxFilter.hasArchive) {
        return false;
      }

      // Litigation hold
      if (mailboxFilter.hasLitigationHold !== undefined && mailbox.litigationHoldEnabled !== mailboxFilter.hasLitigationHold) {
        return false;
      }

      return true;
    });

    console.log('[DEBUG filteredMailboxes] Filtered result length:', filtered.length);
    console.log('[DEBUG filteredMailboxes] ========== END ==========');
    return filtered;
  }, [result, mailboxFilter]);

  const filteredGroups = useMemo(() => {
    console.log('[DEBUG filteredGroups] result?.distributionGroups length:', result?.distributionGroups?.length || 0);

    if (!result || !result.distributionGroups || !Array.isArray(result.distributionGroups) || result.distributionGroups.length === 0) {
      return [];
    }

    const filtered = result.distributionGroups.filter((group) => {
      if (groupFilter.searchText) {
        const search = groupFilter.searchText.toLowerCase();
        const matches =
          (group.displayName ?? '').toLowerCase().includes(search) ||
          (group.primarySmtpAddress ?? '').toLowerCase().includes(search) ||
          (group.alias ?? '').toLowerCase().includes(search);
        if (!matches) return false;
      }

      if (groupFilter.groupTypes?.length) {
        if (!groupFilter.groupTypes.includes(group.groupType)) return false;
      }

      if (groupFilter.minMemberCount !== undefined && group.memberCount < groupFilter.minMemberCount) {
        return false;
      }

      if (groupFilter.maxMemberCount !== undefined && group.memberCount > groupFilter.maxMemberCount) {
        return false;
      }

      if (groupFilter.moderationEnabled !== undefined && group.moderationEnabled !== groupFilter.moderationEnabled) {
        return false;
      }

      if (groupFilter.hiddenFromAddressList !== undefined && group.hiddenFromAddressListsEnabled !== groupFilter.hiddenFromAddressList) {
        return false;
      }

      return true;
    });

    console.log('[DEBUG filteredGroups] Filtered result length:', filtered.length);
    return filtered;
  }, [result, groupFilter]);

  const filteredRules = useMemo(() => {
    if (!result || !result.transportRules || !Array.isArray(result.transportRules) || result.transportRules.length === 0) {
      return [];
    }

    const filtered = result.transportRules.filter((rule) => {
      if (ruleFilter.searchText) {
        const search = ruleFilter.searchText.toLowerCase();
        const matches =
          (rule.name ?? '').toLowerCase().includes(search) ||
          rule.description?.toLowerCase().includes(search);
        if (!matches) return false;
      }

      if (ruleFilter.state?.length) {
        if (!ruleFilter.state.includes(rule.state)) return false;
      }

      if (ruleFilter.priority) {
        if (ruleFilter.priority.min !== undefined && rule.priority < ruleFilter.priority.min) {
          return false;
        }
        if (ruleFilter.priority.max !== undefined && rule.priority > ruleFilter.priority.max) {
          return false;
        }
      }

      return true;
    });

    return filtered;
  }, [result, ruleFilter]);

  // ============================================================================
  // AG Grid Column Definitions
  // ============================================================================

  const mailboxColumns = useMemo<ColDef<ExchangeMailbox>[]>(
    () => [
      {
        field: 'DisplayName', // ✅ PascalCase to match PowerShell output
        headerName: 'Display Name',
        sortable: true,
        filter: true,
        pinned: 'left',
        width: 200,
      },
      {
        field: 'UserPrincipalName', // ✅ PascalCase
        headerName: 'UPN',
        sortable: true,
        filter: true,
        width: 250,
      },
      {
        field: 'PrimarySmtpAddress', // ✅ PascalCase
        headerName: 'Email',
        sortable: true,
        filter: true,
        width: 250,
      },
      {
        field: 'MailboxType', // ✅ PascalCase
        headerName: 'Type',
        sortable: true,
        filter: true,
        width: 150,
      },
      {
        field: 'TotalItemSize', // ✅ PascalCase
        headerName: 'Size (MB)',
        sortable: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => {
          const value = params.value;
          if (value === null || value === undefined || isNaN(value)) return 'N/A';
          return (Number(value) / 1024 / 1024).toFixed(2);
        },
        width: 120,
      },
      {
        field: 'ItemCount', // ✅ PascalCase
        headerName: 'Item Count',
        sortable: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => {
          const value = params.value;
          if (value === null || value === undefined || isNaN(value)) return 'N/A';
          return Number(value).toLocaleString();
        },
        width: 120,
      },
      {
        field: 'ArchiveEnabled', // ✅ PascalCase
        headerName: 'Archive',
        sortable: true,
        filter: true,
        valueFormatter: (params) => (params.value ? 'Yes' : 'No'),
        width: 100,
      },
      {
        field: 'LitigationHoldEnabled', // ✅ PascalCase
        headerName: 'Litigation Hold',
        sortable: true,
        filter: true,
        valueFormatter: (params) => (params.value ? 'Yes' : 'No'),
        width: 140,
      },
      {
        field: 'IsInactive', // ✅ PascalCase
        headerName: 'Status',
        sortable: true,
        filter: true,
        valueFormatter: (params) => (params.value ? 'Inactive' : 'Active'),
        width: 100,
      },
      {
        field: 'LastLogonTime', // ✅ PascalCase
        headerName: 'Last Logon',
        sortable: true,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => {
          if (!params.value) return 'Never';
          // Handle PowerShell date format
          if (params.value.value && params.value.value.startsWith('/Date(')) {
            const ts = params.value.value.match(/\/Date\((\d+)\)\//)?.[1];
            return ts ? new Date(parseInt(ts)).toLocaleDateString() : 'Invalid';
          }
          if (params.value.DateTime) {
            return new Date(params.value.DateTime).toLocaleDateString();
          }
          return new Date(params.value).toLocaleDateString();
        },
        width: 120,
      },
    ],
    []
  );

  const groupColumns = useMemo<ColDef<ExchangeDistributionGroup>[]>(
    () => [
      {
        field: 'DisplayName', // ✅ PascalCase to match PowerShell output
        headerName: 'Display Name',
        sortable: true,
        filter: true,
        pinned: 'left',
        width: 200,
      },
      {
        field: 'PrimarySmtpAddress', // ✅ PascalCase
        headerName: 'Email',
        sortable: true,
        filter: true,
        width: 250,
      },
      {
        field: 'GroupType', // ✅ PascalCase
        headerName: 'Type',
        sortable: true,
        filter: true,
        width: 120,
      },
      {
        field: 'MemberCount', // ✅ PascalCase
        headerName: 'Members',
        sortable: true,
        filter: 'agNumberColumnFilter',
        width: 100,
      },
      {
        field: 'ModerationEnabled', // ✅ PascalCase
        headerName: 'Moderation',
        sortable: true,
        filter: true,
        valueFormatter: (params) => (params.value ? 'Yes' : 'No'),
        width: 120,
      },
      {
        field: 'HiddenFromAddressListsEnabled', // ✅ PascalCase
        headerName: 'Hidden',
        sortable: true,
        filter: true,
        valueFormatter: (params) => (params.value ? 'Yes' : 'No'),
        width: 100,
      },
      {
        field: 'WhenCreated', // ✅ PascalCase
        headerName: 'Created',
        sortable: true,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => {
          if (!params.value) return 'N/A';
          // Handle PowerShell date format
          if (params.value.value && params.value.value.startsWith('/Date(')) {
            const ts = params.value.value.match(/\/Date\((\d+)\)\//)?.[1];
            return ts ? new Date(parseInt(ts)).toLocaleDateString() : 'Invalid';
          }
          if (params.value.DateTime) {
            return new Date(params.value.DateTime).toLocaleDateString();
          }
          return new Date(params.value).toLocaleDateString();
        },
        width: 120,
      },
    ],
    []
  );

  const ruleColumns = useMemo<ColDef<ExchangeTransportRule>[]>(
    () => [
      {
        field: 'Name', // ✅ PascalCase to match PowerShell output
        headerName: 'Rule Name',
        sortable: true,
        filter: true,
        pinned: 'left',
        width: 250,
      },
      {
        field: 'Description', // ✅ PascalCase
        headerName: 'Description',
        sortable: true,
        filter: true,
        width: 300,
      },
      {
        field: 'Priority', // ✅ PascalCase
        headerName: 'Priority',
        sortable: true,
        filter: 'agNumberColumnFilter',
        width: 100,
      },
      {
        field: 'State', // ✅ PascalCase
        headerName: 'State',
        sortable: true,
        filter: true,
        width: 100,
      },
      {
        field: 'CreatedBy', // ✅ PascalCase
        headerName: 'Created By',
        sortable: true,
        filter: true,
        width: 150,
      },
      {
        field: 'CreatedDate', // ✅ PascalCase
        headerName: 'Created',
        sortable: true,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => {
          if (!params.value) return 'N/A';
          // Handle PowerShell date format
          if (params.value.value && params.value.value.startsWith('/Date(')) {
            const ts = params.value.value.match(/\/Date\((\d+)\)\//)?.[1];
            return ts ? new Date(parseInt(ts)).toLocaleDateString() : 'Invalid';
          }
          if (params.value.DateTime) {
            return new Date(params.value.DateTime).toLocaleDateString();
          }
          return new Date(params.value).toLocaleDateString();
        },
        width: 120,
      },
      {
        field: 'ModifiedDate', // ✅ PascalCase
        headerName: 'Modified',
        sortable: true,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => {
          if (!params.value) return 'N/A';
          // Handle PowerShell date format
          if (params.value.value && params.value.value.startsWith('/Date(')) {
            const ts = params.value.value.match(/\/Date\((\d+)\)\//)?.[1];
            return ts ? new Date(parseInt(ts)).toLocaleDateString() : 'Invalid';
          }
          if (params.value.DateTime) {
            return new Date(params.value.DateTime).toLocaleDateString();
          }
          return new Date(params.value).toLocaleDateString();
        },
        width: 120,
      },
    ],
    []
  );

  // ============================================================================
  // Export Functionality
  // ============================================================================

  const exportData = useCallback(async (options: ExchangeExportOptions) => {
    if (!result) return;

    try {
      await window.electronAPI.executeModule({
        modulePath: 'Modules/Export/ExportService.psm1',
        functionName: 'Export-ExchangeDiscoveryData',
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
    logs,
    showExecutionDialog,
    setShowExecutionDialog,

    // Templates
    templates,
    selectedTemplate,
    loadTemplate,
    saveAsTemplate,

    // Discovery control
    startDiscovery,
    cancelDiscovery,

    // Filtered data
    mailboxes: filteredMailboxes,
    groups: filteredGroups,
    rules: filteredRules,

    // Filters
    mailboxFilter,
    setMailboxFilter,
    groupFilter,
    setGroupFilter,
    ruleFilter,
    setRuleFilter,

    // AG Grid columns
    mailboxColumns,
    groupColumns,
    ruleColumns,

    // Export
    exportData,

    // UI
    selectedTab,
    setSelectedTab,

    // Statistics (from result)
    statistics: result?.statistics,

  };
}
