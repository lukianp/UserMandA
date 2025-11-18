import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ColDef } from 'ag-grid-community';

import {
  FileSystemDiscoveryConfig,
  FileSystemDiscoveryResult,
  FileShare,
  FilePermission,
  LargeFile,
  ShareFilter,
  PermissionFilter,
  LargeFileFilter,
  FileSystemDiscoveryTemplate,
  DEFAULT_FILESYSTEM_CONFIG,
  FILESYSTEM_TEMPLATES,
  FileSystemProgress,
} from '../types/models/filesystem';
import type { ProgressData } from '../../shared/types';

export interface UseFileSystemDiscoveryLogicReturn {
  // Discovery state
  result: FileSystemDiscoveryResult | null;
  currentResult: FileSystemDiscoveryResult | null;
  isRunning: boolean;
  progress: FileSystemProgress | null;
  error: string | null;

  // Configuration
  config: FileSystemDiscoveryConfig;
  setConfig: (config: FileSystemDiscoveryConfig) => void;
  templates: FileSystemDiscoveryTemplate[];
  selectedTemplate: FileSystemDiscoveryTemplate | null;
  selectTemplate: (template: FileSystemDiscoveryTemplate) => void;

  // Actions
  startDiscovery: () => Promise<void>;
  cancelDiscovery: () => Promise<void>;
  exportResults: (format: 'CSV' | 'JSON' | 'Excel') => Promise<void>;

  // Tabs data
  activeTab: 'overview' | 'shares' | 'permissions' | 'large-files';
  setActiveTab: (tab: 'overview' | 'shares' | 'permissions' | 'large-files') => void;

  // Shares tab
  shares: FileShare[];
  shareFilter: ShareFilter;
  setShareFilter: (filter: ShareFilter) => void;
  filteredShares: FileShare[];
  shareColumnDefs: ColDef[];
  selectedShares: FileShare[];
  setSelectedShares: (shares: FileShare[]) => void;

  // Permissions tab
  permissions: FilePermission[];
  permissionFilter: PermissionFilter;
  setPermissionFilter: (filter: PermissionFilter) => void;
  filteredPermissions: FilePermission[];
  permissionColumnDefs: ColDef[];
  selectedPermissions: FilePermission[];
  setSelectedPermissions: (permissions: FilePermission[]) => void;

  // Large files tab
  largeFiles: LargeFile[];
  largeFileFilter: LargeFileFilter;
  setLargeFileFilter: (filter: LargeFileFilter) => void;
  filteredLargeFiles: LargeFile[];
  largeFileColumnDefs: ColDef[];
  selectedLargeFiles: LargeFile[];
  setSelectedLargeFiles: (files: LargeFile[]) => void;

  // Search
  searchText: string;
  setSearchText: (text: string) => void;

  // History
  discoveryHistory: FileSystemDiscoveryResult[];
  loadHistory: () => Promise<void>;
  loadHistoryItem: (id: string) => Promise<void>;
}

