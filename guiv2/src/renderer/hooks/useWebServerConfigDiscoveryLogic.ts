/**
 * Web Server Configuration Discovery Logic Hook
 * Contains all business logic for web server configuration discovery
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { ColDef } from 'ag-grid-community';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

// ============================================================================
// Types
// ============================================================================

export type TabType = 'overview' | 'iis-sites' | 'app-pools' | 'bindings' | 'certificates' | 'apache' | 'nginx';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export interface WebServerConfigStats {
  totalIISSites: number;
  runningIISSites: number;
  stoppedIISSites: number;
  totalAppPools: number;
  runningAppPools: number;
  totalBindings: number;
  httpsBindings: number;
  totalSSLCertificates: number;
  expiredCertificates: number;
  apacheVHosts: number;
  nginxServers: number;
}

interface WebServerConfigDiscoveryConfig {
  includeIISSites: boolean;
  includeIISAppPools: boolean;
  includeIISBindings: boolean;
  includeApacheVHosts: boolean;
  includeNginxServers: boolean;
  includeSSLCertificates: boolean;
  maxResults: number;
  timeout: number;
  showWindow: boolean;
}

interface WebServerConfigDiscoveryResult {
  totalIISSites?: number;
  totalAppPools?: number;
  totalBindings?: number;
  totalApacheVHosts?: number;
  totalNginxServers?: number;
  totalSSLCertificates?: number;
  totalItems?: number;
  outputPath?: string;
  iisSites?: any[];
  iisAppPools?: any[];
  iisBindings?: any[];
  apacheVHosts?: any[];
  nginxServers?: any[];
  sslCertificates?: any[];
  statistics?: {
    totalWebServers?: number;
    runningWebServers?: number;
    stoppedWebServers?: number;
    httpsEnabledSites?: number;
    expiredCertificates?: number;
    averageAppPoolsPerSite?: number;
  };
}

interface WebServerConfigDiscoveryState {
  config: WebServerConfigDiscoveryConfig;
  result: WebServerConfigDiscoveryResult | null;
  isDiscovering: boolean;
  progress: {
    current: number;
    total: number;
    message: string;
    percentage: number;
  };
  error: string | null;
}

export const useWebServerConfigDiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, getResultsByModuleName } = useDiscoveryStore();
  const currentTokenRef = useRef<string | null>(null);

  const [state, setState] = useState<WebServerConfigDiscoveryState>({
    config: {
      includeIISSites: true,
      includeIISAppPools: true,
      includeIISBindings: true,
      includeApacheVHosts: false,
      includeNginxServers: false,
      includeSSLCertificates: true,
      maxResults: 5000,
      timeout: 600,
      showWindow: false,
    },
    result: null,
    isDiscovering: false,
    progress: {
      current: 0,
      total: 100,
      message: '',
      percentage: 0,
    },
    error: null,
  });

  // Additional state for PowerShellExecutionDialog
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Filter state
  const [filter, setFilter] = useState({
    searchText: '',
    selectedStates: [] as string[],
    showHttpsOnly: false,
    showExpiredCerts: false,
  });

  // Load previous results on mount
  useEffect(() => {
    console.log('[WebServerConfigDiscoveryHook] Loading previous results');
    const previousResults = getResultsByModuleName('WebServerConfigDiscovery');
    if (previousResults && previousResults.length > 0) {
      const latestResult = previousResults[previousResults.length - 1];
      console.log('[WebServerConfigDiscoveryHook] Found previous result:', latestResult);
      setState((prev) => ({
        ...prev,
        result: latestResult.additionalData as WebServerConfigDiscoveryResult,
      }));
    }
  }, [getResultsByModuleName]);

  // Event listeners for PowerShell streaming - Set up ONCE on mount
  useEffect(() => {
    console.log('[WebServerConfigDiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[WebServerConfigDiscoveryHook] Discovery output:', data.message);
        setState((prev) => ({
          ...prev,
          progress: {
            ...prev.progress,
            message: data.message || '',
          },
        }));
      }
    });

    const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.log('[WebServerConfigDiscoveryHook] Discovery completed:', data);

        const discoveryResult = {
          id: `webserverconfig-discovery-${Date.now()}`,
          name: 'Web Server Configuration Discovery',
          moduleName: 'WebServerConfigDiscovery',
          displayName: 'Web Server Configuration Discovery',
          itemCount: data?.result?.totalItems || data?.result?.totalIISSites || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.totalIISSites || 0} IIS sites, ${data?.result?.totalAppPools || 0} application pools, and ${data?.result?.totalSSLCertificates || 0} SSL certificates`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        setState((prev) => ({
          ...prev,
          result: data.result as WebServerConfigDiscoveryResult,
          isDiscovering: false,
          progress: {
            current: 100,
            total: 100,
            message: 'Completed',
            percentage: 100,
          },
        }));

        addResult(discoveryResult);
        console.log(`[WebServerConfigDiscoveryHook] Discovery completed! Found ${discoveryResult.itemCount} items.`);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.error('[WebServerConfigDiscoveryHook] Discovery error:', data.error);
        setState((prev) => ({
          ...prev,
          isDiscovering: false,
          error: data.error,
          progress: {
            current: 0,
            total: 100,
            message: '',
            percentage: 0,
          },
        }));
      }
    });

    const unsubscribeCancelled = window.electron?.onDiscoveryCancelled?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        console.warn('[WebServerConfigDiscoveryHook] Discovery cancelled');
        setState((prev) => ({
          ...prev,
          isDiscovering: false,
          progress: {
            current: 0,
            total: 100,
            message: 'Discovery cancelled',
            percentage: 0,
          },
        }));
      }
    });

    return () => {
      unsubscribeOutput?.();
      unsubscribeComplete?.();
      unsubscribeError?.();
      unsubscribeCancelled?.();
    };
  }, [addResult]);

  const startDiscovery = useCallback(async () => {
    if (!selectedSourceProfile) {
      const errorMessage = 'No company profile selected. Please select a profile first.';
      setState((prev) => ({ ...prev, error: errorMessage }));
      console.error('[WebServerConfigDiscoveryHook]', errorMessage);
      return;
    }

    if (state.isDiscovering) return;

    const token = `webserverconfig-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setState((prev) => ({
      ...prev,
      isDiscovering: true,
      error: null,
      progress: {
        current: 0,
        total: 100,
        message: 'Starting Web Server Configuration discovery...',
        percentage: 0,
      },
    }));

    currentTokenRef.current = token;

    console.log(`[WebServerConfigDiscoveryHook] Starting discovery for company: ${selectedSourceProfile.companyName}`);
    console.log('[WebServerConfigDiscoveryHook] Parameters:', {
      IncludeIISSites: state.config.includeIISSites,
      IncludeIISAppPools: state.config.includeIISAppPools,
      IncludeIISBindings: state.config.includeIISBindings,
      IncludeApacheVHosts: state.config.includeApacheVHosts,
      IncludeNginxServers: state.config.includeNginxServers,
      IncludeSSLCertificates: state.config.includeSSLCertificates,
      MaxResults: state.config.maxResults,
      Timeout: state.config.timeout,
      ShowWindow: state.config.showWindow,
    });

    try {
      const result = await window.electron.executeDiscovery({
        moduleName: 'WebServerConfig',
        parameters: {
          IncludeIISSites: state.config.includeIISSites,
          IncludeIISAppPools: state.config.includeIISAppPools,
          IncludeIISBindings: state.config.includeIISBindings,
          IncludeApacheVHosts: state.config.includeApacheVHosts,
          IncludeNginxServers: state.config.includeNginxServers,
          IncludeSSLCertificates: state.config.includeSSLCertificates,
          MaxResults: state.config.maxResults,
          Timeout: state.config.timeout,
          ShowWindow: state.config.showWindow,
        },
        executionOptions: {
          timeout: state.config.timeout * 1000, // Convert seconds to milliseconds
          showWindow: state.config.showWindow,
        },
        executionId: token,
      });

      console.log('[WebServerConfigDiscoveryHook] Discovery execution initiated:', result);
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred during discovery';
      console.error('[WebServerConfigDiscoveryHook] Discovery failed:', errorMessage);
      setState((prev) => ({
        ...prev,
        isDiscovering: false,
        error: errorMessage,
        progress: {
          current: 0,
          total: 100,
          message: '',
          percentage: 0,
        },
      }));
      currentTokenRef.current = null;
    }
  }, [selectedSourceProfile, state.config, state.isDiscovering]);

  const cancelDiscovery = useCallback(async () => {
    if (!state.isDiscovering || !currentTokenRef.current) return;

    console.warn('[WebServerConfigDiscoveryHook] Cancelling discovery...');

    try {
      await window.electron.cancelDiscovery(currentTokenRef.current);
      console.log('[WebServerConfigDiscoveryHook] Discovery cancellation requested successfully');

      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          isDiscovering: false,
          progress: {
            current: 0,
            total: 100,
            message: 'Discovery cancelled',
            percentage: 0,
          },
        }));
        currentTokenRef.current = null;
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.message || 'Error cancelling discovery';
      console.error('[WebServerConfigDiscoveryHook]', errorMessage);
      setState((prev) => ({
        ...prev,
        isDiscovering: false,
        progress: {
          current: 0,
          total: 100,
          message: '',
          percentage: 0,
        },
      }));
      currentTokenRef.current = null;
    }
  }, [state.isDiscovering]);

  const updateConfig = useCallback((updates: Partial<WebServerConfigDiscoveryConfig>) => {
    setState((prev) => ({
      ...prev,
      config: { ...prev.config, ...updates },
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // ============================================================================
  // Log Management
  // ============================================================================

  const addLog = useCallback((message: string, level: LogEntry['level'] = 'info') => {
    const newLog: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level,
      message,
    };
    setLogs((prev) => [...prev, newLog]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // ============================================================================
  // Filter Management
  // ============================================================================

  const updateFilter = useCallback((updates: Partial<typeof filter>) => {
    setFilter((prev) => ({ ...prev, ...updates }));
  }, []);

  // ============================================================================
  // Column Definitions
  // ============================================================================

  const iisSiteColumns = useMemo<ColDef[]>(
    () => [
      { field: 'Name', headerName: 'Site Name', sortable: true, filter: true, width: 250, pinned: 'left' },
      { field: 'ID', headerName: 'Site ID', sortable: true, filter: true, width: 100 },
      { field: 'State', headerName: 'State', sortable: true, filter: true, width: 120 },
      { field: 'PhysicalPath', headerName: 'Physical Path', sortable: true, filter: true, width: 300 },
      { field: 'ApplicationPool', headerName: 'App Pool', sortable: true, filter: true, width: 200 },
      { field: 'Protocol', headerName: 'Protocol', sortable: true, filter: true, width: 100 },
      { field: 'Port', headerName: 'Port', sortable: true, filter: true, width: 80 },
      { field: 'HostName', headerName: 'Host Name', sortable: true, filter: true, width: 250 },
    ],
    []
  );

  const appPoolColumns = useMemo<ColDef[]>(
    () => [
      { field: 'Name', headerName: 'App Pool Name', sortable: true, filter: true, width: 250, pinned: 'left' },
      { field: 'State', headerName: 'State', sortable: true, filter: true, width: 120 },
      { field: 'ManagedPipelineMode', headerName: 'Pipeline Mode', sortable: true, filter: true, width: 150 },
      { field: 'ManagedRuntimeVersion', headerName: 'Runtime Version', sortable: true, filter: true, width: 150 },
      { field: 'StartMode', headerName: 'Start Mode', sortable: true, filter: true, width: 120 },
      { field: 'Enable32BitAppOnWin64', headerName: '32-bit Enabled', sortable: true, filter: true, width: 130, valueFormatter: (params) => (params.value ? 'Yes' : 'No') },
    ],
    []
  );

  const bindingColumns = useMemo<ColDef[]>(
    () => [
      { field: 'SiteName', headerName: 'Site Name', sortable: true, filter: true, width: 250, pinned: 'left' },
      { field: 'Protocol', headerName: 'Protocol', sortable: true, filter: true, width: 100 },
      { field: 'BindingInformation', headerName: 'Binding Info', sortable: true, filter: true, width: 300 },
      { field: 'HostName', headerName: 'Host Name', sortable: true, filter: true, width: 250 },
      { field: 'IPAddress', headerName: 'IP Address', sortable: true, filter: true, width: 150 },
      { field: 'Port', headerName: 'Port', sortable: true, filter: true, width: 80 },
      { field: 'CertificateHash', headerName: 'Certificate Hash', sortable: true, filter: true, width: 200 },
    ],
    []
  );

  const certificateColumns = useMemo<ColDef[]>(
    () => [
      { field: 'Subject', headerName: 'Subject', sortable: true, filter: true, width: 300, pinned: 'left' },
      { field: 'Issuer', headerName: 'Issuer', sortable: true, filter: true, width: 250 },
      { field: 'Thumbprint', headerName: 'Thumbprint', sortable: true, filter: true, width: 200 },
      { field: 'NotBefore', headerName: 'Valid From', sortable: true, filter: true, width: 150, valueFormatter: (params) => (params.value ? new Date(params.value).toLocaleDateString() : 'N/A') },
      { field: 'NotAfter', headerName: 'Valid Until', sortable: true, filter: true, width: 150, valueFormatter: (params) => (params.value ? new Date(params.value).toLocaleDateString() : 'N/A') },
      { field: 'HasPrivateKey', headerName: 'Has Private Key', sortable: true, filter: true, width: 130, valueFormatter: (params) => (params.value ? 'Yes' : 'No') },
      { field: 'IsExpired', headerName: 'Expired', sortable: true, filter: true, width: 100, valueFormatter: (params) => (params.value ? 'Yes' : 'No') },
    ],
    []
  );

  // ============================================================================
  // Get Columns Based on Active Tab
  // ============================================================================

  const columns = useMemo<ColDef[]>(() => {
    switch (activeTab) {
      case 'iis-sites':
        return iisSiteColumns;
      case 'app-pools':
        return appPoolColumns;
      case 'bindings':
        return bindingColumns;
      case 'certificates':
        return certificateColumns;
      default:
        return [];
    }
  }, [activeTab, iisSiteColumns, appPoolColumns, bindingColumns, certificateColumns]);

  // ============================================================================
  // Filtered Data
  // ============================================================================

  const filteredData = useMemo(() => {
    if (!state.result) return [];

    let data: any[] = [];

    switch (activeTab) {
      case 'iis-sites':
        data = state.result.iisSites || [];
        break;
      case 'app-pools':
        data = state.result.iisAppPools || [];
        break;
      case 'bindings':
        data = state.result.iisBindings || [];
        break;
      case 'certificates':
        data = state.result.sslCertificates || [];
        break;
      case 'apache':
        data = state.result.apacheVHosts || [];
        break;
      case 'nginx':
        data = state.result.nginxServers || [];
        break;
      default:
        return [];
    }

    // Apply filters
    return data.filter((item) => {
      // Search text filter
      if (filter.searchText) {
        const searchLower = filter.searchText.toLowerCase();
        const searchableFields = activeTab === 'iis-sites'
          ? ['Name', 'PhysicalPath', 'HostName']
          : activeTab === 'app-pools'
          ? ['Name']
          : activeTab === 'bindings'
          ? ['SiteName', 'HostName', 'BindingInformation']
          : activeTab === 'certificates'
          ? ['Subject', 'Issuer', 'Thumbprint']
          : ['Name'];

        const matchesSearch = searchableFields.some((field) =>
          item[field]?.toString().toLowerCase().includes(searchLower)
        );

        if (!matchesSearch) return false;
      }

      // State filter (sites and app pools only)
      if ((activeTab === 'iis-sites' || activeTab === 'app-pools') && filter.selectedStates.length > 0) {
        if (!filter.selectedStates.includes(item.State)) return false;
      }

      // HTTPS only filter (bindings only)
      if (activeTab === 'bindings' && filter.showHttpsOnly) {
        if (item.Protocol !== 'https') return false;
      }

      // Expired certs filter (certificates only)
      if (activeTab === 'certificates' && filter.showExpiredCerts) {
        if (!item.IsExpired) return false;
      }

      return true;
    });
  }, [state.result, activeTab, filter]);

  // ============================================================================
  // Statistics
  // ============================================================================

  const stats = useMemo<WebServerConfigStats | null>(() => {
    if (!state.result) return null;

    const sites = state.result.iisSites || [];
    const appPools = state.result.iisAppPools || [];
    const bindings = state.result.iisBindings || [];
    const certs = state.result.sslCertificates || [];

    return {
      totalIISSites: sites.length,
      runningIISSites: sites.filter((s) => s.State === 'Started').length,
      stoppedIISSites: sites.filter((s) => s.State === 'Stopped').length,
      totalAppPools: appPools.length,
      runningAppPools: appPools.filter((a) => a.State === 'Started').length,
      totalBindings: bindings.length,
      httpsBindings: bindings.filter((b) => b.Protocol === 'https').length,
      totalSSLCertificates: certs.length,
      expiredCertificates: certs.filter((c) => c.IsExpired).length,
      apacheVHosts: (state.result.apacheVHosts || []).length,
      nginxServers: (state.result.nginxServers || []).length,
    };
  }, [state.result]);

  // ============================================================================
  // Export Functions
  // ============================================================================

  const exportToCSV = useCallback(
    (data: any[], filename: string) => {
      if (!data || data.length === 0) {
        console.warn('[WebServerConfigDiscoveryHook] No data to export');
        return;
      }

      // Flatten objects for CSV export
      const flattenedData = data.map((item) => {
        const flattened: any = {};
        Object.keys(item).forEach((key) => {
          if (typeof item[key] === 'object' && item[key] !== null) {
            flattened[key] = JSON.stringify(item[key]);
          } else {
            flattened[key] = item[key];
          }
        });
        return flattened;
      });

      const headers = Object.keys(flattenedData[0]);
      const csvContent = [
        headers.join(','),
        ...flattenedData.map((row) =>
          headers.map((header) => {
            const value = row[header];
            if (value === null || value === undefined) return '';
            const stringValue = value.toString().replace(/"/g, '""');
            return `"${stringValue}"`;
          }).join(',')
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(`[WebServerConfigDiscoveryHook] Exported ${data.length} rows to ${filename}`);
    },
    []
  );

  const exportToExcel = useCallback(
    async (data: any[], filename: string) => {
      console.log('[WebServerConfigDiscoveryHook] Excel export not yet implemented, falling back to CSV');
      exportToCSV(data, filename.replace('.xlsx', '.csv'));
    },
    [exportToCSV]
  );

  return {
    // Configuration
    config: state.config,
    updateConfig,

    // Discovery results
    result: state.result,

    // Discovery state
    isDiscovering: state.isDiscovering,
    isCancelling,
    progress: state.progress,
    error: state.error,

    // Actions
    startDiscovery,
    cancelDiscovery,
    clearError,

    // Logs
    logs,
    addLog,
    clearLogs,
    showExecutionDialog,
    setShowExecutionDialog,

    // Tabs
    activeTab,
    setActiveTab,

    // Filtering
    filter,
    updateFilter,

    // Data
    columns,
    filteredData,
    stats,

    // Export
    exportToCSV,
    exportToExcel,
  };
};
