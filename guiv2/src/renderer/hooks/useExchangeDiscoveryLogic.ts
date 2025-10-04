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

export function useExchangeDiscoveryLogic() {
  // ============================================================================
  // State Management
  // ============================================================================

  const [config, setConfig] = useState<ExchangeDiscoveryConfig>(DEFAULT_EXCHANGE_CONFIG);
  const [result, setResult] = useState<ExchangeDiscoveryResult | null>(null);
  const [progress, setProgress] = useState<ExchangeDiscoveryProgress | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  // Data Fetching
  // ============================================================================

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/ExchangeDiscovery.psm1',
        functionName: 'Get-ExchangeDiscoveryTemplates',
        parameters: {},
      });
      setTemplates(result.templates || []);
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
      phaseLabel: 'Initializing Exchange discovery...',
      percentComplete: 0,
      itemsProcessed: 0,
      totalItems: 0,
      errors: 0,
      warnings: 0,
    });

    try {
      // Set up progress listener
      const unsubscribe = window.electronAPI.onProgress((data: ExchangeDiscoveryProgress) => {
        setProgress(data);
      });

      // Execute discovery
      const discoveryResult = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/ExchangeDiscovery.psm1',
        functionName: 'Invoke-ExchangeDiscovery',
        parameters: {
          Config: config,
        },
      });

      setResult(discoveryResult);
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
      await window.electronAPI.cancelExecution('exchange-discovery');
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
    if (!result?.mailboxes) return [];

    return result.mailboxes.filter((mailbox) => {
      // Search text
      if (mailboxFilter.searchText) {
        const search = mailboxFilter.searchText.toLowerCase();
        const matches =
          mailbox.displayName.toLowerCase().includes(search) ||
          mailbox.userPrincipalName.toLowerCase().includes(search) ||
          mailbox.primarySmtpAddress.toLowerCase().includes(search);
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
  }, [result?.mailboxes, mailboxFilter]);

  const filteredGroups = useMemo(() => {
    if (!result?.distributionGroups) return [];

    return result.distributionGroups.filter((group) => {
      if (groupFilter.searchText) {
        const search = groupFilter.searchText.toLowerCase();
        const matches =
          group.displayName.toLowerCase().includes(search) ||
          group.primarySmtpAddress.toLowerCase().includes(search) ||
          group.alias.toLowerCase().includes(search);
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
  }, [result?.distributionGroups, groupFilter]);

  const filteredRules = useMemo(() => {
    if (!result?.transportRules) return [];

    return result.transportRules.filter((rule) => {
      if (ruleFilter.searchText) {
        const search = ruleFilter.searchText.toLowerCase();
        const matches =
          rule.name.toLowerCase().includes(search) ||
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
  }, [result?.transportRules, ruleFilter]);

  // ============================================================================
  // AG Grid Column Definitions
  // ============================================================================

  const mailboxColumns = useMemo<ColDef<ExchangeMailbox>[]>(
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
        field: 'userPrincipalName',
        headerName: 'UPN',
        sortable: true,
        filter: true,
        width: 250,
      },
      {
        field: 'primarySmtpAddress',
        headerName: 'Email',
        sortable: true,
        filter: true,
        width: 250,
      },
      {
        field: 'mailboxType',
        headerName: 'Type',
        sortable: true,
        filter: true,
        width: 150,
      },
      {
        field: 'totalItemSize',
        headerName: 'Size (MB)',
        sortable: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => (params.value / 1024 / 1024).toFixed(2),
        width: 120,
      },
      {
        field: 'itemCount',
        headerName: 'Item Count',
        sortable: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => params.value.toLocaleString(),
        width: 120,
      },
      {
        field: 'archiveEnabled',
        headerName: 'Archive',
        sortable: true,
        filter: true,
        valueFormatter: (params) => (params.value ? 'Yes' : 'No'),
        width: 100,
      },
      {
        field: 'litigationHoldEnabled',
        headerName: 'Litigation Hold',
        sortable: true,
        filter: true,
        valueFormatter: (params) => (params.value ? 'Yes' : 'No'),
        width: 140,
      },
      {
        field: 'isInactive',
        headerName: 'Status',
        sortable: true,
        filter: true,
        valueFormatter: (params) => (params.value ? 'Inactive' : 'Active'),
        width: 100,
      },
      {
        field: 'lastLogonTime',
        headerName: 'Last Logon',
        sortable: true,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) =>
          params.value ? new Date(params.value).toLocaleDateString() : 'Never',
        width: 120,
      },
    ],
    []
  );

  const groupColumns = useMemo<ColDef<ExchangeDistributionGroup>[]>(
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
        field: 'primarySmtpAddress',
        headerName: 'Email',
        sortable: true,
        filter: true,
        width: 250,
      },
      {
        field: 'groupType',
        headerName: 'Type',
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
        field: 'moderationEnabled',
        headerName: 'Moderation',
        sortable: true,
        filter: true,
        valueFormatter: (params) => (params.value ? 'Yes' : 'No'),
        width: 120,
      },
      {
        field: 'hiddenFromAddressListsEnabled',
        headerName: 'Hidden',
        sortable: true,
        filter: true,
        valueFormatter: (params) => (params.value ? 'Yes' : 'No'),
        width: 100,
      },
      {
        field: 'whenCreated',
        headerName: 'Created',
        sortable: true,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
        width: 120,
      },
    ],
    []
  );

  const ruleColumns = useMemo<ColDef<ExchangeTransportRule>[]>(
    () => [
      {
        field: 'name',
        headerName: 'Rule Name',
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
        field: 'priority',
        headerName: 'Priority',
        sortable: true,
        filter: 'agNumberColumnFilter',
        width: 100,
      },
      {
        field: 'state',
        headerName: 'State',
        sortable: true,
        filter: true,
        width: 100,
      },
      {
        field: 'createdBy',
        headerName: 'Created By',
        sortable: true,
        filter: true,
        width: 150,
      },
      {
        field: 'createdDate',
        headerName: 'Created',
        sortable: true,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
        width: 120,
      },
      {
        field: 'modifiedDate',
        headerName: 'Modified',
        sortable: true,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
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
