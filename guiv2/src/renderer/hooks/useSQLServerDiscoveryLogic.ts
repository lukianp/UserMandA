import { useState, useEffect, useMemo } from 'react';
import type { ColDef } from 'ag-grid-community';
import type {
  SQLServerDiscoveryConfig,
  SQLServerDiscoveryResult,
  SQLServerInstance,
  SQLServerDatabase,
  SQLServerConfiguration,
  SQLServerTemplate,
} from '../types/models/sqlserver';

export interface SQLServerDiscoveryLogicState {
  config: SQLServerDiscoveryConfig;
  result: SQLServerDiscoveryResult | null;
  isLoading: boolean;
  progress: number;
  error: string | null;
  searchText: string;
  activeTab: 'overview' | 'instances' | 'databases' | 'configuration';
  templates: SQLServerTemplate[];
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const useSQLServerDiscoveryLogic = () => {
  const [config, setConfig] = useState<SQLServerDiscoveryConfig>({
    id: '',
    name: 'SQL Server Discovery',
    type: 'sqlserver',
    parameters: {
      servers: [],
      includeInstances: true,
      includeDatabases: true,
      includeConfiguration: true,
      includeSecurity: true,
      includeBackupStatus: true,
      authentication: 'windows',
      timeout: 300,
    },
  });

  const [result, setResult] = useState<SQLServerDiscoveryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'instances' | 'databases' | 'configuration'>('overview');

  const templates: SQLServerTemplate[] = [
    {
      id: 'quick-scan',
      name: 'Quick Instance Scan',
      description: 'Fast scan of SQL Server instances and basic info',
      config: {
        servers: [],
        includeInstances: true,
        includeDatabases: true,
        includeConfiguration: false,
        includeSecurity: false,
        includeBackupStatus: false,
        authentication: 'windows',
        timeout: 60,
      },
    },
    {
      id: 'comprehensive',
      name: 'Comprehensive Database Audit',
      description: 'Full audit including configuration, security, and backup status',
      config: {
        servers: [],
        includeInstances: true,
        includeDatabases: true,
        includeConfiguration: true,
        includeSecurity: true,
        includeBackupStatus: true,
        authentication: 'windows',
        timeout: 600,
      },
    },
    {
      id: 'security-audit',
      name: 'Security & Compliance Audit',
      description: 'Security-focused scan with permissions and encryption analysis',
      config: {
        servers: [],
        includeInstances: true,
        includeDatabases: true,
        includeConfiguration: true,
        includeSecurity: true,
        includeBackupStatus: false,
        authentication: 'windows',
        timeout: 300,
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
          Servers: config.parameters.servers,
          IncludeInstances: config.parameters.includeInstances,
          IncludeDatabases: config.parameters.includeDatabases,
          IncludeConfiguration: config.parameters.includeConfiguration,
          IncludeSecurity: config.parameters.includeSecurity,
          IncludeBackupStatus: config.parameters.includeBackupStatus,
          Authentication: config.parameters.authentication,
          Timeout: config.parameters.timeout,
        },
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (scriptResult.success) {
        setResult(scriptResult.data as SQLServerDiscoveryResult);
      } else {
        setError(scriptResult.error || 'SQL Server discovery failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyTemplate = (template: SQLServerTemplate) => {
    setConfig((prev) => ({
      ...prev,
      name: template.name,
      parameters: { ...template.config },
    }));
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

  const generateCSV = (data: SQLServerDiscoveryResult): string => {
    const headers = ['Type', 'Name', 'Version', 'Edition', 'Status', 'Details'];
    const rows: string[][] = [];

    data.instances.forEach((instance) => {
      rows.push([
        'Instance',
        instance.instanceName,
        instance.version,
        instance.edition,
        instance.status,
        `Databases: ${instance.databaseCount}, Auth: ${instance.authenticationMode}`,
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

  const filteredConfigurations = useMemo(() => {
    if (!result) return [];
    if (!searchText) return result.configurations;

    const search = searchText.toLowerCase();
    return result.configurations.filter(
      (config) =>
        config.name.toLowerCase().includes(search) ||
        config.value.toLowerCase().includes(search) ||
        config.description?.toLowerCase().includes(search)
    );
  }, [result, searchText]);

  // AG Grid column definitions
  const instanceColumns: ColDef<SQLServerInstance>[] = [
    { field: 'instanceName', headerName: 'Instance Name', sortable: true, filter: true, flex: 1.5 },
    { field: 'version', headerName: 'Version', sortable: true, filter: true, flex: 1 },
    { field: 'edition', headerName: 'Edition', sortable: true, filter: true, flex: 1 },
    { field: 'authenticationMode', headerName: 'Authentication', sortable: true, filter: true, flex: 1 },
    { field: 'databaseCount', headerName: 'Databases', sortable: true, filter: true, flex: 0.8 },
    { field: 'status', headerName: 'Status', sortable: true, filter: true, flex: 0.8 },
    { field: 'collation', headerName: 'Collation', sortable: true, filter: true, flex: 1.2 },
  ];

  const databaseColumns: ColDef<SQLServerDatabase>[] = [
    { field: 'name', headerName: 'Database Name', sortable: true, filter: true, flex: 1.5 },
    {
      field: 'sizeMB',
      headerName: 'Size',
      sortable: true,
      filter: true,
      flex: 1,
      valueFormatter: (params) => formatBytes(params.value * 1024 * 1024),
    },
    { field: 'owner', headerName: 'Owner', sortable: true, filter: true, flex: 1 },
    { field: 'recoveryModel', headerName: 'Recovery Model', sortable: true, filter: true, flex: 1 },
    {
      field: 'lastBackup',
      headerName: 'Last Backup',
      sortable: true,
      filter: true,
      flex: 1.2,
      valueFormatter: (params) => (params.value ? new Date(params.value).toLocaleString() : 'Never'),
    },
    { field: 'state', headerName: 'State', sortable: true, filter: true, flex: 0.8 },
  ];

  const configurationColumns: ColDef<SQLServerConfiguration>[] = [
    { field: 'name', headerName: 'Configuration', sortable: true, filter: true, flex: 1.5 },
    { field: 'value', headerName: 'Value', sortable: true, filter: true, flex: 1 },
    { field: 'description', headerName: 'Description', sortable: true, filter: true, flex: 2 },
    { field: 'isDefault', headerName: 'Default', sortable: true, filter: true, flex: 0.8 },
  ];

  // Statistics
  const stats = useMemo(() => {
    if (!result) return null;

    const totalInstances = result.instances.length;
    const activeInstances = result.instances.filter((i) => i.status === 'running').length;
    const totalDatabases = result.databases.length;
    const totalStorageMB = result.databases.reduce((sum, db) => sum + db.sizeMB, 0);
    const outdatedBackups = result.databases.filter((db) => {
      if (!db.lastBackup) return true;
      const daysSinceBackup = (Date.now() - new Date(db.lastBackup).getTime()) / (1000 * 60 * 60 * 24);
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
    filteredConfigurations,
    instanceColumns,
    databaseColumns,
    configurationColumns,
    stats,
  };
};
