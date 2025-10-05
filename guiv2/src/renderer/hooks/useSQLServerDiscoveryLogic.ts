import { useState, useMemo } from 'react';
import type { ColDef } from 'ag-grid-community';
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
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const useSQLServerDiscoveryLogic = () => {
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

  const handleStartDiscovery = async () => {
    setIsLoading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + Math.random() * 15, 95));
      }, 500);

      const scriptResult = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/SQLServerDiscovery.psm1',
        functionName: 'Invoke-SQLServerDiscovery',
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
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (scriptResult.success) {
        setResult(scriptResult.data as SQLDiscoveryResult);
      } else {
        setError(scriptResult.error || 'SQL Server discovery failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

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

    data.instances.forEach((instance: SQLServerInstance) => {
      rows.push([
        'Instance',
        instance.instanceName,
        instance.version,
        instance.edition,
        instance.isSysAdmin ? 'Admin' : 'User',
        `Databases: ${instance.databases.length}, Auth: ${instance.authentication}`,
      ]);
    });

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  };

  // Filter data based on search text
  const filteredInstances = useMemo(() => {
    if (!result) return [];
    if (!searchText) return result.instances;

    const search = searchText.toLowerCase();
    return result.instances.filter(
      (instance) =>
        instance.instanceName.toLowerCase().includes(search) ||
        instance.version.toLowerCase().includes(search) ||
        instance.edition.toLowerCase().includes(search)
    );
  }, [result, searchText]);

  const filteredDatabases = useMemo(() => {
    if (!result) return [];
    if (!searchText) return result.databases;

    const search = searchText.toLowerCase();
    return result.databases.filter(
      (db) =>
        db.name.toLowerCase().includes(search) ||
        db.owner.toLowerCase().includes(search) ||
        db.recoveryModel.toLowerCase().includes(search)
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

    const totalInstances = result.instances.length;
    const activeInstances = result.instances.filter((i) => i.isSysAdmin).length; // Use isSysAdmin as proxy for "active"
    const totalDatabases = result.databases.length;
    const totalStorageMB = result.databases.reduce((sum, db) => sum + (db.size?.totalMB || 0), 0);
    const outdatedBackups = result.databases.filter((db) => {
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
    handleApplyTemplate,
    handleExport,
    filteredInstances,
    filteredDatabases,
    instanceColumns,
    databaseColumns,
    stats,
  };
};
