import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import type { ColDef } from 'ag-grid-community';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
import { useProfileStore } from '../store/useProfileStore';
import type { PowerShellLog } from '../components/molecules/PowerShellExecutionDialog';

import type {
  SQLDiscoveryConfig,
  SQLDiscoveryResult,
  SQLServerInstance,
  SQLDatabase,
  SQLConfiguration,
  SQLDiscoveryTemplate,
} from '../types/models/sqlserver';

export interface SQLServerDiscoveryLogicState {
  config: SQLDiscoveryConfig;
  result: SQLDiscoveryResult | null;
  isLoading: boolean;
  progress: number;
  error: string | null;
  searchText: string;
  activeTab: 'overview' | 'instances' | 'databases';
  templates: SQLDiscoveryTemplate[];
  logs: PowerShellLog[];
  showExecutionDialog: boolean;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const useSQLServerDiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { getResultsByModuleName, addResult } = useDiscoveryStore();

  const [config, setConfig] = useState<SQLDiscoveryConfig>({
    servers: [],
    includeSystemDatabases: true,
    includeBackupHistory: true,
    includeDatabaseFiles: true,
    includeSecurityAudit: true,
    includePerformanceMetrics: true,
    includeConfiguration: true,
    authenticationType: 'Windows',
    timeout: 300,
    parallelScans: 5,
  });

