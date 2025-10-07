import { useState, useCallback, useMemo, useEffect } from 'react';
import type { ColDef } from 'ag-grid-community';
import type {
  WebServerDiscoveryConfig,
  WebServerDiscoveryResult,
  WebServer,
  WebSite,
  Binding,
  ApplicationPool,
  Certificate,
  WebServerStats,
  WebServerFilterState,
  WebServerType
} from '../types/models/webserver';

interface WebServerDiscoveryState {
  config: Partial<WebServerDiscoveryConfig>;
  result: WebServerDiscoveryResult | null;
  isDiscovering: boolean;
  progress: number;
  error: string | null;
  cancellationToken: string | null;
}

export const useWebServerDiscoveryLogic = () => {
  const [state, setState] = useState<WebServerDiscoveryState>({
    config: {
      serverAddresses: [],
      serverTypes: ['iis', 'apache', 'nginx'],
      includeBindings: true,
      includeApplicationPools: true,
      includeCertificates: true,
      timeout: 300000
    },
    result: null,
    isDiscovering: false,
    progress: 0,
    error: null,
    cancellationToken: null
  });

  const [filter, setFilter] = useState<WebServerFilterState>({
    searchText: '',
    selectedServerTypes: [],
    selectedStates: [],
    showOnlyExpiring: false
  });

  // IPC Progress Tracking
  useEffect(() => {
    const progressHandler = (data: unknown) => {
      if (typeof data === 'object' && data !== null &&
          'type' in data && 'token' in data && 'progress' in data &&
          (data as any).type === 'webserver-discovery' && (data as any).token === state.cancellationToken) {
        setState(prev => ({
          ...prev,
          progress: (data as any).progress || 0
        }));
      }
    };

    const unsubscribe = window.electronAPI?.onProgress?.(progressHandler);
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [state.cancellationToken]);

  // Start Discovery
  const startDiscovery = useCallback(async () => {
    const token = `webserver-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setState(prev => ({
      ...prev,
      isDiscovering: true,
      progress: 0,
      error: null,
      cancellationToken: token
    }));

    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/WebServerDiscovery.psm1',
        functionName: 'Invoke-WebServerDiscovery',
        parameters: {
          ...state.config,
          cancellationToken: token
        }
      });

      setState(prev => ({
        ...prev,
        result: result.data as WebServerDiscoveryResult,
        isDiscovering: false,
        progress: 100,
        cancellationToken: null
      }));
    } catch (error: unknown) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Discovery failed',
        isDiscovering: false,
        cancellationToken: null
      }));
    }
  }, [state.config]);

  // Cancel Discovery
  const cancelDiscovery = useCallback(async () => {
    if (state.cancellationToken) {
      try {
        await window.electronAPI.cancelExecution(state.cancellationToken);
      } catch (error) {
        console.error('Failed to cancel discovery:', error);
      }
    }

    setState(prev => ({
      ...prev,
      isDiscovering: false,
      cancellationToken: null
    }));
  }, [state.cancellationToken]);

  // Update Config
  const updateConfig = useCallback((updates: Partial<WebServerDiscoveryConfig>) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, ...updates }
    }));
  }, []);

  // Update Filter
  const updateFilter = useCallback((updates: Partial<WebServerFilterState>) => {
    setFilter(prev => ({ ...prev, ...updates }));
  }, []);

  // Server Columns
  const serverColumns = useMemo<ColDef<WebServer>[]>(() => [
    {
      field: 'name',
      headerName: 'Server Name',
      sortable: true,
      filter: true,
      width: 200
    },
    {
      field: 'serverType',
      headerName: 'Type',
      sortable: true,
      filter: true,
      width: 120,
      valueFormatter: (params) => {
        const type = params.value as WebServerType;
        return type.toUpperCase();
      }
    },
    {
      field: 'version',
      headerName: 'Version',
      sortable: true,
      filter: true,
      width: 140
    },
    {
      field: 'ipAddress',
      headerName: 'IP Address',
      sortable: true,
      filter: true,
      width: 150
    },
    {
      field: 'operatingSystem',
      headerName: 'OS',
      sortable: true,
      filter: true,
      width: 180
    },
    {
      field: 'totalSites',
      headerName: 'Sites',
      sortable: true,
      filter: true,
      width: 100,
      type: 'numericColumn'
    },
    {
      field: 'status',
      headerName: 'Status',
      sortable: true,
      filter: true,
      width: 120,
      cellStyle: (params) => {
        if (params.value === 'running') return { color: '#10b981' };
        if (params.value === 'stopped') return { color: '#ef4444' };
        return { color: '#6b7280' };
      }
    }
  ], []);

  // Site Columns
  const siteColumns = useMemo<ColDef<WebSite>[]>(() => [
    {
      field: 'name',
      headerName: 'Site Name',
      sortable: true,
      filter: true,
      width: 250
    },
    {
      field: 'physicalPath',
      headerName: 'Physical Path',
      sortable: true,
      filter: true,
      width: 300
    },
    {
      field: 'state',
      headerName: 'State',
      sortable: true,
      filter: true,
      width: 120,
      cellStyle: (params) => {
        if (params.value === 'started') return { color: '#10b981' };
        if (params.value === 'stopped') return { color: '#ef4444' };
        return { color: '#6b7280' };
      }
    },
    {
      field: 'applicationPool',
      headerName: 'App Pool',
      sortable: true,
      filter: true,
      width: 180
    },
    {
      field: 'bindings',
      headerName: 'Bindings',
      sortable: true,
      width: 100,
      valueGetter: (params) => params.data?.bindings?.length || 0,
      type: 'numericColumn'
    },
    {
      field: 'applications',
      headerName: 'Applications',
      sortable: true,
      width: 120,
      valueGetter: (params) => params.data?.applications?.length || 0,
      type: 'numericColumn'
    },
    {
      field: 'enabledProtocols',
      headerName: 'Protocols',
      sortable: true,
      filter: true,
      width: 150,
      valueFormatter: (params) => {
        const protocols = params.value as string[];
        return protocols?.join(', ') || '';
      }
    }
  ], []);

  // Binding Columns
  const bindingColumns = useMemo<ColDef<Binding>[]>(() => [
    {
      field: 'protocol',
      headerName: 'Protocol',
      sortable: true,
      filter: true,
      width: 120
    },
    {
      field: 'ipAddress',
      headerName: 'IP Address',
      sortable: true,
      filter: true,
      width: 150
    },
    {
      field: 'port',
      headerName: 'Port',
      sortable: true,
      filter: true,
      width: 100,
      type: 'numericColumn'
    },
    {
      field: 'hostHeader',
      headerName: 'Host Header',
      sortable: true,
      filter: true,
      width: 250
    },
    {
      field: 'certificateHash',
      headerName: 'Certificate',
      sortable: true,
      filter: true,
      width: 150,
      valueFormatter: (params) => {
        if (!params.value) return 'None';
        return `${params.value.substring(0, 8)}...`;
      }
    },
    {
      field: 'bindingInformation',
      headerName: 'Binding Info',
      sortable: true,
      filter: true,
      width: 300
    }
  ], []);

  // Application Pool Columns
  const appPoolColumns = useMemo<ColDef<ApplicationPool>[]>(() => [
    {
      field: 'name',
      headerName: 'Pool Name',
      sortable: true,
      filter: true,
      width: 250
    },
    {
      field: 'managedRuntimeVersion',
      headerName: 'Runtime',
      sortable: true,
      filter: true,
      width: 120
    },
    {
      field: 'managedPipelineMode',
      headerName: 'Pipeline Mode',
      sortable: true,
      filter: true,
      width: 140
    },
    {
      field: 'state',
      headerName: 'State',
      sortable: true,
      filter: true,
      width: 120,
      cellStyle: (params) => {
        if (params.value === 'started') return { color: '#10b981' };
        if (params.value === 'stopped') return { color: '#ef4444' };
        return { color: '#6b7280' };
      }
    },
    {
      field: 'startMode',
      headerName: 'Start Mode',
      sortable: true,
      filter: true,
      width: 150
    },
    {
      field: 'identityType',
      headerName: 'Identity',
      sortable: true,
      filter: true,
      width: 180
    },
    {
      field: 'enable32BitAppOnWin64',
      headerName: '32-bit',
      sortable: true,
      filter: true,
      width: 100,
      valueFormatter: (params) => params.value ? 'Yes' : 'No'
    }
  ], []);

  // Certificate Columns
  const certificateColumns = useMemo<ColDef<Certificate>[]>(() => [
    {
      field: 'subject',
      headerName: 'Subject',
      sortable: true,
      filter: true,
      width: 300
    },
    {
      field: 'friendlyName',
      headerName: 'Friendly Name',
      sortable: true,
      filter: true,
      width: 200
    },
    {
      field: 'issuer',
      headerName: 'Issuer',
      sortable: true,
      filter: true,
      width: 250
    },
    {
      field: 'notBefore',
      headerName: 'Valid From',
      sortable: true,
      filter: true,
      width: 150,
      valueFormatter: (params) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleDateString();
      }
    },
    {
      field: 'notAfter',
      headerName: 'Valid To',
      sortable: true,
      filter: true,
      width: 150,
      valueFormatter: (params) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleDateString();
      }
    },
    {
      field: 'daysUntilExpiration',
      headerName: 'Days Remaining',
      sortable: true,
      filter: true,
      width: 150,
      type: 'numericColumn',
      cellStyle: (params) => {
        if (params.value < 30) return { color: '#ef4444', fontWeight: 'bold' as const };
        if (params.value < 90) return { color: '#f59e0b' };
        return { color: '#10b981' };
      }
    },
    {
      field: 'thumbprint',
      headerName: 'Thumbprint',
      sortable: true,
      filter: true,
      width: 250,
      valueFormatter: (params) => {
        if (!params.value) return '';
        return `${params.value.substring(0, 16)}...`;
      }
    }
  ], []);

  // Flatten all sites from all servers
  const allSites = useMemo<WebSite[]>(() => {
    if (!state.result?.servers) return [];
    return state.result.servers.flatMap(server => server.sites || []);
  }, [state.result]);

  // Flatten all bindings from all sites
  const allBindings = useMemo<Binding[]>(() => {
    if (!state.result?.servers) return [];
    return state.result.servers.flatMap(server =>
      (server.sites || []).flatMap(site => site.bindings || [])
    );
  }, [state.result]);

  // Flatten all application pools
  const allAppPools = useMemo<ApplicationPool[]>(() => {
    if (!state.result?.servers) return [];
    return state.result.servers.flatMap(server => server.applicationPools || []);
  }, [state.result]);

  // Flatten all certificates
  const allCertificates = useMemo<Certificate[]>(() => {
    if (!state.result?.servers) return [];
    return state.result.servers.flatMap(server => server.certificates || []);
  }, [state.result]);

  // Statistics
  const stats = useMemo<WebServerStats | null>(() => {
    if (!state.result) return null;

    const servers = state.result.servers || [];
    const serversByType: Record<WebServerType, number> = {
      iis: 0,
      apache: 0,
      nginx: 0,
      tomcat: 0,
      other: 0
    };

    let runningServers = 0;
    let totalSites = 0;
    let expiringCertificates = 0;

    servers.forEach(server => {
      const type = server.serverType || 'other';
      serversByType[type] = (serversByType[type] || 0) + 1;

      if (server.status === 'running') {
        runningServers++;
      }

      totalSites += server.totalSites || 0;
    });

    allCertificates.forEach(cert => {
      if (cert.daysUntilExpiration < 90) {
        expiringCertificates++;
      }
    });

    return {
      totalServers: servers.length,
      serversByType,
      totalSites,
      runningServers,
      expiringCertificates
    };
  }, [state.result, allCertificates]);

  // Filtered Servers
  const filteredServers = useMemo(() => {
    if (!state.result?.servers) return [];

    return state.result.servers.filter(server => {
      if (filter.searchText) {
        const searchLower = filter.searchText.toLowerCase();
        const matchesSearch =
          server.name?.toLowerCase().includes(searchLower) ||
          server.ipAddress?.toLowerCase().includes(searchLower) ||
          server.serverType?.toLowerCase().includes(searchLower) ||
          server.operatingSystem?.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      if (filter.selectedServerTypes.length > 0) {
        if (!filter.selectedServerTypes.includes(server.serverType)) {
          return false;
        }
      }

      if (filter.selectedStates.length > 0) {
        if (!filter.selectedStates.includes(server.status)) {
          return false;
        }
      }

      return true;
    });
  }, [state.result, filter]);

  // Filtered Sites
  const filteredSites = useMemo(() => {
    if (!filter.searchText) return allSites;

    const searchLower = filter.searchText.toLowerCase();
    return allSites.filter(site =>
      site.name?.toLowerCase().includes(searchLower) ||
      site.physicalPath?.toLowerCase().includes(searchLower) ||
      site.applicationPool?.toLowerCase().includes(searchLower)
    );
  }, [allSites, filter.searchText]);

  // Filtered Bindings
  const filteredBindings = useMemo(() => {
    if (!filter.searchText) return allBindings;

    const searchLower = filter.searchText.toLowerCase();
    return allBindings.filter(binding =>
      binding.protocol?.toLowerCase().includes(searchLower) ||
      binding.ipAddress?.toLowerCase().includes(searchLower) ||
      binding.hostHeader?.toLowerCase().includes(searchLower) ||
      binding.port?.toString().includes(searchLower)
    );
  }, [allBindings, filter.searchText]);

  // Filtered Application Pools
  const filteredAppPools = useMemo(() => {
    if (!filter.searchText) return allAppPools;

    const searchLower = filter.searchText.toLowerCase();
    return allAppPools.filter(pool =>
      pool.name?.toLowerCase().includes(searchLower) ||
      pool.managedRuntimeVersion?.toLowerCase().includes(searchLower) ||
      pool.identityType?.toLowerCase().includes(searchLower)
    );
  }, [allAppPools, filter.searchText]);

  // Filtered Certificates
  const filteredCertificates = useMemo(() => {
    let certs = allCertificates;

    if (filter.showOnlyExpiring) {
      certs = certs.filter(cert => cert.daysUntilExpiration < 90);
    }

    if (filter.searchText) {
      const searchLower = filter.searchText.toLowerCase();
      certs = certs.filter(cert =>
        cert.subject?.toLowerCase().includes(searchLower) ||
        cert.friendlyName?.toLowerCase().includes(searchLower) ||
        cert.issuer?.toLowerCase().includes(searchLower) ||
        cert.thumbprint?.toLowerCase().includes(searchLower)
      );
    }

    return certs;
  }, [allCertificates, filter]);

  // Export to CSV
  const exportToCSV = useCallback((data: Record<string, unknown>[], filename: string) => {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    // Recursive flattening function
    const flattenObject = (obj: Record<string, unknown>, prefix = ''): Record<string, unknown> => {
      const flattened: Record<string, any> = {};

      for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (value === null || value === undefined) {
          flattened[newKey] = '';
        } else if (value instanceof Date) {
          flattened[newKey] = value.toISOString();
        } else if (Array.isArray(value)) {
          flattened[newKey] = JSON.stringify(value);
        } else if (typeof value === 'object') {
          Object.assign(flattened, flattenObject(value as Record<string, unknown>, newKey));
        } else {
          flattened[newKey] = value;
        }
      }

      return flattened;
    };

    const flattenedData = data.map(item => flattenObject(item));
    const headers = Array.from(new Set(flattenedData.flatMap(obj => Object.keys(obj))));

    const csvRows = [
      headers.join(','),
      ...flattenedData.map(row =>
        headers.map(header => {
          const value = row[header] ?? '';
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',')
      )
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }, []);

  // Export to Excel
  const exportToExcel = useCallback(async (data: Record<string, unknown>[], filename: string) => {
    try {
      await window.electronAPI.executeModule({
        modulePath: 'Modules/Export/ExportToExcel.psm1',
        functionName: 'Export-DataToExcel',
        parameters: {
          data: JSON.stringify(data),
          filename
        }
      });
    } catch (error) {
      console.error('Failed to export to Excel:', error);
    }
  }, []);

  return {
    // State
    config: state.config,
    result: state.result,
    isDiscovering: state.isDiscovering,
    progress: state.progress,
    error: state.error,

    // Filter
    filter,
    updateFilter,

    // Actions
    startDiscovery,
    cancelDiscovery,
    updateConfig,

    // Column Definitions
    serverColumns,
    siteColumns,
    bindingColumns,
    appPoolColumns,
    certificateColumns,

    // Filtered Data
    filteredServers,
    filteredSites,
    filteredBindings,
    filteredAppPools,
    filteredCertificates,

    // Statistics
    stats,

    // Export
    exportToCSV,
    exportToExcel
  };
};
