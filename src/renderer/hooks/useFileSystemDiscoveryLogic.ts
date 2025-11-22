import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
import { useProfileStore } from '../store/useProfileStore';
import { getElectronAPI } from '../lib/electron-api-fallback';

// Log entry type for PowerShellExecutionDialog
export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
}

export interface UseFileSystemDiscoveryLogicReturn {
  // Discovery state
  result: FileSystemDiscoveryResult | null;
  currentResult: FileSystemDiscoveryResult | null;
  isRunning: boolean;
  progress: FileSystemProgress | null;
  error: string | null;

  // Execution dialog
  logs: LogEntry[];
  showExecutionDialog: boolean;
  setShowExecutionDialog: (show: boolean) => void;

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
  // Get selected profile for company name (matches Azure pattern)
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);

  const [result, setResult] = useState<FileSystemDiscoveryResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<FileSystemProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const currentTokenRef = useRef<string | null>(null);

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

  // Add log entry helper
  const addLog = useCallback((level: LogEntry['level'], message: string) => {
    const entry: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
    };
    setLogs(prev => [...prev, entry]);
  }, []);

  // Event listeners for PowerShell streaming using correct API (matches Azure pattern)
  useEffect(() => {
    // Listen for progress updates - use window.electron.onDiscoveryProgress (matches Azure)
    const unsubscribeProgress = window.electron.onDiscoveryProgress((data: any) => {
      if (data.executionId && data.executionId.startsWith('filesystem-discovery-')) {
        console.log('[FileSystemDiscoveryHook] Progress event:', data);
        const logLevel = data.level === 'error' ? 'error' : data.level === 'warning' ? 'warn' : 'info';
        addLog(logLevel, data.message || `Progress: ${data.currentPhase || 'processing'} - ${data.percentage || 0}%`);

        // Update progress state
        if (data.percentage !== undefined || data.percentComplete !== undefined) {
          setProgress(prev => ({
            ...prev,
            phase: data.currentPhase || data.phase || prev?.phase || 'scanning',
            serversCompleted: data.serversCompleted || prev?.serversCompleted || 0,
            totalServers: data.totalServers || prev?.totalServers || 0,
            sharesCompleted: data.sharesCompleted || prev?.sharesCompleted || 0,
            totalShares: data.totalShares || prev?.totalShares || 0,
            percentComplete: data.percentage || data.percentComplete || 0,
            message: data.message || prev?.message || '',
          }));
        }
      }
    });

    // Listen for output messages - use window.electron.onDiscoveryOutput (matches Azure)
    const unsubscribeOutput = window.electron.onDiscoveryOutput((data: any) => {
      if (data.executionId && data.executionId.startsWith('filesystem-discovery-')) {
        console.log('[FileSystemDiscoveryHook] Output:', data.message || data.output);
        const logLevel = data.level === 'error' ? 'error' : data.level === 'warning' ? 'warn' : 'info';
        addLog(logLevel, data.message || data.output);
      }
    });

    // Listen for completion - use window.electron.onDiscoveryComplete (matches Azure)
    const unsubscribeComplete = window.electron.onDiscoveryComplete((data: any) => {
      if (data.executionId && data.executionId.startsWith('filesystem-discovery-')) {
        console.log('[FileSystemDiscoveryHook] Complete event:', data);

        // Extract result data - handle different result structures
        let resultData = data.result;
        if (resultData?.Data) {
          resultData = resultData.Data;
        }

        console.log('[FileSystemDiscoveryHook] Extracted result data:', resultData);

        // Transform to expected structure
        const structuredData = {
          shares: resultData?.shares || [],
          permissions: resultData?.permissions || [],
          largeFiles: resultData?.largeFiles || [],
        };

        // Build final result
        const fileSystemResult: FileSystemDiscoveryResult = {
          id: data.executionId,
          startTime: resultData?.startTime ? new Date(resultData.startTime) : new Date(),
          endTime: resultData?.endTime ? new Date(resultData.endTime) : new Date(),
          duration: resultData?.duration || 0,
          status: 'completed',
          config: config,
          shares: structuredData.shares,
          permissions: structuredData.permissions,
          largeFiles: structuredData.largeFiles,
          statistics: resultData?.statistics || {
            totalShares: structuredData.shares.length,
            totalPermissions: structuredData.permissions.length,
            totalLargeFiles: structuredData.largeFiles.length,
            totalServers: config.servers?.length || 1,
            totalSizeMB: 0,
            averageFileSizeMB: 0,
            largestFileMB: 0,
          },
          errors: resultData?.errors || [],
          warnings: resultData?.warnings || [],
        };

        console.log('[FileSystemDiscoveryHook] Final fileSystemResult:', fileSystemResult);

        setResult(fileSystemResult);
        setShares(fileSystemResult.shares);
        setPermissions(fileSystemResult.permissions);
        setLargeFiles(fileSystemResult.largeFiles);
        setIsRunning(false);
        setCurrentToken(null);
        currentTokenRef.current = null;

        addLog('info', `Discovery completed: ${structuredData.shares.length} shares, ${structuredData.permissions.length} permissions, ${structuredData.largeFiles.length} large files`);
      }
    });

    // Listen for errors - use window.electron.onDiscoveryError (matches Azure)
    const unsubscribeError = window.electron.onDiscoveryError((data: any) => {
      if (data.executionId && data.executionId.startsWith('filesystem-discovery-')) {
        console.error('[FileSystemDiscoveryHook] Error event:', data);
        addLog('error', `Discovery failed: ${data.error}`);
        setError(data.error);
        setIsRunning(false);
        setCurrentToken(null);
        currentTokenRef.current = null;
      }
    });

    // Listen for cancellation - use window.electron.onDiscoveryCancelled (matches Azure)
    const unsubscribeCancelled = window.electron.onDiscoveryCancelled?.((data: any) => {
      if (data.executionId && data.executionId.startsWith('filesystem-discovery-')) {
        addLog('warn', 'Discovery cancelled by user');
        setIsRunning(false);
        setCurrentToken(null);
        currentTokenRef.current = null;
      }
    });

    return () => {
      if (unsubscribeProgress) unsubscribeProgress();
      if (unsubscribeOutput) unsubscribeOutput();
      if (unsubscribeComplete) unsubscribeComplete();
      if (unsubscribeError) unsubscribeError();
      if (unsubscribeCancelled) unsubscribeCancelled();
    };
  }, [addLog, config]);

  const startDiscovery = useCallback(async () => {
    console.log('[FileSystemDiscoveryHook] Starting file system discovery');
    console.log('[FileSystemDiscoveryHook] Parameters:', config);

    // Clear logs and show dialog
    setLogs([]);
    setShowExecutionDialog(true);

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

    const token = `filesystem-discovery-${Date.now()}`;
    setCurrentToken(token);
    currentTokenRef.current = token;

    const companyName = selectedSourceProfile?.companyName || 'FileSystemDiscovery';
    addLog('info', `Starting file system discovery for ${companyName}...`);
    addLog('info', `Servers: ${config.servers?.length || 0} (will use localhost if none specified)`);

    try {
      // Get electron API with fallback (matches Azure pattern)
      const electronAPI = getElectronAPI();

      // Execute FileSystem discovery using correct API interface
      // Ensure servers array is properly formatted - null triggers localhost fallback
      const serversToScan = config.servers && config.servers.length > 0
        ? config.servers
        : null; // null will trigger localhost fallback in PowerShell

      console.log('[FileSystemDiscoveryHook] Servers to scan:', serversToScan);
      console.log('[FileSystemDiscoveryHook] Company name:', companyName);

      // Execute discovery module with credentials from the profile (matches Azure/Exchange pattern)
      const result = await electronAPI.executeDiscoveryModule(
        'FileSystem',
        companyName,
        {
          Servers: serversToScan,
          IncludeHiddenShares: Boolean(config.includeHiddenShares),
          IncludeAdministrativeShares: Boolean(config.includeAdministrativeShares),
          ScanPermissions: config.scanPermissions !== false,
          ScanLargeFiles: config.scanLargeFiles !== false,
          LargeFileThresholdMB: config.largeFileThresholdMB || 100,
        },
        {
          timeout: 300000, // 5 minute timeout
          showWindow: true, // Show PowerShell window
        }
      );

      console.log('[FileSystemDiscoveryHook] executeDiscoveryModule result:', result);

      // Handle the result directly - executeDiscoveryModule returns synchronously
      if (result && result.success) {
        addLog('info', 'File System discovery completed successfully');

        // Process the result data
        const psReturnValue = result.data || result;
        let structuredData = psReturnValue?.Data || psReturnValue;

        // If data is a flat array with _DataType properties, group by type
        if (Array.isArray(structuredData) && structuredData.length > 0 && structuredData[0]?._DataType) {
          const grouped: any = { shares: [], permissions: [], largeFiles: [] };
          structuredData.forEach((item: any) => {
            if (item._DataType === 'Share') grouped.shares.push(item);
            else if (item._DataType === 'Permission') grouped.permissions.push(item);
            else if (item._DataType === 'LargeFile') grouped.largeFiles.push(item);
          });
          structuredData = grouped;
        }

        // Build final result
        const fileSystemResult: FileSystemDiscoveryResult = {
          id: token,
          startTime: psReturnValue?.startTime ? new Date(psReturnValue.startTime) : new Date(),
          endTime: psReturnValue?.endTime ? new Date(psReturnValue.endTime) : new Date(),
          duration: psReturnValue?.duration || 0,
          status: 'completed',
          config: config,
          shares: structuredData?.shares || [],
          permissions: structuredData?.permissions || [],
          largeFiles: structuredData?.largeFiles || [],
          statistics: psReturnValue?.statistics || {
            totalShares: structuredData?.shares?.length || 0,
            totalPermissions: structuredData?.permissions?.length || 0,
            totalLargeFiles: structuredData?.largeFiles?.length || 0,
            totalServers: config.servers?.length || 1,
            totalSizeMB: 0,
            averageFileSizeMB: 0,
            largestFileMB: 0,
          },
          errors: psReturnValue?.errors || [],
          warnings: psReturnValue?.warnings || [],
        };

        console.log('[FileSystemDiscoveryHook] Final fileSystemResult:', fileSystemResult);
        addLog('info', `Found ${fileSystemResult.shares.length} shares, ${fileSystemResult.permissions.length} permissions, ${fileSystemResult.largeFiles.length} large files`);

        setResult(fileSystemResult);
        setShares(fileSystemResult.shares);
        setPermissions(fileSystemResult.permissions);
        setLargeFiles(fileSystemResult.largeFiles);
      } else {
        const errorMsg = result?.error || 'Discovery failed with unknown error';
        addLog('error', `Discovery failed: ${errorMsg}`);
        setError(errorMsg);
      }

      setIsRunning(false);
      setShowExecutionDialog(false);
      setCurrentToken(null);
      currentTokenRef.current = null;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('[FileSystemDiscoveryHook] Discovery failed:', errorMessage);
      addLog('error', `Discovery failed: ${errorMessage}`);
      setError(errorMessage);
      setProgress(null);
      setIsRunning(false);
      setShowExecutionDialog(false);
      setCurrentToken(null);
      currentTokenRef.current = null;
    }
  }, [config, selectedSourceProfile, addLog]);

  const cancelDiscovery = useCallback(async () => {
    if (!isRunning || !currentToken) return;

    try {
      addLog('warn', 'Cancelling discovery...');
      // Use window.electron.cancelDiscovery (matches Azure pattern)
      await window.electron.cancelDiscovery(currentToken);
      addLog('info', 'Discovery cancellation requested');
      setIsRunning(false);
      setProgress(null);
      setShowExecutionDialog(false);
      setCurrentToken(null);
      currentTokenRef.current = null;
    } catch (err) {
      console.error('Failed to cancel discovery:', err);
      addLog('error', `Failed to cancel: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [isRunning, currentToken, addLog]);

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
    logs,
    showExecutionDialog,
    setShowExecutionDialog,
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