  const [result, setResult] = useState<SQLDiscoveryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'instances' | 'databases'>('overview');
  const [cancellationToken, setCancellationToken] = useState<string | null>(null);
  const [logs, setLogs] = useState<PowerShellLog[]>([]);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);

  const currentTokenRef = useRef<string | null>(null);

  // Utility function to add logs
  const addLog = useCallback((message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const newLog: PowerShellLog = { timestamp: new Date().toISOString(), message, level };
    setLogs((prevLogs) => [...prevLogs, newLog]);
  }, []);

  // Event listeners for PowerShell streaming - Set up ONCE on mount
  useEffect(() => {
    console.log('[SQLServerDiscoveryHook] Setting up event listeners');

    const unsubscribeOutput = window.electron?.onDiscoveryOutput?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const message = data.message || '';
        console.log('[SQLServerDiscoveryHook] Progress:', message);
        addLog(message, 'info');
      }
    });

    const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const discoveryResult = {
          id: `sqlserver-discovery-${Date.now()}`,
          name: 'SQL Server Discovery',
          moduleName: 'SQLServer',
          displayName: 'SQL Server Discovery',
          itemCount: data?.result?.instances?.length || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.instances?.length || 0} SQL Server instances`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };

        setResult(data.result as SQLDiscoveryResult);
        setIsLoading(false);
        setProgress(100);
        setCancellationToken(null);
        setShowExecutionDialog(false);
        currentTokenRef.current = null;

        addResult(discoveryResult);
        addLog('SQL Server discovery completed successfully', 'success');
        addLog(`Found ${discoveryResult.itemCount} SQL Server instances`, 'success');
        console.log(`[SQLServerDiscoveryHook] Discovery completed! Found ${discoveryResult.itemCount} instances.`);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setError(data.error);
        setIsLoading(false);
        setCancellationToken(null);
        setShowExecutionDialog(false);
        currentTokenRef.current = null;
        addLog(`Discovery failed: ${data.error}`, 'error');
        console.error(`[SQLServerDiscoveryHook] Discovery failed: ${data.error}`);
      }
    });

    const unsubscribeCancelled = window.electron?.onDiscoveryCancelled?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setIsLoading(false);
        setProgress(0);
        setCancellationToken(null);
        setShowExecutionDialog(false);
        currentTokenRef.current = null;
        addLog('Discovery cancelled by user', 'warning');
        console.warn('[SQLServerDiscoveryHook] Discovery cancelled by user');
      }
    });

    return () => {
      unsubscribeOutput?.();
      unsubscribeComplete?.();
      unsubscribeError?.();
      unsubscribeCancelled?.();
    };
  }, [addLog, addResult]);

  // Load previous discovery results from store on mount
  useEffect(() => {
    const previousResults = getResultsByModuleName('SQLServerDiscovery');
    if (previousResults && previousResults.length > 0) {
      console.log('[SQLServerDiscoveryHook] Restoring', previousResults.length, 'previous results from store');
      const latestResult = previousResults[previousResults.length - 1];
      setResult(latestResult as any);
    }
  }, [getResultsByModuleName]);

  const templates = [
    {
      name: 'Quick Instance Scan',
      description: 'Fast scan of SQL Server instances and basic info',
      isDefault: false,
      category: 'Quick' as const,
      config: {
        servers: [] as string[],
        includeSystemDatabases: false,
        includeBackupHistory: false,
        includeDatabaseFiles: false,
        includeSecurityAudit: false,
        includePerformanceMetrics: false,
        includeConfiguration: false,
        authenticationType: 'Windows' as const,
        timeout: 60,
        parallelScans: 5,
      },
    },
    {
      name: 'Comprehensive Database Audit',
      description: 'Full audit including configuration, security, and backup status',
      isDefault: true,
      category: 'Full' as const,
      config: {
        servers: [] as string[],
        includeSystemDatabases: true,
        includeBackupHistory: true,
        includeDatabaseFiles: true,
        includeSecurityAudit: true,
        includePerformanceMetrics: true,
        includeConfiguration: true,
        authenticationType: 'Windows' as const,
        timeout: 600,
        parallelScans: 5,
      },
    },
    {
      name: 'Security & Compliance Audit',
      description: 'Security-focused scan with permissions and encryption analysis',
      isDefault: false,
      category: 'Security' as const,
      config: {
        servers: [] as string[],
        includeSystemDatabases: true,
        includeBackupHistory: false,
        includeDatabaseFiles: false,
        includeSecurityAudit: true,
        includePerformanceMetrics: false,
        includeConfiguration: true,
        authenticationType: 'Windows' as const,
        timeout: 300,
        parallelScans: 5,
      },
    },
  ];

  const handleStartDiscovery = useCallback(async () => {
    if (!selectedSourceProfile) {
      const errorMessage = 'No company profile selected. Please select a profile first.';
      setError(errorMessage);
      console.error('[SQLServerDiscoveryHook]', errorMessage);
      return;
    }

    if (isLoading) return;

    const token = `sqlserver-discovery-${Date.now()}`;

    setIsLoading(true);
    setProgress(0);
    setError(null);
    setResult(null);
    setLogs([]);
    setShowExecutionDialog(true);
    setCancellationToken(token);

    currentTokenRef.current = token;

    console.log(`[SQLServerDiscoveryHook] Starting discovery for company: ${selectedSourceProfile.companyName}`);
    console.log(`[SQLServerDiscoveryHook] Parameters:`, {
      Servers: config.servers,
      IncludeSystemDatabases: config.includeSystemDatabases,
      IncludeSecurityAudit: config.includeSecurityAudit
    });

    addLog('Starting SQL Server discovery...', 'info');
    addLog(`Company: ${selectedSourceProfile.companyName}`, 'info');
    addLog(`Servers: ${config.servers.length > 0 ? config.servers.join(', ') : 'Auto-detect'}`, 'info');
    addLog(`Security audit: ${config.includeSecurityAudit ? 'Enabled' : 'Disabled'}`, 'info');

    try {
      const result = await window.electron.executeDiscovery({
        moduleName: 'SQLServer',
        parameters: {
          Servers: config.servers,
          IncludeSystemDatabases: config.includeSystemDatabases,
          IncludeBackupHistory: config.includeBackupHistory,
          IncludeDatabaseFiles: config.includeDatabaseFiles,
          IncludeSecurityAudit: config.includeSecurityAudit,
          IncludePerformanceMetrics: config.includePerformanceMetrics,
          IncludeConfiguration: config.includeConfiguration,
          AuthenticationType: config.authenticationType,
          Timeout: config.timeout,
          ParallelScans: config.parallelScans,
        },
        executionOptions: {
          timeout: (config.timeout || 300) * 1000,
          showWindow: false,
        },
        executionId: token,
      });

      console.log('[SQLServerDiscoveryHook] Discovery execution initiated:', result);
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred during discovery';
      console.error('[SQLServerDiscoveryHook] Discovery failed:', errorMessage);
      setError(errorMessage);
      setIsLoading(false);
      setShowExecutionDialog(false);
      setCancellationToken(null);
      currentTokenRef.current = null;
      addLog(`Error: ${errorMessage}`, 'error');
    }
  }, [selectedSourceProfile, config, isLoading, addLog]);

  const cancelDiscovery = useCallback(async () => {
    if (!isLoading || !cancellationToken) return;

    console.warn('[SQLServerDiscoveryHook] Cancelling discovery...');

    try {
      addLog('Cancelling SQL Server discovery...', 'warning');
      await window.electron.cancelDiscovery(cancellationToken);
      console.log('[SQLServerDiscoveryHook] Discovery cancellation requested successfully');

      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
        setShowExecutionDialog(false);
        setCancellationToken(null);
        currentTokenRef.current = null;
        addLog('SQL Server discovery cancelled', 'warning');
        console.warn('[SQLServerDiscoveryHook] Discovery cancelled');
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.message || 'Error cancelling discovery';
      console.error('[SQLServerDiscoveryHook]', errorMessage);
      setIsLoading(false);
      setShowExecutionDialog(false);
      setCancellationToken(null);
      currentTokenRef.current = null;
      addLog(`Failed to cancel: ${errorMessage}`, 'error');
    }
  }, [isLoading, cancellationToken, addLog]);

  const handleApplyTemplate = (template: typeof templates[0]) => {
    setConfig(template.config as SQLDiscoveryConfig);
  };

  const handleExport = async () => {
    if (!result) return;

    try {
      const csvContent = generateCSV(result);
      await window.electronAPI.writeFile(
        `SQLServerDiscovery_${new Date().toISOString().split('T')[0]}.csv`,
        csvContent
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  const generateCSV = (data: SQLDiscoveryResult): string => {
    const headers = ['Type', 'Name', 'Version', 'Edition', 'Status', 'Details'];
    const rows: string[][] = [];

    (data?.instances ?? []).forEach((instance: SQLServerInstance) => {
      rows.push([
        'Instance',
        instance.instanceName,
        instance.version,
        instance.edition,
        instance.isSysAdmin ? 'Admin' : 'User',
        `Databases: ${instance.databases?.length ?? 0}, Auth: ${instance.authentication}`,
      ]);
    });

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  };

  // Filter data based on search text
  const filteredInstances = useMemo(() => {
    if (!result) return [];
    const instances = result?.instances ?? [];
    if (!searchText) return instances;

    const search = searchText.toLowerCase();
    return instances.filter(
      (instance) =>
        (instance.instanceName ?? '').toLowerCase().includes(search) ||
        (instance.version ?? '').toLowerCase().includes(search) ||
        (instance.edition ?? '').toLowerCase().includes(search)
    );
  }, [result, searchText]);

  const filteredDatabases = useMemo(() => {
    if (!result) return [];
    const databases = result?.databases ?? [];
    if (!searchText) return databases;

    const search = searchText.toLowerCase();
    return databases.filter(
      (db) =>
        (db.name ?? '').toLowerCase().includes(search) ||
        (db.owner ?? '').toLowerCase().includes(search) ||
        (db.recoveryModel ?? '').toLowerCase().includes(search)
    );
  }, [result, searchText]);

  // Configurations not supported in current type structure

  // AG Grid column definitions
  const instanceColumns: ColDef<SQLServerInstance>[] = [
    { field: 'instanceName', headerName: 'Instance Name', sortable: true, filter: true, flex: 1.5 },
    { field: 'version', headerName: 'Version', sortable: true, filter: true, flex: 1 },
    { field: 'edition', headerName: 'Edition', sortable: true, filter: true, flex: 1 },
    { field: 'authentication', headerName: 'Authentication', sortable: true, filter: true, flex: 1 },
    {
      field: 'databases',
      headerName: 'Databases',
      sortable: true,
      filter: true,
      flex: 0.8,
      valueGetter: (params) => params.data?.databases?.length || 0
    },
    {
      field: 'isSysAdmin',
      headerName: 'Admin',
      sortable: true,
      filter: true,
      flex: 0.8,
      valueFormatter: (params) => params.value ? 'Yes' : 'No'
    },
    { field: 'collation', headerName: 'Collation', sortable: true, filter: true, flex: 1.2 },
  ];

  const databaseColumns: ColDef<SQLDatabase>[] = [
    { field: 'name', headerName: 'Database Name', sortable: true, filter: true, flex: 1.5 },
    {
      field: 'size',
      headerName: 'Size',
      sortable: true,
      filter: true,
      flex: 1,
      valueGetter: (params) => params.data?.size?.totalMB || 0,
      valueFormatter: (params) => formatBytes((params.value || 0) * 1024 * 1024),
    },
    { field: 'owner', headerName: 'Owner', sortable: true, filter: true, flex: 1 },
    { field: 'recoveryModel', headerName: 'Recovery Model', sortable: true, filter: true, flex: 1 },
    {
      field: 'lastBackup',
      headerName: 'Last Backup',
      sortable: true,
      filter: true,
      flex: 1.2,
      valueGetter: (params) => params.data?.lastBackup?.date || null,
      valueFormatter: (params) => (params.value ? new Date(params.value).toLocaleString() : 'Never'),
    },
    { field: 'state', headerName: 'State', sortable: true, filter: true, flex: 0.8 },
  ];

  // Configuration columns not supported in current type structure

  // Statistics
  const stats = useMemo(() => {
    if (!result) return null;

    const instances = result?.instances ?? [];
    const databases = result?.databases ?? [];
    const totalInstances = instances.length;
    const activeInstances = instances.filter((i) => i.isSysAdmin).length; // Use isSysAdmin as proxy for "active"
    const totalDatabases = (databases.length ?? 0);
    const totalStorageMB = (databases ?? []).reduce((sum, db) => sum + (db.size?.totalMB || 0), 0);
    const outdatedBackups = (databases ?? []).filter((db) => {
      if (!db.lastBackup?.date) return true;
      const daysSinceBackup = (Date.now() - new Date(db.lastBackup.date).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceBackup > 1;
    }).length;

    return {
      totalInstances,
      activeInstances,
      totalDatabases,
      totalStorageMB,
      outdatedBackups,
    };
  }, [result]);

  return {
    config,
    setConfig,
    result,
    isLoading,
    progress,
    error,
    searchText,
    setSearchText,
    activeTab,
    setActiveTab,
    templates,
    handleStartDiscovery,
    cancelDiscovery,
    handleApplyTemplate,
    handleExport,
    filteredInstances,
    filteredDatabases,
    instanceColumns,
    databaseColumns,
    stats,
    logs,
    showExecutionDialog,
    setShowExecutionDialog,
  };
};