export const useFileSystemDiscoveryLogic = (): UseFileSystemDiscoveryLogicReturn => {
  const [result, setResult] = useState<FileSystemDiscoveryResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<FileSystemProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [config, setConfig] = useState<FileSystemDiscoveryConfig>(DEFAULT_FILESYSTEM_CONFIG);
  const [templates] = useState<FileSystemDiscoveryTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<FileSystemDiscoveryTemplate | null>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'shares' | 'permissions' | 'large-files'>('overview');

  const [shares, setShares] = useState<FileShare[]>([]);
  const [shareFilter, setShareFilter] = useState<ShareFilter>({});
  const [selectedShares, setSelectedShares] = useState<FileShare[]>([]);

  const [permissions, setPermissions] = useState<FilePermission[]>([]);
  const [permissionFilter, setPermissionFilter] = useState<PermissionFilter>({});
  const [selectedPermissions, setSelectedPermissions] = useState<FilePermission[]>([]);

  const [largeFiles, setLargeFiles] = useState<LargeFile[]>([]);
  const [largeFileFilter, setLargeFileFilter] = useState<LargeFileFilter>({});
  const [selectedLargeFiles, setSelectedLargeFiles] = useState<LargeFile[]>([]);

  const [searchText, setSearchText] = useState('');
  const [discoveryHistory, setDiscoveryHistory] = useState<FileSystemDiscoveryResult[]>([]);

  const startDiscovery = useCallback(async () => {
    console.log('[FileSystemDiscoveryHook] Starting file system discovery');
    console.log('[FileSystemDiscoveryHook] Parameters:', config);

    setIsRunning(true);
    setError(null);
    setProgress({
      phase: 'initializing',
      serversCompleted: 0,
      totalServers: config?.servers?.length || 0,
      sharesCompleted: 0,
      totalShares: 0,
      percentComplete: 0,
      message: 'Initializing file system discovery...',
    });

    try {
      // Execute FileSystem discovery directly (not cloud-based, so no tenant credentials needed)
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/FileSystemDiscovery.psm1',
        functionName: 'Start-FileSystemDiscovery',
        parameters: {
          Servers: config.servers,
          IncludeHiddenShares: config.includeHiddenShares,
          IncludeAdministrativeShares: config.includeAdministrativeShares,
          ScanPermissions: config.scanPermissions,
          ScanLargeFiles: config.scanLargeFiles,
          LargeFileThresholdMB: config.largeFileThresholdMB,
          AnalyzeStorage: config.analyzeStorage,
          DetectSecurityRisks: config.detectSecurityRisks,
          MaxDepth: config.maxDepth,
          Timeout: config.timeout,
          ParallelScans: config.parallelScans,
          ExcludePaths: config.excludePaths || [],
          OutputPath: 'C:\\DiscoveryData\\FileSystem\\Raw',
        },
        options: {
          timeout: 300000, // 5 minutes
        },
      });

      console.log('[FileSystemDiscoveryHook] Discovery result:', result);

      if (result.success) {
        const typedResult = result.data as FileSystemDiscoveryResult;
        setResult(typedResult);
        setShares(typedResult.shares || []);
        setPermissions(typedResult.permissions || []);
        setLargeFiles(typedResult.largeFiles || []);
        setProgress(null);
      } else {
        throw new Error(result.error || 'Discovery failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('[FileSystemDiscoveryHook] Discovery failed:', errorMessage);
      setError(errorMessage);
      setProgress(null);
    } finally {
      setIsRunning(false);
    }
  }, [config]);

  const cancelDiscovery = useCallback(async () => {
    if (!isRunning) return;

    try {
      await window.electronAPI.cancelExecution('filesystem-discovery');
      setIsRunning(false);
      setProgress(null);
    } catch (err) {
      console.error('Failed to cancel discovery:', err);
    }
  }, [isRunning]);

  const exportResults = useCallback(async (format: 'CSV' | 'JSON' | 'Excel') => {
    if (!result) return;

    try {
      await window.electronAPI.executeModule({
        modulePath: 'Modules/Export/FileSystemExport.psm1',
        functionName: 'Export-FileSystemDiscovery',
        parameters: {
          Result: result,
          Format: format,
          IncludeShares: true,
          IncludePermissions: true,
          IncludeLargeFiles: true,
          IncludeStatistics: true,
          IncludeSecurityRisks: true,
        },
      });
    } catch (err) {
      console.error('Export failed:', err);
    }
  }, [result]);

  const selectTemplate = useCallback((template: FileSystemDiscoveryTemplate) => {
    setSelectedTemplate(template);
    setConfig(template.config);
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const historyResult = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/FileSystemDiscovery.psm1',
        functionName: 'Get-FileSystemDiscoveryHistory',
        parameters: {},
      });

      if (historyResult.success) {
        setDiscoveryHistory(historyResult.data.history);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  }, []);

  const loadHistoryItem = useCallback(async (id: string) => {
    try {
      const historyResult = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/FileSystemDiscovery.psm1',
        functionName: 'Get-FileSystemDiscoveryResult',
        parameters: { Id: id },
      });

      if (historyResult.success) {
        const typedResult = historyResult.data as FileSystemDiscoveryResult;
        setResult(typedResult);
        setShares(typedResult.shares);
        setPermissions(typedResult.permissions);
        setLargeFiles(typedResult.largeFiles);
      }
    } catch (err) {
      console.error('Failed to load history item:', err);
    }
  }, []);

  const filteredShares = useMemo(() => {
    let filtered = shares;

    if (shareFilter.type?.length) {
      filtered = filtered.filter(s => shareFilter.type!.includes(s.type));
    }

    if (shareFilter.minSize !== undefined) {
      filtered = filtered.filter(s => s.size.totalBytes >= shareFilter.minSize! * 1024 * 1024 * 1024);
    }

    if (shareFilter.maxSize !== undefined) {
      filtered = filtered.filter(s => s.size.totalBytes <= shareFilter.maxSize! * 1024 * 1024 * 1024);
    }

    if (shareFilter.hasQuota !== undefined) {
      filtered = filtered.filter(s => s.quotaEnabled === shareFilter.hasQuota);
    }

    if (shareFilter.hasEncryption !== undefined) {
      filtered = filtered.filter(s => s.encryptionEnabled === shareFilter.hasEncryption);
    }

    if (shareFilter.server) {
      filtered = filtered.filter(s => s.server === shareFilter.server);
    }

    if (shareFilter.searchText) {
      const search = shareFilter.searchText.toLowerCase();
      filtered = filtered.filter(s =>
        (s.name ?? '').toLowerCase().includes(search) ||
        (s.path ?? '').toLowerCase().includes(search) ||
        s.description?.toLowerCase().includes(search)
      );
    }

    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(s =>
        (s.name ?? '').toLowerCase().includes(search) ||
        (s.path ?? '').toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [shares, shareFilter, searchText]);

  const filteredPermissions = useMemo(() => {
    let filtered = permissions;

    if (permissionFilter.accessType?.length) {
      filtered = filtered.filter(p => permissionFilter.accessType!.includes(p.accessType));
    }

    if (permissionFilter.principalType?.length) {
      filtered = filtered.filter(p => permissionFilter.principalType!.includes(p.principal.type));
    }

    if (permissionFilter.share) {
      filtered = filtered.filter(p => p.shareName === permissionFilter.share);
    }

    if (permissionFilter.searchText) {
      const search = permissionFilter.searchText.toLowerCase();
      filtered = filtered.filter(p =>
        (p.principal?.name ?? '').toLowerCase().includes(search) ||
        (p.shareName ?? '').toLowerCase().includes(search)
      );
    }

    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(p =>
        (p.principal?.name ?? '').toLowerCase().includes(search) ||
        (p.shareName ?? '').toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [permissions, permissionFilter, searchText]);

  const filteredLargeFiles = useMemo(() => {
    let filtered = largeFiles;

    if (largeFileFilter.minSize !== undefined) {
      filtered = filtered.filter(f => f.sizeBytes >= largeFileFilter.minSize! * 1024 * 1024);
    }

    if (largeFileFilter.extension?.length) {
      filtered = filtered.filter(f => largeFileFilter.extension!.includes(f.extension));
    }

    if (largeFileFilter.share) {
      filtered = filtered.filter(f => f.share === largeFileFilter.share);
    }

    if (largeFileFilter.isEncrypted !== undefined) {
      filtered = filtered.filter(f => f.isEncrypted === largeFileFilter.isEncrypted);
    }

    if (largeFileFilter.searchText) {
      const search = largeFileFilter.searchText.toLowerCase();
      filtered = filtered.filter(f =>
        (f.name ?? '').toLowerCase().includes(search) ||
        (f.path ?? '').toLowerCase().includes(search)
      );
    }

    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(f =>
        (f.name ?? '').toLowerCase().includes(search) ||
        (f.path ?? '').toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [largeFiles, largeFileFilter, searchText]);

  const shareColumnDefs = useMemo<ColDef[]>(() => [
    { field: 'name', headerName: 'Share Name', sortable: true, filter: true, pinned: 'left', width: 200 },
    { field: 'path', headerName: 'Path', sortable: true, filter: true, width: 300 },
    { field: 'type', headerName: 'Type', sortable: true, filter: true, width: 120 },
    { field: 'server', headerName: 'Server', sortable: true, filter: true, width: 150 },
    {
      field: 'size.totalBytes',
      headerName: 'Total Size',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 130,
      valueFormatter: (params) => formatBytes(params.value),
    },
    {
      field: 'size.percentUsed',
      headerName: 'Used %',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 100,
      valueFormatter: (params) => `${params.value?.toFixed(1)}%`,
    },
    { field: 'statistics.totalFiles', headerName: 'Files', sortable: true, filter: 'agNumberColumnFilter', width: 100 },
    { field: 'statistics.totalFolders', headerName: 'Folders', sortable: true, filter: 'agNumberColumnFilter', width: 100 },
    { field: 'encryptionEnabled', headerName: 'Encrypted', sortable: true, filter: true, width: 110, valueFormatter: (params) => params.value ? 'Yes' : 'No' },
    { field: 'deduplicationEnabled', headerName: 'Dedupe', sortable: true, filter: true, width: 100, valueFormatter: (params) => params.value ? 'Yes' : 'No' },
  ], []);

  const permissionColumnDefs = useMemo<ColDef[]>(() => [
    { field: 'shareName', headerName: 'Share', sortable: true, filter: true, pinned: 'left', width: 200 },
    { field: 'principal.name', headerName: 'Principal', sortable: true, filter: true, width: 250 },
    { field: 'principal.type', headerName: 'Type', sortable: true, filter: true, width: 120 },
    { field: 'accessType', headerName: 'Access', sortable: true, filter: true, width: 100 },
    {
      field: 'rights',
      headerName: 'Rights',
      sortable: false,
      filter: false,
      width: 250,
      valueFormatter: (params) => params.value?.join(', ') || '',
    },
    { field: 'inheritance', headerName: 'Inheritance', sortable: true, filter: true, width: 150 },
    { field: 'isInherited', headerName: 'Inherited', sortable: true, filter: true, width: 110, valueFormatter: (params) => params.value ? 'Yes' : 'No' },
  ], []);

  const largeFileColumnDefs = useMemo<ColDef[]>(() => [
    { field: 'name', headerName: 'File Name', sortable: true, filter: true, pinned: 'left', width: 250 },
    { field: 'path', headerName: 'Path', sortable: true, filter: true, width: 350 },
    { field: 'extension', headerName: 'Type', sortable: true, filter: true, width: 100 },
    {
      field: 'sizeBytes',
      headerName: 'Size',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 130,
      valueFormatter: (params) => formatBytes(params.value),
    },
    { field: 'owner', headerName: 'Owner', sortable: true, filter: true, width: 200 },
    { field: 'share', headerName: 'Share', sortable: true, filter: true, width: 200 },
    { field: 'modifiedDate', headerName: 'Modified', sortable: true, filter: 'agDateColumnFilter', width: 180 },
    { field: 'isEncrypted', headerName: 'Encrypted', sortable: true, filter: true, width: 110, valueFormatter: (params) => params.value ? 'Yes' : 'No' },
    { field: 'isCompressed', headerName: 'Compressed', sortable: true, filter: true, width: 120, valueFormatter: (params) => params.value ? 'Yes' : 'No' },
  ], []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    result,
    currentResult: result,
    isRunning,
    progress,
    error,
    config,
    setConfig,
    templates,
    selectedTemplate,
    selectTemplate,
    startDiscovery,
    cancelDiscovery,
    exportResults,
    activeTab,
    setActiveTab,
    shares,
    shareFilter,
    setShareFilter,
    filteredShares,
    shareColumnDefs,
    selectedShares,
    setSelectedShares,
    permissions,
    permissionFilter,
    setPermissionFilter,
    filteredPermissions,
    permissionColumnDefs,
    selectedPermissions,
    setSelectedPermissions,
    largeFiles,
    largeFileFilter,
    setLargeFileFilter,
    filteredLargeFiles,
    largeFileColumnDefs,
    selectedLargeFiles,
    setSelectedLargeFiles,
    searchText,
    setSearchText,
    discoveryHistory,
    loadHistory,
    loadHistoryItem,
  
  };
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}
